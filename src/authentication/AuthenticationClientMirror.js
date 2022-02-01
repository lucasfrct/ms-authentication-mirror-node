class AuthenticationClientMirror {
    
    instance = null;                                                // instancia da libray de encrypt
    rsa = null;
    keysBox  = { public: "", private: "", image: "" , signature: "" , secret: "" }
    keys = { origin: { public: "", private: "", secret: "", token: "" }, image: { public: "" } };     // chavess de criptografia
    data = { raw: "", cipher: "", decode: "", signature: "" };      // dados para processsamentos
    formBox  = { raw: "", reform: "", deform: { origin: "", image: "" }};
    client = { protocol: "", host: "", uri: "", url: "" };          // url do client
    user = { email: "", password: "" };                             // modelo de usuário                                                   // token de validação
    reflex = { origin: { public: this.keysBox.public, cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
    params = {                                                      // params da requisição  
        type: "GET", 
        contentType:"application/json; charset=utf-8", 
        dataType: "json",
        complete: (res)=> {}
    };
    poll = [];
    headers = { token: 'x-auth-token', bearer: 'Bearer' };
    constructor() {
        this.instance = new Crypt({ md: 'sha512' });                            // library para RSA 
        this.rsa = new RSA({ keySize: 4096 });
        this.setUrl("/authenticate");
    }
    
    /**
     * Seta os dados para serem encriptados
     * @param raw: any 
     */
    setData(raw = "") {
        return this.formBox.raw = raw || this.formBox.raw;
    }
    
    setUrl(uri = "") {
        uri = uri || this.client.uri;
        const protocol = window.location.protocol;
        const host = window.location.host;       
        const url = `${protocol}//${host}${uri}`;
        return this.client = { protocol, host, uri, url };
    }
    
    async captureKeys(url = "/authenticate") {
        try {
            this.setUrl(url);
            const { publicKey, privateKey } = await this.rsa.generateKeyPairAsync();

            const { iv } = this.parse(this.instance.encrypt(publicKey, this.keysBox.secret));
            
            return this.keysBox = { ...this.keysBox, public: publicKey, private: privateKey, secret: iv };
            
        } catch(e) {
            console.error("Não foi possível gerar o par de chaves: ", e);
            return this.keysBox;
        };
    }

    async writeKeys() {

        try {
            localStorage.setItem("publicKey", this.keysBox.public);
        } catch(e) {
            logger.error({ error: e, code: "AU0001", message: "A public Key não pôde ser escrita" });
        };

        try {
            localStorage.setItem("privateKey", this.keysBox.private);
        } catch(e) {
            logger.error({ error: e, code: "AU0002", message: "A private Key não pôde ser escrita" });
        };

        try {
            localStorage.setItem("secretKey", this.keysBox.secret);
        } catch(e) {
            logger.error({ error: e, code: "AU0003", message: "A secret Key não pôde ser escrita" });
        };

        return this.keysBox
    }

    async loadKeys() {
        return await this.readKeys();        
    }

    async readKeys() {

        this.keysBox.public = localStorage.getItem("publicKey");
        this.keysBox.private = localStorage.getItem("privateKey");
        this.keysBox.secret = localStorage.getItem("secretKey");
        return this.keysBox;
       
    }
    
    /**
     * Obtem chave pública do servidor
     * @return public key: string
     */
    /* async public(url = "/authenticate") {
        try {
            this.setUrl(url);
            const { publicKey } = await $.get(this.client.url);
            return this.keys.public = publicKey;
        } catch(e) {
            console.error("Não foi possível obter a chave pública do servidor: ", e);
            return this.keys.public;
        };
    } */

    parse(payload = "") {
        try {
            return JSON.parse(payload);
        } catch (e) {
            return payload;
        };
    }

    async verify(raw = "") {
        console.log("VERIFY: ", this.keysBox.signature);
        return await this.instance.verify( this.keysBox.public, raw, this.keysBox.signature );
    }

    /**
     * Encrypta dos dados com a public Key no padrão RSA
     * @param raw: any 
     * @return copher: string - hash cifrada
     */
    async deform(raw = "", publicKey = "") {
        try {
            this.setData(raw);
            const Public = publicKey || this.keysBox.image;
            const dataString = (typeof this.formBox.raw == 'string') ? this.formBox.raw : JSON.stringify(this.formBox.raw);
            const encrypt = this.instance.encrypt(Public, dataString, "");
            return this.formBox.deform.origin = encrypt;
        } catch (e) {
            console.error("ERROR encrypt: ", e);
            return this.formBox.deform.origin;
        }
    }

    async reform(cipher = "") {
        //await loadKeys();
        try {
            this.formBox.deform.image = cipher || this.formBox.deform.image;
            
            // testa se a chave privada existe
            if(!this.keysBox.private) {
                logger.message({ code: "AU0015", message: "a chave privada não existe" });
                return this.formBox.reform;
            };
            
            const { message, signature }  = this.instance.decrypt(this.keysBox.private, this.formBox.deform.image);
            //faz assinatura da informação que será transmitida 
            this.keysBox.signature = signature;
            
            
            // verifica se a assinatura é autentica
            if(this.keysBox.signature && !this.verify(message)) {
                logger.message({ code: "AU0015", message: "Esse documento não foi assinado corretamente" });
                return this.formBox.reform;
            };
            
            return this.formBox.reform = this.parse(message);
            
        } catch(e) {
            logger.message({ error: e, code: "AU0015", message: "Erro ao tentar decriptografar a cifra." })
            return this.formBox.reform
        }
    }

    /**
     * Transforma uma texto em hash 
     * @param txt: string 
     * @return txt: string 
     */
    hash(txt = "") {
        return sha512(txt);
    }
    
    /**
     * Envia dados com o Vebo POST
     * @param data: JSON - precisa ser uma JSON passar na requisicao 
     * @return payload: JSON
     */
    async send(data = null) {
        try {

            this.params.data = JSON.stringify(data);
            this.params.type = "POST";
            this.params.url = this.client.url;
            this.params.complete = (res)=> {
                this.poll.forEach((callback)=> { callback(res); });
                this.poll = [];
            }
            
            this.reflex = await $.ajax(this.params);
            
            return this.reflex;
        } catch(e) {
            console.error("ERROR send: ", e);
            return this.reflex;
        }
    }

    /**
     * Obtem chave pública do servidor
     * @return public key: string
     */
    async get( data = "" ) {
        try {

            this.params.data = JSON.stringify(data);
            this.params.type = "GET";
            this.params.url = this.client.url;
            this.params.headers = { 
                Authorization: `Bearer ${await this.session()}`
            };
            
            this.params.headers[this.headers.token] = await this.session();
            
            this.params.complete = (res)=> {
                this.poll.forEach((callback)=> { callback(res); });
                this.poll = [];
            }
            
            this.reflex = await $.ajax(this.params);

            return this.reflex;
        } catch(e) {
            console.error("ERROR get: ", e);
            return this.reflex;
        }
    }
    
    /**
     * Ratifica uma autthenticação
     * @param raw: JSON 
     */
    async ratify(raw = null, uri = "") {
        let that = this;
        await this.public();
        await this.setData(raw);
        this.setUrl(uri);
        const cipher = await this.encrypt();
        this.poll.push(async (res)=>{
            that.keys.token = await that.session(String(res.getResponseHeader(this.headers.token) || "").trim());
        })
        return await this.send({ cipher });
    }

    /**
     * Cria uma nova conta
     * @param email: string
     * @param password: string
     * @return payload: any 
     */
    async sign(email = "", password = "") {
        this.user = { email, password: this.hash(password) };
        return this.ratify(this.user, "/sign");
    }
    
    /**
     * Faz um pedido de login no servidor
     * @param email: string
     * @param password: string
     * @return token: string - JWT TOKEEN 
     */
    async login(email = "", password = "") {        
        if(!await this.session()) {
            this.user = { email, password: this.hash(password) };
            return await this.ratify(this.user, "/login");
        };

        return {}
    }

    async logout() {
        localStorage.removeItem(this.headers.token);
        this.keys.token = ""
        this.data.cipher = "";
        this.data.decoded = "";
        return true;
    }
    
    async credentials(reflex = {}) {
        return this.ratify(reflex, "/login/credentials");
    }

    async session(token = "") {
        if(token.length > 0) { 
            localStorage.setItem(this.headers.token, token); 
        };
        return localStorage.getItem(this.headers.token);
    }

    async reflect() {
        // colocar chave publica do client no keysBox.public 
        // colocar a chave publica do servidor dentro de keysBox.image
        await this.readKeys();
        this.reflex.origin.public = this.keysBox.public;
        this.setUrl('/authenticate/mirror/reflect');
        await this.send( this.reflex );
        this.keysBox.image = this.reflex.image.public;
        return this.reflex;
    }

    async distort() {
        this.formBox.raw = "feio";
        this.reflex.origin.cipher = await this.deform();
        console.log("client2: ", this.formBox);
        //this.setUrl("/authenticate/mirror/keep");
        //return await this.send(this.reflex);
    }

    async serverDistort() {
        this.setUrl("/authenticate/mirror/distort");
        this.reflex =  await this.send(this.reflex);
        return this.reflex;
        
    }
    
    async reveal(raw = "") {
        await this.readKeys();
        this.reflex.origin.public = this.keysBox.public;
        this.reflex.origin.raw = this.setData(raw);
        this.setUrl("/authenticate/mirror/reveal");
        await this.send(this.reflex);
        return this.reflex;
    }

}
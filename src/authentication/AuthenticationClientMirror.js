class AuthenticationClientMirror {
    
    instance = null;                                                // instancia da libray de encrypt
    rsa = null;
    keysBox  = { public: "", private: "", image: "" , signature: "" , secret: "" }
    formBox  = { raw: "", reform: "", deform: { origin: "", image: "" }};
    client = { protocol: "", host: "", uri: "", url: "" };          // url do client
    reflex = { origin: { public: this.keysBox.public, cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }
    params = {                                                      // params da requisição  
        type: "GET", 
        contentType:"application/json; charset=utf-8", 
        dataType: "json",
        complete: (res)=> {}
    };
    headers = { token: 'x-api-token', bearer: 'Bearer' };
    constructor() {
        this.instance = new Crypt({ md: 'sha512' });                            // library para RSA 
        this.rsa = new RSA({ keySize: 4096 });
        this.setUrl("/authenticate");
    }
    
    /**
     * Seta os dados para serem encriptados
     * @param raw: any 
     */
    setRaw(raw = "") {
        return this.formBox.raw = raw || this.formBox.raw;
    }
    
    setUrl(uri = "") {
        uri = uri || this.client.uri;
        const protocol = window.location.protocol;
        const host = window.location.host;       
        const url = `${protocol}//${host}${uri}`;
        return this.client = { protocol, host, uri, url };
    }

    setReflex(reflex = "") {
        return this.reflex = reflex || this.reflex;
    }

    setPublic(publicKey = "") {
        return this.keysBox.image = publicKey || this.keysBox.image;
    }

    setDeform(cipher = "") {
        return this.formBox.deform.image = cipher || this.formBox.deform.image;
    }
    
    async captureKeys() {
        try {
            const { publicKey, privateKey } = await this.rsa.generateKeyPairAsync();
            const { iv }                    = this.parse(this.instance.encrypt(publicKey, this.keysBox.secret));
            return this.keysBox             = { ...this.keysBox, public: publicKey, private: privateKey, secret: iv };
            
        } catch(e) {
            console.error("Não foi possível gerar o par de chaves: ", e);
            return this.keysBox;
        };
    }

    async writeKeys() {
        localStorage.setItem("publicKey",   this.keysBox.public);
        localStorage.setItem("privateKey",  this.keysBox.private);
        localStorage.setItem("secretKey",   this.keysBox.secret);
        return this.keysBox;
    }

    async readKeys() {
        this.keysBox.public     = localStorage.getItem("publicKey");
        this.keysBox.private    = localStorage.getItem("privateKey");
        this.keysBox.secret     = localStorage.getItem("secretKey");
        return this.keysBox;
    }
    
    async loadKeys() {
        return await this.readKeys();        
    }

    async verify(raw = "") {
        return await this.instance.verify( this.keysBox.public, raw, this.keysBox.signature );
    }

    /**
     * Encrypta dos dados com a public Key no padrão RSA
     * @param raw: any 
     * @return copher: string - hash cifrada
     */
    async deform(raw = "") {
        try {
            this.setRaw(raw);
            const dataString = (typeof this.formBox.raw == 'string') ? this.formBox.raw : JSON.stringify(this.formBox.raw);
            return this.formBox.deform.origin = this.instance.encrypt(this.keysBox.image, dataString, "");
        } catch (e) {
            console.error("ERROR encrypt: ", e);
            return this.formBox.deform.origin;
        }
    }

    async reform(cipher = "") {
        //await loadKeys();
        try {
            this.setDeform(cipher);
            
            // testa se a chave privada existe
            if(!this.keysBox.private) {
                return this.formBox.reform;
            };
            
            const { message, signature }  = this.instance.decrypt(this.keysBox.private, this.formBox.deform.image);
            //faz assinatura da informação que será transmitida 
            this.keysBox.signature = signature;
            
            // verifica se a assinatura é autentica
            if(this.keysBox.signature && !this.verify(message)) {
                return this.formBox.reform;
            };
            
            return this.formBox.reform = this.parse(message);
            
        } catch(e) {
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
     * @param reflex: JSON - precisa ser uma JSON passar na requisicao 
     * @return payload: JSON
     */
    async send(reflex = "") {
        try {
            this.setReflex(reflex);

            this.params.data                        = JSON.stringify(this.reflex);
            this.params.type                        = "POST";
            this.params.url                         = this.client.url;
            this.params.headers                     = { Authorization: `Bearer ` };
            this.params.headers[this.headers.token] = "";
            
            return this.reflex = await $.ajax(this.params);
            
        } catch(e) {
            console.error("ERROR send: ", e);
            return this.reflex;
        }
    }

    /**
     * Obtem chave pública do servidor
     * @return public key: string
     */
    async get( reflex = "" ) {
        try {
            this.setReflex(reflex);

            this.params.data                        = JSON.stringify(this.reflex);
            this.params.type                        = "GET";
            this.params.url                         = this.client.url;
            this.params.headers                     = { Authorization: `Bearer ${await this.session()}` };
            this.params.headers[this.headers.token] = await this.session();
            
            return this.reflex = await $.ajax(this.params);

        } catch(e) {
            console.error("ERROR get: ", e);
            return this.reflex;
        }
    }

    async reflect() {
        this.setUrl('/authenticate/mirror/reflect');
        await this.readKeys();
        this.reflex.origin.public = this.keysBox.public;

        await this.send();

        this.keysBox.image = this.reflex.image.public;
        return this.reflex;
    }

    async distort(raw = "") {
        this.setUrl("/authenticate/mirror/keep");
        this.setRaw(raw);
        this.reflex.origin.cipher = await this.deform();
        return await this.send();
    }
    
    async reveal(raw = "") {
        this.setUrl("/authenticate/mirror/reveal");
        await this.readKeys();
        this.reflex.origin.public = this.keysBox.public;
        this.reflex.origin.raw = this.setRaw(raw);
        return await this.send();
    }

    async keep() {
        // A cifra foi colocada na image por causa do metodo reform
        this.formBox.deform.image = this.reflex.origin.cipher;
        await this.readKeys();
        await this.reform();
        return this.formBox;
    }

    parse(payload = "") {
        try {
            return JSON.parse(payload);
        } catch (e) {
            return payload;
        };
    }

}
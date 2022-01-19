class AuthenticationClientMirror {
    
    instance = null;                                                // instancia da libray de encrypt
    rsa = null;
    keys = { public: "", private: "", secret: "", token: "", };     // chavess de criptografia
    data = { raw: "", cipher: "", decode: "", signature: "" };      // dados para processsamentos
    client = { protocol: "", host: "", uri: "", url: "" };          // url do client
    user = { email: "", password: "" };                             // modelo de usuário                                                   // token de validação
    payload = {};                                                   // resposta do servidor
    params = {                                                      // params da requisição  
        type: "GET", 
        contentType:"application/json; charset=utf-8", 
        dataType: "json",
        complete: (res)=> {}
    };
    poll = [];
    headers = { token: 'x-auth-token', bearer: 'Bearer' };
    constructor() {
        this.instance = new Crypt();                            // library para RSA 
        this.rsa = new RSA();
        this.setUrl("/authenticate");
    }
    
    /**
     * Seta os dados para serem encriptados
     * @param raw: any 
     */
    setData(raw = "") {
        return this.data.raw = raw || this.data.raw;
    }
    
    setUrl(uri = "") {
        uri = uri || this.client.uri;
        const protocol = window.location.protocol;
        const host = window.location.host;       
        const url = `${protocol}//${host}${uri}`;
        return this.client = { protocol, host, uri, url };
    }
    
    async generateKeyPair(url = "/authenticate") {
        try {
            this.setUrl(url);
            const { publicKey, privateKey } = await this.rsa.generateKeyPairAsync();
            
            return this.keys = { public: publicKey, private: privateKey };
            
        } catch(e) {
            console.error("Não foi possível gerar o par de chaves: ", e);
            return this.keys;
        };
    }

    async readKeys() {
        console.log("Keys: ", this.keys);
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

    /**
     * Encrypta dos dados com a public Key no padrão RSA
     * @param raw: any 
     * @return copher: string - hash cifrada
     */
    async encrypt(raw = "") {
        try {
            this.setData(raw);
            const dataString = JSON.stringify(this.data.raw);
            const encrypt = this.instance.encrypt(this.keys.public, dataString, this.keys.secret);
            return this.data.cipher = JSON.stringify(encrypt);
        } catch (e) {
            console.error("ERROR encrypt: ", e);
            return this.data.cipher;
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
            
            this.payload = await $.ajax(this.params);
            
            return this.payload;
        } catch(e) {
            console.error("ERROR send: ", e);
            return this.payload;
        }
    }

    /**
     * Obtem chave pública do servidor
     * @return public key: string
     */
    async get(parameters = "", data = "") {
        try {

            this.params.data = data;
            this.params.type = "GET";
            this.params.url = parameters?.url || "/";
            this.params.headers = { 
                Authorization: `Bearer ${await this.session()}`
            };

            this.params.headers[this.headers.token] = await this.session();

            this.params.complete = (res)=> {
                this.poll.forEach((callback)=> { callback(res); });
                this.poll = [];
            }
            
            this.payload = await $.ajax(this.params);

            return this.payload;
        } catch(e) {
            console.error("ERROR get: ", e);
            return this.payload;
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
    
    async credentials(payload = {}) {
        return this.ratify(payload, "/login/credentials");
    }

    async session(token = "") {
        if(token.length > 0) { 
            localStorage.setItem(this.headers.token, token); 
        };
        return localStorage.getItem(this.headers.token);
    }

    async reflect() {
        this.setUrl('/authenticate/mirror/reflect');
        return await this.send( { origin: { public: "feio" } } );
    }

}

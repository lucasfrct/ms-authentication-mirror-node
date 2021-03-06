/**
 * * classe usada pelo cliente para gerar suporte a autenticação espelhada
 * @dependency hybrid-crypto-js: https://github.com/juhoen/hybrid-crypto-js
 * @dependency js-sha512: https://github.com/emn178/js-sha512
 * ? gera um par de chaves publico-privada
 * ? faz encryptacao com assinatura
 * ? faz decryptação com assinatura
 * ? verifuca assinatura: assina com chave pública e verifica com chave privada
 */

 class AuthenticationMirrorClient {

    rsa   = null; // ! library RSA
    crypt = null; // ! library crypt (encruptacai de decriptacao)

    /**
     * * guarda a url utilizada
     * @property {string} host:     dominio do cliente
     * @property {string} uri:      rota do recurso consumido no servidor
     * @property {string} url:      caminho completo da requisicao
     */
    client = { host: "", uri: "", url: "" };

    /**
     * * armazena as chaves das entidades
     * @property {object} origin:       informacoes do cliente
     * @property {object} destiny:      informacoes do sevidor
     * @property {string} {}public:     chave pública do RSA
     * @property {string} {}private:    chave privada do RSA do cliente
     * @property {string} {}secret:     chave secreta do cliente
     * @property {string} {}signature   Assinatura da mensagem emcriptada
     */
    keysBox = {
        origin:     { public: "", private: "", secret: "", signature: "" },
        destiny:    { public: "", signature: "" }
    };

    /**
     * * armazena os dados das entidades
     * @property {object} origin:   informacoes do cliente
     * @property {object} destiny:  informacoes do sevidor
     * @property {string} reform:   dados decifrado
     * @property {string} deform:   dados cifrado
     * @property {string} raw:      Dados cru   
     */
    formBox = {
        origin:     { reform: "", deform: "", raw: "" },
        destiny:    { reform: "", deform: "", raw: "" },
    };

    /**
     * * payload usado para trocas informações com o servidor
     * @property {object} origin:   informacoes do cliente
     * @property {object} destiny:  informacoes do sevidor
     * @property {string} {}public: chave public rsa
     * @property {string} {}cipher: cigragem rsa
     * @property {string} {}body:   payload de troca  
     */
    reflex = {
        origin:     { public: "", cipher: "", body: {} },
        destiny:    { public: "", cipher: "", body: {} },
    };

    constructor() {
        // ! instacia da library RSA
        this.rsa = new RSA({ keySize: 4096 });

        // ! instancia da library de emciptação
        this.crypt = new Crypt({ md: "sha512" });
    }

    /**
     * * configura uma URI para uma requisição do cliente
     * * retorna uma url
     * @param   {string} uri: recurso utilizado no servidor
     * @return  {string} url: caminho completo da requisicao
     */
    uri(uri = "") {
        this.client.uri         = uri || this.client.uri;
        this.client.url         = `${this.client.host}${this.client.uri}`;
        return this.client.url;
    }

    /**
     * * configura o host para uma requisição do cliente
     * * retorna o host
     * @param   {string} host: recurso utilizado no servidor
     * @return  {string} host: host do servidor
     */
    host(host = "") {
        return this.client.host = host || window.location.host;
    }

    /**
     * * carrega os dados para a classe
     * @param   {*} raw: any
     * @return  {*} raw
     */
    raw(raw = "") {
        return (this.formBox.origin.raw = raw || this.formBox.origin.raw);
    }

    /**
     * * carrega o payload reflex na classe
     * @param   {Object} reflex
     * @return  {Object} reflex
     */
    setReflex(reflex = { }) {
        return this.reflex = { ...this.reflex, ...reflex };
    }

    /**
     * * combina os objetos reflex com formBox e keysBox
     * @param   {*}       data: formBox || kyesBox || reflex 
     * @return  {object}  reflex: 
     */
    match(data = {}) {

        if(data.hasOwnProperty('origin') && !data.origin.hasOwnProperty('cipher')) { 

            let keysBox = this.keysBox;
            let formBox = this.formBox;

            // ! se o dado for KeysBox, carregada  keysBox e formBox para o reflex
            if (data.origin.hasOwnProperty("private")) {
                keysBox = data;          
            };

              // ! se o dado for formBox, carregada para reflex
            if (data.origin.hasOwnProperty("reform")) {
                formBox = data;
            }

            // ! extrai os dados para reflex
            const { origin: { deform: originDeform }, destiny: { deform: destinyDeform } } = formBox;
            const { origin: { public: originPublic }, destiny: { public: destinyPublic } } = keysBox;

            // ! monta o novo reflex
            this.reflex.origin  = { ...this.reflex.origin,  cipher: originDeform,   public: originPublic };
            this.reflex.destiny = { ...this.reflex.destiny, cipher: destinyDeform,  public: destinyPublic };

            // ? returna reflex
            return this.reflex;
        };


        // ! se o dado for reflex, carrega para formBox e keysBox
        if (data.hasOwnProperty('origin') && data.origin.hasOwnProperty('cipher')) {

            // ! extrai de reflex os dados para formbox e keysbox
            const {
                origin:     { public: originPublic,     cipher: originCipher,  },
                destiny:    { public: destinyPublic,    cipher: destinyCipher }
            } = data;

            // ! monta o novo keysBox
            this.keysBox.origin     = { ...this.keysBox.origin,     public: originPublic };
            this.keysBox.destiny    = { ...this.keysBox.destiny,    public: destinyPublic };

            // ! monta o novo formBox
            this.formBox.origin     = {...this.formBox.origin,  deform: originCipher };
            this.formBox.destiny    = {...this.formBox.destiny, deform: destinyCipher };

            // ? returna reflex 
            return this.reflex;
        }

        return this.reflex = { ...this.reflex, ...data };
    }

    /**
     * ! gera o par de chaves publico/privada
     * ! gera um chave secreta
     * ! gera uma asinatura
     * @return {object} keysBox:
     */
    async captureKeys() {
        try {
            // ! extrai o par de chaves publica/privada RSA
            const { publicKey, privateKey } = await this.rsa.generateKeyPairAsync();

            // ! gera uma chave IV de uma string forte de 64 caracteres e define a secret 
            const { iv: secret } = this.parse(this.crypt.encrypt(publicKey, "De@14@Jxfjm^MiKpQP6tzKSm83xpa*vfXRi2bSjvtSFGVbwU8Yy&9K*&soIT5ft&EIS"));

            // ! gera uma chave de assinatura
            const { signature }  = this.parse(await this.crypt.signature(privateKey, secret));

            // ! cria novo o objeto de chaves do cliente
            this.keysBox.origin = { public: publicKey, private: privateKey, secret, signature };

            // ? returna o objeto de chaves
            return this.keysBox
        } catch (e) {
            console.error(e);
            return this.keysBox;
        }
    }

    /**
     * * escreve as chaves publica, privada e secreta no localStorage do navegador
     * @param   {string} path: define uma prefixo para guardar as chaves
     * @returns {object} keysBox
     */
    async writeKeys(path = "") {
        localStorage.setItem(`${path}AuthenticateMirrorPublicKey`,     this.keysBox.origin.public);
        localStorage.setItem(`${path}AuthenticateMirrorPrivateKey`,    this.keysBox.origin.private);
        localStorage.setItem(`${path}AuthenticateMirrorSecretKey`,     this.keysBox.origin.secret);
        localStorage.setItem(`${path}AuthenticateMirrorSignature`,     this.keysBox.origin.signature);

        return this.keysBox;
    }

    /**
     * * lê o valor das chaves no localStorage do navegador e passa para o objeto da classe
     * @param  {string} path: define um prefixo para ler as chaves
     * @return {object} keysBox:
     */
    async readKeys(path = "") {
        this.keysBox.public     = await localStorage.getItem(`${path}AuthenticateMirrorPublicKey`)   || "";
        this.keysBox.private    = await localStorage.getItem(`${path}AuthenticateMirrorPrivateKey`)   || "";
        this.keysBox.secret     = await localStorage.getItem(`${path}AuthenticateMirrorSecretKey`)  || "";
        this.keysBox.signature  = await localStorage.getItem(`${path}AuthenticateMirrorSignature`)   || "";

        return this.keysBox;
    }

    /**
     * * carrega as chaves do localstorage para a classe
     * @return {object} keysBox:
     */
    async loadKeys() {

        // ! se não houver chave pública na classe, faz a leitura do localStorage
        if (this.keysBox.origin.public.length < 64) {
            await this.readKeys();
        }

        // ! se não houver chave publica no localStorage, gera um novo par de chaves
        if (this.keysBox.origin.public.length < 64) {
            await this.captureKeys();
            await this.writeKeys();
        }

        // ? retorna as chaves
        return this.keysBox;
    }

    /**
     * ! assina um string
     * @param  {*} raw
     * @return {string} signature:
     */
    async signature(raw = "") {
        try {

            // ! se não houver chave privada, não faz a assinatura
            if (this.keysBox.origin.private.length < 64) {
                console.error("Erro, a chave privada não existe");
                return this.keysBox.origin.signature;
            };

            // ! converte para string
            const dataString = this.parseStr(this.raw(raw));

            // ! faz a assinatura do dado e extrai do JSON a assinnatura
            const { signature } = this.parse(this.crypt.signature(this.keysBox.origin.private, dataString));

            // ? retorna a assinatura
            return this.keysBox.origin.signature = signature;
        } catch (e) {
            console.error("Nõ foi possível asinnar o dado: ", e);
            return this.keysBox.origin.signature;
        }
    }

    /**
     * ! verifica se uma string foi assinada
     * @param  {string} raw:
     * @return {boolean} verify
     * !! OBS: ainda não está totalmente implementado
     */
    async verify(raw = "") {
        return await this.crypt.verify(this.keysBox.origin.public, this.raw(raw), this.keysBox.origin.signature);
    }

    /**
     * ! Encrypta os dados com a chave publica do servidor no padrão RSA
     * @param  {*} raw:
     * @return {string} cipher: hash cifrada
     */
    async deform(raw = "") {
        try {

            // ! carrega a chave pública do servidor
            const destiny = this.keysBox.destiny.public;
            
            // ! se não houver chave pública do servidor, não faz a cifragem 
            if (destiny.length < 814) {
                console.error("Erro, a chave publica não existe");
                return this.formBox.origin.deform;
            }

            // ! converte para string
            const dataString = this.parseStr(this.raw(raw));

            // ! faz assinatura
            const signature = await this.signature(dataString);

            // ! cria uma crifra no cliente com a chave pública do servidor
            return this.formBox.origin.deform = this.crypt.encrypt(destiny, dataString, signature);
        } catch (e) {
            console.error("Error ao deforma um dado: ", e);
            return this.formBox.origin.deform;
        }
    }

    /**
     * ! decrypta uma cifra do servidor com a chave privada do cliente no padrão RSA
     * @param   {string} cipher: hash cifrada 
     * @return  {string} decoded: dados decifrados
     */
    async reform(cipher = "") {
        try {

            this.formBox.destiny.deform = cipher || this.formBox.destiny.deform;

            // ! pega a chave privada do client
            const privateKey = this.keysBox.origin.private;

            // ! se não houver chave privada do cliente, não faz a decifragem
            if (privateKey.length < 64) {
                console.error("Erro, a chave privada não existe");
                return this.formBox.destiny.reform;
            }

            // ! faz a decigragem da string enviada pelo servidor
            const { message, signature } = this.crypt.decrypt(privateKey, this.formBox.destiny.deform);

            // ! carrega a assinatura dos servidor
            this.keysBox.destiny.signature = signature;

            // ! verifica se a assinatura é autentica
            // ! vrify ainda não está funcional
            // if (this.keysBox.destiny.signature && !this.verify(message)) {
            //     console.error("Erro, documento com assinatura inválida");
            // }

            // ? retorna a informação decigrada
            return this.formBox.destiny.reform = this.parse(message);
        } catch (e) {
            console.error("Error ao tentar decifrar o dado");
            return this.formBox.destiny.reform;
        }
    }

    config(method = "GET", body = undefined) {
         
         // ! defune os headers da requisicao
         const headers   = new Headers();
         headers.append('Content-Type', 'application/json');
         headers.append('Accept-Charset', 'utf-8');

         return { mode: 'cors', headers, method, body };
    }

    /**
     * * Envia dados com o Verbo POST
     * @param   {object} reflex:
     * @return  {object} reflex
     */
    async send(reflex = "") {
        try {
            // ! configura a requisição
            const url       = this.uri();
            const config    = this.config("POST", this.parseStr(this.setReflex(reflex)));

            // ! instancia a requisição
            const request = new Request(url, config);

            // ! faz a requição ao servidor
            const resp = await fetch(request);
            const response = await resp.json();

            // ? carrega o reflex para a clesse
            return await this.setReflex(response);

        } catch (e) {
            console.error("Error ao tentar acessar o servidor: ", e);
            return this.setReflex();
        }
    }

    /**
     * * Faz uma requisicao ao servidor com o verbo GET 
     * @return {object} reflex: 
     */
    async get() {
        try {
           // ! configura a requisição
           const url       = this.uri();
           const config    = this.config("GET");

           // ! instancia a requisição
           const request = new Request(url, config);

           // ! faz a requição ao servidor
           const resp = await fetch(request);
           const response = await resp.json();

           // ? carrega o reflex para a clesse
           return await this.setReflex(response);

        } catch (e) {
            console.error("Error ao tentar acessar o servidor: ", e);
            return this.setReflex();
        }
    }

    /**
     *  ! Troca as chaves publicas entre cliente e servidor
     * @param   {object} reflex 
     * @returns {object} reflexx
     */
    async reflect(reflex = {}) {
        // ! define uma rota
        this.uri("/authentication/mirror/reflect");

        // ! carrega as chaves para o cliente
        await this.loadKeys();

        // ! carrega a chave publica para dentro do reflex
        this.match(this.keysBox);

        // ! faza a requisicao par o servidor
        await this.send();

        // ! carrega a chave publica do servidor para dentro da classe do cliente
        this.match(this.reflex);

        // ? retorna o payload da requisicão
        return this.reflex;
    }

    /**
     * * faz postagem do cliente no servidor
     * * um dado no cliente é cifrado com a public Key do servidor
     * @param   {object} reflex:
     * @return  {object} reflex:
     */
    async distort(reflex = {}) {
        // ! define a url do servidor
        this.uri("/authentication/mirror/distort");

        // ! carrega o objeto de troca para para a classe
        this.setReflex(reflex);

        // ? faz a requisição para o servidor
        await this.send();

        // ! carrega a chave publica do servidor para dentro da classe do cliente
        this.match(this.reflex);

        // 
        return this.reflex;
        
    }

    // /**
    //  * * faz uma postagem do cliente no servidor
    //  * * crifa um dado do cliente com a chave publica do servidor
    //  * @returns reflex
    //  */
    // async keep() {
    //     // ! define a url do servidor
    //     this.uri("/authenticate/mirror/keep");

    //     // ! cifra um dodo do clinente com a chave publica do servidor
    //     await this.deform();

    //     // ! carrega a cifra para o payload
    //     this.setDeformOrigin(this.formBox.deform.origin);

    //     // ? faz o envio da cifr e recebe a resposta em um reflex
    //     return this.send();
    // }

    // /**
    //  * *
    //  * @param {*} raw 
    //  * @returns 
    //  */
    // async reveal(raw = "") {

    //     // ! Carreada um dado para a classe
    //     this.row(raw);

    //     // ! define a url do servidor
    //     this.uri("/authenticate/mirror/reveal");

    //     // ! carraga das chaves publica e privada do cliente para dentro da classe
    //     await this.loadKeys();

    //     // ! carrega a chave pública para o payload
    //     this.setPublicKey(this.keysBox.public)

    //     // ! carrega o dado do cliente para o payload
    //     this.setReformOrigin(this.formBox.reform.origin)

    //     // ?  // ? faz o envio para o servidor e recebe a resposta em um reflex
    //     return await this.send();
    // }

    // /**
    //  * faz o envido de uma dadoa para o servidor
    //  * @returns 
    //  */
    // async refraction() {
    //     // ! define a url do servidor
    //     this.uri("/authenticate/mirror/refraction");

    //     const response = await this.send();

    //     this.setReflex(response);

    //     this.formBox.deform.destiny = this.reflex.destiny.cipher;

    //     await this.readKeys();

    //     return await this.reform(this.formBox.deform.destiny);
    // }

    // /**
    //  * Transforma um texto em hash
    //  * @param raw: string
    //  * @return txt: string
    //  */
    // hash(raw = "") {
    //     return sha512(raw);
    // }

    /**
     * * Parseia uma string para json caso seja possível
     * @param   {*}     payload
     * @return  {json}  payload 
     */
     parse(payload = "") { try { return JSON.parse(payload); } catch (e) { return payload; }; }

    /**
     *  Passa um dado Json para string
     * @param {*} data 
     * @returns 
     */
     parseStr(data = undefined) {
        try {
            if (typeof data === "string") {
                return data;
            };
            return JSON.stringify(data);
        } catch (e) {
            // TODO: logger
            console.error(e);
            return String(data);
        };
    }
}

// auth.url(localhost)
// auth.uri(localhost) - http://localhost/m
// auth.host(localhost)

require('dotenv/config');
const fs = require("fs");
const Crypt = require('hybrid-crypto-js').Crypt;
const RSA = require('hybrid-crypto-js').RSA;

/**
 * * classe usada pelo servidor para gerar suporte a autenticação espelhada
 * @dependency hybrid-crypto-js: https://github.com/juhoen/hybrid-crypto-js
 * @dependency js-sha512: https://github.com/emn178/js-sha512
 * ? gera um par de chaves publico-privada
 * ? faz encryptacao com assinatura
 * ? faz decryptação com assinatura
 * ? verifuca assinatura: assina com chave pública e verifica com chave privada
 */
const AuthenticationMirror = class AuthenticationMirror {

    rsa   = null; // ! library RSA
    crypt = null; // ! library crypt (encruptacai de decriptacao)

    /**
     * * guarda os path das chaves usadas
     * @property {string} base:         guarda o diretório que armazena as chaves
     * @property {string} public:       path da chave pública
     * @property {string} private:      path da chave privada
     * @property {string} secret:       path da chave secreta
     * @property {string} signature:    path da assinatura do servidor
     */
    paths = { base: "./keys/core", public: "", private: "", secret: "", signature: "" }; 

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
        origin:     { public: "", signature: "" },
        destiny:    { public: "", private: "", secret: "", signature: "" },
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
     * * payload usado para trocas informações com  o cliente
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
     * * define um diretório para armazenar as chaves public, private e secret
     * @param   {string} path: diretório para as chaves
     * @return  {object} paths: contém todos os paths utilizados na classe
     */
    path(path = "") {
        this.paths.base         = path || this.paths.base;
        this.paths.public       = `${this.paths.base}/public-key.pem`
        this.paths.private      = `${this.paths.base}/private-key.pem`
        this.paths.secret       = `${this.paths.base}/secret-key.key`
        this.paths.signature    = `${this.paths.base}/siginature.key`
        return this.paths;
    }

    /**
     * * carrega os dados para a classe
     * @param   {*} raw: any
     * @return  {*} raw
     */
     raw(raw = "") {
        return (this.formBox.destiny.raw = raw || this.formBox.destiny.raw);
    }

    /**
     * * carrega o payload reflex na classe
     * @param   {Object} reflex
     * @return  {Object} reflex
     */
    setReflex(reflex = { }) {
        if (reflex.hasOwnProperty('origin')) {
            this.reflex.origin = { ...this.reflex.origin, ...reflex.origin };
        };

        if(reflex.hasOwnProperty('destiny')) {
            this.reflex.destiny = { ...this.reflex.destiny, ...reflex.destiny };
        };

        return this.reflex;
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
            const [err, { privateKey, publicKey }] = await handle(this.rsa.generateKeyPairAsync());
            if (err) {
                // TODO: logger
                console.error("Error ao gerar as chaves");
                return this.keysBox;
            };

            // ! gera uma chave IV de uma string forte de 64 caracteres e define a secret 
            const { iv: secret } = this.parse(this.crypt.encrypt(publicKey, "De@14@Jxfjm^MiKpQP6tzKSm83xpa*vfXRi2bSjvtSFGVbwU8Yy&9K*&soIT5ft&EIS"));

            // ! gera uma chave de assinatura
            const { signature }  = this.parse(await this.crypt.signature(privateKey, secret));

             // ! cria novo o objeto de chaves do servidor
            this.keysBox.destiny = { public: publicKey, private: privateKey, secret, signature };
            
            // ? returna o objeto de chaves
            return this.keysBox
        } catch (e) {
            // TODO: logger
            console.error(e);
            return this.keysBox;
        }
    }

    /**
     * * escreve as chaves publica, privada e secreta em arquivos no disco
     * @param   {string} path: define um diretório para guardar as chaves
     * @returns {object} keysBox:
     */
    async writeKeys(path = "") {

        // ! define um diretório para armazenar as chaves
        this.path(path);

        try {
            await fs.writeFileSync(this.paths.public, this.keysBox.destiny.public);
            console.log("public");
        } catch (e) {
            // TODO: logger
            console.error(e);
        };

        try {
            await fs.writeFileSync(this.paths.private, this.keysBox.destiny.private);
            console.log("private");
        } catch (e) {
            // TODO: logger
            console.error(e);
        };

        try {
            await fs.writeFileSync(this.paths.secret, this.keysBox.destiny.secret);
            console.log("secret");
        } catch (e) {
            // TODO: logger
            console.error(e);
        };

        try {
            await fs.writeFileSync(this.paths.secret, this.keysBox.destiny.signature);
            console.log("signature");
        } catch (e) {
            // TODO: logger
            console.error(e);
        };
        
        console.log("keysbox");
        return this.keysBox;
      }

    /**
     * * lê o valor das chaves no disco e passa para as variaveis de ambiente
     * @param  {string} path: define um diretório para ler as chaves
     * @return {object} keysBox:  
     */
    async readKeys(path = "") {

        // ! define um diretório para ler as chaves
        this.path(path);

        try {
            process.env.PUBLIC_KEY = await fs.readFileSync(this.paths.public, "utf8");
            console.log("public");
        } catch (e) {
            console.error(e);
        };

        try {
            process.env.PRIVATE_KEY = await fs.readFileSync(this.paths.private, "utf8");
            console.log("private");
        } catch (e) {
            console.error(e);
        };

        try {
            process.env.SECRET_KEY = await fs.readFileSync(this.paths.secret, "utf8");
            console.log("secret");
        } catch (e) {
            console.error(e);
        };

        try {
            process.env.SIGNATURE = await fs.readFileSync(this.paths.signature, "utf8");
            console.log("signature");
        } catch (e) {
            console.error(e);
        };

        console.log("keysbox");
        return this.keysBox;
    }

    /**
     * * carrega as chaves armazenadas nas variaveis de ambiente para  a classe 
     * @return {object} keysBox
     */
     async loadKeys() {

        // ! se não houver chave publica na classe, faz uma leitura do ambiente
        if (this.keysBox.public.length < 64) {
            await loadEnvironmentToClass();
        };

        // ! se não houver chave publica no ambiente, faz a leitura do disco
        if(process.env.PUBLIC_KEY.length < 64) { 
            await this.readKeys() 
            await await loadEnvironmentToClass();
        }

         // ! se não houver chave publica no disco, gera um novo par de chaves
         if(process.env.PUBLIC_KEY.length < 64) { 
            await this.captureKeys();
            await this.writeKeys();
            await this.readKeys()
            await await loadEnvironmentToClass();
        }

        // ? retorna as chaves
        return this.keysBox;

        // ! carrega as chaves do ambiente para a classe
        async function loadEnvironmentToClass() { 
            this.keysBox.destiny.public     = process.env.PUBLIC_KEY;
            this.keysBox.destiny.private    = process.env.PRIVATE_KEY;
            this.keysBox.destiny.secret     = process.env.SECRET_KEY;
            this.keysBox.destiny.signature  = process.env.SIGNATURE;
        };
       
    }

    /**
     * ! assina um string
     * @param   {*} raw
     * @return  {string} signature:
     */
    async signature(raw = "") {        
        try {
            
            // ! se não hpuver chave privada, não faz a assinatura
            if (!this.keysBox.destiny.private.length < 64) {
                // TODO logger
                console.error("Erro, a chave privada não existe");
                return this.keysBox.destiny.signature;
            };

            // ! converte para string
            const dataString = this.parseStr(this.raw(raw));

             // ! faz a assinatura do dado e extrai do JSON a assinnatura
            const { signature } = this.parse(this.crypt.signature(this.keysBox.destiny.private, dataString));
            
            // ? retorna a assinatura
            return this.keysBox.destiny.signature = signature;

        } catch (e) {
            // TODO: logger
            console.error(e);
            return this.keysBox.destiny.signature
        }
    }

    /**
     * ! verifica se uma string foi assinada
     * @param   {string} raw:
     * @return  {boolean} verify
     * !! OBS: ainda não está totalmente implementado
     */
    async verify(raw = "") {
        return await this.crypt.verify(this.keysBox.destiny.public, this.raw(raw), this.keysBox.destiny.signature);
    }

    /**
     * * Encrypta um dado com uma public key recebida no padrão RSA
     * @param   {*} raw:
     * @return  {string} cipher: hash cifrada
     */
    async deform(raw = "") {
        try {

             // ! carrega a chave pública do cliente
             const origin = this.keysBox.origin.public;

            // ! se não houver chave pública do cliente, não faz a cifragem 
            if (origin.length < 64) {
                console.error("Erro, a chave publica não existe");
                return this.formBox.destiny.deform;
            }

            // ! converte para string
            const dataString = this.parseStr(this.raw(raw));

            // ! faz assinatura 
            const signature = await this.signature(dataString);

            // ! cria uma cifra no servidor com a chave do cliente
            return this.formBox.destiny.deform = this.crypt.encrypt(origin, dataString, signature);

        } catch (e) {
            // TODO: logger
            console.error(e);
            return this.formBox.destiny.deform;
        }
    }

    /**
     * ! decrypta uma cifra do cliente com a chave privada do servidor no padrão RSA
     * @param   {string} cipher: hash cifrada 
     * @return  {string} decoded: dados decifrados
     */
    async reform(cipher = "") {
        try {
     
            this.formBox.origin.deform = cipher || this.formBox.origin.deform;

            // ! pega a chave privada do servidor
            const privateKey = this.keysBox.destiny.private;

            // ! Se não houver chave privada dos servidor, não fz decifragem
            if (privateKey.length < 64) {
                // TODO: logger
                console.error("Erro, a chave privada não existe");
                return this.formBox.origin.reform;
            };

            // ! faz a decigragem da string enviada pelo cliente
            const { message, signature } = this.crypt.decrypt(privateKey, this.formBox.origin.deform);
            
            // ! carrega a assinatura do cliente
            this.keysBox.origin.signature = signature;

            // ! verifica se a assinatura é autentica
            // ! vrify ainda não está funcional
            // if (this.keysBox.origin.signature && !this.verify(message)) {
            //     console.error("Erro, documento com assinatura inválida");
            // }

            // ? retorna a informação decigrada
            return this.formBox.origin.reform = this.parse(message);
        } catch (e) {
            // TODO: logger
            console.error(e);
            return this.formBox.origin.reform
        }
    }

    /**
     *  ! Troca as chaves publicas entre cliente e servidor
     * @param   {object} reflex 
     * @returns {object} reflex
     */
    async reflect(reflex = {}) {

        // ! carrega as chaves para o servidor
        await this.loadKeys();

        // ! carrega o objeto entre servidor e cliente
        this.setReflex(reflex);

        // ! carrega a chave publica para dentro do reflex
        this.match(this.keysBox);

        // ? response as chaves para o cliente
        return this.reflex;
    }

   /**
     * * response uma requisião do cliente
     * * um dado no servidor é cifrado com a public Key do cliente
     * @param   {object} reflex:
     * @return  {object} reflex:
     */
    async distort(reflex = {}) {
       
        // ! carrega o objeto de troca para para a classe
        this.setReflex(reflex);

        // ! Salva o estado dos objetos formBox e keysBox
        const image = this.photo();

        // ! Troca as chaves publicas entre cliente e servidor
        await this.reflect();

        // ! Carrega a chave publica recebida do cliente para a classe
        this.keysBox.public = this.reflex.origin.public;

        // ! Encrypta um dado com uma public key recebida no padrão RSA
        await this.deform();

        // ! Carrega a cifra para o objeto usado para a troca
        this.reflex.image.cipher = this.formBox.deform.image;

        // ! Reseta os objetos formBox e keysBox ao estado anterior
        this.photo(image);

        return this.reflex;
    }

    // /**
    //  * * Decrypta uma cifra recebida do cliente com a chave privada do servidor
    //  * @param {*} reflex 
    //  * @returns 
    //  */
    // async keep(reflex = "") {
    //     // ! carrega o objeto de troca para para a classe
    //     this.setReflex(reflex);

    //     // ! carrega a cifra recebida para a classe
    //     this.formBox.deform.image = this.reflex.origin.cipher;

    //     // ! Carrega as chaves armazenadas no objeto da classe para as variaveis de ambiente
    //     await this.loadKeys();

    //     // ! Decrypta uma cifra recebida do cliente com a chave privada do servidor
    //     await this.reform();

    //     // ! Carrega o dado decryptado no banco de dados
    //     await this.writeData(this.formBox.reform);

    //     // console.info("SERVER: ", this.formBox.reform);
    //     return this.reflex;
    // }

    // /**
    //  * * Encrypta o dado de um cliente para enviar a outro cliente
    //  * @param {*} reflex 
    //  * @returns 
    //  */
    // async refraction(reflex = "") {
    //     // ! carrega o objeto de troca para para a classe
    //     this.setReflex(reflex);

    //     // ! Carrega as chaves armazenadas no objeto da classe para as variaveis de ambiente
    //     await this.loadKeys();

    //     // ! Carrega a chave publica recebida do cliente para a classe
    //     this.keysBox.public = this.reflex.origin.public;

    //     // Carrega o dado do banco de dados para a classe
    //     this.formBox.reform = await this.readData();

    //     // ! Encrypta um dado com uma public key recebida no padrão RSA
    //     await this.deform();

    //     // ! Carrega a cifra para o objeto usado para a troca
    //     this.reflex.image.cipher = this.formBox.deform.image;
        
    //     //console.info("SERVER: ", this.reflex);
    //     return this.reflex;
    // }

    // /**
    //  * * Encrypta um dado recebido do cliente com sua chave publica e retorna para ele a cifra
    //  * @param {*} reflex
    //  * @returns 
    //  */
    // async reveal(reflex = "") {
    //     // ! carrega o objeto de troca para para a classe
    //     this.setReflex(reflex);

    //     // ! Troca as chaves publicas entre cliente e servidor
    //     await this.reflect();

    //     // ! Salva o estado dos objetos formBox e keysBox
    //     const image = await this.photo();

    //     // ! carrega os dados para serem encriptados
    //     this.setRaw(this.reflex.origin.raw);

    //     // this.keysBox.public = this.reflex.origin.public;

    //     // ! Encrypta um dado com uma public key recebida e carrega no objeto usado para a troca
    //     this.reflex.origin.cipher = await this.deform();

    //     // ! Reseta os objetos formBox e keysBox ao estado anterior
    //     await this.photo(image);

    //     return this.reflex;
    // }

    // /**
    //  * * Salva o estado dos objetos formBox e keysBox para reseta-los após uso
    //  * @param {*} image
    //  * @return Object
    //  */
    // async photo(image = undefined) {
    //     // ! Se houver uma imagem carrega no keysBox e formBox o estado anterior
    //     if (image) {
    //         this.keysBox = image.keysBox;
    //         this.formBox = image.formBox;
    //         return image;
    //     }

    //     // ! Retorna o estado atual dos objetos
    //     return { keysBox: this.keysBox, formBox: this.formBox };
    // }

     /**
     * * Parseia uma string para json caso seja possível
     * @param   {*}     payload
     * @return  {json}  payload 
     */
      parse(payload = "") { 
        try { 
            return JSON.parse(payload); 
        } catch (e) { 
            // TODO: logger
            console.error(ë);
            return payload; 
        }; 
    }
      
    /**
     *  Passa um dado Json para string
     * @param   {*}         data:
     * @return  {string}    data:
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

module.exports = AuthenticationMirror;
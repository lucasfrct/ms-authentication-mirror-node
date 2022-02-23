require('dotenv/config');
const fs = require("fs");
const Crypt = require('hybrid-crypto-js').Crypt;
const RSA = require('hybrid-crypto-js').RSA;

/**
 * * Classe usada pelo servidor para gerar suporte a autenticação espelhada
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
    paths = { base: "./keys", public: "", private: "", secret: "", signature: "" }; 

    /**
     * * Armazena as chaves das entidades
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
     * * Payload usado para trocas informações com  o cliente
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
     * @param {string} path: diretório para as chaves
     * @return {object} paths: contém todos os paths utilizados na classe
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
        return this.reflex = { ...this.reflex, ...reflex };
    }

    /**
     * * combina os objetos reflex com formBox e keysBox
     * @param   {*} data: formBox || kyesBox || reflex 
     * @return  {*} data: reflex 
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

   

    async writeData(data = "", path = "") {

        this.path(path);

        try { 
            await fs.writeFileSync(this.paths.data, data);
        }catch (e) {
            console.error("Error writing data");
        };
    }


    /**
     * * Gera uma assinatura unica usando a chave privada
     * @param raw: any
     * @returns signature: object
     */
    async signature(raw = "") {

        this.setRaw(raw);

        try {
            // ! se não hpuver chave privada, não faz a assinatura
            if (!this.keysBox.private) {
                return this.keysBox.signature;
            };

            const { signature } = this.parse(this.crypt.signature(this.keysBox.private, JSON.stringify(this.formBox.raw)));
            return this.keysBox.signature = signature;

        } catch (e) {
            console.error(e);
            return this.keysBox.signature
        }
    }

    /**
     * ! gera o par de chaves publico/privada
     * ! gera um chave secreta
     * ! gera uma asinatura
     * @returns {object} keysBox:
     */
    async captureKeys() {
        try {
            // ! Generate 1024 bit RSA key pair
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

            // ! Carrega na classe as chaves publica, privada e secreta
            this.keysBox.destiny = { public: publicKey, private: privateKey, secret, siginature };
            
            // ? returna o objeto de chaves
            return this.keysBox
        } catch (e) {
            // TODO: logger
            console.error(e);
            return this.keysBox;
        }
    }

    /**
     * * Escreve as chaves publica, privada e secreta em arquivos no disco
     * @returns keysBox: object
     */
    async writeKeys(path = "") {

        // ! define um diretório para armazenar as chaves public, private e secret
        this.path(path);

        try {
            await fs.writeFileSync(this.paths.public, this.keysBox.public);
        } catch (e) {
            console.error(e);
        };

        try {
            await fs.writeFileSync(this.paths.private, this.keysBox.private);
        } catch (e) {
            console.error(e);
        };

        try {
            await fs.writeFileSync(this.paths.secret, this.keysBox.secret);
        } catch (e) {
            console.error(e);
        };

        return this.keysBox
    }

    /**
     * * Lê o valor das chaves no disco e passa para as variaveis de ambiente
     * @param path: string - caminho da pasta das chaves 
     * @return keys: Object -  contém todas as chaves utilizadas   
     */
    async readKeys(path = "") {

        // ! define um diretório para armazenar as chaves public, private e secret
        this.path(path);

        try {
            process.env.SECRET_KEY = await fs.readFileSync(this.paths.secret, "utf8");
        } catch (e) {
            console.error(e);
        };

        try {
            process.env.PUBLIC_KEY = await fs.readFileSync(this.paths.public, "utf8");
        } catch (e) {
            console.error(e);
        };

        try {
            process.env.PRIVATE_KEY = await fs.readFileSync(this.paths.private, "utf8");
        } catch (e) {
            console.error(e);
        };

        return this.keysBox;
    }

    /**
     * * Carrega as chaves armazenadas nas variaveis de ambiente para o objeto da classe 
     * @returns keysBox: object
     */
    async loadKeys() {

        // ! Se o conteúdo da variavel de ambiente for menor que 64, faça um readKeys
        if (!process.env.PUBLIC_KEY.length < 64) { await this.readKeys() }

        // ! Se o conteúdo da variavel de ambiente for menor que 64, carrega as chaves armazenadas
        // nas variaveis de ambiente para a classe
        if (!this.keysBox.public.length < 64) {
            this.keysBox = {
                ...this.keysBox,
                private: process.env.PRIVATE_KEY,
                public: process.env.PUBLIC_KEY,
                secret: process.env.SECRET_KEY
            };
        };

        return this.keysBox;
    }

    /**
     * * Verifica se a assinatura é autentica
     * @param raw: any
     * @return bool
     */
    async verify(raw = "") {
        return await this.crypt.verify(this.keysBox.public, raw, this.keysBox.signature);
    }

    /**
     * * Encrypta um dado com uma public key recebida no padrão RSA
     * @param raw: any
     * @return cipher: string - hash cifrada
     */
    deform(raw = "") {
        try {
            this.setRaw(raw);

            // ! faz assinatura da informação que será transmitida 
            this.signature();

            // ! Se não houver a chave publica do servidor, não faz a cifragem
            if (!this.keysBox.public) {
                console.error("A PUBLIC KEY NÃO EXISTE");
                return this.formBox.deform.image;
            };

            // ! Se não houver a assinatura, não faz a cifragem
            if (!this.keysBox.signature) {
                console.error("A ASSINATURA KEY NÃO EXISTE");
                return this.formBox.deform.image;
            };

            // ! Cria uma cifra no servidor com a chave do cliente
            return this.formBox.deform.image = this.crypt.encrypt(
                this.keysBox.public,
                JSON.stringify(this.formBox.raw), ""
            );

        } catch (e) {
            console.error("ERRO", e);
            return this.formBox.deform.image;
        }
    }

    /**
     * * Decrypta uma cifra do cliente com a chave privada do servidor no padrão RSA
     * @param cipher: string - hash cifrada apara ser decriptofrafada 
     * @return decoded: any - dados que foi envidado via criptografia
     */
    async reform(cipher = "") {
        //await loadKeys();
        try {
            // ! Carrega a cifra na classe
            this.formBox.deform.image = cipher || this.formBox.deform.image;

            // ! Se não houver chave privada, não decifra
            if (!this.keysBox.private) {
                return this.formBox.reform;
            };

            // ! Decifra a cifra com a chave privada do servidor
            const { message, signature } = this.crypt.decrypt(this.keysBox.private, this.formBox.deform.image);
            
            //faz assinatura da informação que será transmitida 
            this.keysBox.signature = signature;


            // verifica se a assinatura é autentica
            if (this.keysBox.signature && !this.verify(message)) {
                return this.formBox.reform;
            };

            return this.formBox.reform = this.parse(message);

        } catch (e) {
            console.error(e);
            return this.formBox.reform
        }
    }

    /**
     * * Troca as chaves publicas entre cliente e servidor
     * @param {*} reflex 
     * @returns reflex
     */
    async reflect(reflex = "") {
        // ! carrega o objeto de troca para para a classe
        this.setReflex(reflex);

        // ! Carrega as chaves armazenadas no objeto da classe para as variaveis de ambiente
        await this.loadKeys();

        // ! Carrega a chave publica recebida do cliente para a classe
        this.keysBox.origin = this.reflex.origin.public;

        // ! Carrega a chave publica do servidor no objeto usado para a troca
        this.reflex.image = {...this.reflex.image, public: this.keysBox.public };

        return this.reflex;
    }

    /**
     * * Encrypta um dado do servidor com uma public key recebida do cliente
     * @param {*} reflex 
     * @returns 
     */
    async distort(reflex = "") {
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

    /**
     * * Decrypta uma cifra recebida do cliente com a chave privada do servidor
     * @param {*} reflex 
     * @returns 
     */
    async keep(reflex = "") {
        // ! carrega o objeto de troca para para a classe
        this.setReflex(reflex);

        // ! carrega a cifra recebida para a classe
        this.formBox.deform.image = this.reflex.origin.cipher;

        // ! Carrega as chaves armazenadas no objeto da classe para as variaveis de ambiente
        await this.loadKeys();

        // ! Decrypta uma cifra recebida do cliente com a chave privada do servidor
        await this.reform();

        // ! Carrega o dado decryptado no banco de dados
        await this.writeData(this.formBox.reform);

        // console.info("SERVER: ", this.formBox.reform);
        return this.reflex;
    }

    /**
     * * Encrypta o dado de um cliente para enviar a outro cliente
     * @param {*} reflex 
     * @returns 
     */
    async refraction(reflex = "") {
        // ! carrega o objeto de troca para para a classe
        this.setReflex(reflex);

        // ! Carrega as chaves armazenadas no objeto da classe para as variaveis de ambiente
        await this.loadKeys();

        // ! Carrega a chave publica recebida do cliente para a classe
        this.keysBox.public = this.reflex.origin.public;

        // Carrega o dado do banco de dados para a classe
        this.formBox.reform = await this.readData();

        // ! Encrypta um dado com uma public key recebida no padrão RSA
        await this.deform();

        // ! Carrega a cifra para o objeto usado para a troca
        this.reflex.image.cipher = this.formBox.deform.image;
        
        //console.info("SERVER: ", this.reflex);
        return this.reflex;
    }

    /**
     * * Encrypta um dado recebido do cliente com sua chave publica e retorna para ele a cifra
     * @param {*} reflex
     * @returns 
     */
    async reveal(reflex = "") {
        // ! carrega o objeto de troca para para a classe
        this.setReflex(reflex);

        // ! Troca as chaves publicas entre cliente e servidor
        await this.reflect();

        // ! Salva o estado dos objetos formBox e keysBox
        const image = await this.photo();

        // ! carrega os dados para serem encriptados
        this.setRaw(this.reflex.origin.raw);

        // this.keysBox.public = this.reflex.origin.public;

        // ! Encrypta um dado com uma public key recebida e carrega no objeto usado para a troca
        this.reflex.origin.cipher = await this.deform();

        // ! Reseta os objetos formBox e keysBox ao estado anterior
        await this.photo(image);

        return this.reflex;
    }

    /**
     * * Salva o estado dos objetos formBox e keysBox para reseta-los após uso
     * @param {*} image
     * @return Object
     */
    async photo(image = undefined) {
        // ! Se houver uma imagem carrega no keysBox e formBox o estado anterior
        if (image) {
            this.keysBox = image.keysBox;
            this.formBox = image.formBox;
            return image;
        }

        // ! Retorna o estado atual dos objetos
        return { keysBox: this.keysBox, formBox: this.formBox };
    }

     /**
     * * Parseia uma string para json caso seja possível
     * @param payload: any 
     * @return payload: any 
     */
      parse(payload = "") { try { return JSON.parse(payload); } catch (e) { return payload; }; }

}

module.exports = AuthenticationMirror;
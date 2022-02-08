require('dotenv/config');
const fs = require("fs");
const Crypt = require('hybrid-crypto-js').Crypt;
const RSA = require('hybrid-crypto-js').RSA;


/**
 * Faz autenticação do usuário vi RSA
 *  - gera um par de chaves publico-privada
 *  - faz encryptacao com assinatura
 *  - faz decryptação com assinatura
 *  - verifuca assinatura [ assin com chave pública e verifica com chave privada]
 */
const AuthenticationMirror = class AuthenticationMirror {

    instance = null;
    rsa = null;

    paths = { public: "", private: "", secret: "", base: "./keys" };
    keysBox = { public: "", private: "", origin: "", destiny: "", signature: "", secret: "" };
    headers = { token: 'x-auth-token', bearer: 'Bearer' };

    formBox = {
        raw: "",
        reform: "",
        deform: { origin: "", image: "", destiny: "" }
    };

    reflex = {
        origin: { public: "", cipher: "", raw: "" }, // browser
        image: { public: "", cipher: "", raw: "" }, // servidor local
        destiny: { public: "", cipher: "", raw: "" } // servidor remoto
    };

    constructor() {
        this.instance = new Crypt({ md: 'sha512' }); // inicializando Crypto
        this.rsa = new RSA({ keySize: 4096 }); // inicializando RSA
        this.path(); // definido Pths de escrita/leitura
    }

    /**
     * define um diretório para armazenar as chaves public, private e secret
     * @param path: string - folder das chaves
     * @return paths: Object - contém todos os paths utilizados
     */
    path(path = "./keys") {
        this.paths.base = path || this.paths.base;
        this.paths.public = `${this.paths.base}/public_key.pem`
        this.paths.private = `${this.paths.base}/private_key.pem`
        this.paths.secret = `${this.paths.base}/secret_key.b64`
        return this.paths;
    }

    /**
     * Faz set no dos dos dados que serão encryptados
     * @param raw: any - recebe dados de qualquer typo 
     * @return raw: any - retorna o mesmo dado de entrada 
     */
    setRaw(raw = "") { return this.formBox.raw = raw || this.formBox.raw; }
    setReflex(reflex = "") { return this.reflex = reflex || this.reflex; }

    hash(txt = "") { return sha512(txt); }

    /**
     * Parseia uma string para json caso seja possível
     * @param payload: any 
     * @return payload: any 
     */
    parse(payload = "") { try { return JSON.parse(payload); } catch (e) { return payload; }; }

    /**
     * Gera uma assinatura unica usando a chave privada
     * @param raw: any
     * @returns signature: object
     */
    async signature(raw = "") {

        this.setRaw(raw);

        try {
            // se não hpuver chave privada, não faz a assinatura
            if (!this.keysBox.private) {
                return this.keysBox.signature;
            };

            const { signature } = this.parse(this.instance.signature(this.keysBox.private, JSON.stringify(this.formBox.raw)));
            return this.keysBox.signature = signature;

        } catch (e) {
            console.error(e);
            return this.keysBox.signature
        }
    }

    /**
     * Gera as chaves para autenticação
     * @return keys: Object - chaves de autenticação
     */
    async captureKeys() {
        try {
            // Generate 1024 bit RSA key pair
            const [err, { privateKey, publicKey }] = await handle(this.rsa.generateKeyPairAsync());
            if (err) {
                return this.keysBox;
            };

            const { iv } = this.parse(this.instance.encrypt(publicKey, process.env.SECRET_KEY));

            return this.keysBox = {...this.keysBox, public: publicKey, private: privateKey, secret: iv };
        } catch (e) {
            console.error(e);
            return this.keysBox;
        }
    }

    /**
     * Escreve as chaves public, private e secret em um diretório
     * @param path: string - folder das chaves
     * @return keys: Object - contém todas as chaves utilizadas 
     */
    async writeKeys(path = "") {

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
     * Faz a leitura dos das chaves public, private e secret do HD para a classe
     * @param path: string - caminho do folder das chaves 
     * @return keys: Object -  contém todas as chaves utilizadas   
     */
    async readKeys(path = "") {

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


    async loadKeys() {
        if (!process.env.PUBLIC_KEY.length < 64) { await this.readKeys() }

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
     * Verifica se a assinatura é autentica
     * @param raw: any
     * @return bool
     */
    async verify(raw = "") {
        return await this.instance.verify(this.keysBox.public, raw, this.keysBox.signature);
    }

    /**
     * Encrypta uma string para troca e mensagens RSA
     * @param raw: any  - texto ou objeto para ser encrypta
     * @return cipher: string - texto cifrado com RSA
     */
    deform(raw = "") {
        try {
            this.setRaw(raw);

            //faz assinatura da informação que será transmitida 
            this.signature();

            if (!this.keysBox.public) {
                return this.formBox.deform.image;
            };

            if (!this.keysBox.signature) {
                return this.formBox.deform.image;
            };

            return this.formBox.deform.image = this.instance.encrypt(
                this.keysBox.public,
                JSON.stringify(this.formBox.raw), ""
            );

        } catch (e) {
            console.error(e);
            return this.formBox.deform.image;
        }
    }

    /**
     * Decriptografa o conteúdo cifrado no 
     * @param cipher: string - hash cifrada apara ser decriptofrafada 
     * @return decoded: any - dados que foi envidado via criptografia
     */
    async reform(cipher = "") {
        //await loadKeys();
        try {
            this.formBox.deform.image = cipher || this.formBox.deform.image;

            // testa se a chave privada existe
            if (!this.keysBox.private) {
                return this.formBox.reform;
            };

            const { message, signature } = this.instance.decrypt(this.keysBox.private, this.formBox.deform.image);
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

    // Client Request
    async reflect(reflex = "") {
        this.setReflex(reflex);
        await this.loadKeys();
        this.keysBox.origin = this.reflex.origin.public;
        this.reflex.image = {...this.reflex.image, public: this.keysBox.public };
        return this.reflex;
    }

    // Client Request
    async distort(reflex = "") {
        this.setReflex(reflex);

        const image = this.photo();
        await this.reflect();

        this.formBox.public = this.reflex.origin.public;
        await this.deform();
        this.reflex.origin.cipher = this.formBox.deform.image;

        this.photo(image);

        return this.reflex;
    }

    async keep(reflex = "") {
        this.setReflex(reflex);
        this.formBox.deform.image = this.reflex.origin.cipher;
        await this.loadKeys();
        await this.reform();
        return this.reflex;
    }

    async reveal(reflex = "") {
        this.setReflex(reflex)
        await this.reflect();

        const image = await this.photo();

        this.setRaw(this.reflex.origin.raw);
        this.keysBox.public = this.reflex.origin.public;
        this.reflex.origin.cipher = await this.deform();

        await this.photo(image);

        return this.reflex;
    }

    async photo(image = undefined) {
        if (image) {
            this.keysBox = image.keysBox;
            this.formBox = image.formBox;
            return image;
        }
        return { keysBox: this.keysBox, formBox: this.formBox };
    }

}

module.exports = AuthenticationMirror;
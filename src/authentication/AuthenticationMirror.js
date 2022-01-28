require('dotenv/config');
const fs = require("fs");
const Crypt = require('hybrid-crypto-js').Crypt;
const RSA = require('hybrid-crypto-js').RSA;

const handle    = require('@ms-utils-node/src/core/handle');
const logger    = require('@ms-utils-node/src/core/logger-handler');
const Err       = require('@ms-utils-node/src/core/error-handler');

/**
 * Faz autenticação do usuário vi RSA
 *  - gera um par de chaves publico-privada
 *  - faz encryptacao com assinatura
 *  - faz decryptação com assinatura
 *  - verifuca assinatura [ assin com chave pública e verifica com chave privada]
 */
const AuthenticationMirror = class AuthenticationMirror {

    instance = null;
    rsa      = null;

    keysBox  = { public: "", private: "", origin: "" , signature: "" , secret: "" }
    heraders = { token: 'x-auth-token', bearer: 'Bearer' };                             // headers request/response 
    paths    = { public: "", private: "", secret: "", base: "./keys" };                // paths de escrita/leitura
    formBox  = { raw: "", reform: "", deform: { origin: "", image: "" }};
    reflex   = { origin: { public: "", cipher: "", raw: "" }, image: { public: "", cipher: "", raw: "" } }

    constructor() {
        this.instance = new Crypt({ md: 'sha512' });    // inicializando Crypto
        this.rsa = new RSA({ keySize: 4096 });          // inicializando RSA
        this.path();                                    // definido Pths de escrita/leitura
    }

    /**
     * define um diretório para armazenar as chaves public, private e secret
     * @param path: string - folder das chaves
     * @return paths: Object - contém todos os paths utilizados
     */
     path(path = "./keys") {
        this.paths.base     = path || this.paths.base;
        this.paths.public   = `${this.paths.base}/public_key.pem`
        this.paths.private  = `${this.paths.base}/private_key.pem`
        this.paths.secret   = `${this.paths.base}/secret_key.b64`
        return this.paths;
    }

    /**
     * Faz set no dos dos dados que serão encryptados
     * @param raw: any - recebe dados de qualquer typo 
     * @return raw: any - retorna o mesmo dado de entrada 
     */
     setRaw(raw = "") {
        return this.formBox.raw = raw || this.formBox.raw;
    }
    
    /**
    * Gera uma assinatura unica usando a chave privada
    * @param raw: any
    * @returns signature: object
    */
    async signature(raw = "") {

        this.setRaw(raw);

        try {
            // se não hpuver chave privada, não faz a assinatura
            if(!this.keysBox.private) {
                logger.message({ code: "AU0008", message: "A private key não existe" });
                return this.keysBox.signature; 
            };

            const { signature } = this.parse(this.instance.signature(this.keysBox.private, JSON.stringify(this.formBox.raw)));
            return this.keysBox.signature = signature;

        } catch(e) {
            logger.error({ error: e, code: "AU0009", message: "A assinatura não pôde ser gerada" });
            return this.keysBox.signature
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
        } catch(e) {
            logger.error({ error: e, code: "AU0002", message: "A public Key não pôde ser escrita" });
        };

        try {
            await fs.writeFileSync(this.paths.private, this.keysBox.private);
        } catch(e) {
            logger.error({ error: e, code: "AU0003", message: "A Private Key não pôde ser escrita" });
        };

        try {
            await fs.writeFileSync(this.paths.secret,   this.keysBox.secret);
        } catch(e) {
            logger.error({ error: e, code: "AU0004", message: "A secret Key não pôde ser escrita" });
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
            process.env.SECRET_KEY = await fs.readFileSync(this.paths.secret,  "utf8");
        } catch(e) {
            logger.error({ error: e, code: "AU0005", message: "A Secret Key não pôde ser lida"});
        };

        try {
            process.env.PUBLIC_KEY  = await fs.readFileSync(this.paths.public,  "utf8");
        } catch(e) {
            logger.error({ error: e, code: "AU0006", message:  "A Public Key não pôde ser lida" });
        };

        try {
            process.env.PRIVATE_KEY = await fs.readFileSync(this.paths.private, "utf8");
        } catch(e) {
            logger.error({ error: e, code: "AU0007", message: "A Parivate Key não pôde ser lida"});
        };

        return this.keysBox;
    }


    async loadKeys() {
        if(!process.env.PUBLIC_KEY.length < 64) { await this.readKeys() }

        if(!this.keysBox.public.length < 64) {
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
     * Gera as chaves para autenticação
     * @return keys: Object - chaves de autenticação
     */
    async captureKeys() {
        try{
            // Generate 1024 bit RSA key pair
            const [err, { privateKey, publicKey } ] = await handle(this.rsa.generateKeyPairAsync());
            if(err) {
                logger.error({ error: err, code: "AU0010", message: "O par de chaves público e privado não puderam ser geradas" });
                return this.keys;
            };
            
            const { iv } = this.parse(this.instance.encrypt(publicKey, process.env.SECRET_KEY));

            return this.keysBox = { ...this.keysBox, public: publicKey, private: privateKey, secret: iv };
        } catch(e) {
            logger.error({ error: e, code: "AU0011", message: "O par de chaves público e privado não puderam ser geradas" });
            return this.keysBox;
        }
    }

    /**
     * Verifica se a assinatura é autentica
     * @param raw: any
     * @return bool
     */
    async verify(raw = "") {
        console.log("VERIFY: ", this.keysBox.signature);
        return await this.instance.verify( this.keysBox.public, raw, this.keysBox.signature );
    }
    
    /**
     * Encrypta uma string para troca e mensagens RSA
     * @param raw: any  - texto ou objeto para ser encrypta
     * @return cipher: string - texto cifrado com RSA
     */
    deform() {
        try {
            this.setRaw(this.reflex.origin.raw);
            const Public = this.reflex.origin.public || this.keysBox.origin;

            //faz assinatura da informação que será transmitida 
            this.signature();

            if(!Public) {
                logger.message({ code: "AU0012", message: "A public key não existe" })
                return this.formBox.deform.image;
            };

            if(!this.keysBox.signature) {
                logger.message({ code: "AU0013", message: "A assinatura não existe" })
                return this.formBox.deform.image;
            };

            
            return this.formBox.deform.image = this.instance.encrypt(
                Public, 
                JSON.stringify(this.formBox.raw), ""
            );
            
        } catch(e) {
            logger.message({error: e, code: "AU0014", message: "Erro ao encryptar os dados"});
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
    * Parseia uma string para json caso seja possível
    * @param payload: any 
    * @return payload: any 
    */
    parse(payload = "") {
        try {
            return JSON.parse(payload);
        } catch (e) {
            return payload;
        };
    }

    // Client Request
    async reflect(reflex = "") {
        await this.loadKeys();
        this.reflex = reflex || this.reflex;
        this.keysBox.origin = this.reflex.origin.public;
        console.log("server: ", this.keysBox.origin);
        this.reflex.image = { ...this.reflex.image, public: this.keysBox.public };
        return this.reflex;
    }

    // Client Request
    async distort(reflex = "") {
        this.reflex = reflex || this.reflex;
        //this.keysBox.public = this.keysBox.origin
        await this.loadKeys();
        await this.reflect();
        await this.deform();
        this.reflex.image = { ...this.reflex.image, cipher: this.formBox.deform.image };
        return this.reflex;
    }

    async keep(reflex = "") {
        this.reflex = reflex || this.reflex;
        this.formBox.deform.image = this.reflex.origin.cipher;
        await this.loadKeys();
        await this.reform();
        return this.reflex;
    }
        
}

module.exports = AuthenticationMirror;

// Trocando chaves: posta a chave origin e recebe a chave image
    // 1.0 request POST /authenticate/mirror reflex = { origin: { public: "asdf", cipher: ""}, image: { public: "", cipher: "" } }
    // 1.1 respose (POST) reflex = { origin: { public: "asdf", cipher: ""}, image: { public: "asdf", cipher: "" } }
    // 
    // Trocando cifras: posta a cifra origin e recebe a cifra image
    // 2.0 request POST { origin: { public: "asdf", cipher: "asdf"}, image: { public: "asdf", cipher: "" } }
    // 2.1 response (POST) { origin: { public: "asdf", cipher: "asdf"}, image: { public: "asdf", cipher: "asdfasdf" } }
    // 
    // Armazenando chaves (image = publickey da image)
    // 3.0 const keysBox = { public: "", private: "", image: "" }
    // Armazenando as cifras
    // 3.1 const formBox = { raw: "", reform: "", deform: { origin: "", image: "" }}
    // 
    // 4.0 
    // const reflex = { origin: { public: "", cipher: ""}, image: { public: "", cipher: "" } }

    // const mirror = new AuthenticationMirror();
    // (POST trocando chaves) mirror.reflect("/authenticate/mirror/reflect", { origin: { public: "asdf", cipher: ""}, image: { public: "", cipher: "" } });
    // (POST trocando cifras) mirror.distort("/authenticate/mirror/ditortion", { origin: { public: "asdf", cipher: ""}, image: { public: "", cipher: "" } });
    // const keysBox = mirror.captureKeys(); // Gerar chaves
    // const raw = mirror.reform( cipher )
    // const cipher = mirror.deform( raw )
    // client => (client = origin) && (server = image)
    // server => (server = origin) && (client = image)
    // No cliente o deform chama o reform do servidor
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
const Authentication = class Authentication {

    instance = null;
    rsa      = null;

    data     = { raw: "", cipher: "", decoded: "", signature: "" };     // dados manipulados
    keys     = { public: "", private: "", secret: "", };                // chaves de authentication
    paths    = { public: "", private: "", secret: "", base: "./keys", };// paths de escrita/leitura
    payload  = { claimant: "", message: "" };                           // payload
    heraders = { token: 'x-auth-token', bearer: 'Bearer' };             // headers request/response    

    constructor() {
        this.instance = new Crypt({ md: 'sha512' });    // inicializando Crypto
        this.rsa = new RSA({ keySize: 4096 });          // inicializando RSA
        this.path();                                    // definido Pths de escrita/leitura
    }

    /**
     * Faz set no dos dos dados que serão encryptados
     * @param raw: any - recebe dados de qualquer typo 
     * @return raw: any - retorna o mesmo dado de entrada 
     */
    setRaw(raw = "") {
        return this.data.raw = raw || this.data.raw;
    }

    /**
     * Retorna o dado que passou pela encriptação
     * @return dedoced: any
     */
    getRaw() {
        return this.data.decoded;
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
     * Escreve as chaves public, private e secret em um diretório
     * @param path: string - folder das chaves
     * @return keys: Object - contém todas as chaves utilizadas 
     */
    async writeKeys(path = "") {

        this.path(path);
        
        try {
            await fs.writeFileSync(this.paths.public, this.keys.public);
        } catch(e) {
            logger.error({ error: e, code: "AU0002", message: "A public Key não pôde ser escrita" });
        };

        try {
            await fs.writeFileSync(this.paths.private, this.keys.private);
        } catch(e) {
            logger.error({ error: e, code: "AU0003", message: "A Private Key não pôde ser escrita" });
        };

        try {
            await fs.writeFileSync(this.paths.secret,   this.keys.secret);
        } catch(e) {
            logger.error({ error: e, code: "AU0004", message: "A secret Key não pôde ser escrita" });
        };

        return this.keys
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

        return this.keys;
    }


    async loadKeys() {
        if(!process.env.PUBLIC_KEY.length < 64) { await this.readKeys() }
        this.keys.secret = process.env.SECRET_KEY;
        this.keys.public = process.env.PUBLIC_KEY;
        this.keys.private = process.env.PRIVATE_KEY;
        return this.keys;
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
            if(!this.keys.private) {
                logger.message({ code: "AU0008", message: "A private key não existe" });
                return this.data.signature; 
            };

            const { signature } = this.parse(this.instance.signature(this.keys.private, JSON.stringify(this.data.raw)));
            return this.data.signature = signature;

        } catch(e) {
            logger.error({ error: e, code: "AU0009", message: "A assinatura não pôde ser gerada" });
            return this.data.signature
        }
    }

    /**
     * Gera as chaves para autenticação
     * @return keys: Object - chaves de autenticação
     */
    async generateKeys() {
        try{
            // Generate 1024 bit RSA key pair
            const [err, { privateKey, publicKey } ] = await handle(this.rsa.generateKeyPairAsync());
            if(err) {
                logger.error({ error: err, code: "AU0010", message: "O par de chaves público e privado não puderam ser geradas" });
                return this.keys;
            };
            
            const { iv } = this.parse(this.instance.encrypt(publicKey, process.env.SECRET_KEY));

            return this.keys = { public: publicKey, private: privateKey, secret: iv };
        } catch(e) {
            logger.error({ error: e, code: "AU0011", message: "O par de chaves público e privado não puderam ser geradas" });
            return this.keys;
        }
    }

    /**
     * Verifica se a assinatura é autentica
     * @param raw: any
     * @return bool
     */
    async verify(raw = "") {
        console.log("VERIFY: ", this.data.signature);
        return await this.instance.verify( this.keys.public, raw, this.data.signature);
    }
    
    /**
     * Encrypta uma string para troca e mensagens RSA
     * @param raw: any  - texto ou objeto para ser encrypta
     * @return cipher: string - texto cifrado com RSA
     */
    encrypt(raw = "") {
        try {
            if(raw) { this.setRaw(raw); };

            //faz assinatura da informação que será transmitida 
            this.signature();

            if(!this.keys.public) {
                logger.message({ code: "AU0012", message: "A public key não existe" })
                return this.data.cipher;
            };

            if(!this.data.signature) {
                logger.message({ code: "AU0013", message: "A assinatura não existe" })
                return this.data.cipher;
            };

            return this.data.cipher = this.instance.encrypt(
                this.keys.public, 
                JSON.stringify(this.data.raw), 
                this.data.signature
            );

        } catch(e) {
            logger.message({error: e, code: "AU0014", message: "Erro ao encryptar os dados"});
            return this.data.cipher;
        }
    }

    /**
     * Decriptografa o conteúdo cifrado no 
     * @param cipher: string - hash cifrada apara ser decriptofrafada 
     * @return decoded: any - dados que foi envidado via criptografia
     */
    decrypt(cipher = "") {
        try {
            this.data.cipher = cipher || this.data.cipher;
            
            // testa se a chave privada existe
            if(!this.keys.private) {
                logger.message({ code: "AU0015", message: "a chave privada não existe" });
                return this.data.decoded;
            };
            
            const { message, signature }  = this.instance.decrypt(this.keys.private, this.data.cipher);

            //faz assinatura da informação que será transmitida 
            this.data.signature = signature;


            // verifica se a assinatura é autentica
            if(this.data.signature && !this.verify(message)) {
                logger.message({ code: "AU0015", message: "Esse documento não foi assinado corretamente" });
                return this.data.decoded;
            };

            return this.data.decoded = this.parse(message);
            
        } catch(e) {
            logger.message({ error: e, code: "AU0015", message: "Erro ao tentar decriptografar a cifra." })
            return this.data.decoded 
        }
    }

    /**
     * Retorna a chave publica para iniciar uma cifragem
     * @return publicKey: pem (RSA) - chave pública 
     */
    async required() {
        await this.loadKeys()
        return this.keys.public
    }

    /**
     * Ratifica o envio de uma cifra assinada com a chave pública
     * @param cipher: string - é obrigatório o envio da cifra
     * @return decoded: any - dados decriptografado com a chave privada
     */
    async ratify(cipher = "") {
        try {
            this.data.cipher = this.parse(cipher || this.data.cipher);
            await this.loadKeys()
            return this.decrypt();
        } catch (e) {
            logger.message({ error: e, code: "AU0015", message: "Não foi possóvel verificar sua autenticidade." })
            return this.data.decoded;
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

    async assembler() {
        await this.generateKeys();
        await this.writeKeys();
        await this.loadKeys();
        return this.keys;
    }
}

module.exports = Authentication;
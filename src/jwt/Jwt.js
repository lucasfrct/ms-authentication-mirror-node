const JWT = require('jsonwebtoken');
const fs = require("fs");

const logger    = require('@ms-utils-node/src/core/logger-handler');
const Err       = require('@ms-utils-node/src/core/error-handler');

/**
 * JWT - Gera uma string para toca de informação
 */
const Jwt = class Jwt {

    instance = null;

    keys     = { public: "", private: "", secret: "", token: "" };      // chaves de authentication
    paths    = { public: "", private: "", secret: "", base: "./keys", };// paths de escrita/leitura
    struct   = { header: "", payload: "", signature: "" };              // 
    headers  = { token: 'x-auth-token', bearer: 'Bearer' };
    claims   = { 
        iss: "",        // Issuer - Emissor
        sub: "",        // subject - assunto 
        aud: "",        // audiene - destinatário
        jid: "",        // ID único de JWT
        sid: "",        // session ID
        roles: "",      // permissoes
        uuid: ""        // unique user id
        // iat: "",        // hora que o jwt fio emitido
        // exp: "",        // expiration - expiração 
    }; 

    constructor() {
        this.instance = JWT;
        this.loadKeys()
    }

     /**
     * Faz a carga das chaves public, private e secret do ambiente para a classe
     * @return keys: Object -  contém todas as chaves utilizadas   
     */
    async loadKeys() {
        this.keys.secret = process.env.SECRET_KEY;
        this.keys.public = process.env.PUBLIC_KEY;
        this.keys.private = process.env.PRIVATE_KEY;
        return this.keys;
    }

    /**
     * recebe o payload, assina com a chave privada e gera um token com RSA
     * @param raw: object
     * @return token: string in base64
     */
    async rsaToken(raw = {}) {
        try {
            this.struct.payload = raw || this.struct.payload;
            await this.loadKeys();
            const params = { algorithm: 'RS256' };
            return this.keys.token = await this.instance.sign(this.struct.payload, this.keys.private, params);
        } catch(e) {
            logger.message({ error: e, message: 'Error ao assinar'});
            return "";
        }
    }

    /**
     * recebe um token com assinatura RSA, verifica se esta assinado usando a chave publica chave publica
     * @param token: string
     * @return payload: object
     */
    async rsaVerify(token = "") {
        try{
            this.keys.token = token || this.keys.token;
            await this.loadKeys();
            return  this.instance.verify(this.keys.token, this.keys.public);
        } catch(e){
            logger.message({ error: e, message: 'Error ao Assinatura inválida'});
            return "";
        }
    }

    /**
     * Cria o Token com asinatura padrao do sistema [secret_key]
     * @param raw: any - objeto claims do token
     * @return token: string - token assinado 
     */
    async token(raw = "") {
        try {
            this.struct.payload = raw || this.struct.payload;
            await this.loadKeys();
            const params = { algorithm: 'RS256' };
            return this.keys.token = await this.instance.sign(this.struct.payload, this.keys.secret);
        } catch(e) {
            return "";
        }
    }

    /**
     * recebe o token, verifica se esta assinado com a chave secreta e retorna o payload
     * @param token: string
     * @return payload: object
     */
    async verify(token = "", key = "") {
        try{
            this.keys.token = token || this.keys.token
            key = key || this.keys.secret;
            await this.loadKeys();
            return this.instance.verify(this.keys.token, key);
        } catch(e) {
            return "";
        }
    }

    /**
     * recebe o payload, assina coma chave privad e gera um jwt com RSA com tepo de expiração
     * @param raw: object
     * @return token: string in base64
     */
     async session(payload = "", time = 10) {
        try {
            this.struct.payload = payload || this.struct.payload;
            time = Number(time) || 10;
            await this.loadKeys();
            const expiresIn = (60 * time);
            const params = { algorithm: 'RS256', expiresIn };
            const claims = { ...this.claims, ...this.struct.payload };
            return this.keys.token = await this.instance.sign(claims, this.keys.private, params);
        } catch(e) {
            return "";
        }
    }

    /**
     * recebe o token, verifica se esta assinado com a chave secreta e retorna o payload
     * @param token: string
     * @return payload: object
     */
    async valid(token = "") {
        try {
            this.keys.token = token || this.keys.token
            await this.loadKeys();
            return this.instance.verify(this.keys.token, this.keys.public);
        } catch(e) {
            return {}
        }
    }

    /**
     * recebe o token, decodifica os blocos e retorna o payload
     * @param token: string
     * @return payload: object
     */
    async decode(token = "") {
        this.keys.token = token || this.keys.token
        await this.read();
        const params = { complete: true };
        this.struct = await this.instance.decode(this.keys.token, params);
        return this.struct.payload;
    }
};

module.exports = Jwt;
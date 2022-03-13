require('dotenv/config');
const fs            = require("fs");
const pathModule    = require("path");

const RSA   = require('hybrid-crypto-js').RSA;
const Crypt = require('hybrid-crypto-js').Crypt;

const handle = require('@utils/handle');
const { PathWrite, PathRead } = require('@utils/handle-path');
const { parseToJson, parseToStr } = require('@utils/parse');
const clone = require("@utils/clone");
const logger = require('@utils/logger')

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
    paths = { base: "", public: "", private: "", secret: "", signature: "" }; 

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

          this.paths.base = "./keys";
    }

    /**
     * * define um diretório para armazenar as chaves public, private e secret
     * @param   {string} path: diretório para as chaves
     * @return  {object} paths: contém todos os paths utilizados na classe
     */
    path(path = "") {
        this.paths.base         = path || this.paths.base;
        this.paths.base         = pathModule.normalize(this.paths.base);
        this.paths.public       = pathModule.normalize(`${this.paths.base}/public-key.pem`);
        this.paths.private      = pathModule.normalize(`${this.paths.base}/private-key.pem`);
        this.paths.secret       = pathModule.normalize(`${this.paths.base}/secret-key.key`);
        this.paths.signature    = pathModule.normalize(`${this.paths.base}/siginature.key`);
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
            };

            // ! extrai os dados para reflex
            const { origin: { deform: originDeform }, destiny: { deform: destinyDeform } } = formBox;
            const { origin: { public: originPublic }, destiny: { public: destinyPublic } } = keysBox;

            // ! monta o novo reflex
            this.reflex.origin  = { ...this.reflex.origin,  cipher: originDeform,   public: originPublic };
            this.reflex.destiny = { ...this.reflex.destiny, cipher: destinyDeform,  public: destinyPublic };

            // ? returna reflex
            return this.reflex;
        };


        // ! se o dado for reflex, carrega dados do cliente (origin) para formBox e keysBox
        if (data.hasOwnProperty('origin') && data.origin.hasOwnProperty('cipher')) {

            // ! extrai de reflex os dados para formbox e keysbox
            const { origin: { public: originPublic, cipher: originCipher, body: originBody  } } = data;

            // ! monta o novo keysBox
            this.keysBox.origin = { ...this.keysBox.origin, public: originPublic };

            // ! monta o novo formBox
            this.formBox.origin = {...this.formBox.origin,  deform: originCipher };

            // ! monta a nova oringem no reflex
            this.reflex.origin  = { ...this.reflex.origin,  public: originPublic, cipher: originCipher, body: originBody };

            // ? retorna reflex 
            return this.reflex;
        };

        return this.reflex = { ...this.reflex, ...data };
    }

     /**
     * ! gera o par de chaves publico/privada
     * ! gera uma chave secreta
     * ! gera uma asinatura
     * @return {object} keysBox:
     */
      async captureKeys() {
        try {
            // ! extrai o par de chaves publica/privada RSA
            const [err, { privateKey, publicKey }] = await handle(this.rsa.generateKeyPairAsync());
            if (err) {
                logger.error("Error ao gerar as chaves")
                return this.keysBox;
            };

            // ! gera uma chave IV de uma string forte de 64 caracteres e define a secret 
            const { iv: secret } = parseToJson(this.crypt.encrypt(publicKey, "De@14@Jxfjm^MiKpQP6tzKSm83xpa*vfXRi2bSjvtSFGVbwU8Yy&9K*&soIT5ft&EIS"));

            // ! gera uma chave de assinatura
            const { signature }  = parseToJson(await this.crypt.signature(privateKey, secret));

             // ! cria novo o objeto de chaves do servidor
            this.keysBox.destiny = { public: publicKey, private: privateKey, secret, signature };
            
            // ? returna o objeto de chaves
            return this.keysBox
        } catch (e) {
            // TODO: logger
            logger.error(e);
            return this.keysBox;
        }
    }

    /**
     * * escreve as chaves publica, privada e secreta em arquivos no disco
     * @param   {string} path: define um diretório para guardar as chaves
     * @returns {object} keysBox:
     */
    async writeKeys(path = "") {
        
        try {
            // ! define um diretório para armazenar as chaves
            this.path(path);

            const [errPub, respPub]     = await handle(PathWrite(this.paths.public, this.keysBox.destiny.public));
            const [errSec, respSec]     = await handle(PathWrite(this.paths.secret, this.keysBox.destiny.secret));
            const [errSig, respSig]     = await handle(PathWrite(this.paths.signature, this.keysBox.destiny.signature));
            const [errPriv, respPriv]   = await handle(PathWrite(this.paths.private, this.keysBox.destiny.private));

            return this.keysBox;
            
        } catch (e) {
            // TODO: logger
            logger.error(e);
            return this.keysBox;
        };
      }

    /**
     * * lê o valor das chaves no disco e passa para as variaveis de ambiente
     * @param  {string} path: define um diretório para ler as chaves
     * @return {object} keysBox:  
     */
    async readKeys(path = "") {
        try {
            // ! define um diretório para ler as chaves
            this.path(path);

            const [errPub, publicKey]   = await handle(PathRead(this.paths.public));
            const [errSec, secretKey]   = await handle(PathRead(this.paths.secret));
            const [errSig, signature]   = await handle(PathRead(this.paths.signature));
            const [errPriv, privateKey] = await handle(PathRead(this.paths.private));

            process.env.SIGNATURE   = signature || "" ;
            process.env.PUBLIC_KEY  = publicKey || "" ; 
            process.env.SECRET_KEY  =  secretKey || "" ;
            process.env.PRIVATE_KEY = privateKey || "" ;

            return this.keysBox;

        } catch (e) {
            logger.error(e);
            return this.keysBox;
        };
    }

    /**
     * * carrega as chaves armazenadas nas variaveis de ambiente para  a classe 
     * @return {object} keysBox
     */
     async loadKeys() {

         const that = this;
         // ! se não houver chave publica na classe, faz uma leitura do ambiente
         if (this.keysBox.destiny.public.length < 814) {
            await loadEnvironmentToClass();
        };
        
        // ! se não houver chave publica no ambiente, faz a leitura do disco
        if(!process.env.PUBLIC_KEY || process.env.PUBLIC_KEY && process.env.PUBLIC_KEY.length < 814) { 
            await this.readKeys();
            await loadEnvironmentToClass();
        };
        
        // ! se não houver chave publica no disco, gera um novo par de chaves
        if(!process.env.PUBLIC_KEY || process.env.PUBLIC_KEY && process.env.PUBLIC_KEY.length < 814) { 
            await this.captureKeys();
            await this.writeKeys();
            await this.readKeys();
            await loadEnvironmentToClass();
        };

        // ? retorna as chaves
        return this.keysBox;

        // ! carrega as chaves do ambiente para a classe
        async function loadEnvironmentToClass() { 
            that.keysBox.destiny.public     = process.env.PUBLIC_KEY || "";
            that.keysBox.destiny.secret     = process.env.SECRET_KEY || "";
            that.keysBox.destiny.private    = process.env.PRIVATE_KEY || "";
            that.keysBox.destiny.signature  = process.env.SIGNATURE || "";
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
            if (!this.keysBox.destiny.private.length < 3294) {
                logger.error("Erro, a chave privada não existe");
                return this.keysBox.destiny.signature;
            };

            // ! converte para string
            const dataString = parseToStr(this.raw(raw));

             // ! faz a assinatura do dado e extrai do JSON a assinnatura
            const { signature } = parseToJson(this.crypt.signature(this.keysBox.destiny.private, dataString));
            
            // ? retorna a assinatura
            return this.keysBox.destiny.signature = signature;

        } catch (e) {
            logger.error(e);
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
            if (origin.length != 814) {
                logger.error("Erro, a chave publica não existe");
                return this.formBox.destiny.deform;
            }

            // ! converte para string
            const dataString = parseToStr(this.raw(raw));

            // ! faz assinatura 
            const signature = await this.signature(dataString);

            // ! cria uma cifra no servidor com a chave do cliente
            return this.formBox.destiny.deform = this.crypt.encrypt(origin, dataString, signature);

        } catch (e) {
            logger.error(e);
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
            if (privateKey.length < 3294) {
                logger.error("Erro, a chave privada não existe");
                return this.formBox.origin.reform;
            };

            if(this.formBox.origin.deform.indexOf("hybrid-crypto") == -1) {
                logger.error("Erro, a chave privada não existe");
                return this.formBox.origin.reform;
            }
            
            // ! faz a decigragem da string enviada pelo cliente
            const { message, signature } = this.crypt.decrypt(privateKey, this.formBox.origin.deform);
            
            // ! carrega a assinatura do cliente
            this.keysBox.origin.signature = signature;
            
            // !!! verify ainda não está funcional !!!
            // ! verifica se a assinatura é autentica
            // if (this.keysBox.origin.signature && !this.verify(message)) {
            //     logger.error("Erro, documento com assinatura inválida");
            // }

            // ? retorna a informação decigrada
            return this.formBox.origin.reform = message;
        } catch (e) {
            logger.error(e);
            return this.formBox.origin.reform
        }
    }

    /**
     * 
     *  ! Troca as chaves publicas entre cliente e servidor
     * @param   {object} reflex: objeto do cliente 
     * @returns {object} reflex: objeto da classe
     */
    async reflect(reflex = {}) {

        // ! carrega as chaves para o servidor
        await this.loadKeys();
        
        // ! carrega a chave pública do cliente para dentro da classe do servidor
        this.match(reflex);

        // ! carrega a chave publica do servidor para dentro do reflex
        this.match(this.keysBox);
        
        // ? response as chaves públicas para o cliente
        return this.reflex;
    }

    /**
     * * decrifra uma cifra do cliente com a chave privada do servidor
     * * o cliente cifrou um dado com a chave publica ado servidor
     * @param {object} reflex 
     * @returns 
     */
     async keep(reflex = {}) {
 
        // ! carreaga os dados da requisicao para o servidor
        await this.reflect(reflex);

        // ! Decrypta uma cifra recebida do cliente com a chave privada do servidor
        await this.reform();

        // ? response o mesmo reflex sem alteração para o cliente
        return this.reflex;
    }

   /**
     * * recebe uma cifra do cliente e decifra o dado com a chave privado do servidor 
     * * cifra um dado com a pública do cliente e responde no reflex
     * @param   {object} reflex: objeto do cliente
     * @return  {object} reflex: objeto da classe
     */
    async distort(reflex = {}) {
       
        // ! decifra os dados do do cliente coma chave privada do servidor
        await this.keep(reflex);

        // ! cifra um dado do servidor com a chave pública do cliente
        await this.deform();

        // ! insere a cifra feita no servidor dentro reflex
        this.match(this.formBox);

        // ? response num nova cifra para o cliente
        return this.reflex;
    }

    /**
     * * recebe uma chave pública um dado do cliente para ser cifrado
     * * cifra o dado do cliente coma chave pública do cliente e retorna no reflex
     * @param   {object} reflex: objeto do cliente
     * @return  {object} reflex: objeto da classe
     */
    async reveal(reflex = {}) {
      
        // ! carreaga os dados da requisicao para o servidor
        await this.reflect(reflex);

        // ! salva os estados dos objetos KeysBox e formBox
        const image = this.photo();

        // ! extrai raw do reflex enviado pelo cliente
        const { origin: { body: { raw } } } = this.reflex;
        
        // ! cifra um dado com a chave pública do cliente
        const deform  = await this.deform(raw);

        // ! restaura o estado dos objetos formBox e keysBox
        await this.photo(image);

        this.formBox.origin.deform = deform;
        this.formBox.origin.raw = raw;
        
        // ! carega a cifra para dentro de reflex
        this.match(this.formBox);
        
        // ? response num nova cifra para o cliente
        return this.reflex;
    }

     /**
     * * recebe uma cifra do cliente e decifra o dado com a chave privado do servidor 
     * * cifra um dado com a pública do cliente e responde no reflex
     * @param   {object} reflex: objeto do cliente
     * @return  {object} reflex: objeto da classe
     */
      async distort(reflex = {}) {
       
        // ! decifra os dados do do cliente coma chave privada do servidor
        await this.keep(reflex);

        // ! cifra um dado do servidor com a chave pública do cliente
        await this.deform();

        // ! insere a cifra feita no servidor dentro reflex
        this.match(this.formBox);

        // ? response num nova cifra para o cliente
        return this.reflex;
    }
  
    /**
     * * Salva o estado dos objetos formBox e keysBox para reseta-los após uso
     * @param  {object} image: 
     * @return {object} image:
     */
    photo(image = undefined) {
        // ! Se houver uma imagem carrega no keysBox e formBox o estado anterior
        if (image) {
            this.keysBox = image.keysBox;
            this.formBox = image.formBox;
            return image;
        };

        // ! Retorna o estado atual dos objetos
        return clone({ keysBox: this.keysBox, formBox: this.formBox });
    }
}

module.exports = AuthenticationMirror;
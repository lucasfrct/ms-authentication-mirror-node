/**
 * * Classe usada pelo cliente para gerar suporte a autenticação
 */
class AuthenticationClientMirror {
    rsa = null; // ! classe para gerar RSA
    crypt = null; // ! classe para encryptar

    headers = ["x-api-token", "Bearer", "authorization"]; // cabeçalhos que serão aceitos
    client = { protocol: "", host: "", uri: "", url: "" }; // dados da URL
    keysBox = { public: "", private: "", secret: "", signature: "", image: "", destiny: "" }; // ! chaves

    // ? armazena dos dados para a classe
    formBox = {
        raw: "",
        reform: { origin: "", image: "", destiny: "" },
        deform: { origin: "", image: "", destiny: "" },
    };

    // ? payload de troca com o servidor
    reflex = {
        origin: { public: "", cipher: "", raw: "" }, // browser
        image: { public: "", cipher: "", raw: "" }, // servidor local
        destiny: { public: "", cipher: "", raw: "" }, // servidor remoto
        body: ""
    };

    // ? parametros da requisição
    params = {
        type: "GET",
        contentType: "application/json; charset=utf-8",
    };

    // ! inicia a classe
    constructor() {
        this.rsa = new RSA({ keySize: 4096 });
        this.crypt = new Crypt({ md: "sha512" });
    }

    /**
     * * carrega os dados para serem encriptados
     * @param raw: any
     */
    setRaw(raw = "") {
        return (this.formBox.raw = raw || this.formBox.raw);
    }

    /**
     * * carrega o payload reflex na classe
     * @paoram {*} reflex
     * @returns
     */
    setReflex(reflex = null) {
        return (this.reflex = reflex || this.reflex);
    }

    /**
     * ! carrega a public key do cliente na classe
     * @param {*} publicKey
     * @returns
     */
    setPublic(publicKey = "") {
        this.reflex.origin.public = publicKey || this.reflex.origin.public;
        return (this.keysBox.public = publicKey || this.keysBox.public);
    }


    /**
     * ! carrega a public key do servidor na classe
     * @param {*} publicKey
     * @returns
     */
    setImage(publicKey = "") {
        this.reflex.image.public = publicKey || this.reflex.image.public;
        return (this.keysBox.image = publicKey || this.keysBox.image);
    }

    /**
     * ! carrega a public key do cliente parceiro na classe
     * @param {*} publicKey 
     * @returns 
     */
    setDestinity(publicKey = "") {
        this.reflex.destiny.public = publicKey || this.reflex.destiny.public;
        return (this.keysBox.destiny = publicKey || this.keysBox.destiny);
    }

    /**
     *  ! carrega a cifra do servidor na classe 
     * @param {*} cipher
     * @returns
     */
    setDeformImage(cipher = "") {
        this.reflex.image.cipher = cipher || this.reflex.image.cipher;
        return (this.formBox.deform.image = cipher || this.formBox.deform.image);
    }

    /**
     *  ! carrega a cifra do cliente
     * @param {*} cipher 
     * @returns 
     */
    setDeformOrigin(cipher = "") {
        this.reflex.origin.cipher = cipher || this.reflex.origin.cipher;
        return this.formBox.deform.origin = cipher || this.formBox.deform.origin
    }

    /**
     *  * carrega o dado reformado do servidor na classe
     * @param {*} raw 
     * @returns 
     */
    setReformImage(raw = "") {
        this.reflex.image.raw = raw || this.reflex.image.raw;
        return (this.formBox.reform.image = raw || this.formBox.reform.image);
    }

    /**
     * * configura uma URI para uma requisição
     * @param {*} uri
     * @returns
     */
    setUrl(uri = "") {
        this.client.uri = uri || this.client.uri;
        this.client.protocol = window.location.protocol;
        this.client.host = window.location.host;
        this.client.url = `${this.client.protocol}//${this.client.host}${this.client.uri}`;
        return this.client.url;
    }

    /**
     * ! gera um par de chaves, desconstroi o iv e os armazena no keysBox
     * @returns keysBox: object
     */
    async captureKeys() {
        try {
            // ! extrai o par de chaves publica/privada RSA
            const { publicKey, privateKey } = await this.rsa.generateKeyPairAsync();

            // ! gera uma chave IV de uma string forte de 64 caracteres
            const { iv } = this.parse(this.crypt.encrypt(publicKey, "De@14@Jxfjm^MiKpQP6tzKSm83xpa*vfXRi2bSjvtSFGVbwU8Yy&9K*&soIT5ft&EIS"));

            // ! gera uma chave secreta auto-assinada
            const sercretKey = await this.crypt.signature(this.keysBox.private, iv);

            // ? armazena as chaves na classe
            return (this.keysBox = {...this.keysBox, public: publicKey, private: privateKey, secret: sercretKey });
        } catch (e) {
            console.error("Não foi possível gerar o par de chaves: ", e);
            return this.keysBox;
        }
    }

    /**
     * * Escreve as chaves publica, privada e secreta no localStorage do navegador
     * @returns keysBox: object
     */
    async writeKeys() {
        localStorage.setItem("AuthenticateMirrorPublicKey", this.keysBox.public);
        localStorage.setItem("AuthenticateMirrorPrivateKey", this.keysBox.private);
        localStorage.setItem("AuthenticateMirrorSecretKey", this.keysBox.secret);
        return this.keysBox;
    }

    /**
     * * Lê o valor das chaves no localStorage do navegador e passa para o objeto da classe
     * @returns keysBox: object
     */
    async readKeys() {
        this.keysBox.public = localStorage.getItem("AuthenticateMirrorPublicKey") || "";
        this.keysBox.private = localStorage.getItem("AuthenticateMirrorPrivateKey") || "";
        this.keysBox.secret = localStorage.getItem("AuthenticateMirrorSecretKey") || "";
        return this.keysBox;
    }

    /**
     *
     */
    async loadKeys() {
        // ! se não houver chave pública faz a leitura das chaves
        if (this.keysBox.public.length < 64) {
            await this.readKeys();
        }

        // ! se não houver chaves para serem lidas então gera novas chaves
        if (this.keysBox.public.length < 64) {
            await this.captureKeys();
            await this.writeKeys();
        }

        // ? return das chaves para solicitação
        this.keysBox;
    }

    /**
     * ! assina um string
     * @param {*} raw
     * @returns
     */
    async signature(raw = "") {
        try {

            // ! se não houver chave privada, não faz a assinatura
            if (this.keysBox.private.length < 64) {
                return this.keysBox.signature;
            }

            // ! converte para string
            const dataString = this.parseStr(this.setRaw(raw));

            // ! faz a assinatura do dado e extrai do JSON a assinnatura
            const { signature } = this.parse(this.crypt.signature(this.keysBox.private, dataString));

            // ? retorna a assinatura
            return (this.keysBox.signature = signature);
        } catch (e) {
            console.error(e);
            return this.keysBox.signature;
        }
    }


    /**
     * ! verifica se uma string foi assinada
     * @param {*} raw
     * @returns
     */
    async verify(raw = "") {
        return await this.crypt.verify(this.keysBox.public, this.setRaw(raw), this.keysBox.signature);
    }

    /**
     * ! Encrypta os dados com a public Key do servidor no padrão RSA
     * @param raw: any
     * @return cipher: string - hash cifrada
     */
    async deform(raw = "") {
        try {

            // ! carrega a chave pública do servidor
            const image = this.setImage();

            // ! se não houver chave pública do servidor, nã faz a cifragem 
            if (image.length < 64) {
                console.error("Erro, a chave publica não existe");
                return this.setDeformOrigin();
            }

            // ! converte par string
            const dataString = this.parseStr(this.setRaw(raw));

            // ! faz assinatura
            const signature = this.signature(dataString);

            // ! criar uma crifra no cliente com a chave do servidor
            return this.setDeformOrigin(this.crypt.encrypt(image, dataString, signature));
        } catch (e) {
            console.error("Error ao deforma um dado: ", e);
            return this.setDeformOrigin();
        }
    }

    /**
     * ! Decrypta uma cifra do servidor com a chave privada do cliente no padrão RSA
     * @param cipher: string - hash cifrada
     * @return raw: any
     */
    async reform(cipher = "") {
        try {

            // ! pega a chave privada do client
            const privateKey = this.keysBox.private;

            // ! se não houver chave privada do cliente, não faz a decifragem
            if (privateKey.length < 64) {
                console.error("Erro, a chave privada não existe");
                return this.setReformImage()
            }

            // ! faz a decigragem a string enviada do servidor
            const { message, signature } = this.crypt.decrypt(privateKey, this.setDeformImage(cipher));

            // ! carrega a assinatura
            this.keysBox.signature = signature;

            // ! verifica se a assinatura é autentica
            if (this.keysBox.signature && !this.verify(message)) {
                console.error("Erro, documento com assinatura inválida");
                return this.setReformImage()
            }

            // ? retorna a informação decigrada
            return this.setReformImage(this.parse(message));
        } catch (e) {
            console.error("Error ao tentar decifra a=o dado");
            return this.setReformImage();
        }
    }

    /**
     * * Envia dados com o Verbo POST
     * @param reflex: JSON - precisa ser uma JSON passar na requisicao
     * @return payload: JSON
     */
    async send(reflex = "") {
        try {

            // ! configura a requisição
            this.params.data = this.parseStr(this.setReflex(reflex));
            this.params.type = "POST";
            this.params.url = this.setUrl();

            // ? faz a requição ao servidor
            return this.setReflex(await $.ajax(this.params))
        } catch (e) {
            console.error("Error ao tentar acessar o servidor: ", e);
            return this.setReflex();
        }
    }

    /**
     * * Faz uma requisicao ao servidor com o verbo GET
     * @return public key: string
     */
    async get(reflex = "") {
        try {

            // ! configura a requisição
            this.params.data = this.parseStr(this.setReflex(reflex));
            this.params.type = "GET";
            this.params.url = this.setUrl();

            // ? faz a requição ao servidor
            return this.setReflex(await $.ajax(this.params))
        } catch (e) {
            console.error("Error ao tentar acessar o servidor: ", e);
            return this.setReflex();
        }
    }

    /**
     *  ! Troca as chaves publicas entre cliente e servidor
     * @param {*} reflex 
     * @returns 
     */
    async reflect(reflex = "") {
        // ! define uma rota
        this.setUrl("/authenticate/mirror/reflect");

        // ! carega as chaves para o cliente
        await this.loadKeys();

        // ! carrega o objeto de troca para para a classe
        this.setReflex(reflex);

        // ! carrega a chave publica para dentro do reflex
        this.setPublic(this.keysBox.public)

        // ! envia as chaves para o servidor
        await this.send();

        // ! carrega a cha
        this.setImage(this.reflex.image.public)
        return this.reflex;
    }

    async distort(reflex = "") {
        this.setUrl("/authenticate/mirror/distort");
        this.setReflex(reflex);
        return await this.send();
    }

    async keep() {
        this.setUrl("/authenticate/mirror/keep");
        await this.deform();
        this.reflex.origin.cipher = this.formBox.deform.origin;
        return this.send();
    }

    async reveal(raw = "") {
        this.setUrl("/authenticate/mirror/reveal");
        await this.readKeys();
        // this.reflex.origin.public = this.keysBox.public;
        this.reflex.origin.raw = this.setRaw(raw);
        return await this.send();
    }

    async refraction() {
        this.setUrl("/authenticate/mirror/refraction");
        const response = await this.send();
        this.setReflex(response);
        this.formBox.deform.image = this.reflex.image.cipher;
        await this.readKeys();
        return await this.reform(this.formBox.deform.image);
    }

    /**
     * Transforma um texto em hash
     * @param raw: string
     * @return txt: string
     */
    hash(raw = "") {
        return sha512(raw);
    }

    /**
     * faz um parse par json
     * @param {*} payload
     * @returns
     */
    parse(payload = "") {
        try {
            return JSON.parse(payload);
        } catch (e) {
            return payload;
        }
    }

    /**
     *  Passa um dado Json para string
     * @param {*} data 
     * @returns 
     */
    parseStr(data = "") {
        if (typeof data === "string") {
            return data;
        }

        try {
            return JSON.stringify(data);
        } catch (e) {
            return data;
        }

    }
}
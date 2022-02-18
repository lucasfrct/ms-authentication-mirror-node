/**
 * * Classe usada pelo cliente para gerar suporte a autenticação
 */
class AuthenticationClientMirror {
    rsa = null; // ! classe para gerar RSA
    crypt = null; // ! classe para encryptar

    // * estrutura da url
    client = { protocol: "", host: "", uri: "", url: "" };

    // ? Armazena as chaves das entidades
    keysBox = {
        origin: { public: "", private: "", secret: "", signature: "" },
        image: { public: "", private: "", secret: "", signature: "" },
        destinity: { public: "", private: "", secret: "", signature: "" }
    };

    // ? armazena dos dados das entidades
    formBox = {
        origin: { reform: "", deform: "", raw: "" },
        image: { reform: "", deform: "", raw: "" },
        destinity: { reform: "", deform: "", raw: "" },
    };

    // ? payload de troca com o servidor
    // ? armazena os dados das entidades
    reflex = {
        origin: { public: "", cipher: "", raw: "" }, // browser
        image: { public: "", cipher: "", raw: "" }, // servidor local
        destiny: { public: "", cipher: "", raw: "" }, // servidor remoto
    };

    // ? parametros da requisição
    params = {
        type: "GET",
        contentType: "application/json; charset=utf-8",
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
     * @param {String} uri
     * @returns {String} url
     */
    url(uri = "") {
        this.client.uri = uri || this.client.uri;
        this.client.protocol = window.location.protocol;
        this.client.host = window.location.host;
        this.client.url = `${this.client.protocol}//${this.client.host}${this.client.uri}`;
        return this.client.url;
    }

    /**
     * * carrega os dados para a classe
     * @param {*} raw: any
     * @return {*} raw
     */
    raw(raw = "") {
        return (this.formBox.origin.raw = raw || this.formBox.origin.raw);
    }

    /**
     * * carrega o payload reflex na classe
     * @param {Object} reflex
     * @returns {Object} reflex
     */
    setReflex(reflex = {}) {
        return this.reflex = {...this.reflex, ...reflex };
    }

    /**
     * * combina os objetos reflex com formBox e keysBox
     * @param {*} data 
     * @returns {*} data
     */
    match(data = {}) {

        // ! se o dado for formBox, carregada para reflex
        if (data.hasOwnProperty('origin') && data.origin.hasOwnProperty("reform")) {

            // ! extrai os dados para reflex
            const { origin: { raw: or, deform: od }, image: { raw: ir, deform: id }, destinity: { raw: dr, deform: dd } } = this.formBox;
            const { origin: { public: op }, image: { public: ip }, destinity: { public: dp } } = this.keysBox;

            // ! monta o novo reflex
            const reflex = {
                origin: { raw: or, cipher: od, public: op },
                image: { raw: ir, cipher: id, public: ip },
                destinity: { raw: dr, cipher: dd, public: dp },
            }

            // ? combina e retorn um reflex preenchido 
            return this.reflex = {...this.reflex, ...reflex };
        }

        // ! se o dado for reflex, carrega para formBox e keysBox
        if (data.hasOwnProperty('origin') && data.origin.hasOwnProperty('cipher')) {

            // ! extrai de reflex os dados para formbox e keysbox
            const {
                origin: { raw: or, cipher: oc, public: op },
                image: { raw: ir, cipher: ic, public: ip },
                destinity: { raw: dr, cipher: dc, public: dp }
            } = this.reflex;

            // ! monta o novo keysbox
            const keysBox = { origin: { public: op }, image: { public: ip }, destinity: { public: dp } };

            // ! combina o keysbox
            this.keysBox = {...this.keysBox, ...keysBox };

            // ! monta o novo form box
            const formBox = {
                origin: { raw: or, deform: oc },
                image: { raw: ir, deform: ic },
                destinity: { raw: dr, deform: dc }
            };

            // ? combina e retorna form box
            return this.formBox = {...this.formBox, ...formBox }
        }
        return data;
    }

    /**
     * ! gera um par de chaves, desconstroi o iv e os armazena no keysBox
     * @returns keysBox: object
     */
    async captureKeys() {
        try {
            // ! extrai o par de chaves publica/privada RSA
            const { publicKey, privateKey } = await this.rsa.generateKeyPairAsync();

            // ! gera uma chave IV de uma string forte de 64 caracteres e define a secret 
            const { iv: secret } = this.parse(this.crypt.encrypt(publicKey, "De@14@Jxfjm^MiKpQP6tzKSm83xpa*vfXRi2bSjvtSFGVbwU8Yy&9K*&soIT5ft&EIS"));

            // ! gera uma chave de assinatura
            const signature = await this.crypt.signature(this.keysBox.private, secret);

            // ! cria novo o objeto de chaves da origem
            this.keysBox.origin = { public: publicKey, private: privateKey, secret, signature };

            // ? returna o objeto de chaves
            return this.keysBox
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
        localStorage.setItem("AuthenticateMirrorPublicKey", this.keysBox.origin.public);
        localStorage.setItem("AuthenticateMirrorPrivateKey", this.keysBox.origin.private);
        localStorage.setItem("AuthenticateMirrorSecretKey", this.keysBox.origin.secret);
        localStorage.setItem("AuthenticateMirrorSignature", this.keysBox.origin.signature);

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
        this.keysBox.signature = localStorage.getItem("AuthenticateMirrorSignature") || "";

        return this.keysBox;
    }

    /**
     * carrega as chaves para a classe
     */
    async loadKeys() {
        // ! se não houver chave pública faz a leitura das chaves
        if (this.keysBox.origin.public.length < 64) {
            await this.readKeys();
        }

        // ! se não houver chaves para serem lidas então gera novas chaves
        if (this.keysBox.origin.public.length < 64) {
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
            if (this.keysBox.origin.private.length < 64) {
                return this.keysBox.origin.signature;
            }

            // ! converte para string
            const dataString = this.parseStr(this.row(raw));

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
     * @param {*} raw
     * @returns
     */
    async verify(raw = "") {
        return await this.crypt.verify(this.keysBox.origin.public, this.row(raw), this.keysBox.origin.signature);
    }

    /**
     * ! Encrypta os dados com a public Key do servidor no padrão RSA
     * @param raw: any
     * @return cipher: string - hash cifrada
     */
    async deform(raw = "") {
        try {

            // ! carrega a chave pública do servidor
            const image = this.keysBox.image.public;

            // ! se não houver chave pública do servidor, não faz a cifragem 
            if (image.length < 64) {
                console.error("Erro, a chave publica não existe");
                return this.formBox.origin.deform;
            }

            // ! converte para string
            const dataString = this.parseStr(this.row(raw));

            // ! faz assinatura
            const signature = this.signature(dataString);

            // ! cria uma crifra no cliente com a chave pública do servidor
            return this.formBox.origin.deform = this.crypt.encrypt(image, dataString, signature);
        } catch (e) {
            console.error("Error ao deforma um dado: ", e);
            return this.formBox.origin.deform;
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
            this.params.url = this.url();

            // ? faz a requição ao servidor
            return this.setReflex(await $.ajax(this.params))
        } catch (e) {
            console.error("Error ao tentar acessar o servidor: ", e);
            return this.setReflex();
        }
    }

    /**
     * * Faz uma requisicao ao servidor com o verbo GET
     * @param {Object} reflex: 
     * @return reflex key: string
     */
    async get(reflex = "") {
        try {

            // ! configura a requisição
            this.params.data = this.parseStr(this.setReflex(reflex));
            this.params.type = "GET";
            this.params.url = this.url();

            // ? faz a requição ao servidor
            return this.setReflex(await $.ajax(this.params))
        } catch (e) {
            console.error("Error ao tentar acessar o servidor: ", e);
            return this.setReflex();
        }
    }

    /**
     *  ! Troca as chaves publicas entre cliente e servidor
     * @param {Object} reflex 
     * @returns reflex
     */
    async reflect(reflex = "") {
        // ! define uma rota
        this.url("/authenticate/mirror/reflect");

        // ! carrega as chaves para o cliente
        await this.loadKeys();

        // ! carrega o objeto de troca para para a classe
        this.setReflex(reflex);

        // ! carrega a chave publica para dentro do reflex
        this.setPublicKey(this.keysBox.public);

        // ! envia as chaves para o servidor
        await this.send();

        // ! carrega a chave publica do servidor para a classe
        this.setImageKey(this.reflex.image.public);

        // ? retorna o payload da requisicão
        return this.reflex;
    }

    /**
     * * faz postagem do cliente no servidor
     * * um dado no cliente é cifrado com a public Key do servidor
     * @param {*} reflex 
     * @returns 
     */
    async distort(reflex = "") {
        // ! define a url do servidor
        this.url("/authenticate/mirror/distort");

        // ! se houver payload, substitui o payload da classe
        this.setReflex(reflex);

        // ? faz o envio e recebe a resposta  em um reflex
        return await this.send();
    }

    /**
     * * faz uma postagem do cliente no servidor
     * * crifa um dado do cliente com a chave publica do servidor
     * @returns reflex
     */
    async keep() {
        // ! define a url do servidor
        this.url("/authenticate/mirror/keep");

        // ! cifra um dodo do clinente com a chave publica do servidor
        await this.deform();

        // ! carrega a cifra para o payload
        this.setDeformOrigin(this.formBox.deform.origin);

        // ? faz o envio da cifr e recebe a resposta em um reflex
        return this.send();
    }

    /**
     * *
     * @param {*} raw 
     * @returns 
     */
    async reveal(raw = "") {

        // ! Carreada um dado para a classe
        this.row(raw);

        // ! define a url do servidor
        this.url("/authenticate/mirror/reveal");

        // ! carraga das chaves publica e privada do cliente para dentro da classe
        await this.loadKeys();

        // ! carrega a chave pública para o payload
        this.setPublicKey(this.keysBox.public)

        // ! carrega o dado do cliente para o payload
        this.setReformOrigin(this.formBox.reform.origin)

        // ?  // ? faz o envio para o servidor e recebe a resposta em um reflex
        return await this.send();
    }

    /**
     * faz o envido de uma dadoa para o servidor
     * @returns 
     */
    async refraction() {
        // ! define a url do servidor
        this.url("/authenticate/mirror/refraction");

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
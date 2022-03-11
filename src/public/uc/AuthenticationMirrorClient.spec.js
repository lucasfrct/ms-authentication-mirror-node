(async() => {
    
    await test("Encriptação disponível", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
        ctx.assert("A classe contem a library RSA", (auth.rsa !== null), true);
        ctx.assert("A classe contem a library Crypt", (auth.crypt !== null), true);
    });

    await test("Metodo: uri(string)", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
        const url = auth.uri("/authenticate");
        ctx.assert("uri carregada com sucesso!", (url.indexOf("/authenticate") !== -1), true);
    });

    await test("Metodo: host(string)", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
        const host = "http://localhost:5001";
        const hosttest = auth.host(host);
        ctx.assert("host carregado com sucesso!", hosttest, host );
    });

    await test("Metodo: raw(*)", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
        const raw = "raw";
        auth.raw("raw");
        ctx.assert("dado raw", auth.formBox.origin.raw, raw);
    });

    await test("Metodo: setReflex(reflex)", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
        
        const reflex = {
            origin:  { public: "ogirin-public",  cipher: "origin-cipher" },
            destiny: { public: "destiny-public", cipher: "detiny-cipher" }, 
        };

        auth.setReflex(reflex);

        ctx.assert("Repflex foi setado", auth.reflex.origin.public, reflex.origin.public);
    });

    await test("Metodo: match(reflex || formBox || keysBox)", async(ctx)=>{

        // ! reflex
        const reflex = {
            origin:  { public: "ogirin-public",  cipher: "origin-cipher" },
            destiny: { public: "destiny-public", cipher: "detiny-cipher" }, 
        };

        const auth1 = new AuthenticationMirrorClient();
        auth1.match(reflex);
        ctx.assert("Reflex insert keysBox", auth1.keysBox.origin.public, reflex.origin.public);
        ctx.assert("Reflex insert formBox", auth1.formBox.origin.deform, reflex.origin.cipher);

        // ! formBox
        const formBox = {
            origin:  { reform: "origin-reform",  deform: "origin-deform",  raw: "origin-raw" },
            destiny: { reform: "destiny-reform", deform: "destiny-deform", raw: "destiny-raw" },
        };

        const auth2 = new AuthenticationMirrorClient();
        auth2.match(formBox);
        ctx.assert("formBox insert reflex", auth2.reflex.origin.cipher, formBox.origin.deform);
        
        // ! keysBox
        const keysBox = {
            origin:     { public: "origin-public", private: "origin-private", secret: "origin-secret", signature: "origin-signature" },
            destiny:    { public: "destiny-public", signature: "destiny-signature" }
        };

        const auth3 = new AuthenticationMirrorClient();
        auth3.match(keysBox);
        ctx.assert("keysBox insert reflex", auth3.reflex.origin.public, keysBox.origin.public);

    });

    await test("Metodo: captureKeys()", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
    
        const keys = await auth.captureKeys();

        ctx.assert("PUBLIC KEY", (keys.origin.public.length > 64), true);
        ctx.assert("PRIVATE KEY", (keys.origin.private.length > 64), true);
        ctx.assert("SECRET KEY", (keys.origin.secret.length > 12), true);
        ctx.assert("SIGNATURE", (keys.origin.signature.length > 64), true);

    });

    await test("Metodo: writeKeys()", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
        
        const keys = await auth.captureKeys();
        await auth.writeKeys();
        const public = await localStorage.getItem('AuthenticateMirrorPublicKey');

        ctx.assert("Chaves escritas com sucesso", keys.origin.public, public);

    });

    await test("Metodo: readKeys()", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
        
        const keys = await auth.captureKeys();
        await auth.writeKeys();
        const keysBox = await auth.readKeys();

        ctx.assert("Chaves lidas com sucesso", keys.origin.public, keysBox.origin.public);

    });

    await test("Metodo: loadKeys()", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
        
        const keysBox = await auth.loadKeys();

        ctx.assert("Chaves carreagadas com sucesso", (keysBox.origin.public.length > 64), true);

    });

    await test("Metodo: signature()", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();

        keysBox = await auth.loadKeys();

        const signature = await auth.signature("spec");

        ctx.assert("Dado assinado com sucesso", (signature.length > 64), true);

    });

    // ! ainda não foi possíve testar verify
    // await test("Metodo: verify()", async(ctx)=>{
        // const auth = new AuthenticationMirrorClient();
        // keysBox = await auth.loadKeys();
        // const msg = "spec";
        // const signature = await auth.signature(msg);
        // const verify = await auth.verify(msg);
        // ctx.assert("Ainda não foi possível testar", true, true);
    // });

    await test("Metodo: deform()", async(ctx)=>{

        const auth = new AuthenticationMirrorClient();
        const keysBox = await auth.loadKeys();
        auth.keysBox.destiny.public = keysBox.origin.public
        const encrypt = await auth.deform("raw");

        const { iv } = JSON.parse(encrypt);
        
        ctx.assert("Dados encriptados com sucesso", (encrypt.length > 64 && iv.length > 10), true);
    });

    await test("Metodo: reform()", async(ctx)=>{
        
        const auth = new AuthenticationMirrorClient();
        const keysBox = await auth.loadKeys();
        auth.keysBox.destiny.public = keysBox.origin.public;

        const data = "raw";

        const encrypt = await auth.deform(data);

        const decrypted = await auth.reform(encrypt);

        ctx.assert("Dados decriptados com sucesso", decrypted, data);

    });

    await test("Metodo: send(reflex)", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
        auth.host("http://localhost:5001");

        // ! reflex
        const reflex = {
            origin:  { public: "ogirin-public",  cipher: "origin-cipher" },
            destiny: { public: "destiny-public", cipher: "detiny-cipher" }, 
        };

        auth.uri("/healthz");
        const res = await auth.send(reflex);
        ctx.assert("Dados postados com sucesso", (res.hasOwnProperty("healthz") && res.method == "POST"), true);
    });

    await test("Metodo: get()", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
        auth.host("http://localhost:5001");
        auth.uri("/healthz");
        const res = await auth.get();
        ctx.assert("Dados obtidos com sucesso", (res.hasOwnProperty("healthz") && res.method == "GET"), true);
    });

    await test("Metodo: reflect()", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
        auth.host("http://localhost:5001");
        
        await auth.reflect(auth.reflex);

        const testOrigin = auth.keysBox.origin.public == auth.reflex.origin.public;
        const testClient = auth.keysBox.destiny.public.length == 814;
        const test = testOrigin && testClient;
        
        ctx.assert('envia a chave publica do cliente e recebe a chave publica do servidor', test, true);
    });

    // describe("Método: keep(reflex: object)", ()=> {
    //     jest.setTimeout(20000);
    
    //     let auth, paths, keys, text, deform;
    
    //     let reflex = {
    //         origin:  { public: "ogirin-public",  cipher: "" },
    //         destiny: { public: "", cipher: "" }, 
    //     };
        
    //     it('preparando ambiente para testar Keep', async() => {
    //         auth = new AuthenticationMirror();
    //         paths = auth.path("./keys-spec/keep");
    
    //         keys = await auth.loadKeys();
    //         reflex.origin.public = keys.destiny.public;        
    //         reflex = await auth.reflect(reflex);
            
    //         text = "Mussum Ipsum, cacilds vidis litro abertis. Detraxit consequat et quo num tendi nada.Sapien in monti palavris qui num significa nadis i pareci latim.Tá deprimidis, eu conheço uma cachacis que pode alegrar sua vidis.A ordem dos tratores não altera o pão duris.";
    
    //         deform = await auth.deform(text);
    //         auth.formBox.destiny.deform = "";
    //         reflex.origin.cipher = deform;
    
    //         const testKeyOrigin = reflex.origin.public.length == 814;
    //         const testKeyDestiny = reflex.destiny.public.length == 814;
    //         const testDeform = (reflex.origin.cipher.indexOf("hybrid-crypto") !== -1);
    //         const testText = text.length > 0;
    //         const test = testKeyOrigin && testKeyDestiny && testDeform && testText;
    
    //         expect(test).toBe(true);
    //     });
        
    //     it('enviando uma cifra para o servidor e decifrando o dado', async() => {
            
    //         const reflexResponse = await auth.keep(reflex);
            
    //         const testDeform = (reflexResponse.origin.cipher.indexOf("hybrid-crypto") !== -1);
    //         const testReform = auth.formBox.origin.reform === text;
    //         const test = testDeform && testReform;
    
    //         expect(test).toBe(true);
    //     });
    
    // });
    
    await test("Metodo: distort()", async(ctx)=>{

        auth = new AuthenticationMirrorClient();
        auth.host("http://localhost:5001");
        
        await auth.loadKeys();
        const reflex = await auth.reflect();
        
        const textClient = "Mussum Ipsum, cacilds vidis litro abertis. Detraxit consequat et quo num tendi nada.Sapien in monti palavris qui num significa nadis i pareci latim.Tá deprimidis, eu conheço uma cachacis que pode alegrar sua vidis.A ordem dos tratores não altera o pão duris.";
        
        console.log("DEBUG: ", auth.reflex);

        reflex = await auth.distort();
        const decryptClient = await auth.reform(reflex.destiny.cipher);
        
        const testDeformServer  = (reflex.destiny.cipher.indexOf("hybrid-crypto") !== -1);
        const testReformServer  = auth.formBox.origin.reform === textClient;
        const testBodyServer    = reflex.destiny.body.raw.length > 0;
        
        const testDeformClient  = (reflex.origin.cipher.indexOf("hybrid-crypto") !== -1);
        const testReformClient  = decryptClient == textServer;
        const testBodyClient    = reflex.origin.body.raw.length > 0;
        
        const test2 = testDeformServer && testDeformClient && testReformServer &&  testReformClient && testBodyServer && testBodyClient;

        const assert = test1 && rawServer && test2;
        
        ctx.assert("Distorção concluída com sucesso", assert, true);
            
    
    });

    // describe("Método: reveal(reflex: object)", ()=> {
    //     jest.setTimeout(20000);
    
    //     let authClient, keys, textClient, deform;
    
    //     let reflex = {
    //         origin:  { public: "",  cipher: "", body: { } },
    //         destiny: { public: "",  cipher: "", body: { } }, 
    //     };
        
    //     it('preparando ambiente para testar reveal', async() => {
    //         authClient = new AuthenticationMirror();
    //         authClient.path("./keys-spec/reveal");
    
    //         keys = await authClient.loadKeys();
    //         reflex.origin.public = keys.destiny.public;        
    //         reflex = await authClient.reflect(reflex);
            
    //         textClient = "Mussum Ipsum, cacilds vidis litro abertis. Detraxit consequat et quo num tendi nada.Sapien in monti palavris qui num significa nadis i pareci latim.Tá deprimidis, eu conheço uma cachacis que pode alegrar sua vidis.A ordem dos tratores não altera o pão duris.";
    
    //         reflex.origin.body = { raw: textClient };
    
    //         const testKeyOrigin = reflex.origin.public.length == 814;
    //         const testKeyDestiny = reflex.destiny.public.length == 814;
    //         const testText = reflex.origin.body.raw == textClient;
    //         const test = testKeyOrigin && testKeyDestiny && testText;
    
    //         expect(test).toBe(true);
    //     });
        
    //     it('enviando um dado para o servidor e recebendo uma cifra do servidor', async() => {
    
    //         authServer = new AuthenticationMirror();
    //         authServer.path("./keys-spec/reveal");
            
    //         reflex = await authServer.reveal(reflex);
    
    //         const test  = (reflex.origin.cipher.indexOf("hybrid-crypto") !== -1);
    
    //         expect(test).toBe(true);
    //     });
    
    // });

})();

async function test(title, callback) {

    const ctx = { assert: (description, prop1, pro2)=> {
        if(JSON.stringify(prop1) === JSON.stringify(pro2)) {
            console.log(`%c ASSERT: ${JSON.stringify(description)} `, 'background: transparent; color: #bada55; display: block;');
        } else {
            console.error("FAILED", JSON.stringify(description));
        }
    }}

    console.group(`%c Test: ${title}`, 'background: rgba(255,255,255,0.01); color: #2BD; padding: 4px 16px 0px 0');
    await callback(ctx);
    console.groupEnd();
    console.log("")
};
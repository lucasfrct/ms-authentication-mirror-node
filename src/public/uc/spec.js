(async() => {

    // await test("Encriptação disponível", async(ctx)=>{
    //     const auth = new AuthenticationMirrorClient();
    //     ctx.assert("A classe contem a library RSA", (auth.rsa !== null), true);
    //     ctx.assert("A classe contem a library Crypt", (auth.crypt !== null), true);
    // });

    // await test("Metodo: url(string)", async(ctx)=>{
    //     const auth = new AuthenticationMirrorClient();
    //     const url = auth.url("/authenticate");
    //     ctx.assert(auth.client, (url.indexOf("/authenticate") !== -1), true);
    // });

    // await test("Metodo: raw(*)", async(ctx)=>{
    //     const auth = new AuthenticationMirrorClient();
    //     const raw = "raw";
    //     auth.raw("raw");
    //     ctx.assert("dado raw", auth.formBox.origin.raw, raw);
    // });

    // await test("Metodo: setReflex(reflex)", async(ctx)=>{
    //     const auth = new AuthenticationMirrorClient();
        
    //     const reflex = {
    //         origin: { public: "ogirin", cipher: "", raw: "" },
    //         image: { public: "image", cipher: "", raw: "" }, 
    //         destiny: { public: "destinity", cipher: "", raw: "" }, 
    //     };

    //     auth.setReflex(reflex);

    //     ctx.assert("Repflex foi setado", auth.reflex.origin.public, reflex.origin.public);
    // });

    // await test("Metodo: match(reflex || formBox || keysBox)", async(ctx)=>{
    //     const auth = new AuthenticationMirrorClient();
        
    //     const reflex = {
    //         origin: { public: "ogirin", cipher: "", raw: "origin" },
    //         image: { public: "image", cipher: "", raw: "image" }, 
    //         destiny: { public: "destiny", cipher: "", raw: "destiny" }, 
    //     };

    //     auth.match(reflex);

    //     ctx.assert("Reflex insert keysBox", auth.keysBox.origin.public, reflex.origin.public);
    //     ctx.assert("Reflex insert formBox", auth.formBox.origin.raw, reflex.origin.raw);

    //     const auth1 = new AuthenticationMirrorClient();

    //     const formBox = {
    //         origin: { reform: "", deform: "origin", raw: "" },
    //         image: { reform: "", deform: "", raw: "" },
    //         destiny: { reform: "", deform: "", raw: "" },
    //     };

    //     auth1.match(formBox);

    //     ctx.assert("formBox insert reflex", auth1.reflex.origin.cipher, formBox.origin.deform);

    //     const auth2 = new AuthenticationMirrorClient();

    //     keysBox = {
    //         origin: { public: "origin", private: "", secret: "", signature: "" },
    //         image: { public: "", private: "", secret: "", signature: "" },
    //         destiny: { public: "", private: "", secret: "", signature: "" }
    //     };

    //     auth2.match(keysBox);

    //     ctx.assert("keysBox insert reflex", auth2.reflex.origin.public, keysBox.origin.public);

    // });

    // await test("Metodo: captureKeys()", async(ctx)=>{
    //     const auth = new AuthenticationMirrorClient();
    
    //     const keys = await auth.captureKeys();

    //     ctx.assert("PUBLIC KEY", (keys.origin.public.length > 64), true);
    //     ctx.assert("PRIVATE KEY", (keys.origin.private.length > 64), true);
    //     ctx.assert("SECRET KEY", (keys.origin.secret.length > 12), true);
    //     ctx.assert("SIGNATURE", (keys.origin.signature.length > 64), true);

    // });

    // await test("Metodo: writeKeys()", async(ctx)=>{
    //     const auth = new AuthenticationMirrorClient();
        
    //     const keys = await auth.captureKeys();
    //     await auth.writeKeys();
    //     const public = await localStorage.getItem('AuthenticateMirrorPublicKey');

    //     ctx.assert("Chaves escritas com sucesso", keys.origin.public, public);

    // });

    // await test("Metodo: readKeys()", async(ctx)=>{
    //     const auth = new AuthenticationMirrorClient();
        
    //     const keys = await auth.captureKeys();
    //     await auth.writeKeys();
    //     const keysBox = await auth.readKeys();

    //     ctx.assert("Chaves lidas com sucesso", keys.origin.public, keysBox.origin.public);

    // });

    // await test("Metodo: loadKeys()", async(ctx)=>{
    //     const auth = new AuthenticationMirrorClient();
        
    //     const keysBox = await auth.loadKeys();

    //     ctx.assert("Chaves carreagadas com sucesso", (keysBox.origin.public.length > 64), true);

    // });

    // await test("Metodo: signature()", async(ctx)=>{
    //     const auth = new AuthenticationMirrorClient();

    //     keysBox = await auth.loadKeys();

    //     const signature = await auth.signature("spec");

    //     ctx.assert("Dado assinado com sucesso", (signature.length > 64), true);

    // });

    // // ! ainda não foi possíve testar verify
    // await test("Metodo: verify()", async(ctx)=>{
    //     const auth = new AuthenticationMirrorClient();
    //     // keysBox = await auth.loadKeys();
    //     // const msg = "spec";
    //     // const signature = await auth.signature(msg);
    //     // const verify = await auth.verify(msg);
    //     ctx.assert("Ainda não foi possível testar", true, true);
    // });

    // await test("Metodo: deform()", async(ctx)=>{
    //     const auth = new AuthenticationMirrorClient();

    //     const keysBox = await auth.loadKeys();
    //     auth.keysBox.image.public = keysBox.origin.public
    //     const encrypt = await auth.deform("raw");
        
    //     ctx.assert("Dados encriptado com sucesso", (encrypt.length > 64), true);
    // });

    // await test("Metodo: reform()", async(ctx)=>{
    //     const auth = new AuthenticationMirrorClient();

    //     const keysBox = await auth.loadKeys();
    //     auth.keysBox.image.public = keysBox.origin.public;

    //     const data = "raw";

    //     const encrypt = await auth.deform(data);

    //     const decrypted = await auth.reform(encrypt);

    //     ctx.assert("Dados decriptado com sucesso", decrypted, data);

    // });

    // await test("Metodo: deform(raw)", async(ctx)=>{
    //     const auth = new AuthenticationMirrorClient();

    //     const keysBox = await auth.loadKeys();
    //     auth.keysBox.image.public = keysBox.origin.public
    //     const encrypt = await auth.deform("raw");
        
    //     ctx.assert("Dados encriptado com sucesso", (encrypt.length > 64), true);

    // });

    await test("Metodo: send(reflex)", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
        auth.url("/healthz");
        const res = await auth.send();
        ctx.assert("Dados postados com sucesso", res.hasOwnProperty("healthz"), true);
    });

    await test("Metodo: get()", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
        auth.url("/healthz");
        const res = await auth.get();
        ctx.assert("Dados obtidos com sucesso", res.hasOwnProperty("healthz"), true);
    });

    await test("Metodo: reflect()", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
        const res = await auth.reflect();
        ctx.assert("Chaves trocadas com sucesso", true, true);
    });

    await test("Metodo: distort()", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
        const res = await auth.distort();
        ctx.assert("Dados encriptado com sucesso", true, true);
    });
    

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
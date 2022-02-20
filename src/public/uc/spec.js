(async() => {

    await test("Encriptação disponível", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
        ctx.assert("A classe contem a library RSA", (auth.rsa !== null), true);
        ctx.assert("A classe contem a library Crypt", (auth.crypt !== null), true);
    });

    await test("Metodo: url(string)", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
        const url = auth.url("/authenticate");
        ctx.assert(auth.client, (url.indexOf("/authenticate") !== -1), true);
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
            origin: { public: "ogirin", cipher: "", raw: "" },
            image: { public: "image", cipher: "", raw: "" }, 
            destiny: { public: "destinity", cipher: "", raw: "" }, 
        };

        auth.setReflex(reflex);

        ctx.assert("Repflex foi setado", auth.reflex.origin.public, reflex.origin.public);
    });

    await test("Metodo: match(reflex || formBox)", async(ctx)=>{
        const auth = new AuthenticationMirrorClient();
        
        const reflex = {
            origin: { public: "ogirin", cipher: "", raw: "" },
            image: { public: "image", cipher: "", raw: "" }, 
            destiny: { public: "destinity", cipher: "", raw: "" }, 
        };

        auth.match(reflex);

        ctx.assert(auth.keysBox, auth.keysBox.origin.public, reflex.origin.public);
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
require('dotenv/config');
const fs = require("fs");
const AuthenticationMirror = require('./AuthenticationMirror');

describe('Testa os setters e getters das vairiaveis da classe', () => {

    const auth = new AuthenticationMirror();

    it('A classe contem a library RSA"', async() => {
        expect((auth.rsa !== null)).toBe(true);
    })

    it('A classe contem a library Crypt', async() => {        
        expect((auth.crypt !== null)).toBe(true);
    })

    it('A classe contem a propriedade paths', async() => {        
        let test = (auth.hasOwnProperty('paths') && Object.keys(auth.paths).length == 5)
        expect(test).toBe(true);
    })

    it('A classe contem a propriedade keysBox ', async() => {        
        let hasKeysBox = (auth.hasOwnProperty("keysBox") && Object.keys(auth.keysBox).length == 2);
        let hasOrigin = (auth.keysBox.hasOwnProperty("origin") && Object.keys(auth.keysBox.origin).length == 2)
        let hasDestiny = (auth.keysBox.hasOwnProperty("destiny") && Object.keys(auth.keysBox.destiny).length == 4)
        let test = (hasKeysBox && hasOrigin && hasDestiny);
        expect(test).toBe(true);
    })


    it('A classe contem a propriedade formBox ', async() => {        
        let hasformBox = (auth.hasOwnProperty("formBox") && Object.keys(auth.formBox).length == 2);
        let hasOrigin = (auth.formBox.hasOwnProperty("origin") && Object.keys(auth.formBox.origin).length == 3)
        let hasDestiny = (auth.formBox.hasOwnProperty("destiny") && Object.keys(auth.formBox.destiny).length == 3)
        let test = (hasformBox && hasOrigin && hasDestiny);
        expect(test).toBe(true);
    })

    it('A classe contem a propriedade reflex ', async() => {        
        let hasReflex = (auth.hasOwnProperty("reflex") && Object.keys(auth.reflex).length == 2);
        let hasOrigin = (auth.reflex.hasOwnProperty("origin") && Object.keys(auth.reflex.origin).length == 3)
        let hasDestiny = (auth.reflex.hasOwnProperty("destiny") && Object.keys(auth.reflex.destiny).length == 3)
        let test = (hasReflex && hasOrigin && hasDestiny);
        expect(test).toBe(true);
    })

})

describe('Metodo path(string)', () => {

    const auth = new AuthenticationMirror();
    const folder = "./keys/spec";
    auth.path(folder);

    it('auth.paths.base gravado', async() => {
        expect(auth.paths.base).toBe(folder);
    });

    it('auth.paths.public gravado', async() => {
        let test = ((auth.paths.public.indexOf(folder) !== -1) && folder.length < auth.paths.public.length);
        expect(test).toBe(true);
    });

    it('auth.paths.private gravado', async() => {
        let test = ((auth.paths.private.indexOf(folder) !== -1) && folder.length < auth.paths.private.length);
        expect(test).toBe(true);
    });

    it('auth.paths.secret gravado', async() => {
        let test = ((auth.paths.secret.indexOf(folder) !== -1) && folder.length < auth.paths.secret.length);
        expect(test).toBe(true);
    });

    it('auth.paths.signature gravado', async() => {
        let test = ((auth.paths.signature.indexOf(folder) !== -1) && folder.length < auth.paths.signature.length);
        expect(test).toBe(true);
    });

})

describe('Metodo: raw(*)', () => {
    
    const auth = new AuthenticationMirror();
    const raw = "spec-raw";
    auth.raw(raw);
    
    it("raw gravado com sucesso", async() => {
        expect(auth.formBox.destiny.raw).toBe(raw);
    });
})

describe('Metodo: setReflex(reflex)', () => {
    
    const auth = new AuthenticationMirror();
    
    const reflex = {
        origin:  { public: "ogirin-public",  cipher: "origin-cipher",},
        destiny: { public: "destiny-public", cipher: "detiny-cipher", }, 
    };

    auth.setReflex(reflex);

    it("auth.reflex.origin.public gravado", async() => {
        expect(auth.reflex.origin.public).toBe(reflex.origin.public);
    });

    it("auth.reflex.destiny.public gravado", async() => {
        expect(auth.reflex.destiny.public).toBe(reflex.destiny.public);
    });

    it("auth.reflex.destiny.body inalterado", async() => {
        console.log("DEBUG: ", auth.reflex.origin)
        expect(auth.reflex.destiny.hasOwnProperty('body')).toBe(true);
    });
})

describe('Metodo: match(reflex || formBox || keysBox)', () => {

    const reflex = {
        origin:  { public: "ogirin-public",  cipher: "origin-cipher" },
        destiny: { public: "destiny-public", cipher: "detiny-cipher" }, 
    };

    const formBox = {
        origin:  { reform: "origin-reform",  deform: "origin-deform",  raw: "origin-raw" },
        destiny: { reform: "destiny-reform", deform: "destiny-deform", raw: "destiny-raw" },
    };

    const keysBox = {
        origin:     { public: "origin-public", private: "origin-private", secret: "origin-secret", signature: "origin-signature" },
        destiny:    { public: "destiny-public", signature: "destiny-signature" }
    };

    it("match(reflex)", async() => {
        const auth = new AuthenticationMirror();
        auth.match(reflex);

        let setKeys = (auth.keysBox.origin.public == reflex.origin.public);
        let setForm = (auth.formBox.origin.deform == reflex.origin.cipher);
        let test = (setKeys && setForm);

        expect(test).toBe(true);
    });

    it("match(formBox)", async() => {
        const auth = new AuthenticationMirror();
        auth.match(formBox);

        let setReflexOrgin = (formBox.origin.deform == auth.reflex.origin.cipher);
        let setReflexDestiny = (formBox.destiny.deform == auth.reflex.destiny.cipher);
        let test = (setReflexOrgin && setReflexDestiny);
        expect(test).toBe(true);
    });

    it("match(keysBox)", async() => {
        const auth = new AuthenticationMirror();
        auth.match(keysBox);

        let test = (keysBox.destiny.public == auth.reflex.destiny.public);
        expect(test).toBe(true);
    });

})

describe('Metodo: captureKeys()', () => {

    // it('PUBLIC KEY', async() => {
    //     const auth = new AuthenticationMirror();
    //     const keys = await auth.captureKeys();
    //     expect((keys.destiny.public.length > 64)).toBe(true);
    // })

    // it('PRIVATE KEY', async() => {
    //     const auth = new AuthenticationMirror();
    //     const keys = await auth.captureKeys();
    //     expect((keys.destiny.private.length > 64)).toBe(true);
    // })

    // it('SECRET KEY', async() => {
    //     const auth = new AuthenticationMirror();
    //     const keys = await auth.captureKeys();
    //     expect((keys.destiny.secret.length > 12)).toBe(true);
    // })

    // it('SIGNATURE', async() => {
    //     const auth = new AuthenticationMirror();
    //     const keys = await auth.captureKeys();
    //     expect((keys.destiny.signature.length > 64)).toBe(true);
    // })

    // it('Metodo: writeKeys()', async() => {
    //     const auth = new AuthenticationMirror();
    //     const keys = await auth.captureKeys();
    //     await auth.writeKeys();
    //     const key = await fs.readFileSync(`${auth.paths.base}/${auth.paths.public}`, "utf8");
    //     expect(keys.destiny.public).toBe(key);
    // })
    
    // it('Metodo: readKeys()', async() => {
    //     const auth = new AuthenticationMirror();
    //     const keys = await auth.captureKeys();
    //     await auth.writeKeys();
    //     await auth.readKeys();

    //     const key = process.env.PUBLIC_KEY

    //     expect(keys.destiny.public).toBe(key);
    // })

    // it('Metodo: loadKeys()', async() => {
    //     const auth = new AuthenticationMirror();
    //     await auth.loadKeys();
    //     expect((auth.keysBox.destiny.public.length > 64)).toBe(true);
    // })

    // it('Metodo: signature()', async() => {
    //     const auth = new AuthenticationMirror();
    //     keysBox =  await auth.loadKeys();
        
    //     const signature = await auth.signature("spec");

    //     expect((signature.length > 64)).toBe(true);
    // })


})
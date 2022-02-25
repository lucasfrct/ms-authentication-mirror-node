require('dotenv/config');
const fs = require("fs");
const AuthenticationMirror = require('./AuthenticationMirror');



describe('Encriptação disponível', () => {

    const auth = new AuthenticationMirror();
    it('A classe contem a library RSA"', async() => {
        expect((auth.rsa !== null)).toBe(true);
    })

    it('A classe contem a library Crypt', async() => {        
        expect((auth.crypt !== null)).toBe(true);
    })

})

describe('SET DATA', () => {

    // it('Metodo path(string)', async() => {
    //     const auth = new AuthenticationMirror();
    //     const folder = "./keys/spec";
    //     const paths = auth.path(folder);
    //     expect(paths.base).toBe(folder);
    // });

    // it("Metodo: raw(*)", async() => {
    //     const auth = new AuthenticationMirror();
    //     const raw = "spec-raw";
    //     auth.raw(raw);a
    //     expect(raw).toBe(auth.formBox.destiny.raw);
    // });

    // it("Metodo: setReflex(reflex)", async() => {
    //     const auth = new AuthenticationMirror();

    //     const reflex = {
    //         origin:  { public: "ogirin-public",  cipher: "origin-cipher" },
    //         destiny: { public: "destiny-public", cipher: "detiny-cipher" }, 
    //     };

    //     auth.setReflex(reflex);

    //     expect(auth.reflex.destiny.public).toBe(reflex.destiny.public);
    // });

})

describe('Metodo: match(reflex || formBox || keysBox)', () => {

    // it("match(reflex)", async() => {
    //     const reflex = {
    //         origin:  { public: "ogirin-public",  cipher: "origin-cipher" },
    //         destiny: { public: "destiny-public", cipher: "detiny-cipher" }, 
    //     };
        
    //     const auth = new AuthenticationMirror();
    //     auth.match(reflex);

    //     expect(auth.keysBox.destiny.public).toBe(reflex.destiny.public);
    //     expect(auth.formBox.destiny.deform).toBe(reflex.destiny.cipher);
    // });

    // it("match(formBox)", async() => {
    //     // ! formBox
    //     const formBox = {
    //         origin:  { reform: "origin-reform",  deform: "origin-deform",  raw: "origin-raw" },
    //         destiny: { reform: "destiny-reform", deform: "destiny-deform", raw: "destiny-raw" },
    //     };

    //     const auth = new AuthenticationMirror();
    //     auth.match(formBox);
    //     expect(auth.reflex.destiny.cipher).toBe(formBox.destiny.deform);
    // });

    // it("match(keysBox)", async() => {
    //     // ! keysBox
    //     const keysBox = {
    //         origin:     { public: "origin-public", private: "origin-private", secret: "origin-secret", signature: "origin-signature" },
    //         destiny:    { public: "destiny-public", signature: "destiny-signature" }
    //     };

    //     const auth = new AuthenticationMirror();
    //     auth.match(keysBox);
    //     expect(auth.reflex.destiny.public).toBe(keysBox.destiny.public);
    // });

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
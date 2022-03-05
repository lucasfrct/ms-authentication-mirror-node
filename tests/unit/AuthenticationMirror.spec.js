require('dotenv/config');
require('module-alias/register');

const fs = require("fs");
const pathModule = require("path");

const { PathExists, DirRemove } = require('@utils/handle-path');

const AuthenticationMirror = require('../../src/authentication/AuthenticationMirror');

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

});

describe('Metodo path(path: string)', () => {

    const auth = new AuthenticationMirror();
    const folder = "./keys/spec";
    const folderNomalized = pathModule.normalize(folder);
    auth.path(folder);

    it('auth.paths.base gravado', async() => {
        expect(auth.paths.base).toBe(folderNomalized);
    });

    it('auth.paths.public gravado', async() => {
        let test = ((auth.paths.public.indexOf(folderNomalized) !== -1) && folder.length < auth.paths.public.length);
        expect(test).toBe(true);
    });

    it('auth.paths.private gravado', async() => {
        let test = ((auth.paths.private.indexOf(folderNomalized) !== -1) && folder.length < auth.paths.private.length);
        expect(test).toBe(true);
    });

    it('auth.paths.secret gravado', async() => {
        let test = ((auth.paths.secret.indexOf(folderNomalized) !== -1) && folder.length < auth.paths.secret.length);
        expect(test).toBe(true);
    });

    it('auth.paths.signature gravado', async() => {
        let test = ((auth.paths.signature.indexOf(folderNomalized) !== -1) && folder.length < auth.paths.signature.length);
        expect(test).toBe(true);
    });

});

describe('Metodo: raw(*)', () => {
    
    const auth = new AuthenticationMirror();
    const raw = "spec-raw";
    auth.raw(raw);
    
    it("raw gravado com sucesso", async() => {
        expect(auth.formBox.destiny.raw).toBe(raw);
    });
});

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
        expect(auth.reflex.destiny.hasOwnProperty('body')).toBe(true);
    });
});

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

});

describe('Metodo: captureKeys()', () => {

    it('gera a publicKey em auth.keys.destiny.public', async() => {
        const auth = new AuthenticationMirror();

        const keys = await auth.captureKeys();

        const testText = keys.destiny.public.indexOf("BEGIN PUBLIC KEY") != -1;
        const testLength = keys.destiny.public.length == 814;
        const test = (testText && testLength);

        expect(test).toBe(true);
    })

    it('gera a privateKey em auth.keys.destiny.private', async() => {
        const auth = new AuthenticationMirror();

        const keys = await auth.captureKeys();

        const testText = keys.destiny.private.indexOf("BEGIN RSA PRIVATE KEY") != -1;
        const testLength = keys.destiny.private.length >= 3294;
        const test = (testText && testLength);

        expect(test).toBe(true);
    })
   
    it('gera a secret key em auth.keys.destiny.secret', async() => {
        const auth = new AuthenticationMirror();
  
        const keys = await auth.captureKeys();
  
        const testText = keys.destiny.secret.indexOf("=") != -1;
        const testLength = keys.destiny.secret.length == 44;
        const test = (testText && testLength);
  
        expect(test).toBe(true);
    })

    it('gera a signature key em auth.keys.destiny.signature', async() => {
        const auth = new AuthenticationMirror();
  
        const keys = await auth.captureKeys();
  
        const testText = keys.destiny.signature.indexOf("=") != -1;
        const testLength = keys.destiny.signature.length == 684;
        const test = (testText && testLength);
  
        expect(test).toBe(true);
    })

});

describe('Metodo: writeKeys(path: string)', () => {

    let auth, paths;

    it('generate keys', async() => {
        auth = new AuthenticationMirror();
        paths = auth.path("./keys-spec/write");

        await auth.captureKeys();
        await auth.writeKeys()
    
        expect(true).toBe(true);
    });
  
    it('salva a chave pública no servidor', async() => {
        const test = await PathExists(paths.public);
        expect(test).toBe(true);
    });
    
    it('salva a chave privada no servidor', async() => {
        const test = await PathExists(paths.private);
        expect(test).toBe(true);
    });

    it('salva a chave secreta no servidor', async() => {
        const test = await PathExists(paths.secret);
        expect(test).toBe(true);
    });

    it('salva a chave de assinatura no servidor', async() => {
        const test = await PathExists(paths.signature);
        expect(test).toBe(true);
    });

    it('Remove folder', async() => {
        await DirRemove('./keys-spec');
        expect(true).toBe(true);
    });    

});

describe('Metodo: readKeys(path: string)', () => {

    jest.setTimeout(15000);

    let auth, paths;

    it('generate keys', async() => {
        auth = new AuthenticationMirror();
        paths = auth.path("./keys-spec/read");

        await auth.captureKeys();
        await auth.writeKeys();
        await auth.readKeys();
    
        expect(true).toBe(true);
    });

    it('carrega a chave pública do disco do servidor para a variavél de ambiente', async() => {
        const pub = process.env.PUBLIC_KEY;

        const testText = pub.indexOf("BEGIN PUBLIC KEY") != -1;
        const testLength = pub.length == 814;
        const test = (testText && testLength);

        expect(test).toBe(true);
    });

    it('carrega a chave privada do disco do servidor para a variavél de ambiente', async() => {
        const priv = process.env.PRIVATE_KEY;

        const testText = priv.indexOf("BEGIN RSA PRIVATE KEY") != -1;
        const testLength = priv.length >= 3294;
        const test = (testText && testLength);

        expect(test).toBe(true);
    });

    it('carrega a chave secreta do disco do servidor para a variavél de ambiente', async() => {
        const sec = process.env.SECRET_KEY;

        const testText = sec.indexOf("=") != -1;
        const testLength = sec.length == 44;
        const test = (testText && testLength);

        expect(test).toBe(true);
    });

    it('carrega a chave de assinatura do disco do servidor para a variavél de ambiente', async() => {
        const sig = process.env.SIGNATURE;

        const testText = sig.indexOf("=") != -1;
        const testLength = sig.length == 684;
        const test = (testText && testLength);
    
        expect(test).toBe(true);
    });

    it('Remove folder', async() => {
        await DirRemove('./keys-spec');
        expect(true).toBe(true);
    });  

});

describe('Metodo: loadKeys()', () => {

    jest.setTimeout(15000);

    let auth, paths, keys;

    it('generate keys', async() => {
        auth = new AuthenticationMirror();
        paths = auth.path("./keys-spec/load");

        keys = await auth.loadKeys();

        expect(true).toBe(true);
    });

    it('carrega a chave pública para a classe', async() => {
        const pub = keys.destiny.public;

        const testText = pub.indexOf("BEGIN PUBLIC KEY") != -1;
        const testLength = pub.length == 814;
        const test = (testText && testLength);

        expect(test).toBe(true);
    });

    it('carrega a chave privada para a classe', async() => {
        const priv = keys.destiny.private;

        const testText = priv.indexOf("BEGIN RSA PRIVATE KEY") != -1;
        const testLength = priv.length >= 3294;
        const test = (testText && testLength);

        expect(test).toBe(true);
    });

    it('carrega a chave secreta para a classe', async() => {
        const sec = keys.destiny.secret;

        const testText = sec.indexOf("=") != -1;
        const testLength = sec.length == 44;
        const test = (testText && testLength);

        expect(test).toBe(true);
    });

    it('carrega a chave de assinatura para a classe', async() => {
        const sig = keys.destiny.signature;

        const testText = sig.indexOf("=") != -1;
        const testLength = sig.length == 684;
        const test = (testText && testLength);
    
        expect(test).toBe(true);
    });

    it('Remove folder', async() => {
        await DirRemove('./keys-spec');
        expect(true).toBe(true);
    });  

});



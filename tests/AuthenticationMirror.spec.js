require('dotenv/config');
require('module-alias/register');

const fs = require("fs");
const pathModule = require("path");

const { PathExists, DirRemove } = require('../src/utils/handle-path');

const AuthenticationMirror = require('../src/authentication/AuthenticationMirror');

jest.useFakeTimers();

describe('Testa os setters e getters das vairiaveis da classe', () => {
    jest.setTimeout(20000);

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

    jest.setTimeout(20000);

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
    jest.setTimeout(20000);

    const auth = new AuthenticationMirror();
    const raw = "spec-raw";
    auth.raw(raw);
    
    it("raw gravado com sucesso", async() => {
        expect(auth.formBox.destiny.raw).toBe(raw);
    });
});

describe('Metodo: setReflex(reflex)', () => {
    jest.setTimeout(20000);

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

    jest.setTimeout(20000);

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
    jest.setTimeout(20000);

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

    jest.setTimeout(20000);

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

});

describe('Metodo: readKeys(path: string)', () => {

    jest.setTimeout(20000);

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

});

describe('Metodo: loadKeys()', () => {

    jest.setTimeout(20000);

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

});

describe("Método: signature(raw: string)", ()=> {
    jest.setTimeout(20000);

    it("Cria uma assinatura numa string com a chave privada", async()=> {
        expect(true).toBe(true);
    })
});

describe("Método: verify(raw: string)", ()=> {
    jest.setTimeout(20000);

    it("faz verificação de assinatura numa string coma chave pública", async()=> {
        expect(true).toBe(true);
    })
});

describe("Método: deform(raw: string)", ()=> {
    jest.setTimeout(20000);

    let auth, paths, keys;
    
    it('generate keys', async() => {
        auth = new AuthenticationMirror();
        paths = auth.path("./keys-spec/deform");

        keys = await auth.loadKeys();

        expect((keys.destiny.public.length > 0)).toBe(true);
    });

    it('gerando uma cifra no servidor com a chave pública do cliente', async() => {
        const text = "Mussum Ipsum, cacilds vidis litro abertis. Detraxit consequat et quo num tendi nada.Sapien in monti palavris qui num significa nadis i pareci latim.Tá deprimidis, eu conheço uma cachacis que pode alegrar sua vidis.A ordem dos tratores não altera o pão duris.";
        
        auth.keysBox.origin.public = auth.keysBox.destiny.public;

        const deform = await auth.deform(text);

        expect((deform.indexOf("hybrid-crypto") !== -1)).toBe(true);
    });

});

describe("Método: reform(cipher: string)", ()=> {
    jest.setTimeout(20000);

    let auth, paths, keys, text, deform;
    
    it('preparando ambiente para testar reform', async() => {
        auth = new AuthenticationMirror();
        paths = auth.path("./keys-spec/deform");

        keys = await auth.loadKeys();

        auth.keysBox.origin.public = auth.keysBox.destiny.public;

        text = "Mussum Ipsum, cacilds vidis litro abertis. Detraxit consequat et quo num tendi nada.Sapien in monti palavris qui num significa nadis i pareci latim.Tá deprimidis, eu conheço uma cachacis que pode alegrar sua vidis.A ordem dos tratores não altera o pão duris.";
        
        deform = await auth.deform(text);
        const testKey = auth.keysBox.origin.public.length == 814;
        const testDeform = (deform.indexOf("hybrid-crypto") !== -1);
        const testText = text.length > 0;
        const test = testKey && testDeform && testText;

        expect(test).toBe(true);
    });

    it('gera uma cifra no servidor com a chave pública do cliente', async() => {

        const reform = await auth.reform(deform);
        const test = (text == reform);

        expect(test).toBe(true);
    });

});

describe("Método: reflect(reflex: object)", ()=> {
    jest.setTimeout(20000);

    let auth, paths;

    const reflex = {
        origin:  { public: "ogirin-public",  cipher: "" },
        destiny: { public: "", cipher: "" }, 
    };
    
    it('recebe a chave publica do cliente e devolve a chave publica do servidor', async() => {
        auth = new AuthenticationMirror();
        paths = auth.path("./keys-spec/reflect");

        const reflexResponse = await auth.reflect(reflex);

        const testOrigin = auth.keysBox.origin.public == reflex.origin.public;
        const testClient = reflexResponse.destiny.public.length == 814;
        const test = testOrigin && testClient;

        expect(test).toBe(true);
    });

});

describe("Método: keep(reflex: object)", ()=> {
    jest.setTimeout(20000);

    let auth, paths, keys, text, deform;

    let reflex = {
        origin:  { public: "ogirin-public",  cipher: "" },
        destiny: { public: "", cipher: "" }, 
    };
    
    it('preparando ambiente para testar Keep', async() => {
        auth = new AuthenticationMirror();
        paths = auth.path("./keys-spec/keep");

        keys = await auth.loadKeys();
        reflex.origin.public = keys.destiny.public;        
        reflex = await auth.reflect(reflex);
        
        text = "Mussum Ipsum, cacilds vidis litro abertis. Detraxit consequat et quo num tendi nada.Sapien in monti palavris qui num significa nadis i pareci latim.Tá deprimidis, eu conheço uma cachacis que pode alegrar sua vidis.A ordem dos tratores não altera o pão duris.";

        deform = await auth.deform(text);
        auth.formBox.destiny.deform = "";
        reflex.origin.cipher = deform;

        const testKeyOrigin = reflex.origin.public.length == 814;
        const testKeyDestiny = reflex.destiny.public.length == 814;
        const testDeform = (reflex.origin.cipher.indexOf("hybrid-crypto") !== -1);
        const testText = text.length > 0;
        const test = testKeyOrigin && testKeyDestiny && testDeform && testText;

        expect(test).toBe(true);
    });
    
    it('enviando uma cifra para o servidor e decifrando o dado', async() => {
        
        const reflexResponse = await auth.keep(reflex);
        
        const testDeform = (reflexResponse.origin.cipher.indexOf("hybrid-crypto") !== -1);
        const testReform = auth.formBox.origin.reform === text;
        const test = testDeform && testReform;

        expect(test).toBe(true);
    });

});

describe("Método: distort(reflex: object)", ()=> {
    jest.setTimeout(20000);

    let authServer, authClient, deform, textClient, textServer;

    let reflex = {
        origin:  { public: "", cipher: "", body: {} },
        destiny: { public: "", cipher: "", body: {} }, 
    };

    it('preparando ambiente do cliente', async() => {

        authClient = new AuthenticationMirror();
        authClient.path("./keys-spec/distort");
    
        const keys = await authClient.loadKeys(); 

        reflex.origin.public = keys.destiny.public;        
        
        reflex = await authClient.reflect(reflex);
        
        textClient = "Mussum Ipsum, cacilds vidis litro abertis. Detraxit consequat et quo num tendi nada.Sapien in monti palavris qui num significa nadis i pareci latim.Tá deprimidis, eu conheço uma cachacis que pode alegrar sua vidis.A ordem dos tratores não altera o pão duris.";
        
        deform = await authClient.deform(textClient);

        reflex.origin.cipher = deform;
        reflex.origin.body = { raw: textClient };
        
        const testKeyDestiny    = reflex.destiny.public.length == 814;
        const testKeyOrigin     = reflex.origin.public.length == 814;
        const testDeform        = (reflex.origin.cipher.indexOf("hybrid-crypto") !== -1);
        const testText          = reflex.origin.body.raw == textClient;
        const test              = testKeyOrigin && testKeyDestiny && testDeform && testText;
        
        expect(test).toBe(true);
    });


    it('preparando ambiente do servidor', async() => {

        authServer = new AuthenticationMirror();
        authServer.path("./keys-spec/distort");
        const keys = await authServer.loadKeys(); 
      
        textServer = "Sea of Tranquility globular star cluster Cambrian explosion light years something incredible is waiting to be known vanquish the impossible? Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit concept of the number one radio telescope the only home we've ever known made in the interiors of collapsing stars paroxysm of global death. At the edge of forever encyclopaedia galactica two ghostly white figures in coveralls and helmets are softly dancing with pretty stories for which there's little good evidence citizens of distant epochs a still more glorious dawn awaits and billions upon billions upon billions upon billions upon billions upon billions upon billions.";

        const raw = authServer.raw(textServer);
        authServer.reflex.destiny.body = { raw };

        expect(raw.length > 0).toBe(true);
    });
    
    it('enviando uma cifra para o servidor decifrar e decifrando um dado vindo do servidor', async() => {
        
        reflex = await authServer.distort(reflex);
        const decryptClient = await authClient.reform(reflex.destiny.cipher);

        const testDeformServer  = (reflex.destiny.cipher.indexOf("hybrid-crypto") !== -1);
        const testReformServer  = authServer.formBox.origin.reform === textClient;
        const testBodyServer    = reflex.destiny.body.raw.length > 0;
        
        const testDeformClient  = (reflex.origin.cipher.indexOf("hybrid-crypto") !== -1);
        const testReformClient  = decryptClient == textServer;
        const testBodyClient    = reflex.origin.body.raw.length > 0;
        
        const test = testDeformServer && testDeformClient && testReformServer &&  testReformClient && testBodyServer && testBodyClient;

        expect(test).toBe(true);
    });

});

describe("Método: reveal(reflex: object)", ()=> {
    jest.setTimeout(20000);

    let authClient, keys, textClient, deform;

    let reflex = {
        origin:  { public: "",  cipher: "", body: { } },
        destiny: { public: "",  cipher: "", body: { } }, 
    };
    
    it('preparando ambiente para testar reveal', async() => {
        authClient = new AuthenticationMirror();
        authClient.path("./keys-spec/reveal");

        keys = await authClient.loadKeys();
        reflex.origin.public = keys.destiny.public;        
        reflex = await authClient.reflect(reflex);
        
        textClient = "Mussum Ipsum, cacilds vidis litro abertis. Detraxit consequat et quo num tendi nada.Sapien in monti palavris qui num significa nadis i pareci latim.Tá deprimidis, eu conheço uma cachacis que pode alegrar sua vidis.A ordem dos tratores não altera o pão duris.";

        reflex.origin.body = { raw: textClient };

        const testKeyOrigin = reflex.origin.public.length == 814;
        const testKeyDestiny = reflex.destiny.public.length == 814;
        const testText = reflex.origin.body.raw == textClient;
        const test = testKeyOrigin && testKeyDestiny && testText;

        expect(test).toBe(true);
    });
    
    it('enviando um dado para o servidor e recebendo uma cifra do servidor', async() => {

        authServer = new AuthenticationMirror();
        authServer.path("./keys-spec/reveal");
        
        reflex = await authServer.reveal(reflex);

        const test  = (reflex.origin.cipher.indexOf("hybrid-crypto") !== -1);

        expect(test).toBe(true);
    });

});

describe("clear teste tnitário", ()=> {
    jest.setTimeout(20000);

    it('Remove folder', async() => {
        await DirRemove('./keys-spec');
        expect(true).toBe(true);
    });
    
});

require('dotenv/config');
const router = require('express').Router();
const path = require('path');

const handle            = require('@ms-utils-node/src/core/handle');
const logger            = require('@ms-utils-node/src/core/logger-handler');
const Err               = require('@ms-utils-node/src/core/error-handler');
const TemplateEquals    = require('@ms-utils-node/src/core/template-equals');

const Authentication = require('../authentication/Authentication');

const RouterAuthenticateWriteKeys = async(req, res)=> {
    const auth = new Authentication;
    const keys = await auth.writeKeys();
    return res.status(200).json(keys);
};

const RouterAuthenticateReadKeys = async(req, res)=> {
    const auth = new Authentication;
    const keys = await auth.readKeys();
    return res.status(200).json(keys);
};

const RouterAuthenticateloadKeys = async(req, res)=> {
    const auth = new Authentication;
    const keys = await auth.loadKeys();
    return res.status(200).json(keys);
};

const RouterAuthenticateGenerateKeys = async(req, res)=> {
    const auth = new Authentication;
    const keys = await auth.generateKeys();
    return res.status(200).json(keys);
};

const RouterAuthenticateAssembler = async(req, res)=> {
    const auth = new Authentication;
    const keys = await auth.assembler();
    return res.status(200).json(keys);
};

const RouterAuthenticatePublicKey = async(req, res)=> {
    const auth = new Authentication;
    const publicKey = await auth.required();

    if(!publicKey) {
        logger.error({ code: "AU0015", message: "Não foi possível obter a chave pública." });
        return res.status(500).json({ message: "Não foi possível obter a chave pública." })
    };

    return res.status(200).json({ publicKey });
};

const RouterAuthenticateRatify = async(req, res)=> {
    const auth = new Authentication;
    const { cipher } = req.body;
    [err, payload] = await handle(auth.ratify(cipher));
    if(err || !payload) {
        logger.error({ error: err, code:"", message: "Não foi possível comprocar autenticidade da requisição." });
        return res.status(500).json({ message: "Não foi possível comprocar autenticidade da requisição." })
    };
    res.status(200).json(payload);
};

const RouterAuthenticateHybridCryptoJS = (req, res) => {
    res.sendFile(path.join(__dirname, '../lib/hybrid-crypto-js/hybrid-crypto-js.js'));
}

const RouterAuthenticateJsSha512File = (req, res) => {
    res.sendFile(path.join(__dirname, '../lib/js-sha512/js-sha512.js'));
}

const RouterAuthenticateClientClass = (req, res) => {
    res.sendFile(path.join(__dirname, '../authentication/AuthenticationClient.js'));
}

// Files
router.get ('/authenticate/hybrid-crypto-js', RouterAuthenticateHybridCryptoJS);
router.get ('/authenticate/js-sha512', RouterAuthenticateJsSha512File);
router.get ('/authenticate/client', RouterAuthenticateClientClass);

router.get ('/authenticate/write-keys', RouterAuthenticateWriteKeys);
router.get ('/authenticate/read-keys', RouterAuthenticateReadKeys);
router.get ('/authenticate/load-keys', RouterAuthenticateloadKeys);
router.get ('/authenticate/generate-keys', RouterAuthenticateGenerateKeys);
router.get ('/authenticate/assembler', RouterAuthenticateAssembler);

router.get ('/authenticate', RouterAuthenticatePublicKey);  	// obter uma chave publica
router.post('/authenticate', RouterAuthenticateRatify);         // obter payload

module.exports = router
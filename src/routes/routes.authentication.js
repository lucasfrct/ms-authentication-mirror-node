require('dotenv/config');
const router = require('express').Router();
const path = require('path');

const handle            = require('@ms-utils-node/src/core/handle');
const logger            = require('@ms-utils-node/src/core/logger-handler');
const Err               = require('@ms-utils-node/src/core/error-handler');
const TemplateEquals    = require('@ms-utils-node/src/core/template-equals');

const AuthenticationMirror = require('../authentication/AuthenticationMirror');

const RouterAuthenticateMirrorReflect = async(req, res)=> {
    let { body: reflex } = req;
    const mirror = new AuthenticationMirror;
    reflex = await mirror.reflect(reflex);
    res.status(200).json(reflex);
};

const RouterAuthenticateMirrorDistort = async(req, res)=> {
    let { body: reflex } = req;
    const mirror = new AuthenticationMirror;
    mirror.readKeys();
    reflex.origin.raw = "octane";
    reflex = await mirror.distort(reflex);
    console.log(reflex)
    res.status(200).json(reflex);
};

const RouterAuthenticateMirrorKeep = async(req, res)=> {
    let { body: reflex } = req;
    const mirror = new AuthenticationMirror;
    reflex = await mirror.keep(reflex);
    console.log("car: ", mirror.formBox);
    res.status(200).json(reflex);
};

const RouterAuthenticateHybridCrypto = async (req, res) => {
   // ../lib/hybrid-crypto-js/hybrid-crypto-js.js
    const file = `${__dirname}/../lib/hybrid-crypto-js/hybrid-crypto-js.js`;
    res.status(200).download(file);
}

const RouterAuthenticateJsSha512 = async (req, res) => {
     const file = `${__dirname}/../lib/js-sha512/js-sha512.js`;
     res.status(200).download(file);
}

const RouterAuthenticateClientMirror = async (req, res) => {
     const file = `${__dirname}/../authentication/AuthenticationClientMirror.js`;
     res.status(200).download(file);
}

// Files
router.get('/authenticate/hybrid-crypto-js', RouterAuthenticateHybridCrypto);
router.get('/authenticate/js-sha512', RouterAuthenticateJsSha512);
router.get('/authenticate/client/mirror', RouterAuthenticateClientMirror);


// Metodos
router.post('/authenticate/mirror/reflect', RouterAuthenticateMirrorReflect);         // 
router.post('/authenticate/mirror/distort', RouterAuthenticateMirrorDistort);         // 
router.post('/authenticate/mirror/keep', RouterAuthenticateMirrorKeep);



module.exports = router
// router.post - 
//    req: { cipher: "", publicKey: "" }
//    res: { cipher: "", publicKey: "" }

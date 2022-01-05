require('dotenv/config');
const router = require('express').Router();
const path = require('path');

const handle            = require('@ms-utils-node/src/core/handle');
const logger            = require('@ms-utils-node/src/core/logger-handler');
const Err               = require('@ms-utils-node/src/core/error-handler');
const TemplateEquals    = require('@ms-utils-node/src/core/template-equals');

const AuthenticationMirror = require('../authentication/AuthenticationMirror');

const RouterAuthenticateMirror = async(req, res)=> {
    const { body: reflex } = req;

    const mirror = new AuthenticationMirror;
    const { public } = await mirror.generateKeys();

    reflex.image = { public, cipher: "" };
    console.log("reflex", reflex);

    res.status(200).json(reflex);
};

// Files

router.post('/authenticate/mirror/reflect', RouterAuthenticateMirror);         // 


module.exports = router
// router.post - 
//    req: { cipher: "", publicKey: "" }
//    res: { cipher: "", publicKey: "" }

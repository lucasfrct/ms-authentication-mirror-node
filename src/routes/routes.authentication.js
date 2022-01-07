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
    reflex = await mirror.distort(reflex);
    console.log("teste", reflex);
    res.status(200).json(reflex);
};

// Files

router.post('/authenticate/mirror/reflect', RouterAuthenticateMirrorReflect);         // 
router.post('/authenticate/mirror/distort', RouterAuthenticateMirrorDistort);         // 

module.exports = router
// router.post - 
//    req: { cipher: "", publicKey: "" }
//    res: { cipher: "", publicKey: "" }

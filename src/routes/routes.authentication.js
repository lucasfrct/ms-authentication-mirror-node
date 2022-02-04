require('dotenv/config');
const router = require('express').Router();

const AuthenticationMirror = require('@authentication/AuthenticationMirror');

const RouterAuthenticateMirrorReflect = async(req, res) => {
    let { body: reflex } = req;
    const mirror = new AuthenticationMirror;
    reflex = await mirror.reflect(reflex);
    res.status(200).json(reflex);
};

const RouterAuthenticateMirrorDistort = async(req, res) => {
    let { body: reflex } = req;
    const mirror = new AuthenticationMirror;
    reflex = await mirror.distort(reflex);
    res.status(200).json(reflex);
};

const RouterAuthenticateMirrorKeep = async(req, res) => {
    let { body: reflex } = req;
    const mirror = new AuthenticationMirror;
    reflex = await mirror.keep(reflex);
    res.status(200).json(reflex);
};

const RouterAuthenticateMirrorReveal = async(req, res) => {
    let { body: reflex } = req;
    const mirror = new AuthenticationMirror;
    reflex = await mirror.reveal(reflex);
    res.status(200).json(reflex);
};

// Metodos
router.post('/authenticate/mirror/reflect', RouterAuthenticateMirrorReflect);

// cliente envia um chave para o servidor encriptar um dado do servidor, 
// devolver a cipher para o cliente e o clinete desemcriptar o dados do servidor 
router.post('/authenticate/mirror/distort', RouterAuthenticateMirrorDistort);

router.post('/authenticate/mirror/keep', RouterAuthenticateMirrorKeep);
router.post('/authenticate/mirror/reveal', RouterAuthenticateMirrorReveal);

module.exports = router
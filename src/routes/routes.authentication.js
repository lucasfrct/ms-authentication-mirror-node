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
    mirror.formBox.raw = "Mussum Ipsum, cacilds vidis litro abertis. A ordem dos tratores não altera o pão duris.Delegadis gente finis, bibendum egestas augue arcu ut est.Nullam volutpat risus nec leo commodo, ut interdum diam laoreet. Sed non consequat odio.Quem num gosta di mim que vai caçá sua turmis!";
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
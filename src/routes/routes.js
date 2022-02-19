require('@config/module-alias.config');
const router = require('express').Router();

// ! Imports das rotas
HealthzRoute = require('./healthz.route');
IndexRoute = require('./index.route');
LibRoute = require('./lib.route');
AuthenticationClietMirror = require('./authentication-client-mirror.route');

/**
 * Testa se o servidor está de pé
 */
router.get('/healthz', HealthzRoute);

// ! Files statics to Clinet
router.get('/', IndexRoute);
router.get('/authenticate/mirror/lib', LibRoute);
router.get('/authenticate/mirror/client', AuthenticationClietMirror);


// router.post('/authenticate/mirror/reflect', RouterAuthenticateMirrorReflect);
// cliente envia um chave para o servidor encriptar um dado do servidor, 
// devolver a cipher para o cliente e o clinete desemcriptar o dados do servidor 
// router.post('/authenticate/mirror/distort', RouterAuthenticateMirrorDistort);
// router.post('/authenticate/mirror/keep', RouterAuthenticateMirrorKeep);
// router.post('/authenticate/mirror/reveal', RouterAuthenticateMirrorReveal);
// router.post('/authenticate/mirror/refraction', RouterAuthenticateMirrorRefraction);

module.exports = router;
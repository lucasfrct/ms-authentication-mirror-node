const router = require('express').Router();

// ! Imports das rotas
const HealthzRoute = require('./healthz.route');
const IndexRoute = require('./index.route');
const LibRoute = require('./lib.route');
const UCRoute = require('./uc.route');
const SpecRoute = require('./spec.route');
const ReflectRoute = require('./reflect.route');
const DistortRoute = require('./distort.route');
/**
 * Testa se o servidor está de pé
 */
router.get('/healthz', HealthzRoute);
router.post('/healthz', HealthzRoute);

// ! Files statics to Clinet
router.get('/', IndexRoute);
router.get('/authentication/mirror/lib', LibRoute);
router.get('/authentication/mirror/uc', UCRoute);
router.get('/authentication/mirror/spec', SpecRoute);


router.post('/authentication/mirror/reflect', ReflectRoute);

// // ! cliente envia um chave para o servidor encriptar um dado do servidor, 
// // ! devolver a cipher para o cliente e o clinete desemcriptar o dados do servidor 
// router.post('/authentication/mirror/distort', DistortRoute);
// router.post('/authenticate/mirror/keep', RouterAuthenticateMirrorKeep);
// router.post('/authenticate/mirror/reveal', RouterAuthenticateMirrorReveal);
// router.post('/authenticate/mirror/refraction', RouterAuthenticateMirrorRefraction);

module.exports = router;
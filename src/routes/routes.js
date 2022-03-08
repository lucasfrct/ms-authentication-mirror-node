const router = require('express').Router();

const HealthzRoute = require('./healthz.route');
const IndexRoute = require('./index.route');
const MinRoute = require('./min.route');
const LibRoute = require('./lib.route');
const UCRoute = require('./uc.route');
const SpecRoute = require('./spec.route');
const ReflectRoute = require('./reflect.route');
const KeepRoute = require('./keep.route');
const DistortRoute = require('./distort.route');
const RevealRoute = require('./reveal.route');

router.get('/healthz', HealthzRoute);
router.post('/healthz', HealthzRoute);

router.get('/', IndexRoute);
router.get('/authentication/mirror/min', MinRoute);
router.get('/authentication/mirror/lib', LibRoute);
router.get('/authentication/mirror/uc', UCRoute);
router.get('/authentication/mirror/spec', SpecRoute);

router.post('/authentication/mirror/reflect', ReflectRoute);
router.post('/authentication/mirror/keep', KeepRoute);
router.post('/authentication/mirror/distort', DistortRoute);
router.post('/authentication/mirror/reveal', RevealRoute); 

module.exports = router;
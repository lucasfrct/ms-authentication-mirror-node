require('@config/module-alias.config');

const path = require('path');
const router = require('express').Router();

const AuthenticationMirrorMiddleware = require('@middleware/authentication-mirror-middleware');

const RouterHealthz = async(req, res) => {
    res.status(200).json({ healthz: "OK" });
};

const RouterIndex = (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '../public/index.html'));
};

// healthz - serviço ativo
router.get('/healthz', RouterHealthz);

// Acessando index
router.get('/', RouterIndex, AuthenticationMirrorMiddleware);

module.exports = router;
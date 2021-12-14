require('../config/module-alias.config');

const router = require('express').Router();
const path = require('path');

const Authentication            = require('@middleware/authentication-middleware');

const RouterHealthz = async(req, res)=> {
    res.status(200).json({ healthz: "OK" });
};

const RouterIndex = (req, res)=> {
    res.status(200).sendFile(path.join(__dirname, '../content/pages/index.html'));
};

const RouterLogin = async(req, res)=> {
    const token = res.getHeaders()['x-auth-token'];
    const claims = req.claims;
    console.info('CLAIMS', claims);
    res.status(200).json({ token }); 
};

const RouterSign = async(req, res)=> { 
    const token = res.getHeaders()['X-Auth-Token'];
    const claims = req.claims;
    console.info('CLAIMS', claims);
    res.status(201).json({ token }); 
};

// healthz - serviço ativo
router.get('/healthz', RouterHealthz);

// Criando novas contas
router.post('/sign', Authentication, RouterSign);

// Login na conta
router.post('/login', Authentication, RouterLogin);

// Acessando index
router.get('/', RouterIndex);

module.exports = router;

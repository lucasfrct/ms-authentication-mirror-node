require('@config/module-alias.config');

const router = require('express').Router();

const RouterAuthenticateHybridCrypto = async(req, res) => {
    const file = `${__dirname}/../lib/hybrid-crypto-js/hybrid-crypto-js.js`;
    res.status(200).download(file);
};

const RouterAuthenticateJsSha512 = async(req, res) => {
    const file = `${__dirname}/../lib/js-sha512/js-sha512.js`;
    res.status(200).download(file);
};

const RouterAuthenticateClientMirror = async(req, res) => {
    const file = `${__dirname}/../authentication/AuthenticationClientMirror.js`;
    res.status(200).download(file);
};

// Files
router.get('/authenticate/hybrid-crypto-js', RouterAuthenticateHybridCrypto);
router.get('/authenticate/js-sha512', RouterAuthenticateJsSha512);
router.get('/authenticate/client/mirror', RouterAuthenticateClientMirror);

module.exports = router
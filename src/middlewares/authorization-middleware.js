const handle            = require('@ms-utils-node/src/core/handle');
const logger            = require('@ms-utils-node/src/core/logger-handler');
const Err               = require('@ms-utils-node/src/core/error-handler');
const TemplateEquals    = require('@ms-utils-node/src/core/template-equals');

const Authorization = require("../authorization/Authorization");

const AuthorizationMiddleware = async(req, res, next) => {

    const author = new Authorization;
    const tmp = ['email', 'password'];
    const payload = req.claims
    let  uuid;
    
    if(!TemplateEquals(payload, tmp)) {
        logger.message({ message: 'Os campos da requisição são inválidos' });
        return res.status(422).json({ message: 'Os campos da requisição são inválidos' });
    };

    uuid = await author.verify({ email: payload.email });
    if(!uuid) {
        logger.message({ message: "O este email não existe." });
        return res.status(422).json({ message: "O este email não existe." });
    };

    uuid = await author.verify(payload);

    if(!uuid) {
        logger.message({ message: "A sua senha está errada." });
        return res.status(422).json({ message: "A sua senha está errada." });
    };

    req.claims = { uuid }; 

    return next();
}

module.exports = AuthorizationMiddleware;
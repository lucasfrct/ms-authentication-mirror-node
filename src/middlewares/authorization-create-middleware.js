const handle            = require('@ms-utils-node/src/core/handle');
const logger            = require('@ms-utils-node/src/core/logger-handler');
const Err               = require('@ms-utils-node/src/core/error-handler');
const TemplateEquals    = require('@ms-utils-node/src/core/template-equals');

const Authorization = require("../authorization/Authorization");

const AuthorizationCreateMiddleware = async(req, res, next) => {
    
    const author = new Authorization;
    const tmp = ['email', 'password'];
    const payload = req.claims
    let  uuid;
    
    if(!TemplateEquals(payload, tmp)) {
        logger.message({ message: 'Os campos da requisição são inválidos' })
        return res.status(422).json({ message: 'Os campos da requisição são inválidos' });
    };

    uuid = await author.verify({ email: payload.email });

    if(uuid) {
        logger.message({ message: "O usuário já existe." });
        return res.status(409).json({ message: "O usuário já existe." });
    };

    uuid = await author.create(payload);
    req.claims = { uuid }; 

    return next();

}

module.exports = AuthorizationCreateMiddleware;
const handle            = require('@ms-utils-node/src/core/handle');
const logger            = require('@ms-utils-node/src/core/logger-handler');
const Err               = require('@ms-utils-node/src/core/error-handler');
const TemplateEquals    = require('@ms-utils-node/src/core/template-equals');

const Authorization = require("../authorization/Authorization");

const AuthorizationCredentialsMiddleware = async(req, res, next) => {
    
    const author = new Authorization;
    const payload = req.claims
    let  uuid;

    uuid = await author.verify({ ex_uuid: payload.uuid });

    if(!uuid) {
        uuid = await author.create(payload);
    };

    req.claims = { uuid }; 

    return next();

}

module.exports = AuthorizationCredentialsMiddleware;
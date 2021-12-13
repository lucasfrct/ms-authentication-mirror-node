const handle            = require('@ms-utils-node/src/core/handle');
const logger            = require('@ms-utils-node/src/core/logger-handler');
const Err               = require('@ms-utils-node/src/core/error-handler');
const TemplateEquals    = require('@ms-utils-node/src/core/template-equals');

const Jwt = require('../jwt/Jwt');


const JwtValidateMiddleware = async(req, res, next)=> {

    const jwt = new Jwt();
    const { 'x-auth-token': token } = req.headers;
    // const claims = await jwt.valid(token);

    req.claims = await jwt.valid(token);
    return next();
}

module.exports = JwtValidateMiddleware;
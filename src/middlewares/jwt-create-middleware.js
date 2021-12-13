const handle            = require('@ms-utils-node/src/core/handle');
const logger            = require('@ms-utils-node/src/core/logger-handler');
const Err               = require('@ms-utils-node/src/core/error-handler');
const TemplateEquals    = require('@ms-utils-node/src/core/template-equals');

const Jwt = require('../jwt/Jwt');

const JwtCreateMiddleware = async(req, res, next)=> {

    const jwt = new Jwt();
    const payload = req.claims;
    const tmp = ['uuid'];

    if(!TemplateEquals(payload, tmp)) {
        logger.message({ message: 'Os campos da requisição são inválidos' });
        return res.status(422).json({ message: 'Os campos da requisição são inválidos' });
    };

    res.set(jwt.headers.token, await jwt.session(payload));
    // const token = res.getHeaders()['x-auth-token'];
    return next();
}

module.exports = JwtCreateMiddleware;
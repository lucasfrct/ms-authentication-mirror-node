const handle            = require('@ms-utils-node/src/core/handle');
const logger            = require('@ms-utils-node/src/core/logger-handler');
const Err               = require('@ms-utils-node/src/core/error-handler');
const TemplateEquals    = require('@ms-utils-node/src/core/template-equals');

const Authentication = require('../authentication/AuthenticationMirror');

const AuthenticateMiddleware = async(req, res, next) => {
    try {
        const auth = new Authentication;
        const { cipher } = req.body;

        if(!cipher) {
            logger.error({ message: 'Não foi possível comprocar autenticidade da requisição.' })  
            return res.status(401).json({ message: 'Não foi possível comprocar autenticidade da requisição.' });
        };

        const payload = await auth.ratify(cipher);
        if(!payload) {
            logger.error({ message: "Não foi possível capturar os inputs da requisição." });
            return res.status(422).json({ message: "Não foi possível capturar os inputs da requisição." });
        };

        req.claims = payload;

        return next();

    } catch (err) {
        logger.error({ message: "Servidor indisponível no momento. Tente mais tarde." });
        return res.status(500).json({ message: "Servidor indisponível no momento. Tente mais tarde." });
    }

}

module.exports = AuthenticateMiddleware;
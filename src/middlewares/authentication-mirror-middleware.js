const AuthenticationMirror = require('@authentication/AuthenticationMirror');

const AuthenticateMirrorMiddleware = async(req, res, next) => {
    try {
        const auth = new AuthenticationMirror();
        return next();

    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Servidor indisponível no momento. Tente mais tarde." });
    }
}

module.exports = AuthenticateMirrorMiddleware;
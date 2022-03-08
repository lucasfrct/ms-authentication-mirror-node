const AuthenticationMirror = require('@authentication/AuthenticationMirror');

module.exports = async(req, res) => {
    let { body: reflex } = req;
    const mirror = new AuthenticationMirror();
    reflex = await mirror.keep(reflex);
    reflex.origin.cipher = "";
    res.status(202).json(reflex);
};

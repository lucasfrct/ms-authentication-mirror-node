const AuthenticationMirror = require('@authentication/AuthenticationMirror');

module.exports = async(req, res) => {
    let { body: reflex } = req;
    const mirror = new AuthenticationMirror;
    reflex = await mirror.reflect(reflex);
    res.status(200).json(reflex);
};
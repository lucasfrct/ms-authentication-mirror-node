const AuthenticationMirror = require('@authentication/AuthenticationMirror');

module.exports = async(req, res) => {
    let { body: reflex } = req;
    const mirror = new AuthenticationMirror;
    reflex = await mirror.keep(reflex);
    res.status(200).json(reflex);
};
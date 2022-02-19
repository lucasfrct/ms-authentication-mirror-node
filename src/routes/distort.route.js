const AuthenticationMirror = require('@authentication/AuthenticationMirror');

module.exports = async(req, res) => {
    let { body: reflex } = req;
    const mirror = new AuthenticationMirror;
    mirror.formBox.raw = "Mussum Ipsum, cacilds vidis litro abertis. A ordem dos tratores não altera o pão duris.Delegadis gente finis, bibendum egestas augue arcu ut est.Nullam volutpat risus nec leo commodo, ut interdum diam laoreet. Sed non consequat odio.Quem num gosta di mim que vai caçá sua turmis!";
    reflex = await mirror.distort(reflex);
    res.status(200).json(reflex);
};
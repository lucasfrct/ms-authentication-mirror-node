const path = require("path");

module.exports = async(req, res) => {
    const file = `../public/uc/AuthenticationMirrorClient.spec.js`;
    res.status(200).sendFile(path.join(__dirname, file));
};
const path = require("path");

module.exports = async(req, res) => {
    const file = `../authentication/AuthenticationClientMirror.js`;
    res.status(200).sendFile(path.join(__dirname, file));
};
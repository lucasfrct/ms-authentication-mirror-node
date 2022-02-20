const path = require("path");

module.exports = async(req, res) => {
    const file = `../public/js/authentication-mirror-client.lib.js`;
    res.status(200).sendFile(path.join(__dirname, file));
};
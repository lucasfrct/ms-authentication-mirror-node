const path = require("path");

module.exports = async(req, res) => {
    const file = `../public/uc/spec.js`;
    res.status(200).sendFile(path.join(__dirname, file));
};
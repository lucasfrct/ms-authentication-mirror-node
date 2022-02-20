module.exports = async(req, res) => {
    const { body, method } = req;
    res.status(200).json({ healthz: "OK", method, ...body });;
};
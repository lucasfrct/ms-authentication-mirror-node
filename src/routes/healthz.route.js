module.exports = async(req, res) => {
    const { body, method } = req;
    console.log("DEBUG: ", body, method);
    res.status(200).json({ ...body, healthz: "OK", method  });
};
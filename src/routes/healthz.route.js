const logger = require('@utils/logger');

module.exports = async(req, res) => {
    const { body, method } = req;
    const response ={ ...body, healthz: "OK", method  };
    logger.info(response);
    res.status(200).json(response);
};
const logger = require('./logger');
/**
 * * clone uma objeto
 * @param {*} obj 
 * @returns 
 */
const clone = (obj = undefined) => {
    try {
        if(!obj) {
            logger.error("objecto inexistende");
            return {};
        };

        if(typeof obj === 'object') {
            return JSON.parse(JSON.stringify(obj));
        };

        if(typeof obj === 'string') {
            return JSON.stringify(obj);
        };

        return obj;

    } catch(e) {
        logger.error(e);
        return obj;
    }
};

module.exports = clone;
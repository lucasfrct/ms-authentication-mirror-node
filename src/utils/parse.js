const logger = require('./logger')
 /**
 * * Parseia uma string para json caso seja possível
 * @param   {string} payload
 * @return  {json}   payload 
 */
  const parseToJson = (payload = undefined)=> { 
    try { 

        if (typeof payload !== "string") {
            return payload;
        };
        
        return JSON.parse(payload); 
    } catch (e) { 
        logger.error(e);
        return payload; 
    }; 
}

/**
 *  * Parseia um ojeto JSON  para string, caso seja possível
 * @param   {object}    payload:
 * @return  {string}    payload:
 */
const parseToStr = (payload = undefined)=> {
    try {
        if (typeof payload !== "object") {
            return payload;
        };
        
        return JSON.stringify(payload);
    } catch (e) {
        logger.error(e);
        return payload;
    };
}

module.exports = { parseToJson, parseToStr };
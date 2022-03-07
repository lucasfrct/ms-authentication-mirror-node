
/**
 * * clone uma objeto
 * @param {*} obj 
 * @returns 
 */
const clone = (obj = undefined) => {
    try {
        if(!obj) {
            // TODO: logger
            console.error("objecto inexistende");
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
        // TODO: logger
        console.error(e);
        return obj;
    }
};

module.exports = clone;
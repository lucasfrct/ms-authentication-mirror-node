"use strict";
const TemplateEquals = (payload, tmp)=> {
    try{
        return Object.keys(payload).every(item => { return tmp.filter(e => e === item).length > 0; });
    } catch(e) {
        return false;
    }
};

module.exports = TemplateEquals;
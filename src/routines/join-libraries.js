const { PathMatch } = require('@utils/handle-path');

const JonLibrariesRoutine = async()=> {
    const directory = "./src/lib";
    const destination = "./src/public/js/authentication-client-mirror.lib.js";

    const [err, match] = await PathMatch(directory, destination);
    if(err) {
        return err;
    };
    
    return match;
}

module.exports = JonLibrariesRoutine;
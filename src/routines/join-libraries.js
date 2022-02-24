const { PathMatch, PathRead } = require('@utils/handle-path');

const JonLibrariesRoutine = async()=> {
    const directory = "./src/lib";
    const destination = "./src/public/js/authentication-mirror-client.lib.js";
    const authenticationMirrorClient = "./src/authentication/AuthenticationMirrorClient.js";

    const [err, match] = await PathMatch(directory, destination, joinAuthneticationMirrorClient);
    if(err) {
        return err;
    };

    async function joinAuthneticationMirrorClient(match = "") {
        const auth = await PathRead(authenticationMirrorClient);
        return match + "\n" + auth;
    }
    
    return match;
}

module.exports = JonLibrariesRoutine;



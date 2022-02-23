const JoinLibrariesRoutine = require('./join-libraries');
const MinifyRoutine = require('./minify');

const RoutinesRun = async()=> {
    const returns = [];

    // ! Minifica a classe AuthenticationMirrorClient
    const min = await MinifyRoutine();
    returns.push(min);

    // ! Merge a lib com a classe authentication-mirror-client.lib.min
    const files = await JoinLibrariesRoutine();
    returns.push(files);

};

module.exports = { run: RoutinesRun, RoutinesRun, MinifyRoutine, JoinLibrariesRoutine };
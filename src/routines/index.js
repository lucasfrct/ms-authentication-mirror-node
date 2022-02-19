const JonLibrariesRoutine = require('./join-libraries');

const RoutinesRun = async()=> {
    const returns = [];
    const files = await JonLibrariesRoutine();
    returns.push(files);
};

module.exports = { run: RoutinesRun, RoutinesRun, JonLibrariesRoutine }
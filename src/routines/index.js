const JoinLibrariesRoutine = require('./join-libraries.routine');
const MinifyLibrariesRoutine = require('./minify-libraries.routine');

// * Função principal para a chamada das rotinas
const RoutinesRun = ()=> {
    (async()=> {

        const returns = [];
        // ! Rotina de minificação da biblioteca
        const resultMin = await MinifyLibrariesRoutine();
        returns.push(resultMin);

        // ! Rotina de combinação de bibliotecas
        const resultJoin = await JoinLibrariesRoutine();
        returns.push(resultJoin);

    })();

    // ! middleware
    return (req, res, next)=> { next() };
};


module.exports = { run: RoutinesRun };
const JoinLibrariesRoutine = require('./join-libraries.routine');
const MinifyLibrariesRoutine = require('./minify-libraries.routine');

// * Função principal para a chamada das rotinas
const RoutinesRun = async()=> {
    const returns = [];

    // ! Rotina de minificação da biblioteca
    const min = await MinifyLibrariesRoutine();
    returns.push(min);

    // ! Rotina de combinação de bibliotecas
    const files = await JoinLibrariesRoutine();
    returns.push(files);

    // ? Retorna as repostas das rotinas
    return returns;
};

module.exports = { run: RoutinesRun, RoutinesRun, MinifyLibrariesRoutine, JoinLibrariesRoutine };
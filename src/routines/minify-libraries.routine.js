const UglifyJS = require("uglify-js");
const { PathRead, PathWrite } = require("@utils/handle-path");
const handle = require("@utils/handle");

// * Rotina que minifica a classe AuthenticationMirrorClient
const MinifyLibrariesRoutine = async()=> {
    try {

        // Arquivo a ser manipulado
        const origin    = "./src/authentication/AuthenticationMirrorClient.js";
        const destiny   = "./src/public/js/authentication-mirror-client.min.js";

        // ! Carrega o arquivo da origem
        const [err, authenticationMirrorClient ] = await handle(PathRead(origin));
        if (err) {
            logger.error(err);
            return err;
        };

        // ! Minifica o dado
        const { error, code: authenticationMirrorClientMin } = await UglifyJS.minify(authenticationMirrorClient);
        if (error) {
            logger.error(error);
            return error;
        };

        // ! Cria um novo arquivo minificado
        const [e, result ] = await handle(PathWrite(destiny, authenticationMirrorClientMin));
        if (e) {
            logger.error(e);
            return e;
        };
        
        // ? retorna o diretório de destino
        return destiny;
        
    } catch (e) {
        logger.error(e);
        console.error(e);
        return e;        
    }
}

module.exports = MinifyLibrariesRoutine;
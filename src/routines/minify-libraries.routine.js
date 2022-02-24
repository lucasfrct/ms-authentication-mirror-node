const fs = require("fs");
const UglifyJS = require("uglify-js");

// * Rotina que minifica a classe AuthenticationMirrorClient
const MinifyLibrariesRoutine = async()=> {
    try {
        const origin = "./src/authentication/AuthenticationMirrorClient.js";
        const destination = "./src/public/js/authentication-mirror-client.lib.min.js";

        // ! Carrega o arquivo da origem
        const codeData = await fs.readFileSync(origin, "utf8");

        // ! Minifica o dado
        const { error, code } = UglifyJS.minify(codeData);
        if (error) {
            // TODO: logger
            console.error(err);
            return err;
        };

        // ! Cria o arquivo minificado
        await fs.writeFileSync(destination, code);
        
        // ? retorna o diretório de destino
        return destination;
        
    } catch (e) {
        // TODO: logger
        console.error(e);
        return e;        
    }
}

module.exports = MinifyLibrariesRoutine;
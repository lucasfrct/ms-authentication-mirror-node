const { PathMatch, PathRead } = require('@utils/handle-path');

// * Rotina para Mergir a lib com a classe authentication-mirror-client.lib.min em um unico aquivo
const JonLibrariesRoutine = async()=> {
    const directory = "./src/lib";                                                                  // Diretório das libraries
    const destination = "./src/public/js/authentication-mirror-client.lib.js";                      // Diretório destino
    const authenticationMirrorClient = "./src/public/js/authentication-mirror-client.lib.min.js";   // Diretório da classe minificada

    // ! Desconstroi o erro e o dado combinado
    const [err, match] = await PathMatch(directory, destination, joinAuthneticationMirrorClient);
    if(err) {
        // TODO: 
        console.error("ERRO", err);
        return err;
    };

    // Intercepta a combinação e insere um dado
    async function joinAuthneticationMirrorClient(match = "") {
        const auth = await PathRead(authenticationMirrorClient);
        return match + "\n" + auth;
    }
    
    // ? retorna o array dos caminhos
    return match;
}

module.exports = JonLibrariesRoutine;
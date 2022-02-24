const fs = require("fs");
const path = require("path");

/**
 * * le um arquivo do servidor
 * @param {Sting} file 
 * @returns 
 */
const PathRead = async(file = "")=> {
    try {
        path.join("",file);
        return await fs.readFileSync(file, "utf8");
    } catch (e) {
        return e
    }
}

/**
 * Listas os arquivos em um diretorio e combina todos num só
 * @param {*String} directory: diretorio para ser lido
 * @param {*String} destination : diretorio de destino
 * @returns 
 */
const PathMatch = (directory = "", destination = "", intercept = undefined)=> {
    return new Promise(async(resolve, reject) => {
        try {
            // lista os arquivos do diretorio
            let files = await fs.readdirSync(directory);
            files = files.map(file => path.join(directory, file));

            // carrega os binarios dos arquivos
            let match = "";
            await Promise.all(files.map(async(file)=> { 
                const bin = await PathRead(file); 
                match = match + '\n' + bin;
            })); 

            // desvia o match para outra função assincrona
            if(intercept && typeof intercept == "function") {
                match = await intercept(match);
            };

            // escreve o arquivo combinado num diritório
            await fs.writeFileSync(destination, match);

            resolve([null, files]);
        } catch(e) {
            return resolve([e, null])
        };
    });
};

module.exports = { PathMatch, PathRead };
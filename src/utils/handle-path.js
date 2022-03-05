const fs = require("fs");
const path = require("path");

/**
 * * le um arquivo do servidor
 * @param {Sting} file 
 * @returns 
 */
const PathRead = async(pathname = "")=> {
    return new Promise(async(resolve, reject) => {
        try {

            const { dir } = path.parse(pathname); 

            if(!pathname || typeof pathname !== "string") {
                reject({ message: "path undefined" });
                return;
            };

            if (!fs.existsSync(dir)){
                reject({ message: "directory unexists" });
            };

            if (!fs.existsSync(pathname)){
                reject({ message: "path unexists" });
            };

            const file = await fs.readFileSync(pathname, "utf8");
            
            resolve(file);

        } catch (e) {
            reject(e);
        };
    });
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
            return resolve([e, null]);
        };
    });
};

/**
 * * Cria os diretórios para gravar uma arquivo
 * @param {string} pathname: path 
 * @param {string} content: conteúdo do arquivo
 */
const PathWrite = (pathname = "", content = "")=> { 
    return new Promise(async(resolve, reject) => {
        try { 

            const { dir } = path.parse(pathname); 

            if(!pathname || typeof pathname !== "string") {
                reject({ message: "path undefined" });
                return;
            };

            if(!content || typeof content !== "string") {
                reject({ message: "content undefined" });
                return;
            }

            if (!fs.existsSync(dir)){
                await fs.mkdirSync(dir, { recursive: true });
            }

            if (fs.existsSync(dir) && content.length > 0){
                await fs.writeFileSync(path.resolve(pathname), content);
            }
            
            resolve({ message: "created file"});

        } catch (e) {
            reject(e);
        };
    });
}

const PathExists = async(pathname = "")=> {
    return await fs.existsSync(path.resolve(pathname));
}

const PathRemove = async(pathname = "")=> {
    return await fs.unlinkSync(path.resolve(pathname));
}

const DirRemove = async(directory = "")=> {
    if (await fs.existsSync(directory) && await fs.lstatSync(directory).isDirectory()) {
        return await fs.rmdirSync(path.resolve(directory), { recursive: true, force: true });
    }
}

module.exports = { PathMatch, PathRead, PathWrite, PathExists, PathRemove, DirRemove };


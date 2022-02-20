const fs = require("fs");
const path = require("path");

const read = async(file = "")=> {
    const p =  path.join(__dirname, '../', file)
    const bin = await fs.readFileSync(p, "utf8"); 
    return new Function(`return ${String(bin)}`)();
}

module.exports = { read };


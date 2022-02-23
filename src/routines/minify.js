const fs = require("fs");
const UglifyJS = require("uglify-js");

const MinifyRoutine = async()=> {
    
    const codeData = await fs.readFileSync("./src/authentication/AuthenticationMirrorClient.js", "utf8");
    const { error, code } = UglifyJS.minify(codeData);
    console.log("funfou", code);
    await fs.writeFileSync("./src/public/js/authentication-mirror-client.lib.min.js", code);
    // console.log(error); // runtime error, or `undefined` if no error
    // console.log(code);  // minified output: function add(n,d){return n+d}

}

module.exports = MinifyRoutine;
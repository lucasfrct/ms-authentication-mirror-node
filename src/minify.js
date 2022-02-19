require('dotenv/config');

const fs = require("fs");
const UglifyJS = require("uglify-js");

(async()=>{
    const codeData = await fs.readFileSync("./authentication/AuthenticationClientMirror.js", "utf8");
    console.log("funfou", codeData);
    const { error, code } = UglifyJS.minify(codeData);
    await fs.writeFileSync("./lib/authentication-mirror/authentication-client-mirror-min.js", code);
    console.log(error); // runtime error, or `undefined` if no error
    console.log(code);  // minified output: function add(n,d){return n+d}

})()

// module.exports = Minify;
require('dotenv/config');
require('module-alias/register');

// require('./module-aliases.config');

// ! importa o servidor
const serverApp = require('@src/server');

const options = {
  key: fs.readFileSync(__dirname + '/private.key', 'utf8'),
  cert: fs.readFileSync(__dirname + '/public.cert', 'utf8')
};


const server = https.createServer(options, serverApp);

// ! sobe o servidor
server.listen(process.env.PORT, async() => {
  console.log("Express HTTPS server listening on port " + port);
});
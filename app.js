require('dotenv/config');
require('module-alias/register');

// ! importa o servidor
const serverApp = require('@src/server');
const logger = require("@logger");

// const options = {
//   key: fs.readFileSync(__dirname + '/private.key', 'utf8'),
//   cert: fs.readFileSync(__dirname + '/public.cert', 'utf8')
// };

// const server = https.createServer(options, serverApp);
server = serverApp;

// ! sobe o servidor
server.listen(process.env.PORT, async() => {
  logger.info(`Express HTTP server listening on port ${process.env.PORT}`);
});
require('dotenv/config');
require('module-alias/register');
// require('./src/config/module-alias.config');

// ! importa o servidor
const server = require('./src/server');

// ! sobe o servidor
server.listen(process.env.PORT, async() => {})
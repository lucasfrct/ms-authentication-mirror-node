require('dotenv/config');
require('module-alias/register');

// require('./module-aliases.config');

// ! importa o servidor
const server = require('@src/server');

// ! sobe o servidor
server.listen(process.env.PORT, async() => {});
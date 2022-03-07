require('dotenv/config');
require('module-alias/register')
require('./src/config/module-alias.config');

const server = require('./src/server');

server.listen(process.env.PORT, async() => {})
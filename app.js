require('dotenv/config');
require('./src/config/module-alias.config');

const server = require('./src/server');

server.listen(process.env.PORT, async() => {})
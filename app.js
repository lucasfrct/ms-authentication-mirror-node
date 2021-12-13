require('dotenv/config');
require('./src/config/module-alias.config');

const logger = require('@ms-utils-node/src/core/logger-handler');

const server = require('./src/server');

server.listen(process.env.PORT, async()=> {
    logger.info({
        status: 'listening',
        code: 'AU0001',
        message: `Server ${process.env.ENDPOINT} - PORT: ${process.env.PORT}`,
    });
})

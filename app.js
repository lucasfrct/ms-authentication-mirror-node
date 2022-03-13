require('dotenv/config');
require('module-alias/register');

const logger = require('@utils/logger');

// ! importa o servidor
const server = require('@src/server');

// ! sobe o servidor
server.listen(process.env.PORT, async() => {
  logger.info(`listening on ${process.env.ENDPOINT}:${process.env.PORT}`);
});
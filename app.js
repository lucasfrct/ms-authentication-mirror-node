require('dotenv/config');
require('module-alias/register');

const logger = require('@utils/logger');

// ! importa o servidor
const server = require('@src/server');

// ! sobe o servidor
server.listen(process.env.PORT, async() => {
  logger.info(`listening on ${process.env.ENDPOINT}:${process.env.PORT}`);
  logger.info(`mode environment ${process.env.NODE_ENV}`);
  logger.debug(`mode environment [${process.env.NODE_ENV}]`);
});
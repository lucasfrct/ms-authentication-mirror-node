require('dotenv/config');
require('module-alias/register');

const logger = require('@utils/logger');

// ! importa o servidor
const server = require('@src/server');

// ! sobe o servidor
server.listen(process.env.PORT, async() => {
  logger.info(`listening on: ${process.env.PORT}`);
  logger.info(`author: ${process.env.AUTHOR}`);
  logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
  logger.info(`hostname: ${process.env.HOSTNAME}`);
  logger.info(`workdir: ${process.env.VOLUME}`);
  logger.info(`secret key salt: ${process.env.SECRET_KEY_SALT}`);
});
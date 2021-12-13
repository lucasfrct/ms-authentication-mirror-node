require('dotenv/config');

switch (String(process.env.NODE_ENV).trim()) {
    case "dev":
        process.env.DB_USER = process.env.DEV_DB_USER;
        process.env.DB_PASS = process.env.DEV_DB_PASS;
        process.env.DB_NAME = process.env.DEV_DB_NAME;
        process.env.DB_HOST = process.env.DEV_DB_HOST;
        process.env.DB_PORT = process.env.DEV_DB_PORT;
        process.env.DB_DIALECT = process.env.DEV_DB_DIALECT;
        break;
    case "staging":
        process.env.DB_USER = process.env.STAGING_DB_USER;
        process.env.DB_PASS = process.env.STAGING_DB_PASS;
        process.env.DB_NAME = process.env.STAGING_DB_NAME;
        process.env.DB_HOST = process.env.STAGING_DB_HOST;
        process.env.DB_PORT = process.env.STAGING_DB_PORT;
        process.env.DB_DIALECT = process.env.STAGING_DB_DIALECT;
        break;
    case "production":
        break;
    default:
        console.log("ENVIRONMENT UNDFINED: ", process.env.NODE_ENV);
        break;
}

module.exports = {
  development: {
    username: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASS,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DEV_DB_DIALECT,
    logging: true
  },
  test: {
    username: process.env.STAGING_DB_USER,
    password: process.env.STAGING_DB_PASS,
    database: process.env.STAGING_DB_NAME,
    host: process.env.STAGING_DB_HOST,
    port: process.env.STAGING_DB_PORT,
    dialect: process.env.STAGING_DB_DIALECT,
    logging: true
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: true
  }
};
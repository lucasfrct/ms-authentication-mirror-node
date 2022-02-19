const moduleAlias = require('module-alias');
const path = require('path');

const Aliases = {
    '@config':          path.join(__dirname, './'),
    '@library':         path.join(__dirname, '../lib'),
    '@utils':           path.join(__dirname, '../utils'),
    '@public':          path.join(__dirname, '../public'),
    '@routes':          path.join(__dirname, '../routes'),
    '@routines':        path.join(__dirname, '../routines'),
    '@middleware':      path.join(__dirname, '../middlewares'),
    '@authentication':  path.join(__dirname, '../authentication'),
};

moduleAlias.addAliases(Aliases);
module.exports = moduleAlias();
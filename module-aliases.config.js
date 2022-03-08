require('module-alias/register');
const moduleAlias = require('module-alias');
const path = require('path');

const Aliases = {
  "@root": path.join(__dirname, '.'),
  "@src": path.join(__dirname, './src'),
  '@utils': path.join(__dirname, './src/utils'),
  "@public": path.join(__dirname, './src/public'),
  "@routes": path.join(__dirname, './src/routes'),
  "@library": path.join(__dirname, './src/lib'),
  "@routines": path.join(__dirname, './src/routines'),
  "@middleware": path.join(__dirname, './src/middleware'),
  "@authentication": path.join(__dirname, './src/authentication'),
};

moduleAlias.addAliases(Aliases);

module.exports = moduleAlias();
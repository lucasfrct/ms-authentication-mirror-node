const moduleAlias = require('module-alias');
const path = require('path');

const Aliases = {
  '@utils': path.join(__dirname, '../utils')

};

moduleAlias.addAliases(Aliases);

module.exports = moduleAlias();
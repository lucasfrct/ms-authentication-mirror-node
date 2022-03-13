const aliases = require('module-alias-jest/register');

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  verbose: true,
  coverageProvider: "v8",
  coverageDirectory: "coverage",
  moduleFileExtensions: ["js"],
  moduleNameMapper: aliases.jest,
  coveragePathIgnorePatterns: [ "" ],
  modulePathIgnorePatterns: [ "node_modules", "src/public"],
  testPathIgnorePatterns: [ "node_modules", "src/public"],
  watchPathIgnorePatterns: [ "node_modules", "src/public"],
};

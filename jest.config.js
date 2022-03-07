const aliases = require('module-alias-jest/register');

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [ "" ],
  coverageProvider: "v8",
  moduleFileExtensions: ["js"],
  moduleNameMapper: aliases.jest,
  modulePathIgnorePatterns: [ "node_modules", "src/public"],
  testPathIgnorePatterns: [ "node_modules", "src/public"],
  verbose: true,
  watchPathIgnorePatterns: [ "node_modules", "src/public"],
};

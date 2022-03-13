const pino = require('pino')
const pretty = require('pino-pretty')
const stream = pretty({
  colorize: true,
  level: 'debug'	
})

const logger = pino(stream)

module.exports = logger;
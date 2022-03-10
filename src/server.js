require('dotenv/config');

const express       = require('express');

const cors          = require('cors');            // aceita requisicao cruzada vindo do mesmo servidor
const path          = require('path');
const helmet        = require('helmet');          // protege contra as principais vulnerabiidades
const bodyParser    = require('body-parser');
const compression   = require('compression');     // comprimee as urls em gzip

const pino          = require('pino-http')()

const Routines      = require('@routines');
const Routes        = require('@routes/routes');

// ! instancia o servidor
const app = express();

app.use(pino)
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

// ? definido pasta estática para html e libraries
app.use(express.static(path.join(__dirname, 'public')));

// ? Rotinas de iniciaão do servidor
app.use(Routines.run());

// ? rotas de acesso
app.use("/", Routes);

module.exports = app;

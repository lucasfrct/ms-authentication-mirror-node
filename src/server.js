require('dotenv/config');

const https = require('https');

const cors          = require('cors');
const path          = require('path');
const express       = require('express');
const bodyParser    = require('body-parser');

const Routines      = require('@routines');
const Routes        = require('@routes/routes');

// ! instancia o servidor
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(Routines.run());
app.use("/", Routes);

module.exports = app;
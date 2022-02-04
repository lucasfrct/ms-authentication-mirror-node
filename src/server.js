require('dotenv/config');

const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const Routes = require('@routes/routes');
const RoutesAuthentication = require('@routes/routes.authentication');
const RoutesLibraries = require('@routes/routes.libraries');

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use("/", Routes);
app.use("/", RoutesAuthentication);
app.use("/", RoutesLibraries);

module.exports = app;
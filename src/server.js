require('dotenv/config');

const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const Routes = require('./routes/routes');
const RoutesAuthentication = require('./routes/routes.authentication');

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'content')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use("/", Routes);
app.use("/", RoutesAuthentication);

module.exports = app;
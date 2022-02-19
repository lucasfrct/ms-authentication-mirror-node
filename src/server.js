require('dotenv/config');

const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const Routines = require('@routines');
const Routes = require('@routes/routes');

const app = express();
Routines.run();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use("/", Routes);

module.exports = app;
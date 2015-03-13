'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var controller = require('./flight-controller');

var server = express.Router();

server.get('/:fromCountry', controller.index);
server.get('/search_airport/:airport', bodyParser.json(), controller.searchAirport);

module.exports = server;

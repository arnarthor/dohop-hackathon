'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var flightController = require('./flight-controller');
var dbController = require('./database-controller');

var server = express.Router();

server.get('/search_airport/:airport', bodyParser.json(), flightController.searchAirport);
server.get('/:id',bodyParser.json(),dbController.fetchFlight);

module.exports = server;

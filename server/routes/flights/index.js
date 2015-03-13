'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var controller = require('./flight-controller');

var server = express.Router();

server.get('/search_airport/:airport', bodyParser.json(), controller.searchAirport);
// /api/v1/livestore/{language}/{user-country}/per-country/{departure-airport}/{date-from}/{date-to}?id=H4cK3r
module.exports = server;

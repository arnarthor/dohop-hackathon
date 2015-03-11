'use strict';

var express = require('express');
var controller = require('./flight-controller');

var server = express.Router();

server.get('/:fromCountry', controller.index);

module.exports = server;

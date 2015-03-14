var http = require('http');
var cluster = require('cluster');
var express = require('express');
var cors = require('cors');
var bunyan = require('bunyan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var superagent = require('superagent');

var flightApi = require('./routes/flights');

var config = require('./config');

var worker = 'unknown';
if (cluster.isWorker) {
  worker = cluster.worker.uniqueID;
  config.bunyan.worker = worker;
}
var log = bunyan.createLogger(config.bunyan);

// Pipe console printing to log file instead
// Logging will still show up in console as well.
console.error = log.error.bind(log);
console.log = log.info.bind(log);

// Setup mongodb
mongoose.connect(config.db);

var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);

app.use(bodyParser.json());
app.use(cors());

app.use('*', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  next();
});
app.use('/api', flightApi);

io.on('connection', function(socket) {
  socket.on('request-flight', function(data) {
    superagent.get([
      config.api,
      'livestore',
      'en',
      data.country,
      'per-country',
      data.airport,
      data.from,
      data.to].join('/') +
      '?id=H4cK3r&currency=USD')
		.end(function(err, response) {
			if (err) {
				socket.emit('error', 'something went wrong in the socket');
        return;
			}
      var responseData = JSON.parse(response.text);
      var fares = responseData.fares;
      var airports = responseData.airports;
      if (fares.length) {
        // Check if we have travelled to country
        var travelInfo = {
          fromAirport: fares[0].a,
          destAirport: fares[0].b,
          price: fares[0].conv_fare,
          country: {
            airportName: airports[fares[0].b].a_i,
            city: airports[fares[0].b].a_n,
            countryCode: airports[fares[0].b].cc_c,
            countryName: airports[fares[0].b].cc_n,
            // I have absolutely no idea what this is.
            // It seems to be the city again, but i'm not sure.
            dontKnow: airports[fares[0].b].ci_n,
          },
          departure: fares[0].d1
        };

        socket.emit('new-flight', travelInfo);
      }
		});
  });
});

module.exports = server;

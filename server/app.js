var http = require('http');
var cluster = require('cluster');
var express = require('express');
var cors = require('cors');
var bunyan = require('bunyan');
var bodyParser = require('body-parser');
var superagent = require('superagent');

var flightApi = require('./routes/flights');

var flightController = require('./routes/flights/flight-controller');

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

var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);

app.use(bodyParser.json());
app.use(cors());

app.use('*', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.get('/healthy', function(req, res) {
  res.send('OK');
});
app.use('/api', flightApi);


io.on('connection', function(socket) {
  socket.on('create-journey', function(data) {

  	console.log("hallo");
    flightController.findCheapestFlight(data, socket);
  });
  socket.on('ACK', function(data,data2) {
    flightController.updateACK(data,data2, socket);
  });

});

module.exports = server;

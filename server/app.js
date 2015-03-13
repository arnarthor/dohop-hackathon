var http = require('http');
var cluster = require('cluster');
var express = require('express');
var cors = require('cors');
var bunyan = require('bunyan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

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
  socket.emit('news', {yolo: 'swag'});
  socket.on('request-flight', function(data) {
    console.log('data', data);
  });
});

module.exports = server;

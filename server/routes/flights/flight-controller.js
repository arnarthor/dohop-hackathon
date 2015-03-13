'use strict';
var superagent = require('superagent');
var config = require('../../config');

exports.index = function(req, res) {
  res.send({data: req.params.fromCountry});
};

exports.searchAirport = function(req, res) {
  superagent.get(config.api + 'api/v1/picker/en/' + req.params.airport)
    .set('Accept', 'application/json')
    .end(function(err, response) {
      if (err) {
        return res.status(500).send('Something went wrong :(');
      }
      res.send(JSON.parse(response.text));
    });
};


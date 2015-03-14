'use strict';
var superagent = require('superagent');
var config = require('../../config');
var _ = require("lodash");

exports.index = function(req, res) {
  res.send({data: req.params.fromCountry});
};

exports.searchAirport = function(req, res) {
  superagent.get(config.api + '/picker/en/' + req.params.airport)
    .set('Accept', 'application/json')
    .end(function(err, response) {
      if (err) {
        return res.status(500).send('Something went wrong :(');
      }
      res.send(JSON.parse(response.text));
    });
};

exports.findCheapestFlight = function(travelingInfo, socket) {
  var url = '';
  if (travelingInfo.goHome) {
    url = [
      config.api,
      'livestore',
      'en',
      travelingInfo.departure.country,
      'per-airport',
      travelingInfo.departure.airportCode,
      travelingInfo.startingPoint.airportCode,
      travelingInfo.departure.from,
      travelingInfo.departure.to
    ].join('/') + '?id=H4cK3r&currency=USD&stay=1-365&include_split=true';
  } else {
    url = [
      config.api,
      'livestore',
      'en',
      travelingInfo.departure.country,
      'per-country',
      travelingInfo.departure.airportCode,
      travelingInfo.departure.from,
      travelingInfo.departure.to
    ].join('/') + '?id=H4cK3r&currency=USD';
  }
  superagent.get(url)
	.end(function(err, response) {
		if (err) {
			socket.emit('error', 'something went wrong in the socket');
      return;
		}
    var responseData = JSON.parse(response.text);
    var fares = responseData.fares;
    var airports = responseData.airports;
    var cheapest = 0;
    var countries = _.map(travelingInfo.flights, function(item) {
      return item['departureCountry'].country;
    });
    for (;!travelingInfo.goHome && cheapest < fares.length; cheapest++) {      
      if (countries.indexOf(airports[fares[cheapest].b].cc_c)  === -1) { 
        break;
      }
    };
    if (travelingInfo.flights.length && fares.length === cheapest) {
      socket.emit('go-home', true);
      return;
    }
    var cheapestFlight = fares[0];
    if (fares.length) {
      if (travelingInfo.goHome) {
        cheapestFlight = cheapestFlight[0];
      }
      else {
        cheapestFlight = fares[cheapest];
      }     
      var travelInfo = {
        fromAirport: cheapestFlight.a,
        destAirport: cheapestFlight.b,
        price: cheapestFlight.conv_fare,
        departure: cheapestFlight.d1,
        departureCountry: travelingInfo.departure
      };
      if (airports[cheapestFlight.b]) {
        travelInfo.arrivalCountry = {
          airportCode: airports[cheapestFlight.b].a_i,
          airportName: airports[cheapestFlight.b].a_n,
          countryCode: airports[cheapestFlight.b].cc_c,
          countryName: airports[cheapestFlight.b].cc_n,
          city: airports[cheapestFlight.b].ci_n
        };
      }
      socket.emit('new-flight', travelInfo);
    }
	});
};

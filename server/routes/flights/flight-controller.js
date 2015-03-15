'use strict';
var superagent = require('superagent');
var config = require('../../config');
var _ = require("lodash");
var moment = require('moment');

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

  //Init the duration and change the departure
  if (travelingInfo.flights.length === 0){
   var duration = createStopDuration(travelingInfo.departure.from,travelingInfo.departure.to);

   travelingInfo.stopDuration = duration;
   console.log(duration);

   //FLY ON THE DAY THAT HE WANTS
   travelingInfo.departure.to = travelingInfo.departure.from;
  }



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
    ].join('/') + '?currency=USD&stay=1-365&include_split=true&airport-format=full&fare-format=full&id=H4cK3r';
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
    ].join('/') + '?currency=USD&airport-format=full&fare-format=full&id=H4cK3r';
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


    //check if we have travled there before
    for (;!travelingInfo.goHome && cheapest < fares.length; cheapest++) {  

   
      if (countries.indexOf(airports[fares[cheapest].b].cc_c)  > -1) { 
          continue;
      }

      if (findDistance(airports[fares[cheapest].a].lat,airports[fares[cheapest].a].lon,airports[fares[cheapest].b].lat,airports[fares[cheapest].b].lon)<config.minDistance){
          continue;
      }

      break;


    };

        //go home 
    if (travelingInfo.flights.length && fares.length === cheapest) {
      console.log("home")
      socket.emit('go-home', true);
      return;
    }

    
    //HANDLE EDGE CASE IF NO FLIGHT IS HOME HERE


    var cheapestFlight = fares[cheapest];
    if (fares.length) {
      //console.log(fares[chosenIndex])
      //MABY NO FLIGHT TO ICELAND HERE
      
      var travelInfo = {

        fromAirport: cheapestFlight.a,
        destAirport: cheapestFlight.b,
        price: cheapestFlight.conv_fare,
        departure: cheapestFlight.d1,
        departureCountry: travelingInfo.departure,
        stopDuration: travelingInfo.stopDuration,
      };
      if (airports[cheapestFlight.b]) {
        travelInfo.arrivalCountry = {
          airportCode: airports[cheapestFlight.b].a_i,
          airportName: airports[cheapestFlight.b].a_n,
          countryCode: airports[cheapestFlight.b].cc_c,
          countryName: airports[cheapestFlight.b].cc_n,
          city: airports[cheapestFlight.b].ci_n,
          lat: airports[cheapestFlight.b].lat,
          lon: airports[cheapestFlight.b].lon,
          state: airports[cheapestFlight.b].r_n,
          state_short: airports[cheapestFlight.b].r_c,
        };
      }
      socket.emit('new-flight', travelInfo);
    }


    //whattodo
   else{


   }
	});
};




function findDistance(lat1,lon1,lat2,lon2){

  //HAVERSIN FORMULA


  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  var d = config.earthRadius * c; //distance in km

  return d;
}

function deg2rad (deg){

  return deg * (Math.PI/180);
}

function createStopDuration (startDate,endDate){

  var weeks = moment(endDate).diff(moment(startDate),'weeks');

  var duration = { lowBound:'',highBound:''};

  if(weeks >=24){
    duration.lowBound = 7;
    duration.highBound = 21;
  }
  else if(weeks >=12){
    duration.lowBound = 5;
    duration.highBound = 10;

  }
  else if(weeks >= 4){
  duration.lowBound = 3;
  duration.highBound = 8;

  }
  else{
  duration.lowBound = 2;
  duration.highBound = 4;

  }

  return duration;

};
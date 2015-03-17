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


   //UPDATE THE TRAVELING INFO FOR THE FIRST FLIGHT
   travelingInfo = initFirstFlight(travelingInfo);
   flyNormal(travelingInfo, socket);

};

// Returns the optimal distance from home at current time in trip
function optimalDfh(currentDay, tripLength, dfhMax) {
  var maxDfh = 20000 * dfhMax;
  var optimalDfh;

  if (currentDay <= tripLength / 2) {
    optimalDfh = (maxDfh * currentDay) / (tripLength / 2);
  }
  else {
    optimalDfh = (maxDfh * (tripLength - currentDay)) / (tripLength / 2);
  }
  return optimalDfh;
}

function initFirstFlight(travelingInfo){

    var duration = createStopDuration(travelingInfo.tripDuration.start, travelingInfo.tripDuration.end);
    travelingInfo.firstFlight = true;
    travelingInfo.tripDuration.stopDuration = duration;

    return travelingInfo;
   }

function goHome(travelingInfo,currentLocation){
    //total amount of days where you should be thinking about going home
    var dayAmount = 5;
    if ((travelingInfo.tripDuration.stopDuration.totalDays - dayAmount) < moment(travelingInfo.startingPoint.start).diff(moment(currentLocation.from), 'days')) {
    //MABY  travelingInfo.departure.to = moment(travelingInfo.departure.to).add(100,'days').format('YYYY-MM-DD')
      console.log("GOHOME");
      return true;
    }

    return false;
}


//
function modifyFlightHistory(flightHistory){

  if(flightHistory.length === 0){

    console.log("there is no world trip for youur airport");
    return flightHistory;

  }

  //if there are still items in the array 
  if(flightHistory[flightHistory.length-1].length > 1){

    flightHistory[flightHistory.length-1].shift();

    return flightHistory;

  }

  else{

    flightHistory[flightHistory.length-1].pop();

    return modifyFlightHistory(flightHistory);
  }
}


function flyNormal(travelingInfo, socket) {
  //FIND AWAY HOME BROTHER

  //maby change departur.to here so we deffently get home

  //SHOULD I GO HOME
  var currentLocation = travelingInfo.flightPath[travelingInfo.flightPath.length-1][travelingInfo.flightPath[travelingInfo.flightPath.length-1].length-1]
  var goHome = goHome(travelInfo,currentLocation);

  if (goHome){
      var url = [
        config.api,
        'livestore',
        'en',
        currentLocation.country,
        'per-airport',
        currentLocation.airportCode,
        travelingInfo.startingPoint.airportCode,
        currentLocation.from,
        currentLocation.to,
      ].join('/') + '?currency=USD&stay=1-365&include_split=true&airport-format=full&fare-format=full&id=H4cK3r';
  }

  else if (travelingInfo.firstFlight){

  var url = [
      config.api,
      'livestore',
      'en',
      travelingInfo.startingPoint.country,
      'per-country',
      travelingInfo.startingPoint.airportCode,
      travelingInfo.tripDuration.start,
      travelingInfo.tripDuration.start
    ].join('/') + '?currency=USD&airport-format=full&fare-format=full&id=H4cK3r';
  }

 else{
  var url = [
      config.api,
      'livestore',
      'en',
      currentLocation.country,
      'per-country',
      currentLocation.airportCode,
      currentLocation.from,
      currentLocation.to
    ].join('/') + '?currency=USD&airport-format=full&fare-format=full&id=H4cK3r';
  }

  //DO THE REQUEST
  superagent.get(url)
   .end(function(err, response) {
    if (err) {
      socket.emit('error', 'something went wrong in the socket');
      return;
    }

    //HANDLE THE RESULT----------------------------------------------------------

    var responseData = JSON.parse(response.text);
    var fares = responseData.fares;
    var airports = responseData.airports;


    //DEADZONE
    //||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
    if(fares.length === 0){
      var newFlightHistory = modifyFlightHistory(travelingInfo.flightHistory);

      if (newFlightHistory.length < 1){
        travelingInfo.tripDuration.start
        console.log("there is no trip for this airport");
        //send to the socket and end the connection

        //try to lengthen the first
      }
      travelInfo.flightHistory = newFlightHistory;

      //send the array to the socket

      flyNormal(travelInfo,socket);
      socket.emit('flightPath', travelInfo.flightPath);
    }
    //||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
      
    else {
      //insertion inside history array -----------------
      var bestFlights = [];

      //Take the 3 best flights if there are more then 3
      if(fares.length > 3){
        bestFlights = fares.splice(0,3);
      }

      //else just take the ones who are there
      else{
        bestFlights = fares;
      }
      console.log(bestFlights);
      //push it to the end of the history array
      travelingInfo.flightHistory.push(bestFlights);

      flyNormal(travelInfo,socket);
      socket.emit('flightPath', travelInfo.flightPath);
    }

    //-----------------------------------------------

    //
    //Get the countrys we have allreddy been to
  /*  var countries = _.map(travelingInfo.flights, function(item) {
      return item['departureCountry'].country;
    });
  */

    //var flightIndex = findBestFlight(fares, airports, countries, travelingInfo);

  });
}

function createTravelInfo(cheapestFlight,airports,travelingInfo){

  var travelInfo = {
      fromAirport: cheapestFlight.a,
      destAirport: cheapestFlight.b,
      price: cheapestFlight.conv_fare,
      departure: cheapestFlight.d1,
      departureCountry: travelingInfo.departure,
      stopDuration: travelingInfo.stopDuration,
      endDate:travelingInfo.endDate,
      stateData: 'newDest',
      flightHistory : travelingInfo.flightHistory,
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
    return travelInfo;


}


function findBestFlight(fares, airports, countries, travelingInfo){
  var bestFlightIndex = -1;
  var bestFlightDistance = -1;

  var totalDays = travelingInfo.stopDuration.totalDays;
  var stopDuration = travelingInfo.stopDuration.highBound;
  var dfhMax = travelingInfo.stopDuration.dfhMax;

  for (var i = 0; i < fares.length; i++) {

    // Don't travel to same country again
    if (countries.indexOf(airports[fares[i].b].cc_c)  > -1) continue;

    var departureDay = moment(fares[i].d1).diff(moment(travelingInfo.stopDuration.startDate), 'days');
    var flightDist = findDistance(travelingInfo.startingPoint.location.lat, travelingInfo.startingPoint.location.lng, airports[fares[i].b].lat, airports[fares[i].b].lon);    
    var diff = Math.abs(optimalDfh(departureDay, totalDays, dfhMax) - flightDist);

    if ( diff < bestFlightDistance || bestFlightIndex === -1) {
        bestFlightIndex = i;
        bestFlightDistance = flightDist;
    }
  }

  // If there is no best flight return first 
  if (bestFlightIndex === -1 && fares.length > 0) bestFlightIndex = 0;

  return bestFlightIndex;
}

function isDeadend(flight, cb) {
  var url = [
    config.api,
    'livestore',
    'en',
    flight.arrivalCountry.countryCode,
    'per-country',
    flight.destAirport,
    moment(flight.departureCountry.to).add(flight.stopDuration.lowBound, 'days').format('YYYY-MM-DD'),
    moment(flight.departureCountry.to).add(flight.stopDuration.highBound, 'days').format('YYYY-MM-DD')
  ].join('/') + '?currency=USD&airport-format=full&fare-format=full&id=H4cK3r';

  superagent.get(url)
   .end(function(err, response) {
    if (err) {
      socket.emit('error', 'something went wrong in the socket');
      return;
    }
    var fares = JSON.parse(response.text).fares;
    console.log(fares.length);
    if(fares.length > 0){
      return cb(false);
    }
    else{
      return cb(true);; 
    } 
  });
}


function findDistance(lat1, lon1, lat2, lon2){
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = config.earthRadius * c; //distance in km
  return d;
}


function deg2rad(deg) {
  return deg * (Math.PI/180);
}


//derp
function createStopDuration(startDate, endDate){

  var days = moment(endDate).diff(moment(startDate), 'days');

  var duration = {
    lowBound: '',
    highBound: '',
    dfhMax: 0,
    priceW: 0,
    dfhW: 0,
    totalDays: days,
  };

  if (days >= 24 * 7) {
    duration.lowBound = 7;
    duration.highBound = 21;
    duration.dfhMax = 1;
    duration.priceW = 0.8;
    duration.dfhW = 0.25;
  } else if (days >= 12 * 7) {
    duration.lowBound = 5;
    duration.highBound = 10;
    duration.dfhMax = 0.75;
    duration.priceW = 0.6;
    duration.dfhW = 0.50;
  } else if (days >= 4 * 7) {
    duration.lowBound = 3;
    duration.highBound = 8;
    duration.dfhMax = 0.5;
    duration.priceW = 0.4;
    duration.dfhW = 0.75;
  } else {
    duration.lowBound = 2;
    duration.highBound = 4;
    duration.dfhMax = 0.25;
    duration.priceW = 0;
    duration.dfhW = 1;
  }

  return duration;
}

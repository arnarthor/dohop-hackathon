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


//console.log(travelingInfo.stateData);
  //FIRSTFLIGHT
  if(travelingInfo.stateData === 'firstFlight') {
     //UPDATE THE TRAVELING INFO FOR THE FIRST FLIGHT
     travelingInfo = initFirstFlight(travelingInfo);

     //is it time to go home?
     if (goHome(travelingInfo)) {

      flyHome(travelingInfo, socket);
     }
     else {
     flyNormal(travelingInfo, socket);
    }
  }

  //FIND A NEW FLIGHT
  if (travelingInfo.stateData === 'newFlight') {

    //is it time to go home?
     if(goHome(travelingInfo)){

      flyHome(travelingInfo, socket);
     }
     else {
     flyNormal(travelingInfo, socket);
   }

  }

  if (travelingInfo.stateData === 'homeFlight') {

    //find a way home
    flyHome(travelingInfo);

  }
};

/*function normalDistributionDiff(x, tripLength, stopDuration, dfh) {
  var max = 20000;
  stopDuration = stopDuration * 1.3;
  max = max * dfh;
  var a = Math.pow((x - (tripLength / 2 )), 2);
  return max * Math.exp(a / (2 * Math.pow(stopDuration, 2)));
}*/

function normalDist(x, tripLength, stopDuration, dfh, dfhW) {
  var max = 20000 * dfhW;
  stopDuration = stopDuration;
  max = max * dfh;
  return max * Math.exp(-((Math.pow(x - (tripLength / 2), 2)) / (2 * Math.pow(stopDuration, 2))));
}


function initFirstFlight(travelingInfo){

    var duration = createStopDuration(travelingInfo.departure.from, travelingInfo.departure.to);

     travelingInfo.stopDuration = duration;
     //FLY ON THE DAY THAT HE WANTS
     travelingInfo.departure.to = travelingInfo.departure.from;
     travelingInfo.endDate = travelingInfo.departure.to;


     //console.log('travelingInfo', travelingInfo);
     return travelingInfo;
   }

function goHome(travelingInfo){
    //total amount of days where you should be thinking about going home
    var dayAmount = 5;
    if ((travelingInfo.stopDuration.totalDays - dayAmount) < moment(travelingInfo.departure.from).diff(moment(travelingInfo.endDate), 'days')) {
    //MABY  travelingInfo.departure.to = moment(travelingInfo.departure.to).add(100,'days').format('YYYY-MM-DD')

     return true;
    }

    return false;
}

  function flyHome(travelingInfo, socket) {
    // FIND AWAY HOME BROTHER

    // maby change departur.to here so we deffently get home

    var url = [
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

    //DO THE REQUEST
    superagent.get(url)
     .end(function(err, response) {
      if (err) {
        socket.emit('error', 'something went wrong in the socket');
        return;
      }

      //HANDLE THE RESULT
      var responseData = JSON.parse(response.text);
      var fares = responseData.fares;
      var airports = responseData.airports;

      //HERNA VERÐA EITTHVER ÖNNUR SKYLYRÐI því heim er öðruvísi


        var cheapestFlight = fares[0];


        //if there is a flight there
        //DO THIS ELSE WHERE
        if (fares.length) {

          var travelInfo = {

            fromAirport: cheapestFlight.a,
            destAirport: cheapestFlight.b,
            price: cheapestFlight.conv_fare,
            departure: cheapestFlight.d1,
            departureCountry: travelingInfo.departure,
            stopDuration: travelingInfo.stopDuration,
            endDate: travelingInfo.endDate,
            stateData: 'homeDest',
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

      //á eftir að gera derp aergheariughaeirhg

      //
    });
  }

  function flyNormal(travelingInfo, socket) {
    //FIND AWAY HOME BROTHER

    //maby change departur.to here so we deffently get home

    var url = [
      config.api,
      'livestore',
      'en',
      travelingInfo.departure.country,
      'per-country',
      travelingInfo.departure.airportCode,
      travelingInfo.departure.from,
      travelingInfo.departure.to
    ].join('/') + '?currency=USD&airport-format=full&fare-format=full&id=H4cK3r';

  

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



      //Get the countrys we have allreddy been to
      var countries = _.map(travelingInfo.flights, function(item) {
        return item['departureCountry'].country;
      });

      //FIND THE APROPREATE FLIGHT
      var flightIndex = isValidFlight(fares, airports, countries, travelingInfo);

      //console.log('fares', fares);
      //
      if(flightIndex > -1) {

        var cheapestFlight = fares[flightIndex];


        //if there is a flight there
        //DO THIS ELSE WHERE
        if (fares.length) {

          var travelInfo = {

            fromAirport: cheapestFlight.a,
            destAirport: cheapestFlight.b,
            price: cheapestFlight.conv_fare,
            departure: cheapestFlight.d1,
            departureCountry: travelingInfo.departure,
            stopDuration: travelingInfo.stopDuration,
            endDate:travelingInfo.endDate,
            stateData:'newDest',
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
      };
    });
  };


  function isValidFlight(fares,airports,countries, travelingInfo){

    //ADD VALIDATION HERE --------------------------
    //check if we have travled there before
    var indexCheapest = -1;
    var bestDistance = -1;
    for (var cheapest = 0; cheapest < fares.length; cheapest++) {  

      //check if we have travled there before
      if (countries.indexOf(airports[fares[cheapest].b].cc_c)  > -1) { 

          continue;
      }

      //check if it is within our travel limits
      var dist = findDistance(travelingInfo.startingPoint.location.lat, travelingInfo.startingPoint.location.lng, airports[fares[cheapest].b].lat, airports[fares[cheapest].b].lon);

      console.log('dist', dist);

      var thisDay = moment(fares[cheapest].d1).diff(moment(travelingInfo.stopDuration.startDate), 'days');
      var totalDays = travelingInfo.stopDuration.totalDays;
      var stopDuration = travelingInfo.stopDuration.highBound;
      var dfhMax = travelingInfo.stopDuration.dfhMax;
      var dfhW = travelingInfo.stopDuration.dfhW;
      var idealDist = normalDist(thisDay, totalDays, stopDuration, dfhMax, dfhW);


      var diff = Math.abs(idealDist - dist);

      console.log('thisDay', thisDay);
      console.log('totalDays', totalDays);
      console.log('stopDuration', stopDuration);
      console.log('dfhMax', dfhMax);
      console.log('dfhW', dfhW);
      console.log('idealDist', idealDist);
      console.log('diff', diff);


      if ( diff < bestDistance || indexCheapest === -1) {
          indexCheapest = cheapest;
          bestDistance = dist;
      }
    }

    
    console.log('bestDistance', bestDistance);

    //YOU HAVE NOTHING ELSE TODO
    if (cheapest === -1) {
      //console.log("GOHOME");
      return -1;
    }

    return indexCheapest;



  }

  


function findDistance(lat1, lon1, lat2, lon2){

  //HAVERSIN FORMULA

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
    startDate: startDate,
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

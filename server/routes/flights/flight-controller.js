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

console.log(travelingInfo.stateData);
  //FIRSTFLIGHT
  if(travelingInfo.stateData === 'firstFlight'){
     //UPDATE THE TRAVELING INFO FOR THE FIRST FLIGHT
     travelingInfo = initFirstFlight(travelingInfo);

     //is it time to go home?
     if(goHome(travelingInfo)){

      flyHome(travelingInfo,socket);
     }
     else{
     flyNormal(travelingInfo,socket);
   }
  };

  //FIND A NEW FLIGHT
  if(travelingInfo.stateData === 'newFlight'){

    //is it time to go home?
     if(goHome(travelingInfo)){

      flyHome(travelingInfo,socket);
     }
     else{

     
     flyNormal(travelingInfo,socket);
   }
    //NORMAL FLIGHT
  }

  if(travelingInfo.stateData === 'homeFlight'){

    //find a way home
    flyHome(travelingInfo);

  }
};

function initFirstFlight(travelingInfo){

     var duration = createStopDuration(travelingInfo.departure.from,travelingInfo.departure.to);

     travelingInfo.stopDuration = duration;
     //FLY ON THE DAY THAT HE WANTS
     travelingInfo.departure.to = travelingInfo.departure.from;
     travelingInfo.endDate = travelingInfo.departure.to;

     return travelingInfo
   };

function goHome(travelingInfo){
    //total amount of days where you should be thinking about going home
    var dayAmount = 5;
    if((travelingInfo.stopDuration.totalDays-dayAmount)<moment(travelingInfo.departure.from).diff(moment(travelingInfo.endDate),'days')){
    //MABY  travelingInfo.departure.to = moment(travelingInfo.departure.to).add(100,'days').format('YYYY-MM-DD')


    console.log("hallo");
     return true;
    }

    return false;
};

//DERP
  function flyHome(travelingInfo,socket){
    //FIND AWAY HOME BROTHER

    //maby change departur.to here so we deffently get home

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
            endDate:travelingInfo.endDate,
            stateData:'homeDest',
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
  };

  function flyNormal(travelingInfo,socket){
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
      var flightIndex = isValidFlight(fares,airports,countries);


      //
      if(flightIndex > -1){

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


  function isValidFlight(fares,airports,countries){

    //ADD VALIDATION HERE --------------------------
    //check if we have travled there before
    for (var cheapest = 0;cheapest < fares.length; cheapest++) {  

      //check if we have travled there before
      if (countries.indexOf(airports[fares[cheapest].b].cc_c)  > -1) { 
          continue;
      }

      //check if it is within our travel limits
      if (findDistance(airports[fares[cheapest].a].lat,airports[fares[cheapest].a].lon,airports[fares[cheapest].b].lat,airports[fares[cheapest].b].lon)<config.minDistance){
          continue;
      }

      //DO API CALL HERE TO CHECK IF THIS FARE IS A DEADZONE TOOOOOOOOOODO

      break;
    };

    //YOU HAVE NOTHING ELSE TODO
    if (cheapest === fares.length){
      console.log("GOHOME")
      return -1;
    }

    return cheapest;


  }

  


function findDistance(lat1,lon1,lat2,lon2){

  //HAVERSIN FORMULA


  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1);

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

  var days = moment(endDate).diff(moment(startDate),'days');

  var duration = {
    lowBound: '',
    highBound: '',
    totalDays: days,
  };

  if (days >= 24*7) {
    duration.lowBound = 7;
    duration.highBound = 21;
  } else if (days >=12*7) { 
    duration.lowBound = 5;
    duration.highBound = 10;
  } else if (days >= 4*7) {
    duration.lowBound = 3;
    duration.highBound = 8;
  } else {
    duration.lowBound = 2;
    duration.highBound = 4;
  }

  return duration;
};
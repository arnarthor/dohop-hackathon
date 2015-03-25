'use strict';
var superagent = require('superagent');
var config = require('../../config');
var _ = require("lodash");
var moment = require('moment');
var flight = require('../../models/flightModel.js')

var ACKid = 0;
var ACKfirst = true;


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

    if(travelingInfo.tripDuration.stopDuration === undefined){
      travelingInfo = initFirstFlight(travelingInfo);
    }
    console.log("oft")
    fly(travelingInfo, socket);
};

exports.updateACK = function(data,data2,socket){
  ACKid = data;
  ACKfirst = data2;
}


function initFirstFlight(travelingInfo){
  var duration = createStopDuration(travelingInfo.tripDuration.start, travelingInfo.tripDuration.end);
  travelingInfo.firstFlight = true;
  travelingInfo.tripDuration.stopDuration = duration;

  return travelingInfo;
}

function goHome(travelingInfo){
    var dayAmount = 7;
    if ((travelingInfo.tripDuration.stopDuration.totalDays - dayAmount) < moment(travelingInfo.flightPath[travelingInfo.flightPath.length - 1][0].d1).diff(moment(travelingInfo.tripDuration.start), 'days')) {
      return true;
    }
    return false;
}

// Remove latest flight from flightPath
function removeDeadends(flightPath){
  while(flightPath.length !== 0){
    //if there are still items in the array
    if(flightPath[flightPath.length - 1].length > 1){
      flightPath[flightPath.length - 1].shift();
      return flightPath;
    }
    else{
      flightPath.pop();
      continue;
    }
  }
  console.log('oh shit, no backup plans left! We have to change the duration');
  return flightPath;
}

function fly(travelingInfo, socket) {


  if(!travelingInfo.firstFlight){
    var timeToGoHome = goHome(travelingInfo,currentLocation);

  }

  if(travelingInfo.firstFlight){
    // First flight case
    travelingInfo.firstFlight = false;
      var url = [
      config.api,
      'livestore',
      'en',
      travelingInfo.startingPoint.selectedAirport.country_code,
      'per-country',
      travelingInfo.startingPoint.selectedAirport.airportCode,
      travelingInfo.tripDuration.start,
      travelingInfo.tripDuration.start
    ].join('/') + '?currency=USD&airport-format=full&fare-format=full&id=H4cK3r';
  }

  else if(timeToGoHome){
    // Go home case
    console.log("home")
    var currentLocation = travelingInfo.flightPath[travelingInfo.flightPath.length-1][0]
    var url = [
      config.api,
      'livestore',
      'en',
      currentLocation.airportInfo.cc_c,
      'per-airport',
      currentLocation.b,
      travelingInfo.startingPoint.selectedAirport.airportCode,
      moment(currentLocation.d1).add(travelingInfo.tripDuration.stopDuration.lowBound, 'days').format('YYYY-MM-DD'),
      moment(currentLocation.d1).add(travelingInfo.tripDuration.stopDuration.highBound, 'days').format('YYYY-MM-DD')
    ].join('/') + '?currency=USD&airport-format=full&fare-format=full&id=H4cK3r';
  }
  else{
    // Normal case
    var currentLocation = travelingInfo.flightPath[travelingInfo.flightPath.length-1][0];
    var url = [
      config.api,
      'livestore',
      'en',
      currentLocation.airportInfo.cc_c,
      'per-country',
      currentLocation.b,
      moment(currentLocation.d1).add(travelingInfo.tripDuration.stopDuration.lowBound, 'days').format('YYYY-MM-DD'),
      moment(currentLocation.d1).add(travelingInfo.tripDuration.stopDuration.highBound, 'days').format('YYYY-MM-DD')
    ].join('/') + '?currency=USD&airport-format=full&fare-format=full&id=H4cK3r';
  }

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
    var newFlightPath = [];


    // Check if deadend
    if(fares.length === 0){
      newFlightPath = removeDeadends(travelingInfo.flightPath);
      if (newFlightPath.length < 1){
        console.log("there is no trip for this airport");
        socket.emit('badAirport', travelingInfo);
        return;
        //send to the socket and end the connection
        //try to lengthen the first
      }

      travelingInfo.flightPath = newFlightPath;

    }

    //check if inside blocked zoone
    else {
      var bestFlights = [];

      //check here if next airport is within blockedZone

      for(var s = 0; s<fares.length;s++){

        //if we have 3 good flights exit the for loop
        if(bestFlights.length === 3){
          break;
        }
        var tempAirport = airports[fares[s].b];

        //check if it is our original airport
        if(findDistance(travelingInfo.startingPoint.selectedAirport.location.lat, travelingInfo.startingPoint.selectedAirport.location.lng, tempAirport.lat, tempAirport.lon) && !timeToGoHome ){
          continue;
        }

        //Is this trip maby to exspensive
        if(fares[s].conv_fare > config.maxPrice && !timeToGoHome ){
          continue;
        }

        //IF IT IS OUR FIRST FLIGHT JUST PICK OUR
        if(travelingInfo.flightPath.length > 0){

          for(var k = 0; k<travelingInfo.flightPath.length; k++){
            //check if within blocked zone
            var tempIsBZ = false;
            if(findDistance(travelingInfo.flightPath[k][0].airportInfo.lat,travelingInfo.flightPath[k][0].airportInfo.lon, tempAirport.lat, tempAirport.lon)){
              tempIsBZ = true;
              break;
            }

            //check if within price limit

          }
        }

        if(!tempIsBZ){


          var tempFlight = fares[s];
          console.log(tempFlight);
          tempFlight.airportInfo = tempAirport;
          if(travelingInfo.flightPath.length === 0){

           tempFlight.prevAirport = travelingInfo.startingPoint.selectedAirport.name;
          }
          else{

            tempFlight.prevAirport = travelingInfo.flightPath[travelingInfo.flightPath.length-1][0].airportInfo.a_n;

          }


                  //  console.log(travelingInfo);
          bestFlights.push(tempFlight);
          tempIsBZ = false;
        }
      }

      // Check if blockedZone deadend
      if(bestFlights.length === 0){
        console.log("blockedZone deadend")
        newFlightPath = removeDeadends(travelingInfo.flightPath);

        if (newFlightPath.length < 1){
          console.log("there is no trip for this airport");

          socket.emit('badAirport', travelingInfo);
          return;
          //send to the socket and end the connection
          //try to lengthen the first

        }

        travelingInfo.flightPath = newFlightPath;
      }

      else{
      //Push it to the history array
      travelingInfo.flightPath.push(bestFlights);
      }
    }

    if(timeToGoHome){
      //TODO FIND OUT ABOUT THOSE 3 LEG FLIGHTS
    }
    var newLocation = travelingInfo.flightPath[travelingInfo.flightPath.length - 1][0];
    if(newLocation.b === travelingInfo.startingPoint.selectedAirport.airportCode){
      for(var p = 0; p<travelingInfo.flightPath.length;p++){

        if(p+1===travelingInfo.flightPath.length){
          travelingInfo.flightPath[p][0].stayDuration = "forever"
          break;
        }

        else{
          travelingInfo.flightPath[p][0].stayDuration = moment(travelingInfo.flightPath[p+1][0].d1).diff(moment(travelingInfo.flightPath[p][0].d1),'days');
        }
      }
    }



    // Check if we're home
    if(newLocation.b === travelingInfo.startingPoint.selectedAirport.airportCode){
          return socket.emit('finishFlightPath', travelingInfo);



      console.log('Journey:');


      //STORE THE ID OF THE DUDE HERE AND TELL THE CLIENT THE ID NUMBER

      //MOVE TO DATABASE API TODO////////////////////////////////////////////////////////
      /*flight.create({

        travelingInfo:travelingInfo,
        },function(err,msg){

            if(err){
              console.log(err);
            }

            console.log(msg.id);
            // return the new id and the final array
            return socket.emit('finishFlightPath', travelingInfo.flightPath,msg.id);

        });
    */
      //////////////////////////////////////////////////////////////////////////////////
    }

    //else we keep on trying
    else{
      console.log("her")
      return socket.emit('updateFlightPath', travelingInfo);
    }
  });
}



//
function findDistance(lat1, lon1, lat2, lon2){


  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = config.earthRadius * c; //distance in km
  return config.minDistance>d;
}

//
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

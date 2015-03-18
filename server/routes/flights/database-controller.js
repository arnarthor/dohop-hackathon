'use strict';
var superagent = require('superagent');
var config = require('../../config');
var _ = require("lodash");
var moment = require('moment');
var flight = require('../../models/flightModel.js')



exports.fetchFlight = function(req,res){
  var ObjectId = require('mongoose').Types.ObjectId; 
  flight.findOne({_id: new ObjectId(req.params.id)},function(err,result){
    if(err){
      console.log(err);
    }
    console.log(result.travelingInfo);
    return res.send(result.travelingInfo);
  });
};
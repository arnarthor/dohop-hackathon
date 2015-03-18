//SCHEMA for the trip


var mongoose = require('mongoose');

module.exports = mongoose.model('flight', {
	travelingInfo:Object,
});
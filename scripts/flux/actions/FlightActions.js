import uuid from 'node-uuid';
import moment from 'moment';
import {Actions} from 'flummox';
import request from 'superagent';
import constants from '../../config/constants';

class FlightActions extends Actions {

  setAirport(airport) {
    return airport;
  }

  setDates(dates) {
    var {startDate, endDate} = dates;
    return {startDate, endDate};
  }

  clearSelectedAirport() {
    return 'clear-airport';
  }

  clearAirports() {
    return 'clear';
  }

  setUUID(id) {
    return id;
  }

  airportList(airports, hash) {
    return {airports, hash};
  }

  async searchAirport(searchString) {
    let hash = uuid.v4();
    this.setUUID(hash);
    request.get(`${constants.api}/search_airport/${searchString}`)
      .end(res => {
        this.airportList(res.body, hash);
      });
  }

  createJourney(data) {
    return 'create-journey';
  }

  connectIo() {
    return 'connect-io';
  }
}

export default FlightActions;

import uuid from 'node-uuid';
import {Actions} from 'flummox';
import request from 'superagent';
import constants from '../../config/constants';

class FlightActions extends Actions {
  newFlight(schedule, fromCountry) {
    return {schedule, fromCountry};
  }

  setAirport(airport) {
    return airport;
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

  async fetchFlights(fromCountry) {
    request.get(`${constants.api}/${fromCountry}`)
      .end(res => {
        this.newFlight(res.body, fromCountry);
      });
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

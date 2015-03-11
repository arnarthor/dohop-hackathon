import {Actions} from 'flummox';
import request from 'superagent';
import constants from '../../config/constants';

class FlightActions extends Actions {
  newFlight(schedule, fromCountry) {
    return {schedule, fromCountry};
  }

  async fetchFlights(fromCountry) {
    request.get(`${constants.api}/${fromCountry}`)
      .end(res => {
        this.newFlight(res.body, fromCountry);
      });
  }
}

export default FlightActions;

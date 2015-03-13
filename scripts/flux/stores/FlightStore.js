import _ from 'lodash';
import {Store} from 'flummox';
import constants from '../../config/constants';

class FlightStore extends Store {
  constructor(flux) {
    super();

    let flightActions = flux.getActionIds('FlightActions');
    this.register(flightActions.newFlight, this.reiceveFlights);
    this.register(flightActions.connectIo, this.connectIo);
    this.register(flightActions.airportList, this.airportList);
    this.register(flightActions.setUUID, this.setUUID);

    this.socket = null;
    this.state = {
      desiredHash: '',
      schedule: [],
      airports: [],
    };
  }

  reiceveFlights(results) {
    let {schedule, fromCountry} = results;
    this.setState({
      fromCountry: fromCountry,
      schedule: schedule,
    });
  }

  setUUID(hash) {
    this.setState({desiredHash: hash});
  }

  connectIo() {
    this.socket = window.io.connect(constants.socketIoAPI);
    this.socket.on('new-flight', (data) => this.debug(data));
  }

  airportList(data) {
    var {hash, airports} = data;
    if (hash === this.state.desiredHash) {
      this.setState({airports});
    }
  }

  debug(data) {
    console.log(data);
  }
}

export default FlightStore;

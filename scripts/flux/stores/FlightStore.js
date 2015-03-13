import {Store} from 'flummox';
import constants from '../../config/constants';

class FlightStore extends Store {
  constructor(flux) {
    super();

    let flightActions = flux.getActionIds('FlightActions');
    this.register(flightActions.newFlight, this.reiceveFlights);
    this.register(flightActions.connectIo, this.connectIo);

    this.socket = null;
    this.state = {
      schedule: [],
    };
  }

  reiceveFlights(results) {
    let {schedule, fromCountry} = results;
    this.setState({
      fromCountry: fromCountry,
      schedule: schedule,
    });
  }

  connectIo() {
    this.socket = window.io.connect(constants.socketIoAPI);
    this.socket.emit('request-flight', {swagger: 'yolo'});
    this.socket.on('news', (data) => this.debug(data));
  }

  debug(data) {
    console.log(data);
  }
}

export default FlightStore;

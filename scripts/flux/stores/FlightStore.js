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
    this.register(flightActions.clearAirports, this.clearAirports);
    this.register(flightActions.setAirport, this.setAirport);
    this.register(flightActions.clearSelectedAirport, this.clearSelectedAirport);
    this.register(flightActions.createJourney, this.createJourney);

    this.socket = null;
    this.state = {
      desiredHash: '',
      selectedAirport: null,
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
  createJourney() {
    let journey = {
      'country' : this.state.selectedAirport.country_code,
      'airport' : this.state.selectedAirport.airports[0],
      'from' : '2015-3-20',
      'to' : '2015-3-22'
    }
    this.socket.emit('request-flight', journey);

  }

  clearAirports() {
    this.setState({airports: []});
  }

  clearSelectedAirport() {
    this.setState({selectedAirport: null});
  }

  setUUID(hash) {
    this.setState({desiredHash: hash});
  }

  setAirport(airport) {
    this.setState({selectedAirport: airport});
  }

  connectIo() {
    this.socket = window.io.connect(constants.socketIoAPI);
    this.socket.on('new-flight', (data) => this.debug(data));
  }

  airportList(data) {
    this.clearSelectedAirport();
    let {hash, airports} = data;
    let localAirports = _.map(airports.matches, airport =>
      airport.children ||
      airport.members ||
      airport);

    let airportList = [];
    _.forEach(localAirports, currentAirports => airportList = airportList.concat(currentAirports));

    if (hash === this.state.desiredHash) {
      this.setState({airports: airportList});
    }
  }

  debug(data) {
    console.log(data);
  }
}

export default FlightStore;

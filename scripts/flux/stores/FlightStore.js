import _ from 'lodash';
import {Store} from 'flummox';
import moment from 'moment';
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
    this.register(flightActions.clearSelectedAirport, this.clearSelectedAirport);
    this.register(flightActions.setAirport, this.setAirport);
    this.register(flightActions.createJourney, this.createJourney);
    this.register(flightActions.setDates, this.setDates);
    this.register(flightActions.setImage, this.setImage);

    this.socket = null;
    this.state = {
      desiredHash: '',
      flightPath: [],
      airports: [],
      dates: {
        startDate: moment().add(1, 'days'),
        endDate: moment().add(32, 'days')
      },
    };
  }

  // Start journey creation server side
  createJourney(flightHash) {
    console.log('Create journey!');
    this.setState({flightPath: [], flightHash});

    let selectedAirport = _.clone(this.state.selectedAirport);
    let journeyData = {
      startingPoint: {selectedAirport},
      tripDuration: {
        start: this.state.dates.startDate.format('YYYY-MM-DD'),
        end: this.state.dates.endDate.format('YYYY-MM-DD'), 
      },
      flightPath:[],
      id:Math.random()*100,
    };
        this.socket.emit('ACK',journeyData.id,true);
        this.socket.emit('create-journey', journeyData);
  }

  clearSelectedAirport() {
    this.setState({selectedAirport: null});
  }

  clearAirports() {
    this.setState({airports: []});
  }

  setUUID(hash) {
    this.setState({desiredHash: hash});
  }

  setAirport(airport) {
    this.setState({selectedAirport: _.clone(airport)});
  }

  setDates(dates) {
    this.setState({dates});
  }

  updateFlightPath(data) {
    this.setState({flightPath: data.flightPath});
    this.socket.emit('ACK',data.id,false);

  }

  setImage(data) {
    let flightPath = _.clone(this.state.flightPath)
    let flight = _.findWhere(flightPath, [{d1: data.date}]);
    let index = _.indexOf(flightPath,flight);
    flight[0].image = data.url;
    flightPath[index] = flight;
    this.setState({flightPath: flightPath});
  }

  connectIo() {
    this.socket = window.io.connect(constants.socketIoAPI);
    this.socket.on('updateFlightPath', (data) => this.updateFlightPath(data));
    this.socket.on('error', (data) => this.debug(data));
  }

  airportList(data) {
    let {hash, airports} = data;
    let localAirports = _.map(airports.matches, airport =>
      airport.children ||
      airport.members ||
      airport);

    let airportList = [];
    _.forEach(localAirports, currentAirports => airportList = airportList.concat(currentAirports));
    airportList = _.map(airportList, airport => {
      airport.airportCode = airport.airports[0];
      delete airport.airports;
      return airport;
    })

    if (hash === this.state.desiredHash) {
      this.setState({airports: airportList});
    }
  }
}

export default FlightStore;

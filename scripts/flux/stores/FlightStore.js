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
    this.register(flightActions.setAirport, this.setAirport);
    this.register(flightActions.clearSelectedAirport, this.clearSelectedAirport);
    this.register(flightActions.createJourney, this.createJourney);
    this.register(flightActions.setDates, this.setDates);

    this.socket = null;
    this.state = {
      desiredHash: '',
      selectedAirport: null,
      flights: [],
      airports: [],
      dates: {
        startDate: moment().add(1, 'days'),
        endDate: moment().add(8, 'days')
      },
    };
  }

  createJourney() {
    this.setState({flights: []});

    console.log(this.state.selectedAirport);

    let travelingData = {
      departure: {
        airportName: this.state.selectedAirport.name,
        country: this.state.selectedAirport.country_code,
        airportCode: this.state.selectedAirport.airportCode,
        from: this.state.dates.startDate.format('YYYY-MM-DD'),
        to: this.state.dates.endDate.format('YYYY-MM-DD'),
      },
      goHome: this.state.flights.length === 5,
      flights: [],
      startingPoint: this.state.selectedAirport,
    };

    this.socket.emit('request-flight', travelingData);
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

  setDates(dates) {
    this.setState({dates});
  }

  addFlight(flight) {

    let flights = this.state.flights;
    let lastFlight;
    if (flights.length > 0) {
      lastFlight = _.last(flights);
      let currentArrival = moment(lastFlight.departure);
      let nextArrival = moment(flight.departure);
      lastFlight.daysStaying = currentArrival.from(nextArrival);
      flights = _.initial(flights).concat(lastFlight);
    }
    this.setState({flights: flights.concat(flight)});
    if (flight.destAirport === this.state.selectedAirport.airportCode) return;

   
    let travelingData = {
      departure: {
        airportName: flight.arrivalCountry.airportName,
        country: flight.arrivalCountry.countryCode,
        airportCode: flight.destAirport,
        from: moment(flight.departure).add(2, 'days').format('YYYY-MM-DD'),
        to: moment(flight.departure).add(7, 'days').format('YYYY-MM-DD'),
        lat: flight.arrivalCountry.lat,
        lon: flight.arrivalCountry.lon,
      },
      goHome: this.state.flights.length === 5,
      flights: this.state.flights,
      startingPoint: this.state.selectedAirport,
    };

  

    this.socket.emit('request-flight', travelingData);
  }

  connectIo() {
    this.socket = window.io.connect(constants.socketIoAPI);
    this.socket.on('new-flight', (data) => this.addFlight(data));
    this.socket.on('error', (data) => this.debug(data));
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
    airportList = _.map(airportList, airport => {
      airport.airportCode = airport.airports[0];
      delete airport.airports;
      return airport;
    })

    if (hash === this.state.desiredHash) {
      this.setState({airports: airportList});
    }
  }

  debug(data) {
    console.log(data);
  }
}

export default FlightStore;

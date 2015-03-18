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
    };

    this.socket.emit('create-journey', journeyData);
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
    this.setState({flightPath: data});
  }

/*
  addFlight(flight) {

        //If we are home
      if(flight.stateData === 'homeDest'){        
        console.log('IM HOME', flight);
        let flights = _.clone(this.state.flights);

        let lastFlight;

        //If we got a succesfull new flight
        if (flights.length> 0) {
          lastFlight = _.last(flights);
          let currentArrival = moment(lastFlight.departure);
          let nextArrival = moment(flight.departure);
          lastFlight.daysStaying = currentArrival.from(nextArrival);
          flights = _.initial(flights).concat(lastFlight);
        }

        //update the flights global array
        this.setState({flights: flights.concat(flight)});
        return;
    }

    let flights = _.clone(this.state.flights);
    let lastFlight;

    //If we got a succesfull new flight
    if (flights.length> 0) {
      lastFlight = _.last(flights);
      let currentArrival = moment(lastFlight.departure);
      let nextArrival = moment(flight.departure);
      lastFlight.daysStaying = currentArrival.from(nextArrival);
      flights = _.initial(flights).concat(lastFlight);
    }

    //update the flights global array
    this.setState({flights: flights.concat(flight)});

    //Fetch another flight
    let travelingData = {
      departure: {
        airportName: flight.arrivalCountry.airportName,
        country: flight.arrivalCountry.countryCode,
        airportCode: flight.destAirport,
        from: moment(flight.departure).add(flight.stopDuration.lowBound,'days').format('YYYY-MM-DD'),
        to: moment(flight.departure).add(flight.stopDuration.highBound, 'days').format('YYYY-MM-DD'),
        lat: flight.arrivalCountry.lat,
        lon: flight.arrivalCountry.lon,
      },
      flights: this.state.flights,
      startingPoint: this.state.selectedAirport,
      stopDuration:flight.stopDuration,
      endDate:flight.endDate,
      stateData:'newFlight',
      flightHistory: flight.flightHistory,
    };
    this.socket.emit('request-flight', travelingData);
  }
  */

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
    /*
    this.socket.on('new-flight', (data) => this.addFlight(data));
    this.socket.on('go-home', (data) => this.setHome(data));
    this.socket.on('removeLast-flight',(data) => this.removeLast(data));
    this.socket.on('removeLastTwo-flight',(data) => this.removeLastTwo(data));
    */
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

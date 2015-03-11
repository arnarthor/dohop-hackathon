import {Store} from 'flummox';

class FlightStore extends Store {
  constructor(flux) {
    super();

    let scheduleActionIds = flux.getActionIds('FlightActions');
    this.register(scheduleActionIds.newFlight, this.reiceveFlights);

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
}

export default FlightStore;

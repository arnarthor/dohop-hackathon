import {Flux} from 'flummox';
import FlightActions from './actions/FlightActions.js';
import FlightStore from './stores/FlightStore.js';

class AppFlux extends Flux {
  constructor() {
    super();

    this.createActions('FlightActions', FlightActions);
    this.createStore('FlightStore', FlightStore, this);
  }
}

export default AppFlux;

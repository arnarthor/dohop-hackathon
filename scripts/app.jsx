'use strict';

import _ from 'lodash';
import React from 'react/addons';
import FluxContainer from 'flummox';
import constants from './config/constants';

require('./app.scss');

let Props = React.PropTypes;
let CSSTransitionGroup = React.addons.CSSTransitionGroup;


let App = React.createClass({

  getInitialState() {
    return {airportSearch: ''};
  },

  componentDidMount() {
    this.props.flux.getActions('FlightActions').connectIo();
  },

  render() {
    return (
      <div className="hero">
        <h1>DISCOVER THE WORLD</h1>
        <form>
          <span className="wrapper">
            <input
              value={this.state.airportSearch}
              onChange={(event) => this.handleSearchAirport(event)}
              placeholder="Starting airport">
            </input>
          </span>
          <span className="wrapper">
            <input placeholder="Start date"></input>
          </span>
          <span className="wrapper">
            <input placeholder="End date"></input>
          </span>
          <button>Create journey</button>
        </form>
        <div>{this.props.schedule}</div>
      </div>
    );
  },

  handleSearchAirport(event) {
    let airportSearch = event.target.value;
    this.setState({airportSearch})
    this.performSearch();
  },

  performSearch: _.debounce(function() {
    let airportSearch = this.state.airportSearch;
    if (airportSearch.length >= 2) {
      this.props.flux.getActions('FlightActions').searchAirport(airportSearch);
    }
  }, 200),

  fetchFlights(fromCountry) {
    this.props.flux.getActions('FlightActions').fetchFlights(fromCountry);
  }
});

export default App;

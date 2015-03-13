'use strict';

import _ from 'lodash';
import React from 'react/addons';
import FluxContainer from 'flummox';
import constants from './config/constants';
import SearchResults from './components/SearchResults.jsx';

require('./app.scss');

const Props = React.PropTypes;
const CSSTransitionGroup = React.addons.CSSTransitionGroup;
const classSet = React.addons.classSet;

let App = React.createClass({

  getInitialState() {
    return {
      airportSearch: '',
      showLandingPage: true,
    };
  },

  componentDidMount() {
    this.props.flux.getActions('FlightActions').connectIo();
  },

  render() {
    let formClasses = {
      search: true,
      min: !this.state.showLandingPage,
    };
    return (
      <div className={classSet(formClasses)}>
        <h1>DISCOVER THE WORLD</h1>
        <form>
          <span className="wrapper">
            <input
              value={this.state.airportSearch}
              onChange={(event) => this.handleSearchAirport(event)}
              placeholder="Starting airport">
            </input>
            <SearchResults
              airports={this.props.airports}
            />
          </span>
          <span className="wrapper">
            <input type="date" placeholder="Start date"></input>
          </span>
          <span className="wrapper">
            <input type="date" placeholder="End date"></input>
          </span>
          <button onClick={(event) => this.handleCreateJourney(event)}>Create journey</button>
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
    } else {
      this.props.flux.getActions('FlightActions').clearAirports();
    }
  }, 200),

  fetchFlights(fromCountry) {
    this.props.flux.getActions('FlightActions').fetchFlights(fromCountry);
  },

  handleCreateJourney(event) {
    event.preventDefault();
    this.setState({showLandingPage: !this.state.showLandingPage});
  }
});

export default App;

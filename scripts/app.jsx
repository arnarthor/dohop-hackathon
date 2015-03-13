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
      showSearchResults: true,
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
    let airportSearch = this.state.airportSearch;
    let selectedAirport = this.props.selectedAirport;

    if (selectedAirport) {
      airportSearch = `${selectedAirport.name} (${selectedAirport.airports[0]})`;
    }

    return (
      <div className={classSet(formClasses)}>
        <h1>DISCOVER THE WORLD</h1>
        <form>
          <span className="wrapper">
            <input
              value={airportSearch}
              onFocus={(event) => this.handleOnFocus(event)}
              onChange={(event) => this.handleSearchAirport(event)}
              placeholder="Starting airport">
            </input>
          </span>
          <SearchResults
            flux={this.props.flux}
            airports={this.props.airports}
            selectedAirport={this.props.selectedAirport}
            selectAirport={this.handleSetAirport}
            showList={this.state.showSearchResults}
          />
          <span className="wrapper">
            <input ref="startDate" type="date" placeholder="Start date"></input>
          </span>
          <span className="wrapper">
            <input type="date" placeholder="End date"></input>
          </span>
          <button onClick={(event) => this.handleCreateJourney(event)}>
            Create journey
          </button>
        </form>
        <div>{this.props.schedule}</div>
      </div>
    );
  },

  handleOnFocus() {
    this.setState({showSearchResults: true});
  },

  handleSearchAirport(event) {
    let airportSearch = event.target.value;
    this.props.flux.getActions('FlightActions').clearSelectedAirport();
    this.setState({airportSearch})
    this.performSearch();
  },

  handleSetAirport(event, airport) {
    this.setState({showSearchResults: false});
    this.props.flux.getActions('FlightActions').setAirport(airport);
    this.refs.startDate.getDOMNode().focus();
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
    if (!this.props.selectedAirport) {
      alert('Obb bobb bobb, this isnt an airport');
      return;
    }
    this.setState({showLandingPage: !this.state.showLandingPage});
    this.props.flux.getActions('FlightActions').createJourney();
  }
});

export default App;

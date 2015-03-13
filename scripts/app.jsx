'use strict';

import _ from 'lodash';
import React from 'react/addons';
import FluxContainer from 'flummox';
import constants from './config/constants';
import Moment from 'moment';
import BS from 'react-bootstrap';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import SearchResults from './components/SearchResults.jsx';

require('./app.scss');
require('./datetimefield.scss');

const Props = React.PropTypes;
const CSSTransitionGroup = React.addons.CSSTransitionGroup;
const classSet = React.addons.classSet;

let App = React.createClass({

  getInitialState() {
    return {
      airportSearch: '',
      showLandingPage: true,
      startDate: Moment(),
      endDate: Moment().add(7, 'days')
    };
  },

  componentDidMount() {
    this.props.flux.getActions('FlightActions').connectIo();
  },

  handleEvent(event) {
        console.log('YOLO', event);
    },

  render() {
    let formClasses = {
      search: true,
      min: !this.state.showLandingPage,
    };

    let start = this.state.startDate.format('YYYY-MM-DD');
    let end = this.state.endDate.format('YYYY-MM-DD');
    let label = (start === end ? start : start + ' - ' + end);

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

          <DateRangePicker startDate={this.state.startDate} endDate={this.state.endDate} onEvent={this.handleEvent}>
            <span>{label}</span>
          </DateRangePicker>

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

'use strict';

import _ from 'lodash';
import React from 'react/addons';
import FluxContainer from 'flummox';
import constants from './config/constants';
import SearchResults from './components/SearchResults';
import GoogleMap from './components/GoogleMap';
import TimeoutTransitionGroup from './TimeoutTransitionGroup';
import DateRangePicker from './components/daterangepicker';
import JourneyPlan from './components/JourneyPlan.jsx';
import moment from 'moment';

require('./app.scss');
require('./components/daterangepicker/DateRangePicker.scss');

const Props = React.PropTypes;
const classSet = React.addons.classSet;

const App = React.createClass({

  getInitialState() {
    return {
      airportSearch: '',
      activeAirport: 1,
      useSelectedAirport: false,
      showLandingPage: true,
      showSearchResults: true,
      minimizeSearchResults: false,
      showJourneyPlan: false,
      location: {
        lat: null,
        lng: null,
      },
    };
  },

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(location => {
      this.setState({
        location: {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        }
      });
    });
    this.refs.searchBar.getDOMNode().focus();
    this.props.flux.getActions('FlightActions').connectIo();
  },

  render() {
    let formClasses = {
      search: true,
      min: !this.state.showLandingPage,
    };

    let twinklingClasses = {
      twinkling: true,
      hide: !this.state.showLandingPage,
    };

    let twinklingBgClasses = {
      twinkling_bg: true,
      hide: !this.state.showLandingPage,
    };

    let selectedAirport = this.props.selectedAirport;
    let start = this.props.dates.startDate.format('ll');
    let end = this.props.dates.endDate.format('ll');
    let label = start + ' - ' + end;
    let minDate = moment().add(1, 'days');
    let location = selectedAirport && selectedAirport.location || this.state.location;

    return (
      <div>
      <div className={classSet(twinklingClasses)}></div>
        <div className={classSet(twinklingClasses)}></div>
        <div className={classSet(formClasses)}>
          <h1>DISCOVER THE WORLD</h1>
          <form>
            <span className="wrapper location">
              <input
                ref="searchBar"
                value={this.state.airportSearch}
                onFocus={(event) => this.handleOnFocus(event, true)}
                onBlur={(event) => this.handleOnFocus(event, false)}
                onChange={(event) => this.handleSearchAirport(event)}
                onKeyDown={this.handleKeyDown}
                placeholder="Starting airport"
              />
            </span>
            <TimeoutTransitionGroup
              enterTimeout={300}
              leaveTimeout={300}
              transitionName="fade"
            >
              {(this.state.showSearchResults) ? [
                <SearchResults
                  active={this.state.activeAirport}
                  key={this.props.airports}
                  flux={this.props.flux}
                  airports={this.props.airports}
                  selectedAirport={selectedAirport}
                  selectAirport={this.handleSetAirport}
                  showList={this.state.showSearchResults}
                  min={this.state.minimizeSearchResults}
                />
              ] : []}
            </TimeoutTransitionGroup>
            <span className="wrapper">
              <DateRangePicker
                ref="dates"
                minDate={minDate}
                startDate={this.props.dates.startDate}
                endDate={this.props.dates.endDate}
                onEvent={this.handleDatePicker}>
                <span className="DatePicker">{label}</span>
              </DateRangePicker>
            </span>
            <button onClick={(event) => this.handleCreateJourney(event)}>
              Create journey
            </button>
          </form>
          <div>{this.props.schedule}</div>
        </div>
        <JourneyPlan
          flights={this.props.flights}
          display={this.state.showJourneyPlan}
          flux={this.props.flux}
        />
        {this.props.selectedAirport &&
          <GoogleMap
            flightHash={this.props.flightHash}
            flights={this.props.flights}
            location={location}
          />
        }
      </div>
    );
  },

  handleKeyDown(event) {
    if (event.key !== 'ArrowUp' &&
      event.key !== 'ArrowDown' &&
      event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    if (event.key === 'ArrowUp') {
      if (this.state.activeAirport - 1 < 1) return;
      this.setState({
        activeAirport: this.state.activeAirport - 1,
        showSearchResults: true
      });
    } else if (event.key === 'ArrowDown') {
      if (this.state.activeAirport + 1 > this.props.airports.length) return;
      this.setState({
        activeAirport: this.state.activeAirport + 1,
        showSearchResults: true
      });
    } else if (event.key === 'Enter') {
      this.handleSetAirport(event, this.props.airports[this.state.activeAirport - 1]);
    }
  },

  handleDatePicker(event, picker) {
    this.props.flux.getActions('FlightActions').setDates(picker);
  },

  handleOnFocus(event, value) {
    event.preventDefault();
    this.setState({showSearchResults: value});
  },

  handleSetAirport(event, airport) {
    this.setState({
      showSearchResults: false,
      airportSearch: `${airport.name} (${airport.airportCode})`
    });
    this.props.flux.getActions('FlightActions').fetchAirport(airport);
    this.refs.dates.getDOMNode().focus();
  },

  handleSearchAirport(event) {
    let airportSearch = event.target.value;
    if (this.props.selectedAirport) {
      this.props.flux.getActions('FlightActions').clearAirports();
      if (airportSearch.length < this.state.airportSearch.length) {
        airportSearch = '';
      } else {
        airportSearch = airportSearch.slice(-1);
      }
    }
    this.props.flux.getActions('FlightActions').clearSelectedAirport();

    this.setState({airportSearch,
      useSelectedAirport: false,
      activeAirport: 1,
      showSearchResults: true});
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
    if (!this.props.selectedAirport) {
      alert('Obb bobb bobb, this isnt an airport');
      return;
    } else if (this.props.dates.startDate.format('YYYY-MM-DD') === this.props.dates.endDate.format('YYYY-MM-DD')) {
      alert('Obb bobb bobb, invalid date');
      return;
    }

    this.setState({showLandingPage: false});
    this.setState({showJourneyPlan: true});
    this.setState({minimizeSearchResults: !this.state.minimizeSearchResults});
    this.props.flux.getActions('FlightActions').createJourney();
  }
});

export default App;

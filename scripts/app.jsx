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

    let airportSearch = this.state.airportSearch;
    let selectedAirport = this.props.selectedAirport;

    let start = this.props.dates.startDate.format('ll');
    let end = this.props.dates.endDate.format('ll');
    let label = start + ' - ' + end;
    let minDate = moment().add(1, 'days');

    if (selectedAirport && this.state.useSelectedAirport) {
      airportSearch = `${selectedAirport.name} (${selectedAirport.airportCode})`;
    }

    let location = this.props.selectedAirport && this.props.selectedAirport.location;

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
                value={airportSearch}
                onFocus={(event) => this.handleOnFocus(event, true)}
                onBlur={(event) => this.handleOnFocus(event, false)}
                onChange={(event) => this.handleSearchAirport(event)}
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
                  key={this.props.airports}
                  flux={this.props.flux}
                  airports={this.props.airports}
                  selectedAirport={this.props.selectedAirport}
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
          flightPath={this.props.flightPath}
          display={this.state.showJourneyPlan}
          flux={this.props.flux}
        />
        {this.props.selectedAirport &&
          <GoogleMap
            flightPath={this.props.flights}
          />
        }
      </div>
    );
  },

  handleDatePicker(event, picker) {
    this.props.flux.getActions('FlightActions').setDates(picker);
  },

  handleOnFocus(event, value) {
    event.preventDefault();
    this.setState({showSearchResults: value});
  },

  handleSearchAirport(event) {
    let airportSearch = event.target.value;
    this.setState({airportSearch, useSelectedAirport: false})
    this.performSearch();
  },

  handleSetAirport(event, airport) {
    this.setState({showSearchResults: false, useSelectedAirport: true});
    this.props.flux.getActions('FlightActions').fetchAirport(airport);
    this.refs.dates.getDOMNode().focus();
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
    this.setState({minimizeSearchResults: true});
    this.props.flux.getActions('FlightActions').createJourney();
  }
});

export default App;

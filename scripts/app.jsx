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
import AlertBox from './components/AlertBox.jsx';
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
      alertShow: false,
      alertPositive: true,
      alertMessage: '',
    };
  },

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(location => {
      this.setState({
        location: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        }
      });
    });
    this.refs.searchBar.getDOMNode().focus();
    this.props.flux.getActions('FlightActions').connectIo();
  },

  componentWillReceiveProps(props) {
    if(props.flightPath.length){
      if(props.selectedAirport){
        if(_.first(_.last(props.flightPath)).b === props.selectedAirport.airportCode){
          this.setState({
            showJourneyPlan: true,
            alertShow: false,
            alertMessage: '',
          });
        }
        else{
          this.setState({
            showJourneyPlan: false,
          });
        }
      }
    }
    if(props.showError){
            this.setState({
        alertPositive: false,
        alertShow: true,
        alertMessage: "Oh no! We didn't find any trip at this time from this airport."
      });
    }
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
        <AlertBox
          alertShow={this.state.alertShow}
          alertPositive={this.state.alertPositive}
          alertMessage={this.state.alertMessage}
        />
        <div className="About">
          <div className="About__title">About the project</div>
          <p className="About__content">
            Created for <a className="About__content__link" href="http://www.dohop.com/" target="_blank">Dohop Hackathon 2015</a>
            <div className="About__content__authorstitle">Authors</div>
            <ul className="About__content__list">
              <a href="http://is.linkedin.com/pub/arnar-þór-sveinsson/77/447/844" target="_blank"><li className="About__content__list__author">Arnar Þór Sveinsson</li></a>
              <a href="http://is.linkedin.com/pub/axel-gíslason/90/145/ba7/en" target="_blank"><li className="About__content__list__author">Axel Máni</li></a>
              <a href="http://is.linkedin.com/pub/guðmundur-egill/85/876/517" target="_blank"><li className="About__content__list__author">Guðmundur Egill Bergsteinsson</li></a>
              <a href="http://soli.is" target="_blank"><li className="About__content__list__author">Sólberg Bjarki</li></a>
              <a href="https://is.linkedin.com/in/solviloga" target="_blank"><li className="About__content__list__author">Sölvi Logason</li></a>
            </ul>
          </p>

          <p className="About__footer">Made with <span className="About__footer__heart"></span> in Iceland</p>
        </div>
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
        <GoogleMap
          startingPoint={this.props.selectedAirport}
          flightPath={this.props.flightPath}
          flightHash={this.props.desiredHash}
        />
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
    } else if (event.key === 'Enter' && this.props.airports.length) {
      this.handleSetAirport(event, this.props.airports[this.state.activeAirport - 1]);
    }
  },

  handleDatePicker(event, picker) {
    this.props.flux.getActions('FlightActions').setDates(picker);
  },

  handleOnFocus(event, value) {
    event.preventDefault();
    this.setState({
      showSearchResults: value,
      alertMessage: '',
      alertPositive: true,
      alertShow: false,
    });

    this.props.flux.getActions('FlightActions').hideAlert();
  },

  handleSetAirport(event, airport) {
    this.setState({
      showSearchResults: false,
      airportSearch: `${airport.name} (${airport.airportCode})`
    });
    this.props.flux.getActions('FlightActions').fetchAirport(airport);
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
      this.setState({
        alertMessage: 'Please pick a valid airport',
        alertPositive: false,
        alertShow: true,
      });
      return;
    } else if (this.props.dates.startDate.format('YYYY-MM-DD') === this.props.dates.endDate.format('YYYY-MM-DD')) {
      this.setState({
        alertMessage: 'Please pick a valid duration',
        alertPositive: false,
        alertShow: true,
      });
      return;
    }

    this.setState({
      showLandingPage: false,
      minimizeSearchResults: true,
      alertShow: true,
      alertPositive: true,
      alertMessage: 'Generating journey...',
    });

    this.props.flux.getActions('FlightActions').createJourney();
    this.props.flux.getActions('FlightActions').hideAlert();
  },
});

export default App;

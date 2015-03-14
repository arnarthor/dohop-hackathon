import _ from 'lodash';
import React from 'react/addons';
import TimeoutTransitionGroup from '../TimeoutTransitionGroup';

require('./SearchResults.scss');

const Props = React.PropTypes;
const classSet = React.addons.classSet;

const SearchResults = React.createClass({

  propTypes: {
    flux: Props.object.isRequired,
    airports: Props.array,
    selectedAirport: Props.object,
    selectAirport: Props.func.isRequired,
    showList: Props.bool,
    min: Props.bool,
  },

  render() {
    let airports = this.props.airports;
    let selectedAirport = this.props.selectedAirport;
    let searchResultsClasses = {
      SearchResults: true,
      SearchResultsMin: this.props.min,
    };
    return selectedAirport && !this.props.showList ? null : (
      <ul className={classSet(searchResultsClasses)}>
        <TimeoutTransitionGroup
          enterTimeout={200}
          leaveTimeout={300}
          transitionName="fade-collapse"
        >
          {airports.length ? _.map(airports, airport => (
              <li
                key={airport.airportCode}
                onClick={(event) => this.props.selectAirport(event, airport)}
                className="SearchResults__result"
              >
                <span className="SearchResults__result__name">{airport.name}</span>
                <span className="SearchResults__result__airport"> ({airport.airportCode})</span>
              </li>
          )): []}
        </TimeoutTransitionGroup>
      </ul>
    );
  },

  handleSetAirport(event, airport) {
    this.props.flux.getActions('FlightActions').setAirport(airport);
  },
});

export default SearchResults;

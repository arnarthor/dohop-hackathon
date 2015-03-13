import _ from 'lodash';
import React from 'react/addons';
import TimeoutTransitionGroup from '../TimeoutTransitionGroup';

require('./SearchResults.scss');

const Props = React.PropTypes;

let SearchResults = React.createClass({

  propTypes: {
    flux: Props.object.isRequired,
    airports: Props.array,
    selectedAirport: Props.object,
    selectAirport: Props.func.isRequired,
    showList: Props.bool,
  },

  render() {
    let airports = this.props.airports;
    let selectedAirport = this.props.selectedAirport;
    return selectedAirport && !this.props.showList ? null : (
      <ul className="SearchResults">
        <TimeoutTransitionGroup
          enterTimeout={300}
          leaveTimeout={300}
          transitionName="fade"
        >
          {airports.length ? _.map(airports, airport => (
              <li
                onClick={(event) => this.props.selectAirport(event, airport)}
                className="SearchResults__result"
              >
                <span className="SearchResults__result__name">{airport.name}</span>
                <span className="SearchResults__result__airport"> ({airport.airports[0]})</span>
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

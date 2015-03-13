import _ from 'lodash';
import React from 'react/addons';

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
        {_.map(airports, airport => (
          <li onClick={(event) => this.props.selectAirport(event, airport)} className="SearchResults__result">
            <span className="SearchResults__result__name">{airport.name}</span>
            <span className="SearchResults__result__airport"> ({airport.airports[0]})</span>
          </li>
        ))}
      </ul>
    );
  },

  handleSetAirport(event, airport) {
    this.props.flux.getActions('FlightActions').setAirport(airport);
  },
});

export default SearchResults;

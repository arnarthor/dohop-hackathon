import _ from 'lodash';
import React from 'react/addons';

require('./SearchResults.scss');

const Props = React.PropTypes;

let SearchResults = React.createClass({

  propTypes: {
    airports: Props.array,
  },

  render() {
    let airports = this.props.airports;
    console.log(airports[0]);
    return (
      <div className="SearchResults">
        {_.map(airports, airport => (
          <div className="SearchResults__result">
            <span className="SearchResults__result__name">{airport.name}</span>
            <span className="SearchResults__result__airport"> ({airport.airports[0]})</span>
          </div>
        ))}
      </div>
    );
  },
});

export default SearchResults;

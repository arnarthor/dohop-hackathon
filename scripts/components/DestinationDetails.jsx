'use strict';

import React from 'react/addons';
require('./DestinationDetails.scss');

const Props = React.PropTypes;
let DestinationDetails = React.createClass({

  propTypes: {
    daysStaying: Props.string,
  },

  componentDidMount() {
    this.props.flux.getActions('FlightActions').getFlickrImage(this.props.flight.departure);
  },

  render() {
    let destinationStyle = {};
    
    if(this.props.flight.image){
      destinationStyle = {
        backgroundImage: `url(${this.props.flight.image})`
      } 
    }
    
    return (
     <li className="DestinationDetails__items__destination" style={destinationStyle}>
      <div className="DestinationDetails__items__destination__details">
        {this.props.daysStaying && (
          <div>
            <span className="DestinationDetails__items__destination__details__duration">
              {`${this.props.daysStaying} in`}
            </span>
          </div>
        )}
        <div><span className="DestinationDetails__items__destination__details__city">{this.props.flight.arrivalCountry.city}</span></div>
        <div><span className="DestinationDetails__items__destination__details__country">{this.props.flight.arrivalCountry.countryName}</span></div>
      </div>
    </li>
    );
  },
});

export default DestinationDetails;

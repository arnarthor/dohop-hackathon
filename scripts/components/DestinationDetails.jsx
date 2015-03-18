'use strict';

import React from 'react/addons';
import moment from 'moment';
require('./DestinationDetails.scss');

const Props = React.PropTypes;
let DestinationDetails = React.createClass({

  propTypes: {
    daysStaying: Props.string,
  },

  componentDidMount() {
    this.props.flux.getActions('FlightActions').getFlickrImage(this.props.flight.d1, this.props.flight.airportInfo.lat, this.props.flight.airportInfo.lon);
  },
  handleGetCityLocation(event, city) {
    this.props.flux.getActions('FlightActions').cityLocation(city);
  },
  render() {
    let destinationStyle = {};
    if(this.props.flight.image){
      destinationStyle = {
        backgroundImage: `url(${this.props.flight.image})`,
        maxHeight: '500px',
      }
    }

    let checkOutDate = moment();
    if(this.props.daysStaying){
      checkOutDate = moment(this.props.flight.departure).add(this.props.daysStaying.substring(0, this.props.flight.daysStaying.indexOf(' ')), 'days')
    }

    return (
     <li className="DestinationDetails__items__destination" style={destinationStyle}>
      <div className="DestinationDetails__items__destination__menu">
        <div className="DestinationDetails__items__destination__menu__icon"></div>
        <ul className="DestinationDetails__items__destination__menu__actions">
          <a href={`http://www.yelp.com/search?find_loc=${this.props.flight.airportInfo.ci_n},+${this.props.flight.airportInfo.cc_n}`} target="_blank"><li className="DestinationDetails__items__destination__menu__actions__button attractions">Attractions</li></a>
          <a href={`http://www.lastminute.com/trips/hotellist/listInternal?checkInDate=${this.props.flight.departure}&checkOutDate=${checkOutDate.format('YYYY-MM-DD')}&numRooms=1&guestCodes=ADULT&guestCounts=2&city=${this.props.flight.airportInfo.ci_n}&path=hotels`} target="_blank"><li className="DestinationDetails__items__destination__menu__actions__button hotels">Hotels</li></a>
          <li onClick={(event) => this.handleGetCityLocation(event, this.props.flight.airportInfo.ci_n)}
            className="DestinationDetails__items__destination__menu__actions__button streetview">
              Streetview
          </li>
        </ul>
      </div>
      <div className="DestinationDetails__items__destination__details">
        <div>
          <span className="DestinationDetails__items__destination__details__duration">
            {`${this.props.flight.stayDuration} days in`}
          </span>
        </div>
        <div>
          <span className="DestinationDetails__items__destination__details__city">
            {this.props.flight.airportInfo.ci_n}
          </span>
        </div>
        <div>
          <span className="DestinationDetails__items__destination__details__country">
            {this.props.flight.airportInfo.cc_n}
          </span>
        </div>
      </div>
    </li>
    );
  },
});

export default DestinationDetails;

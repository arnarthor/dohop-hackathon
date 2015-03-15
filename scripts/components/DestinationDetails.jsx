'use strict';

import React from 'react/addons';
require('./DestinationDetails.scss');

const Props = React.PropTypes;
let DestinationDetails = React.createClass({

  propTypes: {
    daysStaying: Props.string,
  },

  componentDidMount() {
    this.props.flux.getActions('FlightActions').getFlickrImage(this.props.flight.departure, this.props.flight.arrivalCountry.lat, this.props.flight.arrivalCountry.lon);
  },

  render() {
    let destinationStyle = {};

    if(this.props.flight.image){
      destinationStyle = {
        backgroundImage: `url(${this.props.flight.image})`,
        maxHeight: '500px',
      }
    }
http://hotel.dohop.com/searchresults.html?ss=London+Heathrow%2C+London%2C+United+Kingdom&interval_of_time=any&flex_checkin_year_month=any&no_rooms=1&group_adults=2&group_children=0&aid=376223&checkin_year_month=2015-03&checkin_monthday=23&checkout_year_month=2015-04&checkout_monthday=30&dest_type=city&dest_id=-2601889&label=searchform&si=ai%2Cco%2Cci%2Cre%2Cdi&lang=en
    return (
     <li className="DestinationDetails__items__destination" style={destinationStyle}>
      <div className="DestinationDetails__items__destination__menu">
        <div className="DestinationDetails__items__destination__menu__icon"></div>
        <ul className="DestinationDetails__items__destination__menu__actions">
          <a href="" target="_blank"><li className="DestinationDetails__items__destination__menu__actions__button attractions">Attractions</li></a>
          <a href="" target="_blank"><li className="DestinationDetails__items__destination__menu__actions__button hotels">Hotels</li></a>
          <li className="DestinationDetails__items__destination__menu__actions__button streetview">Streetview</li>
        </ul>
      </div>
      <div className="DestinationDetails__items__destination__details">
        {this.props.daysStaying && (
          <div>
            <span className="DestinationDetails__items__destination__details__duration">
              {`${this.props.daysStaying} in`}
            </span>
          </div>
        )}
        <div>
          <span className="DestinationDetails__items__destination__details__city">
            {this.props.flight.arrivalCountry.city}
          </span>
        </div>
        <div>
          <span className="DestinationDetails__items__destination__details__country">
            {this.props.flight.arrivalCountry.countryName}
          </span>
        </div>
        <div onClick={(event) => this.handleGetCityLocation(event, this.props.flight.arrivalCountry.city)}>
        </div>
      </div>
    </li>
    );
  },

  handleGetCityLocation(event, city) {
    this.props.flux.getActions('FlightActions').cityLocation(city);
  },
});

export default DestinationDetails;

'use strict';

import _ from 'lodash';
import moment from 'moment';
import React from 'react/addons';
import DestinationDetails from './DestinationDetails.jsx';
require('./JourneyPlan.scss');

const Props = React.PropTypes;
const classSet = React.addons.classSet;

let JourneyPlan = React.createClass({

  propTypes: {
    display: Props.bool,
    flights: Props.array,
  },

  render() {
    let journeyPlanClasses = {
      JourneyPlan: true,
      JourneyPlanShow: this.props.display,
    };

    return (
      <div className={classSet(journeyPlanClasses)}>
      	<div className="JourneyPlanTitle">MY JOURNEY</div>
      	<ul className="JourneyPlan__items">
          {_.map(this.props.flights, flight => {
            let date = moment(flight.departure).date();
            let month = moment(flight.departure).format('MMM');
            let daysStaying;
            if (flight.daysStaying) {
              daysStaying = _.initial(flight.daysStaying.split(' ')).join(' ');
            }
            return (
              <span>
                <li className="JourneyPlan__items__flight">
                  <div className="JourneyPlan__items__flight__date">
                    <div className="JourneyPlan__items__flight__date__day">{date}</div>
                    <div className="JourneyPlan__items__flight__date__month">{month}</div>
                  </div>
                  <div className="JourneyPlan__items__flight__details">
                    <div className="JourneyPlan__items__flight__from">
                      <span className="JourneyPlan__items__flight__from__airportName">{flight.departureCountry.airportName}</span>
                      <span className="JourneyPlan__items__flight__to__airportCode">({flight.departureCountry.airportCode})</span>
                    </div>
                    <div className="JourneyPlan__items__flight__plane"></div>
                    <div className="JourneyPlan__items__flight__to">
                      <span className="JourneyPlan__items__flight__to__airportName">{flight.arrivalCountry.airportName}</span>
                      <span className="JourneyPlan__items__flight__to__airportCode">({flight.arrivalCountry.airportCode})</span>
                    </div>
                  </div>
                </li>
                <DestinationDetails 
                  daysStaying={daysStaying}
                  flight={flight}
                  flux={this.props.flux}
                />
              </span>
            );
          })}
      	</ul>
      </div>
    );
  },
});

export default JourneyPlan;

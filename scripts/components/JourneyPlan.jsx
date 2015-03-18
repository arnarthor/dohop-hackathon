'use strict';

import _ from 'lodash';
import moment from 'moment';
import React from 'react/addons';
import TimeoutTransitionGroup from '../TimeoutTransitionGroup';
import DestinationDetails from './DestinationDetails.jsx';
require('./JourneyPlan.scss');

const Props = React.PropTypes;
const classSet = React.addons.classSet;

let JourneyPlan = React.createClass({

  propTypes: {
    display: Props.bool,
    flightPath: Props.array,
  },

  getInitialState() {
    return {
      journeyPlanCollapsed: true,
    };
  },

  componentWillReceiveProps(props) {
    if (props.display) {
      window.setTimeout(function(){
        this.setState({journeyPlanCollapsed: false});
      }.bind(this), 700);
    }
    else{
      this.setState({journeyPlanCollapsed: true});
    }
  },

  render() {

    let journeyPlanClasses = {
      JourneyPlan: true,
      JourneyPlanShow: this.props.display,
    };

    let journeyPlanToggleClasses = {
      noselect: true,
      JourneyPlan__title__toggle: true,
      JourneyPlan__title__toggle__active: this.state.journeyPlanCollapsed,
    }

    let journeyPlanItemsClasses = {
      JourneyPlan__items: true,
      JourneyPlan__items__collapsed: this.state.journeyPlanCollapsed,
    }

    let totalPrice = 0;

    _.map(this.props.flightPath, function(flights){
      totalPrice += flights[0].conv_fare;
    });

    return (
      <div className={classSet(journeyPlanClasses)}>
      	<div className="JourneyPlan__title noselect" onClick={(event) => this.setState({journeyPlanCollapsed: !this.state.journeyPlanCollapsed})}>MY JOURNEY
          <span className={classSet(journeyPlanToggleClasses)} onClick={(event) => this.setState({journeyPlanCollapsed: !this.state.journeyPlanCollapsed})}></span>
        </div>
      	<ul className={classSet(journeyPlanItemsClasses)}>
          <TimeoutTransitionGroup
          enterTimeout={800}
          leaveTimeout={200}
          transitionName="collapse"
          >
            {_.map(this.props.flightPath, flights => {
              let date = moment(flights[0].d1).date();
              let month = moment(flights[0].d1).format('MMM');
              let daysStaying;
              return (
                <span className="JourneyPlan__items__item">
                  <li className="JourneyPlan__items__flight">
                    <div className="JourneyPlan__items__flight__date">
                      <div className="JourneyPlan__items__flight__date__day">{date}</div>
                      <div className="JourneyPlan__items__flight__date__month">{month}</div>
                    </div>
                    <div className="JourneyPlan__items__flight__details">
                      <div className="JourneyPlan__items__flight__from">
                        <span className="JourneyPlan__items__flight__from__airportName">{flights[0].prevAirport}</span>
                        <span className="JourneyPlan__items__flight__to__airportCode">({flights[0].a})</span>
                      </div>
                      <div className="JourneyPlan__items__flight__plane"></div>
                      <div className="JourneyPlan__items__flight__to">
                        <span className="JourneyPlan__items__flight__to__airportName">{flights[0].airportInfo.a_n}</span>
                        <span className="JourneyPlan__items__flight__to__airportCode">({flights[0].b})</span>
                      </div>
                      <div className="JourneyPlan__items__flight__price">${Math.round(flights[0].conv_fare)}</div>
                    </div>
                  </li>
                  {this.props.display &&
                    <DestinationDetails 
                      daysStaying={daysStaying}
                      flight={flights[0]}
                      flux={this.props.flux}
                    />
                  }
                </span>
              );
            })}
          </TimeoutTransitionGroup>
          <li className="JourneyPlan__items__total">Total: <span className="JourneyPlan__items__total__price">${Math.round(totalPrice)}</span></li>
      	</ul>

      </div>
    );
  }


});


export default JourneyPlan;

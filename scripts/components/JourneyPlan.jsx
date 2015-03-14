import _ from 'lodash';
import React from 'react/addons';

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
      		<li className="JourneyPlan__items__flight">
      			<div className="JourneyPlan__items__flight__date">
      				<div className="JourneyPlan__items__flight__date__day">11</div>
      				<div className="JourneyPlan__items__flight__date__month">JUN</div>
      			</div>
            <div className="JourneyPlan__items__flight__details">
        			<div className="JourneyPlan__items__flight__from">Reykjavik ‎(‎KEF)</div>
        			<div className="JourneyPlan__items__flight__plane"></div>
        			<div className="JourneyPlan__items__flight__to">Copenhagen ‎(‎CPH)</div>
      		  </div>
          </li>

          <li className="JourneyPlan__items__flight">
            <div className="JourneyPlan__items__flight__date">
              <div className="JourneyPlan__items__flight__date__day">11</div>
              <div className="JourneyPlan__items__flight__date__month">JUN</div>
            </div>
            <div className="JourneyPlan__items__flight__details">
              <div className="JourneyPlan__items__flight__from">Reykjavik ‎(‎KEF)</div>
              <div className="JourneyPlan__items__flight__plane"></div>
              <div className="JourneyPlan__items__flight__to">Copenhagen ‎(‎CPH)</div>
            </div>
          </li>

      		<li className="JourneyPlan__items__destination">
            <div className="JourneyPlan__items__destination__details">
              <div><span className="JourneyPlan__items__destination__details__duration">5 days in</span></div>
              <div><span className="JourneyPlan__items__destination__details__city">Phnom Penh</span></div>
              <div><span className="JourneyPlan__items__destination__details__country">Cambodia</span></div>
      		  </div>
          </li>

          <li className="JourneyPlan__items__flight">
            <div className="JourneyPlan__items__flight__date">
              <div className="JourneyPlan__items__flight__date__day">11</div>
              <div className="JourneyPlan__items__flight__date__month">JUN</div>
            </div>
            <div className="JourneyPlan__items__flight__details">
              <div className="JourneyPlan__items__flight__from">Reykjavik ‎(‎KEF)</div>
              <div className="JourneyPlan__items__flight__plane"></div>
              <div className="JourneyPlan__items__flight__to">Copenhagen ‎(‎CPH)</div>
            </div>
          </li>
          
      	</ul>
      </div>
    );
  },
});

export default JourneyPlan;
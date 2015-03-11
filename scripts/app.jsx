'use strict';

import React from 'react/addons';
import FluxContainer from 'flummox';
import constants from './config/constants';

require('./app.scss');

let Props = React.PropTypes;
let CSSTransitionGroup = React.addons.CSSTransitionGroup;


let App = React.createClass({

  componentDidMount() {
    this.props.flux.getActions('FlightActions').fetchFlights('wooohoooooooo');
  },

  render() {
    return (
      <div>
        JOURNEY CREATOR
        <div>{this.props.schedule}</div>
      </div>
    );
  },

  fetchFlights(fromCountry) {
    this.props.flux.getActions('FlightActions').fetchFlights(fromCountry);
  }
});

export default App;

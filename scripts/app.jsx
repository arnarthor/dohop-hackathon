'use strict';

import React from 'react/addons';
import FluxContainer from 'flummox';
import constants from './config/constants';

require('./app.scss');

let Props = React.PropTypes;
let CSSTransitionGroup = React.addons.CSSTransitionGroup;


let App = React.createClass({

  componentDidMount() {
    this.props.flux.getActions('FlightActions').connectIo();
  },

  render() {
    return (
      <div className="hero">
        <h1>DISCOVER THE WORLD</h1>
        <form>
          <span className="wrapper">
            <input placeholder="Starting location"></input>
          </span>
          <span className="wrapper">
            <input placeholder="Start date"></input>
          </span>
          <span className="wrapper">
            <input placeholder="End date"></input>
          </span>
          <button>Create journey</button>
        </form>
        <div>{this.props.schedule}</div>
      </div>
    );
  },

  fetchFlights(fromCountry) {
    this.props.flux.getActions('FlightActions').fetchFlights(fromCountry);
  }
});

export default App;

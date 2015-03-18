'use strict';

import React from 'react/addons';

require('./AlertBox.scss');

const Props = React.PropTypes;
const classSet = React.addons.classSet;

const AlertBox = React.createClass({
	propTypes: {
    alertShow: Props.bool,
		alertPositive: Props.bool,
		alertMessage: Props.string,
	},
	render() {
    let alertBoxClass = {
      AlertBox: true,
      AlertBox_show: this.props.alertShow,
      alertBox_positive: this.props.alertPositive,
    };
    let alertBoxSpinnerClass = {
      AlertBox__spinner: true,
      AlertBox__spinner_show: this.props.alertPositive,
    };
    return (
      <div className={classSet(alertBoxClass)}>
        <img className={classSet(alertBoxSpinnerClass)} src="img/loading-spin.svg" alt="Loading icon" />
        <div className="AlertBox__message">{this.props.alertMessage}</div>
      </div>
    )
	},
});

export default AlertBox;
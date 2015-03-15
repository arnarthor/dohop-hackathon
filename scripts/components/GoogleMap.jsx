import _ from 'lodash';
import moment from 'moment';
import React from 'react/addons';
import ReactGoogleMaps from './react-googlemaps';

require('./GoogleMap.scss');

const Props = React.PropTypes;
const classSet = React.addons.classSet;
const Map = ReactGoogleMaps.Map;
const Polyline = ReactGoogleMaps.Polyline;
const LatLng = window.google.maps.LatLng;

let GoogleMap = React.createClass({

  getInitialState() {
    return {
      center: new LatLng(41.879535, -87.624333),
      zoom: 3,
      linePath: [],
      height: 1000,
      width: 1000,
    };
  },

  propTypes: {
    flights: Props.array,
  },
  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);
    this.setState({
      height: window.innerHeight,
      width: window.innerWidth,
      center: new LatLng(this.props.location.lat, this.props.location.lng),
    });
  },

  componentWillReceiveProps(nextProps) {
    let linePath, firstCoord;
    let {lat, lng} = nextProps.location;

    if (lat === null || lng === null) {
      console.log('Missing lat, lng something went wrong');
      return;
    }

    let firstLatLng = new LatLng(lat, lng);
    if (nextProps.flightHash === this.props.flightHash) {
      linePath = _.clone(this.state.linePath);
      let firstCoord = _.first(linePath);
      if (!firstCoord) {
        linePath.push(firstLatLng);
      }
    } else {
      linePath = [];
      linePath.push(firstLatLng);
    }

    if (nextProps.flights.length) {
      let lastCoord = _.last(linePath);
      let lastFlightCoord = new LatLng(
        _.last(nextProps.flights).arrivalCountry.lat,
        _.last(nextProps.flights).arrivalCountry.lon
      );

      if (lastCoord.k !== lastFlightCoord.k || lastCoord.D !== lastFlightCoord.D) {
        linePath.push(lastFlightCoord);
      }
    }
    this.setState({
      linePath: linePath,
      center: new LatLng(nextProps.location.lat, nextProps.location.lng),
    });
  },

  render() {
    let polyLineArrays = [];
    let linePath = this.state.linePath;
    for(var i = 0; i < linePath.length - 1; i++) {
      polyLineArrays.push([linePath[i], linePath[i + 1]]);
    }
    return (
      <div className="GoogleMap">
        <Map
          initialZoom={this.state.zoom}
          center={this.state.center}
          width={this.state.width}
          height={this.state.height}
          onCenterChange={this.handleCenterChange}
        >
          {_.map(polyLineArrays, array =>
            <Polyline
              key={array}
              geodesic
              path={array}
              strokeColor="#F58C5C"
              strokeOpacity={0.8}
              strokeWeight={3}
            />
          )}
        </Map>
      </div>
    );
  },

  handleWindowResize(event) {
    this.setState({height: event.target.innerHeight, width: event.target.innerWidth});
  },

  handleCenterChange(mapNode) {
    this.setState({center: mapNode.getCenter()});
  },
});

export default GoogleMap;

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
      zoom: 5,
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
      center: new LatLng(this.props.location.lat, this.props.location.lon),
    });
  },

  componentWillReceiveProps(nextProps) {
    let {lat, lon} = nextProps.location;
    if (lat === null || lon === null) return;
    let firstLatLng = new LatLng(lat, lon);
    let linePath = _.clone(this.state.linePath);
    let firstCoord = _.first(linePath);
    if (!firstCoord) {
      linePath.push(firstLatLng);
    }

    if (nextProps.flights.length) {
      let lastCoord = _.last(linePath);
      let lastFlightCoord = new LatLng(
        _.last(nextProps.flights).arrivalCountry.lat,
        _.last(nextProps.flights).arrivalCountry.lon
      );
      console.log(nextProps.flights);
      console.log(this.state.linePath);
      console.log(lastCoord.k !== lastFlightCoord.k || lastCoord.D !== lastFlightCoord.D);

      if (lastCoord.k !== lastFlightCoord.k || lastCoord.D !== lastFlightCoord.D) {
        linePath.push(lastFlightCoord);
      }
    }
    this.setState({
      linePath: linePath,
      center: new LatLng(nextProps.location.lat, nextProps.location.lon),
    });
  },

  render() {
    return (
      <div className="GoogleMap">
        <Map
          initialZoom={this.state.zoom}
          center={this.state.center}
          width={this.state.width}
          height={this.state.height}
          onCenterChange={this.handleCenterChange}
        >
          <Polyline
            geodesic
            path={this.state.linePath}
            strokeColor="#F58C5C"
            strokeOpacity={0.8}
            strokeWeight={3}
          />
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

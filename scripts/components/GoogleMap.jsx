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
      center: new LatLng(0, 0),
      zoom: 2,
      linePath: [],
      height: 1000,
      width: 1000,
      currentIndex: 0,
    };
  },

  propTypes: {
    flightPath: Props.array,
  },

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);
    this.setState({
      height: window.innerHeight,
      width: window.innerWidth,

    });
  },

  componentWillReceiveProps(props) {
    let linePath, firstCoord;
    let {lat, lng} = props.startingPoint.location;

    linePath = [];
    linePath.push(new LatLng(lat, lng));

    for (var i = 0; i < props.flightPath.length; i++) {
      linePath.push(new LatLng(
        props.flightPath[i][0].airportInfo.lat,
        props.flightPath[i][0].airportInfo.lon
      ))
    }

    this.setState({
      linePath: linePath,
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
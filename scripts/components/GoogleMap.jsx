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
      zoom: 7,
      linePath: [],
      height: 1000,
      width: 1000,
    };
  },

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);
    this.setState({height: window.innerHeight, width: window.innerWidth});
  },

  propTypes: {
    flights: Props.array,
  },

  render() {
    console.log(this.state);
    return (
      <div className="GoogleMap">
        <Map
          initialZoom={this.state.zoom}
          initialCenter={this.state.center}
          width={this.state.width}
          height={this.state.height}
          onClick={this.handleMapClick}
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

  handleMapClick(mapEvent) {
    var linePath = React.addons
      .update(this.state.linePath, {
        $push: [mapEvent.latLng]
      });

    this.setState({
      linePath: linePath
    });
  },

  handleWindowResize(event) {
    this.setState({height: event.target.innerHeight, width: event.target.innerWidth});
  }
});

export default GoogleMap;

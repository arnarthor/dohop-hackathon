import uuid from 'node-uuid';
import moment from 'moment';
import {Actions} from 'flummox';
import request from 'superagent';
import constants from '../../config/constants';

class FlightActions extends Actions {

  setAirport(airport) {
    return airport;
  }

  setDates(dates) {
    var {startDate, endDate} = dates;
    return {startDate, endDate};
  }

  clearSelectedAirport() {
    return 'clear-airport';
  }

  clearAirports() {
    return 'clear';
  }

  setUUID(id) {
    return id;
  }

  airportList(airports, hash) {
    return {airports, hash};
  }

  async searchAirport(searchString) {
    let hash = uuid.v4();
    this.setUUID(hash);
    request.get(`${constants.api}/search_airport/${searchString}`)
      .end(res => {
        this.airportList(res.body, hash);
      });
  }

  async fetchAirport(searchString) {
    request.get(`${constants.googleMapsAPI}/json?address=${searchString.airportCode} airport&sensor=false`)
      .end(res => {
        this.createJourney(res.body.results[0].geometry.location);
      });
  }

  createJourney(data) {
    return data;
  }

  connectIo() {
    return 'connect-io';
  }

  getFlickrImage(date, lat, long) {
    request.get(`https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=f07305911011fb8f88eb92e9d2ab1749&privacy_filter=1&accuracy=5&safe_search=1&content_type=1&media=photos&lat=${lat}&lon=${long}&is_getty=true&format=json&nojsoncallback=1`)
      .end(res => {
        if (res.ok) {
          let photo = res.body.photos.photo[0];
          this.setImage(date, `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`);
        } else {
          alert('Oh no! error ' + res.text);
      }
    });
  }

  setImage(date, url) {
    return {date, url};
  }
}

export default FlightActions;

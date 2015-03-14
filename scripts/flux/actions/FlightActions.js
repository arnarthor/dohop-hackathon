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

  createJourney(data) {
    return 'create-journey';
  }

  connectIo() {
    return 'connect-io';
  }

  getFlickrImage(date) {
    request.get('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=ad89fd4858af519bcb45434d24009b5d&privacy_filter=1&accuracy=5&safe_search=1&content_type=1&media=photos&lat=64.1335983&lon=-21.8524424&is_getty=true&format=json&nojsoncallback=1&auth_token=72157649016292084-bb0c17874e240aeb&api_sig=3adcac61413a8d7b9ffa0777cf5bd385')
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

/*
======================================================
-->> Premenne
======================================================
*/
// {lat: 48.15174853, lng: 17.07317065};
// 48.1518531,17.073345
var uluru = {lat: 48.15174853, lng: 17.07317065};
var myLatLng = {lat: 48.1518531, lng: 17.073345};
var infowindow;
var map;
/*
======================================================
-->> Funkcie
======================================================
*/
function initMap() {

     map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        center: myLatLng, //uluru,
        zoom: 16
    });

    var marker = new google.maps.Marker({
        position: myLatLng, //uluru,
        map: map,
        icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        labelOrigin: new google.maps.Point(75, 32),
        size: new google.maps.Size(32,32),
        anchor: new google.maps.Point(16,32)
        },
        label: { text: "FEI STU", color: "#C70E20", fontWeight: "bold"}
    });

    google.maps.event.addListener(marker, 'click', function() {
        alert("Latitude: " + myLatLng.lat + " Longitude: " + myLatLng.lng);
    });

  //
    // Create an array of alphabetical characters used to label the markers.
    var labels = 'ABCDEFGHIJ';

    // Add some markers to the map.
    // Note: The code uses the JavaScript Array.prototype.map() method to
    // create an array of markers based on a given "locations" array.
    // The map() method here has nothing to do with the Google Maps API.
    var markers = locations.map(function(location, i) {
    return new google.maps.Marker({
      position: location,
      label: labels[i % labels.length]
    });
  });

    // Add a marker clusterer to manage the markers.
    var markerCluster = new MarkerClusterer(map, markers, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
  //

    var panorama = new google.maps.StreetViewPanorama(
      document.getElementById('pano'), {
        position: myLatLng,
        pov: {
          heading: 34,
          pitch: 10
        }
      });
    map.setStreetView(panorama);

    new AutocompleteDirectionsHandler(map);

}

 var locations = [
 {lat: 48.154157, lng: 17.075152},
  {lat: 48.154630, lng: 17.074401},
  {lat: 48.154606, lng: 17.075808},
  {lat: 48.154123, lng: 17.076844},
  {lat: 48.148312, lng: 17.071956},
  {lat: 48.147970, lng: 17.072429}
    // {lat: 48.1536426, lng: 17.0754215},
  ]


  function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.originPlaceId = null;
    this.destinationPlaceId = null;//{lat: 48.15174853, lng: 17.07317065};
    this.travelMode = 'WALKING';
    this.directionsService = new google.maps.DirectionsService;
    this.directionsRenderer = new google.maps.DirectionsRenderer;
    this.directionsRenderer.setMap(map);

    var originInput = document.getElementById('origin-input');
    var destinationInput = document.getElementById('destination-input');
    var modeSelector = document.getElementById('mode-selector');

    var originAutocomplete = new google.maps.places.Autocomplete(originInput);
    // Specify just the place data fields that you need.
    originAutocomplete.setFields(['place_id']);

    var destinationAutocomplete =
        new google.maps.places.Autocomplete(destinationInput);
    // Specify just the place data fields that you need.
    destinationAutocomplete.setFields(['place_id']);

    this.setupClickListener('changemode-walking', 'WALKING');
    this.setupClickListener('changemode-transit', 'TRANSIT');
    this.setupClickListener('changemode-driving', 'DRIVING');

    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
    this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(
        destinationInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
}

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
AutocompleteDirectionsHandler.prototype.setupClickListener = function(
    id, mode) {
  var radioButton = document.getElementById(id);
  var me = this;

  radioButton.addEventListener('click', function() {
    me.travelMode = mode;
    me.route();
  });
};

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function(
    autocomplete, mode) {
  var me = this;
  autocomplete.bindTo('bounds', this.map);

  autocomplete.addListener('place_changed', function() {
    var place = autocomplete.getPlace();

    if (!place.place_id) {
      window.alert('Please select an option from the dropdown list.');
      return;
    }
    if (mode === 'ORIG') {
      me.originPlaceId = place.place_id;
    } else {
      me.destinationPlaceId = place.place_id;
    }
    me.route();
  });
};

AutocompleteDirectionsHandler.prototype.route = function() {
  if (!this.originPlaceId || !this.destinationPlaceId) {
    return;
  }
  var me = this;

  this.directionsService.route(
      {
        origin: {'placeId': this.originPlaceId},
        destination: {'placeId': this.destinationPlaceId},
        travelMode: this.travelMode
      },
      function(response, status) {
        if (status === 'OK') {
          me.directionsRenderer.setDirections(response);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
};
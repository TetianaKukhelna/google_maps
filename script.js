/*
======================================================
-->> Premenne
======================================================
*/
// {lat: 48.15174853, lng: 17.07317065};
// 48.1518531,17.073345
const uluru = {lat: 48.15174853, lng: 17.07317065};
const myLatLng = {lat: 48.1518531, lng: 17.073045};
var mapObj;
var feiMarker = null;
// Create an array of alphabetical characters used to label the markers.
const labels = 'ABCDEFGHIJ';
const locations = [
    {lat: 48.154157, lng: 17.075152},
    {lat: 48.154630, lng: 17.074401},
    {lat: 48.154606, lng: 17.075808},
    {lat: 48.154123, lng: 17.076844},
    {lat: 48.148312, lng: 17.071956},
    {lat: 48.147970, lng: 17.072429}
    // {lat: 48.1536426, lng: 17.0754215},
]

// FEIplace  TAKE FROM -->>   https://developers.google.com/places/web-service/place-id
const FeiPlace = "ChIJky-5POyLbEcRvSyAsBN7Zv8"  //{lat: 48.151915, lng: 17.073131}; // FEI

/*
======================================================
-->> Funkcie
======================================================
*/
function $(id){
    if( id.startsWith('#') )
        return document.getElementById(id.substring(1));
    return document.querySelectorAll(id)
}

function getFeiMarkerLabel(text){
    return {text: text || "FEI STU", color: "#C70E20", fontWeight: "bold"}
}


function initMap(listener) {

    mapObj = new google.maps.Map($('#map'), {
        mapTypeControl: false,
        center: myLatLng, //uluru,
        zoom: 16
    });

    feiMarker = new google.maps.Marker({
        position: myLatLng, //uluru,
        animation: google.maps.Animation.DROP,
        map: mapObj,
        icon: {
            // all marker list here: http://miftyisbored.com/a-complete-list-of-standard-google-maps-marker-icons/
            url: "http://maps.google.com/mapfiles/ms/icons/snowflake_simple.png",
            labelOrigin: new google.maps.Point(60, 48),
            size: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 32)
        },
        label: getFeiMarkerLabel()
    });

    feiMarker.addListener("click", toggleBounce);

    function toggleBounce() {
      if (feiMarker.getAnimation() !== null) {
        feiMarker.setAnimation(null);
      } else {
        feiMarker.setAnimation(google.maps.Animation.BOUNCE);
      }
    }

    mapObj.addListener('click', () => {
        alert("Latitude: " + myLatLng.lat + " Longitude: " + myLatLng.lng);
    });

    mapObj.addListener("center_changed", () => {
        // 3 seconds after the center of the map has changed, pan back to the
        // feiMarker.
        window.setTimeout(() => {
            mapObj.panTo(feiMarker.getPosition());
        }, 3000);
  });

    // Add some markers to the map.
    // Note: The code uses the JavaScript Array.prototype.map() method to
    // create an array of markers based on a given "locations" array.
    // The map() method here has nothing to do with the Google Maps API.
    const markers = locations.map(function (location, i) {
        return new google.maps.Marker({
            position: location,
            label: labels[i % labels.length]
        });
    });

    // Add a feiMarker clusterer to manage the markers.
    const markerClusterUrl = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
    let markerCluster = new MarkerClusterer(mapObj, markers, {imagePath: markerClusterUrl});


    let panorama = new google.maps.StreetViewPanorama(
        $('#pano'),
        {
            position: myLatLng,
            pov: {
                heading: 34,
                pitch: 10
            }
        });

    mapObj.setStreetView(panorama);

    new AutocompleteDirectionsHandler(mapObj);
}


function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.originPlaceId = null;
    // destinationPlaceId  TAKE FROM -->>   https://developers.google.com/places/web-service/place-id
    this.destinationPlaceId = FeiPlace  //{lat: 48.151915, lng: 17.073131}; // FEI
    this.travelMode = 'WALKING';
    this.directionsService = new google.maps.DirectionsService;
    this.directionsRenderer = new google.maps.DirectionsRenderer;
    this.directionsRenderer.setMap(map);

    const originInput = $('#originInput');
    const modeSelector = $('#mode-selector');

    var originAutocomplete = new google.maps.places.Autocomplete(originInput);
    originAutocomplete.setFields(['place_id']);  // Specify just the place data fields that you need.


    this.setupClickListener('changemode-walking', 'WALKING');
    this.setupClickListener('changemode-driving', 'DRIVING');

    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
    // this.setupPlaceChangedListener(destAutocomplete, 'DEST');

    let mapControls = this.map.controls[google.maps.ControlPosition.TOP_LEFT]
    mapControls.push(originInput);
    mapControls.push(modeSelector);
}

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
AutocompleteDirectionsHandler.prototype.setupClickListener = function (id, mode) {
    var radioButton = document.getElementById(id);
    var me = this;

    radioButton.addEventListener('click', function () {
        me.travelMode = mode;
        me.route();
    });
};

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (autocomplete, mode) {
    var me = this;
    autocomplete.bindTo('bounds', this.map);
    autocomplete.setFields(['place_id', 'geometry', 'name', 'formatted_address']);
    autocomplete.addListener('place_changed', function () {
        const place = autocomplete.getPlace();
        const lng = place.geometry.location.lng();
        const lat = place.geometry.location.lat();

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

AutocompleteDirectionsHandler.prototype.route = function () {
    if (!this.originPlaceId || !this.destinationPlaceId) {
        return;
    }
    var me = this;
    // console.log("this.originPlaceId: ", this.originPlaceId)
    // console.log("this.destinationPlaceId: ", this.destinationPlaceId)
    this.directionsService.route(
        {
            origin: {'placeId': this.originPlaceId},
            destination: {'placeId': this.destinationPlaceId},
            travelMode: this.travelMode
        },
        function (response, status) {
            if (status === 'OK') {
                me.directionsRenderer.setDirections(response);
                console.log("distance: ", response.routes[0].legs[0].distance.text, "duration: ", response.routes[0].legs[0].duration.text)
                const distText = response.routes[0].legs[0].distance.text
                const durText = response.routes[0].legs[0].duration.text
                feiMarker.setLabel(getFeiMarkerLabel(`FEI STU (${distText}) ${durText}`))
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
};
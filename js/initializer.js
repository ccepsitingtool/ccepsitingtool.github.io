function addCountyToMap(map) {
  $.ajax({
    type: 'GET',
    url: 'data/county.json',
    dataType: 'json',
    success: function(data) {
      var county = L.geoJSON(data, {
          fillColor: 'black',
          weight: 2,
          opacity: 1,
          color: 'black',
          fillOpacity: 0
      });    
      county.addTo(map);
    }
  });
}

// We will need to replace the accessToken before releasing (since
// you are just using mine right now)
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia3VhbmIiLCJhIjoidXdWUVZ2USJ9.qNKXXP6z9_fKA8qrmpOi6Q', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1Ijoia3VhbmIiLCJhIjoidXdWUVZ2USJ9.qNKXXP6z9_fKA8qrmpOi6Q'
}).addTo(mainMap);

// Add geocoding search tool
var mobileOpts = {
  sourceData: function(text, callResponse) {
    geocoder.geocode({address: text}, callResponse);
  },   
  formatData: function(rawjson) {
    var json = {}, key, loc, disp = [];
    for(var i in rawjson) {
      key = rawjson[i].formatted_address;
      var lat = rawjson[i].geometry.location.lat();
      var lng = rawjson[i].geometry.location.lng();
      loc = L.latLng(lat, lng);
      json[key]= loc;
    }

    return json;
  },
  textPlaceholder:'Enter Address',
  markerLocation: true,
  autoType: false,
  autoCollapse: false,
  minLength: 2,
  delayType: 800, // with mobile device typing is more slow
  position: 'topleft',
  marker: { icon: false }
};

mainMap.addControl(new L.Control.Search(mobileOpts));
mainMap.addControl(new L.Control.Zoom({'position':'topright'}));
// Add the county to the map
addCountyToMap(mainMap);

// Make the Seach Box Always be Open
$('#searchtext13').css('display', 'block');
// Adding Legend Stuff
var legend = L.control({position: 'bottomleft'});
var pointLegend = L.control({position: 'bottomleft'});

// Add print tooling


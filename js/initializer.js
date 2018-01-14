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

// Add the county to the map
addCountyToMap(mainMap);

// Adding Legend Stuff
var legend = L.control({position: 'bottomleft'});
var pointLegend = L.control({position: 'bottomleft'});
var cleanFields = {
    'dens.cvap.std': 'CVAP Density',
    'dens.work.std': 'Worker Density',
    'popDens.std': 'Population Density',
    'prc.CarAccess.std': 'Percent Car Access',
    'prc.ElNonReg.std' : 'Percent Eligible Non Registered',
    'prc.disabled.std': 'Percent Disabled',
    'prc.latino.std': 'Percent Latino',
    'prc.nonEngProf.std':'Percent Non English',
    'prc.pov.std': 'Percent Poverty',
    'prc.youth.std': 'Percent Youth',
    'rate.vbm.std': 'Percent Vote By Mail',
    'wtd_center_score': 'Weighted Score'
}
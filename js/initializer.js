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
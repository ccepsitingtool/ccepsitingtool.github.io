// Rendering data
function clearLayerManager() {
  // First check if this layer is already on the map
  var keys = Object.keys(layerManager);
  keys.forEach(function(key) {
    if (key != 'choropleth') {
      layerManager[key].forEach(function (ea) {
      // Remove each addition to the map
      mainMap.removeLayer(ea);
      });

      // Remove the layer entirely from the reference JSON
      delete layerManager[key]
    }

    //Remove the GeoJson Layer Too
    var geoJsonLayer = layerManager['choropleth'];
    if (geoJsonLayer) {
      mainMap.removeLayer(geoJsonLayer);
      layerManager['choropleth'] = null;
    }
  });
}

function processCSV(data) {
  var allTextLines = data.split(/\r\n|\n/);
  var headers = allTextLines[0].split(',');
  var lines = [];

  for (var i=1; i < allTextLines.length; i++) {
    var data = allTextLines[i].split(',');
    if (data.length == headers.length) {

      // Create an object for each row
      var tarr = {};
      for (var j = 0; j < headers.length; j++) {
        var h = headers[j].replace(/"/g, '');
        var v = data[j].replace(/"/g, '');
        tarr[h] = v;
      }

      // Push each JSON to a list
      lines.push(tarr);
    }
  }
  return lines;
}

function styleCircle(fileName, line){
  var circleStyleLookup = {
    'all_test_points.csv': {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.25,
        radius: 800        
    },
    'three_d_centers.csv': {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.25,
        radius: 800  
    },
    'ten_d_centers.csv': {
        color: 'orange',
        fillColor: 'orange',
        fillOpacity: 0.25,
        radius: 800  
    },
    'dropoff_d_centers.csv': {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.25,
        radius: 800  
    }

}
  // At some point we may have a crosswalk that lies outside
  // this function
  return circleStyleLookup[fileName]
};

function populateMapWithPoints(fileName) {
  $.ajax({
    type: 'GET',
    url: `data/${fileName}`,
    dataType: 'text',
    success: function(data) {
      // First check if this layer is already on the map
      var keys = Object.keys(layerManager);
      var pos = keys.indexOf(fileName);

      // If it is, then go ahead and iterate through
      // each item and remove it
      if (pos > -1) {
        layerManager[fileName].forEach(function (ea) {
          // Remove each addition to the map
          mainMap.removeLayer(ea);
        });

        // Then remove that key
        delete layerManager[fileName]
      }

      if (pos === -1 ) {
        // Now override all the old items in the list (or create a 
        // fresh list entirely)
        layerManager[fileName] = [];
        
        processCSV(data).forEach(function(line) {
          // Add a new circle shape to the map
          var loc = [line.lat, line.lon]
          var style = styleCircle(fileName, line);
          var circle = L.circle(loc, style).addTo(mainMap);

          // As well as to our layer management object
          layerManager[fileName].push(circle);
        });

    }
    }
  });
}

// TODO: This code is totally not legible and needs to be refactored
//       asap - can't a simple lookup dictionary work here?
function getColor(d , classify) {
  // I moved blueish here because we were only using one object and
  // I am trying to consolidate all of these methods
  var colorObject = {
    8 : 'rgb(222,235,247)',
    7 : 'rgb(198,219,239)',
    6 : 'rgb(158,202,225)',
    5 : 'rgb(107,174,214)',
    4 : 'rgb(66,146,198)',
    3 : 'rgb(33,113,181)',
    2 : 'rgb(8,81,156)',
    1 : 'rgb(8,48,107)',
    0 : 'white'};

  var result = d >= classify[7] ? colorObject[1] :
      d >= classify[6]  ? colorObject[2] :
          d >= classify[5]  ? colorObject[3] :
              d >= classify[4]  ? colorObject[4] :
                  d >= classify[3]   ? colorObject[5] :
                      d >= classify[2]   ? colorObject[6] :
                          d >= classify[1]   ? colorObject[7] :
                              colorObject[0];

  return result;
}

// Helps in getting colors for the maps
function chloroQuantile(data, breaks, useJenks=false){
  var sorted = data.sort(function(a, b) {
    return (a - b);
  });

  var quants = [];
  if (useJenks) {
    quants = ss.jenks(sorted, breaks);
    var index = (quants.length - 1);

    // TODO: @mdgis this seems hacky let's see if we 
    // can revisit this and improve it
    quants[index] += .00000001;
    return quants
  }

  // TODO: @mdgis it would help to add more comments
  var p = .99999999/k;

  for (var i=1; i < (breaks + 1); i++) {
    var qVal = ss.quantile(sorted, p*i);

    // TODO: @mdgis it would help to add more comments, it seems like there's
    //       a lot of adjusting going on that is circumventing the underlying
    //       problem
    if (i === breaks) {
      var adjustment = .0000001;
      qVal = qVal + adjustment;
    }

    quants.push(qVal);
  }

  return quants;
}

function populateMapWithChoropleth(fieldName) {
  var loc = 'data/indicator_files/' + fieldName + '.csv';
  // We need to create a local variable of fieldName to keep and
  // be able to access in the success callback function
  var targetCol = fieldName;

  $.ajax({
    type: 'GET',
    url: loc,
    dataType: 'text',
    success: function(data) {
      var geoJsonLayer = layerManager['choropleth'];

      // If there is a chloropleth present, make sure to remove the
      // one that is currently on the map
      if (geoJsonLayer) {
        mainMap.removeLayer(geoJsonLayer);

        // Exit out early if we are clicking on the same
        // item twice in a row
        if (geoJsonLayer.targetCol == targetCol) {
          return null;
        }
      }

      // Generate all the variables that will be used
      // in the following functions that are bound to the
      // chloropleth layer
      var allVals = []
      var geoIdLookup = {}
      processCSV(data).forEach(function(line) {
        var targetField = Number(line[targetCol]);
        var geoId = Number(line['GEOID']);

        allVals.push(targetField);
        geoIdLookup[geoId] = targetField;
      });

      // Get the quantile breaks
      var dataQuants = chloroQuantile(allVals, 8, useJenks=true);

      // Leaflet Styling and Things
      function generateLeafletStyle(feature) {
        var geoId = Number(feature.properties['GEOID']);
        var val = Number(geoIdLookup[geoId]);
        var qColor = getColor(val, dataQuants);
        return {
          fillColor: qColor,
          weight: 1,
          opacity: .25,
          color: 'black',
          fillOpacity: .6

        }
      }

      function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
          weight: 2,
          color: 'yellow',
          dashArray: '',
          fillOpacity: 0.6
        });

        var browserOk = (!L.Browser.ie &&
                         !L.Browser.opera &&
                         !L.Browser.edge)
        if (browserOk) {
          layer.bringToFront();
        }
      }

      function resetHighlight(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 1,
            color: 'black',
            dashArray: '',
            fillOpacity: 0.45
        });
      }

      function whenClicked(e) {
        // TODO Create a Popup
        console.log(e.target)
      }

      // TOOD: @mdgis where do you assign this to
      function updateLegend(){
        //TODO we need legend for the choropleth
      }

      function onEachFeature (feature, layer) {
        layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
          click: whenClicked
        });
      }

      // Add the polygon layers
      var options = {
        style: generateLeafletStyle,
        onEachFeature: onEachFeature
      };

      geoJsonLayer = L.geoJson(tracts, options);
      geoJsonLayer.addTo(mainMap);

      geoJsonLayer.targetCol = targetCol;
      layerManager['choropleth'] = geoJsonLayer;
    }
  });
}

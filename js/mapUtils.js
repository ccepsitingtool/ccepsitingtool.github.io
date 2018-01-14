// Rendering data
function clearLayerManager() {
  // First check if this layer is already on the map
  var keys = Object.keys(layerManager);
  keys.forEach(function(key) {
    // Currently, the chloropleth layers are being treated differently
    // that the other datsets, so we are skipping them in this operation
    var keyIsOkay = (key != 'choropleth');
    
    if (keyIsOkay) {
      // This is a safer way to make sure that the .csv end
      // is not in the name
      var trimmedKey = key.replace('.csv', '');
      var divId = ('#' + trimmedKey);

      // Now drop the selected tag for this div
      $(divId).removeClass('selected');
      
      // Next, go ahead and remove everything that was
      // added to the Leaflet map in this reference list
      // of layers
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
      $('#' + geoJsonLayer.targetCol).removeClass('selected')
      mainMap.removeLayer(geoJsonLayer);
      mainMap.removeControl(legend)
      mainMap.removeControl(pointLegend);
      layerManager['choropleth'] = null;
    }
  });

  // TODO: couple this with other remove operations of the same class
  // Finally, and this is gross, remove the circle data legend
  $('.leafletMapBLBox').remove();
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
    },
    'poi.csv': {
        color: 'black',
        fillColor: 'gray',
        fillOpacity: 0.45,
        radius: 25,
        opacity: .5  
    },
    'transit_stops.csv': {
        color: 'darkred',
        fillColor: 'darkred',
        fillOpacity: 0.6,
        radius: 10,
        opacity: .6  
    }

}
  // At some point we may have a crosswalk that lies outside
  // this function
  return circleStyleLookup[fileName]
};



function circleInfoUpdate(e) {
  // TODO: Add a binded popup
  //      e.g.: e.target.bindPopup("some content").openPopup();

  pointClick = e.target;
  mainMap.removeControl(pointLegend);
  pointLegend.addTo(mainMap, e);

  $(".info.legend.indicatorLegend").insertBefore(".info.legend.pointLegend");
}

function populateMapWithPoints(fileName) {
  $('.leafletMapBLBox').remove();
  // This is a safer way to make sure that the .csv end
  // is not in the name
  var trimmedKey = fileName.replace('.csv', '');
  var divId = $('#' + trimmedKey);

  // Make this particular div set as selected
  divId.toggleClass('selected');

  // Then run an asyn task to acquire the actual data
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
        delete layerManager[fileName];
      }

      if (pos === -1 ) {
        // Now override all the old items in the list (or create a 
        // fresh list entirely)
        layerManager[fileName] = [];
        pointsData[fileName] = {};

        processCSV(data).forEach(function(line) {
          //Save Line Data to Point Object
          pointsData[fileName][line.ID] = line;

          // Add a new circle shape to the map
          var loc = [line.lat, line.lon];
          var style = styleCircle(fileName, line);

          // Add a Unique Identifier to the Point
          var circle = L.circle(loc, style).on("click", circleInfoUpdate);
          circle.registeredName = [fileName, line.ID];
          circle.addTo(mainMap);

          // Add to Map and Layer Management
          circle.addTo(mainMap);
          layerManager[fileName].push(circle);
        });

    }
    }
  });


}

pointLegend.onAdd = function(map) {
  var div = L.DomUtil.create('div', 'info legend pointLegend');
  var labels = [];

  // IF First Time Loading or No Points Being Shown
  if (pointClick==null) {
    div.innerHTML = "Click Points For More Information"
    return div
  } else {
    var id = pointClick.registeredName[1]
    var fileName = pointClick.registeredName[0]
    var pointData = pointsData[fileName][id]
    var fields = ['dens.cvap.std',
                  'dens.work.std',
                  'popDens.std',
                  'prc.CarAccess.std',
                  'prc.ElNonReg.std',
                  'prc.disabled.std',
                  'prc.latino.std',
                  'prc.nonEngProf.std',
                  'prc.pov.std',
                  'prc.youth.std',
                  'rate.vbm.std',
                  'wtd_center_score']

    div.innerHTML += '<span class="legendHeader"><h5>Points Data </h5> </span>'
    for  (var i = 0; i < fields.length; i++) {
         div.innerHTML +=  '<i style="background:' + '' + '">'+(+pointData[fields[i]]).toFixed(2)+'</i>' + cleanFields[fields[i]] ; 
         div.innerHTML += '<br>'
    }
    div.innerHTML += "<h6 style='color:red'> <a onclick='closePointLegend()'>  Close </a> </h6>"
    return div
    // We have points shown (need to filter out )

  }
}

pointLegend.addTo(mainMap)

function closePointLegend(){
  mainMap.removeControl(pointLegend)
}

pointLegend.onAdd = function(map) {
  var div = L.DomUtil.create('div', 'leafletMapBLBox legend');
  var labels = [];

  // If it is the first time loading, return nothing; since no
  // points have been selected
  if (pointClick == null) {
    return null;
  }

  // Once the above check clears, proceed with business as usual (no need for
  // that else statement that was wrapping this, before, by the way)
  var id = pointClick.id[1]
  var fileName = pointClick.id[0]
  var pointData = pointsData[fileName][id]
  var fields = ['dens.cvap.std',
                'dens.work.std',
                'popDens.std',
                'prc.CarAccess.std',
                'prc.ElNonReg.std',
                'prc.disabled.std',
                'prc.latino.std',
                'prc.nonEngProf.std',
                'prc.pov.std',
                'prc.youth.std',
                'rate.vbm.std',
                'wtd_center_score']

  // First, add the title of the new points data legend
  div.innerHTML += '<h5>Points Data</h5>'

  // Then iterate through the fields and add all the values data
  for  (var i = 0; i < fields.length; i++) {
    var valAsFloat = Number(pointData[fields[i]]).toFixed(2);
    div.innerHTML += '<i class="leftNumVal">' + valAsFloat + '</i>' +
                     cleanFields[fields[i]] + '<br>';
  }

  return div;
}

// TODO: This code is totally not legible and needs to be refactored
//       asap - can't a simple lookup dictionary work here?
function getColor(d , classify) {
  // Function takes in d - a specific value and
  // classify - a list of break points

  // This appears to be preserved from an older set of breaks
  // var colorObject = {
  //   8 : 'rgb(222,235,247)',
  //   7 : 'rgb(198,219,239)',
  //   6 : 'rgb(158,202,225)',
  //   5 : 'rgb(107,174,214)',
  //   4 : 'rgb(66,146,198)',
  //   3 : 'rgb(33,113,181)',
  //   2 : 'rgb(8,81,156)',
  //   1 : 'rgb(8,48,107)',
  //   0 : 'white'};

  // We then pick the appropriate color relating the break points
  var colorObject = {
          0: '#ffffcc',
          1: '#a1dab4',
          2: '#41b6c4',
          3: '#2c7fb8',
          4: '#253494'
  }

  var result =  d >= classify[4]  ? colorObject[4] :
                d >= classify[3]  ? colorObject[3] :
                d >= classify[2]  ? colorObject[2] :
                d >= classify[1]  ? colorObject[1] :
             colorObject[0] 

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
    var lastindex = (quants.length - 1);
    // TODO: @mdgis this seems hacky let's see if we 
    // can revisit this and improve it
    quants[lastindex] += .00000001;
    return quants
  } else {
    // Doing Quantile Instead
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
}

function populateMapWithChoropleth(fieldName) {
  // Controls for Adding Selection Indicator to the Button
  if (layerManager['choropleth'] != null ) {
    if (layerManager['choropleth']['targetCol'] != fieldName) {
        $('#'+layerManager['choropleth']['targetCol']).toggleClass('selected')
  }
}
  $('#'+fieldName).toggleClass('selected')

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
        mainMap.removeControl(legend)
        layerManager['choropleth'] = null

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

      // Get the Jenks breaks
      var dataQuants = chloroQuantile(allVals, 4, useJenks=true);

      // TODO: Can this be moved out of the async callback?
      // Generate a new legend each time?
      legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'leafletMapBLBox legend indicatorLegend');
        var labels = [];

        // Copy data quants (color bins) over from parent scope
        var limits = dataQuants;

        // This appears to be a hack adjustment to the
        // legend values so the first value gets updated to 0
        // if it is somehow the same as the second value (and, I think
        // an implicit assumption here is that both are not zero...)
        if (limits[0] == limits[1]) { 
          limits[0] = 0.0
        }

        // Update all null values limits to be 0
        limits = limits.map(function(l) {
          return l == null ? 0 : l
        });

        // First, add the title
        div.innerHTML += '<h5>Indicator Data</h5>';

        // Loop through our density intervals to generate a label
        // with a colored square for each interval
        for (var i = 0; i < limits.length; i++) {
          // This basically ties each break to its exact color value for
          // that level
          var col = getColor(limits[i], limits);

          // Add a new layer inside of the legend
          div.innerHTML += '<i class="leftColorMapBox" style="background:' +
                           col + '"></i> ';

          var thisLimVal = limits[i].toFixed(3);

          // Now, for each, format one way if not the last, otherwise
          // the last one is that one value "and up", hence the plus sign
          if (i == (limits.length - 1)) {
            div.innerHTML += (thisLimVal + '+');
          } else {
            // We can only create this if there is a "next" (this is
            // not the last value)
            var nextLimVal = limits[i + 1].toFixed(3);
            div.innerHTML += (thisLimVal + ' &ndash; ' + nextLimVal);
            
            // Finally, add a break no matter what
            div.innerHTML += '<br>';
          }
        }

        // Return the newly created div
        return div;
      };

      // Add the polygon layers
      var options = {
        style: function(feature) {
          var geoId = Number(feature.properties['GEOID']);
          var val = Number(geoIdLookup[geoId]);
          var qColor = getColor(val, dataQuants);
          return {
            fillColor: qColor,
            weight: 1,
            opacity: .25,
            color: 'black',
            fillOpacity: .75

          }
        },

        // TODO: Currently we do not do anything when a
        //       chloropleth geometry is clicked
        onEachFeature: function() {},
      };

      geoJsonLayer = L.geoJson(tracts, options);
      geoJsonLayer.addTo(mainMap);

      geoJsonLayer.targetCol = targetCol;
      layerManager['choropleth'] = geoJsonLayer;
      legend.addTo(mainMap);

      // If the Point Legend is in the Chart Be Sure to Insert Before it
      $(".info.legend.indicatorLegend").insertBefore(".info.legend.pointLegend");
      
      // Move circles up to front should they exist
      Object.keys(layerManager).forEach(function(layer) {
        if (layer != 'choropleth') {
          layerManager[layer].forEach(function(d) {d.bringToFront()})
        }
      });
    }
  });
}

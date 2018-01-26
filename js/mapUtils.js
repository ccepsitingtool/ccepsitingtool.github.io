// Rendering data
function clearLayerManager() {
  // First check if this layer is already on the map
  var keys = Object.keys(layerManager);
  keys.forEach(function(key) {
    // Currently, the chloropleth layers are being treated differently
    // that the other datsets, so we are skipping them in this operation
    var keyIsOkay = (key != 'choropleth' && key != 'unreliable');
    
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
    var unreliableLayer = layerManager['unreliable']
    if (geoJsonLayer) {
      $('#' + geoJsonLayer.targetCol).removeClass('selected')
      mainMap.removeLayer(geoJsonLayer);
      mainMap.removeLayer(unreliableLayer)

      mainMap.removeControl(legend)
      layerManager['choropleth'] = null;
      layerManager['unreliable'] = null;

    }

    // Remove this legend
    closePointLegend();
  });

}

function quantilePointWeights(d){
  var rdPrpl = {
    0:'white',
    1:'#fa9fb5',
    2:'#f768a1',
    3:'#c51b8a',
    4:'#7a0177'
  }


        
  var result =  d >= siteWeightClasses[4]  ? rdPrpl[4] :
                d >= siteWeightClasses[3]  ? rdPrpl[3] :
                d >= siteWeightClasses[2]  ? rdPrpl[2] :
                d >= siteWeightClasses[1]  ? rdPrpl[1] :
             rdPrpl[0] 
      
  return result;

};

function styleCircle(fileName, line){
  var voteSiteWeight = .5;
  var voteSiteOpacity = .8;


  var circleStyleLookup = {
    // 'three_d_centers.csv': {
    //     color: 'blue',
    //     weight: .5,
    //     opacity: .8,
    //     fillColor: 'blue',
    //     fillOpacity: 0.40,
    //     radius: 800  
    // },
    // 'ten_d_centers.csv': {
    //     color: 'orange',
    //     fillColor: 'orange',
    //     weight: .5,
    //     opacity: .8,
    //     fillOpacity: 0.40,
    //     radius: 800  
    // },
    // 'dropoff_d_centers.csv': {
    //     color: 'green',
    //     fillColor: 'green',
    //     weight: .5,
    //     opacity: .8,
    //     fillOpacity: 0.40,
    //     radius: 800  
    // },
    'poi.csv': {
        color: 'black',
        fillColor: 'gray',
        fillOpacity: 0.45,
        radius: 35,
        opacity: .5  
    },
    'poi_misc.csv': {
        color: 'darkred',
        fillColor: 'darkred',
        fillOpacity: 0.45,
        radius: 35,
        opacity: .5  
    },
    'poi_govish.csv': {
        color: 'red',
        fillColor: 'darkorange',
        fillOpacity: 0.45,
        radius: 35,
        opacity: .5  
    },
    'transit_stops.csv': {
        color: 'darkred',
        fillColor: 'darkred',
        fillOpacity: 0.6,
        radius: 10,
        opacity: .6  
    },
    'flp_selection.csv':{
        color: 'black',
        weight: 1.5,
        fillColor: quantilePointWeights(+line['wtd_center_score']),
        fillOpacity: voteSiteOpacity,
        opacity: 1,
        radius: 400
    },
    'all_test_points_CMA_revised.csv':{
        color: '#fcc5c0',
        weight: .5,
        fillColor: quantilePointWeights(+line['wtd_center_score']),
        fillOpacity: voteSiteOpacity,
        opacity: .6,
        radius: 400
    },
    'all_4.csv':{
        color: '#fcc5c0',
        weight: .5,
        fillColor: '#7a0177',
        fillOpacity: voteSiteOpacity,
        opacity: .6,
        radius: 400
    },
      'all_3.csv':{
        color: '#fcc5c0',
        weight: .5,
        fillColor: '#c51b8a',
        fillOpacity: voteSiteOpacity,
        opacity: .6,
        radius: 400
    },
      'all_2.csv':{
        color: '#fcc5c0',
        weight: .5,
        fillColor: '#f768a1',
        fillOpacity: voteSiteOpacity,
        opacity: .6,
        radius: 400
    },
      'all_1.csv':{
        color: '#fcc5c0',
        weight: .5,
        fillColor: '#fa9fb5',
        fillOpacity: voteSiteOpacity,
        opacity: .6,
        radius: 400
    },
      'all_0.csv':{
        color: 'gray',
        weight: .5,
        fillColor: 'fcc5c0',
        fillOpacity: voteSiteOpacity,
        opacity: .6,
        radius: 400
    },
    'geo_isolated.csv':{
        color: 'black',
        weight: 2,
        fillColor: 'fcc5c0',
        fillOpacity: 0,
        opacity: 1,
        radius: 400
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
  closePointLegend();
  pointLegend.addTo(mainMap, e);

  $(".leafletMapBLBox.legend.indicatorLegend").insertBefore(".leafletMapBLBox.legend.pointLegend");
}

function populateMapWithPoints(fileName) {
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
      console.log('in ajax')
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
        console.log('in pos -1s')
        // Now override all the old items in the list (or create a 
        // fresh list entirely)
        layerManager[fileName] = [];
        pointsData[fileName] = {};

        processCSV(data).forEach(function(line) {
          // console.log(line)
          //Save Line Data to Point Object
          pointsData[fileName][line.ID] = line;
          // Add a new circle shape to the map
          var loc = [line.lat, line.lon];
          var style = styleCircle(fileName, line);


          // // Do Different Things if POI/Transit vs. Model Points 
          if (['poi.csv','transit_stops.csv','poi_misc.csv','poi_govish.csv'].indexOf(fileName) > -1 ){
               if (['poi.csv','poi_misc.csv','poi_govish.csv'].indexOf(fileName) > -1 ) {
                // Just Add a Popup
                var popupContent = '<b>Type:</b> ' + toTitleCase(line['fclass']) + '<br>' + '<b>Name</b>: '+ line['name']
                var circle = L.circle(loc, style).bindPopup(popupContent);
              } else {
                var circle = L.circle(loc, style)
              }

          } else {
              // Add a Unique Identifier to the Point and Enable Click Options for the Legend
              var circle = L.circle(loc, style).on("click", circleInfoUpdate);
              circle.registeredName = [fileName, line.ID];
          }

          // Add to Map and Layer Management
          circle.addTo(mainMap);
          layerManager[fileName].push(circle);
        });

    }

    // Finally Check if Any Points Are Currently Active 
    // If Not - Remove the Point Legend
    var keys = Object.keys(layerManager);
    // Choropleth is the only permanent item in layerManager so if len ==1 then no points. 
    if (keys.length == 2) {
      closePointLegend()
      }

    }
  });


}

function toTitleCase(str)
{
    str = str.replace('_',' ')
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function closePointLegend(){
  mainMap.removeControl(pointLegend)
}

pointLegend.onAdd = function(map) {
  var div = L.DomUtil.create('div', 'leafletMapBLBox pointLegend legend');
  var labels = [];

  // If it is the first time loading, return nothing; since no
  // points have been selected
  if (pointClick == null) {
    return null;
  }

  // Once the above check clears, proceed with business as usual (no need for
  // that else statement that was wrapping this, before, by the way)
  var id = pointClick.registeredName[1];
  var fileName = pointClick.registeredName[0];
  var pointData = pointsData[fileName][id];
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
                'rate.vbm.std'];

  function highMedLowLookupColor(val) {
    result = val >=  .67  ? ['High','#f03b20'] :
            val >= .33  ? ['Med&nbsp','#feb24c']: ['Low&nbsp','#ffeda0']
    return result
  }

  // Lookup for the div innerHtml conversion
  var cleanFields = {
    'dens.cvap.std': 'Density of Voting Age Citizens',
    'dens.work.std': 'Worker Density',
    'popDens.std': 'Population Density',
    'prc.CarAccess.std': 'Percent of Population with Vehicle Access',
    'prc.ElNonReg.std' : 'Eligible Non-Registered Voter Rate',
    'prc.disabled.std': 'Percent Disabled Population',
    'prc.latino.std': 'Percent Latino Population',
    'prc.nonEngProf.std':'Percent Limited English Proficient Population',
    'prc.pov.std': 'Percent of the Population in Poverty',
    'prc.youth.std': 'Percent of the Youth Population',
    'rate.vbm.std': 'Vote by Mail Rate',
  };

  // First, add the title of the new points data legend
  div.innerHTML += '<span class="legendTitle">Characteristics of Suggested Area (ID:' + pointData['ID'] + ')</span>'
  // div.innerHTML += '<span><b><i>' + cleanFiles[fileName]  + '</i></b></span><br><br>'
  div.innerHTML += '<span><b><i>Weighted Score: ' + (+(pointData['wtd_center_score'])).toFixed(2) + '</i></b></span><br>'
  // Then iterate through the fields and add all the values data
  for  (var i = 0; i < fields.length; i++) {
    var valAsFloat = Number(pointData[fields[i]]).toFixed(2);
    var color =  highMedLowLookupColor(valAsFloat)[1]
    var label = highMedLowLookupColor(valAsFloat)[0] 
    div.innerHTML += '<span class="leftNumVal"  style="width:40px;display:inline-block;margin-bottom:2px;background:'+ color + '">&nbsp' + label + '</span>  ' +
                     cleanFields[fields[i]] + '<br>';
  }
  div.innerHTML += '<span onclick="closePointLegend()" style="font-weight:bold;color:blue;cursor:pointer;margin-top:2px;">CLOSE</span>'
  return div;
}


function hidePoints(){
  var k = 'all_test_points_CMA_revised.csv'
  var searchPoints = layerManager[k]
  

  searchPoints.forEach(function (d, idx) {
    console.log(pointsData[k][d.registeredName[1]])
    // searchPoints[idx].setStyle({'opacity':0, 'fillOpacity':0})
  })

};
// TODO: This code is totally not legible and needs to be refactored
//       asap - can't a simple lookup dictionary work here?
function getColor(d , classify) {
  // Function takes in d - a specific value and
  // classify - a list of break points


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


function unreliableMarkers(unreliableTracts, fieldName) {

 // Polygon Options - Add the polygon layers
  var options = {
    style: function(feature) {
      var geoId = (+feature.properties['geoid']).toString()
      var opacityval = unreliableTracts.indexOf(geoId) > -1 ? .5 : 0;
      return {
        fillColor: 'black',
        weight: .5,
        opacity: opacityval,
        color: 'black',
        fillOpacity:  opacityval
      }
    },
  };

    unreliableLayer = L.geoJson(tractCentroidSquares, options);
    unreliableLayer.addTo(mainMap);

    layerManager['unreliable'] = unreliableLayer



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
      var unreliableLayer = layerManager['unreliable']
      // If there is a chloropleth present, make sure to remove the
      // one that is currently on the map
      if (geoJsonLayer) {
        mainMap.removeLayer(geoJsonLayer);
        mainMap.removeLayer(unreliableLayer)
        layerManager['choropleth'] = null
        layerManager['unreliable'] = null
        // Exit out early if we are clicking on the same
        // item twice in a row
        if (geoJsonLayer.targetCol == targetCol) {
          mainMap.removeControl(legend)
          return null;
        }
      }

      // Generate all the variables that will be used
      // in the following functions that are bound to the
      // chloropleth layer
      var allVals = []
      var unreliableTracts = []
      var geoIdLookup = {}
      processCSV(data).forEach(function(line) {
        var targetField = Number(line[targetCol]);
        var geoId = Number(line['geoid']);

        if (line.unreliable_flag == 1) {
          unreliableTracts.push(line.geoid)
        }

        allVals.push(targetField);
        geoIdLookup[geoId] = targetField;
      });



      var maxVal = Math.max.apply(Math,allVals);

      // Get the Jenks breaks
      var dataQuants = chloroQuantile(allVals, 5);

      // TODO: Can this be moved out of the async callback?
      // Generate a new legend each time?
      legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'leafletMapBLBox legend indicatorLegend');
        var labels = [];

        // Copy data quants (color bins) over from parent scope
        var limits = dataQuants;
        var dataMaxVal = maxVal;

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
        div.innerHTML += '<span class="legendTitle">Indicator Data</span>';
        div.innerHTML += '<span><b><i>' + cleanFiles[targetCol] + '</i></b></span><br>';

        // Loop through our density intervals to generate a label
        // with a colored square for each interval
        for (var i = 0; i < limits.length-1; i++) {
          // This basically ties each break to its exact color value for
          // that level
          var col = getColor(limits[i], limits);
          // Add a new layer inside of the legend
          div.innerHTML += '<i class="leftColorMapBox" style="background:' +
                           col + '"></i> ';

          var thisLimVal = (limits[i] * 100).toFixed(1).toString() + '%'

          // Now, for each, format one way if not the last, otherwise
          // the last one is that one value "and up", hence the plus sign
          if (i == (limits.length - 1)) {
            div.innerHTML += (thisLimVal + '+');
          } else {
            // We can only create this if there is a "next" (this is
            // not the last value)
            var nextLimVal = (limits[i + 1]*100).toFixed(1).toString() + '%';
            div.innerHTML += (thisLimVal + ' &ndash; ' + nextLimVal);
            
            // Finally, add a break no matter what
            div.innerHTML += '<br>';
          }
        }

        if (unreliableTracts.length > 0) {
          console.log('yes')
          div.innerHTML += '<br><i class="leftColorMapBox" style="background:black;  height: 10px; width:10px; float:left;"></i>'
          div.innerHTML += '<span style="font-size:12px">Estimates that have a high'
          div.innerHTML += '<br><i class="leftColorMapBox" style="opacity:0;  width:16px; float:left;"></i>'
          div.innerHTML +=  '<span style="font-size:12px">degree of uncertainty</span>'
        }

        // Return the newly created div
        return div;
      };

      // Polygon Options - Add the polygon layers
      var options = {
        style: function(feature) {
          var geoId = Number(feature.properties['GEOID']);
          var val = Number(geoIdLookup[geoId]);
          var qColor = getColor(val, dataQuants);
          return {
            fillColor: qColor,
            weight: 1.2,
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
      $(".leafletMapBLBox.legend.indicatorLegend").insertBefore(".leafletMapBLBox.legend.pointLegend");
      
      // Move circles up to front should they exist
      Object.keys(layerManager).forEach(function(layer) {
        if (layer != 'choropleth' && layer != 'unreliable') {
          layerManager[layer].forEach(function(d) {d.bringToFront()})
        }
      });
            unreliableMarkers(unreliableTracts, fieldName)

    }

  });

}

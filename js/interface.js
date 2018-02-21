function populateNavBarIndicators(){

  $.ajax({
    type: 'GET',
    url: 'data/' + targetSiteId + '/indicator_files/indicator_menu_fields.csv',
    dataType: 'text',
    success: function(data) {
      processCSV(data).forEach(function(line) {
        var bn = line['basename'];
        var cn = line['cleanname'];
        var desc = line['description'];
        cleanFiles[bn] = cn
        var li = '<li id=' + bn + '><a onclick=' +
                 '"populateMapWithChoropleth(\'' +
                 bn + '\')">' + cn + '</a></li>';
        
        // Hacky solution but last minute request - it works
        if (['prc_asian','prc_black','prc_white','prc_latino'].indexOf(bn) > -1) {
              $('.context-menu').append(li)
        
        } else {
              // Add to the menu list
              $('.indicator-menu').append(li)
        };


        // if (bn == 'prc_poplatino_final') 
        //       $('.indicator-menu').append(li)

   
        var dataDesclLi = '<li><b>' + cn + '</b>:  ' + desc + '</li>';
        // $('.fullDownloadModalList').append(fdlLi);
        $('.fullDataDescriptionModalList').append(dataDesclLi);

      });
    }
   });

  $.ajax({
    type: 'GET',
    url: 'data/' + targetSiteId + '/site_area_count.csv',
    dataType: 'text',
    success: function(data) {
      processCSV(data).forEach(function(line) {
        var fln = line['file'];
        var cnt = line['count'];
        var aCnt = '<b> (' + cnt + ')<b>'
        // Add to the menu list
        if (fln != 'all_sites_scored'){
            $('#'+fln + ' a').append(aCnt)
        }
  

      });
    }
   });


}

function toggleMenu() {
  var toggleMenu = $('.menu-toggle');
  var isToggled = toggleMenu.parent().hasClass('toggled')
  if (isToggled) {
    var animDir = { 'left' : 0 };
    toggleMenu.parent().animate(animDir, 350, function() {
      console.log('in menu')
      $('#main-container').removeClass('toggled'); 
    });
    $(baseControlButtons._container).toggleClass('slideOverOnMenu')
    $(zoomControlButtons._container).toggleClass('slideOverOnMenu')

  } else {
    var navWidth = $('#nav-panel').width();
    var animDir = { 'left' : navWidth };
    toggleMenu.parent().animate(animDir, 350, function() {
      $('#main-container').addClass('toggled');
    });
    $(baseControlButtons._container).addClass('slideOverOnMenu')
    $(zoomControlButtons._container).toggleClass('slideOverOnMenu')

  }
}

function printScreen() {
  var toggleMenu = $('.menu-toggle');
  var isToggled = toggleMenu.parent().hasClass('toggled')
  if (isToggled) {
    var animDir = { 'left' : 0 };
    toggleMenu.parent().animate(animDir, 350, function() {
      $('#main-container').removeClass('toggled');

      // Then queue print screen
      window.print();
    });
  } else {
    // Do nothing, just go to print
    window.print();
  }
}


function populateDataDownLoads() {
    // Need to populate the data download lists - was hardcoded
    // but now that we have data changing based on site id I moved here

    var voteOlItem = $('#voteCenterDl');
    var indicatorOlItem = $('#indicatorDl');
    var pointDlItems = [
              ['four_day_sites_shp.zip','Suggested Areas for 4 Day Vote Centers'],
              ['eleven_day_sites_shp.zip','Suggested Areas for 11 Day Vote Centers'],
              ['dropbox_sites_shp.zip','Suggested Areas for Ballot Drop Boxes'],
              ['additional_sites_model_shp.zip','Addtl. Suggested Areas for Vote Centers (Based on Model)'],
              ['additional_sites_distance_shp.zip','Addtl. Suggested Areas for Vote Centers (Based on Distance)'],
              ['all_sites_scored_shp.zip','All Potential Areas']
              ];
    var miscDlItems = [
          ["transit_stops.csv","Transit Stops"],
          ["poi.csv","Points of Interest (All)"],
          ["poi_misc.csv", "Points of Interest (Non-Government"],
          ["poi_govish.csv", "Points of Interest (Government)"]
    ];


  // Below is hacky but it is the only one that has csv or shp - if we have more then make more reproducable.
  pointDlItems.forEach(function(item){
    var flNm = item[0];
    var flLbl = item[1];
    voteOlItem.append('<li> <a href="data/' + targetSiteId + '/point_files/' + flNm + '">' + flLbl + '</a></li>')
  })     

  var indicatorDlItem = '<li><b>Indicator Data </b> <a href="data/'
  indicatorDlItem += targetSiteId  +  '/indicator_files/indicator_data.csv">csv</a>'
  indicatorDlItem += ' | <a href="data/' + targetSiteId + '/indicator_files/indicator_data.zip">shp</a> </li>'

  indicatorOlItem.append(indicatorDlItem);
  miscDlItems.forEach(function(item){
      var flNm = item[0];
      var flLbl = item[1];
      indicatorOlItem.append('<li> <a href="data/' + targetSiteId + '/point_files/' + flNm + '">' + flLbl + '</a></li>')
    })          
    

}

// Initializing these functions
$('.menu-toggle').on('click', toggleMenu);
populateNavBarIndicators();
populateDataDownLoads();
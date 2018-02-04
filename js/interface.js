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
        
        // Add to the menu list
        $('.indicator-menu').append(li)
   
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
        $('#'+fln + ' a').append(aCnt)
  

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
      $('#main-container').removeClass('toggled'); 
    });
  } else {
    var navWidth = $('#nav-panel').width();
    var animDir = { 'left' : navWidth };
    toggleMenu.parent().animate(animDir, 350, function() {
      $('#main-container').addClass('toggled');
    });
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

    var voteOlItem = $('#voteCenterDl');
    var indicatorOlItem = $('#indicatorDl');
    var pointDlItems = [
              ['four_day_sites.csv','Suggested Areas for 4 Day Vote Centers'],
              ['eleven_day_sites.csv','Suggested Areas for 11 Day Vote Centers'],
              ['dropbox_sites.csv','Suggested Areas for Ballot Drop Boxes'],
              ['additional_sites_model.csv','Addtl. Suggested Areas for Vote Centers (Based on Model)'],
              ['additional_sites_distance.csv','Addtl. Suggested Areas for Vote Centers (Based on Distance)'],
              ['all_sites.csv','All Potential Areas']
              ]
    var miscDlItems = [
          ["transit_stops.csv","Transit Stops"],
          ["poi.csv","Points of Interest (All)"],
          ["poi_misc.csv", "Points of Interest (Non-Government"],
          ["poi_govish.csv", "Points of Interest (Government)"]
    ]



  pointDlItems.forEach(function(item){
    flNm = item[0]
    flLbl = item[1]
    voteOlItem.append('<li> <a href="data/' + targetSiteId + '/point_files/' + flNm + '">' + flLbl + '</a></li>')
  })     

  var indicatorDlItem = '<li><b>Indicator Data </b> <a href="data/'
  indicatorDlItem += targetSiteId  +  '/indicator_files/indicator_data.csv">csv</a>'
  indicatorDlItem += ' | <a href="data/' + targetSiteId + '/indicator_files/indicator_data.zip">shp</a> </li>'

  indicatorOlItem.append(indicatorDlItem);
  miscDlItems.forEach(function(item){
      flNm = item[0]
      flLbl = item[1]
      indicatorOlItem.append('<li> <a href="data/' + targetSiteId + '/point_files/' + flNm + '">' + flLbl + '</a></li>')
    })          
    


}

// Initializing these functions
$('.menu-toggle').on('click', toggleMenu);
populateNavBarIndicators();
populateDataDownLoads();
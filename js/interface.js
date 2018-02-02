function populateNavBarIndicators(){

  $.ajax({
    type: 'GET',
    url: `data/indicator_files/indicator_menu_fields.csv`,
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

// Initializing these functions
$('.menu-toggle').on('click', toggleMenu);
populateNavBarIndicators();
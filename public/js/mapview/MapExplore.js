(function($) {
  "use strict";


})($);


function map ( ){
  var width = 700,
      height = 580;

  var svg = d3.select( "body" )
    .append( "svg" )
    .attr( "width", width )
    .attr( "height", height );

  var neighborhoods = svg.append( "g" );
  var g = svg.append( "g" );

  var albersProjection = d3.geo.albers()
    .scale( 190000 )
    .rotate( [71.057,0] )
    .center( [0, 42.313] )
    .translate( [width/2,height/2] );

  var geoPath = d3.geo.path()
      .projection( albersProjection );

  g.selectAll( "path" )
    .data( neighborhoods_json.features )
    .enter()
    .append( "path" )
    .attr( "fill", "#ccc" )
    .attr( "d", geoPath );

};

$('#divNewNotifications').on('click',"li", function( event ) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    var location = $(this).find('a').html()+" ▼";
    $('#dropdown_title').html(location);
    $('.info').html($(this).find('a').html());
    //console.log( $(this).find('a').data('veh') + " " + $(this).find('a').data('total') );
    $('.data1').empty().append($(this).find('a').data('veh'));
    $('.data2').empty().append($(this).find('a').data('total'));
    $('.data3').empty().append($(this).find('a').data('ratio'));

    // To get path id: $(this).text().toLowerCase().replace(/ /g, '')
    var pathID = "#" + $(this).text().toLowerCase().replace(/ /g, '') + "path";

    var oldCSS = $(pathID).css("fill");

    //console.log(oldCSS);

    // Flashes an area red when selected
    $(pathID).css({"fill": "red", "stroke": "red", "stroke-width": "3px"});
    $(pathID).animate( "slow", function() {
      $(pathID).delay(2500).css({"fill": oldCSS, "stroke": "black", "stroke-width": "1px"});
    });
        
    // Closes dropdown menu manually
    $('.btn.dropdown-toggle').attr("aria-expanded", "false");
    $('.btn-group').removeClass("open");
    
});


$("#main-btn").click( function ( event ) {
  event.preventDefault();
  $("html, body").animate({ scrollTop: $("#main-section").position().top }, 'slow');

});

$("#map-btn").click( function ( event ) {
  event.preventDefault();
  $("html, body").animate({ scrollTop: $("#map-section").position().top }, 'slow');

});

$("#stat-btn").click( function ( event ) {
  event.preventDefault();
  $("html, body").animate({ scrollTop: $("#stat-section").position().top }, 'slow');

});

$("#where-btn").click( function ( event ) {
  event.preventDefault();
  $("html, body").animate({ scrollTop: $("#stat-section").position().top }, 'slow');
});

$("#where-btn-2").click( function ( event ) {
  event.preventDefault();
  $("html, body").animate({ scrollTop: $("#map-section").position().top }, 'slow');
});

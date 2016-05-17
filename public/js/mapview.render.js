/**
 * Created by chenyang on 5/15/16.
 */

// all available areas to display on the map view
var supportRenderGeo = [
    "Spring Valley",
    "Escondido",
    "Poway",
    "Oceanside",
    "Carlsbad",
    "Fallbrook",
    "Kearny Mesa",
    "Peninsula",
    "Lakeside",
    "La Mesa",
    "Pendleton",
    "South Bay",
    "El Cajon",
    "Chula Vista",
    "Ramona",
    "Elliott-Navajo",
    "Laguna-Pine Valley",
    "San Dieguito",
    "Alpine",
    "Lemon Grove",
    "Mountain Empire",
    "San Marcos",
    "Sweetwater",
    "Del Mar-Mira Mesa",
    "Coastal",
    "Santee",
    "Jamul",
    "Palomar-Julian",
    "National City",
    "Valley Center",
    "Pauma",
    "University",
    "Vista"
];

// change the size of the map!
var width = 960, height = 1160;
var margin = 100;

var tip = d3.tip()
    .attr('class', 'tooltip')
    .offset([-10, 0])
    .html(function(d) {
        return "<span style='color:red'>" + d.properties.name + "</span>";
    });

var svg = d3.select("#map").append("svg")
    .attr("width", width + margin)
    .attr("height", height + margin);

svg.call(tip);

d3.json("/geojson/mapdisplay_render.json", function(error, sd) {
    if (error) return console.error(error);
// console.log(sd);

////////////// Display boundaries /////////////
    var sdgeo = topojson.feature(sd, sd.objects.renderAreaObj);

    var center = d3.geo.centroid(sdgeo);
    var scale  = 150;
    var offset = [width/2, height/2];
    var projection = d3.geo.mercator().scale(scale).center(center)
        .translate(offset);

    var path = d3.geo.path()
        .projection(projection);

    var bounds  = path.bounds(sdgeo);
    var hscale  = scale*width  / (bounds[1][0] - bounds[0][0]);
    var vscale  = scale*height / (bounds[1][1] - bounds[0][1]);
    var scale   = (hscale < vscale) ? hscale : vscale;
    var offset  = [width + margin - (bounds[0][0] + bounds[1][0])/2,
        height - (bounds[0][1] + bounds[1][1])/2];

    projection = d3.geo.mercator().center(center)
        .scale(scale).translate(offset);
    path = path.projection(projection);

    svg.append("path")
        .datum(sdgeo)
        .attr("d", path);


// give each area its own path element so they can each have different properties (i.e. color)
    svg.selectAll(".subunit")
        .data(topojson.feature(sd, sd.objects.renderAreaObj).features)
        .enter().append("path")
        .attr("class", function(d) {
            if($.inArray(d.properties.name, supportRenderGeo) != -1){
                return "subunit highlight";
            }else{
                return "subunit";
            }
        })

        .attr("d", path)
        .style("fill", function(d){
            if($.inArray(d.properties.name, supportRenderGeo) != -1){
                return "#f44d3c";
            }else{
                return "grey";
            }
        })

        .on('mouseover', function(d) {
            console.log("On the Map! CUrrent name is: " + d.properties.name);
            if ($.inArray(d.properties.name, supportRenderGeo) != -1) {
                console.log("Object found " + d.properties.name);
                tip.show(d);
            } else {
                console.log("Object NOT found " + d.properties.name);
            }
        })

        .on('mouseout', function(d) {
            if ($.inArray(d.properties.name, supportRenderGeo) != -1) {
                tip.hide(d);
            }
        })

        .on('click', function(d) {
            if ($.inArray(d.properties.name, supportRenderGeo) == -1) return;

            // Age data
            renderDemoAge('#age-div', 300, 330, d.properties.name);

            // Gender data
            // renderDemoGender("#gender-div", 330, 300, d.properties.name);

            // Race data
            renderDemoRace("#race-div", 330, 330, d.properties.name);

            // Home value data
            var homedata = renderHome("#homevalue-div",d.properties.name);//"$XXXXX is the median household income in " + d.properties.name + ".";
            $("homevalue-div").html(homedata);

            // Income data
            var incomedata = renderIncome("#income-div",d.properties.name);//"$XXXXX is the median household income in " + d.properties.name + ".";
            $("#income-div").html(incomedata);

            // Education data
            var educationHtmlStr = renderEducation("#education-div", d.properties.name);//"XXXXXX people in " + d.properties.name + " have a Bachelor's Degree or higher.";
            $("#education-div").html(educationHtmlStr);
        });


});
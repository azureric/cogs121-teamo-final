(function(d3) {
    "use strict";

    var strictBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(32.492908, -117.710885),
        new google.maps.LatLng(33.352841, -116.165932)
    );

    var map = new google.maps.Map(d3.select("#map").node(), {
        zoom: 9,
        minZoom: 9,
        maxZoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        scrollwheel: false,
        center: new google.maps.LatLng(32.9185, -117.1382),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
            {
                "featureType": "administrative",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#444444"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [
                    {
                        "color": "#f2f2f2"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "all",
                "stylers": [
                    {
                        "saturation": -100
                    },
                    {
                        "lightness": 45
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "simplified"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": [
                    {
                        "color": "#46bcec"
                    },
                    {
                        "visibility": "on"
                    }
                ]
            }
        ]
    });

    google.maps.event.addListener(map, 'dragend', function() {
        if (strictBounds.contains(map.getCenter())) return;

        var c = map.getCenter(),
            x = c.lng(),
            y = c.lat(),
            maxX = strictBounds.getNorthEast().lng(),
            maxY = strictBounds.getNorthEast().lat(),
            minX = strictBounds.getSouthWest().lng(),
            minY = strictBounds.getSouthWest().lat();

        if (x < minX) x = minX;
        if (x > maxX) x = maxX;
        if (y < minY) y = minY;
        if (y > maxY) y = maxY;

        map.setCenter(new google.maps.LatLng(y, x));
    });

    // http://www.december.com/html/spec/colorhslhex10.html
    var renderMapColor = d3.scale.quantize()
        .domain([0, 0.8])
        .range([
            "#999066",
            "#A69959",
            "#B2A14D",
            "#BFAA40",
            "#CCB333",
            "#D9BB26",
            "#E6C419",
            "#F2CC0D",
            "#FFD500"
        ]);

    var invaildColor = "#544745";

    d3.json("geojson/mapViewSD.json",
        function(error, json) {
            if (error) {
                console.error(error);
                throw error;
            }

            var overlay = new google.maps.OverlayView();

            overlay.onAdd = function() {
                var layer = d3.select(this.getPanes().overlayMouseTarget).append("div").attr("class", "cities");

                var svg = layer.append("svg");
                var cities = svg.append("g").attr("class", "cityDiv");

                // Assigning random value to a city
                for (var i = 0; i < json.features.length; i++) {

                    var SDcity = json.features[i];
                    json.features[i].properties.VALUE = i;
                    //console.log(SDcity);
                }

                overlay.draw = function() {
                    var projection = this.getProjection();

                    var googleMapProjection = function(coord) {
                        var googleCoord = new google.maps.LatLng(coord[1], coord[0]);
                        var pixCoord = projection.fromLatLngToDivPixel(googleCoord);
                        return [pixCoord.x + 4000, pixCoord.y + 4000];
                    }

                    var path = d3.geo.path().projection(googleMapProjection);

                    $.get("/map_anxiety_rate", function(data) {
                        console.log(data);

                        // Represent the colors specturm of the data
                        // where between red and blue represent the availablity of the car
                        var colorPallete = [
                            "#999066",
                            "#A69959",
                            "#B2A14D",
                            "#BFAA40",
                            "#CCB333",
                            "#D9BB26",
                            "#E6C419",
                            "#F2CC0D",
                            "#FFD500",
                        ];

                        var renderOverlayData = {};

                        var dataArray = [];

                        var percent;

                        for (var i = 0; i < data.length; i++) {
                            var propName = data[i]["area"].toLowerCase();
                            renderOverlayData[propName] = data[i];
                            renderOverlayData[propName]["ratio"] = data[i]["ratio"];
                            console.log(renderOverlayData[propName]["ratio"]);
                            percent = ((renderOverlayData[propName]["ratio"] * 100).toFixed(2)) + "%";
                            dataArray.push(data[i]["no vehicle available"]);
                        }

                        var linearScale = d3.scale.linear();
                        linearScale.domain([d3.min(dataArray, function(d) {
                            return d;
                        }), 6000]);
                        linearScale.range(colorPallete);

                        cities.selectAll("path")
                            .data(json.features)
                            .attr("d", path)
                            .enter()
                            .append("svg:path")
                            .attr("d", path)
                            .attr("id", function(d) {
                                return (d.properties.NAME.toLowerCase().replace(/ /g, '') + "path");
                            })
                            .style("fill", function(d, i) {
                                console.log(d["properties"]);
                                if ((renderOverlayData[d.properties.NAME.toLowerCase()]) != undefined) {
                                    console.log("IN DEFINED CASE");
                                    var renderedColor = renderMapColor(renderOverlayData[d.properties.NAME.toLowerCase()]["ratio"]);
                                    console.log("The color is " + renderedColor);
                                    return renderedColor;
                                } else {
                                    console.log("IN UNDEFINED CASE");
                                    return invaildColor;
                                }
                            })
                            .style("stroke", function(d, i) {
                                return "#222";
                            })
                            .append("title")
                            .text(function(d) {
                                return d.properties.NAME;
                            });


                        cities.selectAll("path")
                            .on("mouseover", function(d) {
                                var name = d.properties.NAME.toLowerCase();
                                console.log("on name is " + name);
                                if (renderOverlayData[name]) {
                                    var renderPercent = (Number(renderOverlayData[name]["ratio"]) * 100).toFixed(2) + "%";
                                    $(".data > .label1").text("Number of Households Who Don't Have Vehicles Available: ");
                                    $(".data > .label2").text("Households Available: ");
                                    $(".description > .desTitle").text("You are exploring:")
                                    $(".description > .cityName").text(renderOverlayData[name]["area"]);

                                    $(".data > .data1").text(renderPercent);
                                } else {
                                    $(".description > .desTitle").text("Sorry, this city is currently not in the range of DELPH dataset.")
                                    $(".description > .cityName").text("");
                                    $(".data > .data1").text("");
                                }
                            })
                    });

                };

            };

            overlay.setMap(map);
        }
    );

})(d3);
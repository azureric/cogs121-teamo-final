(function(d3) {
    "use strict";

    var strictBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(32.492908, -117.710885),
        new google.maps.LatLng(33.352841, -116.165932)
    );

    // https://snazzymaps.com/explore?sort=popular
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
                            percent = ((renderOverlayData[propName]["ratio"] * 100).toFixed(2)) + "%";
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
                                if ((renderOverlayData[d.properties.NAME.toLowerCase()]) != undefined) {
                                    var renderedColor = renderMapColor(renderOverlayData[d.properties.NAME.toLowerCase()]["ratio"] * 10);
                                    return renderedColor;
                                } else {
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
                                if (renderOverlayData[name]) {
                                    $(".data > .data1-details").css("display", "initial");
                                    var renderPercent = (Number(renderOverlayData[name]["ratio"]) * 100).toFixed(2) + "%";
                                    $(".description > .desTitle").text("You are exploring:")
                                    $(".description > .cityName").text(renderOverlayData[name]["area"]);

                                    $(".data > .data1").text(renderPercent);
                                } else {
                                    $(".data > .data1-details").css("display", "none");
                                    $(".description > .desTitle").text("Sorry, this city is currently not in the range of DELPHI dataset.")
                                    $(".description > .cityName").text("");
                                    $(".data > .data1").text("");
                                }
                            })
                            .on("click", function(d) {
                                var name = d.properties.NAME.toLowerCase();
                                if (renderOverlayData[name]) {
                                    $("#raceDonutDiv").empty();

                                    renderRaceDonut(formatRaceData(renderOverlayData[name]),
                                        arrayRaceData(renderOverlayData[name]));

                                } else {
                                    // alert("Sorry, no this region data in DELPHI");
                                }

                                function formatRaceData(rawRaceData){
                                    var returnRaceRenderData = {
                                        "2010": [{"White": rawRaceData["w2010"], "Black": rawRaceData["b2010"],
                                            "Hispanic": rawRaceData["h2010"], "API": rawRaceData["a2010"],
                                            "Other": rawRaceData["o2010"]}],
                                        "2011": [{"White": rawRaceData["w2011"], "Black": rawRaceData["b2011"],
                                            "Hispanic": rawRaceData["h2011"], "API": rawRaceData["a2011"],
                                            "Other": rawRaceData["o2011"]}],
                                        "2012": [{"White": rawRaceData["w2012"], "Black": rawRaceData["b2012"],
                                            "Hispanic": rawRaceData["h2012"], "API": rawRaceData["a2012"],
                                            "Other": rawRaceData["o2012"]}]
                                    };

                                    return returnRaceRenderData;
                                }

                                function arrayRaceData(rawRaceData){
                                    var returnarrayRaceRenderData =[{lable: "White", value: rawRaceData["w2010"]},
                                        {lable: "Black", value: rawRaceData["b2010"]},
                                        {lable: "Hispanic", value: rawRaceData["h2010"]},
                                        {lable: "API", value: rawRaceData["a2010"]},
                                        {lable: "Other", value: rawRaceData["o2010"]}];

                                    return returnarrayRaceRenderData;
                                }

                                function renderRaceDonut(raceData, arrayRace){

                                    var svg = d3.select("#raceDonutDiv")
                                        .append("svg")
                                        .append("g")

                                    svg.append("g")
                                        .attr("class", "slices");

                                    svg.append("g")
                                        .attr("class", "labels");

                                    svg.append("g")
                                        .attr("class", "lines");

                                    var width = 200,
                                        height = 200,
                                        radius = Math.min(width, height) / 2;

                                    var pie = d3.layout.pie()
                                        .sort(null)
                                        .value(function(d) {
                                            return d.value;
                                        });

                                    var arc = d3.svg.arc()
                                        .outerRadius(radius * 0.8)
                                        .innerRadius(radius * 0.4);

                                    var outerArc = d3.svg.arc()
                                        .outerRadius(radius * 0.9)
                                        .innerRadius(radius * 0.9);

                                    svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                                    var key = function(d) {
                                        return d.data.label;
                                    };

                                    var color = d3.scale.ordinal()
                                        .domain(Object.keys(raceData["2010"][0]))
                                        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c"]);

                                    function randomData() {
                                        var labels = color.domain();
                                        return labels.map(function(label) {
                                            // console.log(Object.keys(data["2010"][0]));
                                            return {
                                                label: label,
                                                value: Math.random()
                                            }
                                        });
                                    }

                                    change(arrayRace);
                                    console.log(arrayRace);
                                    d3.select(".randomize")
                                        .on("click", function() {
                                            console.log("clicked");
                                            change(randomData());
                                        });

                                    d3.select(".randomize2")
                                        .on("click", function() {
                                            console.log("clicked2");
                                            change(randomData());
                                        });

                                    d3.select(".randomize3")
                                        .on("click", function() {
                                            console.log("clicked3");
                                            change(randomData());
                                        });

                                    function change(raceData) {
                                        //pie slices
                                        var slice = svg.select(".slices").selectAll("path.slice")
                                            .data(pie(raceData), key);

                                        slice.enter()
                                            .insert("path")
                                            .style("fill", function(d) {
                                                return color(d.data.label);
                                            })
                                            .attr("class", "slice");

                                        slice
                                            .transition().duration(1000)
                                            .attrTween("d", function(d) {
                                                this._current = this._current || d;
                                                var interpolate = d3.interpolate(this._current, d);
                                                this._current = interpolate(0);
                                                return function(t) {
                                                    return arc(interpolate(t));
                                                };
                                            })

                                        slice.exit()
                                            .remove();

                                        //text labels
                                        var text = svg.select(".labels").selectAll("text")
                                            .data(pie(raceData), key);

                                        text.enter()
                                            .append("text")
                                            .attr("dy", ".35em")
                                            .text(function(d) {
                                                return d.data.label;
                                            });

                                        function midAngle(d) {
                                            return d.startAngle + (d.endAngle - d.startAngle) / 2;
                                        }

                                        text.transition().duration(1000)
                                            .attrTween("transform", function(d) {
                                                this._current = this._current || d;
                                                var interpolate = d3.interpolate(this._current, d);
                                                this._current = interpolate(0);
                                                return function(t) {
                                                    var d2 = interpolate(t);
                                                    var pos = outerArc.centroid(d2);
                                                    pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                                                    return "translate(" + pos + ")";
                                                };
                                            })
                                            .styleTween("text-anchor", function(d) {
                                                this._current = this._current || d;
                                                var interpolate = d3.interpolate(this._current, d);
                                                this._current = interpolate(0);
                                                return function(t) {
                                                    var d2 = interpolate(t);
                                                    return midAngle(d2) < Math.PI ? "start" : "end";
                                                };
                                            });

                                        text.exit()
                                            .remove();

                                        //slice to text polylines
                                        var polyline = svg.select(".lines").selectAll("polyline")
                                            .data(pie(raceData), key);

                                        polyline.enter()
                                            .append("polyline");

                                        polyline.transition().duration(1000)
                                            .attrTween("points", function(d) {
                                                this._current = this._current || d;
                                                var interpolate = d3.interpolate(this._current, d);
                                                this._current = interpolate(0);
                                                return function(t) {
                                                    var d2 = interpolate(t);
                                                    var pos = outerArc.centroid(d2);
                                                    pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                                                    return [arc.centroid(d2), outerArc.centroid(d2), pos];
                                                };
                                            });
                                        polyline.exit()
                                            .remove();
                                    };
                                }
                            })
                    });
                };

            };

            overlay.setMap(map);
        }
    );

})(d3);
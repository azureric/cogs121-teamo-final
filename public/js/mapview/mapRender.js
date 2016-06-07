(function(d3) {
    "use strict";

    var strictBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(32.492908, -117.710885),
        new google.maps.LatLng(33.352841, -116.165932)
    );

    // https://snazzymaps.com/explore?sort=popular
    var map = new google.maps.Map(d3.select("#mapDiv").node(), {
        zoom: 9,
        minZoom: 9,
        maxZoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
        scrollwheel: false,
        center: new google.maps.LatLng(33.0005, -117.1382),
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
            {
                "featureType": "landscape",
                "stylers": [
                    {
                        "hue": "#FFBB00"
                    },
                    {
                        "saturation": 43.400000000000006
                    },
                    {
                        "lightness": 37.599999999999994
                    },
                    {
                        "gamma": 1
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "stylers": [
                    {
                        "hue": "#FFC200"
                    },
                    {
                        "saturation": -61.8
                    },
                    {
                        "lightness": 45.599999999999994
                    },
                    {
                        "gamma": 1
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "stylers": [
                    {
                        "hue": "#FF0300"
                    },
                    {
                        "saturation": -100
                    },
                    {
                        "lightness": 51.19999999999999
                    },
                    {
                        "gamma": 1
                    }
                ]
            },
            {
                "featureType": "road.local",
                "stylers": [
                    {
                        "hue": "#FF0300"
                    },
                    {
                        "saturation": -100
                    },
                    {
                        "lightness": 52
                    },
                    {
                        "gamma": 1
                    }
                ]
            },
            {
                "featureType": "water",
                "stylers": [
                    {
                        "hue": "#0078FF"
                    },
                    {
                        "saturation": -13.200000000000003
                    },
                    {
                        "lightness": 2.4000000000000057
                    },
                    {
                        "gamma": 1
                    }
                ]
            },
            {
                "featureType": "poi",
                "stylers": [
                    {
                        "hue": "#00FF6A"
                    },
                    {
                        "saturation": -1.0989010989011234
                    },
                    {
                        "lightness": 11.200000000000017
                    },
                    {
                        "gamma": 1
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
            "#E6E8E3",
            "#E6E8E3",
            "#D3E0B8",
            "#D3E0B8",
            "#C4E87D",
            "#C4E87D",
            "#CCFF66",
            "#CCFF66",
            "#b3ff1a",
            "#b3ff1a"
        ]);

    var invaildColor = "#ffffff";

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
                                    var renderedColor = renderMapColor(renderOverlayData[d.properties.NAME.toLowerCase()]["ratio"] * 15);
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
                                var city = d3.select(this).style("stroke-width", 3);

                                var name = d.properties.NAME.toLowerCase();

                                console.log("Mouse on region " + name);
                                if (renderOverlayData[name]) {
                                    $(".welcomeText").hide("slow");
                                    $(".displayText").show("slow");
                                    $("#raceDonutDiv").empty();
                                    $("#raceDonutTitle").css("display", "none");

                                    $("#mapPreview").css("display", "initial");

                                    var renderPercent = (Number(renderOverlayData[name]["ratio"]) * 320).toFixed(3) + "%";

                                    $("#cityName").text(renderOverlayData[name]["area"]);
                                    $("#anxietyNum").text(renderOverlayData[name]["yearSum"]);
                                    $("#populationNum").text(numberWithCommas(renderOverlayData[name]["totalPop2012"]));

                                    var levelRaw = renderOverlayData[name]["yearSum"];

                                    var levelRawRate = renderOverlayData[name]["ratio"];

                                    if(levelRawRate < 0.012){
                                        $("#anxietyLevel").text("Mild ");
                                    }
                                    else if(levelRawRate < 0.025){
                                        $("#anxietyLevel").text("Moderate ");
                                    }
                                    else{
                                        $("#anxietyLevel").text("Severe ");
                                    }

                                    $(".data > .data1").text(renderPercent);
                                } else {
                                    $("#raceDonutDiv").empty();
                                    $("#raceDonutTitle").css("display", "none");

                                    $("#mapPreview").css("display", "none");

                                    $(".description > .desTitle").text("Sorry, this city is currently not in the range of DELPHI dataset.")
                                    $(".description > .cityName").text("");
                                    $(".data > .data1").text("");
                                }

                                function numberWithCommas(x) {
                                    x = x.toString();
                                    var pattern = /(-?\d+)(\d{3})/;
                                    while (pattern.test(x))
                                        x = x.replace(pattern, "$1,$2");
                                    return x;
                                }

                            })

                            .on("mouseout", function(d) {
                                let city = d3.select(this).style("stroke-width", 1);
                            })

                            .on("click", function(d) {

                                cities.selectAll("path")
                                    .style("fill", function(d, i) {
                                        if ((renderOverlayData[d.properties.NAME.toLowerCase()]) != undefined) {
                                            var renderedColor = renderMapColor(renderOverlayData[d.properties.NAME.toLowerCase()]["ratio"] * 15);
                                            return renderedColor;
                                        } else {
                                            return invaildColor;
                                        }
                                    })

                                let city = d3.select(this).style("fill", "red");
                                

                                var name = d.properties.NAME.toLowerCase();

                                var sumRegionAge = renderOverlayData[name]["firstAge"] + renderOverlayData[name]["secondAge"] +
                                    renderOverlayData[name]["thirdAge"] + renderOverlayData[name]["fourthAge"]
                                    +renderOverlayData[name]["fifthAge"];

                                var currentRegionAge =[ renderOverlayData[name]["firstAge"] , renderOverlayData[name]["secondAge"]
                                    ,renderOverlayData[name]["thirdAge"],renderOverlayData[name]["fourthAge"],
                                    renderOverlayData[name]["fifthAge"]];

                                if (renderOverlayData[name]) {
                                    $(".displayText").show("slow");
                                    $(".welcomeText").hide("slow");

                                    var blackRender = renderOverlayData[name]["b2010"]
                                        + renderOverlayData[name]["b2011"]
                                        + renderOverlayData[name]["b2012"];
                                    var whiteRender = renderOverlayData[name]["w2010"]
                                        + renderOverlayData[name]["w2011"]
                                        + renderOverlayData[name]["w2012"];
                                    var hispanicRender = renderOverlayData[name]["h2010"]
                                        + renderOverlayData[name]["h2011"]
                                        + renderOverlayData[name]["h2012"];
                                    var apiRender = renderOverlayData[name]["a2010"]
                                        + renderOverlayData[name]["a2011"]
                                        + renderOverlayData[name]["a2012"];
                                    var othersRender = renderOverlayData[name]["o2010"]
                                        + renderOverlayData[name]["o2011"]
                                        + renderOverlayData[name]["o2012"];

                                    var currentRegionRace = [blackRender, whiteRender, hispanicRender,
                                        apiRender, othersRender];

                                    var sumRegionRace = 0;

                                    $.each(currentRegionRace,function() {
                                        sumRegionRace += this;
                                    });

                                    var regionMale = renderOverlayData[name]["maleNumber"];
                                    var regionFemale = renderOverlayData[name]["femaleNumber"];

                                    var currentRegionGender = [regionMale, regionFemale];
                                    var sumRegionGender = regionMale + regionFemale;

                                    updateRaceChart(currentRegionRace, sumRegionRace);
                                    updateAgeChart(currentRegionAge, sumRegionAge);
                                    updateGenderChart(currentRegionGender, sumRegionGender);
                                    
                                } else {
                                    $("#raceDonutDiv").empty();
                                    $("#raceDonutTitle").css("display", "none");

                                    $(".data > .data1-details").css("display", "none");
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
                                    d3.json("/raceData", function(error, data) {
                                        if (error) throw error;
                                        var svg = d3.select("#raceDonutDiv")
                                            .append("svg")
                                            .style("height", 400)
                                            .style("width", 600)
                                            .append("g")

                                        svg.append("g")
                                            .attr("class", "slices");

                                        svg.append("g")
                                            .attr("class", "labels");

                                        svg.append("g")
                                            .attr("class", "lines");

                                        var width = 600,
                                            height = 300,
                                            radius = Math.min(width, height) / 3;

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

                                        svg.attr("transform", "translate(" + width / 3 + "," + height / 3 + ")");

                                        var key = function(d) {
                                            return d.data.label;
                                        };

                                        var color = d3.scale.ordinal()
                                            .domain(Object.keys(data["2010"][0]))
                                            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c"]);

                                        function randomData() {
                                            var labels = color.domain();
                                            return labels.map(function(label) {
                                                console.log(Object.keys(data["2010"][0]));
                                                return {
                                                    label: label,
                                                    value: Math.random()
                                                }
                                            });
                                        }

                                        change(randomData());
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

                                        function change(data) {
                                            console.log("!!!In Change " + data);
                                            //pie slices
                                            var slice = svg.select(".slices").selectAll("path.slice")
                                                .data(pie(data), key);

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
                                                .data(pie(data), key);

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
                                                .data(pie(data), key);

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
                                    });
                                }
                            })
                    });
                };

            };

            overlay.setMap(map);
        }
    );

})(d3);
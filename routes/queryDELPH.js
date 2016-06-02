var pg = require('pg');
var conString = process.env.DATABASE_CONNECTION_URL;

exports.map_anxiety_rate = function(req, res) {
    var client = new pg.Client(conString);

    client.connect(function(err) {
        if (err) {
            return console.error('could not connect to postgres', err);

        }



        client.query('SELECT * FROM cogs121_16_raw.hhsa_anxiety_disorder_2010_2012 AS tableData',
            function(err, result) {
                if (err) {
                    return console.error('error running query', err);
                }

                var rawData = result.rows;
                console.log("current raw data is: " + rawData);

                var returnGeoData = [];
                var maxAnxSumNumber = 0;
                var thisAreaSum = 0;
                var vaildGeoCounter = 0;

                var totalNumberAnx = 0;

                for (i = 0; i < rawData.length; i++) {
                    var renderGeoData = {};

                    var checkVaildGeoName = String(rawData[i]["Geography"]);

                    if ((checkVaildGeoName.indexOf("Region") > -1) ||
                        (checkVaildGeoName.indexOf("Unknown") > -1) ||
                        (checkVaildGeoName.indexOf("Rate") > -1)) {
                        continue;
                    }

                    renderGeoData["area"] = checkVaildGeoName;

                    var number2010 = rawData[i]["2010 Hospitalization No."];
                    if (number2010 == "<5") {
                        number2010 = 5;
                    } else {
                        number2010 = parseInt(number2010);
                    }

                    var number2011 = rawData[i]["2011 Hospitalization No."];
                    if (number2011 == "<5") {
                        number2011 = 5;
                    } else {
                        number2011 = parseInt(number2010);
                    }

                    var number2012 = rawData[i]["2012 Hospitalization No."];
                    if (number2012 == "<5") {
                        number2012 = 5;
                    } else {
                        number2012 = parseInt(number2010);
                    }

                    thisAreaSum = number2010 + number2011 + number2012;
                    renderGeoData["yearSum"] = thisAreaSum;

                    totalNumberAnx = totalNumberAnx + thisAreaSum;

                    if (maxAnxSumNumber < thisAreaSum) {
                        maxAnxSumNumber = thisAreaSum;
                    }

                    // get the race data from the database
                    var blackNum2010 = rawData[i]["2010 Black Hospitalization No."];
                    var blackNum2011 = rawData[i]["2011 Black Hospitalization No."];
                    var blackNum2012 = rawData[i]["2012 Black Hospitalization No."];
                    if (blackNum2010 == "<5") {
                        blackNum2010 = 2.5;
                    } else {
                        blackNum2010 = parseInt(blackNum2010);
                    }

                    if (blackNum2011 == "<5") {
                        blackNum2011 = 2.5;
                    } else {
                        blackNum2011 = parseInt(blackNum2011);
                    }

                    if (blackNum2012 == "<5") {
                        blackNum2012 = 2.5;
                    } else {
                        blackNum2012 = parseInt(blackNum2012);
                    }

                    renderGeoData["b2010"] = blackNum2010;
                    renderGeoData["b2011"] = blackNum2011;
                    renderGeoData["b2012"] = blackNum2012;

                    var whiteNum2010 = rawData[i]["2010 White Hospitalization No."];
                    var whiteNum2011 = rawData[i]["2011 White Hospitalization No."];
                    var whiteNum2012 = rawData[i]["2012 White Hospitalization No."];

                    if (whiteNum2010 == "<5") {
                        whiteNum2010 = 2.5;
                    } else {
                        whiteNum2010 = parseInt(whiteNum2010);
                    }

                    if (whiteNum2011 == "<5") {
                        whiteNum2011 = 2.5;
                    } else {
                        whiteNum2011 = parseInt(whiteNum2011);
                    }

                    if (whiteNum2012 == "<5") {
                        whiteNum2012 = 2.5;
                    } else {
                        whiteNum2012 = parseInt(whiteNum2012);
                    }

                    renderGeoData["w2010"] = whiteNum2010;
                    renderGeoData["w2011"] = whiteNum2011;
                    renderGeoData["w2012"] = whiteNum2012;

                    var hispanicNum2010 = rawData[i]["2010 Hispanic Hospitalization No."];
                    var hispanicNum2011 = rawData[i]["2011 Hispanic Hospitalization No."];
                    var hispanicNum2012 = rawData[i]["2012 Hispanic Hospitalization No."];

                    if (hispanicNum2010 == "<5") {
                        hispanicNum2010 = 2.5;
                    } else {
                        hispanicNum2010 = parseInt(hispanicNum2010);
                    }

                    if (hispanicNum2011 == "<5") {
                        hispanicNum2011 = 2.5;
                    } else {
                        hispanicNum2011 = parseInt(hispanicNum2011);
                    }

                    if (hispanicNum2012 == "<5") {
                        hispanicNum2012 = 2.5;
                    } else {
                        hispanicNum2012 = parseInt(hispanicNum2012);
                    }

                    renderGeoData["h2010"] = hispanicNum2010;
                    renderGeoData["h2011"] = hispanicNum2011;
                    renderGeoData["h2012"] = hispanicNum2012;

                    var apiNum2010 = rawData[i]["2010 API Hospitalization No."];
                    var apiNum2011 = rawData[i]["2011 API Hospitalization No."];
                    var apiNum2012 = rawData[i]["2012 API Hospitalization No."];

                    if (apiNum2010 == "<5") {
                        apiNum2010 = 2.5;
                    } else {
                        apiNum2010 = parseInt(apiNum2010);
                    }

                    if (apiNum2011 == "<5") {
                        apiNum2011 = 2.5;
                    } else {
                        apiNum2011 = parseInt(apiNum2011);
                    }

                    if (apiNum2012 == "<5") {
                        apiNum2012 = 2.5;
                    } else {
                        apiNum2012 = parseInt(apiNum2012);
                    }

                    renderGeoData["a2010"] = apiNum2010;
                    renderGeoData["a2011"] = apiNum2011;
                    renderGeoData["a2012"] = apiNum2012;

                    var otherNum2010 = rawData[i]["2010 Other Hospitalization No."];
                    var otherNum2011 = rawData[i]["2011 Other Hospitalization No."];
                    var otherNum2012 = rawData[i]["2012 Other Hospitalization No."];

                    if (otherNum2010 == "<5") {
                        otherNum2010 = 2.5;
                    } else {
                        otherNum2010 = parseInt(otherNum2010);
                    }

                    if (otherNum2011 == "<5") {
                        otherNum2011 = 2.5;
                    } else {
                        otherNum2011 = parseInt(otherNum2011);
                    }

                    if (otherNum2012 == "<5") {
                        otherNum2012 = 2.5;
                    } else {
                        otherNum2012 = parseInt(otherNum2012);
                    }

                    renderGeoData["o2010"] = otherNum2010;
                    renderGeoData["o2011"] = otherNum2011;
                    renderGeoData["o2012"] = otherNum2012;
                    
                    returnGeoData.push(renderGeoData);

                    vaildGeoCounter++;
                }
                console.log("TOTAL NUMBER IS " + totalNumberAnx);
                for (i = 0; i < vaildGeoCounter; i++) {
                    returnGeoData[i]["ratio"] = returnGeoData[i]["yearSum"] / totalNumberAnx;
                }

                client.query('SELECT * FROM cogs121_16_raw.hhsa_san_diego_demographics_county_population_2012',
                    function(err, result_population) {
                        if (err) {
                            return console.error('error running query', err);
                        }

                        var rawPopData = result_population.rows;

                        var j = 0;
                        for(j = 0; j < rawPopData.length; j++){
                            var areaChecking = rawPopData[i]["Area"].replace("San Diego", "SD");

                            var k = 0;
                            var isFoundInReturn = 0;

                            for(k = 0; k < returnGeoData.length; k++){
                                if(areaChecking == returnGeoData[k]["area"]){
                                    isFoundInReturn = 1;

                                    returnGeoData[k]["totalPop2012"] = parseInt(rawPopData[j]["Total 2012 Population"]);
                                }
                            }
                        }

                        res.json(returnGeoData);
                    });

                client.end();
            });
    });

    return {
        anxietyData: "No data present."
    }
}
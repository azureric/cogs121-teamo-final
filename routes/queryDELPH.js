var pg = require('pg');
var conString = process.env.DATABASE_CONNECTION_URL;

exports.map_anxiety_rate = function(req, res) {
    var client = new pg.Client(conString);
    client.connect(function(err) {
        if (err) {
            return console.error('could not connect to postgres', err);

        }
        client.query('SELECT "Geography", "2010 Hospitalization No.", "2011 Hospitalization No.", "2012 Hospitalization No." FROM cogs121_16_raw.hhsa_anxiety_disorder_2010_2012 AS tableData',
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

                    if (maxAnxSumNumber < thisAreaSum) {
                        maxAnxSumNumber = thisAreaSum;
                    }
                    returnGeoData.push(renderGeoData);

                    vaildGeoCounter++;
                }

                for (i = 0; i < vaildGeoCounter; i++) {
                    returnGeoData[i]["ratio"] = returnGeoData[i]["yearSum"] / maxAnxSumNumber;
                }

                console.log("NODE SIDE " + returnGeoData);
                res.json(returnGeoData);
                client.end();
            });
    });

    return {
        anxietyData: "No data present."
    }
}
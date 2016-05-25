//Necessary variables that for querying
var pg = require('pg');
var conString = process.env.DATABASE_CONNECTION_URL;


exports.delphidata =  function (req, res) {
    var client = new pg.Client(conString);
    client.connect(function(err) {
        if (err) {
            console.error('could not connect to postgres', err);
        } else {
            console.log("Successfully connected to postgres")
        }

    });

    client.query("SELECT gender, number_of_respondents FROM cogs121_16_raw.cdph_smoking_prevalence_in_adults_1984_2013 WHERE year = 2013 ORDER BY number_of_respondents ASC",function(err,dat){
        client.end();
        console.log(dat);
        res.json(dat.rows);
    });

    return { delphidata: "No data present." }
}

exports.vehicle_availability = function (req, res) {
    var client = new pg.Client(conString);

    client.connect(function(err) {
        if (err) {
            console.error('could not connect to postgres', err);
        } else {
            console.log("Successfully connected to postgres")
        }

    });

    client.query('SELECT * FROM cogs121_16_raw.hhsa_san_diego_demographics_vehicle_availability_2012 order by "Area" asc',function(err,dat){
        client.end();
        //console.log(err);
        res.json(dat.rows);
    });

    return { vehicle_availability: "No data present." }
}

exports.max_vehicles = function (req, res) {
    var client = new pg.Client(conString);
    client.connect(function(err) {
        if (err) {
            console.error('could not connect to postgres', err);
        } else {
            console.log("Successfully connected to postgres")
        }

    });
    var query = "select \"Area\", 100*(\"no vehicle available\"*1.0 / \"total households (occupied housing units)\")" +
        " as \"percent\"" +
        " from cogs121_16_raw.hhsa_san_diego_demographics_vehicle_availability_2012" +
        " where 100*(\"no vehicle available\"*1.0 / \"total households (occupied housing units)\") = (" +
        "select MAX( 100*(\"no vehicle available\"*1.0 / \"total households (occupied housing units)\")) as \"percent\" from cogs121_16_raw.hhsa_san_diego_demographics_vehicle_availability_2012)";

    client.query(query, function(err, dat){
        client.end();
        res.json(dat.rows);
    });

    return {max_vehicles: "No data present."}
}

exports.ranks = function (req, res) {
    var client = new pg.Client(conString);
    client.connect(function(err) {
        if (err) {
            console.error('could not connect to postgres', err);
        } else {
            console.log("Successfully connected to postgres")
        }

    });
    var query = "select \"Area\", 100*(\"no vehicle available\"*1.0 / \"total households (occupied housing units)\") as \"percent\"" +
        "from cogs121_16_raw.hhsa_san_diego_demographics_vehicle_availability_2012 order by \"percent\" desc";
    client.query(query, function(err, dat){
        client.end();
        res.json(dat.rows);
    });

    return {max_vehicles: "No data present."}
}

exports.map_anxiety_rate = function (req, res) {
    var client = new pg.Client(conString);
    client.connect(function(err) {
        if(err) {
            return console.error('could not connect to postgres', err);

        }
        client.query('SELECT "Geography", "2010 Hospitalization No.", "2011 Hospitalization No.", "2012 Hospitalization No." FROM cogs121_16_raw.hhsa_anxiety_disorder_2010_2012 AS tableData',
            function(err, result) {
                if(err) {
                    return console.error('error running query', err);
                }

                var rawData = result.rows;
                console.log("current raw data is: " + rawData);


                var returnGeoData = [];
                var maxAnxSumNumber = 0;
                var thisAreaSum = 0;
                var vaildGeoCounter = 0;

                for(i = 0; i < rawData.length; i++){
                    var renderGeoData = {};

                    var checkVaildGeoName = String(rawData[i]["Geography"]);

                    if((checkVaildGeoName.indexOf("Region") > -1) ||
                        (checkVaildGeoName.indexOf("Unknown") > -1) ||
                        (checkVaildGeoName.indexOf("Rate") > -1)){
                        continue;
                    }

                    renderGeoData["area"] = checkVaildGeoName;

                    var number2010 = rawData[i]["2010 Hospitalization No."];
                    if(number2010 == "<5"){
                        number2010 = 5;
                    }
                    else{
                        number2010 = parseInt(number2010);
                    }

                    var number2011 = rawData[i]["2011 Hospitalization No."];
                    if(number2011 == "<5"){
                        number2011 = 5;
                    }
                    else{
                        number2011 = parseInt(number2010);
                    }

                    var number2012 = rawData[i]["2012 Hospitalization No."];
                    if(number2012 == "<5"){
                        number2012 = 5;
                    }
                    else{
                        number2012 = parseInt(number2010);
                    }

                    thisAreaSum = number2010 + number2011 + number2012;
                    renderGeoData["yearSum"] = thisAreaSum;

                    if(maxAnxSumNumber < thisAreaSum){
                        maxAnxSumNumber = thisAreaSum;
                    }
                    returnGeoData.push(renderGeoData);

                    vaildGeoCounter++;
                }

                for(i = 0; i < vaildGeoCounter; i++){
                    returnGeoData[i]["ratio"] = returnGeoData[i]["yearSum"] / maxAnxSumNumber;
                }

                console.log("NODE SIDE " + returnGeoData);
                res.json(returnGeoData);
                client.end();
            });
    });

    return { anxietyData: "No data present." }

}
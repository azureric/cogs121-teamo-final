//dependencies for each module used
var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var dotenv = require('dotenv');
var pg = require('pg');
const passport = require("passport");

var app = express();

//client id and client secret here, taken from .env (which you need to create)
dotenv.load();

//connect to database
var conString = process.env.DATABASE_CONNECTION_URL;

//Configures the Template engine
app.engine('html', handlebars({ defaultLayout: 'layout', extname: '.html' }));
app.set("view engine", "html");
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'keyboard cat',
                  saveUninitialized: true,
                  resave: true}));

//set environment ports and start application
app.set('port', process.env.PORT || 3000);

//routes
app.get('/', function(req, res){
  res.render('index_landing');
});

app.get('/map_view', function(req, res){
  res.render('map_view');
});

app.get('/explore', function(req, res){
    res.render('explore');
});


app.get('/delphidata', function (req, res) {
  //connect to DELPHI Database
  var pg = require('pg');


  var conString = process.env.DATABASE_CONNECTION_URL;

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
        return console.error('could not connect to postgres', err);

    }
    /* has to change th query: Query: In the year 2003, retrieve the 
    total number of respondents for each gender from the Smoking 
    Prevalence in Adults table from 1984-2013. */
    /*cdph_smoking_prevalence_in_adults_1984_2013*/
    client.query('SELECT "Geography", "2010 Total MVC Injury No.", "2011 Total MVC Injury No.", "2010 Total MVC Injury Rate", "2011 Total MVC Injury Rate" FROM cogs121_16_raw.hhsa_total_injuries_due_to_motor_vehicle_crashes_2010_2011 AS tableData',
        function(err, result) {
            if(err) {
            return console.error('error running query', err);
            }

            var rawData = result.rows;
            var renderData = {"name": "flare", "children" : []};

            var unListedItem = [];


            for(i = 0; i < rawData.length; i++){
                // var renderDataItem = {};
                // renderDataItem["name"] = rawData[i].Geography;

                //var data2010 = rawData[i]["2010 Total MVC Injury No."];
                //var data2011 = rawData[i]["2011 Total MVC Injury No."];

                //renderDataItem["size"] = (data2010 + data2011)/2.0;
                //renderRootItem["children"].push(renderDataItem);

                var renderDataInjuryRate = {};
                renderDataInjuryRate["name"] = rawData[i].Geography;

                var injuryRate2010 = parseInt(rawData[i]["2010 Total MVC Injury Rate"]);
                var injuryNum2010 = parseInt(rawData[i]["2010 Total MVC Injury No."]);
                var injuryRate2011 = parseInt(rawData[i]["2011 Total MVC Injury Rate"]);
                var injuryNum2011 = parseInt(rawData[i]["2011 Total MVC Injury No."]);

                renderDataInjuryRate["size"] = (injuryRate2010 + injuryRate2011)/2.0;
                renderDataInjuryRate["regionID"] = 0;
                renderDataInjuryRate["2010InjuryNum"] = injuryNum2010;
                renderDataInjuryRate["2011InjuryNum"] = injuryNum2011;

                if(!isNaN(renderDataInjuryRate["size"])){
                    //console.log(rawData[i].Geography + " " +  renderDataInjuryRate["size"]);
                    unListedItem.push(renderDataInjuryRate);
                }
            }

            //console.log(renderData);

            client.query('SELECT "Region Number", "Area" FROM cogs121_16_raw.hhsa_san_diego_demographics_county_population_2012 AS regionArea',
                function(err, resultArea) {
                    if(err) {
                        return console.error('error running query', err);
                    }
                    console.log(resultArea);

                    var resultAreaRaw = resultArea.rows

                    for(k = 0; k < unListedItem.length; k++){
                        var targetGeoName = unListedItem[k]["name"];
                        for(j = 0; j < resultAreaRaw.length; j++){

                            targetGeoName = targetGeoName.replace("San Diego", "SD");

                            if(resultAreaRaw[j]["Area"] == targetGeoName) {
                                unListedItem[k]["regionID"] = resultAreaRaw[j]["Region Number"];
                                break;
                            }
                        }
                        if(unListedItem[k]["regionID"] == 0){
                            console.log("too sad");
                        }
                    }

                    var regionDict = [];
                    for(k = 0; k < resultAreaRaw.length; k++){
                        if(resultAreaRaw[k]["Region Number"].length != 1
                            && (resultAreaRaw[k]["Region Number"] != "County Total")){
                            console.log("Found a region!");
                            regionDict[resultAreaRaw[k]["Region Number"].charAt(0)] = resultAreaRaw[k]["Area"];
                            var regionDictData = {"name": resultAreaRaw[k]["Area"], "children": []};

                            console.log(resultAreaRaw[k]["Region Number"].charAt(0));

                            for(j = 0; j < unListedItem.length; j++){
                                if (unListedItem[j]["regionID"] == resultAreaRaw[k]["Region Number"].charAt(0)){

                                    regionDictData["children"].push(unListedItem[j]);
                                }
                            }
                            renderData["children"].push(regionDictData);
                        }
                    }

                    console.log(renderData);
                    res.json(renderData);

                }
            );

            client.end();
            //return { delphidata: result };
        });
  });

  return { delphidata: "No data present." }
});



http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

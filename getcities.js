var http = require("http");
var url = require("url");
var querystring = require("querystring");
var requestor = require('request');
var _ = require('underscore');
var async = require('async');

var geonames_user = 'ms_test201302';
var wxbug_api_key = 'y62cjp5538tpjq5ymxe3z8wn';

var fromRequest = function (request, getcities_callback) { //primary function which calls the various subfunctions in order

    var locationFromRequest = function (request) { // extract location from url request querystring
        return querystring.parse(url.parse(request.url).query)["dest"];
    };

    var nearbyCitiesFromLocation = function(location_options, callback){ //use geonames to find nearby cities
        _.defaults(location_options, { // set defaults
            location: '02139',
            radius: 30,
            maxrows: 20
        });
    location_options.radius = Math.ceil(location_options.radius * 1.609); // convert from mi to km

        var geo_options = { //options for calling geonames service
            url: 'http://ws.geonames.org/findNearbyPostalCodesJSON?placename=' + location_options.location +
            '&radius=' + location_options.radius +
            '&maxRows=' + location_options.maxrows +
            '&style=short&country=US' +
            '&username=' + geonames_user,
            json: true,
            encoding: 'utf8'
        };

    //get postal codes
    requestor.get(geo_options, function (err, response, jsonbody) {
        if (err){
            console.log("Got error: " + err.message);
            callback(err.message);}
        else {
            if (jsonbody.postalCodes) {
                nearbyCities = jsonbody.postalCodes;
                callback(nearbyCities);
            }
            else{

            getcities_callback('Error: dest is in incorrect format. Should be zip or name with spaces or commas as necessary'); //function can now only be called in this scope.
        }
    }
    });
    };

    var attachWeatherToCities = function(cities, callback) { // returns an object with cityname keys. useful intermediate format for various purposes.
        var weathered_cities = {};
        var wait = 0;
        cities.reverse(); // reverse cities so that duplicate city names will be overwritten by zip codes. it would be boring if user was directed to several zip codes within literally the same city
        async.each(cities, function(city,callback){
            wait += 50;
            setTimeout(function() {attachWeatherToCity(city, function (weathered_city){ // space out requests for wxbug
                weathered_cities[weathered_city.placeName] = weathered_city;
                callback(); // doesn't do anything except help async keep track
                });
            }, wait);
        },
        function(err){
            if (err) {
                console.log("Got error: " + err.message);
                callback(err.message);} // err callback
            else {
                callback(weathered_cities); // this is the 'real' callback
            }
        });

    } ;

    var attachWeatherToCity = function (city, callback) { // use wxbug to add weather to city objects

        zip_code=(city.postalCode);
        var wxbug_options = { // options for calling weatherbug service
            url: 'http://i.wxbug.net/REST/Direct/GetForecast.ashx?zip=' + zip_code +
            '&nf=7&ht=t&l=en&c=US&api_key=' + wxbug_api_key,
            json: true
        };
        requestor.get(wxbug_options, function (err, response, jsonweather) { //attach weather to the city object
            if (err){
                console.log("Got error: " + err.message);
                callback(err.message);}
            else {
                if (jsonweather.forecastList) {  //if forecast list correctly assigned (as opposed to qps overload)
                  city.weather = jsonweather.forecastList;
                  //console.log(city);
                  callback(city);}
                else { // if qps overload or similar, just do it again (and again) until we get a defined forecastList
                setTimeout(function() {attachWeatherToCity(city, callback);}, Math.random()*40+10);// wait 10-50 ms between requests, random to stagger requests from callbacks
                }
            }
        });
    };

    var cartesianWeatheredCities = function(weathered_cities, callback) { // returns city X days (1-D) array
        var city_day_array = [];
        _.each(weathered_cities, function(weathered_city){
            _.each(weathered_city.weather, function(days_weather){
                var city_day = {};
                _.extend(city_day, weathered_city); // add all info
                city_day.weather = null; // make old weather info null
                _.extend(city_day, days_weather); // add one day's weather info
                city_day_array.push(city_day);
            });
        });
        callback(city_day_array);
    };

    var sortCityDayArrayByHigh = function(city_day_array, callback) { // sort by high
        sorted_city_day_array = _.sortBy(city_day_array, function(city_day){
            if (city_day.high){
                return -(parseInt(city_day.high, 10)); // sort by descending high temperatures
            } else {
                return 9999999; //null values should be at bottom of list
            }
        });
        callback(sorted_city_day_array);
    };

    var topTenPretty = function (sorted_city_day_array, callback) { // get top ten places and clean up the output
        var topTen = sorted_city_day_array.slice(0,10);
        var topTenPretty = _.map(topTen, function(city_day){
            return '\n' + city_day.placeName + ' will have a high of ' + city_day.high + ' degrees on ' + city_day.dayTitle;
        });
        callback(topTenPretty);
    };

    var location = locationFromRequest(request);

    var location_options = {
        location: location
    };

    nearbyCitiesFromLocation(location_options, function(nearby_cities) {
        attachWeatherToCities(nearby_cities, function(weathered_cities) {
            cartesianWeatheredCities(weathered_cities, function(city_day_array) {
                sortCityDayArrayByHigh (city_day_array, function(sorted_city_day_array){
                    topTenPretty (sorted_city_day_array, function(topTen){

                        getcities_callback(topTen);
                    });
                });
            });
        });
    });
};

exports.fromRequest  = fromRequest;

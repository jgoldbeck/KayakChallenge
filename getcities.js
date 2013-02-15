var http = require("http");
var url = require("url");
var querystring = require("querystring");
var requestor = require('request');
var _ = require('underscore');
var async = require('async');

var geonames_user = 'ms_test201302';
var wxbug_api_key = 'fbzpn6ambx9de5nusf49rv4d';

var fromRequest = function (request, callback) { //primary function which calls the various subfunctions in order
    var location = locationFromRequest(request);
    var location_options = {
        location: location
    };
    nearbyCitiesFromLocation(location_options, function(nearby_cities) {
        attachWeatherToCities(nearby_cities, function(weathered_cities) {
            cartesianWeatheredCities(weathered_cities, function(city_day_array) {
                callback(city_day_array);
            });
        });
    });
};

var locationFromRequest = function (request) {
    return querystring.parse(url.parse(request.url).query)["dest"];
};

var nearbyCitiesFromLocation = function(location_options, callback){
    _.defaults(location_options, { // set defaults
        location: '02139',
        radius: 30,
        maxrows: 10
    });
location_options.radius = Math.ceil(location_options.radius * 1.609); // convert from mi to km

var geo_options = { //options for calling geonames service
    url: 'http://ws.geonames.org/findNearbyPostalCodesJSON?placename=' + location_options.location +
    '&radius=' + location_options.radius +
    '&maxRows=' + location_options.maxrows +
    '&style=short' +
    '&username=' + geonames_user,
    json: true,
    encoding: 'utf8'
};

//get postal codes
requestor.get(geo_options, function (err, response, jsonbody) {
    if (err){
        console.log("Got error: " + err.message);
        callback(err.message);
    } else {
        nearbyCities = jsonbody.postalCodes;
        callback(nearbyCities);
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

var attachWeatherToCity = function (city, callback) {

    zip_code=(city.postalCode);
    var wxbug_options = { // options for calling weatherbug service
        url: 'http://i.wxbug.net/REST/Direct/GetForecast.ashx?zip=' + zip_code +
        '&nf=7&ht=t&l=en&c=US&api_key=' + wxbug_api_key,
        json: true
    };
    requestor.get(wxbug_options, function (err, response, jsonweather) { //attach weather to the city object
        if (err){
            console.log("Got error: " + err.message);
            callback(err.message);
        } else {
            if (jsonweather.forecastList) {  //if forecast list correctly assigned (as opposed to qps overload)
              city.weather = jsonweather.forecastList;
              //console.log(city);
              callback(city);
          }
      else { // if qps overload or similar, just do it again (and again) until we get a defined forecastList
        setTimeout(function() {attachWeatherToCity(city, callback);}, Math.random()*40+10); // wait 10-50 ms between requests, random to stagger requests from callbacks
    }
}

});
};

var cartesianWeatheredCities = function(weathered_cities, callback) { // returns weather X days array
    var city_day_array = [];

    _.each(weathered_cities, function(weathered_city){
        _.each(weathered_city.weather, function(days_weather){
            var city_day = {};
            _.extend(city_day, weathered_city); // add all info
            city_day.weather = null; // make old weather info null
            _.extend(city_day, days_weather); // add one day's weather info

            console.log(city_day);

            city_day_array.push(city_day);
        }   );

    }

        );
    callback(city_day_array);
};



exports.fromRequest  = fromRequest;

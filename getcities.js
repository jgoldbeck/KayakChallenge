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
    callback(weathered_cities);}
    );

});
};

var locationFromRequest = function (request) {
    return querystring.parse(url.parse(request.url).query)["dest"];
};

var nearbyCitiesFromLocation = function(location_options, callback){
    _.defaults(location_options, { // set defaults
        location: '02139',
        radius: 30,
        maxrows: 100
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

var attachWeatherToCities = function(cities, callback) {
    var weathered_cities = {};
    cities.reverse(); // reverse cities so that duplicate city names will be overwritten by zip codes. it would be boring if user was directed to several zip codes within literally the same city
    var wait = 0;
    async.each(cities, function(city,callback){
        wait += 500;  // need to delay because of api rate limit
        console.log(wait);
        var thing = function(weathered_city){

            //console.log(weathered_cities);
            callback(); // weathered_cities[city.location] = weathered_city;

        };
        setTimeout(function() {attachWeatherToCity(city, thing);}, wait);

    },
    function(err){
        if (err) {
            console.log("Got error: " + err.message);
            callback(err.message);}
        else {
            callback(weathered_cities);
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
            callback(err.message); // check is response is 200?????
        } else {
          city.weather = jsonweather.forecastList;
          console.log(city);
          callback(city);
      }

  });
};





exports.fromRequest  = fromRequest;

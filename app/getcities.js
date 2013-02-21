var url = require("url");
var util = require("util");
var querystring = require("querystring");
var cities = require("./cities");
var weather = require("./weather");

var fromRequest = function (request, getcities_callback) { //primary function which calls the various subfunctions in order

    var locationFromRequest = function (request) { // extract location from url request querystring
        return querystring.parse(url.parse(request.url).query)["dest"];
    };

    var location = locationFromRequest(request);
    var location_options = {
        location: location,
        radius: 30,
        num_cities: 20,
        remove_duplicates: true
    };

    cities.nearLocation(location_options, function(err, nearby_cities_result) {
        if (err){
            getcities_callback(nearby_cities_result); // an error message
        }
        else{
        weather.topTenHighsText(nearby_cities_result, function(topTen) {
            getcities_callback(topTen);
        });
    }
    });
};

exports.fromRequest  = fromRequest;

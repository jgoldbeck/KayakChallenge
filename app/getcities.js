var http = require("http");
var url = require("url");
var querystring = require("querystring");
var requestor = require('request');
var _ = require('underscore');
var async = require('async');
var cities = require("./cities");
var weather = require("./weather");

var fromRequest = function (request, getcities_callback) { //primary function which calls the various subfunctions in order

    var locationFromRequest = function (request) { // extract location from url request querystring
        return querystring.parse(url.parse(request.url).query)["dest"];
    };

    var location = locationFromRequest(request);
    var location_options = {
        location: location
    };

    cities.nearLocation(location_options, function(nearby_cities) {
        weather.topTenHighsText(nearby_cities, function(topTen) {
                        getcities_callback(topTen);
        });
    });
};

exports.fromRequest  = fromRequest;
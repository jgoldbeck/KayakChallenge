var requestor = require('request');
var _ = require('underscore');
var async = require('async');

var wxbug_api_key = 'y62cjp5538tpjq5ymxe3z8wn';

var attachToCities = function(cities, callback) { // returns an object with cityname keys. useful intermediate format for various purposes.
    var weathered_cities = {};
    var wait = 0;
    cities.reverse(); // reverse cities so that duplicate city names will be overwritten by zip codes. it would be boring if user was directed to several zip codes within literally the same city
    async.each(cities, function(city,callback){
            wait += 200; // rate limit is nominally 500 ms/request
            setTimeout(function() {attachToCity(city, function (weathered_city){ // space out requests for wxbug
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
        }
    );
};

var attachToCity = function (city, callback) { // use wxbug to add weather to city objects

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
        }
        else {
            if (jsonweather.forecastList) {  //if forecast list correctly assigned (as opposed to qps overload)
                city.weather = jsonweather.forecastList;
                  //console.log(city);
                callback(city);}
            else { // if qps overload or similar, just do it again (and again) until we get a defined forecastList
                //console.log('Had to retry for wxbug likely due to rate limit');
                setTimeout(function() {attachToCity(city, callback);}, Math.random()*40+10);// wait 10-50 ms between requests, random to stagger requests from callbacks
            }
        }
    });
};

var cartesianWeatheredCities = function(weathered_cities, callback) { // returns city X days (1-D) array
    var city_day_array = [];
    _.each(weathered_cities, function(weathered_city){
        weathered_city.weather.forEach(function(days_weather){
            var city_day = {};
                _.extend(city_day, weathered_city); // add all info
                city_day.weather = null; // make old weather info null
                _.extend(city_day, days_weather); // add one day's weather info
                city_day_array.push(city_day);
            });
    });
    callback(city_day_array);
};

var sortCityDayArrayByHigh = function(city_day_array) { // sort by high
    sorted_city_day_array = city_day_array.sort(function(city_day){
        if (city_day.high){
                return -(parseInt(city_day.high, 10)); // sort by descending high temperatures
        } else {
                return 9999999; //null values should be at bottom of list
            }
        });
    return(sorted_city_day_array);
};

var topTenText = function (sorted_city_day_array) { // get top ten places and clean up the output
    var topTen = sorted_city_day_array.slice(0,10);
    var topTenText = topTen.map(function(city_day){
        return '\n' + city_day.placeName + ' will have a high of ' + city_day.high + ' degrees on ' + city_day.dayTitle;
    });
    return(topTenText);
};


var topTenHighsText = function (cities, callback) {

    attachToCities(cities, function(weathered_cities) {
        cartesianWeatheredCities(weathered_cities, function(city_day_array){
            var sorted_city_day_array = sortCityDayArrayByHigh (city_day_array);
            var topTen = topTenText (sorted_city_day_array);
            callback(topTen);
});
    });


};

exports.topTenHighsText  = topTenHighsText;

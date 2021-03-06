var requestor = require('request');
var _ = require('underscore');
var async = require('async');
var S = require('string');

var wxbug_api_key = 'y62cjp5538tpjq5ymxe3z8wn';

// input: array of cities from cities.js for example, an array of one city: [{distance: 0, postalCode: '02139',
//                                                                                                                    countryCode: 'US', lng: -71.104155,
//                                                                                                                    placeName: 'Cambridge', lat: 42.364688 }]
// output: text indicating the top 10 highs over the next 7 days across the input cities
//               an example of one line: 'Cambridge will have a high of 45 degrees on Tuesday,'
var topTen = function (cities, weather_property, callback) {
    attachToCities(cities, function(weathered_cities) {
        cartesianWeatheredCities (weathered_cities, function(city_day_array){
            sortCityDayArray (city_day_array, weather_property, function(sorted_city_day_array, sort_property){
                callback( topTenText(sorted_city_day_array, sort_property) );
            });
        });
    });
};

function attachToCities (cities, callback) { // returns an object with cityname keys. useful intermediate format for various purposes.
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
}

function attachToCity  (city, callback) { // use wxbug to add weather to city objects
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
                callback(city);}
            else { // if qps overload or similar, just do it again (and again) until we get a defined forecastList
                setTimeout(function() {attachToCity(city, callback);}, Math.random()*40+10);// wait 10-50 ms between requests, random to stagger requests from callbacks
            }
        }
    });
}

function cartesianWeatheredCities (weathered_cities, callback) { // returns city X days (1-D) array
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
}

function sortCityDayArray (city_day_array, sort_property, callback) { // sort descending by  sort_property (e.g. 'high' or 'low')
    city_day_array.sort(function(city_day_a, city_day_b){
        if (!city_day_a && !city_day_b){ // if both are null
            return 0; // order not important
        }
        if (!city_day_a){ // if city_day_a is null
            return 1; // a should be at end
        }
        if (!city_day_b){ // if city_day_a is null
            return -1; // b should be at end
        }
        if (city_day_a[sort_property] > city_day_b[sort_property]){
            return -1;} // high temperatures should come early
        if (city_day_a[sort_property] < city_day_b[sort_property]){
            return 1;} // low temperatures should come later
        else{
            return 0;
        }
    });
    callback (city_day_array, sort_property);
}

function topTenText  (sorted_city_day_array, sort_property) { // get top ten places and clean up the output
    var topTen = sorted_city_day_array.slice(0,10);
    var topTenTextOut = topTen.map(function(city_day){
        return '\n<li>' + city_day.placeName + ' will have a ' + sort_property + ' of ' + city_day[sort_property] + ' degrees on ' + city_day.dayTitle + '</li>';
    });
    topTenhtml = '<html>\n' +
                                '<body>\n' +
                                    '<h3>Warmest '  + S(sort_property).capitalize().s + 's Near Your Destination This Week</h3>\n' +
                                    '<ul>' +
                                    topTenTextOut.join('')+ '\n' +
                                    '</ul>\n' +
                                '</body>\n' +
                            '</html>';
    return (topTenhtml);
}



exports.topTen  = topTen;

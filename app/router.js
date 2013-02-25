var url = require("url");
var cities = require("./cities");
var weather = require("./weather");
var fs = require("fs");

var reply = function (request, response_callback) { //primary function which calls the various subfunctions in order

    var parsed_url = url.parse(request.url, parseQueryString = true);

    if (parsed_url.query.dest) { // if destination is input, then find nearby preferred weather and return results

        var location_options = {
            location: parsed_url.query.dest,
            radius: 30, // miles
            num_cities: 10,
            remove_duplicates: true
        };

        cities.nearLocation(location_options, function(err, nearby_cities_result) {
            if (err){
            response_callback(nearby_cities_result);} // an error message
            else{

                if (parsed_url.query.wxsort){ // find nearby maximal desired weather properties as indicated by wxsort
                    weather.topTen(nearby_cities_result, parsed_url.query.wxsort, function(topTenText) {
                        response_callback(topTenText);
                    });
                }

                else{ // default to finding the highs if no weather property indicated
                    weather.topTen(nearby_cities_result, 'high', function(topTenText) {
                        response_callback(topTenText);
                    });
                }
            }
        });
    }
    else{ // display a form so user can enter destination
        fs.readFile('./app/views/input_form.html', function(err, input_form) {
            response_callback(input_form);
        });
    }
};

exports.reply  = reply;

var url = require("url");
var cities = require("./cities");
var weather = require("./weather");
var input = require("./views/input");

var reply = function (request, response_callback) { //primary function which calls the various subfunctions in order

    var parsedUrl = url.parse(request.url, parseQueryString=true);

    if (parsedUrl.query.dest) { // if destination is input, then find nearby highs and return results

        var location_options = {
            location: parsedUrl.query.dest,
            radius: 30, // miles
            num_cities: 20,
            remove_duplicates: true
        };

        cities.nearLocation(location_options, function(err, nearby_cities_result) {
            if (err){
            response_callback(nearby_cities_result);} // an error message
            else{
                weather.topTenHighsText(nearby_cities_result, function(topTen) {
                    response_callback(topTen);
                });
            }
        });
    }
    else{ // display a form so user can enter destination
        response_callback(input.formView());
    }
};

exports.reply  = reply;

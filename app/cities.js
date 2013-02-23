var requestor = require('request');
var _ = require('underscore');

var geonames_user = 'ms_test201302';


// input: US city or zip code (i.e. Cambridge, MA; Cambridge; Cambridge MA; 02139)
// output: array of nearby city objects. for example [{distance: 0, postalCode: '02139', countryCode: 'US',
//                                                                                     lng: -71.104155, placeName: 'Cambridge', lat: 42.364688 }]
var nearLocation = function(location_options, callback){ //use geonames to find nearby cities
        _.defaults(location_options, { // set defaults
            location: '02139',
            radius: 30,
            num_cities: 20,
            remove_duplicates: true // remove multiple city entries with same location name (but different postal codes)
        });
        location_options.radius = Math.ceil(location_options.radius * 1.609); // convert from mi to km

        // set max_rows parameter for geonames api call
        if (location_options.remove_duplicates){
            max_rows = Math.min(location_options.num_cities * 20, 2500);} // need extra cities to remove dups later; max per api call is 2500
        else{
            max_rows = location_options.num_cities;}

        var geo_options = { //options for calling geonames service
            url: 'http://ws.geonames.org/findNearbyPostalCodesJSON?placename=' + location_options.location +
            '&radius=' + location_options.radius +
            '&maxRows=' + max_rows +
            '&style=short&country=US' +
            '&username=' + geonames_user,
            json: true,
            encoding: 'utf8'
        };

    //get postal codes
    requestor.get(geo_options, function (err, response, jsonbody) {
        if (err){
            console.log("Got error: " + err.message);
            callback(true, err.message);}
        else {
            if (jsonbody.postalCodes) { // get nearby_cities from json
                nearby_cities = jsonbody.postalCodes.map(function(city){
                    city.distance = parseFloat(city.distance);
                    return city;
                });

                if (location_options.remove_duplicates){ // remove duplicates if set in options
                    var included_cities = [];
                    var nearby_cities_no_dups = [];
                    var cities_list = [];
                    nearby_cities.forEach(function(city){
                        if (cities_list.indexOf(city.placeName)==-1){ // if not already in array
                                cities_list.push(city.placeName); // add to list
                                nearby_cities_no_dups.push(city); //add to array
                            }
                    });
                    nearby_cities = nearby_cities_no_dups;
                }

                nearby_cities = nearby_cities.slice(0, location_options.num_cities); // shorten cities array to proper output length

                callback(null, nearby_cities);
            }
            else{
                callback(true, 'Error: dest may be in incorrect format. Should be zip or name with spaces or commas as necessary\n Response:' + jsonbody.status.message); //function can now only be called in this scope.
            }
        }
    });
};

exports.nearLocation  = nearLocation;

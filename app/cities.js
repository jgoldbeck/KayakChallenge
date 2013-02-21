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
            callback(true, err.message);}
        else {
            if (jsonbody.postalCodes) {
                nearbyCities = jsonbody.postalCodes.map(function(city){
                    city.distance = parseFloat(city.distance);
                    return city;
                });
                callback(null, nearbyCities);
            }
            else{
                callback(true, 'Error: dest may be in incorrect format. Should be zip or name with spaces or commas as necessary\n Response:' + jsonbody.status.message); //function can now only be called in this scope.
            }
        }
    });
};

exports.nearLocation  = nearLocation;

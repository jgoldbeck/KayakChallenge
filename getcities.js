var http = require("http");
var url = require("url");
var querystring = require("querystring");
var requestor = require('request');

var fromRequest = function (request, callback){ //primary function which calls the various subfunctions in order
    locationFromRequest(request, function(location) {
      nearbyCitiesFromLocation(location, function(nearbycities){
          callback(nearbycities)
   //     });
      });
    });
  }

var locationFromRequest = function (request, callback){
 var zip_code = querystring.parse(url.parse(request.url).query)["dest"];
 callback(zip_code);
}

var nearbyCitiesFromLocation = function(location, callback){
  var radius = 30 * 1.609; // km
  var maxrows = 100; // should be set to high number
  var options = {
    url: 'http://ws.geonames.org/findNearbyPostalCodesJSON?placename=' + location +
     '&radius=' + radius +
     '&maxRows=' + maxrows +
     '&style=short' +
     '&username=ms_test201302',
    json: true,
    encoding: 'utf8'
  };
  requestor.get(options, function (err, response, jsonbody) {
    if (err){
      console.log("Got error: " + err.message);
      callback(err.message);
    } else {
      nearbyCities = jsonbody.postalCodes;
      callback(nearbyCities);
    }
  });
}

exports.fromRequest  = fromRequest;

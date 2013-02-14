var http = require("http");
var url = require("url");
var querystring = require("querystring");
var requestor = require('request');


var zipFromRequest = function (request, callback){
 var zip_code = querystring.parse(url.parse(request.url).query)["zip"];
 callback(zip_code);
}

var jsonFromZip = function(zip_code, callback){
  var options = {
    url: 'http://ws.geonames.org/postalCodeLookupJSON?postalcode=02139&country=US&username=ms_test201302',
    //json: true
  };

  requestor.get(options, function (err, response, body) {
    if (err){
      console.log("Got error: " + err.message);
      callback(err.message);
    } else {
      callback(body);
    }
  });
}
var geoFromJSON = function(geoJSON){

//   console.log('JSON: ' + geoJSON);
}



exports.zipFromRequest = zipFromRequest;
exports.jsonFromZip = jsonFromZip;

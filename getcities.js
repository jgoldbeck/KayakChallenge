var http = require("http");
var url = require("url");
var querystring = require("querystring");
var requestor = require('request');


function fromRequest (request, callback){
 var url_parts = url.parse(request.url);
 var query = url_parts.query;
 var queries = querystring.parse(query);
 var zip_code = queries["zip"]
 //FromZip(zip_code, callback);
 callback(zip_code);
}

var fromZip = function(zip_code, callback){
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
// var FromJSON = function(geoJSON){

//   console.log('JSON: ' + geoJSON);
// }



exports.fromRequest = fromRequest;
exports.fromZip = fromZip;

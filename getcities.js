var http = require("http");
var url = require("url");
var querystring = require("querystring");

function FromRequest (request){
 var url_parts = url.parse(request.url);
 var query = url_parts.query;
 var queries = querystring.parse(query);
 var zip_code = queries["zip"]
 FromZip(zip_code);
}

var FromZip = function(zip_code){
  var options = {
    host: 'ws.geonames.org',
    port: 80,
    path: '/postalCodeLookupJSON?postalcode='+ zip_code + '&country=US&username=ms_test201302'
  };

  http.get(options, function(res) {
    console.log("Got response: " + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));

    res.on('data', FromJSON
      );
  }).on('error', function(e) {console.log("Got error: " + e.message); });
}

var FromJSON = function(geoJSON){

  console.log('JSON: ' + geoJSON);
}



exports.FromRequest = FromRequest;

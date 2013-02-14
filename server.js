var http = require("http");
var url = require("url");
var querystring = require("querystring");



var getCitiesFromRequest = function(request){
 var url_parts = url.parse(request.url);
 var query = url_parts.query;
 var queries = querystring.parse(query);
 var zip_code = queries["zip"]
 getCitiesFromZip(zip_code);
}

var getCitiesFromZip = function(zip_code){
  var options = {
    host: 'ws.geonames.org',
    port: 80,
    path: '/postalCodeLookupJSON?postalcode='+ zip_code + '&country=US&username=ms_test201302'
  };

  http.get(options, function(res) {
    console.log("Got response: " + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));

    res.on('data', getCitiesFromJSON
    );
  }).on('error', function(e) {console.log("Got error: " + e.message); });
}

var getCitiesFromJSON = function(geoJSON){

console.log('desd' + geoJSON);
}


function start() {
  function onRequest(request, response) {

    getCitiesFromRequest(request);

    var url_parts = url.parse(request.url);
    var query = url_parts.query;
    var pathname = url_parts.pathname;
    console.log("Request for " + pathname + " received.");

    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World\n");
    response.end();
  }
http.createServer(onRequest).listen(8888);
console.log("Server has started.");
}

exports.start = start;

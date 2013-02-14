var http = require("http");
var url = require("url");
var querystring = require("querystring");
var getcities = require("./getcities");

function start() {
  function onRequest(request, response) {

    getcities.FromRequest(request);

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

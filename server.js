var http = require("http");
var url = require("url");
var util = require("util");
var querystring = require("querystring");
var getcities = require("./getcities");

var port = process.env.PORT || 5000;

function start() {
  function onRequest(request, response) {

    getcities.fromRequest(request, function(result) {

          console.log("Inspect result:" + util.inspect(result, true, null));

          var url_parts = url.parse(request.url);
          var pathname = url_parts.pathname;
          console.log("Request for " + pathname + " received.");

          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write("Hello World\n");
          response.write("Result:" + result);
          response.end();
        });
  }
  http.createServer(onRequest).listen(port);
  console.log("Server has started.");
}

exports.start = start;

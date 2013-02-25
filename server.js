var http = require("http");
var url = require("url");
var util = require("util");
var querystring = require("querystring");
var router = require("./app/router");

var port = process.env.PORT || 5000;

function start() {
    function onRequest(request, response) {

        router.reply(request, function(reply) {

            var url_parts = url.parse(request.url);
            var pathname = url_parts.pathname;
            console.log("Request for " + pathname + " received.");

            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write('<!doctype html>\n' + reply);
            response.end();
        });
    }
    http.createServer(onRequest).listen(port);
    console.log("Server has started.");
}

exports.start = start;


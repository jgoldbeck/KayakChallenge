var requestor = require('request');
var timeout = 60000; // 60 secs

describe('nearby warm weather', function(){

    var browser_options = {
        url: 'http://localhost:5000/test?zip=02139',
        timeout: timeout
    };

    it("should respond with non-null weather and city info", function(done) { // this should probably be several specs, but I'm not sure how to do that with one browser request
        requestor.get(browser_options, function (err, response, body) {
            expect(response.statusCode).toEqual(200);
            expect(body).toMatch(/(.*) will have a high of \d+ degrees on (.*)/);
            expect(body).not.toContain('undefined');
            expect(body).not.toContain('null');
            done();
        });
    }, timeout);

});

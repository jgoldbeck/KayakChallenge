var requestor = require('request');
var timeout = 60000; // 60 secs
var port = process.env.PORT || 5000;

describe('nearby warm weather', function(){

    beforeEach(function() {
        this.addMatchers({
            toBeSortedDescending: function() {
                var arr = this.actual;
                for (var i = 0; i < arr.length-1; i++){
                    if (arr[i] < arr[i+1]){
                        return false;
                    }
                }
                return true;
            }
        });
    });

    var browser_options = {
        url: 'http://localhost:' + port + '/test?dest=02139',
        timeout: timeout
    };

    it("should respond with non-null weather and city info with descending temperatures", function(done) { // this should probably be several specs, but I'm not sure how to do that with one browser request
        requestor.get(browser_options, function (err, response, body) {
            expect(response.statusCode).toEqual(200);
            expect(body).toMatch(/.* will have a .* of \d+ degrees on .*/);
            expect(body).not.toContain('undefined');
            expect(body).not.toContain('null');
            var temps = (body.match(/(\d+)/g)).map(function(temp){return parseInt(temp,10);});
            expect(temps).toBeSortedDescending();
            done();
        });
    }, timeout);

});

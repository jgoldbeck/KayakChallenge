KayakChallenge v0.6.0
==============

App for a MindSumo contest to take in a location within the US and output the warmest 10 cities within 30 miles over the next 7 days along with the days those temperatures occurred on. Pretty simple, with kind of silly output, but lots of potential to expand and do cooler things.

Right now, the main function (getcities) is called using a url with a querystring containing 'dest=location' where 'location' can be a zip code or city name. An example of how to run the app from a browser (after starting with 'node web.js') is 'http://localhost:5000/test?dest=02139' . The path doesn't do anything yet, so 'test' is just a placeholder.

Implemented with node.js because I wanted to learn it. Also, node could have made the app blazingly fast, but the Geonames API is only accepting a request every ~500 ms. Therefore, the app is *slow* unless you use a better api key or switch services.

You can interact with the app at http://kayakchallenge.herokuapp.com . It may take some time to load, due to the rate-limited APIs it uses.

If you like it warm, http://kayakchallenge.herokuapp.com/whynotgoto?dest=Austin

Authored by jgoldbeck. February 15, 2013

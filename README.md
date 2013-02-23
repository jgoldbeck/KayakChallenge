KayakChallenge v1.0.5
==============

App for a MindSumo contest to take in a location within the US and output the warmest 10 cities within 30 miles over the next 7 days along with the days those temperatures occurred on. Pretty simple, with kind of silly output, but lots of potential to expand and do cooler things.

The front end is a form in which the user enters a zip code or city name, followed by some text output listing the top ten nearby highs. Currently, only 20 nearby cities are considered to find the highs because the WeatherBug API only accepts a request every ~500 ms. Therefore, the app is *slow* unless you use a better api key or switch services.

You can interact with the app at http://kayakchallenge.herokuapp.com . It may take some time to load, due to the rate-limited APIs it uses.

Implemented with node.js because I wanted to learn it.

Authored by jgoldbeck. Version 1.0.5 February 22, 2013

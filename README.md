KayakChallenge v1.2
==============

App for Kayak's MindSumo contest to take in a location within the US and output the warmest 10 cities within 30 miles over the next 7 days, along with the days those temperatures occurred on. Pretty simple, with kind of silly output, but lots of potential to expand and do cooler things.

The front end is a form in which the user enters a zip code or city name and indicates whether they care about the daily highs or lows. After submitting, the user is presented with a text output listing the top ten warmest highs or lows accordingly. Currently, only 20 nearby cities are considered per user request because WeatherBug only accepts an API request every ~500 ms and I wanted to keep wait times reasonable.

You can interact with the app at http://kayakchallenge.herokuapp.com . It takes about 10 seconds load, due to the rate-limited APIs it uses.

Implemented with node.js because I wanted to learn it.

Authored by jgoldbeck. Version 1.2 February 26, 2013

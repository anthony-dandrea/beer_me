var search  = require('./searchAlgos');
var secrets = require('./../secrets');
var request = require('request');

var utdApi = {
	'parseResp':
		function(beer, response, userCoords) {
            /////////////////////////////////////////
            // Fake need to get userCoords from FE
            var userCoords = [41.930136, -87.696007];
            /////////////////////////////////////////

            if (userCoords) {
                console.log('about to start');
                var data = JSON.parse(response);
                var potentialMatches = [];

                // Loop to create an array of names
                // compared in the search algo to best
                // match the beer name
                data.response.beers.items.forEach(function(elem, idx) {
                    potentialMatches[idx] = elem.beer.beer_name || 'N/A';
                });

                var matchedBeerIndex = search.searchBeer(beer, potentialMatches);
                var matchedBeerId = data.response.beers.items[matchedBeerIndex].beer.bid;

                // New call for venue_info using matchedBeerId
                // /v4/beer/info/BID
                var untappdInfoEndpoint = 'https://api.untappd.com/v4/beer/info/' + matchedBeerId + '?client_id=' + secrets.utdIdKey + '&client_secret=' + secrets.utdSecretKey;
                var coordsReceived = [];
                var venuName = '';
                var bidData = {};
                request(untappdInfoEndpoint, function (error, response, body) {
                  if (!error && response.statusCode == 200) {
                    bidData = JSON.parse(body).response.beer.checkins.items;
                    bidData.forEach(function(elem, idx) {
                        // Make an array of the long/lats
                        // debugger;
                        if (elem.venue.location){
                            coordsReceived.push([elem.venue.location.lat, elem.venue.location.lng]);
                        } else {
                            delete bidData[idx];
                        }
                    });

                    console.log('about to search using ', userCoords,coordsReceived);
                    closestVenueCoords = search.searchLocation(userCoords, coordsReceived);
                    console.log('closestVenueCoords',closestVenueCoords);
                    debugger;
                    return bidData[closestVenueCoords.index];;
                  } else if (error) {
                    return 'Error with Untappd BID endpoint';
                  }
                });

            } else {
                // if no location given
                return 'User did not give location'
            }
		}
}

module.exports = utdApi;

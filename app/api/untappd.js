var request     = require('request');
var beerMock    = require('../untappdBeerMock.json');
var venueMock   = require('../untappdVenueMock.json');
var search      = require('./searchAlgos');
var secrets     = require('./../secrets');


var utdApi = {
    // Handle first untappd call for beer search
	'parseBeerResp':
		function(body) {
            var beer = body.beer;
            var getBeerResults = function(response) {
                console.log('success for beersearch');
                var data = JSON.parse(response);
                var potentialMatches = [];
                // Loop to create an array of names
                // compared in the search algo to best
                // match the beer name
                data.response.beers.items.forEach(function(elem, idx) {
                    potentialMatches[idx] = elem.beer.beer_name || 'N/A';
                });

                // Make call to search beer algo
                var matchedBeerIndex = search.searchBeer(beer, potentialMatches);

                var matchedBeerInfo = data.response.beers.items[matchedBeerIndex]
                var matchedBeerId = data.response.beers.items[matchedBeerIndex].beer.bid;
                console.log('beerInfo',matchedBeerInfo,'bid',matchedBeerId);
                return {'beerInfo': matchedBeerInfo, 'bid': matchedBeerId}
            }

            if (!body.mock) {
                // Make actual call and get results
                var untappdBeerEndpoint = 'https://api.untappd.com/v4/search/beer?client_id=' + secrets.utdIdKey + '&client_secret=' + secrets.utdSecretKey + '&q=' + encodeURIComponent(beer);
                request(untappdBeerEndpoint, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        getBeerResults(response);
                    } else {
                        console.log('200 for beersearch');
                        return {'error': 'Beer search failed'};
                    }
                });
            } else {
                // Use copied json for mock
                getBeerResults(beerMock);
            }
		},

    // Handle *potential* 2nd call for venue locations
    'parseVenueResp':
        function(body, bid) {
            var userCoords = body.location;

            var getVenueResults = function(response) {
                var coordsReceived = [];
                var venuName = '';
                var bidData = {};
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

                console.log('about to search using', userCoords,coordsReceived);
                closestVenueCoords = search.searchLocation(userCoords, coordsReceived);
                console.log('closestVenueCoords',closestVenueCoords);
                debugger;
                return bidData[closestVenueCoords.index];
            }

            if (!body.mock) {
                // Make actual call and get results
                var untappdInfoEndpoint = 'https://api.untappd.com/v4/beer/info/' + matchedBeerId + '?client_id=' + secrets.utdIdKey + '&client_secret=' + secrets.utdSecretKey;
                request(untappdInfoEndpoint, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        getVenueResults(response);
                    } else {
                        return {'error': 'Venue search failed'};
                    }
                });

            } else {
                // Use copied json for mock
                getVenueResults(venueMock);
            }
        }
}

module.exports = utdApi;

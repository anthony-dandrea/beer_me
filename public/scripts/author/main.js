angular.module('app', [function(){}])

.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {
  $scope.submit = function(beer) {



    // TODO: Get user location
    /////////////////////////////////////////
    // Fake need to get userCoords from FE
    /////////////////////////////////////////

    var dev = {'beer': beer, 'mock': true, 'location': [41.930136, -87.696007]},
    prod    = {'beer': beer, 'mock': false};

    $http.post('/api/v1/beers/', dev)
    .success(function(data) {
      if (data) {
        /////////////////////////////////////////
        // Needs to be completely redone to support
        // Untappd instead of brewerydb
        /////////////////////////////////////////

        // console.log('Data recieved: ', data);
        // $scope.name = data.breweryDB.name;
        // $scope.description = data.breweryDB.description;

        // // Handle for different types of responses that don't
        // // always have labels images
        // if (data.breweryDB.type === 'beer') {
        //   $scope.label = data.breweryDB.labels.medium;
        // } else if (data.breweryDB.type === 'brewery') {
        //   console.log('you got a brewery company back, not a beer.');
        // } else {
        //   console.log('you got some other shit. check the "type" on the object.');
        // }

      } else {
        console.log('No data received!');
      }
    })
    .error(function(data) {
      console.log('Something fucked!');
    });
  }
}]);

angular.module('app', ['ngAnimate', 'cgBusy']);

angular.module('app').controller('DemoCtrl', function($scope, $q, $timeout, cgBusyTrackers) {

    $scope.delay1 = $scope.delay2 = 2000;

    $scope.demoBusy = function(trackerName, delay) {

        //For the demo we're using a simple promise not $http since thats easier to control
        var testPromise = $q.defer();
        cgBusyTrackers.getPromiseTracker(trackerName).addPromise(testPromise.promise);
        $timeout(function() {
            testPromise.resolve();
        }, delay);
    };
});
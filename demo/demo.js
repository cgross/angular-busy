angular.module('app', ['ngAnimate','ajoslin.promise-tracker','cgBusy']);

angular.module('app').controller('DemoCtrl',function($scope,promiseTracker,$q,$timeout){

	$scope.delay1 = $scope.delay2 = 2000;

	$scope.demoBusy = function(trackerName,delay){

		//For the demo we're using a simple promise not $http since thats easier to control
		var testPromise = $q.defer();
		promiseTracker(trackerName).addPromise(testPromise.promise);
		$timeout(function(){
			testPromise.resolve();
		},delay);

	};

});
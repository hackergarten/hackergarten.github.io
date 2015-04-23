angular.module('eventlist',[]);


function eventlistController($scope, $http) {
	$scope.futureEventlist = [];
	$scope.nextEventlist = [];
	$scope.pastEventlist = [];

	$http.get('events.json').then(extractFutureAndPastEvents);

	function extractFutureAndPastEvents(response) {
		var eventList = response.data;
		eventList.sort(function(a, b) {
			return new Date(a.date) < new Date(b.date);
		});
		var today = new Date();
		today = new Date(today.setHours(0,0,0));

		$scope.futureEventlist = eventList.filter(function(a) {
			return new Date(a.date) >= today;
		});

		$scope.pastEventlist = eventList.filter(function(a) {
			return new Date(a.date) < today;
		});

		if ($scope.futureEventlist.length > 0) {
			$scope.nextEventlist = [$scope.futureEventlist.pop()];
		}

		$scope.futureEventlist.reverse();

	}
}

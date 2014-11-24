angular.module('eventlist',[]);
	
	
function eventlistController($scope, $http) {
	$scope.futureEventlist = [];
	$scope.nextEventlist = [];
	$scope.pastEventlist = [];
	
	$http.get('events.json').then(
	function (response) {
		var eventlist = response.data;
		eventlist.sort(function(a, b) {
			return new Date(a.date) < new Date(b.date);
		});
		var today = new Date();
		today = new Date(today.setHours(0,0,0));
		
		$scope.futureEventlist = eventlist.filter(function(a) {
			return new Date(a.date) >= today;
		});
		
		$scope.pastEventlist = eventlist.filter(function(a) {
			return new Date(a.date) < today;
		});

		
		if ($scope.futureEventlist.length > 0) {
			$scope.nextEventlist = [$scope.futureEventlist.pop()];
		}
		

		
	});
};
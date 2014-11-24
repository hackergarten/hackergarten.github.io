angular.module('eventlist',[]);
	
	
function eventlistController($scope, $http) {
	$scope.eventlist = [];
	
	$http.get('events.json').then(
	function (response) {
		$scope.eventlist = response.data;
		$scope.eventlist.sort(function(a, b) {
			return new Date(a.date) > new Date(b.date);
		});
		
	});
};
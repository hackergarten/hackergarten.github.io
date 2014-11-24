angular.module('eventlist',[]);
	
	
function eventlistController($scope, $http) {
	$scope.eventlist = [];
	
	$http.get('events.json').then(
	function (response) {
		$scope.eventlist = response.data;
	});
};
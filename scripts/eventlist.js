angular.module('eventlist',[]);
	
	
function eventlistController($scope, $http) {
	$http.get('events.json').then(
	function (response) {
		console.log(response);
	});
};
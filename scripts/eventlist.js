'use strict';

var app = angular
    .module('hackergartenPage')
    .controller('eventlistController', eventListController)
    .service('eventService', eventService);

app.config(['$compileProvider', function ($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
}]);

app.filter('html', ['$sce', function ($sce) { 
    return function (text) {
        return $sce.trustAsHtml(text);
    };    
}]);

function hashCode(str) {
    var hash = 0;
    if (str.length == 0) return hash;
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

function eventListController($scope, ngDialog, eventService) {
    $scope.futureEventlist = [];
    $scope.nextEventlist = [];
    $scope.pastEventlist = [];
	$scope.pastEventlistLength = 0;
	$scope.allEventlistLength = 0;
	$scope.totalPEventDisplayed = 10;

    eventService
        .queryEvents()
        .then(extractFutureAndPastEvents);

    function extractFutureAndPastEvents() {
        $scope.futureEventlist = eventService.filterFutureEvents();
        $scope.pastEventlist = eventService.filterPastEvents();

        if ($scope.futureEventlist.length > 0) {
            $scope.nextEventlist = [$scope.futureEventlist.pop()];
        }
		$scope.pastEventlistLength = $scope.pastEventlist.length;
		$scope.allEventlistLength = $scope.pastEventlistLength + $scope.futureEventlist.length;
        $scope.futureEventlist.reverse();
    }

    $scope.openModal = function (hgEvent) {
        ngDialog.open({
            data: hgEvent,
            plain: false,
            showClose: true,
            closeByDocument: true,
            closeByEscape: true,
            template: 'event-achievements',
            className: 'ngdialog-theme-default'
        });
    };
	
	$scope.loadMore = function() {
        $scope.totalPEventDisplayed+= 10;
    }
};

function eventService($http) {
    var sortEventsByDate = function (a, b) {
        var isLess = new Date(a.date) < new Date(b.date);
        return (isLess ? 1 : -1);
    };

    var generateHashCode = function(event) {
        event.hashCode = hashCode(event.date + event.location);
        return event;
    };

    var generateTitle = function(event) {
        if (event.title && event.location) { // old JSON format without venue and address
            event.title = "on " + event.date + " at " + event.title + " in " + event.location;
        } else { // new JSON format with venue and address
            event.title = "on " + event.date + " at " + event.venue + ", " + event.address;
        }
        return event;
    };

    var generateMapLink = function(event) {
        if (event.address) {
            if (!event.links) {
                event.links = [];
            }
            event.links.push(
                {
                    "title": "Show location on map",
                    "url": "https://www.openstreetmap.org/search?query=" + encodeURI(event.address)
                }
            );
        }
        return event;
    };

    var eventList = [];
    var today = new Date();
    today = new Date(today.setHours(0, 0, 0));

    return {
        queryEvents: function () {
            return $http.get('events.json').then(function (response) {
                eventList = response.data;
                eventList.sort(sortEventsByDate);
                eventList.map(generateHashCode);
                eventList.map(generateTitle);
                eventList.map(generateMapLink);
                return eventList;
            });
        },
        filterFutureEvents: function () {
            return eventList.filter(function (a) {
                return new Date(a.date) >= today;
            })
        },
        filterPastEvents: function () {
            return eventList.filter(function (a) {
                return new Date(a.date) < today;
            });
        }
    };
};


'use strict';

var app = angular
    .module('hackergartenPage')
    .controller('eventlistController', eventListController)
    .service('eventService', eventService);


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
	$scope.totalPEventDisplayed = 15;

    eventService
        .queryEvents()
        .then(extractFutureAndPastEvents);

    function extractFutureAndPastEvents() {
        $scope.futureEventlist = eventService.filterFutureEvents();
        $scope.pastEventlist = eventService.filterPastEvents();

        if ($scope.futureEventlist.length > 0) {
            $scope.nextEventlist = [$scope.futureEventlist.pop()];
        }

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
	
	$scope.showMore = function() {
        $scope.totalPEventDisplayed+= 10;
    }
};

function eventService($http) {
    var eventList = [];
    var today = new Date();
    today = new Date(today.setHours(0, 0, 0));

    return {
        queryEvents: function () {
            return $http.get('events.json').then(function (response) {
                eventList = response.data;
                eventList.sort(function (a, b) {
                    var isLess = new Date(a.date) < new Date(b.date);
                    return (isLess ? 1 : -1);
                });
                eventList.map(function(event){
                    event.hashCode = hashCode(event.date + event.location);
                });
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


'use strict';

angular
    .module('eventlist', [])
    .controller('eventlistController', eventListController)
    .service('eventService', eventService);


function eventListController($scope, eventService) {
    $scope.futureEventlist = [];
    $scope.nextEventlist = [];
    $scope.pastEventlist = [];

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
}

function eventService($http) {
    var eventList = [];
    var today = new Date();
    today = new Date(today.setHours(0, 0, 0));

    return {
        queryEvents: function () {
            return $http.get('events.json').then(function (response) {
                eventList = response.data;
                eventList.sort(function (a, b) {
                    return new Date(a.date) < new Date(b.date);
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
}

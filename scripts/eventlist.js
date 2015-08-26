'use strict';

var app = angular
    .module('eventlist', ['ngDialog'])
    .directive('randomHeaderImage', function () {
      return function (scope, element, attrs) {        
        var image = "pictures/header." + Math.floor((Math.random()*4)+1) + ".png"

        element.css({
            'background': 'url("' + image + '") center center no-repeat'
        });
      };
    })
    .controller('eventlistController', eventListController)
    .service('eventService', eventService);

/*
app.controller('DialogCtrl', function ($scope, ngDialog) {
    $scope.dialogModel = {
        message : 'message from passed scope'
    };
    $scope.openSecond = function () {
        ngDialog.open({
            template: '<h3><a href="" ng-click="closeSecond()">Close all by click here!</a></h3>',
            plain: true,
            closeByEscape: false,
            controller: 'SecondModalCtrl'
        });
    };
});
*/

function eventListController($scope, ngDialog, eventService) {
    $scope.futureEventlist = [];
    $scope.nextEventlist = [];
    $scope.pastEventlist = [];

    eventService
        .queryEvents()
        .then(extractFutureAndPastEvents);

    function extractFutureAndPastEvents() {
        $scope.futureEventlist = eventService.filterFutureEvents();

        console.log($scope.futureEventlist);

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
                    var isLess = new Date(a.date) < new Date(b.date);
                    return (isLess ? 1 : -1);
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

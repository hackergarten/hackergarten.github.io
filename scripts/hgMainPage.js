'use strict';

angular
    .module('hackergartenPage', [])
    .controller('hgMainPageController', hgMainPageController);


function hgMainPageController($scope, eventService) {
    $scope.getRndBackground = function(){
        return "header." + Math.floor((Math.random()*4)+1) + ".png"
    };
}
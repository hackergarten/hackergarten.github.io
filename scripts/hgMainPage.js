'use strict';

angular.module('hackergartenPage', ['ngDialog']);

angular.module('hackergartenPage')
    .directive('randomHeaderImage', function () {
        return function (_scope, element, _attrs) {
            var image = `pictures/header.${Math.floor((Math.random() * 4) + 1)}.jpg`;

            element.css({
                'background': `url("${image}") center center no-repeat`
            });
        };
    });

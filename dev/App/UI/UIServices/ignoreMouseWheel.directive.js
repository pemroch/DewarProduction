(function() {
  
    'use strict';
    
    angular.module('ignoremousewheel.directive', [])
    .directive('ignoremousewheel', ignoremousewheel); 
    
    ignoremousewheel.$inject = [];
    
    function ignoremousewheel ($timeout) {
        return {
            restrict: 'A',
            link: function( scope, element, attrs ){
                element.bind('mousewheel', function ( event ) {
                    element.blur();
                } );
            }
        }
    };
  
})();

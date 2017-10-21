( function() {
  
    'use strict';

    angular.module( 'checkExist.service', [] )
    .factory( 'CheckExistService', CheckExistService ) 

    CheckExistService.$inject = [ 
        '$firebaseArray',
        '$q', 
        '$rootScope'
    ];

    function CheckExistService( $firebaseArray, $q, $rootScope ) {

        return checkExistService;

        function checkExistService( arr, objVal, val  ) {
            var deferred = $q.defer();
            var arrLength = arr.length;
            for ( var i = 0; i < arrLength; i++ ) {
                if ( arr[ i ][ objVal ] === val ) {
                    deferred.resolve( 'exist' );
                }
            }
            deferred.resolve( 'notExist' );
            return deferred.promise;
        }
        }
  
})()
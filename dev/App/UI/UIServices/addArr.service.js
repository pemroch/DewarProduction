( function() {
  
    'use strict';

    angular.module( 'addArr.service', [] )
    .factory( 'AddArrService', AddArrService ) 

    AddArrService.$inject = [ 
        '$firebaseArray',
        '$q', 
        '$rootScope'
    ];

    function AddArrService( $firebaseArray, $q, $rootScope ) {

        return addArr;

        function addArr( dbLocation, item ){ 
            var deferred = $q.defer();
            var fire = $rootScope.firebaseRef
            var ref = fire.child( dbLocation );
            var refArr = $firebaseArray( ref );
            refArr.$add( item )
            .then( function( itemAdded ) {
                deferred.resolve( itemAdded );
            })
            return deferred.promise;
        }
        
    }
  
})();
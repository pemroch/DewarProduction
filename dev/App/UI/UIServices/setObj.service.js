( function() {
  
    'use strict';

    angular.module( 'setObj.service', [] )
    .factory( 'SetObjService', SetObjService ) 

    SetObjService.$inject = [
        '$rootScope'
    ];

    function SetObjService( $rootScope ) {
        return setObjService;
        function setObjService( dbLocation, item ){ 
            var fire = $rootScope.firebaseRef
            var ref = fire.child( dbLocation );
            ref.set( item )
        }    
    }
  
})();
( function() {
  
    'use strict';

    angular.module( 'login.service', [] )
    .factory( 'LoginService', LoginService ) 

    LoginService.$inject = [ 
        '$q',
        '$rootScope'
    ];

    function LoginService( $q, $rootScope ) {

        return loginService;
        
        function loginService( email, password ) {
        var deferred = $q.defer();
        $rootScope.firebaseAuth.$signInWithEmailAndPassword(email, password)
        .then(function ( firebaseUser ) {
            deferred.resolve({ success: true, user: firebaseUser });
        })
        .catch(function (error) {
            deferred.resolve({ error: error });
        });
            return deferred.promise;
        }

    }
  
})();
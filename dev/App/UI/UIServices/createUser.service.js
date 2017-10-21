(function() {
  
    'use strict';

    angular.module('createUser.service', [])
    .factory('CreateUserService', CreateUserService) 

    CreateUserService.$inject = [ 
        '$firebaseAuth', 
        '$q'
    ];

    function CreateUserService ($firebaseAuth, $q) {
        return createUserService;
        function createUserService (email, password){
            var deferred = $q.defer();
            $firebaseAuth().$createUserWithEmailAndPassword(email, password)
            .then(function (firebaseUser) {
                deferred.resolve({ success: true, uid: firebaseUser.uid })
            })
            .catch(function (error) {
                deferred.resolve({ error: error.message })
            });
            return deferred.promise;
        }
        
    }
  
})();
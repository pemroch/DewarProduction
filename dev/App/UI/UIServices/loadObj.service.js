(function() {
  
    'use strict';

    angular.module('loadObj.service', [])
    .factory('LoadObjService', LoadObjService) 

    LoadObjService.$inject = [ 
        '$firebaseObject',
        '$q'
    ];

    function LoadObjService($firebaseObject, $q) {
        return loadObjService;
        function loadObjService(dbLocation) {
            var deferred = $q.defer();
            var ref = firebase.database().ref(dbLocation);
            var refObj = $firebaseObject(ref);
            refObj.$loaded()
            .then(function (result) {
                deferred.resolve({ success: true, data: result});
            })
            .catch(function (error) {
                deferred.resolve({ error: error});
            });        
            return deferred.promise;
        }

    }
  
})();
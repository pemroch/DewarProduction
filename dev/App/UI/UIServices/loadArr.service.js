(function() {
  
    'use strict';

    angular.module('loadArr.service', [])
    .factory('LoadArrService', LoadArrService) 
    
    LoadArrService.$inject = [ 
        '$firebaseArray',
        '$q'
    ];

    function LoadArrService($firebaseArray, $q) {
        return loadArrService;
        function loadArrService(dbLocation) {
            var deferred = $q.defer();
            var ref = firebase.database().ref(dbLocation);
            var refArr = $firebaseArray(ref);
            refArr.$loaded()
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
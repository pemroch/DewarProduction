(function() {
  
    'use strict';

    angular.module('updateObj.service', [])
    .factory('UpdateObjService', UpdateObjService) 

    UpdateObjService.$inject = [ 
        '$q'
    ];

    function UpdateObjService($q) {
        return updateObjService;
        function updateObjService(dbLocation, item){ 
            var deferred = $q.defer();
            var ref = firebase.database().ref(dbLocation);
            ref.update(item, function(error) {
                if (error) {
                    console.log('Synchronization failed');
                } else {
                    deferred.resolve(item);
                }
            });
            return deferred.promise;
        }
        
    }
  
})();
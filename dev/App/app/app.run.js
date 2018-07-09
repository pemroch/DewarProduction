(function() {
    
    'use strict';

    angular.module('app.run', [])
    .run( RunBlock )

    RunBlock.$inject = [
        '$firebaseAuth',
        '$rootScope',
        '$state'
    ];

    function RunBlock ($firebaseAuth, $rootScope, $state) {
        $rootScope.user = null;
        
        // Production
        // var config = {};

        // Test
        // var config = {};
                
        firebase.initializeApp(config);
        $rootScope.firebaseRef = firebase.database().ref();
        $rootScope.firebaseAuth = $firebaseAuth();
        $rootScope.user = null;
        $rootScope.firebaseAuth.$onAuthStateChanged(function (firebaseUser) {
            if (!firebaseUser) {
                $state.go( 'login' );
            } else {
                $rootScope.user = firebaseUser;
            }
        });
    }
  
})();

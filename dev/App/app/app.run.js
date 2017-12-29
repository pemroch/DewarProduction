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
        var config = {
            apiKey: "AIzaSyAX2zEXg9saN-K_TljMUz-CEgroNOnz_9w",
            authDomain: "dewarproductivity.firebaseapp.com",
            databaseURL: "https://dewarproductivity.firebaseio.com",
            storageBucket: "dewarproductivity.appspot.com",
            messagingSenderId: "883218484830"
        };

        // Test
        // var config = {
        //     apiKey: "AIzaSyDHWwuMQYM75tk3NIlrLr9WpMTZkuw5nmk",
        //     authDomain: "dewarproductivitytest.firebaseapp.com",
        //     databaseURL: "https://dewarproductivitytest.firebaseio.com",
        //     storageBucket: "dewarproductivitytest.appspot.com",
        //     messagingSenderId: "1009619404844"
        // };
                
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
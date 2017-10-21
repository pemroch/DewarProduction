(function() {
  
    'use strict';
    
    angular.module('app.config', [])
    .config(Config)
    
    Config.$inject = [ 
        '$stateProvider', 
        '$urlRouterProvider' 
    ];
    
    function Config($stateProvider, $urlRouterProvider) {

        $stateProvider
        
        // Login UI
        .state('login', {
            url: '/login',
            templateUrl: 'App/UI/Login/login.html',
            controller: 'LoginCtrl as login'      
        })    

        // Home UI
        .state('home', {
            url: '/home',
            templateUrl: 'App/UI/Home/home.html',
            controller: 'HomeCtrl as home',
            resolve: {
                'reqAuth': [ "$rootScope", function( $rootScope ) {
                    return $rootScope.firebaseAuth.$requireSignIn();
                }]
            }
        })
        
        // Reminders UI
        .state('home.reminders', {
            url: '/reminders',
            views: {
                homeContent: {
                    templateUrl: 'App/UI/Reminders/reminders.html',
                    controller: 'RemindersCtrl as reminders',
                }
            }
        })

        // Users UI
        .state('home.users', {
            url: '/users',
            views: {
                homeContent: {
                    templateUrl: 'App/UI/Settings/users.html',
                    controller: 'UsersCtrl as users',
                }
            }
        })

        // Productivy Item UI
        .state('home.productivityItem', {
            url: '/productivityItem/:itemName/:itemKey',
            views: {
                homeContent: {
                    templateUrl: 'App/UI/ProductivityItem/productivityItem.html',
                    controller: 'ProductivityItemCtrl as productivityItem',
                }
            }
        })
        
        // Productivity Item Settings UI
        .state('home.productivityItemSettings', {
            url: '/productivityItemSettings/:itemName/:itemKey',
            views: {
                homeContent: {
                    templateUrl: 'App/UI/ProductivityItem/productivityItemSettings.html',
                    controller: 'ProductivityItemSettingsCtrl as productivityItemSettings',
                }
            }
        })
        
        // Archive UI
        .state('home.archive', {
            url: '/archive',
            views: {
                homeContent: {
                    templateUrl: 'App/UI/Archive/archive.html',
                    controller: 'ArchiveCtrl as archive',
                }
            }
        })
        
        $urlRouterProvider.otherwise('/login');
        
    }
  
})();
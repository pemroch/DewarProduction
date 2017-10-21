(function() {
    
    'use strict';

    angular.module('login.controller', [])
    .controller('LoginCtrl', LoginCtrl);

    LoginCtrl.$inject = [
        '$firebaseAuth',
        '$mdDialog',
        '$rootScope',
        '$state',
        '$timeout',
        'LoginService'
    ];

    function LoginCtrl ($firebaseAuth, $mdDialog, $rootScope, $state, $timeout, LoginService) {
        
        var vm = this;
        
        vm.form;
        vm.email = '';
        vm.password = '';
        vm.error = '';
        vm.loading = false;
        vm.emailSuccess = false;
        vm.disableSubmit = false;
        vm.login = login;
        vm.resetPassword = resetPassword;
        
        $firebaseAuth().$signOut();
        
        function login () {    
            vm.disableSubmit = true;
            LoginService(vm.email, vm.password)
            .then(function(result) {
                if (result.success) {
                    $state.go('home.reminders')
                } else {
                    vm.error = result.error.message
                    vm.disableSubmit = false;
                }
            });            
        }    

        function resetPassword ($event) {
            vm.error = '';
            $mdDialog.show(
                $mdDialog.prompt()
                .title('Enter Email')
                .placeholder('Email')
                .ariaLabel('Email')
                .targetEvent($event)
                .ok('Submit')
                .cancel('Cancel')
            )
            .then(function(result) {
                $rootScope.firebaseAuth.$sendPasswordResetEmail(result)
                .then(function() {
                    vm.emailSuccess = true;
                    $timeout(function() {
                        vm.emailSuccess = false;
                    }, 3000);
                }).catch(function(error) {
                    vm.error = error.message;
                });
            }, function() {});
        }

    }

})();
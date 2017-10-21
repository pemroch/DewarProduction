(function() {
  
    'use strict';

    angular.module('users.controller', [])
    .controller('UsersCtrl', UsersCtrl);

    UsersCtrl.$inject = [
        '$mdDialog',
        '$mdSidenav',
        '$mdToast',
        '$rootScope',
        '$timeout',
        'LoadArrService',
        'LoadObjService',
        'SetObjService',
        'UpdateObjService'
    ];

    function UsersCtrl ($mdDialog, $mdSidenav, $mdToast, $rootScope, $timeout, LoadArrService, LoadObjService, SetObjService, UpdateObjService) {
        
        var vm = this;
        vm.users = [];
        vm.loading = true;
        vm.addUser = addUser;
        vm.editUser = editUser;
        vm.deleteUser = deleteUser;
        vm.toggleMenu = toggleMenu;
        vm.changePassword = changePassword;

        $mdSidenav('left').close();
        
        $timeout(function() {
            loadUsers();
        });

        function loadUsers () {
            LoadArrService('userNames')
            .then( function(userNames) {
                vm.users = userNames.data;
                vm.loading = false;
            });
        }

        function editUser ($event, userName) {
            LoadObjService('users/' + userName.uid)
            .then(function(user) {            
                $mdDialog.show({
                    controller: 'EditUserCtrl',
                    templateUrl: 'App/UI/Settings/editUser.html',
                    parent: angular.element(document.body),
                    targetEvent: $event,
                    clickOutsideToClose: true,
                    controllerAs: 'editUser',
                    locals: { user: user.data, users: vm.users }
                });
            });
        }

        function deleteUser ($event, userName) {
            $mdDialog.show(
                $mdDialog.confirm()
                .title('Would you like to remove user?')
                .textContent(capFirstLetter(userName.userName) + ' will be permanently deleted.')
                .targetEvent($event)
                .ok('Confirm')
                .cancel('Cancel')
                .clickOutsideToClose('true')
            )
            .then( function() {
                SetObjService('users/' + userName.uid, null);
                SetObjService('userNames/' + userName.uid, null);
                $mdDialog.hide();
            });
        }
        
        function addUser ($event) {
            $mdDialog.show({
                controller: 'AddUserCtrl',
                templateUrl: 'App/UI/Settings/addUser.html',
                parent: angular.element( document.body ),
                targetEvent: $event,
                clickOutsideToClose: true,
                controllerAs: 'addUser',
                locals: { users: vm.users }
            });
        }

        function changePassword ($event) {
            $mdDialog.show(
                $mdDialog.prompt()
                .title('Enter New Password')
                .placeholder('Password')
                .ariaLabel('Password')
                .targetEvent($event)
                .ok('Submit')
                .cancel('Cancel')
            )
            .then(function(result) {
                $rootScope.firebaseAuth.$updatePassword(result)
                .then(function() {
                    $mdToast.show({
                        template: '<md-toast><span flex>Password Updated!</span></md-toast>',
                        hideDelay: 2000,
                        position: 'bottom right'
                    });                         
                })
                .catch(function(error) {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title('Error')
                        .textContent(error.message)
                        .ariaLabel('Error')
                        .ok('Ok')
                    );                                     
                });            
            });            
        }

        function capFirstLetter( str ) {
            var pieces = str.split( ' ' );
            for ( var i = 0; i < pieces.length; i++ ) {
                var j = pieces[i].charAt(0).toUpperCase();
                pieces[i] = j + pieces[i].substr(1);
            }
            return pieces.join( ' ' );
        }        
        
        function toggleMenu () {
            $mdSidenav('left').toggle();
        }

    }
  
})();
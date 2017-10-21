( function() {
  
    'use strict';

    angular.module('addUser.controller', [])
    .controller('AddUserCtrl', AddUserCtrl)

    AddUserCtrl.$inject = [ 
        '$mdDialog',
        '$state',
        'users',
        'CheckExistService',
        'CreateUserService',
        'SetObjService',
        'UpdateObjService'
    ];

    function AddUserCtrl ($mdDialog, $state, users, CheckExistService, CreateUserService, SetObjService, UpdateObjService) {

        var vm = this;
        
        vm.form;
        vm.fName = '';
        vm.mName = '';
        vm.lName = '';
        vm.email = '';
        vm.password = '';
        vm.error = '';
        vm.isAdmin = false;
        vm.disableSubmit = false;
        vm.checkExist = checkExist;
        vm.hide = hide;
        
        function checkExist () {
            vm.disableSubmit = true;
            var name = vm.fName.toLowerCase() + ' ' + (vm.mName ? vm.mName.toLowerCase() : '') + ' ' + vm.lName.toLowerCase();
            CheckExistService(users, 'userName', name)
            .then(function(result) {
                if (result === 'notExist') {
                    createUser(name);
                } else {
                    vm.error = 'User already exist please try again.'
                    vm.disableSubmit = false;
                }
            });
        }
        
        function createUser (name) {      
            CreateUserService(vm.email, vm.password)
            .then(function(result) {
                if (result.success) {
                    addUserToDatabase(result.uid, name);
                } else {
                    vm.error = result.error
                    vm.disableSubmit = false;
                }
            });
        }
        
        function addUserToDatabase (uid, name) {
            var user = {};
            user[uid] = {
                isAdmin: vm.isAdmin,
                fName: vm.fName,
                mName: vm.mName || null,
                lName: vm.lName,
                uid: uid
            }
            UpdateObjService('users', user)
            .then(function() {
                addUserName(uid, name)
            })
        }
        
        function addUserName (uid, name) {
            var userName = {}
            userName[uid] = {
                userName: name,
                uid: uid
            }
            UpdateObjService('userNames', userName)
            .then(function() {
                hide();
                $state.go('login');
            })
        }
        
        function hide() {      
            $mdDialog.hide();
        }
        
    }
  
})();
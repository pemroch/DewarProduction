( function() {
  
    'use strict';

    angular.module('editUser.controller', [])
    .controller('EditUserCtrl', EditUserCtrl)

    EditUserCtrl.$inject = [ 
        '$mdDialog',
        'user',
        'users',
        'CheckExistService',
        'SetObjService',
        'UpdateObjService'
    ];

    function EditUserCtrl ($mdDialog, user, users, CheckExistService, SetObjService, UpdateObjService) {

        var vm = this;
        var prevName = user.fName + ' ' + (user.mName ? user.mName : '') + ' ' + user.lName;

        vm.form;
        vm.fName = user.fName;
        vm.mName = user.mName || '';
        vm.lName = user.lName;
        vm.email = '';
        vm.password = '';
        vm.error = '';
        vm.isAdmin = user.isAdmin;
        vm.disableSubmit = false;
        vm.checkExist = checkExist;
        vm.hide = hide;
        
        function checkExist () {
            vm.disableSubmit = true;
            var name = vm.fName.toLowerCase() + ' ' + (vm.mName ? vm.mName.toLowerCase() : '') + ' ' + vm.lName.toLowerCase();
            CheckExistService(users, 'userName', name)
            .then(function(result) {
                if (result === 'exist' && prevName !== name) {
                    vm.error = 'User already exist please try again.'
                    vm.disableSubmit = false;
                } else {
                    editUser(name);
                }
            });
        }
        
        function editUser (name) {
            var edit = {
                isAdmin: vm.isAdmin,
                fName: vm.fName,
                mName: vm.mName || null,
                lName: vm.lName,
                uid: user.uid
            }
            UpdateObjService('users/' + user.uid, edit)
            .then(function() {
                editUserName(name)
            });
        }
        
        function editUserName (name) {
            SetObjService('userNames/' + user.uid + '/userName', name)
            hide();
        }
        
        function hide() {      
            $mdDialog.hide();
        }
        
    }
  
})();
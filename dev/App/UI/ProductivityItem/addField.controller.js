( function() {
  
    'use strict';

    angular.module('addField.controller', [])
    .controller('AddFieldCtrl', AddFieldCtrl)

    AddFieldCtrl.$inject = [ 
        '$mdDialog',
        '$rootScope',
        'fields',
        'itemKey',
        'itemName',
        'orders',
        'AddArrService',
        'CheckExistService',
        'LoadObjService',
        'SetObjService'
    ];

    function AddFieldCtrl ($mdDialog, $rootScope, fields, itemKey, itemName, orders, AddArrService, CheckExistService, LoadObjService, SetObjService) {

        var vm = this;
        vm.form;
        vm.error = '';
        vm.newField = '';
        vm.shipDateDifference = '';
        vm.saving = false;
        vm.disableSubmit = false;
        vm.category = 'text';
        vm.checkExist = checkExist;
        vm.hide = hide;

        function checkExist () {
            vm.saving = true;
            vm.disableSubmit = true;
            var newField = vm.newField.toLowerCase();
            CheckExistService(fields, 'fieldName', newField)
            .then(function(result) {
                if (result === 'notExist' && (newField !== 'ship date' && newField !== 'shipdate')) {
                    addField(newField);
                } else {
                    vm.error = 'Field already exist please try again.'
                    vm.saving = false;
                    vm.disableSubmit = false;
                }
            });
        }
        
        function addField (newField) {
            var saveField = {
                category: vm.category,
                fieldName: newField,
                days: vm.category === 'reminder' ? vm.shipDateDifference : null
            }
            AddArrService('fields/' + itemKey, saveField)
            .then(function(field) {
                LoadObjService('userNames/' + firebase.auth().currentUser.uid)
                .then(function(user) {
                    angular.forEach(orders, function(value, key) {
                        if (saveField.days && value.shipDate) {
                            var fieldsObj = {};
                            angular.forEach(value, function(val, k) {
                                if (val.category === 'text') {
                                    fieldsObj[k] = val;
                                }
                            });
                            var date = new Date(value.shipDate);
                            date.setDate(date.getDate() - saveField.days);
                            var saveDate = new Date(date);
                            saveField.value = saveDate.getTime();
                            var ref = $rootScope.firebaseRef;
                            var reminder = {
                                action: newField,
                                date: saveField.value,
                                fields: fieldsObj,
                                itemKey: itemKey,
                                itemName: itemName,
                                orderKey: key,
                                fieldKey: field.key,
                            } 
                            if (!value.complete) {
                                var refChild = ref.child('reminders');
                                var refChildPush = refChild.push(reminder);
                                saveField.reminderKey = refChildPush.key;
                            }
                        } else {
                            saveField.value = null;
                            saveField.reminderKey = null;
                        }
                        SetObjService('itemProductivity/' + itemKey + '/' + key + '/' + field.key, saveField);
                    });
                });
                hide();
            });
        }
        
        function hide () {
            $mdDialog.hide();
        }
        
    }
  
})();
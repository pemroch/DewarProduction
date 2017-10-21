( function() {
  
    'use strict';

    angular.module('editField.controller', [])
    .controller('EditFieldCtrl', EditFieldCtrl)

    EditFieldCtrl.$inject = [ 
        '$mdDialog',
        '$rootScope',
        'fields', 
        'fieldKey',
        'field',
        'itemKey',
        'orders',
        'CheckExistService',
        'LoadObjService',
        'SetObjService',
        'UpdateObjService'
    ];

    function EditFieldCtrl ($mdDialog, $rootScope, fields,  fieldKey, field, itemKey, orders, CheckExistService, LoadObjService, SetObjService, UpdateObjService) {

        var vm = this;
        var prevFieldName = field.fieldName;
        vm.form;
        vm.error = '';
        vm.days = field.days || '';
        vm.saving = false;
        vm.disableSubmit = false;
        vm.fieldName = field.fieldName;
        vm.category = field.category;
        vm.hide = hide;
        vm.checkExist = checkExist;

        function checkExist () {
            vm.saving = true;
            vm.disableSubmit = true;
            var fieldName = vm.fieldName.toLowerCase();
            CheckExistService(fields, 'fieldName', fieldName)
            .then(function(result) {
                if ((fieldName !== 'ship date' && fieldName !== 'shipdate') && (result === 'notExist' || (result === 'exist' && (fieldName === prevFieldName)))) {
                    editField(fieldName);
                } else {
                    vm.error = 'Field already exist please try again.'
                    vm.saving = false;
                    vm.disableSubmit = false;
                }
            });            
        }

        function editField (fieldName) {
            var saveField = {
                fieldName: fieldName,
                days: vm.category === 'reminder' ? vm.days : null
            }
            var ref = $rootScope.firebaseRef
            var fildsRef = ref.child('fields/' + itemKey + '/' + fieldKey);
            fildsRef.update(saveField);
            LoadObjService('userNames/' + firebase.auth().currentUser.uid)
            .then(function(user) {            
                angular.forEach(orders, function(value, key) {
                    var itemProductivityRef = ref.child('itemProductivity/' + itemKey + '/' + key + '/' + fieldKey);
                    itemProductivityRef.update(saveField);
                    if (value.shipDate && !value.complete) {
                        if (vm.category === 'text') {
                            SetObjService('reminders/' + value.shipDateReminderKey + '/fields/' + fieldKey + '/fieldName', fieldName);
                            var shipDateObj = {
                                reviewedBy: null,
                                reviewComment: null,
                                status: null
                            }
                            var shipDateRef = ref.child('reminders/' + value.shipDateReminderKey);
                            shipDateRef.update(shipDateObj);
                            angular.forEach(value, function(val, k ) {
                                if (val.category === 'reminder' && !val.complete) {
                                    SetObjService('reminders/' + val.reminderKey + '/fields/' + fieldKey + '/fieldName', fieldName);
                                    var dateRefObj = {
                                        reviewedBy: null,
                                        reviewComment: null,
                                        status: null
                                    }
                                    var dateRef = ref.child('reminders/' + val.reminderKey);
                                    dateRef.update(dateRefObj);
                                }
                            });
                        }   
                        if (vm.category === 'reminder') {
                            var shipDate = new Date(value.shipDate);
                            shipDate.setDate(shipDate.getDate() - saveField.days);
                            var newDate =  new Date(shipDate);
                            var newTime =  newDate.getTime();
                            SetObjService('itemProductivity/' + itemKey + '/' + key + '/' + fieldKey + '/value', newTime);
                            var reminderRefObj = {
                                date: newTime,
                                action: fieldName,
                                reviewedBy: null,
                                reviewComment: null,
                                status: null
                            }
                            var reminderRefChild = ref.child('reminders/' + value[fieldKey].reminderKey);
                            reminderRefChild.update(reminderRefObj);
                        }   
                    }
                });
            });
            hide();
        }        
        
        function hide () {
            $mdDialog.hide();
        }
        
    }
  
})();
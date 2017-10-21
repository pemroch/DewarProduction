( function() {
  
    'use strict';

    angular.module('updateStatus.controller', [])
    .controller('UpdateStatusCtrl', UpdateStatusCtrl)

    UpdateStatusCtrl.$inject = [ 
        '$mdDialog',
        '$rootScope',
        'action',
        'reminder',
        'LoadObjService',
        'LoginService',
        'SetObjService'
    ];

    function UpdateStatusCtrl ($mdDialog, $rootScope, action, reminder, LoadObjService, LoginService, SetObjService) {

        var vm = this;
        vm.form;
        vm.email = '';
        vm.password = '';
        vm.comment = '';
        vm.error = '';
        vm.index = reminder.reminderKey;
        vm.action = (action === 'review') ? 'reviewed' : 'completed'
        vm.disableSubmit = false;
        vm.hide = hide;
        vm.update = update;

        function update () {
            LoadObjService('userNames/' + $rootScope.user.uid)
            .then(function(userName) {
                if (action === 'review') {
                    var update = {
                        status: vm.action,
                        reviewComment: vm.comment || null,
                        reviewedBy: userName.data.userName
                    }
                    var fire = $rootScope.firebaseRef;
                    var fildsRef = fire.child('reminders/' + reminder.reminderKey);
                    fildsRef.update(update);
                }
                if (action === 'complete') {
                    reminder.status = vm.action;
                    reminder.location = vm.location;
                    reminder.completeComment = vm.comment || null;
                    reminder.completedBy = userName.data.userName;
                    reminder.completedOn = firebase.database.ServerValue.TIMESTAMP;
                    reminder.selected = null;
                    SetObjService('archive/' + reminder.reminderKey, reminder);
                    SetObjService('reminders/' + reminder.reminderKey, null);
                    if (reminder.action !== 'ship date') {
                        SetObjService('itemProductivity/' + reminder.itemKey + '/' + reminder.orderKey + '/' + reminder.fieldKey + '/complete', true);
                    }
                    if (reminder.action === 'ship date') {
                        SetObjService('itemProductivity/' + reminder.itemKey + '/' + reminder.orderKey + '/complete', true);
                        LoadObjService('itemProductivity/' + reminder.itemKey)
                        .then(function(orders) {
                            var ppp = null;
                            var cuttingsKey = null;
                            var qtyKey = null;
                            var cuttingsTotal = 0;
                            var qtyTotal = 0;                        
                            angular.forEach(orders.data, function(value, key) {
                                if (!value.complete) {
                                    angular.forEach(value, function(val, k) {
                                        if (val.fieldName === 'cuttings') {
                                            cuttingsKey = k;
                                        }
                                        if (val.fieldName === 'ppp' && val.value) {
                                            ppp = val.value
                                        }
                                        if (val.fieldName === 'qty of pots' && val.value) {
                                            qtyKey = k;
                                            qtyTotal += val.value;
                                            cuttingsTotal += (ppp * val.value);
                                            ppp = null;
                                        }
                                    });
                                    if (cuttingsKey && qtyKey && cuttingsTotal && qtyTotal) {
                                        SetObjService('fields/' + reminder.itemKey + '/' + cuttingsKey + '/total', cuttingsTotal);
                                        SetObjService('fields/' + reminder.itemKey + '/' + qtyKey + '/total', qtyTotal);
                                    }                                
                                }
                            });
                        });                    
                    }
                } 
                hide();
            });
        }

        function hide () {
            $mdDialog.hide();
        }
        
    }
  
})();
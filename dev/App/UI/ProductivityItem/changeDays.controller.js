( function() {
  
    'use strict';

    angular.module('changeDays.controller', [])
    .controller('ChangeDaysCtrl', ChangeDaysCtrl)

    ChangeDaysCtrl.$inject = [ 
        '$mdDialog',
        '$rootScope',
        'itemKey',
        'orderKey',
        'fieldKey',
        'field',
        'shipDate'
    ];

    function ChangeDaysCtrl ($mdDialog, $rootScope, itemKey, orderKey, fieldKey, field, shipDate) {

        var vm = this;

        vm.form;
        vm.days = field.days;
        vm.error = '';
        vm.saving = false;
        vm.disableSubmit = false;
        vm.save = save;
        vm.hide = hide;

        function save () {
            var ref = $rootScope.firebaseRef;
            var fieldsChild = ref.child('fields/' + itemKey + '/' + fieldKey + '/disabled');
            fieldsChild.set(true);
            var itemProductivityChild = ref.child('itemProductivity/' + itemKey + '/' + orderKey + '/' + fieldKey);
            var date = new Date(shipDate);
            date.setDate(date.getDate() - vm.days);
            var saveDate = new Date(date);
            var time = saveDate.getTime();
            var itemProductivityObj = {
                days: vm.days,
                value: time
            }
            itemProductivityChild.update(itemProductivityObj);
            if (!field.complete) {
                var remindersChild = ref.child('reminders/' + field.reminderKey);
                var remindersObj = {
                    date: time
                }
                remindersChild.update(remindersObj);
            }
            hide();
        }

        function hide () {
            $mdDialog.hide();
        }
        
    }
  
})();
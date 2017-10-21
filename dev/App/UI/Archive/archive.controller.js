(function() {
  
    'use strict';

    angular.module('archive.controller', [])
    .controller('ArchiveCtrl', ArchiveCtrl);

    ArchiveCtrl.$inject = [
        '$mdDialog',
        '$mdSidenav',
        '$rootScope',
        '$stateParams',
        '$timeout',
        'AddArrService',
        'LoadArrService',
        'LoadObjService',
        'SetObjService',
    ];

    function ArchiveCtrl ($mdDialog, $mdSidenav, $rootScope, $stateParams, $timeout, AddArrService, LoadArrService, LoadObjService, SetObjService) {
        
        var vm = this;

        vm.form;
        vm.archive = [];
        vm.selected = [];
        vm.startDay = 7;
        vm.endDay = 7;
        vm.loading = true;
        vm.unArchive = unArchive;
        vm.toggleMenu = toggleMenu;
        vm.loadArchive = loadArchive;
        vm.deleteSelected = deleteSelected;
        vm.selectedChanged = selectedChanged;

        $mdSidenav('left').close();

        $timeout(function() {
            loadArchive();
        }, 800);

        function loadArchive () {
            vm.loading = true;
            var startDay = new Date();
            startDay.setDate(startDay.getDate() - vm.startDay);
            startDay = startDay.getTime();
            var endDay = new Date();
            endDay.setDate(endDay.getDate() + vm.endDay);
            endDay = endDay.getTime();
            var ref = $rootScope.firebaseRef;
            var refChild = ref.child('archive')
            refChild.orderByChild("date").endAt(endDay).on("value", function(snapshot) {
                $timeout(function() {
                    vm.archive = [];
                    angular.forEach(snapshot.val(), function(value, key) {
                        if (value.date > startDay) {
                            value.reminderKey = key;
                            vm.archive.push(value)
                        }
                    });
                    vm.loading = false;
                });
            });
        }

        function selectedChanged (reminder) {
            if (reminder.selected) {
                vm.selected.push(reminder);
            } else {
                vm.selected.splice(vm.selected.indexOf(reminder), 1);
            }
        }

        function deleteSelected ($event) {
            $mdDialog.show(
                $mdDialog.confirm()
                .title('Would you like to remove order(s) from archive?')
                .textContent('Order(s) will be permanently deleted.')
                .targetEvent($event)
                .ok('Confirm')
                .cancel('Cancel')
                .clickOutsideToClose('true')
            )
            .then( function() {
                angular.forEach(vm.selected, function(value,key) {
                    SetObjService('archive/' + value.reminderKey, null);
                });
                vm.selected = [];
                $mdDialog.hide();
            });             
        }   

        function unArchive ($event, reminder) {
            LoadObjService('userNames/' + $rootScope.user.uid)
            .then(function(userName) {
                $mdDialog.show(
                    $mdDialog.confirm()
                    .title('Would you like to un-archive this order?')
                    .targetEvent($event)
                    .ok('Confirm')
                    .cancel('Cancel')
                    .clickOutsideToClose('true')
                )
                .then( function() {
                    vm.selected = [];
                    reminder.location = null;
                    reminder.completeComment = null;
                    reminder.completedBy = null;
                    reminder.completedOn = null;
                    reminder.reviewComment = null;
                    reminder.reviewedBy = null;
                    reminder.status = null;
                    reminder.selected = null;
                    SetObjService('reminders/' + reminder.reminderKey, reminder);
                    SetObjService('archive/' + reminder.reminderKey, null);
                    SetObjService('itemProductivity/' + reminder.itemKey + '/' + reminder.orderKey + '/complete', null);
                    if (reminder.fieldKey) {
                        SetObjService('itemProductivity/' + reminder.itemKey + '/' + reminder.orderKey + '/' + reminder.fieldKey + '/complete', null);
                    }
                    if (reminder.action !== 'ship date') {
                        LoadObjService('itemProductivity/' + reminder.itemKey + '/' + reminder.orderKey)
                        .then(function(itemProductivity) {
                            SetObjService('archive/' + itemProductivity.data.shipDateReminderKey, null);
                            var shipDateReminder = reminder;
                            shipDateReminder.action = 'ship date';
                            shipDateReminder.date = itemProductivity.data.shipDate;
                            shipDateReminder.reminderKey = itemProductivity.data.shipDateReminderKey;
                            SetObjService('reminders/' + itemProductivity.data.shipDateReminderKey, shipDateReminder);
                            loadArchive();
                        });
                    } else {
                        loadArchive();
                    }
                });            
            });
        }

        function toggleMenu () {
            $mdSidenav('left').toggle();            
        }  

    }
    
})();
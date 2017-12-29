(function() {
  
    'use strict';

    angular.module('reminders.controller', [])
    .controller('RemindersCtrl', RemindersCtrl);

    RemindersCtrl.$inject = [
        '$mdDialog',
        '$mdSidenav',
        '$rootScope',
        '$scope',
        '$timeout',
        'LoadArrService'
    ];

    function RemindersCtrl ($mdDialog, $mdSidenav, $rootScope, $scope, $timeout, LoadArrService) {
        
        var vm = this;

        vm.form;
        vm.search = '';
        vm.filterSelect = '';
        vm.filterSet = false;
        vm.reminders = [];
        vm.filterKeys = {};
        vm.selected = [];
        vm.loading = true;
        vm.days = 7;
        vm.print = print;
        vm.toggleMenu = toggleMenu;
        vm.loadReminders = loadReminders;
        vm.updateStatus = updateStatus;
        vm.selectedChanged = selectedChanged;
        vm.clearFilter = clearFilter;
        vm.filter = filter;

        $mdSidenav('left').close();

        $timeout(function() {
            loadReminders();
        }, 800);

        function loadReminders () {
            vm.loading = true;
            vm.search = '';
            var date = new Date();
            date.setDate(date.getDate() + vm.days);
            var ref = $rootScope.firebaseRef;
            var refChild = ref.child('reminders')
            refChild.orderByChild("date").endAt(date.getTime()).on("value", function(snapshot) {
                $timeout(function() {
                    vm.reminders = [];
                    angular.forEach(snapshot.val(), function(value, key) {
                        if (!vm.filterSet) {
                            vm.filterKeys[key] = true;
                        }
                        value.reminderKey = key;
                        vm.reminders.push(value)
                    });
                    vm.loading = false;
                });
            });
        }

        
        function filter() {
            vm.loading = true;
            $timeout(function() {
                for (var i = 0; i < vm.reminders.length; i++) {
                    vm.filterKeys[vm.reminders[i].reminderKey] = false;
                    if (vm.filterSelect === 'crop' && vm.reminders[i].itemName) {
                        var itemName = vm.reminders[i].itemName.toLowerCase();
                        var search = vm.search.toLowerCase();
                        if (itemName.includes(search)) {
                            vm.filterKeys[vm.reminders[i].reminderKey] = true;
                        }
                    }
                    if (vm.filterSelect === 'customer' && vm.reminders[i].fields) {
                        for (var j in vm.reminders[i].fields) {
                            if (vm.reminders[i].fields[j].fieldName === 'customer') {
                                var customer = vm.reminders[i].fields[j].value.toLowerCase();
                                var search = vm.search.toLowerCase();
                                if (customer.includes(search)) {
                                    vm.filterKeys[vm.reminders[i].reminderKey] = true;
                                }
                            }
                        }
                    }                    
                    if (vm.filterSelect === 'orderNo' && vm.reminders[i].fields) {
                        for (var j in vm.reminders[i].fields) {
                            if (vm.reminders[i].fields[j].fieldName === 'order #') {
                                var orderNo = vm.reminders[i].fields[j].value.toLowerCase();
                                var search = vm.search.toLowerCase();
                                if (orderNo.includes(search)) {
                                    vm.filterKeys[vm.reminders[i].reminderKey] = true;
                                }                           
                            } 
                        }
                    }                    
                    if (vm.filterSelect === 'pending') {
                        if (!vm.reminders[i].status) { 
                            vm.filterKeys[vm.reminders[i].reminderKey] = true;
                        }
                    }                    
                    if (vm.filterSelect === 'reviewed') {
                        if (vm.reminders[i].status && vm.reminders[i].status === 'reviewed') { 
                            vm.filterKeys[vm.reminders[i].reminderKey] = true;
                        }
                    }
                }
                vm.loading = false;
                vm.filterSet = true;
            }, 800);
        }

        function clearFilter() {
            vm.filterSelect = '';
            vm.search = '';
            vm.filterSet = false;
            vm.loading = true;
            $timeout(function() {
                for (var i = 0; i < vm.reminders.length; i++) {
                    vm.filterKeys[vm.reminders[i].reminderKey] = true;
                }            
                vm.loading = false;
            }, 800);
        }

        function updateStatus ($event, reminder, action) {
            $mdDialog.show({
                controller: 'UpdateStatusCtrl',
                templateUrl: 'App/UI/Reminders/updateStatus.html',
                parent: angular.element( document.body ),
                targetEvent: $event,
                clickOutsideToClose: false,
                controllerAs: 'updateStatus',
                locals: { reminder: reminder, action: action }
            });
        }     

        function selectedChanged (reminder) {
            if (reminder.selected) {
                vm.selected.push(reminder);
            } else {
                vm.selected.splice(vm.selected.indexOf(reminder), 1);
            }            
        }

        function print () {
            var doc = new jsPDF();
            var startY = 17;
            var startX = 5;
            var page = 1;
            var sortedArr = sortByKey(vm.selected, 'date');
            doc.setFontSize( 12 );
            angular.forEach(sortedArr, function(value,key) {
                doc.text(5, startY, 'Date: ' + new Date(value.date).toLocaleDateString());
                startY += 10;
                doc.text(startX, startY, 'Reminder ID: ' + value.reminderKey.slice(-4));
                doc.text(startX + 70, startY, 'Action: ' + value.action);
                doc.text(startX + 140, startY, 'Crop: ' + value.itemName)
                startY += 10;
                angular.forEach(value.fields, function(val,k) {
                    if (val.value) {
                        var fieldName = (val.fieldName === 'cuttings' ? 'cuttings/Bulbs' : val.fieldName);
                        var valValue = Number(val.value) ? Number(val.value).toLocaleString() : val.value;
                        doc.text(startX, startY, capFirstLetter(fieldName) + ': ' + valValue );
                        startX += 70;
                        if (startX >= 155) {
                            startX = 5;
                            startY += 10;
                        }
                        if (startY >= 271) {
                            doc.text(187, 285, 'Page ' + page.toString());
                            page++
                            doc.addPage();
                            startY = 17;
                            startX = 5;
                        }
                    }
                });
                doc.line(5, startY + 3, 190, startY + 3);
                startX = 5;
                startY += 10;
            });
            doc.text(187, 285, 'Page ' + page.toString());
            vm.selected = [];
            doc.save('reminders');
        }

        function toggleMenu () {
            $mdSidenav('left').toggle();
        }   

        function capFirstLetter( str ) {
            var pieces = str.split( ' ' );
            for ( var i = 0; i < pieces.length; i++ ) {
                var j = pieces[i].charAt(0).toUpperCase();
                pieces[i] = j + pieces[i].substr(1);
            }
            return pieces.join( ' ' );
        }     

        function sortByKey( array, prop ) {
            return array.sort( function( a, b ) {
                var x = a[ prop ]; var y = b[ prop ];
                return ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
            });
        }               

    }
    
})();
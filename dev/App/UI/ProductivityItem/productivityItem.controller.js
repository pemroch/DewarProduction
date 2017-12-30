(function() {
  
    'use strict';

    angular.module('productivityItem.controller', [])
    .controller('ProductivityItemCtrl', ProductivityItemCtrl);

    ProductivityItemCtrl.$inject = [
        '$mdDialog',
        '$mdSidenav',
        '$rootScope',
        '$state',
        '$stateParams',
        '$timeout',
        'AddArrService',
        'LoadArrService',
        'LoadObjService',
        'SetObjService',
    ];

    function ProductivityItemCtrl ($mdDialog, $mdSidenav, $rootScope, $state, $stateParams, $timeout, AddArrService, LoadArrService, LoadObjService, SetObjService) {
        
        var vm = this;
        var orderKeys = [];

        vm.notes = '';
        vm.filteredItem = '';
        vm.columnFilter = '';
        vm.orders = {};
        vm.fields = {};
        vm.filterObj = {};
        vm.selectedKeys = [];
        vm.selectedArr = [];
        vm.filteredItems = [];
        vm.loading = true;
        vm.allSelected = false;
        vm.removeFields = false;
        vm.editFields = false;
        vm.disableSubmit = false;
        vm.print = print;
        vm.multiDelete = multiDelete;
        vm.addField = addField;
        vm.newOrder = newOrder;
        vm.saveNotes = saveNotes;
        vm.editField = editField;
        vm.dateChange = dateChange;
        vm.toggleMenu = toggleMenu;
        vm.filterItems = filterItems;
        vm.resetOrders = resetOrders;
        vm.changeDays = changeDays;
        vm.selectAll = selectAll;
        vm.removeField = removeField;
        vm.removeOrder = removeOrder;
        vm.changesMade = changesMade;
        vm.valueChange = valueChange;
        vm.selectedChanged = selectedChanged;
        vm.filterOrders = filterOrders;
        vm.itemName = $stateParams.itemName;

        $mdSidenav('left').close();

        $timeout(function() {
            loadFields();
        }, 800);

        function loadFields () {
            LoadObjService('fields/' + $stateParams.itemKey)
            .then(function(fields) {
                vm.fields = fields;
                loaditemProductivity();
            });
        }    

        function loaditemProductivity () {
            LoadObjService('itemProductivity/' + $stateParams.itemKey)
            .then(function(orders) {
                vm.orders = orders;
                setShipDate(true, true);
            });
        }         

        function loadNotes () {
            LoadObjService('notes/' + $stateParams.itemKey)
            .then(function(notes) {
                vm.notes = notes;
                resetOrders();
            });
        }        

        function filterItems () {
            if (vm.columnFilter.fieldName) {
              vm.filteredItems = {};
                angular.forEach(vm.orders.data, function(value, key) {
                    angular.forEach(value, function(val, k) {
                        if ((val.fieldName === vm.columnFilter.fieldName) && val.value) {
                            var itemVal = null;
                            if (typeof val.value === 'string') {
                                var itemVal = val.value.toLowerCase();
                            }
                            if (typeof val.value === 'number') {    
                                var itemVal = new Date(val.value).toLocaleDateString();
                            }
                            vm.filteredItems[itemVal] = k;
                        }
                    });
                });
            }
        }

        function filterOrders () {
            vm.filterObj = {}; 
            angular.forEach(vm.orders.data, function(value, key) {
                var itemValue = null;
                if (typeof value[vm.filteredItem.item].value === 'string') {
                    itemValue = value[vm.filteredItem.item].value.toLowerCase();
                }
                if (typeof value[vm.filteredItem.item].value === 'number') {
                    itemValue = new Date(value[vm.filteredItem.item].value).toLocaleDateString();
                }
                if (itemValue === vm.filteredItem.key) {
                    vm.filterObj[key] = true;
                }
            });            
        }

        function resetOrders () {
            vm.filterObj = {};            
            vm.filteredItems = [];
            vm.columnFilter = '';
            vm.filteredItem = '';
            vm.loading = false;
            angular.forEach(vm.orders.data, function(value, key) {
                vm.filterObj[key] = true;
            });
        }

        function setShipDate (lNotes, calcTotals) {
            $timeout(function() {
                var ppp = null;
                var cuttingsKey = null;
                var qtyKey = null;
                var cuttingsTotal = 0;
                var qtyTotal = 0;
                angular.forEach(vm.orders.data, function(value, key) {
                    if (value.shipDate) {
                        value.shipDateCalendar = new Date(value.shipDate);
                    }
                    if (calcTotals && !value.complete) {
                        angular.forEach(value, function(val, k) {
                            if (val.fieldName === 'cuttings') {
                                cuttingsKey = k;
                            }
                            if (val.fieldName === 'ppp' && val.value) {
                                ppp = val.value
                            }
                            if (val.fieldName === 'qty of pots') {
                                qtyKey = k;
                                if (val.value) {
                                    qtyTotal += val.value;
                                    cuttingsTotal += (ppp * val.value);
                                    ppp = null;
                                }
                            }
                        });
                        if (cuttingsKey && qtyKey) {
                            SetObjService('fields/' + $stateParams.itemKey + '/' + cuttingsKey + '/total', cuttingsTotal);
                            SetObjService('fields/' + $stateParams.itemKey + '/' + qtyKey + '/total', qtyTotal);
                        }
                    }
                });            
                if (lNotes) {
                    loadNotes();
                }
            });            
        }

        function changesMade (orderKey, order, fieldKey, field) {
            SetObjService('itemProductivity/' + $stateParams.itemKey + '/' + orderKey + '/' + fieldKey + '/value', field.value);
            if (order.shipDate) {
                LoadObjService('userNames/' + firebase.auth().currentUser.uid)
                .then(function(user) {
                    var ref = $rootScope.firebaseRef;
                    var dateRefObj = {
                        itemName: $stateParams.itemName,
                        status: null,
                        reviewedBy: null,
                        reviewComment: null
                    }
                    angular.forEach(order, function(value, key) {                
                        if (value.category === 'reminder' && !value.complete) {
                            var dateRefChild = ref.child('reminders/' + value.reminderKey);    
                            SetObjService('reminders/' + value.reminderKey + '/fields/' + fieldKey, field);
                            dateRefChild.update(dateRefObj);
                        } 
                    });
                    var shipDateRef = ref.child('reminders/' + order.shipDateReminderKey);
                    SetObjService('reminders/' + order.shipDateReminderKey + '/fields/' + fieldKey, field);
                    shipDateRef.update(dateRefObj);
                });
            }
            setShipDate();
        }    

        function valueChange(orderKey, order) {
            var cuttingsKey = null;            
            var cuttingsValue = null;            
            var pppKey = null;            
            var pppValue = null;
            var qtyKey = null;            
            var qtyValue = null;
            var ref = $rootScope.firebaseRef;
            angular.forEach(order, function(value, key) {
                if (value.fieldName === 'cuttings') {
                    cuttingsKey = key
                } 
                if (value.fieldName === 'ppp') {
                    pppKey = key;
                    pppValue = value.value || null;
                }
                if (value.fieldName === 'qty of pots') {
                    qtyKey = key;
                    qtyValue = value.value || null;
                }                        
            });  
            cuttingsValue = (pppValue && qtyValue) ? pppValue * qtyValue : null;
            var itemProductivityRef = ref.child('itemProductivity/' + $stateParams.itemKey + '/' + orderKey);
            var calculationsObj = {};
            calculationsObj[cuttingsKey] = {
                category: 'text', 
                fieldName: 'cuttings', 
                value: cuttingsValue
            };
            calculationsObj[pppKey] = {
                category: 'text', 
                fieldName: 'ppp', 
                value: pppValue                
            };
            calculationsObj[qtyKey] = {
                category: 'text', 
                fieldName: 'qty of pots', 
                value: qtyValue
            };
            itemProductivityRef.update(calculationsObj)
            if (order.shipDate) {
                LoadObjService('userNames/' + firebase.auth().currentUser.uid)
                .then(function(user) {
                    var dateRefObj = {
                        itemName: $stateParams.itemName,
                        status: null,
                        reviewedBy: null,
                        reviewComment: null
                    }       
                    angular.forEach(order, function(value, key) {
                        if (value.category === 'reminder' && !value.complete) {
                            var remindersRef = ref.child('reminders/' + value.reminderKey);    
                            var remindersFieldsRef = ref.child('reminders/' + value.reminderKey + '/fields');    
                            remindersRef.update(dateRefObj);
                            remindersFieldsRef.update(calculationsObj);
                        } 
                    });
                    var shipDateRef = ref.child('reminders/' + order.shipDateReminderKey);
                    var shipDateFieldsRef = ref.child('reminders/' + order.shipDateReminderKey + '/fields');
                    shipDateRef.update(dateRefObj);
                    shipDateFieldsRef.update(calculationsObj);
                });
            }
            setShipDate(false, true);
        }

        function dateChange (orderKey, order) {
            var fields = {};
            var reminders = {};
            var ref = $rootScope.firebaseRef;
            var refChild = ref.child('reminders');            
            var shipDate = new Date(order.shipDateCalendar);
            SetObjService('itemProductivity/' + $stateParams.itemKey + '/' + orderKey + '/shipDate', shipDate.getTime());
            angular.forEach(order, function(value, key) {
                if (value.category === 'text') {
                    fields[key] = value;
                }
                if (value.category === 'reminder') {
                    var date = new Date(order.shipDateCalendar);
                    date.setDate(date.getDate() - value.days);
                    var saveDate = new Date(date);
                    var time = saveDate.getTime();
                    value.value = time;
                    SetObjService('itemProductivity/' + $stateParams.itemKey + '/' + orderKey + '/' + key + '/value', time);
                    reminders[key] = reminders[key] || {};
                    reminders[key].action = value.fieldName;
                    reminders[key].complete = value.complete || null;
                    reminders[key].date = time;
                    reminders[key].itemName = $stateParams.itemName;
                    reminders[key].itemKey = $stateParams.itemKey;
                    reminders[key].orderKey = orderKey;
                    reminders[key].fieldKey = key;
                    reminders[key].reminderKey = value.reminderKey ? value.reminderKey : null;
                }
            });
            LoadObjService('userNames/' + firebase.auth().currentUser.uid)
            .then(function(user) {            
                angular.forEach(reminders, function(value, key) {
                    if (!value.reminderKey) {
                        value.fields = fields;
                        value.reviewedBy = null;
                        value.reviewComment = null;
                        var refChildPush = refChild.push(value);
                        SetObjService('itemProductivity/' + $stateParams.itemKey + '/' + orderKey + '/' + key + '/reminderKey', refChildPush.key);
                    } else if (!value.complete) {
                        var dateRefObj = {
                            itemName: $stateParams.itemName,
                            date: value.date,
                            status: null,
                            reviewedBy: null,
                            reviewComment: null
                        }
                        var dateRefChild = ref.child('reminders/' + value.reminderKey);
                        dateRefChild.update(dateRefObj);
                    }
                });
                var shipDateReminder = {
                    action: 'ship date',
                    date: shipDate.getTime(),
                    fields: fields,
                    itemKey: $stateParams.itemKey,
                    itemName: $stateParams.itemName,
                    orderKey: orderKey,
                    status: null,
                    reviewedBy: null,
                    reviewComment: null
                }
                if (order.shipDateReminderKey) {
                    SetObjService('reminders/' + order.shipDateReminderKey, shipDateReminder);
                } else {
                    var shipDatePush = refChild.push(shipDateReminder);
                    SetObjService('itemProductivity/' + $stateParams.itemKey + '/' + orderKey + '/shipDateReminderKey', shipDatePush.key);
                }
                setShipDate();
            });
        }

        function newOrder () {
            vm.removeFields = false;
            vm.editFields = false;            
            AddArrService('itemProductivity/' + $stateParams.itemKey, vm.fields.data)
            .then(function(item) {
                setShipDate();
                resetOrders();
            });
        }      

        function saveNotes () {
            SetObjService('notes/' + $stateParams.itemKey, vm.notes.data.$value);
        }        

        function capFirstLetter(str) {
            var pieces = str.split( ' ' );
            for ( var i = 0; i < pieces.length; i++ ) {
                var j = pieces[i].charAt(0).toUpperCase();
                pieces[i] = j + pieces[i].substr(1);
            }
            return pieces.join( ' ' );
        }  

        function addField ($event) {
            vm.removeFields = false;
            vm.editFields = false;
            var fieldsArr = [];
            angular.forEach(vm.fields.data, function(field, key) {
                fieldsArr.push({
                    fieldName: field.fieldName
                })
            });               
            $mdDialog.show({
                controller: 'AddFieldCtrl',
                templateUrl: 'App/UI/ProductivityItem/addField.html',
                parent: angular.element( document.body ),
                targetEvent: $event,
                clickOutsideToClose: false,
                controllerAs: 'addField',
                locals: { fields: fieldsArr, itemKey: $stateParams.itemKey, itemName: $stateParams.itemName, orders: vm.orders.data }
            })
            .then(function() {
                setShipDate();
            });
        }       

        function removeField ($event, fieldKey, field) {
            $mdDialog.show(
                $mdDialog.confirm()
                .title('Would you like to remove column?')
                .textContent(capFirstLetter(field.fieldName) + ' will be permanently deleted. Reminders may also be affected.')
                .targetEvent($event)
                .ok('Confirm')
                .cancel('Cancel')
                .clickOutsideToClose(false)
            )
            .then( function() {
                SetObjService('fields/' + $stateParams.itemKey + '/' + fieldKey, null);
                LoadObjService('userNames/' + firebase.auth().currentUser.uid)
                .then(function(user) {             
                    var ref = $rootScope.firebaseRef;   
                    angular.forEach(vm.orders.data, function(value, key) {
                        SetObjService('itemProductivity/' + $stateParams.itemKey + '/' + key + '/' + fieldKey, null);    
                        if (value.shipDate && !value.complete) {
                            if (field.category === 'text') {
                                angular.forEach(value, function(val, k) {
                                    if (val.category === 'reminder' && !val.complete) {
                                        var dateRefChild = ref.child('reminders/' + val.reminderKey);
                                        var dateRefObj = {
                                            status: null,
                                            reviewedBy: null,
                                            reviewComment: null,
                                        }
                                        SetObjService('reminders/' + val.reminderKey + '/fields/' + fieldKey, null);
                                        dateRefChild.update(dateRefObj);                                                        
                                    }
                                    var shipDateObj = {
                                        status: null,
                                        reviewedBy: null,
                                        reviewComment:  null
                                    }
                                    SetObjService('reminders/' + value.shipDateReminderKey + '/fields/' + fieldKey, null);    
                                    var shipDateRef = ref.child('reminders/' + value.shipDateReminderKey);
                                    shipDateRef.update(shipDateObj);
                                });
                            }
                            if (field.category === 'reminder') {
                                angular.forEach(value, function(val, k) {
                                    if (k === fieldKey) {
                                        SetObjService('reminders/' + val.reminderKey, null);    
                                    }
                                });
                            }
                        }
                    });
                    vm.removeFields = false;
                    $mdDialog.hide();
                    setShipDate();
                });
            });            
        }

        function removeOrder ($event, orderKey, order) {
            $mdDialog.show(
                $mdDialog.confirm()
                .title('Would you like to remove this order?')
                .textContent('Order ' + orderKey.slice(-4) + ' will be permanently deleted.')
                .targetEvent($event)
                .ok('Confirm')
                .cancel('Cancel')
                .clickOutsideToClose(false)
            )
            .then( function() {
                SetObjService('itemProductivity/' + $stateParams.itemKey + '/' + orderKey, null)
                if (order.shipDate) {
                    angular.forEach(order, function(value, key) {
                        if (value.category === 'reminder' && value.reminderKey) {
                            SetObjService('reminders/' + value.reminderKey, null);
                            SetObjService('archive/' + value.reminderKey, null);
                        }
                    });
                    SetObjService('reminders/' + order.shipDateReminderKey, null);
                    SetObjService('archive/' + order.shipDateReminderKey, null);
                }
                setShipDate();
            });            
        }        

        function editField ($event, fieldKey, field) {
            var fieldsArr = [];
            angular.forEach(vm.fields.data, function(field, key) {
                fieldsArr.push({
                    fieldName: field.fieldName
                })
            });               
            $mdDialog.show({
                controller: 'EditFieldCtrl',
                templateUrl: 'App/UI/ProductivityItem/editField.html',
                parent: angular.element( document.body ),
                targetEvent: $event,
                clickOutsideToClose: false,
                controllerAs: 'editField',
                locals: { fields: fieldsArr, fieldKey: fieldKey, field: field, itemKey: $stateParams.itemKey, orders: vm.orders.data }
            })
            .then(function() {
                vm.editFields = false;
                setShipDate();
            });
        }       

        function changeDays ($event, orderKey, fieldKey, field, shipDate) {
            vm.editFields = false;
            vm.removeFields = false;
            $mdDialog.show({
                controller: 'ChangeDaysCtrl',
                templateUrl: 'App/UI/ProductivityItem/changeDays.html',
                parent: angular.element( document.body ),
                targetEvent: $event,
                clickOutsideToClose: false,
                controllerAs: 'changeDays',
                locals: { itemKey: $stateParams.itemKey, orderKey: orderKey, fieldKey: fieldKey, field: field, shipDate: shipDate }
            })
            .then(function() {
                setShipDate();
            });
        }

        function selectAll () {
            if (vm.allSelected) {
                angular.forEach(vm.orders.data, function(value, key) {
                    if (value.shipDate) {
                        vm.selectedKeys[key] = true;
                        orderKeys.push({ key: key, shipDate: value.shipDate });
                        vm.selectedArr.push(value);
                    }
                });
            } else {
                vm.selectedKeys = {};
                vm.selectedArr = [];
                orderKeys = [];
            }
        }        

        function selectedChanged (orderKey, order) {
            if (vm.selectedKeys[orderKey]) {
                vm.selectedArr.push(order);
                orderKeys.push({ key: orderKey, shipDate: order.shipDate })
            } else {
                vm.selectedArr.splice(vm.selectedArr.indexOf(order), 1);
                orderKeys.splice(orderKeys.indexOf({ key: orderKey, shipDate: order.shipDate }), 1);
            }
        }        

        function print () {
            var doc = new jsPDF();
            var startY = 17;
            var startX = 5;
            var page = 1;
            var sortedKeys = sortByKey(orderKeys, 'shipDate');
            var sortedArr = sortByKey(vm.selectedArr, 'shipDate');
            doc.setFontSize( 12 );
            angular.forEach(sortedArr, function(value,key) {
                doc.text(5, startY, 'Ship Date: ' + new Date(value.shipDate).toLocaleDateString());
                startY += 10;
                doc.text(startX, startY, 'Order ID: ' + sortedKeys[key].key.slice(-4));
                doc.text(startX + 70, startY, 'Crop: ' + $stateParams.itemName);
                doc.text(startX + 140, startY, 'Complete: ' + (value.complete ? 'Yes' : 'No') )
                startY += 10;
                angular.forEach(value, function(val,k) {
                    if (k && k !== 'undefined' && k !== 'complete' && k !== 'shipDate' && k !== 'shipDateCalendar' && k !== 'shipDateReminderKey') {
                        var fieldName = (val.fieldName === 'cuttings' ? 'cuttings/Bulbs' : val.fieldName);
                        var valValue = null;
                        if (val.category === 'text') {
                            valValue = Number(val.value) ? Number(val.value).toLocaleString() : (val.value || '');
                        }
                        if (val.category === 'reminder') {
                            valValue = new Date(val.value).toLocaleDateString();
                        }
                        doc.text(startX, startY, capFirstLetter(fieldName) + ': ' + valValue );
                        startX += 70;
                        if (startX >= 155) {
                            startX = 5;
                            startY += 10;
                        }
                        if (startY >= 250) {
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
            doc.save($stateParams.itemName);
        }  
        
        function multiDelete($event) {
            $mdDialog.show(
                $mdDialog.confirm()
                .title('Would you like to remove orders selected?')
                .textContent('These orders will be permanently deleted')
                .targetEvent($event)
                .ok('Confirm')
                .cancel('Cancel')
                .clickOutsideToClose(false)
            )
            .then( function() {
                angular.forEach(vm.orders.data, function(value, key) {
                    if(value.complete && vm.selectedKeys[key]) {
                        SetObjService('itemProductivity/' + $stateParams.itemKey + '/' + key, null)
                    }
                });
                vm.selectedKeys = {};
                vm.selectedArr = [];
                orderKeys = [];                
            });   
        }

        function toggleMenu () {
            $mdSidenav('left').toggle();
        }

        function sortByKey( array, prop ) {
            return array.sort( function( a, b ) {
                var x = a[ prop ]; var y = b[ prop ];
                return ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
            });
        }        

    }
    
})();
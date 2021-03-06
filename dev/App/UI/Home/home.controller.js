(function() {
  
  'use strict';

  angular.module('home.controller', [])
  .controller('HomeCtrl', HomeCtrl);

  HomeCtrl.$inject = [
    '$mdDialog',
    '$scope',
    '$rootScope',
    '$state',
    '$timeout',
    'AddArrService',
    'CheckExistService',
    'LoadObjService',
    'LoadArrService',
    'SetObjService'
  ];

  function HomeCtrl ($mdDialog, $scope, $rootScope, $state, $timeout, AddArrService, CheckExistService, LoadObjService, LoadArrService, SetObjService) {
      var vm = this;

        vm.addNewItemForm;
        vm.error = '';
        vm.editError = '';
        vm.newItemTitle = '';
        vm.user = null;
        vm.loading = true;
        vm.newItem = false;
        vm.showRemoveItem = false;
        vm.showEditItem = false;
        vm.disableSubmit = false;
        vm.productivityList = [];
        vm.focus = focus;
        vm.removeItem = removeItem;
        vm.checkExist = checkExist;
        vm.editItem = editItem;
        
        $timeout(function() {
            loadProductivitylist();
        });
        
        function loadProductivitylist () {
            LoadArrService('productivityList')
            .then(function(result) {
                if (result.success) {
                    vm.productivityList = result.data;
                    loadAdmin();
                }
            });
        }

        function loadAdmin () {
            LoadObjService('users/' + $rootScope.user.uid)
            .then(function(user) {
                vm.loading = false;
                vm.user = user;
            });
        }
        
        function checkExist () {
            var newItem = vm.newItemTitle.toLowerCase();
            CheckExistService(vm.productivityList, 'itemName', newItem)
            .then(function(result) {
                if (result === 'notExist') {
                    vm.newItemTitle = '';
                    vm.disableSubmit = false;
                    vm.newItem = false;                    
                    addToList(newItem)
                } else {
                    vm.error = 'Item already exist please try again.'
                }
            });
        }
        
        function addToList (newItem) {
            var ref = $rootScope.firebaseRef;
            var productivityListRef = ref.child('productivityList');
            var productivityListRefPushRef = productivityListRef.push({ itemName: newItem });
            var fields = [
                {
                    category: 'text',
                    fieldName: 'customer'
                },
                {
                    category: 'text',
                    fieldName: 'order #'
                },
                {
                    category: 'text',
                    fieldName: 'variety'
                },
                {
                    category: 'text',
                    fieldName: 'cuttings'
                },
                {
                    category: 'text',
                    fieldName: 'ppp'
                },
                {
                    category: 'text',
                    fieldName: 'qty of pots'
                },
                {
                    category: 'text',
                    fieldName: 'pot size'
                },
                {
                    category: 'text',
                    fieldName: 'pot id'
                },
                {
                    category: 'text',
                    fieldName: 'soil'
                }
            ]     
            var fildsRef = ref.child('fields/' + productivityListRefPushRef.key);
            angular.forEach(fields, function(value, key) {
                fildsRef.push(value);
            });
            $state.go('home.productivityItem', { itemName: newItem, itemKey: productivityListRefPushRef.key })
        }

        function removeItem ($event, item) {
            $mdDialog.show(
                $mdDialog.confirm()
                .title('Would you like to remove item?')
                .textContent(capFirstLetter(item.itemName) + ' will be permanently deleted.')
                .targetEvent($event)
                .ok('Confirm')
                .cancel('Cancel')
                .clickOutsideToClose('true')
            )
            .then( function() {
                vm.newItem = false;
                vm.showRemoveItem = false;
                vm.showEditItem = false;
                SetObjService('fields/' + item.$id, null);
                SetObjService('notes/' + item.$id, null);
                SetObjService('productivityList/' + item.$id, null);
                LoadObjService('itemProductivity/' + item.$id)
                .then(function(orders) {
                    angular.forEach(orders.data, function(value, key) {
                        if (value.shipDate) {
                            angular.forEach(value, function(val, k) {
                                if (val.category === 'reminder') {
                                    SetObjService('reminders/' + val.reminderKey, null);
                                }
                            });                        
                            SetObjService('reminders/' + value.shipDateReminderKey, null);
                        }
                    });
                    SetObjService('itemProductivity/' + item.$id, null);
                });
                $state.go('home.reminders');
            });        
        }

        function editItem ($event, item) {
            var error = '';
            $mdDialog.show(
                $mdDialog.prompt()
                .title('Edit Crop Name')
                .targetEvent($event)
                .textContent(error)
                .placeholder('Enter New Name')
                .initialValue(capFirstLetter(item.itemName))
                .ok('Confirm')
                .cancel('Cancel')
                .clickOutsideToClose('false')
            )
            .then( function(newName) {
                vm.newItem = false;
                vm.showRemoveItem = false;
                vm.showEditItem = false;
                newName = newName.toLowerCase();
                CheckExistService(vm.productivityList, 'itemName', newName)
                .then(function(result) {
                    if (result === 'notExist') {
                        SetObjService('productivityList/' + item.$id + '/itemName', newName);
                    } else {
                        vm.editError = 'Item already exist please try again.'
                        $timeout(function() {
                            vm.editError = ''
                        }, 4000);
                    }
                });
            });        
        }

        function focus () {
            vm.newItem = !vm.newItem; 
            vm.showRemoveItem = false; 
            vm.showEditItem = false;
            vm.newItemTitle = '';
            if (vm.newItem) {
                $timeout(function() {
                    document.getElementById("addItemInput").focus();
                });
            }
        }

        function capFirstLetter( str ) {
            var pieces = str.split( ' ' );
            for ( var i = 0; i < pieces.length; i++ ) {
                var j = pieces[i].charAt(0).toUpperCase();
                pieces[i] = j + pieces[i].substr(1);
            }
            return pieces.join( ' ' );
        }          
    
    }

})();
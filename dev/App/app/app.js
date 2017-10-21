(function() {
  
    'use strict';

    angular.module('InteractiveMap', [ 
        'ui.router', 
        'ngMaterial',
        'firebase',
        'app.run', 
        'app.config', 
        'login.controllers',
        'home.controllers',
        'reminders.controllers',
        'productivityItem.controllers',
        'settings.controllers',
        'archive.controllers',
        'ui.services'
    ]);

})();
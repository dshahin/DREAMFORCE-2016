
require("!style!css!sass!./main.scss");
import angular from 'angular';
import uirouter from 'angular-ui-router';
import jsr from 'jsr-mocks';
import routing from './app.config';

import header from './components/header/header.directive';
import card from './components/card/card.directive';
import home from './features/home';
import toastr from 'toastr';


angular.element(document).ready(() => {
    angular.module('app', [uirouter, jsr, header, home,card])
      .constant('toastr',toastr)
      .config(routing);

    angular.bootstrap(document, ['app']);
});

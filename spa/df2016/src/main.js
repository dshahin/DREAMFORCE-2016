// TODO: this should work
// import './main.scss';
require("!style!css!sass!./main.scss");
import angular from 'angular';
import uirouter from 'angular-ui-router';

import routing from './app.config';
//TODO move to a core module to load all deps
import header from './components/header/header.directive';
import home from './features/home';
import jsr from './services/jsrMocks.service';


angular.element(document).ready(() => {
    angular.module('app', [uirouter, jsr, header, home])
      .config(routing);

    angular.bootstrap(document, ['app']);
});

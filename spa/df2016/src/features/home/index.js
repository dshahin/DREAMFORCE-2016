import './home.scss';

import angular from 'angular';
import uirouter from 'angular-ui-router';
import routing from './home.routes';
import HomeController from './home.controller';
//import jQuery from 'jquery';


import greeting    from '../../components/greeting/greeting.directive';

export default angular.module('app.home', [uirouter])
  .config(routing)
  .controller('HomeController', HomeController)
  .name;

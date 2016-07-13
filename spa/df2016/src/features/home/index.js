import './home.scss';

import angular from 'angular';
import uirouter from 'angular-ui-router';

import routing from './home.routes';
import HomeController from './home.controller';
import randomNames from '../../services/randomNames.service';

import greeting    from '../../components/greeting/greeting.directive';

export default angular.module('app.home', [uirouter, randomNames, greeting])
  .config(routing)
  .controller('HomeController', HomeController)
  .name;

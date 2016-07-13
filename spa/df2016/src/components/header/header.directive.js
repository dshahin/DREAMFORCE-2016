import angular from 'angular';

function header() {
  return {
    restrict: 'E',
    scope: {
      name: '=',
      foo: '='
    },
    template: require('./header.html'),
    controller : headerController,
    controllerAs : 'header'
  }
}

export default angular.module('directives.header', [])
  .directive('header', header)
  .name;


function headerController(){
    this.staticPath = window.configSettings.staticPath;
}

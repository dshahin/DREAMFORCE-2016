import angular from 'angular';

function header() {
  return {
    restrict: 'E',
    scope: {
      card: '='
    },
    template: require('./card.html'),
    controller : headerController,
    controllerAs : 'card'
  }
}

export default angular.module('directives.card', [])
  .directive('card', header)
  .name;


function headerController(){
    this.staticPath = window.configSettings.staticPath;
}

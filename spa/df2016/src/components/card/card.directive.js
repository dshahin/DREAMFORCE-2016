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


function headerController($scope,$rootScope,$log){
    'ngInject';
    $scope.staticPath = window.configSettings.staticPath;

    $scope.getCards = () => {
        $rootScope.$broadcast('get-cards');
        $log.debug('firing get cards event');
    }
}

import angular from 'angular';

function header() {
  return {
    restrict: 'E',
    scope: {
      name: '=',
      foo: '='
    },
    template: require('./header.html')
  }
}

export default angular.module('directives.header', [])
  .directive('header', header)
  .name;

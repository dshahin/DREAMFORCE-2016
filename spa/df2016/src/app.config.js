routing.$inject = ['$urlRouterProvider', '$locationProvider', 'jsrMocksProvider'];

export default function routing($urlRouterProvider, $locationProvider, jsrMocksProvider) {
  $locationProvider.html5Mode(false);
  $urlRouterProvider.otherwise('/');
  jsrMocksProvider.setMocks(window.configSettings.mocks);
}

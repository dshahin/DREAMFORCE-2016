routing.$inject = ['$urlRouterProvider', '$locationProvider', 'jsrMocksProvider'];

export default function routing($urlRouterProvider, $locationProvider, jsrMocksProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');
  jsrMocksProvider.setMocks(configSettings.mocks, 'http://localhost:9000/');
}

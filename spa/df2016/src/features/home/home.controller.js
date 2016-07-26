export default class HomeController {
  constructor(randomNames, jsr, $scope, $log) {
    'ngInject';
    this.random = randomNames;
    this.name = 'World';
    this.staticPath = window.configSettings.staticPath;
    this.$scope = $scope;
    this.$log = $log;

    this.jsr = jsr;
    this.cards = {};
    this.$scope.$on('get-cards', (event, data) =>{
        this.$log.debug('received get cards event');
        this.getCards();
    });
    this.getCards();
  }



  getCards() {

      return this.jsr({ method: window.configSettings.remoteActions.getCards, args: [] })
          .then(cards => this.cards = cards )
          .catch(error => console.error(error.message, error));
  }

}

HomeController.$inject = ['randomNames', 'jsr', '$scope', '$log'];

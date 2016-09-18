export default class HomeController {

  constructor( jsr, $log, $scope) {
    'ngInject';
    this.jsr = jsr;
    this.$log = $log;
    this.$scope = $scope;
    this.cards = [];
    this.$scope.$on('get-cards', (event) =>{
        this.$log.debug('received get cards event', event);
        this.getCards().then((cards)=>$log.log(`got ${cards.length} cards`, cards));
    });
    this.$scope.$emit('get-cards');
  }

  getCards() {
      this.$log.log('getting cards...');
      return this.jsr({method: window.configSettings.remoteActions.getCards})
      .then(cards => {
        for(var card of cards){
          this.cards.unshift(card);
        }

        return cards;
      })
      .catch(error => {
          this.$log.error(error.message, error);
          alert(error.message);
          return [];
      });

  }

}

export default class HomeController {

    constructor(jsr, $log, $scope) {
        'ngInject';
        this.jsr = jsr;
        this.$log = $log;
        this.$scope = $scope;
        this.$log.debug('received get cards event', event);
        this.cards = [];

        this.$scope.$on('clear-cards', (event) =>{
            this.cards = [];
        });
        //setup event handler
        this.$scope.$on('get-cards', (event) => {
            this.$log.debug('received get cards event', event);
            this.getCards().then((cards) => $log.log(`got ${cards.length} cards`, cards));
        });

        this.$scope.$emit('get-cards');
    }

    getCards() {
        this.$log.log('getting cards...');
        return this.jsr({
                method: window.configSettings.remoteActions.getCards
            })
            .then(cards => {
                this.cards = cards;
                return cards;
            })
            .catch(error => {
                this.$log.error(error.message, error);
                alert(error.message);
                return [];
            });

    }

    autocomplete(event) {
        var query = event.srcElement.value;
        if (query.length >= 3) {
            this.jsr({
                method: window.configSettings.remoteActions.autocomplete,
                args: [query],
                options: {
                    buffer: false
                }
            })
            .then(results => {
                this.matches = results;
                if (this.matches.length === 1) {
                    event.srcElement.value = this.matches[0];
                }
            })
            .catch(error => this.$log.error(error.message, error));
        } else {
            this.matches = [];
        }
    }

}

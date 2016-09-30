export default class HomeController {

    constructor(jsr, $log, $scope /*,toastr*/) {
        'ngInject';
        this.jsr = jsr;
        this.$log = $log;
        this.$scope = $scope;
        this.$log.debug('received get cards event', event);
        this.cards = [];
        // this.toastr = toastr;

        this.$scope.$on('clear-cards', () =>{
            this.cards = [];
        });
        //setup event handler
        this.$scope.$on('get-cards', (event) => {
            this.$log.debug('received get cards event', event);
            this.getCards().then((cards) => $log.log(`got ${cards.length} cards`, cards));
        });

        this.$scope.$emit('get-cards');
        // this.toastr.success('hey now');

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
                //this.toastr.error(error.message);
                return [];
            });

    }

    autocomplete(event) {
        console.log('event',event);
        var input = document.getElementById('autocomplete'),
            query = input.value;
        console.log('query',query);
        if (query.length >= 3) {
            this.jsr({
                method: window.configSettings.remoteActions.autocomplete,
                args: [query],
                options: {
                    buffer: false,
                    escape: true
                }
            })
            .then(results => {
                this.matches = results;
                if (this.matches.length === 1) {
                    input.value = this.matches[0];
                }
            })
            .catch(error => this.$log.error(error.message, error));
        } else {
            this.matches = [];
        }
    }

}

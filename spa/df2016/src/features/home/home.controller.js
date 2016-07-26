export default class HomeController {
  constructor(randomNames, jsr) {
    this.random = randomNames;
    this.name = 'World';
    this.staticPath = window.configSettings.staticPath;

    this.jsr = jsr;
    this.getCards();
  }

  getCards() {
      this.cards = {};
      return this.jsr({ method: window.configSettings.remoteActions.getCards, args: [] })
          .then(result => this.cards = result )
          .catch(error => console.error(error.message, error));
  }

  changeName() {
    this.name = 'Code | Science';
  }

  randomName() {
    this.name = this.random.getName();
  }
}

HomeController.$inject = ['randomNames', 'jsr'];

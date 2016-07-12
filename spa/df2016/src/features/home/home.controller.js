export default class HomeController {
  constructor(randomNames, jsr) {
    this.random = randomNames;
    this.name = 'World';
    this.products = {};
    jsr({ method: configSettings.remoteActions.yo, args: [] }).then(result => this.products = result );
    this.jsr = jsr;
  }

  getProducts() {
      this.jsr({
          method: configSettings.remoteActions.yo,
          args: []
      })
      .then(result => this.products = result );
  }

  changeName() {
    this.name = 'Code | Science';
  }

  randomName() {
    this.name = this.random.getName();
  }
}

HomeController.$inject = ['randomNames', 'jsr'];

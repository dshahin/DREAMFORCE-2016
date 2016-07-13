export default class HomeController {
  constructor(randomNames, jsr) {
    this.random = randomNames;
    this.name = 'World';
    this.staticPath = window.configSettings.staticPath;
    this.products = {};
    jsr({ method: window.configSettings.remoteActions.helloWorld, args: [] })
        .then(result => this.products = result )
        .catch(error => console.error(error.message, error));
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

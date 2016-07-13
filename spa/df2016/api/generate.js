module.exports = function () {
  var faker = require('faker');
  var _ = require('lodash');
  var getUserInfo = require('./mocks/getUserInfo.js');

  var productName = function () {
    return faker.commerce.productAdjective() +
      ' ' +
      faker.commerce.productMaterial() +
      ' Widget';
  };

  var productImage = function () {
    return faker.image.imageUrl();
  };

  // This is your json structurn each named object below can match a remote call
  return {
    getUserInfo: getUserInfo,
    getSidebar: _.times(3, function (id) {
      return {
        id: id + 1,
        name: 'Home',
        icon: 'home',
        iconBackground: faker.internet.color(),
        sequence: id + 1
      };
    }),
    products: _.times(9, function (id) {
      var title = productName();
      return {
        id: id + 1,
        title: title,
        image: productImage(),
        price: faker.commerce.price(),
        description: faker.lorem.paragraph(),
        summary: faker.lorem.paragraph()
      };
    }),
    products6: _.times(6, function (id) {
      var title = productName();
      return {
        id: id + 1,
        title: title,
        image: productImage(),
        price: faker.commerce.price(),
        description: faker.lorem.paragraph(),
        summary: faker.lorem.paragraph()
      };
    })
  };
};

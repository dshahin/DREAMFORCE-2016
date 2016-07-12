var faker = require('faker');
//var _ = require('lodash');

var getUserInfo = {
  avatar: faker.internet.avatar(),
  firstName: faker.name.firstName(),
  id: '00561000000L6lTAAS',
  lastName: faker.name.lastName(),
  name: faker.name.findName()
};
module.exports = getUserInfo;

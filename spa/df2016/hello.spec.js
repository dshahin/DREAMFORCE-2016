var fs = require('fs');
describe('angularjs homepage todo list', function() {
  it('should add a todo', function() {
    browser.get('http://localhost:8888');
    snap('screenshot');
    //element(by.model('todoList.todoText')).sendKeys('write first protractor test');
    // element(by.css('[value="add"]')).click();
    //
    // var todoList = element.all(by.repeater('todo in todoList.todos'));
    // expect(todoList.count()).toEqual(3);
    // expect(todoList.get(2).getText()).toEqual('write first protractor test');
    //
    // // You wrote your first test, cross it off the list
    // todoList.get(2).element(by.css('input')).click();
    // var completedAmount = element.all(by.css('.done-true'));
    // expect(completedAmount.count()).toEqual(2);
  });
});

function snap(filename, sleep){
      sleep = sleep || 2000;
      browser.sleep(sleep);
      browser.takeScreenshot().then(function(png) {
        var path = process.env.CIRCLE_ARTIFACTS || './artifacts'

        var stream = fs.createWriteStream(path + "/" + filename + '.png');



            stream.write(new Buffer(png, 'base64'));
            stream.end();
        });
    }

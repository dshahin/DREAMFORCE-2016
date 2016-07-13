(function() {


window.configSettings = {
    staticPath: '',
    user:{
        id : faker.random.uuid(),
        firstName : faker.name.firstName(),
        lastName : faker.name.lastName(),
        uiThemeDisplayed : 'Theme3',
    },
    remoteActions: {
        helloWorld  : '{!$RemoteAction.DF2016Controller.helloWorld}',
    },
    mocks: {
        '{!$RemoteAction.DF2016Controller.helloWorld}': helloWorld()
    }
};

//mock factory
function helloWorld(){
    return {
        timeout : 250,
        products : [],
        error : false,
        numberOfTiles : faker.random.number(30),
        method : function(){
            if(this.products.length === 0){
                for(var i=0; i< this.numberOfTiles ;i++){
                    this.products.push({
                        id : faker.random.uuid(),
                        image: faker.image.image(),
                        title: faker.lorem.sentence(),
                        motto: faker.company.catchPhrase(),
                        price: faker.commerce.price(99.99),
                        summary :faker.lorem.paragraph()
                    });
                }
            }
            return this.products;
        }
    };
}


})();

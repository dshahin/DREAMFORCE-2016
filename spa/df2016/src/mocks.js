(function() {


window.configSettings = {
    staticPath: '',
    config: {  },
    remoteActions: {
        helloWorld              : '{!$RemoteAction.DF2016Controller.helloWorld}',
    },
    mocks: {

        '{!$RemoteAction.DF2016Controller.helloWorld}': {
            timeout : 250,
            products : [],
            error : false,
            numberOfTiles : faker.random.number(20),
            method : function(){
                if(this.products.length === 0){
                    for(var i=0; i< this.numberOfTiles ;i++){
                        this.products.push({
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
        }
    }
};


var hellowWorld = function(){
    return {
        timeout : 5000,
        method : function(){
            return 'hello';
        }
    }
}


})();

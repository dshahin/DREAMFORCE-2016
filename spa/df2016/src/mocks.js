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
        getCards  : '{!$RemoteAction.DF2016Controller.getCards}',
    },
    mocks: {
        '{!$RemoteAction.DF2016Controller.getCards}': getCards()
    }
};

//mock factory
function getCards(){
    return {
        //error : 'there was an error' ,
        method : function(){
            var mock = this;
            //mock.error = mock.error ? false : 'there was an error';
            mock.products = [];
            mock.numberOfTiles = faker.random.number({'min': 1,'max': 3});
            for(var i=0; i< mock.numberOfTiles ;i++){
                mock.products.unshift({
                    id : faker.random.uuid(),
                    image: faker.image.image(),
                    title: faker.lorem.sentence(),
                    motto: faker.company.catchPhrase(),
                    summary :faker.lorem.paragraph()
                });
            }

            return mock.products;

        }
    };
}


})();

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
        timeout : 250,
        products : [],
        error : false ,
        numberOfTiles : faker.random.number({
            'min': 1,
            'max': 5
        }),
        method : function(){
            var mock = this;
            //mock.error = !this.error;
            mock.products = [];
            mock.numberOfTiles = faker.random.number(10);
            if(mock.products.length < 10){
                for(var i=0; i< mock.numberOfTiles ;i++){
                    mock.products.unshift({
                        id : faker.random.uuid(),
                        image: faker.image.image(),
                        title: faker.lorem.sentence(),
                        motto: faker.company.catchPhrase(),
                        price: faker.commerce.price(99.99),
                        summary :faker.lorem.paragraph()
                    });
                }
            }
            return mock.products;
            // return [
            //           {
            //             "id": "e2d8283b-3b4c-4c26-b822-a41b8b62a9b5",
            //             "title": "Nesciunt recusandae dolores ducimus similique ut.",
            //             "motto": "Synchronised demand-driven service-desk",
            //             "price": "727.00",
            //             "summary": "Est dolor voluptas doloremque est ullam officiis cum et. Cupiditate consequatur dolor qui repellat mollitia ut. Quia dolores modi omnis nisi quis. Porro repellat esse voluptas accusantium quae autem alias. Aliquam provident delectus aspernatur ut. Nemo repudiandae et in."
            //           },
            //           {
            //             "id": "cd78f207-03be-4825-a82d-22d7c4f598d5",
            //             "title": "Earum quisquam sit doloribus aliquam autem nulla accusamus officia sed.",
            //             "motto": "Multi-layered executive framework",
            //             "price": "411.00",
            //             "summary": "Eum eligendi consequatur quia vero ea enim et quo ullam. Commodi fuga enim maxime ut sit facere quod. Repudiandae voluptatem iste doloremque qui dolorum necessitatibus modi. Et maxime provident. Est blanditiis ullam non et et totam esse quisquam aperiam. Quis deserunt eos expedita."
            //           },
            //           {
            //             "id": "54b2b5bb-c4d1-4266-8e07-fa172a1b7ac4",
            //             "title": "Odio et nesciunt odit placeat quis.",
            //             "motto": "Visionary 24/7 attitude",
            //             "price": "744.00",
            //             "summary": "Rerum rem ut beatae et non tempore corrupti animi modi. Placeat et accusamus tempore soluta veniam et nisi. Dolorem qui est consectetur impedit quia. Qui aliquid quod iure maiores eum soluta."
            //           },
            //           {
            //             "id": "f2625a8d-7ba0-425e-8403-fad583b318ec",
            //             "title": "Libero omnis molestiae est.",
            //             "motto": "Streamlined optimal model",
            //             "price": "524.00",
            //             "summary": "Laudantium natus repellat et sed. Dolor dignissimos eveniet dolores nisi deserunt aut. Ut quis quos unde consequatur hic."
            //           }
            //         ];
        }
    };
}


})();

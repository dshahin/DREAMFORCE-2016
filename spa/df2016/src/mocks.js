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
        autocomplete  : '{!$RemoteAction.DF2016Controller.autocomplete}',
    },
    mocks: {
        '{!$RemoteAction.DF2016Controller.getCards}': getCardsStatic(),
        '{!$RemoteAction.DF2016Controller.autocomplete}': autocomplete(),
    }
};

//returns static json
function getCardsStatic() {
  return {
    method : function(){
      return [
        {
          "id": "a281511c-2bd5-402e-8565-e16bbcdd1d98",
          "image": "http://lorempixel.com/640/480/city",
          "title": "Recusandae alias perspiciatis reiciendis quia qui et totam autem.",
          "motto": "Face to face responsive moderator",
          "summary": "Consequatur provident itaque sit labore aut et voluptate ea. Accusantium laudantium at voluptatum alias quia. Perferendis nulla necessitatibus placeat non voluptatibus occaecati iusto. Et vel sint et optio et sit. Sunt rerum voluptas ut repellendus modi."
        },
        {
          "id": "c4215d9f-e46a-4918-a426-8b4b65e9e5e8",
          "image": "http://lorempixel.com/640/480/people",
          "title": "Doloribus eum ut minus sit.",
          "motto": "User-centric zero defect extranet",
          "summary": "Excepturi dolores eveniet est iusto error natus minus. Dolores dolor tenetur alias sint exercitationem. Doloremque voluptates qui eius id ex beatae. Ut et officiis."
        }
      ];
    }
  }
}

//dynamic mock, generates random cards using faker.js
function getCardsFaker(){
    return {
        //error : 'there was an error' ,
        timeout : 250,
        products : [],
        method : function(){
            var mock = this;
            //mock.error = mock.error ? false : 'there was an error';
            //mock.products = [];
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

//simulates autocomplete on server
function autocomplete(){
    return {
        timeout : 100,
        error : false,
        source : ['foo','bar','foobar','Barney Fife'],
        method : function(query){
            var mock = this;
            var matches = [];
            var q = query[1].toLowerCase();
            if(!q.length) return matches;
            for(var i=0;i<mock.source.length;i++){
                var possible = mock.source[i];
                console.log(possible, q);
                if(possible.toLowerCase().indexOf(q) >= 0){
                    matches.push(possible);
                }
            }
            console.log('query',q);
            console.log('matches',matches);
            return matches;
        }
    }
}


})();

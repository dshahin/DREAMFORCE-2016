(function() {


    window.configSettings = {
        staticPath: '',
        user: {
            id: faker.random.uuid(),
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            uiThemeDisplayed: 'Theme3',
        },
        remoteActions: {
            getCards: '{!$RemoteAction.DF2016Controller.getCards}',
            autocomplete: '{!$RemoteAction.DF2016Controller.autocomplete}',
        },
        mocks: {
            '{!$RemoteAction.DF2016Controller.getCards}': getCardsStatic(),
            '{!$RemoteAction.DF2016Controller.autocomplete}': autocomplete(),
        }
    };

    //returns static json
    function getCardsStatic() {
        return {
            error: false,
            method: function() {
                return [{
                    "created": "9/8/2016 2:48 PM",
                    "id": "a005000000g8YFHAA2",
                    "image": "http://bergenlinen.com/wp-content/uploads/2012/05/Spa.jpg",
                    "motto": "Look at me",
                    "summary": "This is a summary...",
                    "title": "Foobar"
                }, {
                    "created": "7/12/2016 8:15 PM",
                    "id": "a005000000eRakFAAS",
                    "image": "http://blueauraspa.com/wp-content/uploads/2015/01/Dollarphotoclub_55997552.jpg",
                    "motto": "This is the default motto",
                    "summary": "Now is the time for all good men to come to the aid of their country.",
                    "title": "Fun in the sun"
                }, {
                    "created": "7/12/2016 5:39 PM",
                    "id": "a005000000eRaNxAAK",
                    "image": "http://bergenlinen.com/wp-content/uploads/2012/05/Spa.jpg",
                    "motto": "This is the default motto",
                    "summary": "This is a summary...",
                    "title": "Card number three"
                }, {
                    "created": "7/12/2016 5:08 PM",
                    "id": "a005000000eRVAQAA4",
                    "image": "http://bergenlinen.com/wp-content/uploads/2012/05/Spa.jpg",
                    "motto": "Totally different motto",
                    "summary": "Now is the time for all good men to come to the aid of their country.",
                    "title": "this is another card"
                }, {
                    "created": "7/12/2016 5:07 PM",
                    "id": "a005000000eRVALAA4",
                    "image": "http://blueauraspa.com/wp-content/uploads/2015/01/Dollarphotoclub_55997552.jpg",
                    "motto": "This is the default motto",
                    "summary": "This is a summary...",
                    "title": "This is a card"
                }];
            }
        }
    }

    //dynamic mock, generates random cards using faker.js
    function getCardsFaker() {
        return {
            //error : 'there was an error' ,
            timeout: 100,
            products: [],
            method: function() {
                var mock = this;
                //mock.error = mock.error ? false : 'there was an error';
                //mock.products = [];
                mock.numberOfTiles = faker.random.number({
                    'min': 1,
                    'max': 3
                });
                for (var i = 0; i < mock.numberOfTiles; i++) {
                    mock.products.unshift({
                        id: faker.random.uuid(),
                        image: faker.image.image(),
                        title: faker.lorem.sentence(),
                        motto: faker.company.catchPhrase(),
                        summary: faker.lorem.paragraph()
                    });
                }

                return mock.products;

            }
        };
    }

    //simulates autocomplete on server
    function autocomplete() {
        return {
            timeout: 250,
            error: false,
            source: ['foo', 'bar', 'foobar', 'Barney Fife', 'Barney Miller'],
            method: function(query) {
                var mock = this;
                var matches = [];
                var q = query[1].toLowerCase();
                if (!q.length) return matches;
                for (var i = 0; i < mock.source.length; i++) {
                    var possible = mock.source[i];
                    console.log(possible, q);
                    if (possible.toLowerCase().indexOf(q) >= 0) {
                        matches.push(possible);
                    }
                }
                console.log('query', q);
                console.log('matches', matches);
                return matches;
            }
        }
    }


})();

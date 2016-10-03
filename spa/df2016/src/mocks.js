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
                    "image": "http://www.hijinxcomics.com/images/rocketeer.jpg",
                    "motto": "Fortune favors the bold",
                    "summary": "This is a summary...",
                    "title": "The Rocketeer"
                }, {
                    "created": "7/12/2016 8:15 PM",
                    "id": "a005000000eRakFAAS",
                    "image": "http://www.hijinxcomics.com/images/reidfleming.jpg",
                    "motto": "I thought I told you to shut up",
                    "summary": "Now is the time for all good men to come to the aid of their country.",
                    "title": "Reid Fleming"
                }, {
                    "created": "7/12/2016 5:39 PM",
                    "id": "a005000000eRaNxAAK",
                    "image": "http://www.hijinxcomics.com/images/unclescrooge.jpg",
                    "motto": "Live free or die",
                    "summary": "This is a summary...",
                    "title": "Uncle Scrooge"
                }, {
                    "created": "7/12/2016 5:08 PM",
                    "id": "a005000000eRVAQAA4",
                    "image": "http://www.hijinxcomics.com/images/robertculp.jpg",
                    "motto": "What's the scenario?",
                    "summary": "Now is the time for all good men to come to the aid of their country.",
                    "title": "Bill Maxwell"
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
            source: [
                "Rose Gonzalez",
                "Sean Forbes",
                "Jack Rogers",
                "Pat Stumuller",
                "Andy Young",
                "Tim Barr",
                "John Bond",
                "Stella Pavlova",
                "Lauren Boyle",
                "Babara Levy",
                "Josh Davis",
                "Jane Grey",
                "Arthur Song",
                "Ashley James",
                "Tom Ripley",
                "Liz D'Cruz",
                "Edna Frank",
                "Avi Green",
                "Siddartha Nedaerk",
                "Jake Llorrac",
                "Daniel Shahin",
                "Marc Benioff",
                "David Benioff"
            ],
            method: function(query) {
                var mock = this;
                var matches = [];
                var q = query[1].toLowerCase();
                if (!q.length) return matches;
                for (var i = 0; i < mock.source.length; i++) {
                    var possible = mock.source[i];
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

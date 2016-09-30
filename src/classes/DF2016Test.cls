@isTest
private class DF2016Test {

	@isTest static void test_getCards() {
		Test.startTest();
		DF2016Controller.Card[] cards = DF2016Controller.getCards();
		Test.stopTest();
		system.assertEquals(3, cards.size());
	}

	@isTest static void test_autocomplete() {
		Test.startTest();
		String[] matches = DF2016Controller.autocomplete('foo');
		Test.stopTest();
		system.assertEquals(0, matches.size());
	}

	@testSetup public static void setupTestData() {
		Card__c[] cards = new Card__c[]{
			new Card__C(
				name = 'test card 1',
				image__c ='http://blueauraspa.com/wp-content/uploads/2015/01/Dollarphotoclub_55997552.jpg',
				motto__c ='here is a test motto',
				summary__c = 'The quick, brown fox jumped over the lazy dog.',
				price__c = 19.99
			),
			new Card__C(
				name = 'test card 2',
				image__c ='http://blueauraspa.com/wp-content/uploads/2015/01/Dollarphotoclub_55997552.jpg',
				motto__c ='here is another test motto',
				summary__c = 'The quick, brown fox jumped over the lazy dog.',
				price__c = 19.99
			),
			new Card__C(
				name = 'test card 2',
				image__c ='http://blueauraspa.com/wp-content/uploads/2015/01/Dollarphotoclub_55997552.jpg',
				motto__c ='here is yet another test motto',
				summary__c = 'The quick, brown fox jumped over the lazy dog.',
				price__c = 19.99
			)
		};
		insert cards;
	}


}

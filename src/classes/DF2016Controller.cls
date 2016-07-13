public with sharing class DF2016Controller {

	//get a supervisor's team
    @ReadOnly
    @RemoteAction
    public static Card[] helloWorld() {
        Card[] cards = new Card[]{};
		for(Card__c card: [SELECT Id, Name, Motto__c, Price__c, Image__c, Summary__c from Card__c]){
			cards.add(new Card(card));
		}
		return cards;
    }

	public class Card{
		public String id {get;set;}
		public String title {get;set;}
		public String motto {get;set;}
		public Decimal price {get;set;}
		public String image {get;set;}
		public String summary {get;set;}
		public Card(Card__c card){
			this.id = card.id;
			this.title = card.Name;
			this.motto = card.motto__c;
			this.price = card.price__c;
			this.image = card.image__c;
			this.summary = card.summary__c;
		}
	}
}

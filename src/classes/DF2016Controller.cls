public with sharing class DF2016Controller {

	//get cards
    @ReadOnly
    @RemoteAction
    public static Card[] getCards() {
        Card[] cards = new Card[]{};
		for(Card__c card: [SELECT Id, Name, Motto__c,  Image__c, Summary__c, createdDate FROM Card__c ORDER BY createdDate DESC]){
			cards.add(new Card(card));
		}
		return cards;
    }

    @ReadOnly
    @RemoteAction
    public static String[] autocomplete(String query){
        query = '%' + query + '%';
        String[] matches = new String[]{};
        for(Contact c: [Select Name from Contact WHERE NAME LIKE :query]){
            matches.add(c.Name);
        }
        return matches;
    }

	public class Card{
		public String id {get;set;}
		public String title {get;set;}
		public String motto {get;set;}
        public String image {get;set;}
		public String summary {get;set;}
        public String created {get;set;}
		public Card(Card__c card){
			this.id = card.id;
			this.title = card.Name;
			this.motto = card.motto__c;
			this.image = card.image__c;
			this.summary = card.summary__c;
            this.created = card.CreatedDate.format();
		}
	}
}
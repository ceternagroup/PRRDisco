/**
 * Created by ronanwilliams on 2019-10-09.
 */

public with sharing class QuoteController {

    @AuraEnabled
    public static Object getUnitsApex(String recordId){

        return [SELECT Id, ImageLink__c, Name FROM Inventory_Item__c WHERE Type__c = 'Unit'];

    }

    @AuraEnabled
    public static Object getPitches(String recordId){

//        Opportunity opp = [SELECT Id]
        return null;

    }

}
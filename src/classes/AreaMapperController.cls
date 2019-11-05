/**
 * Created by ronanwilliams on 2019-10-16.
 */

public class AreaMapperController {

    @AuraEnabled
    public static Object getAreasApex(String recordId){
        return [SELECT Id, Name, ClipPath__c FROM Area_Zone__c WHERE Park__c = :recordId LIMIT 1];
    }


}
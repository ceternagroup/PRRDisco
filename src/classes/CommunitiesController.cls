/**
 * Created by ronanwilliams on 2019-10-18.
 */

public class CommunitiesController {

    @AuraEnabled
    public static Object getSomeContent(){


        Database.query('Opportunity');

        return [SELECT Id, Name FROM Opportunity];
    }

}
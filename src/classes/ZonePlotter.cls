/*
 *  @class - ZonePlotter
 *  @desc - Apex controller for the ZonePlotter lightning component
 */
public without sharing class ZonePlotter {
    
  /*
   *  @method - getZones()
   *  @desc - Gets all the current Area_Zone__c records for the given park 
   */
  @AuraEnabled
  public static List<Area_Zone__c> getZones(String parkId) {
    List<Area_Zone__c> zones = new List<Area_Zone__c>();
    zones = [
      SELECT Id, Name, Categorisation__c, ClipPath__c
      FROM Area_Zone__c
      WHERE Park__c = :parkId
    ];
    return zones;
  }
    
  /*
   *  @method - updateZones()
   *  @desc - Upserts the given list of zones and deletes the other given list 
   *    of zones marked for deletion.
   *  @note - Handled seperately in case future logic 
   *    needs to update the related pitches for zones that have been deleted.
   */
  @AuraEnabled
  public static String updateZones(List<Area_Zone__c> zones, List<Area_Zone__c> deleted) {

    system.debug(zones);


    try {
      delete deleted;
      upsert zones;
      return 'Success';
    } catch(Exception e) {
      return 'Error: ' + e.getMessage();
    }
  }

}
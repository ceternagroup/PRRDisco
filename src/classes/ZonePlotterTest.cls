/*
 *  @class - ZonePlotterTest
 *  @desc - Test class for the ZonePlotter apex controller
 */
@IsTest
public class ZonePlotterTest {
    
  // create fake park
  private static Park__c createPark() {
    Park__c park = new Park__c();
    park.Name = 'Test';
    insert park;
    return park;      
  }
    
  // create fake zone
  private static Area_Zone__c createZone(String parkId, Integer uid) {
    Area_Zone__c zone = new Area_Zone__c();
    zone.Name = 'Zone ' + uid;
    zone.Park__c = parkId;
    insert zone;
    return zone;
  }
    
  // test that we get the correct zones for a given park
  @IsTest
  public static void testGetZones() {
    Park__c testPark = createPark();  
    createZone(testPark.Id, 1);
    Test.startTest();
      List<Area_Zone__c> zones = ZonePlotter.getZones(testPark.Id);
    Test.stopTest();
    // check zone list matches what we made
    System.assertEquals(1, zones.size());
  }
    
  // test we update / delete zones correctly
  @IsTest
  public static void testUpdateZones() {
    Park__c testPark = createPark();  
    Area_Zone__c testZone1 = createZone(testPark.Id, 1);
    Area_Zone__c testZone2 = createZone(testPark.Id, 2);
    List<Area_Zone__c> updates = new List<Area_Zone__c>();
    List<Area_Zone__c> deletes = new List<Area_Zone__c>();
    Test.startTest();
      testZone1.Name = 'Change Zone 1';
      updates.add(testZone1);
      deletes.add(testZone2);
      String result = ZonePlotter.updateZones(updates, deletes);
      String fail = ZonePlotter.updateZones(updates, deletes); // already deleted deletes
    Test.stopTest();
    System.assertEquals('Success', result);
    System.assertNotEquals('Success', fail);
  }
    

}
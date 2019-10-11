/**
 * Created by ronanwilliams on 2019-10-09.
 */

public with sharing class QuoteController {

    @AuraEnabled
    public static Object getQuotesApex(String recordId){

        Map<String,Object> responseMap = new Map<String,Object>();

        try {
            Opportunity opp             = [SELECT SBQQ__PrimaryQuote__c FROM Opportunity WHERE Id = :recordId];
            List<SBQQ__Quote__c> quotes = [SELECT Id, Name, SBQQ__Primary__c, SBQQ__NetAmount__c
                                            FROM SBQQ__Quote__c WHERE SBQQ__Opportunity2__c = :recordId
                                            ORDER BY CreatedDate];

            responseMap.put('apx__quotes',quotes);

            if (!quotes.isEmpty()){
                String activeId = opp.SBQQ__PrimaryQuote__c != null ?
                                  opp.SBQQ__PrimaryQuote__c : quotes[quotes.size() - 1].Id;
                responseMap.put('apx__activequote',activeId);
            }
        } catch (Exception e){
            responseMap.put('apx__error',e.getMessage());
        }

        return responseMap;

    }

    @AuraEnabled
    public static Object getQuoteDetailApex(String recordId){

        Map<String,Object> responseMap = new Map<String,Object>();

        try {

            List<SBQQ__QuoteLine__c> ancillaryLines      = new List<SBQQ__QuoteLine__c>();
            List<SBQQ__QuoteLine__c> pitchLines          = new List<SBQQ__QuoteLine__c>();
            List<SBQQ__QuoteLine__c> exceptionLines      = new List<SBQQ__QuoteLine__c>();
            Map<String,SBQQ__QuoteLine__c> unitStockMap  = new Map<String,SBQQ__QuoteLine__c>();

            SBQQ__Quote__c quote = [SELECT Id, Name,
                                        (SELECT Id, Name, SBQQ__NetPrice__c, SBQQ__NetTotal__c, SBQQ__Optional__c,
                                                SBQQ__Description__c, SBQQ__Product__c, SBQQ__Product__r.Family,
                                                SBQQ__Product__r.Name, StockItem__c, Pitch__c
                                        FROM SBQQ__LineItems__r
                                        WHERE SBQQ__Quote__c = :recordId)
                                    FROM SBQQ__Quote__c
                                    WHERE Id = :recordId];

            for (SBQQ__QuoteLine__c line : quote.SBQQ__LineItems__r){

                if (line.SBQQ__Product__r.Family == 'Ancillary'){
                    ancillaryLines.add(line);
                } else if (line.SBQQ__Product__r.Family == 'Pitch'){
                    pitchLines.add(line);
                } else if (line.SBQQ__Product__r.Family == 'Unit'){
                    unitStockMap.put(line.StockItem__c,line);
                } else {
                    exceptionLines.add(line);
                }
            }

            responseMap.put('apx__quote',quote);
            responseMap.put('apx__ancillary',ancillaryLines);
            responseMap.put('apx__unitstockmap',unitStockMap);
            responseMap.put('apx__pitch',pitchLines);
            responseMap.put('apx__exception',exceptionLines);
            responseMap.put('apx__stockitems',[SELECT Id, Name, Width__c, Make__c, Manufacturer__c,
                                                        Year_of_Manufacturer__c,
                                                        Berths__c, Bedrooms__c, Unit_Price__c,
                                                        (SELECT Id,Image_URL__c FROM Images__r)
                                                FROM StockItem__c
                                                WHERE Id IN :unitStockMap.keySet()]);

        } catch (Exception e){
            responseMap.put('apx__error',e.getMessage());
        }

        return responseMap;
    }


    @AuraEnabled
    public static Object createQuoteApex(String recordId){

        SBQQ__Quote__c newQuote = new SBQQ__Quote__c();
        newQuote.SBQQ__Opportunity2__c = recordId;
        newQuote.SBQQ__Primary__c      = true;

        insert newQuote;
        return null;

    }

    @AuraEnabled
    public static Object upsertUnitLineApex(String quoteId, String unitId, String quoteLineId){


        return null;
    }


    @AuraEnabled
    public static Object getUnitsApex(String recordId){

        return [SELECT Id, Name, Width__c, Make__c, Manufacturer__c, Year_of_Manufacturer__c,
                        Berths__c, Bedrooms__c, Unit_Price__c,
                    (SELECT Id,Image_URL__c FROM Images__r)
                FROM StockItem__c];

    }

    @AuraEnabled
    public static Object getPitcheAreasApex(String recordId){

        Opportunity opp = [SELECT Id, Park__c FROM Opportunity WHERE Id = :recordId];

        return [SELECT Id, Name,
                    (SELECT Id, Name, ClipPath__c FROM Areas_Zones__r)
                FROM Park__c WHERE Id = :opp.Park__c];

    }

}
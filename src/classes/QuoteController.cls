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

            Decimal unitTotal       = 0;
            Decimal pitchTotal      = 0;
            Decimal ancillaryTotal  = 0;

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
                    ancillaryTotal += line.SBQQ__NetTotal__c;
                } else if (line.SBQQ__Product__r.Family == 'Pitch'){
                    pitchLines.add(line);
                    pitchTotal += line.SBQQ__NetTotal__c;
                } else if (line.SBQQ__Product__r.Family == 'Unit'){
                    unitStockMap.put(line.StockItem__c,line);
                    if (!line.SBQQ__Optional__c) unitTotal += line.SBQQ__NetTotal__c;
                } else {
                    exceptionLines.add(line);
                }
            }

            responseMap.put('apx__quote',quote);
            responseMap.put('apx__unittotal',unitTotal);
            responseMap.put('apx__pitchtotal',pitchTotal);
            responseMap.put('apx__ancillarytotal',ancillaryTotal);
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

        Map<String,Object> responseMap = new Map<String,Object>();

        try {

            List<SBQQ__QuoteLine__c> lines  = [SELECT Id FROM SBQQ__QuoteLine__c
                                              WHERE SBQQ__Product__r.ProductCode = 'Caravan01'
                                              AND SBQQ__Quote__c = :quoteId];
            StockItem__c unit               = [SELECT Id, Name, Unit_Price__c FROM StockItem__c WHERE Id = :unitId];
            SBQQ__QuoteLine__c line         = new SBQQ__QuoteLine__c();
            line.SBQQ__Quote__c             = quoteId;
            line.Id                         = quoteLineId != '' ? quoteLineId : null;
            line.StockItem__c               = unit.Id;
            line.SBQQ__Quantity__c          = 1;
            line.SBQQ__Product__c           = [SELECT Id FROM Product2 WHERE ProductCode = 'Caravan01' LIMIT 1].Id;
            line.SBQQ__Optional__c          = !lines.isEmpty();
            line.SBQQ__Description__c       = unit.Name;
            line.SBQQ__NetPrice__c          = unit.Unit_Price__c;
            line.SBQQ__ListPrice__c         = unit.Unit_Price__c;
            line.SBQQ__CustomerPrice__c     = unit.Unit_Price__c;

            upsert line;

            responseMap.put('apx__line',line);
        } catch (Exception e){
            responseMap.put('apx__error',e.getMessage());
        }

        return responseMap;
    }

    @AuraEnabled
    public static Object deleteUnitLineApex(String quoteLineId){

        Map<String,Object> responseMap = new Map<String,Object>();

        try {
            delete [SELECT Id FROM SBQQ__QuoteLine__c WHERE Id = :quoteLineId];
            responseMap.put('apex__success',true);
        } catch (Exception e){
            responseMap.put('apx__error',e.getMessage());
        }

        return responseMap;

    }


    @AuraEnabled
    public static Object getUnitsApex(String recordId){

        Set<Id> unitIds = new Set<Id>();

        for (SBQQ__QuoteLine__c line : [SELECT Id, StockItem__c
                                        FROM SBQQ__QuoteLine__c
                                        WHERE SBQQ__Quote__c = :recordId
                                        AND StockItem__c != NULL
                                        AND SBQQ__Product__r.ProductCode = 'Caravan01']){
            unitIds.add(line.StockItem__c);
        }

        return [SELECT Id, Name, Width__c, Make__c, Manufacturer__c, Year_of_Manufacturer__c,
                        Berths__c, Bedrooms__c, Unit_Price__c,
                    (SELECT Id,Image_URL__c FROM Images__r),
                    (SELECT Id, SBQQ__Optional__c FROM Quote_Lines__r)
                FROM StockItem__c
                WHERE Id NOT IN :unitIds];

    }

    @AuraEnabled
    public static Object getPitcheAreasApex(String recordId){

        Opportunity opp = [SELECT Id, Park__c FROM Opportunity WHERE Id = :recordId];

        return [SELECT Id, Name,
                    (SELECT Id, Name, ClipPath__c FROM Areas_Zones__r)
                FROM Park__c WHERE Id = :opp.Park__c];

    }

}
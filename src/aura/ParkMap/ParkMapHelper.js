/**
 * Created by ronanwilliams on 2019-10-10.
 */

({

    getQuotes : function($C){
        var getQuotesApex = $C.get('c.getQuotesApex');
        getQuotesApex.setParams({ recordId : $C.get('v.recordId')});
        getQuotesApex.setCallback(this, function(response){
            var data = response.getReturnValue();
            if (response.getState() === 'SUCCESS' && !data.apx__error){
                $C.set('v.quotes',data.apx__quotes);
                if (data.apx__activequote) this.getQuoteDetail($C,data.apx__activequote);
            } else {
                this.showToast('Error!', "The controller returned: " + (data.apx__error ? data.apx__error : response.getState()) + ".");
            }
        });
        $A.enqueueAction(getQuotesApex);
    },
    getQuoteDetail : function($C,recordId){
        var getQuoteDetailApex = $C.get('c.getQuoteDetailApex');
        getQuoteDetailApex.setParams({ recordId : recordId});
        getQuoteDetailApex.setCallback(this, function(response){
            var data = response.getReturnValue();
            console.log('quote detail',data);
            if (response.getState() === 'SUCCESS' && !data.apx__error){
                $C.set('v.quote',data.apx__quote);
                $C.set('v.unittotal',data.apx__unittotal);
                $C.set('v.pitchtotal',data.apx__pitchtotal);
                $C.set('v.ancillarytotal',data.apx__ancillarytotal);

                if (data.apx__stockitems.length === 0){
                    $C.set('v.unitLines',[{Filled : false},{Filled : false},{Filled : false}]);
                } else {

                    for (var x = 0; x < 3; x++){
                        if (!data.apx__stockitems[x]){
                            data.apx__stockitems.push({Filled : false});
                        } else {
                            console.log('line not empty and assingning val of ', data.apx__unitstockmap[data.apx__stockitems[x].Id]);

                            data.apx__stockitems[x].Line = data.apx__unitstockmap[data.apx__stockitems[x].Id];
                            data.apx__stockitems[x].Filled = true;
                            if (data.apx__stockitems[x].Images__r) {
                                data.apx__stockitems[x].Images__r[0].Active = true;
                            } else {
                                data.apx__stockitems[x].Images__r = [];
                                data.apx__stockitems[x].Images__r.push({
                                    Active: true,
                                    Id: "none",
                                    Image_URL__c: "https://1m19tt3pztls474q6z46fnk9-wpengine.netdna-ssl.com/wp-content/themes/unbound/images/No-Image-Found-400x264.png",
                                    StockItem__c: "a2T4J000000f6lNUAQ"}
                                );
                            }
                        }
                    }

                    $C.set('v.unitLines',data.apx__stockitems);
                }

                if (data.apx__quote){
                    this.getUnits($C);
                }

            } else {
                this.showToast('Error!', "The controller returned: " + (data.apx__error ? data.apx__error : response.getState()) + ".");
            }
        });
        $A.enqueueAction(getQuoteDetailApex);
    },
    getUnits : function($C){
        var getUnitsApex = $C.get('c.getUnitsApex');
        getUnitsApex.setParams({ recordId : $C.get('v.quote.Id')});
        getUnitsApex.setCallback(this, function(response){
            if (response.getState() === 'SUCCESS'){
                console.log('response',response.getReturnValue());

                var units = response.getReturnValue();
                units.forEach(function(unit){
                    if (unit.Images__r){
                        unit.Images__r[0].Active = true;
                    } else {
                        unit.Images__r = [];
                        unit.Images__r.push({
                            Active: true,
                            Id: "none",
                            Image_URL__c: "https://1m19tt3pztls474q6z46fnk9-wpengine.netdna-ssl.com/wp-content/themes/unbound/images/No-Image-Found-400x264.png",
                            StockItem__c: "a2T4J000000f6lNUAQ"}
                        );
                    }
                });

                $C.set('v.units',units);
            }
        });
        $A.enqueueAction(getUnitsApex);
    },
    resetUnitFilter : function($C){

        $C.set('v.unitFilter',{
            Price : '',
            Type : '',
            Bedrooms : '',
            Year : '',
            Berths : '',
            Status : '',
            Width : '',
            Length : ''
        });
    },
    showToast : function(title, message){
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message
        });
        toastEvent.fire();
    }

});
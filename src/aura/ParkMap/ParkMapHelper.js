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

                if (data.apx__stockitems.length === 0){
                    $C.set('v.unitLines',[{Filled : false},{Filled : false},{Filled : false}]);
                } else {
                    data.apx__stockitems.forEach(function(stock){
                        stock.Line      = data.apx__unitstockmap[stock.Id];
                        stock.Filled    = true;
                    });
                    $C.set('v.unitLines',data.apx__stockitems);
                }
                console.log('changed data',data);

            } else {
                this.showToast('Error!', "The controller returned: " + (data.apx__error ? data.apx__error : response.getState()) + ".");
            }
        });
        $A.enqueueAction(getQuoteDetailApex);
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
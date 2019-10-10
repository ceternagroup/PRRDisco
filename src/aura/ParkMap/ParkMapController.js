/**
 * Created by ronanwilliams on 2019-10-08.
 */

({

    doInit : function($C,$E,$H){

        var getUnitsApex = $C.get('c.getUnitsApex');
        getUnitsApex.setParams({ recordId : $C.get('v.recordId')});
        getUnitsApex.setCallback(this, function(response){
           if (response.getState() === 'SUCCESS'){

               console.log('response',response.getReturnValue());

               $C.set('v.units',response.getReturnValue());
           }
        });
        $A.enqueueAction(getUnitsApex);

        console.log('clicked');
    }

});
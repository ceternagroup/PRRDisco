/**
 * Created by ronanwilliams on 2019-10-18.
 */

({
    doInit : function($C,$E,$H){
        var getStuff = $C.get('c.getSomeContent');
        getStuff.setCallback(this, function(response){

            console.log(response.getState(),response.getReturnValue());

            if (response.getState() === 'SUCCESS'){
                $C.set('v.stuff',response.getReturnValue());
            }
        });
        $A.enqueueAction(getStuff);


    }


});
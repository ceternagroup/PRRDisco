/**
 * Created by ronanwilliams on 2019-10-08.
 */

({

    doInit : function($C,$E,$H){

        $H.resetUnitFilter($C);
        $H.getQuotes($C);

        var getUnitsApex = $C.get('c.getUnitsApex');
        getUnitsApex.setParams({ recordId : $C.get('v.recordId')});
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

        var getPitcheAreasApex = $C.get('c.getPitcheAreasApex');
        getPitcheAreasApex.setParams({ recordId : $C.get('v.recordId')});
        getPitcheAreasApex.setCallback(this, function(response){
            if (response.getState() === 'SUCCESS'){
                var park = response.getReturnValue()[0];
                $C.set('v.park',park.Name);
                $C.set('v.areas',park.Areas_Zones__r);

            }
        });
        $A.enqueueAction(getPitcheAreasApex);

    },
    createQuote : function($C,$E,$H) {

        $C.set('v.responsePending',true);
        var createQuoteApex = $C.get('c.createQuoteApex');
        createQuoteApex.setParams({ recordId : $C.get('v.recordId')});
        createQuoteApex.setCallback(this, function(response){
            $C.set('v.responsePending',false);
            if (response.getState() === 'SUCCESS'){
                $H.getQuotes($C);
            }
        });
        $A.enqueueAction(createQuoteApex);
    },
    setSelectedArea : function($C,$E,$H){
        var sourceData = $E.currentTarget.dataset;
        $C.set('v.selectedArea',$C.get('v.areas')[sourceData.index]);
        $C.set('v.selectingArea',false);
    },
    setSelectingArea : function($C,$E,$H){
        $C.set('v.selectingArea',true);
    },
    setSelectingUnitLine : function($C,$E,$H) {
        var sourceData = $E.currentTarget.dataset;
        $C.set('v.selectingUnitLine', parseInt(sourceData.unitnumber));
        $C.set('v.unitSearch',false);
        $C.set('v.checkedUnit','');
        console.log('unit line selected is ', sourceData.unitnumber);
    },
    showUnitSearch : function($C,$E,$H){
        $C.set('v.unitSearch',true);
    },
    searchUnits : function($C,$E,$H){
        var search = $C.get('v.unitFilter');
        var placeHolders = [];

        Object.keys(search).forEach(function(key){
            if (search[key]) placeHolders.push(key + ': ' + search[key]);
        });
        $C.find('unitSearch').getElement().placeholder = placeHolders.join('  |  ');
    },
    toggleIndex : function($C,$E,$H){
        var sourceData  = $E.currentTarget.dataset;
        var units       = $C.get('v.units');

        if (sourceData.imgindex){
            for (var x = 0; x < units[sourceData.unit].Images__r.length; x++){
                units[sourceData.unit].Images__r[x].Active = x === parseInt(sourceData.imgindex);
            }
        } else if (sourceData.direction){
            var activeIndex = 0;
            for (var x = 0; x < units[sourceData.unit].Images__r.length; x++){
                if (units[sourceData.unit].Images__r[x].Active) {
                    if (sourceData.direction === 'up' && x < units[sourceData.unit].Images__r.length){
                        activeIndex = x + 1;
                        units[sourceData.unit].Images__r[x].Active = false;
                    } else if (sourceData.direction === 'down' && x > 0){
                        activeIndex = x -1;
                        units[sourceData.unit].Images__r[x].Active = false;
                    }
                }
            }
            units[sourceData.unit].Images__r[activeIndex].Active = true;
        }

        $C.set('v.units',units);
    },
    selectUnit : function($C,$E,$H){
        var sourceData  = $E.currentTarget.dataset;
        $C.set('v.selectedUnit',sourceData.unitid);
    },
    checkUnit : function($C,$E,$H){
        var sourceData  = $E.currentTarget.dataset;
        $C.set('v.checkedUnit',sourceData.unitid);

        var units       = $C.get('v.units');
        var unit        = units[parseInt(sourceData.index)];

        var unitLines   = $C.get('v.unitLines');
        var selectingUnitLine = $C.get('v.selectingUnitLine');

        console.log('selecting unit',selectingUnitLine);

        unit.Filled = true;
        unitLines[selectingUnitLine -1] = unit;


        $C.set('v.unitLines',unitLines);

        console.log('unit',unit);

    }

});
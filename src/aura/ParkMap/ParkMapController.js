/**
 * Created by ronanwilliams on 2019-10-08.
 */

({

    doInit : function($C,$E,$H){

        $H.resetUnitFilter($C);
        $H.getQuotes($C);

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
        $C.set('v.selectingUnitLineId', sourceData.lineid);
        $C.set('v.unitSearch',false);


        // todo: need to set value of checked unit IF there is a unit checked
        $C.set('v.checkedUnit','');
        console.log('unit line selected is ', sourceData.unitnumber);
    },
    clearSelectingUnitLine : function($C,$E,$H) {
        // $C.set('v.selectingUnitLine', '');
        // $C.set('v.unitSearch',false);
        // $C.set('v.checkedUnit','');
    },
    showUnitSearch : function($C,$E,$H){
        $C.set('v.unitSearch',true);
    },
    closeModal : function($C,$E,$H){
        $C.set('v.unitSearch',false);
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

        var units               = $C.get('v.units');
        var unit                = units[parseInt(sourceData.index)];
        var unitLines           = $C.get('v.unitLines');
        var selectingUnitLine   = $C.get('v.selectingUnitLine');

        unitLines[selectingUnitLine - 1].Pending = true;
        $C.set('v.unitLines',unitLines);
        $C.set('v.unitSearch',false);


        var upsertUnitLineApex = $C.get('c.upsertUnitLineApex');
        upsertUnitLineApex.setParams({
            quoteId : $C.get('v.quote.Id'),
            unitId : unit.Id,
            quoteLineId : unitLines[selectingUnitLine - 1].Line ? unitLines[selectingUnitLine - 1].Line.Id : ''
        });
        upsertUnitLineApex.setCallback(this, function (response) {

            var data = response.getReturnValue();

            if (response.getState() === 'SUCCESS' && !data.apx__error){
                $H.getQuoteDetail($C,$C.get('v.quote.Id'));
            }

        });
        $A.enqueueAction(upsertUnitLineApex);


    },
    deleteUnitLine : function($C,$E,$H){

        var sourceData  = $E.currentTarget.dataset;
        $E.stopPropagation();

        var unitLines           = $C.get('v.unitLines');
        var selectingUnitLine   = $C.get('v.selectingUnitLine');

        unitLines[selectingUnitLine - 1].Pending = true;
        $C.set('v.unitLines',unitLines);
        $C.set('v.unitSearch',false);

        var deleteUnitLineApex = $C.get('c.deleteUnitLineApex');
        deleteUnitLineApex.setParams({quoteLineId : sourceData.lineid});
        deleteUnitLineApex.setCallback(this, function (response) {
            var data = response.getReturnValue();
            if (response.getState() === 'SUCCESS' && !data.apx__error){
                $H.getQuoteDetail($C,$C.get('v.quote.Id'));
            }
        });
        $A.enqueueAction(deleteUnitLineApex);
    }

});
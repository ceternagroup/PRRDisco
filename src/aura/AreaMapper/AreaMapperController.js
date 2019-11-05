/**
 * Created by ronanwilliams on 2019-10-16.
 */

({

    doInit : function($C,$E,$H) {

        var getAreasApex = $C.get('c.getAreasApex');
        getAreasApex.setParams({recordId: $C.get('v.recordId')});
        getAreasApex.setCallback(this, function (response) {
            if (response.getState() === 'SUCCESS') {

                var areas = response.getReturnValue();
                areas.forEach(function(area){

                    var plotDimensions = area.ClipPath__c.split(',');
                    var plotPoints = [];

                    for (var x = 0; x < plotDimensions.length; x++){
                        var size = plotDimensions[x].split(' ').length;
                        // plotDimensions[x] = 'left:' + plotDimensions[x].split(' ')[size === 3 ? 1 : 0] +
                        //     ';top:' + plotDimensions[x].split(' ')[size === 3 ? 2 : 1] + ';';

                        plotPoints[x] = [];
                        plotPoints[x].push(plotDimensions[x].split(' ')[size === 3 ? 1 : 0]);
                        plotPoints[x].push(plotDimensions[x].split(' ')[size === 3 ? 2 : 1]);

                        console.log('dimension: ',plotDimensions[x]);
                    }
                    // area.Plots =  plotDimensions;//.split(' ');
                    area.Plots =  plotPoints;//.split(' ');
                });

                $C.set('v.areas', areas);
            }
        });
        $A.enqueueAction(getAreasApex);
    },
    handleDrag : function($C,$E,$H){
        var width       = $E.currentTarget.parentNode.getBoundingClientRect().right - $E.currentTarget.parentNode.getBoundingClientRect().left;
        var height      = $E.currentTarget.parentNode.getBoundingClientRect().bottom - $E.currentTarget.parentNode.getBoundingClientRect().top;
        var offsetLeft  = $E.currentTarget.parentNode.getBoundingClientRect().x;
        var offsetTop   = $E.currentTarget.parentNode.getBoundingClientRect().y;

        if (((($E.clientX - offsetLeft) / width) * 100) > 0){
            var data        = $E.currentTarget.dataset;
            var areas       = $C.get('v.areas');

            areas[data.areaindex].Plots[data.index] = [((($E.clientX - offsetLeft) / width) * 100).toFixed(2) + '%',
                ((($E.clientY - offsetTop) / height) * 100).toFixed(2) + '%'];

            areas[data.areaindex].ClipPath__c = '';

            for (var x = 0; x < areas[data.areaindex].Plots.length; x ++){
                areas[data.areaindex].ClipPath__c +=
                    areas[data.areaindex].Plots[x][0] + ' ' + areas[data.areaindex].Plots[x][1] +
                    (x < (areas[data.areaindex].Plots.length - 1) ? ', ' : '');
            }

            $C.set('v.areas',areas);

        }

    },
    startAreaDrag : function($C,$E,$H) {
        var width       = $E.currentTarget.parentNode.getBoundingClientRect().right - $E.currentTarget.parentNode.getBoundingClientRect().left;
        var height      = $E.currentTarget.parentNode.getBoundingClientRect().bottom - $E.currentTarget.parentNode.getBoundingClientRect().top;
        var offsetLeft  = $E.currentTarget.parentNode.getBoundingClientRect().x;
        var offsetTop   = $E.currentTarget.parentNode.getBoundingClientRect().y;

        $C.set('v.dragLeftStart',((($E.clientX - offsetLeft) / width) * 100).toFixed(2));
        $C.set('v.dragTopStart',((($E.clientY - offsetTop) / height) * 100).toFixed(2));

        // console.log('dragLeftStart',((($E.clientX - offsetLeft) / width) * 100).toFixed(2));
        // console.log('dragTopStart',((($E.clientY - offsetTop) / height) * 100).toFixed(2));


    },

    handleAreaDrag : function($C,$E,$H){

        var width       = $E.currentTarget.parentNode.getBoundingClientRect().right - $E.currentTarget.parentNode.getBoundingClientRect().left;
        var height      = $E.currentTarget.parentNode.getBoundingClientRect().bottom - $E.currentTarget.parentNode.getBoundingClientRect().top;
        var offsetLeft  = $E.currentTarget.parentNode.getBoundingClientRect().x;
        var offsetTop   = $E.currentTarget.parentNode.getBoundingClientRect().y;

        var movedLeft   = (((($E.clientX - offsetLeft) / width) * 100) - $C.get('v.dragLeftStart')).toFixed(2);
        var movedup     = ($C.get('v.dragTopStart') - ((($E.clientY - offsetTop) / height) * 100)).toFixed(2);

        console.log('moved horizontal by',(((($E.clientX - offsetLeft) / width) * 100) - $C.get('v.dragLeftStart')).toFixed(2));
        console.log('moved vertical by',($C.get('v.dragTopStart') - ((($E.clientY - offsetTop) / height) * 100)).toFixed(2));


        var data        = $E.currentTarget.dataset;
        var areas       = $C.get('v.areas');

        areas[data.areaindex].Plots[data.index] = [((($E.clientX - offsetLeft) / width) * 100).toFixed(2) + '%',
            ((($E.clientY - offsetTop) / height) * 100).toFixed(2) + '%'];

        areas[data.areaindex].ClipPath__c = '';

        for (var x = 0; x < areas[data.areaindex].Plots.length; x ++){


            console.log('1 orig',(parseInt(areas[data.areaindex].Plots[x][0])));
            console.log('2 orig',(parseInt(areas[data.areaindex].Plots[x][1])));

            console.log('1 new',movedLeft);
            console.log('2 new',movedup);


            console.log('1',(parseInt(areas[data.areaindex].Plots[x][0]) - parseInt(movedLeft)) + '%');
            console.log('2',(parseInt(areas[data.areaindex].Plots[x][1]) + parseInt(movedup)) + '%');

            var left = (parseInt(areas[data.areaindex].Plots[x][0]) + parseInt(movedLeft));
            var top = (parseInt(areas[data.areaindex].Plots[x][1]) - parseInt(movedup));

            areas[data.areaindex].Plots[x][0] = (left < 0 ? 0 : left > 100 ? 100 : left) + '%';
            areas[data.areaindex].Plots[x][1] = (top < 0 ? 0 : top > 100 ? 100 :  top) + '%';




            areas[data.areaindex].ClipPath__c +=
                areas[data.areaindex].Plots[x][0] + ' ' + areas[data.areaindex].Plots[x][1] +
                (x < (areas[data.areaindex].Plots.length - 1) ? ', ' : '');
        }

        $C.set('v.areas',areas);

        // var data        = $E.currentTarget.dataset;
        // var areas       = $C.get('v.areas');
        //
        // areas[data.areaindex].Plots[data.index] = [((($E.clientX - offsetLeft) / width) * 100).toFixed(2) + '%',
        //     ((($E.clientY - offsetTop) / height) * 100).toFixed(2) + '%'];
        //
        // areas[data.areaindex].ClipPath__c = '';
        //
        // for (var x = 0; x < areas[data.areaindex].Plots.length; x ++){
        //     areas[data.areaindex].ClipPath__c +=
        //         areas[data.areaindex].Plots[x][0] + ' ' + areas[data.areaindex].Plots[x][1] +
        //         (x < (areas[data.areaindex].Plots.length - 1) ? ', ' : '');
        // }
        //
        // $C.set('v.areas',areas);


    }

});
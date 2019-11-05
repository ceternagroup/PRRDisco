({

  // get any existing zones and draw them to the canvas
  setupCanvas: function($C, $E, $H) {
    var params = {
      parkId: $C.get('v.recordId')
    };

    console.log('park id',$C.get('v.recordId'));

    $H.serverAction($C, 'c.getZones', params, function(err, res) {
      if (err) return console.error(err);
      var data = $H.mapSFtoJS($H, res);
      console.log('server data',data);
      $C.set('v.zones', data);
      $H.updateZones($C, $H, null);
    });
  },
    
  // set the user to plotting mode
  addZone: function($C, $E, $H) {
    $C.set('v.plotting', true);
  },
    
  // save the zones the user has created, plus any they deleted
  saveZones: function($C, $E, $H) {
    $C.set('v.loading', true);
    var parkId = $C.get('v.recordId');
    var zones = $H.mapJStoSF($C.get('v.zones'), parkId);
    var deleted = $H.mapJStoSF($C.get('v.deleted'), parkId);
    var params = {
      zones: zones,
      deleted: deleted
    };

    console.log('server action params', params.zones[0].Park__c);
    $H.serverAction($C, 'c.updateZones', params, function(err, res) {
      if (err) return console.error(err);
      $C.set('v.deleted', []);
      $C.set('v.loading', false);
    });
    
  },
    
  // remove a zone from the main list into the deleted list
  removeZone: function($C, $E, $H) {
    var index = $E.getSource().get("v.name");
    var zones = $C.get('v.zones');
    var remove = zones.splice(index, 1)[0];
    if (remove.id != null) {
      var deleted = $C.get('v.deleted');
      deleted.push(remove);
      $C.set('v.deleted', deleted);
    }
    $C.set('v.zones', zones);
    $H.updateZones($C, $H, null);
  },
    
  // plot a new point for a zone
  plotZone: function($C, $E, $H) {
    // need the boundary to get correct offset of mouse x + y
    var boundary = $C.find('zp').getElement().getBoundingClientRect();
    if ($C.get('v.plotting') === true) { // only if plotting mode
      var points = $C.get('v.points');
      var first = points[0];
      var next = {
        x: $E.clientX - boundary.x,
        y: $E.clientY - boundary.y
      };
      points.push(next);
      $C.set('v.points', points);
      $H.updateZones($C, $H, points);
      // auto complete if within 10 pixels of first point
      if (first) {
        var firstXMin = first.x - 10;
        var firstXMax = first.x + 10;
        var firstYMin = first.y - 10;
        var firstYMax = first.y + 10;
        console.log(first.x, first.y, next.x, next.y);
        if (next.x <= firstXMax && next.x >= firstXMin &&
          next.y <= firstYMax && next.y >= firstYMin) {
          $H.saveZone($C, $E, $H);
        }
      }
    }
  }
    
})
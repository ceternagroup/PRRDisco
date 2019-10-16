({
    
  // run generic server action
  serverAction: function($C, name, params, callback) {
    var action = $C.get(name);
    action.setParams(params); 
    action.setCallback(this, function(response) {
      var state = response.getState();
      if (state == 'SUCCESS') {
        var res = response.getReturnValue();
        if (res.indexOf('Error: ') != -1) return callback(res, null);
        return callback(null, response.getReturnValue());
      } else {
        return callback(response.getError(), null);
      }
    });
    $A.enqueueAction(action);
  },
    
  // turn the component js object into a sf area object
  mapJStoSF: function(records, parkId) {
    return records.map(function(r) {
      var path = r.points.map(function(p) {
  		return p.x + ' ' + p.y; 
      }).join(', ');
      return {
        Id: r.id,
        Park__c: parkId,
        Name: r.name,
        Categorisation__c: r.type,
        ClipPath__c: path
      }
    });
  },
    
  // turn a sf area object into a component js object
  mapSFtoJS: function($H, records) {
    return records.map(function(r) {
      var path = r.ClipPath__c == null ? [] : r.ClipPath__c.split(', ');
      path = path.map(function(p) {
        return {
          x: p.split(' ')[0],
          y: p.split(' ')[1]
        } 
      });
      return {
        id: r.Id,
        name: r.Name,
        type: r.Categorisation__c,
        points: path
      }    
    });
  },
    
  // update the canvas zone renders
  updateZones: function($C, $H, points) {
    var canvas = $C.find('zp-canvas').getElement();
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(0, 0, 0, 0.2)';
    if (points) $H.updateZone(context, points, false);
    var zones = $C.get('v.zones');
    zones.forEach(function(z) {
        console.log('rendering ' + z.name + ':', z.points);
      $H.updateZone(context, z.points, true);
    });
    $C.set('v.loading', false);
  },
    
  // draw a given zone's points
  updateZone: function(context, points, zone) {
    if (points.length > 0) {
      context.beginPath();
      console.log(points, zone);
      context.fillStyle = 'rgba(0, 0, 0, 0.2)';
      context.stokeStyle = 'rgb(0, 0, 0)';
      context.arc(points[0].x, points[0].y, 1, 0, 2 * Math.PI);
      context.moveTo(points[0].x, points[0].y);
      for (var a = 1; a < points.length; a++) {
        context.lineTo(points[a].x, points[a].y);  
        context.arc(points[a].x, points[a].y, 1, 0, 2 * Math.PI);  
      }
      context.stroke();
      if (zone == true) context.fill();
    }
  },
    
  // 'save' a zone to the main list when finished plotting
  saveZone: function($C, $E, $H) {
    var zones = $C.get('v.zones');
    $C.set('v.plotting', false); 
    var zone = {
      id: null,
      name: 'Zone',
      type: 'Standard',
      points: JSON.parse(JSON.stringify($C.get('v.points')))
    }
    zones.push(zone);
    $C.set('v.zones', zones);
    $C.set('v.points', []);
    $H.updateZones($C, $H, null);
  }
    
})
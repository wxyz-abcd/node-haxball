module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Library.prototype);
  Library.call(this, "aimbot", { // "aimbot" is library's name. Every library should have a unique name.
    version: 0.1,
    author: "abc",
    description: `An aimbot`
  });

  this.defineVariable({
    name: "active",
    description: "Aimbot is active?",
    type: VariableType.Boolean,
    value: false
  });
  
  this.defineVariable({
    name: "minDistToBall",
    description: "Minimum distance to show aimbot line",
    type: VariableType.Number,
    value: 25
  });
  
  this.defineVariable({
    name: "distThreshold",
    description: "Aimbot may trace rays until this distance is reached",
    type: VariableType.Number,
    value: 600
  });
  
  this.defineVariable({
    name: "maxIter",
    description: "Aimbot may trace rays until this iteration count is reached",
    type: VariableType.Number,
    value: 1000
  });
  
  this.defineVariable({
    name: "color",
    description: "Color of aimbot's line (in css format)",
    type: VariableType.String,
    value: "rgba(255,255,255,0.35)"
  });

  var thisLibrary = this;
  
  function onSegment(a, b, x, y){
    var segmentLengthSqr = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
    var r = ((x - a.x) * (b.x - a.x) + (y - a.y) * (b.y - a.y)) / segmentLengthSqr;
    if (r<0 || r>1) return false;
    var sl = ((a.y - y) * (b.x - a.x) - (a.x - x) * (b.y - a.y)) / Math.sqrt(segmentLengthSqr);
    return Math.abs(sl) <= 0.00000001;
  }
  
  function inteceptCircleLineSeg(circle, line){
    var b, c, d, u1, u2, ret, v1, v2;
    var v1 = {
      x: line.p2.x - line.p1.x,
      y: line.p2.y - line.p1.y
    };
    var v2 = {
      x: line.p1.x - circle.Xd.x,
      y: line.p1.y - circle.Xd.y
    };
    b = (v1.x * v2.x + v1.y * v2.y);
    c = 2 * (v1.x * v1.x + v1.y * v1.y);
    b *= -2;
    d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.Yj * circle.Yj));
    if(isNaN(d)) // no intercept
      return;
    u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
    u2 = (b + d) / c; 
    if (u1<0 && u2<0)
      return;
    ret = []; // return array
    //if(u1 <= 1 && u1 >= 0){  // add point if on the line segment
    if (u1>0)
      ret.push({
        x: line.p1.x + v1.x * u1,
        y: line.p1.y + v1.y * u1
      });
    //}
    //if(u2 <= 1 && u2 >= 0){  // second add point if on the line segment
    if (u2>0)
      ret.push({
        x: line.p1.x + v1.x * u2,
        y: line.p1.y + v1.y * u2
      });
    //}
    return ret;
  }

  this.calculateAndDraw = function(followDisc, mapObjects, ctx){
    if (!thisLibrary.active)
      return;
    var ball = mapObjects.F[0];
    if (ball && followDisc){
      var coord = ball.a, baseCoord = followDisc.a, remainingDist = thisLibrary.distThreshold;
      var xb = coord.x, yb = coord.y;
      var dx = xb-baseCoord.x, dy = yb-baseCoord.y, dd = Math.sqrt(dx*dx+dy*dy);
      if (dd<ball.radius+followDisc.radius+thisLibrary.minDistToBall){
        var iter = 0;
        while(remainingDist>0 && iter<thisLibrary.maxIter){
          dx/=dd, dy/=dd;
          var f = null, coll = null, N = null, minSqrDist = Infinity;
          for (var i = 0, e = mapObjects.U; i < e.length; i++)
            if (((f = e[i]), 0 != (f.h & ball.v) && 0 != (f.v & ball.h))) {
              if (0*f.vb!=0){ // line
                var Ua = f.wa.x*f.W.a.x+f.wa.y*f.W.a.y;
                var k = (Ua-f.wa.y*yb-f.wa.x*xb)/(f.wa.y*dy+f.wa.x*dx);
                if (k>0){
                  var x = xb+k*dx, y = yb+k*dy;
                  if (onSegment(f.W.a, f.ca.a, x, y)){
                    var p = {x:x,y:y};
                    var sqrDist = (p.x-xb)*(p.x-xb)+(p.y-yb)*(p.y-yb);
                    if (sqrDist<minSqrDist){
                      coll = p;
                      minSqrDist = sqrDist;
                      N = f.wa;
                    }
                  }
                }
              }
              else{ // arc
                var pts = inteceptCircleLineSeg(f, {p1: baseCoord, p2: coord});
                if (pts){
                  var pos1 = f.W.a, pos2 = f.ca.a, center = f.Xd;
                  var a1 = Math.atan2(pos1.y-center.y, pos1.x-center.x)*180/Math.PI;
                  if (a1<0)
                    a1+=360;
                  var a2 = Math.atan2(pos2.y-center.y, pos2.x-center.x)*180/Math.PI;
                  if (a2<=0)
                    a2+=360;
                  pts.forEach((p)=>{
                    var a = Math.atan2(p.y-center.y, p.x-center.x)*180/Math.PI;
                    if (a<0)
                      a+=360;
                    if (a1<=a && a<=a2){
                      var sqrDist = (p.x-xb)*(p.x-xb)+(p.y-yb)*(p.y-yb);
                      if (sqrDist<minSqrDist){
                        coll = p;
                        minSqrDist = sqrDist;
                        // let's calculate the normal for this point:
                        var xd = p.x-center.x, yd = p.y-center.y, dist = Math.sqrt(xd*xd+yd*yd);
                        N = {
                          x: xd/dist,
                          y: yd/dist
                        };
                      }
                    }
                  });
                }
              }
            }
          for (var i = 0, e = mapObjects.qa; i < e.length; i++)
            if (((f = e[i]), 0 != (f.h & ball.v) && 0 != (f.v & ball.h))) {
              /*
              plane: px+qy=r (p = f.wa.x, q = f.wa.y, r = f.Ua)
              ray: direction: c, s; point: x', y' (c = dx, s = dy, x' = xb, y' = yb)

              y=y'+k.s
              x=x'+k.c
              p(y'+k.s)+q(x'+k.c)=r
              p.y'+k.p.s+q.x'+k.q.c=r
              k=(r-p.y'-q.x')/(p.s+q.c)
              */

              var k = (f.Ua-f.wa.y*yb-f.wa.x*xb)/(f.wa.y*dy+f.wa.x*dx);
              if (k>0){
                var p = {
                  x: xb+k*dx, 
                  y: yb+k*dy
                };
                var sqrDist = (p.x-xb)*(p.x-xb)+(p.y-yb)*(p.y-yb);
                if (sqrDist<minSqrDist){
                  coll = p;
                  minSqrDist = sqrDist;
                  N = f.wa;
                }
              }
            }
          if (coll){
            ctx.save();
            ctx.strokeStyle = thisLibrary.color;
            ctx.beginPath();
            ctx.moveTo(xb, yb);
            ctx.lineTo(coll.x, coll.y);
            ctx.stroke();
            ctx.restore();
            
            remainingDist -= Math.sqrt(minSqrDist);
            if (remainingDist<=0)
              break;

            // R: (dx, dy), N: N, reflection vector = R-2(R.N)N
            var coeff = 2*(dx*N.x+dy*N.y), dx2 = dx-coeff*N.x, dy2 = dy-coeff*N.y;
            coord = {
              x: coll.x+dx2*0.0001,
              y: coll.y+dy2*0.0001,
            };
            baseCoord = coll;
            xb = coord.x;
            yb = coord.y;
            dx = xb-baseCoord.x;
            dy = yb-baseCoord.y;
            dd = Math.sqrt(dx*dx+dy*dy);
          }
          else
            break;
          iter++;
        }
      }
    }
  };
};

module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Library.prototype);
  Library.call(this, "aimbot", { // "aimbot" is library's name. Every library should have a unique name.
    version: 0.3,
    author: "abc",
    description: `An aimbot`
  });

  this.defineVariable({
    name: "mode",
    description: "Aimbot mode (0: off, 1: default, 2: advanced)",
    type: VariableType.Integer,
    value: 0,
    range: {
      min: 0,
      max: 2,
      step: 1
    }
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

  this.defineVariable({
    name: "followPlayerId",
    description: "Id of the player that the aimbot will follow (if >=0)", 
    type: VariableType.PlayerId,
    value: -1
  });
  
  this.defineVariable({
    name: "advancedVirtualKick",
    description: "Whether virtually kicking the ball is enabled",
    type: VariableType.Boolean,
    value: true
  });
  
  this.defineVariable({
    name: "advancedEngineFrameNum",
    description: "Number of frames to run the physics engine",
    type: VariableType.Integer,
    value: 100,
    range: {
      min: 1,
      max: 1000,
      step: 1
    }
  });

  var thisLibrary = this;
  
  function onSegment(a, b, x, y){
    var segmentLengthSqr = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
    var r = ((x - a.x) * (b.x - a.x) + (y - a.y) * (b.y - a.y)) / segmentLengthSqr;
    if (r<0 || r>1) return false;
    var sl = ((a.y - y) * (b.x - a.x) - (a.x - x) * (b.y - a.y)) / Math.sqrt(segmentLengthSqr);
    return Math.abs(sl) <= 0.00000001;
  }
  
  function interceptCircleLineSeg(circle, line){
    var b, c, d, u1, u2, ret, v1, v2;
    var v1 = {
      x: line.p2.x - line.p1.x,
      y: line.p2.y - line.p1.y
    };
    var v2 = {
      x: line.p1.x - circle.arcCenter.x,
      y: line.p1.y - circle.arcCenter.y
    };
    b = (v1.x * v2.x + v1.y * v2.y);
    c = 2 * (v1.x * v1.x + v1.y * v1.y);
    b *= -2;
    d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.arcRadius * circle.arcRadius));
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

  this.calculateAndDraw = function(followDisc, gameState, ctx){
    if (!thisLibrary.mode)
      return;
    if (thisLibrary.mode==1){
      var mapObjects = gameState.physicsState;
      var ball = mapObjects.discs[0], fpId = thisLibrary.followPlayerId;
      if (fpId>=0){
        var d = thisLibrary.room.players.find((x)=>x.id==fpId)?.disc;
        d && (followDisc = d);
      }
      if (ball && followDisc){
        var coord = ball.pos, baseCoord = followDisc.pos, remainingDist = thisLibrary.distThreshold;
        var xb = coord.x, yb = coord.y;
        var dx = xb-baseCoord.x, dy = yb-baseCoord.y, dd = Math.sqrt(dx*dx+dy*dy);
        if (dd<ball.radius+followDisc.radius+thisLibrary.minDistToBall){
          var iter = 0;
          while(remainingDist>0 && iter<thisLibrary.maxIter){
            dx/=dd, dy/=dd;
            var f = null, coll = null, N = null, minSqrDist = Infinity;
            for (var i = 0, e = mapObjects.segments; i < e.length; i++)
              if (((f = e[i]), 0 != (f.cMask & ball.cGroup) && 0 != (f.cGroup & ball.cMask))) {
                if (0*f.curveF!=0){ // line
                  var Ua = f.normal.x*f.v0.pos.x+f.normal.y*f.v0.pos.y;
                  var k = (Ua-f.normal.y*yb-f.normal.x*xb)/(f.normal.y*dy+f.normal.x*dx);
                  if (k>0){
                    var x = xb+k*dx, y = yb+k*dy;
                    if (onSegment(f.v0.pos, f.v1.pos, x, y)){
                      var p = {x:x,y:y};
                      var sqrDist = (p.x-xb)*(p.x-xb)+(p.y-yb)*(p.y-yb);
                      if (sqrDist<minSqrDist){
                        coll = p;
                        minSqrDist = sqrDist;
                        N = f.normal;
                      }
                    }
                  }
                }
                else{ // arc
                  var pts = interceptCircleLineSeg(f, {p1: baseCoord, p2: coord});
                  if (pts){
                    var pos1 = f.v0.pos, pos2 = f.v1.pos, center = f.arcCenter;
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
            for (var i = 0, e = mapObjects.planes; i < e.length; i++)
              if (((f = e[i]), 0 != (f.cMask & ball.cGroup) && 0 != (f.cGroup & ball.cMask))) {
                /*
                plane: px+qy=r (p = f.normal.x, q = f.normal.y, r = f.dist)
                ray: direction: c, s; point: x', y' (c = dx, s = dy, x' = xb, y' = yb)
  
                y=y'+k.s
                x=x'+k.c
                p(y'+k.s)+q(x'+k.c)=r
                p.y'+k.p.s+q.x'+k.q.c=r
                k=(r-p.y'-q.x')/(p.s+q.c)
                */
  
                var k = (f.dist-f.normal.y*yb-f.normal.x*xb)/(f.normal.y*dy+f.normal.x*dx);
                if (k>0){
                  var p = {
                    x: xb+k*dx, 
                    y: yb+k*dy
                  };
                  var sqrDist = (p.x-xb)*(p.x-xb)+(p.y-yb)*(p.y-yb);
                  if (sqrDist<minSqrDist){
                    coll = p;
                    minSqrDist = sqrDist;
                    N = f.normal;
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
    }
    else{
      var ball = gameState.physicsState.discs[0], fpId = thisLibrary.followPlayerId;
      if (!ball || !(fpId>=0))
        return;
      var newState = gameState.copy(); // gameState.sc()
      var followDisc = newState.physicsState.discs.find((x)=>x.playerId==fpId);
      if (!followDisc)
        return;
      ball = newState.physicsState.discs[0];
      if (thisLibrary.advancedVirtualKick)
        newState.physicsState.kickBall(followDisc, ball, newState.stadium.playerPhysics);
      ctx.save();
      ctx.strokeStyle = thisLibrary.color;
      ctx.beginPath();
      var p = ball.pos;
      ctx.moveTo(p.x, p.y);
      for (var i=1;i<=thisLibrary.advancedEngineFrameNum;i++){
        newState.advance(1); // newState.C(1)
        p = ball.pos;
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.restore();
    }
  };
};

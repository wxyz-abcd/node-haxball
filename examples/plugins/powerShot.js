module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "powerShot", true, { // "powerShot" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.3",
    author: "abc & JerryOldson",
    description: `This plugin implements the powershot feature.`,
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });
  
  this.defineVariable({
    name: "triggerDistance",
    type: VariableType.Number,
    value: 10,
    range: {
      min: 0,
      max: 20,
      step: 0.1
    },
    description: `The minimum distance that the player has to be to start the counter`
  });
  
  this.defineVariable({
    name: "ballSpeed",
    type: VariableType.Number,
    value: 12,
    range: {
      min: 0,
      max: 30,
      step: 0.1
    },
    description: `Speed of the ball while being shot with power`
  });

  this.defineVariable({
    name: "ballColor",
    type: VariableType.Color,
    value: "#8b0000",
    description: "Color of the ball while being shot with power."
  });
  
  this.defineVariable({
    name: "ticksThreshold",
    type: VariableType.Integer,
    value: 8,
    range: {
      min: 1,
      max: 1000,
      step: 1
    },
    description: `Number of ticks required for the player to hold the ball in order to activate the powershot`
  });

  this.defineVariable({
    name: "swingGravity",
    type: VariableType.Number,
    value: 0.05,
    range: {
      min: 0,
      max: 1,
      step: 0.001
    },
    description: "Gravity effect for swinging the ball."
  });

  this.defineVariable({
    name: "swingGravityDescentCoeff",
    type: VariableType.Number,
    value: 0.5,
    range: {
      min: 0,
      max: 1,
      step: 0.01
    },
    description: "Gravity descent effect for more realistic swinging."
  });
  
  this.defineVariable({
    name: "ticksPerSwingGravityUpdate",
    type: VariableType.Integer,
    value: 1,
    range: {
      min: 1,
      max: 100,
      step: 1
    },
    description: "Number of ticks of the interval that the update of ball's gravity will happen."
  });
  
  this.defineVariable({
    name: "maxTicks",
    type: VariableType.Integer,
    value: 100,
    range: {
      min: 0,
      max: 1000,
      step: 1
    },
    description: `Number of ticks that the powershot will be active. (<=0 for always active.)`
  });
  
  this.defineVariable({
    name: "endOnCollision",
    type: VariableType.Boolean,
    value: true,
    description: `If enabled, ends the powershot as soon as the ball collides with any other object.`
  });

  this.defineVariable({
    name: "clientEnabled",
    type: VariableType.Boolean,
    value: false,
    description: "If enabled, other players will be able to use the powerShot shortcut key via the powerShot_clientSide plugin."
  });
  
  var that = this, nearestPlayerId = null, ticks = 0, psTicks = 0, swingActive = false, color = null, cc = -1;

  function updateColor(){
    color = parseInt(that.ballColor.substring(1),16);
  }

  this.initialize = function(){
    updateColor();
    nearestPlayerId = null;
    ticks = 0;
    psTicks = 0;
    swingActive = false;
  };

  this.onGameStart = function(){
    nearestPlayerId = null;
    ticks = 0;
    psTicks = 0;
    swingActive = false;
  };
  
  function powerShot(player, c=1){
    var ball = that.room?.gameState?.physicsState?.discs?.[0];
    if (!ball)
      return;
    var dx = ball.pos.x-player.disc.pos.x, dy = ball.pos.y-player.disc.pos.y, d = Math.sqrt(dx*dx+dy*dy);
    var _dx = dx/d, _dy = dy/d;
    var obj = { 
      xspeed: that.ballSpeed*_dx,
      yspeed: that.ballSpeed*_dy
    };
    cc = c;
    if (that.swingGravity!=0){
      swingActive = true;
      obj.xgravity = -cc*_dy*that.swingGravity;
      obj.ygravity = cc*_dx*that.swingGravity;
    }
    psTicks = 1;
    Utils.runAfterGameTick(()=>{
      that.room.setDiscProperties(0, obj);
      that.onPowerShot && that.onPowerShot(player, cc);
    });
  }
  
  function tryPowershot(playerId, c=1){
    var ball = that.room?.gameState?.physicsState?.discs?.[0];
    if (!ball)
      return;
    var player = that.room.getPlayer(playerId), p = player?.disc?.pos;
    if (!p)
      return;
    if (Math.sqrt((p.x-ball.pos.x)*(p.x-ball.pos.x)+(p.y-ball.pos.y)*(p.y-ball.pos.y))>that.triggerDistance+ball.radius+player.disc.radius)
      return;
    powerShot(player, c);
  }
  
  this.onPlayerBallKick = function(playerId){
    if (ticks<=that.ticksThreshold)
      return;
    powerShot(that.room.getPlayer(nearestPlayerId));
  };
  
  this.onGameTick = function(){
    var ball = that.room.gameState.physicsState.discs[0];
    var minSqrDist = Infinity, minDistPlayer = null, { pos } = ball;
    if (that.maxTicks>0 && psTicks>0){
      psTicks++;
      if (psTicks>that.maxTicks)
        resetBallGravity();
      else{
        var dx = ball.speed.x, dy = ball.speed.y, d = Math.sqrt(dx*dx+dy*dy);
        if (psTicks%that.ticksPerSwingGravityUpdate==0){
          var g = (1+(that.swingGravityDescentCoeff-1)*(psTicks/that.maxTicks))*that.swingGravity;
          that.room.setDiscProperties(0, {
            xgravity: -cc*(dy/d)*g,
            ygravity: cc*(dx/d)*g
          });
        }
      }
    }
    that.room.players.forEach((player)=>{
      if (!player.disc)
        return;
      var p = player.disc.pos;
      var sqrDist = (p.x-pos.x)*(p.x-pos.x)+(p.y-pos.y)*(p.y-pos.y);
      if (sqrDist<minSqrDist){
        minSqrDist = sqrDist;
        minDistPlayer = player;
      }
    });
    minSqrDist = Math.sqrt(minSqrDist);
    if (!minDistPlayer)
      return;
    if (minSqrDist>that.triggerDistance+ball.radius+minDistPlayer.disc.radius){
      nearestPlayerId = null;
      ticks = 0;
      if (!swingActive)
        Utils.runAfterGameTick(()=>{
          if (ball.color!=that.room.state.stadium.discs[0].color)
            that.room.setDiscProperties(0, { color: that.room.state.stadium.discs[0].color });
        });
      return;
    }
    if (nearestPlayerId!=minDistPlayer.id)
      ticks = 0;
    nearestPlayerId = minDistPlayer.id;
    ticks++;
    if (ticks>that.ticksThreshold)
      Utils.runAfterGameTick(()=>{
        if (ball.color!=color)
          that.room.setDiscProperties(0, { 
            color: color
          });
      });
  };

  function resetBallGravity(){
    swingActive = false;
    psTicks = 0;
    Utils.runAfterGameTick(()=>{
      that.room.setDiscProperties(0, { xgravity: 0, ygravity: 0, color: that.room.state.stadium.discs[0].color });
      that.onPowerShotEnd && that.onPowerShotEnd();
    });
  }

  this.stopPowerShot = resetBallGravity;
  
  this.isPowerShotActive = function(){
    return psTicks>0;
  };
  
  this.onCollisionDiscVsDisc = function(discId1, discPlayerId1, discId2, discPlayerId2){
    if (that.endOnCollision && swingActive && discId1==0)
      resetBallGravity();
  };
  
  this.onCollisionDiscVsSegment = function(discId, discPlayerId, segmentId){
    if (that.endOnCollision && swingActive && discId==0)
      resetBallGravity();
  };
  
  this.onCollisionDiscVsPlane = function(discId, discPlayerId, planeId){
    if (that.endOnCollision && swingActive && discId==0)
      resetBallGravity();
  };
  
  this.onKeyDown = function(e){
    if (e.code=="KeyZ")
      tryPowershot(0, -1);
    else if (e.code=="KeyC")
      tryPowershot(0, 1);
  };
  
  this.onOperationReceived = function(type, msg){
    if (type==OperationType.CustomEvent && that.clientEnabled){
      if (msg.type==57)
        tryPowershot(msg.byId, 1);
      else if (msg.type==58)
        tryPowershot(msg.byId, -1);
    }
    return true;
  };

  this.onVariableValueChange = function(addOnObj, variableName, oldValue, value){
    if (addOnObj!=that || variableName!="ballColor")
      return;
    updateColor();
  };
  
}
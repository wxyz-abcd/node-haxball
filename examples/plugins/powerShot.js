module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "powerShot", true, { // "powerShot" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.2",
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
    value: 10,
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
    value: 50,
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
    value: 0.15,
    range: {
      min: 0,
      max: 2,
      step: 0.001
    },
    description: "Gravity effect for swinging the ball."
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
  
  var that = this, nearestPlayerId = null, ticks = 0, psTicks = 0, swingActive = false, color = null;

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
  
  function powerShot(player){
    var ball = that.room.gameState.physicsState.discs[0];
    var dx = ball.pos.x-player.disc.pos.x, dy = ball.pos.y-player.disc.pos.y, d = Math.sqrt(dx*dx+dy*dy);
    var obj = { 
      xspeed: that.ballSpeed*dx/d,
      yspeed: that.ballSpeed*dy/d
    };
    if (that.swingGravity!=0){
      swingActive = true;
      obj.ygravity = -Math.sign(obj.yspeed)*that.swingGravity;
    }
    psTicks = 1;
    Utils.runAfterGameTick(()=>{
      that.room.setDiscProperties(0, obj);
      that.onPowerShot && that.onPowerShot(player);
    });
  }
  
  function tryPowershot(playerId){
    var ball = that.room.gameState.physicsState.discs[0];
    var player = that.room.getPlayer(playerId), p = player?.disc?.pos;
    if (!p)
      return;
    if (Math.sqrt((p.x-ball.pos.x)*(p.x-ball.pos.x)+(p.y-ball.pos.y)*(p.y-ball.pos.y))>that.triggerDistance+ball.radius+player.disc.radius)
      return;
    powerShot(player);
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
        that.room.setDiscProperties(0, { 
          color: color
        });
      });
  };

  function resetBallGravity(){
    swingActive = false;
    psTicks = 0;
    Utils.runAfterGameTick(()=>{
      that.room.setDiscProperties(0, { ygravity: 0, color: that.room.state.stadium.discs[0].color });
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
    if (e.code=="KeyQ")
      tryPowershot(0);
  };
  
  this.onOperationReceived = function(type, msg){
    if (type==OperationType.CustomEvent && msg.type==57 && that.clientEnabled)
      tryPowershot(msg.byId);
    return true;
  };

  this.onVariableValueChange = function(addOnObj, variableName, oldValue, value){
    if (addOnObj!=that || variableName!="ballColor")
      return;
    updateColor();
  };
  
}
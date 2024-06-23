module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "explosion", true, { // "explosion" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin allows the room owner to create explosions by clicking on the map using a mouse.`,
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });

  this.defineVariable({
    name: "maxRadius",
    description: "Explosion will only affect objects that have a lower distance than this value",
    type: VariableType.Number,
    value: 100,
    range: {
      min: 1,
      max: 10000,
      step: 1
    }
  });

  this.defineVariable({
    name: "maxSpeedBoost",
    description: "Maximum effective speed boost of the explosion",
    type: VariableType.Number,
    value: 2,
    range: {
      min: -10,
      max: 10,
      step: 0.01
    }
  });

  var that = this;

  this.onMouseDown = function(e){
    var { room, maxSpeedBoost, maxRadius } = that;
    var f = room?.renderer?.transformPixelCoordToMapCoord;
    if (!f || !room.stateExt){
      selectionActive = false;
      return;
    }
    maxSpeedBoost = parseFloat(maxSpeedBoost);
    maxRadius = parseFloat(maxRadius);
    var { x, y } = f(e.offsetX, e.offsetY);
    room.stateExt.gameState?.physicsState?.discs.forEach((disc, idx)=>{
      var { pos, radius } = disc;
      var deltaX = pos.x-x, deltaY = pos.y-y, r = radius+maxRadius;
      if ((deltaX*deltaX+deltaY*deltaY)>r*r)
        return;
      var d = Math.sqrt(deltaX*deltaX+deltaY*deltaY);
      var v = maxSpeedBoost*Math.exp(-d/r);
      Utils.runAfterGameTick(()=>{
        room.setDiscProperties(idx, {
          xspeed: disc.speed.x+v*deltaX/d,
          yspeed: disc.speed.y+v*deltaY/d
        });
      });
    });
  }
};

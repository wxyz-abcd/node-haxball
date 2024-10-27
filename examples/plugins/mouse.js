module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "mouse", true, {
    version: "0.1",
    author: "abc",
    description: `This plugin lets you control your player using your mouse.`,
    allowFlags: AllowFlags.JoinRoom | AllowFlags.CreateRoom
  });

  var that = this, interval = null, lastUpdate = null;

  this.initialize = function(){
    document.addEventListener("pointerlockchange", onPointerLockChange, false);
  }

  this.finalize = function(){
    document.removeEventListener("pointerlockchange", onPointerLockChange, false);
    lastUpdate = null;
    clearInterval(interval);
    interval = null;
    var canvas = document.getElementsByTagName("canvas")[0];
    (canvas?.exitPointerLock || canvas?.mozExitPointerLock || canvas?.webkitExitPointerLock)?.call(canvas);
  };

  function onPointerLockChange(){
    if (document.pointerLockElement)
      interval = setInterval(checkToStopMovement, 50);
    else{
      clearInterval(interval);
      interval = null;
    }
  }

  function checkToStopMovement(){
    if (!lastUpdate)
      return;
    if (performance.now()-lastUpdate>100){
      that.room.setKeyState(Utils.keyState(0, 0, (that.room.getKeyState()&16)>0));
      lastUpdate = null;
    }
  }

  this.onPluginActiveChange = function(){
    if (that.active)
      return;
    lastUpdate = null;
    clearInterval(interval);
    interval = null;
    var canvas = document.getElementsByTagName("canvas")[0];
    (canvas?.exitPointerLock || canvas?.mozExitPointerLock || canvas?.webkitExitPointerLock)?.call(canvas);
  };

  this.onMouseDown = function(e){
    if (!document.pointerLockElement){
      var canvas = document.getElementsByTagName("canvas")[0];
      (canvas?.requestPointerLock || canvas?.mozRequestPointerLock || canvas?.webkitRequestPointerLock)?.call(canvas);
      return;
    }
    if (e.button==0)
      that.room.setKeyState(that.room.getKeyState()|16);
  };
  
  this.onMouseUp = function(e){
    if (!document.pointerLockElement)
      return;
    if (e.button==0)
      that.room.setKeyState(that.room.getKeyState()&-17);
  };
  
  this.onMouseMove = function(e){
    if (!document.pointerLockElement)
      return;
    that.room.setKeyState(Utils.keyState(Math.sign(e.movementX), Math.sign(e.movementY), (that.room.getKeyState()&16)>0));
    lastUpdate = performance.now();
  }
};

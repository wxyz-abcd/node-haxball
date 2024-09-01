module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "syncSpammer", true, {
    version: "0.1",
    author: "abc",
    description: `This plugin changes your sync value on a regular basis.`,
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom
  });
  
  this.defineVariable({
    name: "spam",
    description: "Activates/deactivates spamming.", 
    type: VariableType.Boolean,
    value: false
  });

  this.defineVariable({
    name: "intervalMsec",
    description: "Waiting time between each sync spam.", 
    type: VariableType.Integer,
    value: 1000,
    range: {
      min: 15,
      max: Infinity,
      step: 1
    }
  });

  var that = this, sync = true, timeout;
  
  function swapSync(){
    sync = !sync;
    that.room?.setSync?.(sync);
    timeout = setTimeout(swapSync, that.intervalMsec);
  }
  
  this.onVariableValueChange = function(addonObject, variableName, oldValue, newValue){
    if (addonObject == that && variableName=="spam"){
      if (timeout!=null)
        clearTimeout(timeout);
      if (newValue)
        timeout = setTimeout(swapSync, newValue);
    }
  };

  this.finalize = function(){
    if (timeout!=null)
      clearTimeout(timeout);
  };
}
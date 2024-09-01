module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "chatIndicatorSpammer", true, {
    version: "0.1",
    author: "0x00",
    description: `This plugin changes your chat indicator visibility on a regular basis.`,
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
    description: "Waiting time between each indicator spam.", 
    type: VariableType.Integer,
    value: 1000,
    range: {
      min: 0,
      max: Infinity,
      step: 1
    }
  });

  var that = this, active = true, timeout;
  
  function swapIndicator(){
    active = !active;
    that.room?.setChatIndicatorActive?.(active);
    timeout = setTimeout(swapIndicator, that.intervalMsec);
  }
  
  this.onVariableValueChange = function(addonObject, variableName, oldValue, newValue){
    if (addonObject == that && variableName=="spam"){
      if (timeout!=null)
        clearTimeout(timeout);
      if (newValue)
        timeout = setTimeout(swapIndicator, newValue);
    }
  };

  this.finalize = function(){
    if (timeout!=null)
      clearTimeout(timeout);
  };
}
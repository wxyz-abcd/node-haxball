module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "powerShot_clientSide", true, { // "powerShot_clientSide" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin adds "z" and "c" keys that will use the powershot feature.`,
    allowFlags: AllowFlags.JoinRoom // We allow this plugin to be activated on JoinRoom only.
  });
  
  var that = this;

  this.onKeyDown = function(e){
    if (e.code=="KeyZ")
      that.room.sendCustomEvent(57, {});
    else if (e.code=="KeyC")
      that.room.sendCustomEvent(58, {});
  };  
}
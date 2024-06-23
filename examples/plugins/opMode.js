module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "opMode", true, { // "opMode" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "Gaxball & abc",
    description: `Makes you look laggy to your opponents. Press 'Z' key to activate, press 'Z' key again to deactivate.`,
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom // We allow this plugin to be activated on both CreateRoom and JoinRoom.
  });

  var newFrameNo = null;

  this.modifyFrameNo = function(frameNo){
    return (newFrameNo==null) ? frameNo : newFrameNo;
  };

  // Since this is a GUI callback, this will not work on node.js.
  // In a GUI environment, you have to define this callback by yourself 
  // using Callback.add("KeyDown") BEFORE you initialize any Renderer, 
  // Plugin or RoomConfig objects, and then use _callback when the real 
  // event occurs, like this: that.room._onKeyDown(eventParameters).
  this.onKeyDown = function(e){
    if (e.code=="KeyZ"){
      if (newFrameNo == null)
        newFrameNo = 10;
      else
        newFrameNo = null;
    }
  };
};

module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, RoomConfig.prototype);
  RoomConfig.call(this, { // Every roomConfig should have a unique name.
    name: "defaultConfig",
    version: "0.1",
    author: "abc",
    description: `This is the default roomConfig.`,
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom // We allow this roomConfig to be activated on both CreateRoom and JoinRoom.
  });

  this.onBeforeOperationReceived = function(type, msg, globalFrameNo, clientFrameNo){ // this callback is host-only
    if (type != OperationType.SendChat)
      return;
    var m = msg.text;
    if (m.startsWith("!")){  // custom chat logic for extra commands
      return {
        isCommand: true, 
        data: m.trimEnd().split(" ")
      };
    };
    return {
      isCommand: false
    };
  };

  this.onAfterOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){ // this callback is host-only
    if (type != OperationType.SendChat)
      return true;
    return !customData?.isCommand;
  };
};

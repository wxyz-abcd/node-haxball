module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, RoomConfig.prototype);
  RoomConfig.call(this, { // Every roomConfig should have a unique name.
    name: "modifyPlayerPing",
    version: "0.1",
    author: "abc",
    description: `This roomConfig changes all pings to really high values.`,
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom // We allow this roomConfig to be activated on both CreateRoom and JoinRoom.
  });

  var that = this;

  this.initialize = function(){
    that.room.hostPing = 1987987987; // this is host-only. host ping has to be modified like this.
  };

  this.modifyPlayerPing = function(playerId, ping, customData){
    return 100000 + ping*ping*ping; // if host, set everybody(except host)'s ping to 100000 + its original value cubed; otherwise, only set your own ping to that value.
  };
};

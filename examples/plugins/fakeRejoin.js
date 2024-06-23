module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "fakeRejoin", true, {
    version: "0.1",
    author: "abc",
    description: `This plugin can change the player properties by making the player leave and then rejoin the room with different properties.`,
    allowFlags: AllowFlags.CreateRoom
  });

  this.defineVariable({
    name: "playerId",
    description: "Id of the player.", 
    type: VariableType.Integer,
    value: 0,
    range: {
      min: 0,
      max: 65535,
      step: 1
    }
  });

  this.defineVariable({
    name: "fakeLeave",
    description: "Makes the player seemingly leave the room. Also updates the values of the current variables.", 
    type: VariableType.Void,
    value: fakeLeave
  });

  this.defineVariable({
    name: "playerName",
    description: "Name of the player.",
    type: VariableType.String,
    value: ""
  });

  this.defineVariable({
    name: "playerFlag",
    description: "Flag of the player.",
    type: VariableType.String,
    value: ""
  });

  this.defineVariable({
    name: "playerAvatar",
    description: "Avatar of the player.",
    type: VariableType.String,
    value: ""
  });

  this.defineVariable({
    name: "playerConn",
    description: "Conn of the player.",
    type: VariableType.String,
    value: ""
  });

  this.defineVariable({
    name: "playerAuth",
    description: "Auth of the player.",
    type: VariableType.String,
    value: ""
  });

  this.defineVariable({
    name: "fakeJoin",
    description: "Makes a new player join the room. (The original player rejoins if the id exists.)", 
    type: VariableType.Void,
    value: fakeJoin
  });

  var that = this;

  function fakeLeave(){
    var tmp = that.room.fakePlayerLeave(that.playerId);
    if (!tmp)
      return;
    var { name, flag, avatar, conn, auth } = tmp;
    that.playerName = name || "";
    that.playerFlag = flag || "";
    that.playerAvatar = avatar || "";
    that.playerConn = conn || "";
    that.playerAuth = auth || "";
  }

  function fakeJoin(){
    that.room.fakePlayerJoin(that.playerId, that.playerName, that.playerFlag, that.playerAvatar, that.playerConn, that.playerAuth);
  }
}
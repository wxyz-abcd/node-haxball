module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "greetPeople", true, { // "greetPeople" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin greets the players and makes them admin as soon as they come to the room, and says goodbye to them when they leave.`,
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom // We allow this plugin to be activated on both CreateRoom and JoinRoom.
  });

  var that = this;

  this.onPlayerJoin = function(playerObj, customData){
    // get player's id and name
    var id = playerObj.id, name = playerObj.name;

    that.room.sendChat("Welcome, " + name); // greet everybody
    that.room.setPlayerAdmin(id, true); // make everybody admin
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    // get player's name
    var name = playerObj.name;

    that.room.sendChat("Goodbye, " + name); // say farewell to everybody
  };
};

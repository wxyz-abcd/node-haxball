module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API;

  Object.setPrototypeOf(this, RoomConfig.prototype);
  RoomConfig.call(this, { // Every roomConfig should have a unique name.
    name: "greetPeople",
    version: "0.1",
    author: "abc",
    description: `This roomConfig greets the players and makes them admin as soon as they come to the room, and says goodbye to them when they leave.`,
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom // We allow this roomConfig to be activated on both CreateRoom and JoinRoom.
  });

  var room = null;

  this.initialize = function(_room){
    room = _room;
  };

  this.finalize = function(){
    room = null;
  };

  this.onPlayerJoin = function(playerObj, customData){
    // get player's id and name
    var id = playerObj.id, name = playerObj.name;

    room.sendChat("Welcome, " + name); // greet everybody
    room.setPlayerAdmin(id, true); // make everybody admin
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    // get player's name
    var name = playerObj.name;

    room.sendChat("Goodbye, " + name); // say farewell to everybody
  };
};

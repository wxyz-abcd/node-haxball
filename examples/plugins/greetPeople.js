module.exports = function({ OperationType, ConnectionState, Utils, Plugin, Replay, Room }){

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "greetPeople", true, { // "greetPeople" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin greets the players and makes them admin as soon as they come to the room, and says goodbye to them when they leave.`,
    allowFlags: Plugin.AllowFlags.CreateRoom | Plugin.AllowFlags.JoinRoom // We allow this plugin to be activated on both CreateRoom and JoinRoom.
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
    var id = playerObj.V, name = playerObj.w;

    room.sendChat("Welcome, " + name); // greet everybody
    room.setPlayerAdmin(id, true); // make everybody admin
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    // get player's name
    var name = playerObj.w;

    room.sendChat("Goodbye, " + name); // say farewell to everybody
  };

};

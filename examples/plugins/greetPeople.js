var { Plugin } = require("../../src/index");

module.exports = function(){

  Plugin.call(this, "greetPeople", true, Plugin.AllowFlags.CreateRoom|Plugin.AllowFlags.JoinRoom); // "greetPeople" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name. We allow this plugin to be activated on both CreateRoom and JoinRoom.

  var _room = null;

  this.initialize = function(room){
    _room = room;
  };

  this.finalize = function(){
    _room = null;
  };

  this.onPlayerJoin = function(playerObj, customData){
    // get player's id and name
    var id = playerObj.V, name = playerObj.w;

    _room.sendChat("Welcome, " + name); // greet everybody
    _room.setPlayerAdmin(id, true); // make everybody admin
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    // get player's name
    var name = playerObj.w;

    _room.sendChat("Goodbye, " + name); // say farewell to everybody
  };

};

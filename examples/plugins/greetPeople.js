var { Plugin } = require("../../src/index");

module.exports = function(){

  Plugin.call(this, "greetPeople", true); // "greetPeople" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.

  var players = {}, _room = null;

  this.initialize = function(room){
    _room = room;
  };

  this.finalize = function(){
    _room = null;
    players = null;
  };

  this.onPlayerJoin = function(id, name, flag, avatar, conn, auth, customData){
    players[id] = { id, name, flag, conn, auth };
    _room.sendChat("Welcome, " + name); // greet everybody
    _room.setPlayerAdmin(id, true); // make everybody admin
  };

  this.onPlayerLeave = function(id, reason, isBanned, byId, customData){
    _room.sendChat("Goodbye, " + players[id].name);
    delete players[id];
  };

};

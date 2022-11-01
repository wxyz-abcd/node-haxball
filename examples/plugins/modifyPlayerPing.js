var { Plugin } = require("../../src/index");

module.exports = function(){

  Plugin.call(this, "modifyPlayerPing", true); // "modifyPlayerPing" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.

  this.initialize = function(room){
    room.hostPing = 1987987987; // this is host-only. host ping has to be modified like this.
  };

  this.modifyPlayerPing = function(playerId, ping, customData){
    return 100000 + ping*ping*ping; // set everybody(except host)'s ping to 100000 + its original value cubed
  };

};

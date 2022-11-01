var { Plugin } = require("../../src/index");

module.exports = function(){

  Plugin.call(this, "modifyPlayerData", true); // "modifyPlayerData" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.

  this.modifyPlayerData = function(playerId, name, flag, avatar, conn, auth, customData){
    if (nick=="abc")
      return null;  // block anyone trying to join the room with nick "abc", before he can join the room.
    return [
      "[" + id + "] " + nick, // prefix everyone's nick with [id]
      avatar, // do not change avatars
      "tr" // set everyone's flag to tr
    ];
  };

};

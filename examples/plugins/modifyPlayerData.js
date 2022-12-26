module.exports = function({ OperationType, ConnectionState, Utils, Plugin, Replay, Room }){

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "modifyPlayerData", true, { // "modifyPlayerData" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name. Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin changes people's nick and flag while they enter the room.`,
    allowFlags: Plugin.AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });

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

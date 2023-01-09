module.exports = function({ OperationType, VariableType, ConnectionState, AllowFlags, Callback, Utils, Room, Replay, RoomConfig, Plugin, Renderer }){

  Object.setPrototypeOf(this, RoomConfig.prototype);
  RoomConfig.call(this, { // Every roomConfig should have a unique name.
    name: "modifyPlayerData",
    version: "0.1",
    author: "abc",
    description: `This roomConfig changes people's nick and flag while they enter the room.`,
    allowFlags: AllowFlags.CreateRoom // We allow this roomConfig to be activated on CreateRoom only.
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

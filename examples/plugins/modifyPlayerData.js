module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "modifyPlayerData", true, { // "modifyPlayerData" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin changes people's nick and flag while they enter the room.`,
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });

  this.modifyPlayerData = function(playerId, name, flag, avatar, conn, auth, customData){
    if (name=="abc")
      return null;  // block anyone trying to join the room with name "abc", before he can join the room.
    return [
      "[" + playerId + "] " + name, // prefix everyone's name with [playerId]
      "tr", // set everyone's flag to tr
      avatar // do not change avatars
    ];
  };
};

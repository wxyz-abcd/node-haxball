const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API = require("../../../src/index");

function roomCallback(room){ // examples start from here.

  room.modifyPlayerData = function(playerId, name, flag, avatar, conn, auth, customData){ // this is host-only.
    if (name=="abc")
      return null;  // block anyone trying to join the room with name "abc", before he can join the room.
    return [
      "[" + playerId + "] " + name, // prefix everyone's name with [playerId]
      "tr", // set everyone's flag to tr
      avatar // do not change avatars
    ];
  };

}

const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API = require("../../../src/index");

function roomCallback(room){ // examples start from here.

  room.hostPing = 1987987987; // this is host-only. host ping has to be modified like this.

  room.modifyPlayerPing = function(id, ping, customData){ // this is host-only. id is player's id.
    return 100000 + ping*ping*ping; // set everybody(except host)'s ping to 100000 + its original value cubed
  };

}

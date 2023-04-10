const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API = require("../../../src/index");

function roomCallback(room){ // examples start from here.

  room.onPlayerJoin = (playerObj, customData) => {
    // get player's id and name
    var id = playerObj.id, name = playerObj.name;
    
    room.sendChat("Welcome, " + name); // greet everybody
    room.setPlayerAdmin(id, true); // make everybody admin
  };

  room.onPlayerLeave = (playerObj, reason, isBanned, byId, customData) => {
    // get player's name
    var name = playerObj.name;
    
    room.sendChat("Goodbye, " + name); // say farewell to everybody
  };

}

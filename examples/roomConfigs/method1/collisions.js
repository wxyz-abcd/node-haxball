const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API = require("../../../src/index");

function roomCallback(room){ // examples start from here.

  room.onCollisionDiscVsDisc = (discId1, discPlayerId1, discId2, discPlayerId2, customData) => {
    console.log("Disc vs disc collision : ", discPlayerId1, discId1, discPlayerId2, discId2);
  };

  room.onCollisionDiscVsSegment = (discId, discPlayerId, segmentId, customData) => {
    console.log("Disc vs segment collision : ", discPlayerId, discId, segmentId);
  };

  room.onCollisionDiscVsPlane = (discId, discPlayerId, planeId, customData) => {
    console.log("Disc vs plane collision : ", discPlayerId, discId, planeId);
  };

}

module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, RoomConfig.prototype);
  RoomConfig.call(this, { // Every roomConfig should have a unique name.
    name: "collisions",
    version: "0.1",
    author: "abc",
    description: `This roomConfig only logs messages in console when a collision happens. We will improve this later.`,
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom // We allow this roomConfig to be activated on both CreateRoom and JoinRoom.
  });

  this.onCollisionDiscVsDisc = function(discId1, discPlayerId1, discId2, discPlayerId2, customData){
    console.log("Disc vs disc collision : ", discPlayerId1, discId1, discPlayerId2, discId2);
  };

  this.onCollisionDiscVsSegment = function(discId, discPlayerId, segmentId, customData){
    console.log("Disc vs segment collision : ", discPlayerId, discId, segmentId);
  };

  this.onCollisionDiscVsPlane = function(discId, discPlayerId, planeId, customData){
    console.log("Disc vs plane collision : ", discPlayerId, discId, planeId);
  };
};

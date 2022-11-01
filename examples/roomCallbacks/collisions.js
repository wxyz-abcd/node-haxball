function roomCallback(room){ // examples start from here.

  room.onAfterCollisionDiscVsDisc = (discId1, discPlayerId1, discId2, discPlayerId2, customData) => {
    console.log("Disc vs disc collision : ", discPlayerId1, discId1, discPlayerId2, discId2);
  };

  room.onAfterCollisionDiscVsSegment = (discId, discPlayerId, segmentId, customData) => {
    console.log("Disc vs segment collision : ", discPlayerId, discId, segmentId);
  };

  room.onAfterCollisionDiscVsPlane = (discId, discPlayerId, planeId, customData) => {
    console.log("Disc vs plane collision : ", discPlayerId, discId, planeId);
  };

}

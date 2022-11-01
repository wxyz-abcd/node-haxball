var { Plugin } = require("../../src/index");

module.exports = function(){

  Plugin.call(this, "collisions", true); // "collisions" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.

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

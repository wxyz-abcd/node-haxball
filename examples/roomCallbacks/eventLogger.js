function roomCallback(room){ // examples start from here.

  this.onAfterOperationReceived = function(obj, msg, customData){
    console.log("onOperationReceived...", obj, msg, customData);
    return true;
  };

  this.onAfterRoomLink = function(link, customData){
    console.log("onRoomLink...", link, customData);
  };

  this.onAfterPlayerBallKick = function(playerId, customData){
    console.log("onPlayerBallKick...", playerId, customData);
  };

  this.onAfterTeamGoal = function(teamId, customData){
    console.log("onTeamGoal...", teamId, customData);
  };

  this.onAfterGameEnd = function(winningTeamId, customData){
    console.log("onGameEnd...", winningTeamId, customData);
  };

  this.onAfterGameTick = function(customData){
    //console.log("onGameTick...", customData);
  };

  this.onAfterPlayerSyncChange = function(playerId, value, customData){
    console.log("onPlayerSyncChange...", playerId, value, customData);
  };

  this.onAfterAnnouncement = function(msg, color, style, sound, customData){
    console.log("onAnnouncement...", msg, color, style, sound, customData);
  };

  this.onAfterAutoTeams = function(playerId1, teamId1, playerId2, teamId2, byId, customData){
    console.log("onAutoTeams...", playerId1, teamId1, playerId2, teamId2, byId, customData);
  };

  this.onAfterScoreLimitChange = function(value, byId, customData){
    console.log("onScoreLimitChange...", value, byId, customData);
  };

  this.onAfterTimeLimitChange = function(value, byId, customData){
    console.log("onTimeLimitChange...", value, byId, customData);
  };

  this.onAfterPlayerAdminChange = function(id, isAdmin, byId, customData){
    console.log("onPlayerAdminChange...", id, isAdmin, byId, customData);
  };

  this.onAfterPlayerAvatarChange = function(id, value, customData){
    console.log("onPlayerAvatarChange...", id, value, customData);
  };

  this.onAfterPlayerTeamChange = function(id, teamId, byId, customData){
    console.log("onPlayerTeamChange...", id, teamId, byId, customData);
  };

  this.onAfterStadiumChange = function(stadium, byId, customData){
    console.log("onStadiumChange...", stadium, byId, customData);
  };

  this.onAfterTeamsLockChange = function(value, byId, customData){
    console.log("onTeamsLockChange...", value, byId, customData);
  };

  this.onAfterPlayerObjectCreated = function(playerObj, customData){
    console.log("onPlayerObjectCreated...", playerObj, customData);
  };

  this.onAfterPlayerJoin = function(playerObj, customData){
    console.log("onPlayerJoin...", playerObj, customData);
  };

  this.onAfterGamePauseChange = function(isPaused, byId, customData){
    console.log("onGamePauseChange...", isPaused, byId, customData);
  };

  this.onAfterPlayerChat = function(id, message, customData){
    console.log("onPlayerChat...", id, message, customData);
  };

  this.onAfterPlayerInputChange = function(id, value, customData){
    console.log("onPlayerInputChange...", id, value, customData);
  };

  this.onAfterPlayerChatIndicatorChange = function(id, value, customData){
    console.log("onPlayerChatIndicatorChange...", id, value, customData);
  };

  this.onAfterPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    console.log("onPlayerLeave...", playerObj, reason, isBanned, byId, customData);
  };

  this.onAfterSetDiscProperties = function(id, type, data1, data2, customData){
    console.log("onSetDiscProperties...", id, type, data1, data2, customData);
  };

  this.onAfterKickRateLimitChange = function(min, rate, burst, byId, customData){
    console.log("onKickRateLimitChange...", min, rate, burst, byId, customData);
  };

  this.onAfterGameStart = function(byId, customData){
    console.log("onGameStart...", byId, customData);
  };

  this.onAfterKickOff = function(customData){
    console.log("onKickOff...", customData);
  };

  this.onAfterLocalFrame = function(localFrameNo, customData){
    //console.log("onLocalFrame...", localFrameNo, customData);
  };

  this.onAfterGameStop = function(byId, customData){
    console.log("onGameStop...", byId, customData);
  };

  this.onAfterPingData = function(array, customData){
    console.log("onPingData...", array, customData);
  };

  this.onAfterExtrapolationChange = function(value, customData){
    console.log("onExtrapolationChange...", value, customData);
  };

  this.onAfterHandicapChange = function(value, customData){
    console.log("onHandicapChange...", value, customData);
  };

  this.onAfterBansClear = function(customData){
    console.log("onBansClear...", customData);
  };

  this.onAfterRoomRecaptchaModeChange = function(on, customData){
    console.log("onRoomRecaptchaModeChange...", on, customData);
  };

  this.onAfterRoomPropertiesChange = function(props, customData){
    console.log("onRoomPropertiesChange...", props, customData);
  };

  this.onAfterCollisionDiscVsDisc = function(discId1, discPlayerId1, discId2, discPlayerId2, customData){
    console.log("onCollisionDiscVsDisc...", discId1, discPlayerId1, discId2, discPlayerId2, customData);
  };

  this.onAfterCollisionDiscVsSegment = function(discId, discPlayerId, segmentId, customData){
    console.log("onCollisionDiscVsSegment...", discId, discPlayerId, segmentId, customData);
  };

  this.onAfterCollisionDiscVsPlane = function(discId, discPlayerId, planeId, customData){
    console.log("onCollisionDiscVsPlane...", discId, discPlayerId, planeId, customData);
  };

  this.onAfterCustomEvent = function(type, data, byId, customData){
    console.log("onCustomEvent...", type, data, byId, customData);
  };

};

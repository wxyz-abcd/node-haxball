const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API = require("../../../src/index");

function roomCallback(room){ // examples start from here.

  room.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){
    console.log("onOperationReceived...", msg.byId, type, msg, globalFrameNo, clientFrameNo, customData);
    return true;
  };

  room.onRoomLink = function(link, customData){
    console.log("onRoomLink...", link, customData);
  };

  room.onPlayerBallKick = function(playerId, customData){
    console.log("onPlayerBallKick...", playerId, customData);
  };

  room.onTeamGoal = function(teamId, customData){
    console.log("onTeamGoal...", teamId, customData);
  };

  room.onGameEnd = function(winningTeamId, customData){
    console.log("onGameEnd...", winningTeamId, customData);
  };

  room.onGameTick = function(customData){
    //console.log("onGameTick...", customData);
  };

  room.onPlayerSyncChange = function(playerId, value, customData){
    console.log("onPlayerSyncChange...", playerId, value, customData);
  };

  room.onAnnouncement = function(msg, color, style, sound, customData){
    console.log("onAnnouncement...", msg, color, style, sound, customData);
  };

  room.onAutoTeams = function(playerId1, teamId1, playerId2, teamId2, byId, customData){
    console.log("onAutoTeams...", playerId1, teamId1, playerId2, teamId2, byId, customData);
  };

  room.onScoreLimitChange = function(value, byId, customData){
    console.log("onScoreLimitChange...", value, byId, customData);
  };

  room.onTimeLimitChange = function(value, byId, customData){
    console.log("onTimeLimitChange...", value, byId, customData);
  };

  room.onPlayerAdminChange = function(id, isAdmin, byId, customData){
    console.log("onPlayerAdminChange...", id, isAdmin, byId, customData);
  };

  room.onPlayerAvatarChange = function(id, value, customData){
    console.log("onPlayerAvatarChange...", id, value, customData);
  };

  room.onPlayerTeamChange = function(id, teamId, byId, customData){
    console.log("onPlayerTeamChange...", id, teamId, byId, customData);
  };

  room.onPlayerHeadlessAvatarChange = function(id, value, customData){
    console.log("onPlayerHeadlessAvatarChange...", id, value, customData);
  };

  room.onPlayersOrderChange = function(idList, moveToTop, customData){
    console.log("onPlayersOrderChange...", idList, moveToTop, customData);
  };

  room.onStadiumChange = function(stadium, byId, customData){
    console.log("onStadiumChange...", stadium, byId, customData);
  };

  room.onTeamsLockChange = function(value, byId, customData){
    console.log("onTeamsLockChange...", value, byId, customData);
  };

  room.onPlayerObjectCreated = function(playerObj, customData){
    console.log("onPlayerObjectCreated...", playerObj, customData);
  };

  room.onPlayerJoin = function(playerObj, customData){
    console.log("onPlayerJoin...", playerObj, customData);
  };

  room.onGamePauseChange = function(isPaused, byId, customData){
    console.log("onGamePauseChange...", isPaused, byId, customData);
  };

  room.onPlayerChat = function(id, message, customData){
    console.log("onPlayerChat...", id, message, customData);
  };

  room.onPlayerInputChange = function(id, value, customData){
    console.log("onPlayerInputChange...", id, value, customData);
  };

  room.onPlayerChatIndicatorChange = function(id, value, customData){
    console.log("onPlayerChatIndicatorChange...", id, value, customData);
  };

  room.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    console.log("onPlayerLeave...", playerObj, reason, isBanned, byId, customData);
  };

  room.onSetDiscProperties = function(id, type, data1, data2, customData){
    console.log("onSetDiscProperties...", id, type, data1, data2, customData);
  };

  room.onKickRateLimitChange = function(min, rate, burst, byId, customData){
    console.log("onKickRateLimitChange...", min, rate, burst, byId, customData);
  };

  room.onGameStart = function(byId, customData){
    console.log("onGameStart...", byId, customData);
  };

  room.onKickOff = function(customData){
    console.log("onKickOff...", customData);
  };

  room.onGameStop = function(byId, customData){
    console.log("onGameStop...", byId, customData);
  };

  room.onPingData = function(array, customData){
    console.log("onPingData...", array, customData);
  };

  room.onExtrapolationChange = function(value, customData){
    console.log("onExtrapolationChange...", value, customData);
  };

  room.onHandicapChange = function(value, customData){
    console.log("onHandicapChange...", value, customData);
  };

  room.onBansClear = function(customData){
    console.log("onBansClear...", customData);
  };

  room.onRoomRecaptchaModeChange = function(on, customData){
    console.log("onRoomRecaptchaModeChange...", on, customData);
  };

  room.onRoomPropertiesChange = function(props, customData){
    console.log("onRoomPropertiesChange...", props, customData);
  };

  room.onTeamColorsChange = function(teamId, value, byId, customData){
    console.log("onTeamColorsChange...", teamId, value, byId, customData);
  };

  room.onTimeIsUp = function(customData){
    console.log("onTimeIsUp...", customData);
  };

  room.onPositionsReset = function(customData){
    console.log("onPositionsReset...", customData);
  };

  room.onRoomRecordingChange = function(value, customData){
    console.log("onRoomRecordingChange...", value, customData);
  };

  room.onPluginActiveChange = function(plugin, customData){
    console.log("onPluginActiveChange...", plugin, customData);
  };

  room.onCollisionDiscVsDisc = function(discId1, discPlayerId1, discId2, discPlayerId2, customData){
    console.log("onCollisionDiscVsDisc...", discId1, discPlayerId1, discId2, discPlayerId2, customData);
  };

  room.onCollisionDiscVsSegment = function(discId, discPlayerId, segmentId, customData){
    console.log("onCollisionDiscVsSegment...", discId, discPlayerId, segmentId, customData);
  };

  room.onCollisionDiscVsPlane = function(discId, discPlayerId, planeId, customData){
    console.log("onCollisionDiscVsPlane...", discId, discPlayerId, planeId, customData);
  };

  room.onCustomEvent = function(type, data, byId, customData){
    console.log("onCustomEvent...", type, data, byId, customData);
  };

  room.onConfigUpdate = function(oldRoomConfigObj, newRoomConfigObj, customData){
    console.log("onConfigUpdate...", oldRoomConfigObj, newRoomConfigObj, customData);
  };

  room.onRendererUpdate = function(oldRendererObj, newRendererObj, customData){
    console.log("onRendererUpdate...", oldRendererObj, newRendererObj, customData);
  };

  room.onPluginUpdate = function(oldPluginObj, newPluginObj, customData){
    console.log("onPluginUpdate...", oldPluginObj, newPluginObj, customData);
  };

  room.onLibraryUpdate = function(oldLibraryObj, newLibraryObj, customData){
    console.log("onLibraryUpdate...", oldLibraryObj, newLibraryObj, customData);
  };

  room.onLanguageChange = function(abbr, customData){
    console.log("onLanguageChange...", abbr, customData);
  };

}

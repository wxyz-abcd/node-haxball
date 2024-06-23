module.exports = function(API){
  var { AllowFlags, RoomConfig } = API;

  Object.setPrototypeOf(this, RoomConfig.prototype);
  RoomConfig.call(this, { // Every roomConfig should have a unique name.
    name: "template",
    version: "0.1",
    author: "abc",
    description: `This is a template roomConfig`,
    allowFlags: AllowFlags.CreateRoom|AllowFlags.JoinRoom // We allow this roomConfig to be activated on both CreateRoom and JoinRoom.
  });

  this.initialize = function(){};
  this.finalize = function(){};

  // modifier callbacks:
  this.modifyPlayerDataBefore = function(playerId, name, flag, avatar, conn, auth){return [[modifiedNick, modifiedAvatar, modifiedFlag]/*, customData*/];};
  this.modifyPlayerData = function(playerId, name, flag, avatar, conn, auth, customData){return [modifiedNick, modifiedAvatar, modifiedFlag];};
  this.modifyPlayerDataAfter = function(playerId, name, flag, avatar, conn, auth, customData){return [modifiedNick, modifiedAvatar, modifiedFlag];};

  this.modifyPlayerPingBefore = function(playerId, ping){return [newPing/*, customData*/];};
  this.modifyPlayerPing = function(playerId, ping, customData){return newPing;};
  this.modifyPlayerPingAfter = function(playerId, ping, customData){return newPing;};

  this.modifyClientPingBefore = function(ping){return [newPing/*, customData*/];};
  this.modifyClientPing = function(ping, customData){return newPing;};
  this.modifyClientPingAfter = function(ping, customData){return newPing;};

  this.modifyFrameNoBefore = function(frameNo){return [newFrameNo/*, customData*/];};
  this.modifyFrameNo = function(frameNo, customData){return newFrameNo;};
  this.modifyFrameNoAfter = function(frameNo, customData){return newFrameNo;};

  this.onBeforeOperationReceived = function(type, msg, globalFrameNo, clientFrameNo){/*return customData;*/};
  this.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){return true;};
  this.onAfterOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){return true;};

  // callbacks:
  this.onBeforeRoomLink = function(link){/*return customData;*/};
  this.onRoomLink = function(link, customData){};
  this.onAfterRoomLink = function(link, customData){};

  this.onBeforePlayerBallKick = function(playerId){/*return customData;*/};
  this.onPlayerBallKick = function(playerId, customData){};
  this.onAfterPlayerBallKick = function(playerId, customData){};

  this.onBeforeTeamGoal = function(teamId){/*return customData;*/};
  this.onTeamGoal = function(teamId, customData){};
  this.onAfterTeamGoal = function(teamId, customData){};

  this.onBeforeGameEnd = function(winningTeamId){/*return customData;*/};
  this.onGameEnd = function(winningTeamId, customData){};
  this.onAfterGameEnd = function(winningTeamId, customData){};

  this.onBeforeGameTick = function(){/*return customData;*/};
  this.onGameTick = function(customData){};
  this.onAfterGameTick = function(customData){};

  this.onBeforePlayerSyncChange = function(playerId, value){/*return customData;*/};
  this.onPlayerSyncChange = function(playerId, value, customData){};
  this.onAfterPlayerSyncChange = function(playerId, value, customData){};

  this.onBeforeAnnouncement = function(msg, color, style, sound){/*return customData;*/};
  this.onAnnouncement = function(msg, color, style, sound, customData){};
  this.onAfterAnnouncement = function(msg, color, style, sound, customData){};

  this.onBeforeAutoTeams = function(playerId1, teamId1, playerId2, teamId2, byId){/*return customData;*/};
  this.onAutoTeams = function(playerId1, teamId1, playerId2, teamId2, byId, customData){};
  this.onAfterAutoTeams = function(playerId1, teamId1, playerId2, teamId2, byId, customData){};

  this.onBeforeScoreLimitChange = function(value, byId){/*return customData;*/};
  this.onScoreLimitChange = function(value, byId, customData){};
  this.onAfterScoreLimitChange = function(value, byId, customData){};

  this.onBeforeTimeLimitChange = function(value, byId){/*return customData;*/};
  this.onTimeLimitChange = function(value, byId, customData){};
  this.onAfterTimeLimitChange = function(value, byId, customData){};

  this.onBeforePlayerAdminChange = function(id, isAdmin, byId){/*return customData;*/};
  this.onPlayerAdminChange = function(id, isAdmin, byId, customData){};
  this.onAfterPlayerAdminChange = function(id, isAdmin, byId, customData){};

  this.onBeforePlayerAvatarChange = function(id, value){/*return customData;*/};
  this.onPlayerAvatarChange = function(id, value, customData){};
  this.onAfterPlayerAvatarChange = function(id, value, customData){};

  this.onBeforePlayerTeamChange = function(id, teamId, byId){/*return customData;*/};
  this.onPlayerTeamChange = function(id, teamId, byId, customData){};
  this.onAfterPlayerTeamChange = function(id, teamId, byId, customData){};

  this.onBeforePlayerHeadlessAvatarChange = function(id, value){/*return customData*/};
  this.onPlayerHeadlessAvatarChange = function(id, value, customData){};
  this.onAfterPlayerHeadlessAvatarChange = function(id, value, customData){};

  this.onBeforePlayersOrderChange = function(idList, moveToTop){/*return customData*/};
  this.onPlayersOrderChange = function(idList, moveToTop, customData){};
  this.onAfterPlayersOrderChange = function(idList, moveToTop, customData){};

  this.onBeforeStadiumChange = function(stadium, byId){/*return customData;*/};
  this.onStadiumChange = function(stadium, byId, customData){};
  this.onAfterStadiumChange = function(stadium, byId, customData){};

  this.onBeforeTeamsLockChange = function(value, byId){/*return customData;*/};
  this.onTeamsLockChange = function(value, byId, customData){};
  this.onAfterTeamsLockChange = function(value, byId, customData){};

  this.onBeforePlayerObjectCreated = function(playerObj){/*return customData;*/};
  this.onPlayerObjectCreated = function(playerObj, customData){};
  this.onAfterPlayerObjectCreated = function(playerObj, customData){};

  this.onBeforePlayerDiscCreated = function(playerObj){/*return customData;*/};
  this.onPlayerDiscCreated = function(playerObj, customData){};
  this.onAfterPlayerDiscCreated = function(playerObj, customData){};

  this.onBeforePlayerDiscDestroyed = function(playerObj){/*return customData;*/};
  this.onPlayerDiscDestroyed = function(playerObj, customData){};
  this.onAfterPlayerDiscDestroyed = function(playerObj, customData){};

  this.onBeforePlayerJoin = function(playerObj){/*return customData;*/};
  this.onPlayerJoin = function(playerObj, customData){};
  this.onAfterPlayerJoin = function(playerObj, customData){};

  this.onBeforeGamePauseChange = function(isPaused, byId){/*return customData;*/};
  this.onGamePauseChange = function(isPaused, byId, customData){};
  this.onAfterGamePauseChange = function(isPaused, byId, customData){};

  this.onBeforePlayerChat = function(id, message){/*return customData;*/};
  this.onPlayerChat = function(id, message, customData){};
  this.onAfterPlayerChat = function(id, message, customData){};

  this.onBeforePlayerInputChange = function(id, value){/*return customData;*/};
  this.onPlayerInputChange = function(id, value, customData){};
  this.onAfterPlayerInputChange = function(id, value, customData){};

  this.onBeforePlayerChatIndicatorChange = function(id, value){/*return customData;*/};
  this.onPlayerChatIndicatorChange = function(id, value, customData){};
  this.onAfterPlayerChatIndicatorChange = function(id, value, customData){};

  this.onBeforePlayerLeave = function(playerObj, reason, isBanned, byId){/*return customData;*/};
  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){};
  this.onAfterPlayerLeave = function(playerObj, reason, isBanned, byId, customData){};

  this.onBeforeSetDiscProperties = function(id, type, data1, data2){/*return customData;*/};
  this.onSetDiscProperties = function(id, type, data1, data2, customData){};
  this.onAfterSetDiscProperties = function(id, type, data1, data2, customData){};

  this.onBeforeKickRateLimitChange = function(min, rate, burst, byId){/*return customData;*/};
  this.onKickRateLimitChange = function(min, rate, burst, byId, customData){};
  this.onAfterKickRateLimitChange = function(min, rate, burst, byId, customData){};

  this.onBeforeTeamColorsChange = function(teamId, value, byId){/*return customData;*/};
  this.onTeamColorsChange = function(teamId, value, byId, customData){};
  this.onAfterTeamColorsChange = function(teamId, value, byId, customData){};

  this.onBeforeGameStart = function(byId){/*return customData;*/};
  this.onGameStart = function(byId, customData){};
  this.onAfterGameStart = function(byId, customData){};

  this.onBeforeKickOff = function(){/*return customData;*/};
  this.onKickOff = function(customData){};
  this.onAfterKickOff = function(customData){};

  this.onBeforeTimeIsUp = function(){/*return customData;*/};
  this.onTimeIsUp = function(customData){};
  this.onAfterTimeIsUp = function(customData){};

  this.onBeforePositionsReset = function(){/*return customData;*/};
  this.onPositionsReset = function(customData){};
  this.onAfterPositionsReset = function(customData){};

  this.onBeforeGameStop = function(byId){/*return customData;*/};
  this.onGameStop = function(byId, customData){};
  this.onAfterGameStop = function(byId, customData){};

  this.onBeforePingData = function(array){/*return customData;*/};
  this.onPingData = function(array, customData){};
  this.onAfterPingData = function(array, customData){};

  this.onBeforeExtrapolationChange = function(value){/*return customData;*/};
  this.onExtrapolationChange = function(value, customData){};
  this.onAfterExtrapolationChange = function(value, customData){};

  this.onBeforeHandicapChange = function(value){/*return customData;*/};
  this.onHandicapChange = function(value, customData){};
  this.onAfterHandicapChange = function(value, customData){};

  this.onBeforeBansClear = function(){/*return customData;*/};
  this.onBansClear = function(customData){};
  this.onAfterBansClear = function(customData){};

  this.onBeforeBanClear = function(id){/*return customData;*/};
  this.onBanClear = function(id, customData){};
  this.onAfterBanClear = function(id, customData){};

  this.onBeforeRoomRecaptchaModeChange = function(on){/*return customData;*/};
  this.onRoomRecaptchaModeChange = function(on, customData){};
  this.onAfterRoomRecaptchaModeChange = function(on, customData){};

  this.onBeforeRoomTokenChange = function(token){/*return customData;*/};
  this.onRoomTokenChange = function(token, customData){};
  this.onAfterRoomTokenChange = function(token, customData){};

  this.onBeforeRoomRecordingChange = function(value){/*return customData;*/};
  this.onRoomRecordingChange = function(value, customData){};
  this.onAfterRoomRecordingChange = function(value, customData){};

  this.onBeforeRoomPropertiesChange = function(props){/*return customData;*/};
  this.onRoomPropertiesChange = function(props, customData){};
  this.onAfterRoomPropertiesChange = function(props, customData){};

  this.onBeforeCollisionDiscVsDisc = function(discId1, discPlayerId1, discId2, discPlayerId2){/*return customData;*/};
  this.onCollisionDiscVsDisc = function(discId1, discPlayerId1, discId2, discPlayerId2, customData){};
  this.onAfterCollisionDiscVsDisc = function(discId1, discPlayerId1, discId2, discPlayerId2, customData){};

  this.onBeforeCollisionDiscVsSegment = function(discId, discPlayerId, segmentId){/*return customData;*/};
  this.onCollisionDiscVsSegment = function(discId, discPlayerId, segmentId, customData){};
  this.onAfterCollisionDiscVsSegment = function(discId, discPlayerId, segmentId, customData){};

  this.onBeforeCollisionDiscVsPlane = function(discId, discPlayerId, planeId){/*return customData;*/};
  this.onCollisionDiscVsPlane = function(discId, discPlayerId, planeId, customData){};
  this.onAfterCollisionDiscVsPlane = function(discId, discPlayerId, planeId, customData){};

  this.onBeforeCustomEvent = function(type, data, byId){/*return customData;*/};
  this.onCustomEvent = function(type, data, byId, customData){};
  this.onAfterCustomEvent = function(type, data, byId, customData){};

  this.onBeforeBinaryCustomEvent = function(type, data, byId){/*return customData;*/};
  this.onBinaryCustomEvent = function(type, data, byId, customData){};
  this.onAfterBinaryCustomEvent = function(type, data, byId, customData){};

  this.onBeforeIdentityEvent = function(id, data, byId){/*return customData;*/};
  this.onIdentityEvent = function(id, data, byId, customData){};
  this.onAfterIdentityEvent = function(id, data, byId, customData){};

  this.onBeforePluginActiveChange = function(plugin){/*return customData;*/};
  this.onPluginActiveChange = function(plugin, customData){};
  this.onAfterPluginActiveChange = function(plugin, customData){};

  this.onBeforeConfigUpdate = function(oldRoomConfigObj, newRoomConfigObj){/*return customData;*/};
  this.onConfigUpdate = function(oldRoomConfigObj, newRoomConfigObj, customData){};
  this.onAfterConfigUpdate = function(oldRoomConfigObj, newRoomConfigObj, customData){};

  this.onBeforeRendererUpdate = function(oldRendererObj, newRendererObj){/*return customData;*/};
  this.onRendererUpdate = function(oldRendererObj, newRendererObj, customData){};
  this.onAfterRendererUpdate = function(oldRendererObj, newRendererObj, customData){};

  this.onBeforePluginUpdate = function(oldPluginObj, newPluginObj){/*return customData;*/};
  this.onPluginUpdate = function(oldPluginObj, newPluginObj, customData){};
  this.onAfterPluginUpdate = function(oldPluginObj, newPluginObj, customData){};

  this.onBeforeLibraryUpdate = function(oldLibraryObj, newLibraryObj){/*return customData;*/};
  this.onLibraryUpdate = function(oldLibraryObj, newLibraryObj, customData){};
  this.onAfterLibraryUpdate = function(oldLibraryObj, newLibraryObj, customData){};

  this.onBeforeLanguageChange = function(abbr){/*return customData;*/};
  this.onLanguageChange = function(abbr, customData){};
  this.onAfterLanguageChange = function(abbr, customData){};
};

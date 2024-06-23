function defineRoomCallbacks(room){
  // modifier callbacks:
  room.modifyPlayerDataBefore = function(playerId, name, flag, avatar, conn, auth){return [[modifiedNick, modifiedAvatar, modifiedFlag]/*, customData*/];};
  room.modifyPlayerData = function(playerId, name, flag, avatar, conn, auth, customData){return [modifiedNick, modifiedAvatar, modifiedFlag];};
  room.modifyPlayerDataAfter = function(playerId, name, flag, avatar, conn, auth, customData){return [modifiedNick, modifiedAvatar, modifiedFlag];};

  room.modifyPlayerPingBefore = function(playerId, ping){return [newPing/*, customData*/];};
  room.modifyPlayerPing = function(playerId, ping, customData){return newPing;};
  room.modifyPlayerPingAfter = function(playerId, ping, customData){return newPing;};

  room.modifyClientPingBefore = function(ping){return [newPing/*, customData*/];};
  room.modifyClientPing = function(ping, customData){return newPing;};
  room.modifyClientPingAfter = function(ping, customData){return newPing;};

  room.modifyFrameNoBefore = function(frameNo){return [newFrameNo/*, customData*/];};
  room.modifyFrameNo = function(frameNo, customData){return newFrameNo;};
  room.modifyFrameNoAfter = function(frameNo, customData){return newFrameNo;};

  room.onBeforeOperationReceived = function(type, msg, globalFrameNo, clientFrameNo){/*return customData;*/};
  room.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){return true;};
  room.onAfterOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){return true;};

  // callbacks:
  room.onBeforeRoomLink = function(link){/*return customData;*/};
  room.onRoomLink = function(link, customData){};
  room.onAfterRoomLink = function(link, customData){};

  room.onBeforePlayerBallKick = function(playerId){/*return customData;*/};
  room.onPlayerBallKick = function(playerId, customData){};
  room.onAfterPlayerBallKick = function(playerId, customData){};

  room.onBeforeTeamGoal = function(teamId){/*return customData;*/};
  room.onTeamGoal = function(teamId, customData){};
  room.onAfterTeamGoal = function(teamId, customData){};

  room.onBeforeGameEnd = function(winningTeamId){/*return customData;*/};
  room.onGameEnd = function(winningTeamId, customData){};
  room.onAfterGameEnd = function(winningTeamId, customData){};

  room.onBeforeGameTick = function(){/*return customData;*/};
  room.onGameTick = function(customData){};
  room.onAfterGameTick = function(customData){};

  room.onBeforePlayerSyncChange = function(playerId, value){/*return customData;*/};
  room.onPlayerSyncChange = function(playerId, value, customData){};
  room.onAfterPlayerSyncChange = function(playerId, value, customData){};

  room.onBeforeAnnouncement = function(msg, color, style, sound){/*return customData;*/};
  room.onAnnouncement = function(msg, color, style, sound, customData){};
  room.onAfterAnnouncement = function(msg, color, style, sound, customData){};

  room.onBeforeAutoTeams = function(playerId1, teamId1, playerId2, teamId2, byId){/*return customData;*/};
  room.onAutoTeams = function(playerId1, teamId1, playerId2, teamId2, byId, customData){};
  room.onAfterAutoTeams = function(playerId1, teamId1, playerId2, teamId2, byId, customData){};

  room.onBeforeScoreLimitChange = function(value, byId){/*return customData;*/};
  room.onScoreLimitChange = function(value, byId, customData){};
  room.onAfterScoreLimitChange = function(value, byId, customData){};

  room.onBeforeTimeLimitChange = function(value, byId){/*return customData;*/};
  room.onTimeLimitChange = function(value, byId, customData){};
  room.onAfterTimeLimitChange = function(value, byId, customData){};

  room.onBeforePlayerAdminChange = function(id, isAdmin, byId){/*return customData;*/};
  room.onPlayerAdminChange = function(id, isAdmin, byId, customData){};
  room.onAfterPlayerAdminChange = function(id, isAdmin, byId, customData){};

  room.onBeforePlayerAvatarChange = function(id, value){/*return customData;*/};
  room.onPlayerAvatarChange = function(id, value, customData){};
  room.onAfterPlayerAvatarChange = function(id, value, customData){};

  room.onBeforePlayerTeamChange = function(id, teamId, byId){/*return customData;*/};
  room.onPlayerTeamChange = function(id, teamId, byId, customData){};
  room.onAfterPlayerTeamChange = function(id, teamId, byId, customData){};

  room.onBeforePlayerHeadlessAvatarChange = function(id, value){/*return customData*/};
  room.onPlayerHeadlessAvatarChange = function(id, value, customData){};
  room.onAfterPlayerHeadlessAvatarChange = function(id, value, customData){};

  room.onBeforePlayersOrderChange = function(idList, moveToTop){/*return customData*/};
  room.onPlayersOrderChange = function(idList, moveToTop, customData){};
  room.onAfterPlayersOrderChange = function(idList, moveToTop, customData){};

  room.onBeforeStadiumChange = function(stadium, byId){/*return customData;*/};
  room.onStadiumChange = function(stadium, byId, customData){};
  room.onAfterStadiumChange = function(stadium, byId, customData){};

  room.onBeforeTeamsLockChange = function(value, byId){/*return customData;*/};
  room.onTeamsLockChange = function(value, byId, customData){};
  room.onAfterTeamsLockChange = function(value, byId, customData){};

  room.onBeforePlayerObjectCreated = function(playerObj){/*return customData;*/};
  room.onPlayerObjectCreated = function(playerObj, customData){};
  room.onAfterPlayerObjectCreated = function(playerObj, customData){};

  room.onBeforePlayerDiscCreated = function(playerObj){/*return customData;*/};
  room.onPlayerDiscCreated = function(playerObj, customData){};
  room.onAfterPlayerDiscCreated = function(playerObj, customData){};

  room.onBeforePlayerDiscDestroyed = function(playerObj){/*return customData;*/};
  room.onPlayerDiscDestroyed = function(playerObj, customData){};
  room.onAfterPlayerDiscDestroyed = function(playerObj, customData){};

  room.onBeforePlayerJoin = function(playerObj){/*return customData;*/};
  room.onPlayerJoin = function(playerObj, customData){};
  room.onAfterPlayerJoin = function(playerObj, customData){};

  room.onBeforeGamePauseChange = function(isPaused, byId){/*return customData;*/};
  room.onGamePauseChange = function(isPaused, byId, customData){};
  room.onAfterGamePauseChange = function(isPaused, byId, customData){};

  room.onBeforePlayerChat = function(id, message){/*return customData;*/};
  room.onPlayerChat = function(id, message, customData){};
  room.onAfterPlayerChat = function(id, message, customData){};

  room.onBeforePlayerInputChange = function(id, value){/*return customData;*/};
  room.onPlayerInputChange = function(id, value, customData){};
  room.onAfterPlayerInputChange = function(id, value, customData){};

  room.onBeforePlayerChatIndicatorChange = function(id, value){/*return customData;*/};
  room.onPlayerChatIndicatorChange = function(id, value, customData){};
  room.onAfterPlayerChatIndicatorChange = function(id, value, customData){};

  room.onBeforePlayerLeave = function(playerObj, reason, isBanned, byId){/*return customData;*/};
  room.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){};
  room.onAfterPlayerLeave = function(playerObj, reason, isBanned, byId, customData){};

  room.onBeforeSetDiscProperties = function(id, type, data1, data2){/*return customData;*/};
  room.onSetDiscProperties = function(id, type, data1, data2, customData){};
  room.onAfterSetDiscProperties = function(id, type, data1, data2, customData){};

  room.onBeforeKickRateLimitChange = function(min, rate, burst, byId){/*return customData;*/};
  room.onKickRateLimitChange = function(min, rate, burst, byId, customData){};
  room.onAfterKickRateLimitChange = function(min, rate, burst, byId, customData){};

  room.onBeforeTeamColorsChange = function(teamId, value, byId){/*return customData;*/};
  room.onTeamColorsChange = function(teamId, value, byId, customData){};
  room.onAfterTeamColorsChange = function(teamId, value, byId, customData){};

  room.onBeforeGameStart = function(byId){/*return customData;*/};
  room.onGameStart = function(byId, customData){};
  room.onAfterGameStart = function(byId, customData){};

  room.onBeforeKickOff = function(){/*return customData;*/};
  room.onKickOff = function(customData){};
  room.onAfterKickOff = function(customData){};

  room.onBeforeTimeIsUp = function(){/*return customData;*/};
  room.onTimeIsUp = function(customData){};
  room.onAfterTimeIsUp = function(customData){};

  room.onBeforePositionsReset = function(){/*return customData;*/};
  room.onPositionsReset = function(customData){};
  room.onAfterPositionsReset = function(customData){};

  room.onBeforeGameStop = function(byId){/*return customData;*/};
  room.onGameStop = function(byId, customData){};
  room.onAfterGameStop = function(byId, customData){};

  room.onBeforePingData = function(array){/*return customData;*/};
  room.onPingData = function(array, customData){};
  room.onAfterPingData = function(array, customData){};

  room.onBeforeExtrapolationChange = function(value){/*return customData;*/};
  room.onExtrapolationChange = function(value, customData){};
  room.onAfterExtrapolationChange = function(value, customData){};

  room.onBeforeHandicapChange = function(value){/*return customData;*/};
  room.onHandicapChange = function(value, customData){};
  room.onAfterHandicapChange = function(value, customData){};

  room.onBeforeBansClear = function(){/*return customData;*/};
  room.onBansClear = function(customData){};
  room.onAfterBansClear = function(customData){};

  room.onBeforeBanClear = function(id){/*return customData;*/};
  room.onBanClear = function(id, customData){};
  room.onAfterBanClear = function(id, customData){};

  room.onBeforeRoomRecaptchaModeChange = function(on){/*return customData;*/};
  room.onRoomRecaptchaModeChange = function(on, customData){};
  room.onAfterRoomRecaptchaModeChange = function(on, customData){};

  room.onBeforeRoomTokenChange = function(token){/*return customData;*/};
  room.onRoomTokenChange = function(token, customData){};
  room.onAfterRoomTokenChange = function(token, customData){};

  room.onBeforeRoomRecordingChange = function(value){/*return customData;*/};
  room.onRoomRecordingChange = function(value, customData){};
  room.onAfterRoomRecordingChange = function(value, customData){};

  room.onBeforeRoomPropertiesChange = function(props){/*return customData;*/};
  room.onRoomPropertiesChange = function(props, customData){};
  room.onAfterRoomPropertiesChange = function(props, customData){};

  room.onBeforeCollisionDiscVsDisc = function(discId1, discPlayerId1, discId2, discPlayerId2){/*return customData;*/};
  room.onCollisionDiscVsDisc = function(discId1, discPlayerId1, discId2, discPlayerId2, customData){};
  room.onAfterCollisionDiscVsDisc = function(discId1, discPlayerId1, discId2, discPlayerId2, customData){};

  room.onBeforeCollisionDiscVsSegment = function(discId, discPlayerId, segmentId){/*return customData;*/};
  room.onCollisionDiscVsSegment = function(discId, discPlayerId, segmentId, customData){};
  room.onAfterCollisionDiscVsSegment = function(discId, discPlayerId, segmentId, customData){};

  room.onBeforeCollisionDiscVsPlane = function(discId, discPlayerId, planeId){/*return customData;*/};
  room.onCollisionDiscVsPlane = function(discId, discPlayerId, planeId, customData){};
  room.onAfterCollisionDiscVsPlane = function(discId, discPlayerId, planeId, customData){};

  room.onBeforeCustomEvent = function(type, data, byId){/*return customData;*/};
  room.onCustomEvent = function(type, data, byId, customData){};
  room.onAfterCustomEvent = function(type, data, byId, customData){};

  room.onBeforeBinaryCustomEvent = function(type, data, byId){/*return customData;*/};
  room.onBinaryCustomEvent = function(type, data, byId, customData){};
  room.onAfterBinaryCustomEvent = function(type, data, byId, customData){};

  room.onBeforeIdentityEvent = function(id, data, byId){/*return customData;*/};
  room.onIdentityEvent = function(id, data, byId, customData){};
  room.onAfterIdentityEvent = function(id, data, byId, customData){};

  room.onBeforePluginActiveChange = function(plugin){/*return customData;*/};
  room.onPluginActiveChange = function(plugin, customData){};
  room.onAfterPluginActiveChange = function(plugin, customData){};

  room.onBeforeConfigUpdate = function(oldRoomConfigObj, newRoomConfigObj){/*return customData;*/};
  room.onConfigUpdate = function(oldRoomConfigObj, newRoomConfigObj, customData){};
  room.onAfterConfigUpdate = function(oldRoomConfigObj, newRoomConfigObj, customData){};

  room.onBeforeRendererUpdate = function(oldRendererObj, newRendererObj){/*return customData;*/};
  room.onRendererUpdate = function(oldRendererObj, newRendererObj, customData){};
  room.onAfterRendererUpdate = function(oldRendererObj, newRendererObj, customData){};

  room.onBeforePluginUpdate = function(oldPluginObj, newPluginObj){/*return customData;*/};
  room.onPluginUpdate = function(oldPluginObj, newPluginObj, customData){};
  room.onAfterPluginUpdate = function(oldPluginObj, newPluginObj, customData){};

  room.onBeforeLibraryUpdate = function(oldLibraryObj, newLibraryObj){/*return customData;*/};
  room.onLibraryUpdate = function(oldLibraryObj, newLibraryObj, customData){};
  room.onAfterLibraryUpdate = function(oldLibraryObj, newLibraryObj, customData){};

  room.onBeforeLanguageChange = function(abbr){/*return customData;*/};
  room.onLanguageChange = function(abbr, customData){};
  room.onAfterLanguageChange = function(abbr, customData){};
};

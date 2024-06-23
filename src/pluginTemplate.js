module.exports = function(API){
  var { AllowFlags, Plugin } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "template", true, { // "template" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This is a template plugin`,
    allowFlags: AllowFlags.CreateRoom|AllowFlags.JoinRoom // We allow this plugin to be activated on both CreateRoom and JoinRoom.
  });

  this.initialize = function(){};
  this.finalize = function(){};

  this.modifyPlayerData = function(playerId, name, flag, avatar, conn, auth, customData){return [modifiedNick, modifiedAvatar, modifiedFlag];};
  this.modifyPlayerPing = function(playerId, ping, customData){return newPing;};
  this.modifyClientPing = function(ping, customData){return newPing;};
  this.modifyFrameNo = function(frameNo){return newFrameNo;};
  this.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){return true;};

  this.onRoomLink = function(link, customData){};
  this.onPlayerBallKick = function(playerId, customData){};
  this.onTeamGoal = function(teamId, customData){};
  this.onGameEnd = function(winningTeamId, customData){};
  this.onGameTick = function(customData){};
  this.onPlayerSyncChange = function(playerId, value, customData){};
  this.onAnnouncement = function(msg, color, style, sound, customData){};
  this.onAutoTeams = function(playerId1, teamId1, playerId2, teamId2, byId, customData){};
  this.onScoreLimitChange = function(value, byId, customData){};
  this.onTimeLimitChange = function(value, byId, customData){};
  this.onPlayerAdminChange = function(id, isAdmin, byId, customData){};
  this.onPlayerAvatarChange = function(id, value, customData){};
  this.onPlayerTeamChange = function(id, teamId, byId, customData){};
  this.onPlayerHeadlessAvatarChange = function(id, value, customData){};
  this.onPlayersOrderChange = function(idList, moveToTop, customData){};
  this.onStadiumChange = function(stadium, byId, customData){};
  this.onTeamsLockChange = function(value, byId, customData){};
  this.onPlayerObjectCreated = function(playerObj, customData){};
  this.onPlayerDiscCreated = function(playerObj, customData){};
  this.onPlayerDiscDestroyed = function(playerObj, customData){};
  this.onPlayerJoin = function(playerObj, customData){};
  this.onGamePauseChange = function(isPaused, byId, customData){};
  this.onPlayerChat = function(id, message, customData){};
  this.onPlayerInputChange = function(id, value, customData){};
  this.onPlayerChatIndicatorChange = function(id, value, customData){};
  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){};
  this.onSetDiscProperties = function(id, type, data1, data2, customData){};
  this.onKickRateLimitChange = function(min, rate, burst, byId, customData){};
  this.onTeamColorsChange = function(teamId, value, byId, customData){};
  this.onGameStart = function(byId, customData){};
  this.onKickOff = function(customData){};
  this.onTimeIsUp = function(customData){};
  this.onPositionsReset = function(customData){};
  this.onGameStop = function(byId, customData){};
  this.onPingData = function(array, customData){};
  this.onExtrapolationChange = function(value, customData){};
  this.onHandicapChange = function(value, customData){};
  this.onBansClear = function(customData){};
  this.onBanClear = function(id, customData){};
  this.onRoomRecaptchaModeChange = function(on, customData){};
  this.onRoomTokenChange = function(token, customData){};
  this.onRoomRecordingChange = function(value, customData){};
  this.onRoomPropertiesChange = function(props, customData){};
  this.onCollisionDiscVsDisc = function(discId1, discPlayerId1, discId2, discPlayerId2, customData){};
  this.onCollisionDiscVsSegment = function(discId, discPlayerId, segmentId, customData){};
  this.onCollisionDiscVsPlane = function(discId, discPlayerId, planeId, customData){};
  this.onCustomEvent = function(type, data, byId, customData){};
  this.onBinaryCustomEvent = function(type, data, byId, customData){};
  this.onIdentityEvent = function(id, data, byId, customData){};
  this.onPluginActiveChange = function(plugin, customData){};
  this.onConfigUpdate = function(oldRoomConfigObj, newRoomConfigObj, customData){};
  this.onRendererUpdate = function(oldRendererObj, newRendererObj, customData){};
  this.onPluginUpdate = function(oldPluginObj, newPluginObj, customData){};
  this.onLibraryUpdate = function(oldLibraryObj, newLibraryObj, customData){};
  this.onLanguageChange = function(abbr, customData){};
};

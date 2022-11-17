const { Plugin } = require(".");

module.exports = function(){
  Plugin.call(this, "template", true); // "template" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.

  this.initialize = function(room){};
  this.finalize = function(){};

  this.onActiveChanged = function(){};

  this.modifyPlayerData = function(playerId, name, flag, avatar, conn, auth, customData){return [modifiedNick, modifiedAvatar, modifiedFlag];};
  this.modifyPlayerPing = function(playerId, ping, customData){return newPing;};
  this.onOperationReceived = function(obj, msg, customData, customData){return true;};

  this.onRoomLink = function(link, customData){};
  this.onPlayerBallKick = function(playerId, customData){};
  this.onTeamGoal = function(teamId, customData){};
  this.onGameEnd = function(winningTeamId, customData){};
  this.onGameTick = function(customData){};
  this.onPlayerSyncChange = function(playerId, value, customData){};
  this.onAnnouncement = function(msg, color, style, sound, customData){};
  this.onAutoTeams1 = function(playerId, teamId, byId, customData){};
  this.onAutoTeams2 = function(playerId1, teamId1, playerId2, teamId2, byId, customData){};
  this.onScoreLimitChange = function(value, byId, customData){};
  this.onTimeLimitChange = function(value, byId, customData){};
  this.onPlayerAdminChange = function(id, isAdmin, byId, customData){};
  this.onPlayerAvatarChange = function(id, value, customData){};
  this.onPlayerTeamChange = function(id, teamId, byId, customData){};
  this.onStadiumChange = function(stadium, byId, customData){};
  this.onTeamsLockChange = function(value, byId, customData){};
  this.onPlayerJoin = function(playerObj, customData){};
  this.onGamePauseChange = function(isPaused, byId, customData){};
  this.onPlayerChat = function(id, message, customData){};
  this.onPlayerInputChange = function(id, value, customData){};
  this.onPlayerChatIndicatorChange = function(id, value, customData){};
  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){};
  this.onSetDiscProperties = function(id, type, data1, data2, customData){};
  this.onKickRateLimitChange = function(min, rate, burst, byId, customData){};
  this.onGameStart = function(byId, customData){};
  this.onGameStop = function(byId, customData){};
  this.onPingData = function(array, customData){};
  this.onExtrapolationChange = function(value, customData){};
  this.onHandicapChange = function(value, customData){};
  this.onBansClear = function(customData){};
  this.onRoomRecaptchaModeChange = function(on, customData){};
  this.onRoomPropertiesChange = function(props, customData){};
  this.onCollisionDiscVsDisc = function(discId1, discPlayerId1, discId2, discPlayerId2, customData){};
  this.onCollisionDiscVsSegment = function(discId, discPlayerId, segmentId, customData){};
  this.onCollisionDiscVsPlane = function(discId, discPlayerId, planeId, customData){};
};

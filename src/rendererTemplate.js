/* 
Example usage:  

var client = new Haxball({
  ..., // all other stuff that you want
  renderer: new Renderer(document.getElementsByTagName("canvas")[0]),
});
*/
function Renderer(canvas){
  this.initialize = function(roomObj){};
  this.finalize = function(){};
  
  this.render = function(extrapolatedRoomPhysicsObj){}; // render logic here. called inside requestAnimationFrame callback
  
  // you can keep track of changes using these callbacks, and apply them in your render logic:
  this.onPluginActiveChange = function(plugin){};

  // these callbacks are available for all plugins also:
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
  this.onStadiumChange = function(stadium, byId, customData){};
  this.onTeamsLockChange = function(value, byId, customData){};
  this.onPlayerObjectCreated = function(playerObj, customData){};
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
  this.onLocalFrame = function(localFrameNo, customData){};
  this.onGameStop = function(byId, customData){};
  this.onPingData = function(array, customData){};
  this.onExtrapolationChange = function(value, customData){};
  this.onHandicapChange = function(value, customData){};
  this.onBansClear = function(customData){};
  this.onRoomRecaptchaModeChange = function(on, customData){};
  this.onRoomRecordingChange = function(value, customData){};
  this.onRoomPropertiesChange = function(props, customData){};
  this.onCollisionDiscVsDisc = function(discId1, discPlayerId1, discId2, discPlayerId2, customData){};
  this.onCollisionDiscVsSegment = function(discId, discPlayerId, segmentId, customData){};
  this.onCollisionDiscVsPlane = function(discId, discPlayerId, planeId, customData){};
  this.onCustomEvent = function(type, data, byId, customData){};
};

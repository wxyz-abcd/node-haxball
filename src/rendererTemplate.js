/* 
Example usage:  

var client = Room.join({ // or Room.create
  ... // all stuff that you want
}, {
  ..., // all other stuff that you want
  renderer: new TemplateRenderer(document.getElementsByTagName("canvas")[0]),
});
*/

module.exports = function(API, canvas){
  var { Renderer } = API;

  Object.setPrototypeOf(this, Renderer.prototype);
  Renderer.call(this, {
    name: "templateRenderer",
    version: "0.1",
    author: "abc",
    description: `This is a template renderer`
  });

  this.initialize = function(){};
  this.finalize = function(){};
  
  this.render = function(extrapolatedRoomState){ // render logic here. called inside requestAnimationFrame callback
    // use "extrapolatedRoomState" contents to get all information about the current extrapolated game state and draw whatever you want into the "canvas" object.
  };
  
  // you can keep track of changes using these callbacks, and apply them in your render logic.
  // these callbacks are also available for all plugins.
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

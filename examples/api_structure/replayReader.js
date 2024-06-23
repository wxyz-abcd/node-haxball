// node.js / CommonJS initialization:
const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API = require("../../src/index")();
// For initialization on browsers, read the documentation here: https://github.com/wxyz-abcd/node-haxball#-usage-on-browser

 // On browsers, you would need a FileReader object to read the contents of the binary replay file instead of the following two lines:
const fs = require("fs");
var data = fs.readFileSync("test.hbr2", null);

var replayReader = Replay.read(data, {
  onPlayerChat: (id, message) => {
    console.log(replayReader.state.getPlayer(id).name + " : " + message);
  },
  onPlayerTeamChange: (id, teamId, byId) => {
    var by = replayReader.state.getPlayer(byId)?.name;
    console.log(replayReader.state.getPlayer(id).name + " was moved to " + (teamId==1?"red":(teamId==2?"blue":"spectators")) + (by ? (" by " + by) : ""));
  },
  onGameTick: ()=>{
    console.log("time:", replayReader.getTime()); // getTime() might yield the same result for successive game ticks.
  },
  /*
  onPlayerBallKick: function(playerId){},
  onTeamGoal: function(teamId){},
  onGameEnd: function(winningTeamId){},
  onPlayerSyncChange: function(playerId, value){},
  onAnnouncement: function(msg, color, style, sound){},
  onAutoTeams: function(playerId1, teamId1, playerId2, teamId2, byId){},
  onScoreLimitChange: function(value, byId){},
  onTimeLimitChange: function(value, byId){},
  onPlayerAdminChange: function(id, isAdmin, byId){},
  onPlayerAvatarChange: function(id, value){},
  onPlayerHeadlessAvatarChange: function(id, value){},
  onPlayersOrderChange: function(idList, moveToTop){},
  onStadiumChange: function(stadium, byId){},
  onTeamsLockChange: function(value, byId){},
  onPlayerObjectCreated: function(playerObj){},
  onPlayerJoin: function(playerObj){},
  onGamePauseChange: function(isPaused, byId){},
  onPlayerInputChange: function(id, value){},
  onPlayerChatIndicatorChange: function(id, value){},
  onPlayerLeave: function(playerObj, reason, isBanned, byId){},
  onSetDiscProperties: function(id, type, data1, data2){},
  onKickRateLimitChange: function(min, rate, burst, byId){},
  onTeamColorsChange: function(teamId, value, byId){},
  onGameStart: function(byId){},
  onKickOff: function(){},
  onTimeIsUp: function(){},
  onPositionsReset: function(){},
  onGameStop: function(byId){},
  onPingData: function(array){},
  onExtrapolationChange: function(value){},
  onHandicapChange: function(value){},
  onBansClear: function(){},
  onRoomRecaptchaModeChange: function(on){},
  onRoomRecordingChange: function(value){},
  onRoomPropertiesChange: function(props){},
  onCollisionDiscVsDisc: function(discId1, discPlayerId1, discId2, discPlayerId2){},
  onCollisionDiscVsSegment: function(discId, discPlayerId, segmentId){},
  onCollisionDiscVsPlane: function(discId, discPlayerId, planeId){},
  render: function(extrapolatedRoomState){ // render logic here. called inside requestAnimationFrame callback
    // use "extrapolatedRoomState" contents to get all information about the current extrapolated game state and draw whatever you want into the "canvas" object.
  }
  */
});

replayReader.onEnd = ()=>{ // close the program when the end of replay data is reached.
  replayReader.destroy();
  process.exit(0);
};

replayReader.setSpeed(1); // start playing

// play for 10 seconds

setTimeout(()=>{
  replayReader.setSpeed(0); // stop playing for 5 seconds
  setTimeout(()=>{
    replayReader.setSpeed(2); // start playing with 2x speed
  }, 5000);
}, 10000);

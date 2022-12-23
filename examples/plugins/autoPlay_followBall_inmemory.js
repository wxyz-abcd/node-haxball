var { Utils, Plugin } = require("../../src/index");

module.exports = function(){

  Plugin.call(this, "autoPlay_followBall_inmemory", false, Plugin.AllowFlags.CreateRoom); // "autoPlay_followBall_inmemory" is plugin's name, "false" means "not activated after initialization". Every plugin should have a unique name. We allow this plugin to be activated on CreateRoom only.

  // parameters are exported so that they can be edited outside this class.
  this.minCoordAlignDelta = 0.5;
  this.minKickDistance = 2;

  var room = null, that = this;

  this.initialize = function(_room){
    room = _room;
  };

  this.finalize = function(){
    room = null;
  };

  this.onActiveChanged = function(){
    if (that.active)
      room.fakePlayerJoin(/*id:*/ 65535, /*name:*/ "in-memory-bot", /*flag:*/ "tr", /*avatar:*/ "XX", /*conn:*/ "fake-ip-do-not-believe-it", /*auth:*/ "fake-auth-do-not-believe-it");
    else
      room.fakePlayerLeave(65535);
  };

  this.onGameTick = function(customData){
    
    // get the original data object of the current player
    var playerDisc = room.getPlayerDiscOriginal(65535);

    // coordinates: playerDisc.a.x, playerDisc.a.y
    // speed: playerDisc.D.x, playerDisc.D.y
    // radius: playerDisc.Z

    if (!playerDisc) // check or else error occurs after changing a player's team to spectators, if the player is not actually in the game, or the game is stopped.
      return;

    // get the original data object of the ball
    var ball = room.getBallOriginal();

    // coordinates: ball.a.x, ball.a.y
    // speed: ball.D.x, ball.D.y
    // radius: ball.Z

    // calculate delta difference for both x and y axis.
    var deltaX = ball.a.x - playerDisc.a.x, deltaY = ball.a.y - playerDisc.a.y, dirX, dirY, kick;

    // x direction:
    if (Math.abs(deltaX) < that.minCoordAlignDelta) // we can omit small delta.
      dirX = 0;
    else 
      dirX = Math.sign(deltaX); // direction is +1 or -1, depending on the delta difference

    // y direction
    if (Math.abs(deltaY) < that.minCoordAlignDelta) // we can omit small delta.
      dirY = 0;
    else
      dirY = Math.sign(deltaY); // direction is +1 or -1, depending on the delta difference

    // kick is true if the distance between ball and player is less than minKickDistance
    kick = (deltaX * deltaX + deltaY * deltaY < (playerDisc.Z + ball.Z + that.minKickDistance) * (playerDisc.Z + ball.Z + that.minKickDistance));

    // apply current keys
    room.fakeSendPlayerInput(/*input:*/ Utils.keyState(dirX, dirY, kick), /*byId:*/ 65535);
  };

};

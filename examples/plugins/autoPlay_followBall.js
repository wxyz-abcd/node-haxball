module.exports = function({ OperationType, ConnectionState, Utils, Plugin, Replay, Room }){

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "autoPlay_followBall", true, { // "autoPlay_followBall" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This is an auto-playing bot that always follows the ball blindly, and kicks it whenever it is nearby without any direction checking. This bot uses real events and controls real players.`,
    allowFlags: Plugin.AllowFlags.CreateRoom | Plugin.AllowFlags.JoinRoom // We allow this plugin to be activated on both CreateRoom and JoinRoom.
  });

  // parameters are exported so that they can be edited outside this class.
  this.minCoordAlignDelta = this.defineVariable({
    name: "minCoordAlignDelta",
    description: "Minimum delta value for coordinate alignment", 
    type: Plugin.VariableType.Number,
    value: 0.5, 
    range: {
      min: 0,
      max: 10,
      step: 0.5
    }
  });

  this.minKickDistance = this.defineVariable({
    name: "minKickDistance",
    description: "Minimum distance between ball and bot player for the bot player to start kicking the ball", 
    type: Plugin.VariableType.Number,
    value: 2, 
    range: {
      min: 0,
      max: 10,
      step: 0.5
    }
  });

  var _room = null, that = this;

  this.initialize = function(room){
    _room = room;
  };

  this.finalize = function(){
    _room = null;
  };

  this.onGameTick = function(customData){
    
    // get the original data object of the current player
    var playerDisc = _room.getPlayerDiscOriginal(_room.currentPlayerId);

    // coordinates: playerDisc.a.x, playerDisc.a.y
    // speed: playerDisc.D.x, playerDisc.D.y
    // radius: playerDisc.Z

    if (!playerDisc) // check or else error occurs after changing a player's team to spectators, if the player is not actually in the game, or the game is stopped.
      return;

    // get the original data object of the ball
    var ball = _room.getBallOriginal();

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
    _room.setKeyState(Utils.keyState(dirX, dirY, kick));
  };
};

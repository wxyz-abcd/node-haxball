module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "autoPlay_followBall", true, { // "autoPlay_followBall" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.3",
    author: "abc",
    description: `This is an auto-playing bot that always follows the ball blindly, and kicks it whenever it is nearby without any direction checking. This bot uses real events and controls real players.`,
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom // We allow this plugin to be activated on both CreateRoom and JoinRoom.
  });

  this.defineVariable({
    name: "minCoordAlignDelta",
    description: "Minimum delta value for coordinate alignment", 
    type: VariableType.Number,
    value: 0.5, 
    range: {
      min: 0,
      max: 10,
      step: 0.5
    }
  });

  this.defineVariable({
    name: "minKickDistance",
    description: "Minimum distance between ball and bot player for the bot player to start kicking the ball", 
    type: VariableType.Number,
    value: 8, 
    range: {
      min: 0,
      max: 15,
      step: 0.5
    }
  });

  var that = this;
  
  this.onGameTick = function(customData){
    // get the extrapolated disc of the data object of the current player
    var playerDisc = that.room.currentPlayer?.disc?.ext;

    // coordinates: playerDisc.pos.x, playerDisc.pos.y
    // speed: playerDisc.speed.x, playerDisc.speed.y
    // radius: playerDisc.radius

    if (!playerDisc) // check or else error occurs after changing a player's team to spectators, if the player is not actually in the game, or the game is stopped.
      return;

    // get the original extrapolated data object of the ball
    var ball = that.room.getBall().ext;

    // coordinates: ball.pos.x, ball.pos.y
    // speed: ball.speed.x, ball.speed.y
    // radius: ball.radius

    // calculate delta difference for both x and y axis.
    var deltaX = ball.pos.x - playerDisc.pos.x, deltaY = ball.pos.y - playerDisc.pos.y, dirX, dirY, kick;

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
    kick = (deltaX * deltaX + deltaY * deltaY < (playerDisc.radius + ball.radius + that.minKickDistance) * (playerDisc.radius + ball.radius + that.minKickDistance));

    // apply current keys
    that.room.setKeyState(Utils.keyState(dirX, dirY, kick));
  };
};

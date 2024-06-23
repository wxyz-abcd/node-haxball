module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, RoomConfig.prototype);
  RoomConfig.call(this, { // Every roomConfig should have a unique name.
    name: "autoPlay_followBall",
    version: "0.4",
    author: "abc",
    description: `This is an auto-playing bot that always follows the ball blindly, and kicks it whenever it is nearby without any direction checking. This bot uses real events and controls real players.`,
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom // We allow this roomConfig to be activated on both CreateRoom and JoinRoom.
  });

  // parameters are exported so that they can be edited outside this class.
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
    var cp = that.room.currentPlayer, playerDisc = cp?.disc?.ext;
    if (!playerDisc) // check or else error occurs after changing a player's team to spectators, if the player is not actually in the game, or the game is stopped.
      return;

    // get the extrapolated game state object
    var { state, gameState, gameStateExt } = that.room;
    gameState = gameStateExt || gameState;

    // get the original extrapolated data object of the ball
    var ball = gameState.physicsState.discs[0];

    // get the coordinates of the ball
    var {x, y} = ball?.pos || {};

    // if ball is not reachable, do nothing.
    if (x==null || isNaN(x) || !isFinite(x) || y==null || isNaN(y) || !isFinite(y)) // check 
      return;

    // speed: playerDisc.speed.x, playerDisc.speed.y
    // radius: playerDisc.radius

    // calculate delta difference for both x and y axis.
    var deltaX = x - playerDisc.pos.x, deltaY = y - playerDisc.pos.y, dirX, dirY, kick;

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

module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API;

  Object.setPrototypeOf(this, RoomConfig.prototype);
  RoomConfig.call(this, { // Every roomConfig should have a unique name.
    name: "autoPlay_followBall",
    version: "0.2",
    author: "abc",
    description: `This is an auto-playing bot that always follows the ball blindly, and kicks it whenever it is nearby without any direction checking. This bot uses real events and controls real players.`,
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom // We allow this roomConfig to be activated on both CreateRoom and JoinRoom.
  });

  // parameters are exported so that they can be edited outside this class.
  this.minCoordAlignDelta = this.defineVariable({
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

  this.minKickDistance = this.defineVariable({
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

  var room = null, that = this;

  // is needed for ball follow logic to pause.
  // notice that this is being updated not only onPositionsReset
  var lastPositionsReset = 0;

  this.initialize = function(_room){
    room = _room;
  };

  this.finalize = function(){
    room = null;
  };

  // move bot in random Y direction
  // to prevent stucking on hitting a ball on a same spot in a same manner.
  // it also fixes a bug when the bot doesn't move after positions resets
  // BUT instead, it creates a new bug... This is not the solution... Must change...
  var moveInRandomY = function(){
    room && room.setKeyState(
      Utils.keyState(0, [1, -1][Math.floor(Math.random() * 2)], false)
    );
  };

  this.onGameStart = function(){
    lastPositionsReset = Date.now();
    moveInRandomY();
  };

  this.onGameTick = function(customData){
    // do not apply ball follow logic for maybe 150ms.
    // is needed for moveInRandomY() to work
    if (Date.now() - lastPositionsReset < 150) return;
    
    // get the original data object of the current player
    var playerDisc = room.getPlayerDisc(room.currentPlayerId);

    // coordinates: playerDisc.pos.x, playerDisc.pos.y
    // speed: playerDisc.speed.x, playerDisc.speed.y
    // radius: playerDisc.radius

    if (!playerDisc) // check or else error occurs after changing a player's team to spectators, if the player is not actually in the game, or the game is stopped.
      return;

    // get the original data object of the ball
    var ball = room.getBall();

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
    room.setKeyState(Utils.keyState(dirX, dirY, kick));
  };

  this.onPlayerTeamChange = function(id){
    if (id === room.currentPlayerId) {
      lastPositionsReset = Date.now();
      moveInRandomY();
    }
  };

  this.onPositionsReset = function(){
    lastPositionsReset = Date.now();
    moveInRandomY();
  };
};

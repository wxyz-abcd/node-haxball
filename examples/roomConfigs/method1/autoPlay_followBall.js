const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API = require("../../../src/index");

const minCoordAlignDelta = 0.5, minKickDistance = 2;

function roomCallback(room){ // examples start from here.
  room.onGameTick = () => {
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
    if (Math.abs(deltaX) < minCoordAlignDelta) // we can omit small delta.
      dirX = 0;
    else 
      dirX = Math.sign(deltaX); // direction is +1 or -1, depending on the delta difference

    // y direction
    if (Math.abs(deltaY) < minCoordAlignDelta) // we can omit small delta.
      dirY = 0;
    else
      dirY = Math.sign(deltaY); // direction is +1 or -1, depending on the delta difference

    // kick is true if the distance between ball and player is less than minKickDistance
    kick = (deltaX * deltaX + deltaY * deltaY < (playerDisc.radius + ball.radius + minKickDistance) * (playerDisc.radius + ball.radius + minKickDistance));

    // apply current keys
    room.setKeyState(Utils.keyState(dirX, dirY, kick));
  };
};

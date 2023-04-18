const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API = require("../../../src/index");

const minCoordAlignDelta = 0.5, minKickDistance = 2;

function roomCallback(room){ // examples start from here.
  room.onGameTick = () => {
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
    var deltaX = ball.pos.x - playerDisc.pos.x, deltaY = ball.pos.y - playerDisc.pos.y;

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

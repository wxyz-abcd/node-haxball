const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API = require("../../../src/index");

const minCoordAlignDelta = 0.5, minKickDistance = 2, maxDistanceToFollowBallCoeff = 0.2;

function roomCallback(room){ // examples start from here.
  room.onGameTick = () => {
    var { state, gameState, gameStateExt } = room;
    gameState = gameStateExt || gameState;
    
    var cp = state.players.filter((x)=>(x.id==_room.currentPlayerId))[0];
    // get the original data object of the current player
    var playerDisc = cp.disc;
    if (!playerDisc) // check or else error occurs after changing a player's team to spectators, if the player is not actually in the game, or the game is stopped.
      return;
    var teamId = cp.team.id; //, oppositeTeamId = 2 - cpTeamId;
    var goals = state.stadium.goals, ball = gameState.physicsState.discs[0];

    // get the coordinates of the ball
    var {x, y} = ball?.pos || {};

    // if ball is not reachable, do nothing.
    if (x==null || isNaN(x) || !isFinite(x) || y==null || isNaN(y) || !isFinite(y)) // check 
      return;

    var targetX, targetY, sqrDistBetweenBallAndPlayer = (x-playerDisc.pos.x) * (x-playerDisc.pos.x) + (y-playerDisc.pos.y) * (y-playerDisc.pos.y);
    var maxDistanceToFollowBall = maxDistanceToFollowBallCoeff * state.stadium.width;
    var b = false;

    if (sqrDistBetweenBallAndPlayer > ((playerDisc.radius + ball.radius + maxDistanceToFollowBall) * (playerDisc.radius + ball.radius + maxDistanceToFollowBall))){
      var myGoal = goals.filter((g)=>(g.team.id==teamId))[0]; //, opponentGoal = goals[oppositeTeamId - 1];
      if (!myGoal)
        return;
      var MPofMyGoalX = (myGoal.p0.x + myGoal.p1.x) / 2, MPofMyGoalY = (myGoal.p0.y + myGoal.p1.y) / 2;
      targetX = (x + MPofMyGoalX) / 2;
      targetY = (y + MPofMyGoalY) / 2;
    }
    else{
      targetX = x;
      targetY = y;
      b = true;
    }

    // calculate delta difference for both x and y axis.
    var deltaX = targetX - playerDisc.pos.x, deltaY = targetY - playerDisc.pos.y, dirX, dirY, kick;
    if (Math.abs(deltaX) < minCoordAlignDelta) // we can omit small delta.
      dirX = 0;
    else 
      dirX = Math.sign(deltaX); // direction is +1 or -1, depending on the delta difference

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

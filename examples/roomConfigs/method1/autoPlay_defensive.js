const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API = require("../../../src/index");

const minCoordAlignDelta = 0.5, minKickDistance = 2;

function roomCallback(room){ // examples start from here.
  /*
  // is needed for ball follow logic to pause.
  // notice that this is being updated not only onPositionsReset
  var lastPositionsReset = 0;

  // move bot in random Y direction
  // to prevent stucking on hitting a ball on a same spot in a same manner.
  // it also fixes a bug when the bot doesn't move after positions resets
  // BUT instead, it creates a new bug... This is not the solution... Must change...
  var moveInRandomY = function(){
    room.setKeyState(
      Utils.keyState(0, [1, -1][Math.floor(Math.random() * 2)], false)
    );
  };

  room.onGameStart = function(){
    lastPositionsReset = Date.now();
    moveInRandomY();
  };
  */
  room.onGameTick = () => {
    // do not apply ball follow logic for maybe 150ms.
    // is needed for moveInRandomY() to work
    // if (Date.now() - lastPositionsReset < 150) return;

    var { state, gameState, gameStateExt } = room;
    gameState = gameStateExt || gameState;
    
    var cp = state.players.filter((x)=>(x.id==_room.currentPlayerId))[0];
    // get the original data object of the current player
    var playerDisc = cp.disc;
    if (!playerDisc) // check or else error occurs after changing a player's team to spectators, if the player is not actually in the game, or the game is stopped.
      return;
    var teamId = cp.team.id; //, oppositeTeamId = 2 - cpTeamId;
    var goals = state.stadium.goals, ball = gameState.physicsState.discs[0];

    var myGoal = goals.filter((g)=>(g.team.id==teamId))[0]; //, opponentGoal = goals[oppositeTeamId - 1];
    if (!myGoal)
      return;
    var MPofMyGoalX = (myGoal.p0.x + myGoal.p1.x) / 2, MPofMyGoalY = (myGoal.p0.y + myGoal.p1.y) / 2;
    var midpointOfBallToMPofMyGoalX = (ball.pos.x + MPofMyGoalX) / 2, midpointOfBallToMPofMyGoalY = (ball.pos.y + MPofMyGoalY) / 2;
  
    // calculate delta difference for both x and y axis.
    var deltaX = midpointOfBallToMPofMyGoalX - playerDisc.pos.x, deltaY = midpointOfBallToMPofMyGoalY - playerDisc.pos.y;

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
  /*
  room.onPlayerTeamChange = function(id){
    if (id === room.currentPlayerId) {
      lastPositionsReset = Date.now();
      moveInRandomY();
    }
  };

  room.onPositionsReset = function(){
    lastPositionsReset = Date.now();
    moveInRandomY();
  };
  */
};

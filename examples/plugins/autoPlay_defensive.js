module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "autoPlay_defensive", true, { // "autoPlay_defensive" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.4",
    author: "abc",
    description: `This is an auto-playing bot that follows the ball if it is near enough, otherwise goes back and tries to be just in the midpoint of ball and his team's goal line; and kicks the ball whenever it is nearby without any direction checking. This bot uses real events and controls real players.`,
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

  this.defineVariable({
    name: "maxDistanceToFollowBallCoeff",
    description: "Coefficient of max distance between ball and player for the bot to follow ball; otherwise it goes back to defense.", 
    type: VariableType.Number,
    value: 0.2, 
    range: {
      min: 0,
      max: 1,
      step: 0.01
    }
  });

  var that = this;

  this.onGameTick = function(customData){
    var { state, gameState, gameStateExt } = that.room;
    gameState = gameStateExt || gameState;

    var cp = that.room.currentPlayer, playerDisc = cp?.disc?.ext;
    if (!playerDisc)
      return;
    var teamId = cp.team.id, opponentTeamId = 3 - teamId;
    var goals = state.stadium.goals, ball = gameState.physicsState.discs[0];
    /*
    var minDistSqr = Infinity, minDistOpponent;
    state.players.forEach((x)=>{
      if (x.team.id == opponentTeamId){
        var distSqr = (playerDisc.pos.x-x.pos.x)*(playerDisc.pos.x-x.pos.x)+(playerDisc.pos.y-x.pos.y)*(playerDisc.pos.y-x.pos.y);
        if (distSqr < minDistSqr){
          minDistSqr = distSqr;
          minDistOpponent = x;
        }
      }
    });
    */
    
    // get the coordinates of the ball
    var {x, y} = ball?.pos || {};

    // if ball is not reachable, do nothing.
    if (x==null || isNaN(x) || !isFinite(x) || y==null || isNaN(y) || !isFinite(y)) // check 
      return;

    var targetX, targetY, sqrDistBetweenBallAndPlayer = (x-playerDisc.pos.x) * (x-playerDisc.pos.x) + (y-playerDisc.pos.y) * (y-playerDisc.pos.y);
    var maxDistanceToFollowBall = that.maxDistanceToFollowBallCoeff * state.stadium.width;
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

    var deltaX = targetX - playerDisc.pos.x, deltaY = targetY - playerDisc.pos.y, dirX, dirY, kick;
    if (Math.abs(deltaX) < that.minCoordAlignDelta)
      dirX = 0;
    else 
      dirX = Math.sign(deltaX);
    if (Math.abs(deltaY) < that.minCoordAlignDelta)
      dirY = 0;
    else
      dirY = Math.sign(deltaY);

    //f(x, y, playerDisc.pos.x, playerDisc.pos.y, myGoal.p0.x, myGoal.p0.y, myGoal.p1.x, myGoal.p1.y)

    //var angle_PlayerToBall = Math.atan2(y-playerDisc.pos.y, x-playerDisc.pos.x);
    //var angle_BallToGoalDisc1 = Math.atan2(myGoal.p0.y-y, myGoal.p0.x-x);
    //var angle_BallToGoalDisc2 = Math.atan2(myGoal.p1.y-y, myGoal.p1.x-x);

    kick = (sqrDistBetweenBallAndPlayer < (playerDisc.radius + ball.radius + that.minKickDistance) * (playerDisc.radius + ball.radius + that.minKickDistance));

    /*
    if (b && kick){  // for dribball maps, reverse the moving direction while kicking the ball
      dirX=-dirX;
      dirY=-dirY;
    }
    */
    
    // apply current keys
    that.room.setKeyState(Utils.keyState(dirX, dirY, kick));
  };
};

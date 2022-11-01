var { keyState, Plugin } = require("../../src/index");

module.exports = function(){

  Plugin.call(this, "autoPlay_defensive", true); // "autoPlay_defensive" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.

  // parameters are exported so that they can be edited outside this class.
  this.minCoordAlignDelta = 0.5;
  this.minKickDistance = 2;
  this.maxDistanceToFollowBallCoeff = 0.2;

  var _room = null, that = this;

  this.initialize = function(room){
    _room = room;
  };

  this.finalize = function(){
    keyboardHelper = null;
    _room = null;
  };

  this.onGameTick = function(customData){
    var { o, p, ep } = _room.getRoomDataOriginal();
    if (ep)
      p = ep;

    var cp = p.Ma.I.filter((p)=>(p.V==_room.currentPlayerId))[0];
    var playerDisc = cp.H;
    if (!playerDisc)
      return;
    var teamId = cp.ea.$, opponentTeamId = 3 - teamId;
    var goals = o.S.tc, ball = p.ta.F[0];
    /*
    var minDistSqr = Infinity, minDistOpponent;
    p.Ma.I.forEach((p)=>{
      if (p.ea.$ == opponentTeamId){
        var distSqr = (playerDisc.a.x-p.a.x)*(playerDisc.a.x-p.a.x)+(playerDisc.a.y-p.a.y)*(playerDisc.a.y-p.a.y);
        if (distSqr < minDistSqr){
          minDistSqr = distSqr;
          minDistOpponent = p;
        }
      }
    });
    */
    var targetX, targetY, sqrDistBetweenBallAndPlayer = (ball.a.x-playerDisc.a.x) * (ball.a.x-playerDisc.a.x) + (ball.a.y-playerDisc.a.y) * (ball.a.y-playerDisc.a.y);
    var maxDistanceToFollowBall = that.maxDistanceToFollowBallCoeff * o.S.$b;
    var b = false;

    if (sqrDistBetweenBallAndPlayer > ((playerDisc.Z + ball.Z + maxDistanceToFollowBall) * (playerDisc.Z + ball.Z + maxDistanceToFollowBall))){
      var myGoal = goals.filter((g)=>(g.qe.$==teamId))[0]; //, opponentGoal = goals[oppositeTeamId - 1];
      if (!myGoal)
        return;
      var MPofMyGoalX = (myGoal.ca.x + myGoal.W.x) / 2, MPofMyGoalY = (myGoal.ca.y + myGoal.W.y) / 2;
      targetX = (ball.a.x + MPofMyGoalX) / 2;
      targetY = (ball.a.y + MPofMyGoalY) / 2;
    }
    else{
      targetX = ball.a.x;
      targetY = ball.a.y;
      b = true;
    }

    var deltaX = targetX - playerDisc.a.x, deltaY = targetY - playerDisc.a.y;
    if (Math.abs(deltaX) < that.minCoordAlignDelta)
      dirX = 0;
    else 
      dirX = Math.sign(deltaX);
    if (Math.abs(deltaY) < that.minCoordAlignDelta)
      dirY = 0;
    else
      dirY = Math.sign(deltaY);

    //f(ball.a.x, ball.a.y, playerDisc.a.x, playerDisc.a.y, myGoal.ca.x, myGoal.ca.y, myGoal.W.x, myGoal.W.y)

    //var angle_PlayerToBall = Math.atan2(ball.a.y-playerDisc.a.y, ball.a.x-playerDisc.a.x);
    //var angle_BallToGoalDisc1 = Math.atan2(myGoal.ca.y-ball.a.y, myGoal.ca.x-ball.a.x);
    //var angle_BallToGoalDisc2 = Math.atan2(myGoal.W.y-ball.a.y, myGoal.W.x-ball.a.x);

    kick = (sqrDistBetweenBallAndPlayer < (playerDisc.Z + ball.Z + that.minKickDistance) * (playerDisc.Z + ball.Z + that.minKickDistance));

    /*
    if (b && kick){  // for dribball maps, reverse the moving direction while kicking the ball
      dirX=-dirX;
      dirY=-dirY;
    }
    */
    
    // apply current keys
    _room.setKeyState(keyState(dirX, dirY, kick));
  };
};

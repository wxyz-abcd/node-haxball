module.exports = function({ OperationType, ConnectionState, Utils, Plugin, Replay, Room }){

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "autoPlay_defensive_inmemory", false, { // "autoPlay_defensive_inmemory" is plugin's name, "false" means "not activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This is an auto-playing bot that follows the ball if it is near enough, otherwise goes back and tries to be just in the midpoint of ball and his team's goal line; and kicks the ball whenever it is nearby without any direction checking. This bot creates a fake player(id=65535) in host's memory and controls it using fake events.`,
    allowFlags: Plugin.AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
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
    value: 8, 
    range: {
      min: 0,
      max: 15,
      step: 0.5
    }
  });

  this.maxDistanceToFollowBallCoeff = this.defineVariable({
    name: "maxDistanceToFollowBallCoeff",
    description: "Coefficient of max distance between ball and player for the bot to follow ball; otherwise it goes back to defense.", 
    type: Plugin.VariableType.Number,
    value: 0.2, 
    range: {
      min: 0,
      max: 1,
      step: 0.01
    }
  });

  var room = null, that = this, oldKeyState = 0, dummyPromise = Promise.resolve();

  this.initialize = function(_room){
    room = _room;
  };

  this.finalize = function(){
    room = null;
  };

  this.onActiveChanged = function(){
    if (that.active)
      room.fakePlayerJoin(/*id:*/ 65535, /*name:*/ "in-memory-bot", /*flag:*/ "tr", /*avatar:*/ "XX", /*conn:*/ "fake-ip-do-not-believe-it", /*auth:*/ "fake-auth-do-not-believe-it");
    else
      room.fakePlayerLeave(65535);
  };

  this.onGameTick = function(customData){
    var { o, p, ep } = room.getRoomDataOriginal();
    if (ep)
      p = ep;

    var cp = p.Ma.I.filter((p)=>(p.V==65535))[0];
    var playerDisc = cp?.H;
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

    var deltaX = targetX - playerDisc.a.x, deltaY = targetY - playerDisc.a.y, dirX, dirY, kick;
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
    var newKeyState = Utils.keyState(dirX, dirY, kick);
    dummyPromise.then(()=>{ // this is just a way of doing this outside onGameTick callback.
      // sending keystate on EVERY game tick causes desync when you deactivate game's browser tab. 
      // this happens because requestAnimationFrame is being used. 
      // therefore, we are trying to limit consequent sending.
      if (newKeyState!=oldKeyState || kick!=cp.Wb){ // Wb: whether x key is active in-game (the circle around players is painted white if Wb is true)
        if ((newKeyState==oldKeyState) && kick && !cp.Wb) // if keyStates are the same and we are trying to kick, but the x key is not active in game,
          room.fakeSendPlayerInput(/*input:*/ newKeyState & -17, /*byId:*/ 65535); // we have to release x key before pressing it again. (newKeyState & -17) changes only the 5th(kick) bit of newKeyState to 0.
        room.fakeSendPlayerInput(/*input:*/ newKeyState, /*byId:*/ 65535); // unlike room.setKeyState, this function directly emits a keystate message.
        oldKeyState = newKeyState;
      }
    });
  };

};

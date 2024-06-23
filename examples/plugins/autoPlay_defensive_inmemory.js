module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "autoPlay_defensive_inmemory", false, { // "autoPlay_defensive_inmemory" is plugin's name, "false" means "not activated just after initialization". Every plugin should have a unique name.
    version: "0.4",
    author: "abc",
    description: `This is an auto-playing bot that follows the ball if it is near enough, otherwise goes back and tries to be just in the midpoint of ball and his team's goal line; and kicks the ball whenever it is nearby without any direction checking. This bot creates a fake player(id=65535) in host's memory and controls it using fake events.`,
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
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

  var that = this, oldKeyState = 0;

  this.onPluginActiveChange = function(plugin, customData){
    if (plugin.name!=that.name)
      return;
    if (that.active)
      that.room.fakePlayerJoin(/*id:*/ 65535, /*name:*/ "in-memory-bot", /*flag:*/ "tr", /*avatar:*/ "XX", /*conn:*/ "fake-ip-do-not-believe-it", /*auth:*/ "fake-auth-do-not-believe-it");
    else
      that.room.fakePlayerLeave(65535);
  };

  this.onGameTick = function(customData){
    // do not apply ball follow logic for maybe 150ms.
    // is needed for moveInRandomY() to work
    if (Date.now() - lastPositionsReset < 150) return;

    var { state, gameState, gameStateExt } = that.room;
    gameState = gameStateExt || gameState;
      
    var cp = state.players.filter((x)=>(x.id==65535))[0];
    var playerDisc = cp?.disc?.ext;
    if (!playerDisc)
      return;
    var teamId = cp.team.id, opponentTeamId = 3 - teamId;
    var goals = state.stadium.goals, ball = gameState.physicsState.discs[0];

    // get the coordinates of the ball
    var {x, y} = ball?.pos || {};

    // if ball is not reachable, do nothing.
    if (x==null || isNaN(x) || !isFinite(x) || y==null || isNaN(y) || !isFinite(y)) // check 
      return;

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
    var newKeyState = Utils.keyState(dirX, dirY, kick);
    Utils.runAfterGameTick(()=>{ // this is just a way of doing this outside onGameTick callback.
      // sending keystate on EVERY game tick causes desync when you deactivate game's browser tab. 
      // this happens because requestAnimationFrame is being used. 
      // therefore, we are trying to limit consequent sending.
      if (newKeyState!=oldKeyState || kick!=cp.isKicking){ // isKicking: whether x key is active in-game (the circle around players is painted white if isKicking is true)
        if ((newKeyState==oldKeyState) && kick && !cp.isKicking) // if keyStates are the same and we are trying to kick, but the x key is not active in game,
          that.room.fakeSendPlayerInput(/*input:*/ newKeyState & -17, /*byId:*/ 65535); // we have to release x key before pressing it again. (newKeyState & -17) changes only the 5th(kick) bit of newKeyState to 0.
        that.room.fakeSendPlayerInput(/*input:*/ newKeyState, /*byId:*/ 65535); // unlike room.setKeyState, this function directly emits a keystate message.
        oldKeyState = newKeyState;
      }
    });
  };
};

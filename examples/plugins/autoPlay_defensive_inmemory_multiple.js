module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "autoPlay_defensive_inmemory_multiple", true, { // "autoPlay_defensive_inmemory_multiple" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.4",
    author: "abc",
    description: `This is an auto-playing bot that follows the ball if it is near enough, otherwise goes back and tries to be just in the midpoint of ball and his team's goal line; and kicks the ball whenever it is nearby without any direction checking.
    This bot is capable of creating/removing fake bot players(id descending from 65535) in host's memory and controlling all of them at the same time using fake events.
    Available commands:
    - !add_bot [name="in-memory-bot"] [flag="tr"] [avatar="XX"] [conn="fake-ip-do-not-believe-it"] [auth="fake-auth-do-not-believe-it"]: Adds a new bot with given properties.
    - !remove_bot: Removes the first added bot that is still not removed.`,
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

  this.defineVariable({
    name: "maxConcurrentBotCount",
    description: "Maximum number of concurrently running bots.", 
    type: VariableType.Integer,
    value: 20, 
    range: {
      min: 1,
      max: Infinity,
      step: 1
    }
  });

  var that = this;

  var smallestBotId = 65535, largestBotId = 65535, botIds = [], keyStates = {};

  var addBot = function(name, flag, avatar, conn, auth){
    if (botIds.length >= that.maxConcurrentBotCount)
      return;
    botIds.push(smallestBotId);
    keyStates[smallestBotId] = 0;
    that.room.fakePlayerJoin(smallestBotId--, name || "in-memory-bot", flag || "tr", avatar || "XX", conn || "fake-ip-do-not-believe-it", auth || "fake-auth-do-not-believe-it");
  };

  var removeBot = function(){
    if (smallestBotId < largestBotId){
      delete keyStates[largestBotId];
      botIds.splice(botIds.indexOf(largestBotId), 1);
      that.room.fakePlayerLeave(largestBotId--);
    }
  };

  this.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){
    switch (type){
      case OperationType.SendChat:{
        /*
        var m = msg.text;
        if (m.startsWith("!")){  // custom chat logic for extra commands
        */
        if (customData?.isCommand){ // same as above 2 lines.
          var arr = customData.data; // same as var arr = m.trimEnd().split(" ");
          switch (arr[0]){
            case "!add_bot": // usage: !add_bot [name] [flag] [avatar] [conn] [auth]
              addBot(arr[1], arr[2], arr[3], arr[4], arr[5]);
              break;
            case "!remove_bot":
              removeBot();
              break;
          }
          //return false; // do not block this event from being processed. it is done automatically in onAfterOperationReceived. 
        }
        break;
      }
    }
    return true;
  };

  this.onGameTick = function(customData){
    var { state, gameState, gameStateExt } = that.room;
    gameState = gameStateExt || gameState;

    // get the original list of goals
    var goals = state.stadium.goals;

    // get the original extrapolated data object of the ball
    var ball = gameState.physicsState.discs[0];

    // get the coordinates of the ball
    var {x, y} = ball?.pos || {};

    // if ball is not reachable, do nothing.
    if (x==null || isNaN(x) || !isFinite(x) || y==null || isNaN(y) || !isFinite(y)) // check 
      return;

    botIds.forEach((botId)=>{

      // get the original data object of the next bot
      var cp = state.players.filter((x)=>(x.id==botId))[0];
      var playerDisc = cp?.disc?.ext;

      // coordinates: playerDisc.pos.x, playerDisc.pos.y
      // speed: playerDisc.speed.x, playerDisc.speed.y
      // radius: playerDisc.radius

      if (!playerDisc) // check or else error occurs after changing a player's team to spectators, if the player is not actually in the game, or the game is stopped.
        return;
      
      var teamId = cp.team.id, opponentTeamId = 3 - teamId;
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
      //var angle_BallToGoalDisc2 = Math.atan2(myGoal.p1.y-y, myGoal.p1p1.x-x);

      kick = (sqrDistBetweenBallAndPlayer < (playerDisc.radius + ball.radius + that.minKickDistance) * (playerDisc.radius + ball.radius + that.minKickDistance));

      /*
      if (b && kick){  // for dribball maps, reverse the moving direction while kicking the ball
        dirX=-dirX;
        dirY=-dirY;
      }
      */
      
      // apply current keys
      var keyState = Utils.keyState(dirX, dirY, kick);
      Utils.runAfterGameTick(()=>{ // this is just a way of doing this outside onGameTick callback.
        if (keyState != keyStates[botId]){ // sending keystate on EVERY game tick causes desync when you deactivate game's browser tab. this happens because requestAnimationFrame is being used. therefore, we are trying to limit consequent sending.
          that.room.fakeSendPlayerInput(/*input:*/ keyState, /*byId:*/ botId); // unlike room.setKeyState, this function directly emits a keystate message.
          keyStates[botId] = keyState;
        }
      });
      Utils.runAfterGameTick(()=>{ // this is just a way of doing this outside onGameTick callback.
        // sending keystate on EVERY game tick causes desync when you deactivate game's browser tab. 
        // this happens because requestAnimationFrame is being used. 
        // therefore, we are trying to limit consequent sending.
        if (keyState!=keyStates[botId] || kick!=cp.isKicking){ // isKicking: whether x key is active in-game (the circle around players is painted white if isKicking is true)
          if ((keyState==keyStates[botId]) && kick && !cp.isKicking) // if keyStates are the same and we are trying to kick, but the x key is not active in game,
            that.room.fakeSendPlayerInput(/*input:*/ keyState & -17, /*byId:*/ botId); // we have to release x key before pressing it again. (keyState & -17) changes only the 5th(kick) bit of keyState to 0.
          that.room.fakeSendPlayerInput(/*input:*/ keyState, /*byId:*/ botId); // unlike room.setKeyState, this function directly emits a keystate message.
          keyStates[botId] = keyState;
        }
      });
    });
  };
};

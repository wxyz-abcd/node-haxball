module.exports = function({ OperationType, ConnectionState, Utils, Plugin, Replay, Room }){

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "autoPlay_defensive_inmemory_multiple", true, { // "autoPlay_defensive_inmemory_multiple" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This is an auto-playing bot that follows the ball if it is near enough, otherwise goes back and tries to be just in the midpoint of ball and his team's goal line; and kicks the ball whenever it is nearby without any direction checking.
    This bot is capable of creating/removing fake bot players(id descending from 65535) in host's memory and controlling all of them at the same time using fake events.
    Available commands:
    - !add_bot [name="in-memory-bot"] [flag="tr"] [avatar="XX"] [conn="fake-ip-do-not-believe-it"] [auth="fake-auth-do-not-believe-it"]: Adds a new bot with given properties.
    - !remove_bot: Removes the first added bot that is still not removed.`,
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
    value: 2, 
    range: {
      min: 0,
      max: 10,
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

  this.maxConcurrentBotCount = this.defineVariable({
    name: "maxConcurrentBotCount",
    description: "Maximum number of concurrently running bots.", 
    type: Plugin.VariableType.Integer,
    value: 20, 
    range: {
      min: 1,
      max: Infinity,
      step: 1
    }
  });

  var room = null, that = this;

  this.initialize = function(_room){
    room = _room;
  };

  this.finalize = function(){
    room = null;
  };

  var smallestBotId = 65535, largestBotId = 65535, botIds = [], keyStates = {}, dummyPromise = Promise.resolve();

  var addBot = function(name, flag, avatar, conn, auth){
    if (botIds.length >= that.maxConcurrentBotCount)
      return;
    botIds.push(smallestBotId);
    keyStates[smallestBotId] = 0;
    room.fakePlayerJoin(smallestBotId--, name || "in-memory-bot", flag || "tr", avatar || "XX", conn || "fake-ip-do-not-believe-it", auth || "fake-auth-do-not-believe-it");
  };

  var removeBot = function(){
    if (smallestBotId < largestBotId){
      delete keyStates[largestBotId];
      botIds.splice(botIds.indexOf(largestBotId), 1);
      room.fakePlayerLeave(largestBotId--);
    }
  };

  this.onOperationReceived = function(operation, msg, customData){
    switch (operation.type){
      case OperationType.SendChat:{
        /*
        var m = operation.getValue(msg, "text");
        if (m.startsWith("!")){  // custom chat logic for extra commands
        */
        if (customData.isCommand){ // same as above 2 lines.
          var arr = customData.data; // same as var arr = m.trimEnd().split(" ");
          switch (arr[0]){
            case "!add_bot": // usage: !add_bot [name] [flag] [avatar] [conn] [auth]
              addBot(arr[1], arr[2], arr[3], arr[4], arr[5]);
              break;
            case "!remove_bot":
              removeBot();
              break;
          }
          return false; // block this event from being processed
        }
        break;
      }
    }
    return true;
  };

  this.onGameTick = function(customData){
    var { o, p, ep } = room.getRoomDataOriginal();
    if (ep)
      p = ep;
    botIds.forEach((botId)=>{

      // get the original data object of the next bot
      var cp = p.Ma.I.filter((p)=>(p.V==botId))[0];
      var playerDisc = cp?.H;

      // coordinates: playerDisc.a.x, playerDisc.a.y
      // speed: playerDisc.D.x, playerDisc.D.y
      // radius: playerDisc.Z

      if (!playerDisc) // check or else error occurs after changing a player's team to spectators, if the player is not actually in the game, or the game is stopped.
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
      var keyState = Utils.keyState(dirX, dirY, kick);
      dummyPromise.then(()=>{ // this is just a way of doing this outside onGameTick callback.
        if (keyState != keyStates[botId]){ // sending keystate on EVERY game tick causes desync when you deactivate game's browser tab. this happens because requestAnimationFrame is being used. therefore, we are trying to limit consequent sending.
          room.fakeSendPlayerInput(/*input:*/ keyState, /*byId:*/ botId); // unlike room.setKeyState, this function directly emits a keystate message.
          keyStates[botId] = keyState;
        }
      });
      dummyPromise.then(()=>{ // this is just a way of doing this outside onGameTick callback.
        // sending keystate on EVERY game tick causes desync when you deactivate game's browser tab. 
        // this happens because requestAnimationFrame is being used. 
        // therefore, we are trying to limit consequent sending.
        if (keyState!=keyStates[botId] || kick!=cp.Wb){ // Wb: whether x key is active in-game (the circle around players is painted white if Wb is true)
          if ((keyState==keyStates[botId]) && kick && !cp.Wb) // if keyStates are the same and we are trying to kick, but the x key is not active in game,
            room.fakeSendPlayerInput(/*input:*/ keyState & -17, /*byId:*/ botId); // we have to release x key before pressing it again. (keyState & -17) changes only the 5th(kick) bit of keyState to 0.
          room.fakeSendPlayerInput(/*input:*/ keyState, /*byId:*/ botId); // unlike room.setKeyState, this function directly emits a keystate message.
          keyStates[botId] = keyState;
        }
      });
    });
  };

};

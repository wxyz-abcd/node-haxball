module.exports = function({ OperationType, VariableType, ConnectionState, Utils, Plugin, Replay, Room }){

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "autoPlay_followBall_inmemory_multiple", true, { // "autoPlay_followBall_inmemory_multiple" is plugin's name, "false" means "not activated after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This is an auto-playing bot that always follows the ball blindly, and kicks it whenever it is nearby without any direction checking. 
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
    type: VariableType.Number,
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
    type: VariableType.Number,
    value: 8, 
    range: {
      min: 0,
      max: 15,
      step: 0.5
    }
  });

  this.maxConcurrentBotCount = this.defineVariable({
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
          //return false; // do not block this event from being processed. it is done automatically in onAfterOperationReceived. 
        }
        break;
      }
    }
    return true;
  };
  
  this.onGameTick = function(customData){
    
    botIds.forEach((botId)=>{

      // get the original data object of the next bot
      var cp = room.getPlayerOriginal(botId);
      var playerDisc = cp?.H;

      // coordinates: playerDisc.a.x, playerDisc.a.y
      // speed: playerDisc.D.x, playerDisc.D.y
      // radius: playerDisc.Z

      if (!playerDisc) // check or else error occurs after changing a player's team to spectators, if the player is not actually in the game, or the game is stopped.
        return;

      // get the original data object of the ball
      var ball = room.getBallOriginal();

      // coordinates: ball.a.x, ball.a.y
      // speed: ball.D.x, ball.D.y
      // radius: ball.Z

      // calculate delta difference for both x and y axis.
      var deltaX = ball.a.x - playerDisc.a.x, deltaY = ball.a.y - playerDisc.a.y, dirX, dirY, kick;

      // x direction:
      if (Math.abs(deltaX) < that.minCoordAlignDelta) // we can omit small delta.
        dirX = 0;
      else 
        dirX = Math.sign(deltaX); // direction is +1 or -1, depending on the delta difference

      // y direction
      if (Math.abs(deltaY) < that.minCoordAlignDelta) // we can omit small delta.
        dirY = 0;
      else
        dirY = Math.sign(deltaY); // direction is +1 or -1, depending on the delta difference

      // kick is true if the distance between ball and player is less than minKickDistance
      kick = (deltaX * deltaX + deltaY * deltaY < (playerDisc.Z + ball.Z + that.minKickDistance) * (playerDisc.Z + ball.Z + that.minKickDistance));

      // apply current keys
      var keyState = Utils.keyState(dirX, dirY, kick);
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

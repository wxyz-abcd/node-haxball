var { Utils, Plugin } = require("../../src/index");

module.exports = function(){

  Plugin.call(this, "autoPlay_followBall_inmemory_multiple", true, Plugin.AllowFlags.CreateRoom); // "autoPlay_followBall_inmemory_multiple" is plugin's name, "false" means "not activated after initialization". Every plugin should have a unique name. We allow this plugin to be activated on CreateRoom only.

  // parameters are exported so that they can be edited outside this class.
  this.minCoordAlignDelta = 0.5;
  this.minKickDistance = 2;

  var room = null, that = this;

  this.initialize = function(_room){
    room = _room;
  };

  this.finalize = function(){
    room = null;
  };

  var smallestBotId = 65535, largestBotId = 65535, botIds = [];

  var addBot = function(name, flag, avatar, conn, auth){
    botIds.push(smallestBotId);
    room.fakePlayerJoin(smallestBotId--, name || "in-memory-bot", flag || "tr", avatar || "XX", conn || "fake-ip-do-not-believe-it", auth || "fake-auth-do-not-believe-it");
  };

  var removeBot = function(){
    if (smallestBotId < largestBotId){
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
    
    botIds.forEach((botId)=>{

      // get the original data object of the next bot
      var playerDisc = room.getPlayerDiscOriginal(botId);

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
      room.fakeSendPlayerInput(/*input:*/ Utils.keyState(dirX, dirY, kick), /*byId:*/ botId);
    });
  };
};

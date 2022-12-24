var { OperationType, ConnectionState, Utils, Plugin, Replay, Room } = require("../../src/index");

module.exports = function(){

  Plugin.call(this, "autoPlay_mixed_inmemory_multiple", true, Plugin.AllowFlags.CreateRoom); // "autoPlay_mixed_inmemory_multiple" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name. We allow this plugin to be activated on CreateRoom only.

  // parameters are exported so that they can be edited outside this class.
  this.minCoordAlignDelta = 0.5;
  this.minKickDistance = 10;
  this.maxDistanceToFollowBallCoeff = 0.2;
  this.maxConcurrentBotCount = 100;
  this.botsActive = true;

  var room = null, that = this, dummyPromise = Promise.resolve(), originalRoomData;

  this.initialize = function(_room){
    room = _room;
    originalRoomData = room.getRoomDataOriginal().o; // this object pointer never changes while inside a room, so we can store it here.
  };

  this.finalize = function(){
    room = null;
    originalRoomData = null;
  };

  var smallestBotId = 65535, largestBotId = 65535, bots = [];

  var addBot = function(active, type, count, name, flag, avatar, conn, auth){
    for (var i=0;i<count;i++){
      if (bots.length >= that.maxConcurrentBotCount)
        break;
      bots.push({
        id: smallestBotId, 
        active: active,
        type: type,
        keyState: 0
      });
      room.fakePlayerJoin(smallestBotId--, name || "in-memory-bot", flag || "tr", avatar || "XX", conn || "fake-ip-do-not-believe-it", auth || "fake-auth-do-not-believe-it");
    }
  };

  var removeBot = function(count){
    for (var i=0;i<count;i++){
      if (smallestBotId < largestBotId){
        bots.splice(bots.findIndex((x)=>(x.id==largestBotId)), 1);
        room.fakePlayerLeave(largestBotId--);
      }
      else
        break;
    }
  };

  this.onOperationReceived = function(operation, msg, customData){
    switch (operation.type){
      case OperationType.SendChat:{
        if (customData.isCommand){
          var byPlayer = originalRoomData.na(msg.P);
          if (!byPlayer.cb) // cb: isAdmin
            return true;
          var arr = customData.data;
          switch (arr[0]){
            case "!add_bot": // usage: !add_bot [type = {-1, 0, 1}] [active = {0, 1}] [count] [name] [flag] [avatar] [conn] [auth]
              var x = parseInt(arr[2]), y = parseInt(arr[3]);
              if (!(x>=-1 || x<=1) || (y<=0 || y>100))
                return;
              addBot((arr[1]!="0"), x, y, arr[4], arr[5], arr[6], arr[7], arr[8]);
              break;
            case "!remove_bot": // usage: !remove_bot [count]
              var x = parseInt(arr[1]);
              if (x<=0 || x>100)
                return;
              removeBot(x);
              break;
            case "!max_bot_count":{ // usage: !max_bot_count [count]
              var x = parseInt(arr[1]);
              if (isNaN(x) || x<0)
                return;
              that.maxConcurrentBotCount = x;
              break;
            }
            case "!bot_active":{ // usage: !bot_active [id] [active = {0, 1}]
              var id = parseInt(arr[1]);
              var bot = bots.findIndex((x)=>(x.id==id));
              if (bot)
                bot.active = (arr[2]=="1");
              break;
            }
            case "!bot_type":{ // usage: !bot_type [id] [type = {-1, 0, 1}]
              var id = parseInt(arr[1]);
              var type = parseInt(arr[2]);
              if (!(type>=-1 || type<=1))
                return;
              var bot = bots.findIndex((x)=>(x.id==id));
              if (bot)
                bot.type = type;
              break;
            }
            case "!bots_active":{ // usage: !bots_active [active]
              that.botsActive = (arr[1]=="1");
              break;
            }
          }
          return false; // block this event from being processed
        }
        break;
      }
    }
    return true;
  };

  var update = function(_originalRoomData, bot){
    var { o, p, ep } = _originalRoomData;
    if (ep)
      p = ep;
    var cp = o.na(bot.id);
    var playerDisc = cp?.H;
    if (!playerDisc)
      return;
    var teamId = cp.ea.$, opponentTeamId = 3 - teamId;
    var goals = o.S.tc, ball = p.ta.F[0];

    var targetX, targetY, sqrDistBetweenBallAndPlayer = (ball.a.x-playerDisc.a.x) * (ball.a.x-playerDisc.a.x) + (ball.a.y-playerDisc.a.y) * (ball.a.y-playerDisc.a.y);
    switch (bot.type){
      case 0:{ // always follow ball
        targetX = ball.a.x;
        targetY = ball.a.y;
        break;
      }
      case 1:{ // wait at defense + follow ball when near it
        var maxDistanceToFollowBall = that.maxDistanceToFollowBallCoeff * o.S.$b;
        //var b = false;
    
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
          //b = true;
        }
        break;
      }
      default:
        return;
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

    var maxSqrDist = (playerDisc.Z + ball.Z + that.minKickDistance) * (playerDisc.Z + ball.Z + that.minKickDistance);
    kick = (sqrDistBetweenBallAndPlayer < maxSqrDist);
    //console.log(bot.id, sqrDistBetweenBallAndPlayer, maxSqrDist, kick);

    // apply current keys
    var keyState = Utils.keyState(dirX, dirY, kick);
    dummyPromise.then(()=>{ // this is just a way of doing this outside onGameTick callback.
      // sending keystate on EVERY game tick causes desync when you deactivate game's browser tab. 
      // this happens because requestAnimationFrame is being used. 
      // therefore, we are trying to limit consequent sending.
      if (keyState!=bot.keyState || kick!=cp.Wb){ // Wb: whether x key is active in-game (the circle around players is painted white if Wb is true)
        if ((keyState==bot.keyState) && kick && !cp.Wb) // if keyStates are the same and we are trying to kick, but the x key is not active in game,
          room.fakeSendPlayerInput(keyState & -17, bot.id); // we have to release x key before pressing it again. (keyState & -17) changes only the 5th(kick) bit of keyState to 0.
        room.fakeSendPlayerInput(keyState, bot.id); // unlike room.setKeyState, this function directly emits a keystate message.
        bot.keyState = keyState;
      }
    });
  };

  this.onGameTick = function(customData){
    if (!that.botsActive)
      return;
    var _originalRoomData = room.getRoomDataOriginal();
    bots.forEach((bot)=>{
      if (!bot.active)
        return;
      update(_originalRoomData, bot);
    });
  };

};

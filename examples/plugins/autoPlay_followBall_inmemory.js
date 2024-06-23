module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "autoPlay_followBall_inmemory", false, { // "autoPlay_followBall_inmemory" is plugin's name, "false" means "not activated after initialization". Every plugin should have a unique name.
    version: "0.4",
    author: "abc",
    description: `This is an auto-playing bot that always follows the ball blindly, and kicks it whenever it is nearby without any direction checking. This bot creates a fake player(id=65535) in host's memory and controls it using fake events.`,
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
    // get the original data object of the next bot
    var cp = that.room.getPlayer(65535);
    var playerDisc = cp?.disc?.ext;

    // coordinates: playerDisc.pos.x, playerDisc.pos.y
    // speed: playerDisc.speed.x, playerDisc.speed.y
    // radius: playerDisc.radius

    if (!playerDisc) // check or else error occurs after changing a player's team to spectators, if the player is not actually in the game, or the game is stopped.
      return;

    // get the extrapolated game state object
    var { state, gameState, gameStateExt } = that.room;
    gameState = gameStateExt || gameState;

    // get the original extrapolated data object of the ball
    var ball = gameState.physicsState.discs[0];

    // get the coordinates of the ball
    var {x, y} = ball?.pos || {};

    // if ball is not reachable, do nothing.
    if (x==null || isNaN(x) || !isFinite(x) || y==null || isNaN(y) || !isFinite(y)) // check 
      return;

    // speed: playerDisc.speed.x, playerDisc.speed.y
    // radius: playerDisc.radius

    // calculate delta difference for both x and y axis.
    var deltaX = x - playerDisc.pos.x, deltaY = y - playerDisc.pos.y, dirX, dirY, kick;

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
    kick = (deltaX * deltaX + deltaY * deltaY < (playerDisc.radius + ball.radius + that.minKickDistance) * (playerDisc.radius + ball.radius + that.minKickDistance));

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

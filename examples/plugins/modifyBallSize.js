module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "modifyBallSize", true, {
    version: "0.1",
    author: "abc",
    description: `This plugin can modify ball size on demand.`,
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom // We allow this plugin to be activated on both CreateRoom and JoinRoom.
  });

  this.defineVariable({
    name: "coefficient",
    description: "This number is multiplied with the original ball radius", 
    type: VariableType.Number,
    value: 1,
    range: {
      min: 0,
      max: 1000,
      step: 0.1
    }
  });
  
  var that = this, originalExtrapolate = null;
  
  this.initialize = function(){
    originalExtrapolate = that.room.extrapolate;
    that.room.extrapolate = function(...params){
      var state = originalExtrapolate.call(that.room, ...params);
      var ball = state.gameState?.physicsState.discs[0];
      if (ball)
        ball.radius *= that.coefficient;
      return state;
    };
  };
  
  this.finalize = function(){
    that.room && (that.room.extrapolate = originalExtrapolate);
  };
}
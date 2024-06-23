module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, RoomConfig.prototype);
  RoomConfig.call(this, { // Every roomConfig should have a unique name.
    name: "CMD_defaultConfig",
    version: "0.1",
    author: "abc",
    description: `This is the default roomConfig using the commands library.`,
    allowFlags: AllowFlags.CreateRoom // We allow this roomConfig to be activated on CreateRoom only. (Because commands library is using host-only announcements.)
  });

  var cmdLib = null, that = this;
  var Success, ParamsLessThanMinParamCount, CommandNotFound, UnknownParameterType, ParameterAlreadyDefined, BooleanParseError, NumberNaNOrInfinite, NumberOutOfBounds, StringLengthOutOfBounds;

  this.initialize = function(){
    cmdLib = that.room.librariesMap.commands;
    if (cmdLib){
      Success = cmdLib.ErrorCodes.Success;
      ParamsLessThanMinParamCount = cmdLib.ErrorCodes.ParamsLessThanMinParamCount;
      CommandNotFound = cmdLib.ErrorCodes.CommandNotFound;
      UnknownParameterType = cmdLib.ErrorCodes.UnknownParameterType;
      ParameterAlreadyDefined = cmdLib.ErrorCodes.ParameterAlreadyDefined;
      BooleanParseError = cmdLib.ErrorCodes.BooleanParseError;
      NumberNaNOrInfinite = cmdLib.ErrorCodes.NumberNaNOrInfinite;
      NumberOutOfBounds = cmdLib.ErrorCodes.NumberOutOfBounds;
      StringLengthOutOfBounds = cmdLib.ErrorCodes.StringLengthOutOfBounds;
    }
  };

  this.finalize = function(){
    cmdLib = null;
  };

  this.onBeforeOperationReceived = function(type, msg, globalFrameNo, clientFrameNo){ // this callback is host-only
    if (type != OperationType.SendChat)
      return;
    var ret = cmdLib?.analyzeText(msg.text, msg.byId);
    if (!ret)
      return;
    var {code, cmdName, pIdx, pName, value, params, result} = ret;
    if (code<0)
      return;
    switch (code){
      case Success:{
        // command executed successfully.
        // we may show a success message using params and result here.
        break;
      }
      case ParamsLessThanMinParamCount: {
        cmdLib.announceError("Too few parameters. Type '!help "+cmdName+"' for detailed help on this command.", msg.byId);
        break;
      }
      case CommandNotFound: {
        cmdLib.announceError("Unknown command: '"+cmdName+"'. Type !help for all available commands.", msg.byId);
        break;
      }
      case UnknownParameterType: {
        cmdLib.announceError("Unknown parameter type (index: "+pIdx+", name='"+pName+"') in command: '"+cmdName+"'. Please contact this bot's developer to fix this error.");
        break;
      }
      case ParameterAlreadyDefined: {
        cmdLib.announceError("Parameter already defined (index: "+pIdx+", name='"+pName+"') in command: '"+cmdName+"'. Please contact this bot's developer to fix this error.");
        break;
      }
      case BooleanParseError: {
        cmdLib.announceError("Error in parameter (index: "+pIdx+", name='"+pName+"'): Failed to parse '"+value+"' as a boolean. Must be '0' or '1'.", msg.byId);
        break;
      }
      case NumberNaNOrInfinite: {
        cmdLib.announceError("Error in parameter (index: "+pIdx+", name='"+pName+"'): The value '"+value+"' is not acceptable for this parameter.", msg.byId);
        break;
      }
      case NumberOutOfBounds: {
        cmdLib.announceError("Error in parameter (index: "+pIdx+", name='"+pName+"'): The value '"+value+"' is out of bounds.", msg.byId);
        break;
      }
      case StringLengthOutOfBounds: {
        cmdLib.announceError("Error in parameter (index: "+pIdx+", name='"+pName+"'): Length of the string parameter '"+value+"' is out of bounds.", msg.byId);
        break;
      }
    }
    return false;
  };
};

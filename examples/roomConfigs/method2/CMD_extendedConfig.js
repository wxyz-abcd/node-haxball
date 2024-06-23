module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, RoomConfig.prototype);
  RoomConfig.call(this, { // Every roomConfig should have a unique name.
    name: "CMD_extendedConfig",
    version: "0.1",
    author: "abc",
    description: `This is a roomConfig that uses the commands library and also has storage and game mode features.`,
    allowFlags: AllowFlags.CreateRoom // We allow this roomConfig to be activated on CreateRoom only.
  });

  this.defineVariable({
    name: "storageType",
    description: "The type of storage to use for storing permanent data. (0: None, 1: LocalStorage)",
    type: VariableType.Integer,
    value: 0,
    range: {
      min: 0,
      max: 1,
      step: 1
    }
  });

  this.defineVariable({
    name: "gameMode",
    description: "Current mode of the game. (0: Default, 1: Ironman Regeneration)",
    type: VariableType.Integer,
    value: 0,
    range: {
      min: 0,
      max: 1,
      step: 1
    }
  });

  var cmdLib = null, that = this, modes = null, permissionCtx = null, permissionIds = null, mode = null;
  var Success, ParamsLessThanMinParamCount, CommandNotFound, UnknownParameterType, ParameterAlreadyDefined, BooleanParseError, NumberNaNOrInfinite, NumberOutOfBounds, StringLengthOutOfBounds;

  Object.defineProperty(this, "storage", {
    get: ()=>{
      switch(parseInt(that.storageType)){
        case 1:
          return that.room.librariesMap.localStorage;
        // TODO: map other storage types to libraries here. All storage libraries must use the same storage interface.
      }
    }
  });

  this.initialize = function(){
    mode = null;
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
    modes = [null, that.room.librariesMap.GM_ironRegen];
    permissionCtx = that.room.librariesMap.permissions?.createContext("extConfig");
    if (permissionCtx)
      permissionIds = {
        mode: permissionCtx.addPermission("mode"),
      };
    that.room.librariesMap.commands?.add({
      name: "mode",
      parameters: [{
        name: "modeIdx",
        type: VariableType.Integer,
        range: {
          min: 0,
          max: 1
        }
      }],
      minParameterCount: 1,
      helpText: "Changes the room's game mode.",
      callback: ({modeIdx}, byId) => {
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.mode)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        var oldGameMode = that.gameMode;
        that.gameMode = modeIdx;
        that.room._onVariableValueChange(that, "gameMode", oldGameMode, that.gameMode);
      }
    });    
  };

  this.finalize = function(){
    cmdLib = null;
    modes = null;
    mode = null;
  };

  this.onVariableValueChange = function(addOnObj, variableName, oldValue, value){
    if (addOnObj==that && variableName=="gameMode"){
      mode?.finalizeMode();
      mode = modes[value];
      mode?.initializeMode();
    }
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

  this.onPlayerJoin = function(playerObj, customData){
    return mode?.onModePlayerJoin(playerObj, customData);
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    return mode?.onModePlayerLeave(playerObj, reason, isBanned, byId, customData);
  };

  this.onPositionsReset = function(customData){
    return mode?.onModePositionsReset(customData);
  };

  this.onPlayerTeamChange = function(id, teamId, byId, customData){
    return mode?.onModePlayerTeamChange(id, teamId, byId, customData);
  };

  this.onGameTick = function(customData){
    return mode?.onModeGameTick(customData);
  };
};

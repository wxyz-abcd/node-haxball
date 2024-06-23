/* 
  // Example to add/remove commands in a Plugin or a RoomConfig:
  
  this.initialize = function(){
    this.room.librariesMap.commands.add({
      name: "afk",
      parameters: [{
        name: "historyLength",
        type: VariableType.Integer,
        range: {
          min: 1,
          max: 20
        }
      }],
      minParameterCount: 1,
      helpText: `Test`,
      callback: ({historyLength}, byId)=>{
        console.log("test command", historyLength);
      }
    });
  };
  this.finalize = function(){
    this.room.librariesMap.commands.remove("afk");
  };

  // Example chat analyzing code in a RoomConfig:
  this.onBeforeOperationReceived = function(type, msg, globalFrameNo, clientFrameNo){ // this callback is host-only
    if (type != OperationType.SendChat)
      return;
    var {code, cmdName, pIdx, pName, params, result} = this.room.librariesMap.commands.analyzeText(msg.text, msg.byId);
    if (code<0)
      return;
    if (code==0){ // this.room.librariesMap.commands.ErrorCodes.Success
      // command executed successfully.
      // you can show a success message using params and result here.
      return false;
    }
    // you can show errors related to the command here.
    // - cmdName is the command's name,
    // - code is the error code,
    // - pIdx is the parameter's index that caused the error,
    // - pName is the parameter's name that caused the error,
    // - value is the parameter's value that caused the error. (defined only in some errors)
    return false;
  };
  
*/

module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Library.prototype);
  Library.call(this, "commands", { // "commands" is library's name. Every library should have a unique name.
    version: 0.2,
    author: "abc",
    description: `This is a library to generalize and standardize the process of creating new chat commands.`
  });

  this.defineVariable({
    name: "active",
    description: "Commands are active?",
    type: VariableType.Boolean,
    value: true
  });

  this.defineVariable({
    name: "firstCharacter",
    description: "The first character of the input text in order for the text to be recognized as a command.",
    type: VariableType.String,
    value: "!"
  });

  this.defineVariable({
    name: "splitCharacter",
    description: "The character of the input text that lets us seperate each parameter of the command from each other.",
    type: VariableType.String,
    value: " "
  });

  this.defineVariable({
    name: "infoColor",
    description: "The color of info announcement messages. (in css format)",
    type: VariableType.String,
    value: "rgb(255,255,0)"
  });

  this.defineVariable({
    name: "infoStyle",
    description: "The style of info announcement messages. ('normal', 'bold', 'italic', 'small', 'small-bold', 'small-italic')",
    type: VariableType.String,
    value: "italic"
  });

  this.defineVariable({
    name: "infoFont",
    description: "The font of info announcement messages.",
    type: VariableType.Integer,
    value: 1
  });

  this.defineVariable({
    name: "errorColor",
    description: "The color of error announcement messages. (in css format)",
    type: VariableType.String,
    value: "rgb(255,50,50)"
  });

  this.defineVariable({
    name: "errorStyle",
    description: "The style of error announcement messages. ('normal', 'bold', 'italic', 'small', 'small-bold', 'small-italic')",
    type: VariableType.String,
    value: "bold"
  });

  this.defineVariable({
    name: "errorFont",
    description: "The font of error announcement messages.",
    type: VariableType.Integer,
    value: 1
  });

  this.defineVariable({
    name: "actionColor",
    description: "The color of info announcement messages. (in css format)",
    type: VariableType.String,
    value: "rgb(170,40,170)"
  });

  this.defineVariable({
    name: "actionStyle",
    description: "The style of info announcement messages. ('normal', 'bold', 'italic', 'small', 'small-bold', 'small-italic')",
    type: VariableType.String,
    value: "bold"
  });

  this.defineVariable({
    name: "actionFont",
    description: "The font of info announcement messages.",
    type: VariableType.Integer,
    value: 1
  });

  this.ErrorCodes = {

    // Warnings: (should not block the chat message)
    FirstCharacterMismatch: -2,
    CommandLibraryInactive: -1,

    // No error:
    Success: 0,

    // Command errors:
    ParamsLessThanMinParamCount: 1,
    CommandNotFound: 2,
    UnknownParameterType: 3,
    ParameterAlreadyDefined: 4,

    // Parameter parse errors: (value is defined)
    BooleanParseError: 5,
    NumberNaNOrInfinite: 6,
    NumberOutOfBounds: 7,
    StringLengthOutOfBounds: 8

  };

  function Command(name, parameters, minParameterCount, helpText, callback){
    this.name = name;
    this.parameters = parameters;
    this.minParameterCount = minParameterCount;
    this.helpText = helpText;
    this.callback = callback;
  }

  var thisLibrary = this, commands;

  this.announceError = function(msg, toId){
    thisLibrary.room.sendAnnouncement(msg, toId, Utils.colorToNumber(thisLibrary.errorColor), thisLibrary.errorStyle, thisLibrary.errorFont);
  };

  this.announceInfo = function(msg, toId){
    thisLibrary.room.sendAnnouncement(msg, toId, Utils.colorToNumber(thisLibrary.infoColor), thisLibrary.infoStyle, thisLibrary.infoFont);
  };

  this.announceAction = function(msg, toId){
    thisLibrary.room.sendAnnouncement(msg, toId, Utils.colorToNumber(thisLibrary.actionColor), thisLibrary.actionStyle, thisLibrary.actionFont);
  };

  this.announcePermissionDenied = function(toId){
    thisLibrary.announceError("Permission Denied.", toId);
  };

  function getTypeRangeStr(type, range, nonNegative){
    if (range!=null){
      type += "<";
      if (nonNegative){
        if (range.min==null)
          type += "0";
        else
          type += Math.max(range.min, 0);
      }
      else{
        if (range.min==null)
          type += "-Inf";
        else
          type += range.min;
      }
      type += ", ";
      if (range.max==null)
        type += "Inf";
      else
        type += range.max;
      type += ">";
    }
    return type;
  }

  function helpCallback({commandName}, byId){
    if (!commandName){
      var text = "List of all available commands: ";
      text += commands.map((x)=>(thisLibrary.firstCharacter+x.name)).join(", ");
      text += ". Type "+thisLibrary.firstCharacter+"help [commandName] for detailed help on a specific command.";
      thisLibrary.announceInfo(text, byId);
      return;
    }
    var cmd = commands.find((x)=>x.name==commandName);
    if (!cmd)
      thisLibrary.announceError("help: The command '"+commandName+"' was not found. Type !help for all available commands.", byId);
    else
      thisLibrary.announceInfo(cmd.parameters.reduce((s, {name, type, range})=>{
        switch(type){
          case VariableType.Boolean:
            type = "(0|1)";
            break;
          case VariableType.Integer:
            type = getTypeRangeStr("int", range);
            break;
          case VariableType.Number:
            type = getTypeRangeStr("number", range);
            break;
          case VariableType.String:
            type = getTypeRangeStr("string", range, true);
            break;
        }
        s+=" ["+name+":"+type+"]";
        return s;
      }, "help("+commandName+"): "+cmd.helpText+" Usage: "+thisLibrary.firstCharacter+commandName), byId);
  }

  this.initialize = function(){
    commands = [];
    thisLibrary.add({
      name: "help",
      parameters: [{
        name: "commandName",
        type: VariableType.String
      }],
      minParameterCount: 0,
      helpText: `Shows the list of all available commands. Type !help [commandName] for detailed help on a specific command.`,
      callback: helpCallback
    })
  };

  this.finalize = function(){
    commands = null;
  };

  this.add = function({name, parameters, minParameterCount, helpText, callback}){
    if (!commands)
      return false;
    if (commands.findIndex((x)=>x.name==name)!=-1)
      return false;
    commands.push(new Command(name, parameters, minParameterCount==null ? parameters.length : minParameterCount, helpText || "", callback));
    return true;
  };

  this.remove = function(name){
    if (!commands)
      return false;
    var idx = commands.findIndex((x)=>x.name==name);
    if (idx==-1)
      return false;
    commands.splice(idx, 1);
    return true;
  };

  this.analyzeText = function(text, byId){
    if (!thisLibrary.active)
      return {code: thisLibrary.ErrorCodes.CommandLibraryInactive};
    if (!text.startsWith(thisLibrary.firstCharacter))
      return {code: thisLibrary.ErrorCodes.FirstCharacterMismatch};
    var splittedText = text.trimEnd().substring(thisLibrary.firstCharacter.length).split(thisLibrary.splitCharacter);
    var cmdName = splittedText[0];
    for (var i=0;i<commands.length;i++){
      var cmd = commands[i];
      if (cmd.name!=cmdName)
        continue;
      if (splittedText.length-1<cmd.minParameterCount)
        return {code: thisLibrary.ErrorCodes.ParamsLessThanMinParamCount, cmdName};
      var fParams = {};
      for (i=0;i<Math.min(splittedText.length-1, cmd.parameters.length);i++){
        var param = cmd.parameters[i];
        if (fParams[param.name]!=null)
          return {code: thisLibrary.ErrorCodes.ParameterAlreadyDefined, cmdName, pIdx: i, pName: param.name};
        var str = splittedText[i+1], val;
        switch(param.type){
          case VariableType.Boolean:{
            val = parseInt(str);
            if (val==0)
              val = false;
            else if (val==1)
              val = true;
            else
              return {code: thisLibrary.ErrorCodes.BooleanParseError, cmdName, value: str, pIdx: i, pName: param.name};
            break;
          }
          case VariableType.Integer:{
            val = parseInt(str);
            if (isNaN(val) || !isFinite(val))
              return {code: thisLibrary.ErrorCodes.NumberNaNOrInfinite, cmdName, value: str, pIdx: i, pName: param.name};
            if (param.range!=null){
              if ((param.range.min!=null && val<param.range.min) || (param.range.max!=null && val>param.range.max))
                return {code: thisLibrary.ErrorCodes.NumberOutOfBounds, cmdName, value: str, pIdx: i, pName: param.name};
            }
            break;
          }
          case VariableType.Number:{
            val = parseFloat(str);
            if (isNaN(val) || !isFinite(val))
              return {code: thisLibrary.ErrorCodes.NumberNaNOrInfinite, cmdName, value: str, pIdx: i, pName: param.name};
            if (param.range!=null){
              if ((param.range.min!=null && val<param.range.min) || (param.range.max!=null && val>param.range.max))
                return {code: thisLibrary.ErrorCodes.NumberOutOfBounds, cmdName, value: str, pIdx: i, pName: param.name};
            }
            break;
          }
          case VariableType.String:{
            if (param.range!=null){
              if ((param.range.min!=null && str.length<param.range.min) || (param.range.max!=null && str.length>param.range.max))
                return {code: thisLibrary.ErrorCodes.StringLengthOutOfBounds, cmdName, value: str, pIdx: i, pName: param.name};
            }
            val = str;
            break;
          }
          /*
          // define all of these sometime, maybe?
          case VariableType.Color:{
            break;
          }
          case VariableType.CollisionFlags:{
            break;
          }
          case VariableType.Coordinate:{
            break;
          }
          case VariableType.Team:{
            break;
          }
          case VariableType.TeamWihSpec:{
            break;
          }
          case VariableType.BgType:{
            break;
          }
          case VariableType.CameraFollow:{
            break;
          }
          case VariableType.KickOffReset:{
            break;
          }
          case VariableType.Flag:{
            break;
          }
          */
          default:{
            return {code: thisLibrary.ErrorCodes.UnknownParameterType, cmdName, pIdx: i, pName: param.name};
          }
        }
        fParams[param.name] = val;
      }
      return {code: thisLibrary.ErrorCodes.Success, cmdName, params: fParams, result: cmd.callback(fParams, byId)};
    }
    return {code: thisLibrary.ErrorCodes.CommandNotFound, cmdName};
  };
};

module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  // Ignore command is disabled because it's complicating the permission and operationReceived codes too much for each plugin that uses chat messages. Ignoring chat should be done in custom client codes.

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "CMD_messaging", true, { // "CMD_messaging" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin contains all important commands about messaging. Available commands: 
    - !pm [id] [message]: send a private chat [message] to the player whose playerId=[id].
    - !tm [message]: send a chat [message] to only your team members.
    - !voice [id] [value]: set the voice status (ability to chat) of the player whose playerId=[id].
    - !voiceMode [value]: set the room's general voice mode to [value].`,
    //- !ignore [id]: ignore chat messages from the player whose playerId=[id].
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });

  this.defineVariable({
    name: "voiceMode",
    description: "The voice mode of the room.",
    type: VariableType.Integer,
    value: 2,
    range: {
      min: 0,
      max: 2,
      step: 1
    }
  });

  this.defineVariable({
    name: "voiceAffectsPM",
    description: "Can a muted player send private/team chat messages?",
    type: VariableType.Boolean,
    value: false
  });
  /*
  this.defineVariable({
    name: "ignoreActive",
    description: "Whether ignore command available or not. In order to make the ignore command possible, this plugin has to convert all chat messages into announcement messages.",
    type: VariableType.Boolean,
    value: true
  });
  */
  this.defineVariable({
    name: "pmSentColor",
    description: "The color of sent private chat announcement messages. (in css format)",
    type: VariableType.String,
    value: "rgb(100,200,255)"
  });

  this.defineVariable({
    name: "pmSentStyle",
    description: "The style of sent private chat announcement messages. ('normal', 'bold', 'italic', 'small', 'small-bold', 'small-italic')",
    type: VariableType.String,
    value: "small-bold"
  });

  this.defineVariable({
    name: "pmSentFont",
    description: "The font of sent private chat announcement messages.",
    type: VariableType.Integer,
    value: 1
  });

  this.defineVariable({
    name: "pmReceivedColor",
    description: "The color of received private chat announcement messages. (in css format)",
    type: VariableType.String,
    value: "rgb(100,255,200)"
  });

  this.defineVariable({
    name: "pmReceivedStyle",
    description: "The style of received private chat announcement messages. ('normal', 'bold', 'italic', 'small', 'small-bold', 'small-italic')",
    type: VariableType.String,
    value: "small-bold"
  });

  this.defineVariable({
    name: "pmReceivedFont",
    description: "The font of received private chat announcement messages.",
    type: VariableType.Integer,
    value: 1
  });

  this.defineVariable({
    name: "tmColor",
    description: "The color of team chat announcement messages. (in css format)",
    type: VariableType.String,
    value: "rgb(50,150,150)"
  });

  this.defineVariable({
    name: "tmStyle",
    description: "The style of team chat announcement messages. ('normal', 'bold', 'italic', 'small', 'small-bold', 'small-italic')",
    type: VariableType.String,
    value: "small-italic"
  });

  this.defineVariable({
    name: "tmFont",
    description: "The font of team chat announcement messages.",
    type: VariableType.Integer,
    value: 1
  });
  /*
  this.defineVariable({
    name: "chatColorWhileIgnoreActive",
    description: "The color of normal chat announcement messages while ignore feature is active. (in css format)",
    type: VariableType.String,
    value: "rgb(255,255,255)"
  });

  this.defineVariable({
    name: "chatStyleWhileIgnoreActive",
    description: "The style of normal chat announcement messages while ignore feature is active. ('normal', 'bold', 'italic', 'small', 'small-bold', 'small-italic')",
    type: VariableType.String,
    value: "normal"
  });

  this.defineVariable({
    name: "chatFontWhileIgnoreActive",
    description: "The font of normal chat announcement messages while ignore feature is active.",
    type: VariableType.Integer,
    value: 0
  });
  */
  var voiceModeMeanings = ["nobody", "only unmuted", "everybody"];
  var permissionCtx, permissionIds, playerProps, that = this;

  this.initialize = function(){
    playerProps = {0: {ignoreList: [], voice: true}};
    permissionCtx = that.room.librariesMap.permissions?.createContext("messaging");
    if (permissionCtx)
      permissionIds = {
        pm: permissionCtx.addPermission("pm", true),
        tm: permissionCtx.addPermission("tm", true),
        //ignore: permissionCtx.addPermission("ignore", true),
        voice: permissionCtx.addPermission("voice"),
        voiceMode: permissionCtx.addPermission("voiceMode")
      };
    that.room.librariesMap.commands?.add({
      name: "pm",
      parameters: [{
        name: "playerId",
        type: VariableType.Integer,
        range: {
          min: 0
        }
      }, {
        name: "message",
        type: VariableType.String
      }],
      minParameterCount: 2,
      helpText: "Sends a private chat message to a player",
      callback: ({playerId, message}, byId) => {
        var p = that.room.players, byP, P;
        p.forEach((x)=>{
          if (x.id==byId)
            byP = x;
          else if (x.id==playerId)
            P = x;
        });
        if (!P || !byP)
          return;
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.pm)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        that.room.sendAnnouncement(P.name+"["+playerId+"]: "+message, byId, Utils.colorToNumber(that.pmSentColor), that.pmSentStyle, that.pmSentFont);
        that.room.sendAnnouncement(byP.name+"["+byId+"]: "+message, playerId, Utils.colorToNumber(that.pmReceivedColor), that.pmReceivedStyle, that.pmReceivedFont);
      }
    });
    that.room.librariesMap.commands?.add({
      name: "tm",
      parameters: [{
        name: "message",
        type: VariableType.String
      }],
      minParameterCount: 1,
      helpText: "Sends a chat message to all of your current team members",
      callback: ({message}, byId) => {
        var p = that.room.players;
        var byP = p.find((x)=>x.id==byId);
        if (!byP)
          return;
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.tm)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        var msg = byP.name+"["+byId+"] (team): "+message, color = Utils.colorToNumber(that.tmColor);
        p.forEach((player)=>{
          if (player.team==byP.team)
            that.room.sendAnnouncement(msg, player.id, color, that.tmStyle, that.tmFont);
        });
      }
    });
    /*
    that.room.librariesMap.commands?.add({
      name: "ignore",
      parameters: [{
        name: "playerId",
        type: VariableType.Integer,
        range: {
          min: 0
        }
      }],
      minParameterCount: 1,
      helpText: "Ignores all chat messages sent by a player",
      callback: ({playerId}, byId) => {
        var p = that.room.players;
        var P = p.find((x)=>x.id==playerId);
        if (!P)
          return;
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.ignore)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        var a = playerProps[byId];
        if (!a){
          a = playerProps[byId] = {ignoreList: [], voice: true};
        }
        a = a.ignoreList;
        var idx = a.indexOf(playerId);
        if (idx<0){
          a.push(playerId);
          that..librariesMap.commands?.announceAction(P.name + " has been ignored.", byId);
        }
        else{
          a.splice(idx, 1);
          room.librariesMap.commands?.announceAction(P.name + " has been un-ignored.", byId);
        }
      }
    });
    */
    that.room.librariesMap.commands?.add({
      name: "voice",
      parameters: [{
        name: "playerId",
        type: VariableType.Integer,
        range: {
          min: 0
        }
      }, {
        name: "value",
        type: VariableType.Boolean
      }],
      minParameterCount: 2,
      helpText: "Changes the ability of a player to send a chat message",
      callback: ({playerId, value}, byId) => {
        var p = that.room.players;
        var P = p.find((x)=>x.id==playerId);
        if (!P)
          return;
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.voice)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        var pp = playerProps[playerId];
        if (!pp)
          playerProps[playerId] = {
            ignoreList: [], 
            voice: value
          };
        else
          pp.voice = value;
        that.room.librariesMap.commands?.announceAction(P.name+" was "+(value?"unmuted":"muted")+".");
      }
    });
    that.room.librariesMap.commands?.add({
      name: "voiceMode",
      parameters: [{
        name: "value",
        type: VariableType.Integer,
        range: {
          min: 0,
          max: 2
        }
      }],
      minParameterCount: 1,
      helpText: "Sets the current room's voice mode.",
      callback: ({value}, byId) => {
        var p = that.room.players;
        var byP = p.find((x)=>x.id==byId);
        if (!byP)
          return;
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.voiceMode)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        that.voiceMode = value;
        that.room.librariesMap.commands?.announceAction("Voice mode was set to '"+voiceModeMeanings[that.voiceMode]+"' by "+byP.name+".");
      }
    });
  };

  this.finalize = function(){
    that.room.librariesMap?.commands?.remove("pm");
    that.room.librariesMap?.commands?.remove("tm");
    //that.room.librariesMap?.commands?.remove("ignore");
    that.room.librariesMap?.commands?.remove("voice");
    that.room.librariesMap?.commands?.remove("voiceMode");
    that.room.librariesMap?.permissions?.removeContext(permissionCtx);
    playerProps = null;
    permissionCtx = null;
    permissionIds = null;
  };

  this.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){
    if (type!=OperationType.SendChat)
      return true;
    var from = msg.byId, to = msg.targetId, blockDueToVoice = that.voiceMode==0 || (that.voiceMode==1 && !playerProps[from]?.voice);
    var p = that.room.players;
    if (that.voiceAffectsPM && blockDueToVoice)
      return false;
    if (to!=null)
      return !playerProps[to]?.ignoreList.includes(from);
    if (!that.voiceAffectsPM && blockDueToVoice)
      return false;
    /*
    // Disabled because it's complicating the permission codes too much. Ignoring chat should be done in custom client codes.
    if (that.ignoreActive){
      var fromP = p.find((x)=>x.id==from);
      if (!fromP)
        return false;
      var txt = "["+from+"] "+fromP.name+": "+msg.text, color = Utils.colorToNumber(that.chatColorWhileIgnoreActive);
      p.forEach(({id})=>{
        if (!playerProps[id]?.ignoreList.includes(from))
          //that.room.fakeSendPlayerChat(txt, id, from); // <-- This is impossible with the default Haxball client. Therefore, we have to use announcements here.
          that.room.sendAnnouncement(txt, id, color, that.chatStyleWhileIgnoreActive, that.chatFontWhileIgnoreActive);
      });
      return false;
    }
    */
    return true;
  };

  this.onPlayerJoin = function(playerObj){
    playerProps[playerObj.id] = {
      ignoreList: [], 
      voice: true
    };
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    var id = playerObj.id;
    delete playerProps[id];
    Object.keys(playerProps).forEach((id2)=>{
      var arr = playerProps[id2].ignoreList;
      var idx = arr.indexOf(id);
      if (idx>-1)
        arr.splice(idx, 1);
    });
  };
};

module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "CMD_afk", true, { // "CMD_afk" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin lets us understand whether a player is afk or not.
    Available commands: 
    - !afk: Toggles your afk status.`,
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });

  this.detectNonAFKByInput = this.defineVariable({
    name: "detectNonAFKByInput",
    description: "Whether to automatically mark players non-AFK whenever they press a key.",
    type: VariableType.Boolean,
    value: true
  });

  var room, afks, thisPlugin = this;

  this.initialize = function(_room){
    room = _room;
    afks = {};
    room.librariesMap.commands?.add({
      name: "afk",
      parameters: [],
      minParameterCount: 0,
      helpText: "Toggles your afk status.",
      callback: ({}, byId) => {
        var P = room.players.find((x)=>x.id==byId);
        var value = afks[byId];
        if (value){
          delete afks[byId];
          if (P)
            room.librariesMap.commands?.announceAction(P.name + " is now back to the game.");
        }
        else{
          afks[byId] = true;
          if (P)
            room.librariesMap.commands?.announceAction(P.name + " is now AFK.");
        }
      }
    });
  };

  this.finalize = function(){
    room.librariesMap?.commands?.remove("afk");
    room = null;
    afks = null;
  };

  this.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){
    if (!thisPlugin.detectNonAFKByInput || type!=OperationType.SendInput)
      return true;
    var byId = msg.byId;
    if (afks[byId]){
      delete afks[byId];
      var P = room.players.find((x)=>x.id==byId);
      if (P)
        room.librariesMap.commands?.announceAction(P.name + " is now back to the game.");
    }
    return true;
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    delete afks[playerObj.id];
  };
};

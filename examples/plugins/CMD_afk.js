module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "CMD_afk", true, { // "CMD_afk" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin lets us understand whether a player is afk or not.
    Available commands: 
    - !afk: Toggles your afk status.`,
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });

  this.defineVariable({
    name: "detectNonAFKByInput",
    description: "Whether to automatically mark players non-AFK whenever they press a key.",
    type: VariableType.Boolean,
    value: true
  });

  var afks, that = this;

  this.initialize = function(){
    afks = {};
    that.room.librariesMap.commands?.add({
      name: "afk",
      parameters: [],
      minParameterCount: 0,
      helpText: "Toggles your afk status.",
      callback: ({}, byId) => {
        var P = that.room.players.find((x)=>x.id==byId);
        var value = afks[byId];
        if (value){
          delete afks[byId];
          if (P)
            that.room.librariesMap.commands?.announceAction(P.name + " is now back to the game.");
        }
        else{
          afks[byId] = true;
          if (P)
            that.room.librariesMap.commands?.announceAction(P.name + " is now AFK.");
        }
      }
    });
  };

  this.finalize = function(){
    that.room.librariesMap?.commands?.remove("afk");
    afks = null;
  };

  this.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){
    if (!that.detectNonAFKByInput || type!=OperationType.SendInput)
      return true;
    var byId = msg.byId;
    if (afks[byId]){
      delete afks[byId];
      var P = that.room.players.find((x)=>x.id==byId);
      if (P)
        that.room.librariesMap.commands?.announceAction(P.name + " is now back to the game.");
    }
    return true;
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    delete afks[playerObj.id];
  };
};

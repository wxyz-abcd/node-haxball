module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "CMD_modifyPlayerInput", true, { // "modifyPlayerInput" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin lets players modify other players' input key events.
    Key input value can be calculated as ([kick]*16+[right]*8+[left]*4+[up]*2+[down]*1) where [kick], [right], [left], [up], [down] are all 0(not pressed) or 1(pressed).
    Available commands: 
    - !input [id] [value]: Set the key input value for the player whose playerId=[id] as [value]. 0<=value<=31.`,
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });

  var staticInputs, permissionCtx, permissionIds = {}, that = this;

  this.initialize = function(){
    staticInputs = {};
    permissionCtx = that.room.librariesMap.permissions?.createContext("modifyPlayerInput");
    if (permissionCtx)
      permissionIds = {
        input: permissionCtx.addPermission("input")
      };
    that.room.librariesMap.commands?.add({
      name: "input",
      parameters: [{
        name: "playerId",
        type: VariableType.Integer,
        range: {
          min: 0
        }
      }, {
        name: "value",
        type: VariableType.Integer,
        range: {
          min: -1,
          max: 31,
        }
      }],
      minParameterCount: 2,
      helpText: "Lets you change a player's input. '-1' resets to default.",
      callback: ({playerId, value}, byId) => {
        if (!that.room.getPlayer(playerId))
          return;
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.input)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        staticInputs[playerId] = value<0 ? null : value;  // store a static input value for this player
      }
    });
  };

  this.finalize = function(){
    that.room.librariesMap?.commands?.remove("input");
    that.room.librariesMap?.permissions?.removeContext(permissionCtx);
    staticInputs = null;
    permissionCtx = null;
    permissionIds = null;
  };

  this.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){
    var playerId = msg.byId;
    switch (type){
      case OperationType.SendInput: { // this event runs only when player presses/releases a key
        var input = staticInputs[playerId]; // get a static input value for the player who sent this event.
        if (input != null) // if it exists,
          msg.input = input; // set the event's input value to it.
        break;
      }
    }
    return true;
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    // get player's id
    var id = playerObj.id;

    // free extra memory allocated
    delete staticInputs[id];
  };
};

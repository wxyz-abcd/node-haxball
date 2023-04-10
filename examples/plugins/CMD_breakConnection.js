module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "CMD_breakConnection", true, { // "breakConnection" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin can make a player leave not by kicking him, but by breaking his connection. This should be improved with a permission mechanism.
    Available commands: 
    - !breakKick [id]: Break the connection of the player whose playerId=[id].`,
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });

  var room, connectionShouldBreak, permissionCtx, permissionIds;

  this.initialize = function(_room){
    room = _room;
    connectionShouldBreak = {};
    permissionCtx = room.librariesMap.permissions?.createContext("breakConnection");
    if (permissionCtx)
      permissionIds = {
        breakKick: permissionCtx.addPermission("breakKick")
      };
    room.librariesMap.commands?.add({
      name: "breakKick",
      parameters: [{
        name: "playerId",
        type: VariableType.Integer,
        range: {
          min: 0
        }
      }],
      minParameterCount: 1,
      helpText: "Breaks the connection of a player, effectively kicking the player without actually kicking him/her.",
      callback: ({playerId}, byId) => {
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.breakKick)){
          room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        connectionShouldBreak[playerId] = true; // mark player
      }
    });
  };

  this.finalize = function(){
    room.librariesMap?.commands?.remove("breakKick");
    room.librariesMap?.permissions?.removeContext(permissionCtx);
    room = null;
    connectionShouldBreak = null;
    permissionCtx = null;
    permissionIds = null;
  };

  this.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){ // this is host-only
    if (connectionShouldBreak[msg.byId]) // if player is marked
      throw ""; // connection is broken here. playerId will leave by himself without triggering a kick/ban event.
    return true;
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    // free extra memory allocated
    delete connectionShouldBreak[playerObj.id];
  };
};

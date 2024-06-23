module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "CMD_controlOtherPlayers", true, { // "controlOtherPlayers" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin lets you take control of every player in the room. This should be improved with a permission mechanism.
    Available commands: 
    - !control [id]: Take control of the player whose playerId=[id].
    - !blockControl [id] [value={0, 1}]: Block/unblock taking control of the player whose playerId=[id].`,
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });

  var controlSwitch, controlSwitchBlocked, permissionCtx, permissionIds, that = this;

  this.initialize = function(){
    controlSwitch = {};
    controlSwitchBlocked = {};
    permissionCtx = that.room.librariesMap.permissions?.createContext("controlOtherPlayers");
    if (permissionCtx)
      permissionIds = {
        control: permissionCtx.addPermission("control"),
        blockControl: permissionCtx.addPermission("blockControl")
      };
    that.room.librariesMap.commands?.add({
      name: "control",
      parameters: [{
        name: "playerId",
        type: VariableType.Integer,
        range: {
          min: 0
        }
      }],
      minParameterCount: 1,
      helpText: "Lets a player take control of another player.",
      callback: ({playerId}, byId) => {
        if (controlSwitchBlocked[playerId])
          return;
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.control)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        if (!that.room.getPlayer(playerId))
          playerId = byId;
        controlSwitch[byId] = playerId;
        that.room.librariesMap.commands?.announceAction("You are in control of the player whose id is " + playerId + ".", byId);
      }
    });
    that.room.librariesMap.commands?.add({
      name: "blockControl",
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
      helpText: "(Un)Blocks a player's ability to take control of another player.",
      callback: ({playerId, value}, byId) => {
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.blockControl)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        if (!that.room.getPlayer(playerId))
          return;
        controlSwitchBlocked[playerId] = (value == 1);
        that.room.librariesMap.commands?.announceAction("The player whose id is " + playerId + " is "+((value == 1)?"":"not ")+"vulnerable to be controlled now.", byId);
      }
    });
  };

  this.finalize = function(){
    that.room.librariesMap?.commands?.remove("control");
    that.room.librariesMap?.commands?.remove("blockControl");
    that.room.librariesMap?.permissions?.removeContext(permissionCtx);
    controlSwitch = null;
    controlSwitchBlocked = null;
    permissionCtx = null;
    permissionIds = null;
  };

  this.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){
    var playerId = msg.byId, cs = controlSwitch[playerId];
    if (cs != null && !controlSwitchBlocked[playerId]) // if the player is marked to be controlled by someone else, and the player has not protected himself being controlled,
      msg.byId = cs; // this is where the magic happens: modify event's player id so that it will look like it has come from someone else.
    return true;
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    // get player's id
    var id = playerObj.id;

    // free extra memory allocated
    delete controlSwitch[id];
    delete controlSwitchBlocked[id];
  };
};

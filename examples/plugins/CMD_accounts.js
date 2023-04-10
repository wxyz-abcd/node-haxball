module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "CMD_accounts", true, { // "CMD_accounts" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin helps us to manage user accounts.
    Available commands: 
    - !authregister: Registers your auth to host's database.
    - !authban [id]: Bans a player's auth in host's database from joining the room.`,
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });

  var room, permissionCtx, permissionIds;

  this.initialize = function(_room){
    room = _room;
    permissionCtx = room.librariesMap.permissions?.createContext("accounts");
    if (permissionCtx)
      permissionIds = {
        authban: permissionCtx.addPermission("authban"),
      };
    room.librariesMap.commands?.add({
      name: "authregister",
      parameters: [],
      minParameterCount: 0,
      helpText: "Registers your auth to host's database.",
      callback: ({}, byId) => {
        var {storage} = room.config;
        if (!storage){
          return;
        }
        var users = storage.get("users");
        if (!users)
          users = [];
        var auth = room.players.find((x)=>x.id==byId)?.auth;
        if (!auth){
          return;
        }
        var user = users.find((x)=>x.auth==auth);
        if (user){
          return;
        }
        users.push({auth: auth, permissions: [], ban: false});
        storage.set("users", users);
      }
    });
    room.librariesMap.commands?.add({
      name: "authban",
      parameters: [{
        name: "playerId",
        type: VariableType.Integer,
        range: {
          min: 0
        }
      }, {
        name: "ban",
        type: VariableType.Boolean
      }],
      minParameterCount: 2,
      helpText: "Bans a player's auth in host's database from joining the room.",
      callback: ({playerId, ban}, byId) => {
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.authban)){
          room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        var {storage} = room.config;
        if (!storage){
          return;
        }
        var users = storage.get("users");
        if (!users)
          users = [];
        var auth = room.players.find((x)=>x.id==playerId)?.auth;
        if (!auth){
          return;
        }
        var user = users.find((x)=>x.auth==auth);
        if (user)
          user.ban = ban;
        else
          users.push({auth: auth, permissions: [], ban: ban});
        storage.set("users", users);
      }
    });
  };

  this.finalize = function(){
    room.librariesMap?.commands?.remove("authregister");
    room.librariesMap?.commands?.remove("authban");
    room.librariesMap?.permissions?.removeContext(permissionCtx);
    room = null;
    permissionCtx = null;
    permissionIds = null;
  };

  this.modifyPlayerData = function(playerId, name, flag, avatar, conn, auth, customData){
    if (room.config.storage?.get("users")?.find((x)=>x.auth==auth)?.ban)
      return null;
    return [name, flag, avatar];
  };

  this.onPlayerJoin = function(playerObj, customData){
    var { id, auth } = playerObj;
    var {storage} = room.config, permissionsLib = room.librariesMap?.permissions;
    if (!storage || !permissionsLib)
      return;
    var users = storage.get("users");
    if (!users)
      return;
    var permissions = storage.get("permissions");
    if (!permissions)
      return;
    var user = users.find((x)=>x.auth==auth);
    if (!user)
      return;
    user.permissions.forEach((pIdx)=>{
      permissionsLib.setPlayerPermission(id, permissions[pIdx], true);
    });
  };
};

module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "CMD_setPlayerBall", true, { // "CMD_setPlayerBall" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin allows us to use players as balls.`,
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });
  
  this.defineVariable({
    name: "changeAvatar",
    description: "Whether to change the avatar of the ball players.",
    type: VariableType.Boolean,
    value: true
  });

  var ballPlayers, permissionCtx, permissionIds, that = this;

  function updatePlayerDisc(player){
    var disc = player?.disc;
    if (!disc)
      return;
    var ballCGroup = (1<<CollisionFlags.kick)|(1<<CollisionFlags.score)|(1<<CollisionFlags.ball);
    if (ballPlayers.has(player.id)){
      if ((disc.cGroup&ballCGroup)!=ballCGroup){
        var { bCoef, cGroup, damping, gravity, invMass, radius } = that.room.stadium.discs[0];
        that.room.setPlayerDiscProperties(player.id, {
          cGroup: disc.cGroup|ballCGroup,
          bCoef,
          damping,
          xgravity: gravity.x,
          ygravity: gravity.y,
          invMass,
          radius
        });
        if (that.changeAvatar)
          that.room.setPlayerAvatar(player.id, "⚽", true);
      }
    }
    else{
      if ((disc.cGroup&ballCGroup)==ballCGroup){
        var { bCoef, cGroup, damping, gravity, invMass, radius } = that.room.stadium.playerPhysics;
        that.room.setPlayerDiscProperties(player.id, {
          cGroup: disc.cGroup&(~ballCGroup),
          bCoef,
          damping,
          xgravity: gravity.x,
          ygravity: gravity.y,
          invMass,
          radius
        });
        if (that.changeAvatar)
          that.room.setPlayerAvatar(player.id, null, true);
      }
    }
  }

  this.initialize = function(){
    ballPlayers = new Set();
    permissionCtx = that.room.librariesMap.permissions?.createContext("setPlayerBall");
    if (permissionCtx)
      permissionIds = {
        setPlayerBall: permissionCtx.addPermission("setPlayerBall")
      };
    that.room.librariesMap.commands?.add({
      name: "setPlayerBall",
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
          min: 0,
          max: 1
        }
      }],
      minParameterCount: 2,
      helpText: "Changes the ballness status of a player.",
      callback: ({playerId, value}, byId) => {
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.setPlayerBall)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        var p = that.room.players.find((p)=>p.id==playerId);
        if (!p)
          return;
        var inc = ballPlayers.has(playerId);
        if ((inc && value) || (!inc && !value))
          return;
        if (value)
          ballPlayers.add(playerId);
        else
          ballPlayers.delete(playerId);
        updatePlayerDisc(p);
        that.room.librariesMap.commands?.announceAction("Player " + playerId + " is now a " + (value?"ball":"player") + ".", byId);
      }
    });
  };

  this.finalize = function(){
    that.room.librariesMap?.commands?.remove("setPlayerBall");
    that.room.librariesMap?.permissions?.removeContext(permissionCtx);
    ballPlayers.clear();
    that.room.players.forEach((p)=>{
      updatePlayerDisc(p);
    });
    ballPlayers = null;
    permissionCtx = null;
    permissionIds = null;
  };

  this.onPositionsReset = function(customData){
    Utils.runAfterGameTick(()=>{
      that.room.players.forEach((p)=>{
        updatePlayerDisc(p);
      });
    });
  };

  this.onPlayerDiscCreated = function(playerObj, customData){
    Utils.runAfterGameTick(()=>{
      updatePlayerDisc(playerObj);
    });
  };

  this.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){
    if (type!=OperationType.SendInput)
      return true;
    return !ballPlayers.has(msg.byId);
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    ballPlayers.delete(playerObj.id);
  };
};

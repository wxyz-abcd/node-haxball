module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "modifyPlayerPing", true, { // "modifyPlayerPing" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.2",
    author: "abc & 0x00",
    description: `This plugin changes the ping value of player(s).`,
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom // We allow this plugin to be activated on both CreateRoom and JoinRoom.
  });
  //#region Variables
  this.defineVariable({
    name:"playerID",
    type:VariableType.PlayerId,
  });

  this.defineVariable({
    name:"pingValue",
    type:VariableType.Integer,
    value:-1
  });
  
  this.defineVariable({
    name:"Change ping",
    type:VariableType.Void,
    value: () => {
      if(that.playerID == 0)
        return true && (that.room.hostPing = that.pingValue); 
      playerList.set(Number(that.playerID), that.pingValue);
    }
  });

  var that = this, _hostPing = 0, playerList = new Map();
  //#endregion Variables

  //#region Callbacks
  this.initialize = function(){
    that.room.hostPing = _hostPing; // this is host-only. host ping has to be modified like this.
  };
  this.modifyPlayerPing = function(playerId, ping, customData){
    if(playerList.size != 0 && playerList.has(playerId))
      return playerList.get(playerId);
    return ping; // don't modify ping value.
  };
  //#endregion Callbacks
};
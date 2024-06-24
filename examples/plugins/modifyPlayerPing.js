module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

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
    name:"isActive",
    type:VariableType.Boolean,
    value:true
  })

  this.defineVariable({
    name:"update",
    type:VariableType.Void,
    value: () => { 
      if(that.playerID == 0)
        return true && (that.room.hostPing = that.pingValue); 
      playerList.set(Number(that.playerID), {ping: that.pingValue, isActive:that.isActive});
    }
  });

  var that = this, 
  _hostPing = 1987987987, // default value
  playerList = new Map();
  //#endregion Variables

  //#region Callbacks
  this.initialize = function(){
    that.room.hostPing = _hostPing; // this is host-only. host ping has to be modified like this.
    if(that.room.isHost)
      that.modifyPlayerPing = function(playerId, ping, customData){
        if(playerList.has(Number(playerId)) && playerList.get(Number(playerId)).isActive)
          return playerList.get(Number(playerId)).ping;
        return ping;
      };
  };
  this.onVariableValueChange = function(addonObject, variableName, oldValue, newValue){
    if(addonObject != that) return;
    const data = playerList.get(Number(that.playerID)) ?? {};    
    switch(variableName)
    {
      case "playerID":
        that.isActive = data?.isActive || true;
        that.pingValue =data?.ping ?? -1;
        break;
      
      case "isActive":
        data.isActive = newValue;
        playerList.set(Number(that.playerID),data)
        break;
      default:
        break;
    }
  };
  this.modifyClientPing = (ping, customData) => {
    return ((playerList.has(this.room.currentPlayerId) && playerList.get(this.room.currentPlayerId).isActive) ? playerList.get(this.room.currentPlayerId).ping : ping);
  }
    //#endregion Callbacks
};

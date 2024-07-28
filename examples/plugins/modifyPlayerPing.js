module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "modifyPlayerPing", true, { // "modifyPlayerPing" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.3",
    author: "abc & 0x00",
    description: `This plugin changes the ping value of player(s).`,
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom // We allow this plugin to be activated on both CreateRoom and JoinRoom.
  });

  this.defineVariable({
    name:"playerID",
    type:VariableType.PlayerId,
    value:null
  });

  this.defineVariable({
    name:"pingValue",
    type:VariableType.Integer,
    value:-1
  });

  this.defineVariable({
    name:"update",
    type:VariableType.Void,
    value: () => { 
      if (that.room.isHost){
        if (that.playerID == 0)
          that.room.hostPing = that.pingValue;
        else
          playerList.set(Number(that.playerID), that.pingValue);
      }
      else
        playerList.set(Number(that.room.currentPlayerId), that.pingValue);
    }
  });

  var that = this, _hostPing = 0, playerList = new Map();

  this.initialize = function(){
    if(that.room.isHost){
      that.room.hostPing = _hostPing; // this is host-only. host ping has to be modified like this.
      that.modifyPlayerPing = function (playerId, ping, customData) {
        if (playerList.has(Number(playerId)))
          return playerList.get(Number(playerId));
        return ping;
      };
    }
    else{
      that.modifyClientPing = (ping, customData) => (playerList.has(that.room.currentPlayerId) ? playerList.get(that.room.currentPlayerId) : ping);
      that.setVariableGUIProps("playerID", {
        name: "visible",
        value: false
      });
    }
  };
  this.onVariableValueChange = function(addonObject, variableName, oldValue, newValue){
    if (that!=addonObject || variableName!="playerID")
      return;
    if (playerList.get(Number(that.playerID))==null)
      that.pingValue = 0;
    else
      that.pingValue = that.room.getPlayer(newValue)?.ping || 0;
  };
};

module.exports = function({ OperationType, VariableType, ConnectionState, AllowFlags, Callback, Utils, Room, Replay, RoomConfig, Plugin, Renderer, Impl }){

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "breakConnection", true, { // "breakConnection" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin can make a player leave not by kicking him, but by breaking his connection. This should be improved with a permission mechanism.
    Available commands: 
    - !breakKick [id]: Break the connection of the player whose playerId=[id].`,
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });

  var connectionShouldBreak = {};

  var breakConnection = function(byPlayerId, playerId){
    if (isNaN(byPlayerId) || isNaN(playerIdToBeControlled)) // parameters must be integers
      return;
    /*
    if (!breakConnectionPermitted[byPlayerId]) // example for custom permission logic
      return;
    */
    connectionShouldBreak[playerId] = true; // mark player
  };

  this.onOperationReceived = function(operation, msg, globalFrameNo, clientFrameNo, customData){ // this is host-only

    var playerId = operation.getValue(msg, "byPlayerId"); // find out who sent this message
    if (connectionShouldBreak[playerId]) // if player is marked
      throw ""; // connection is broken here. playerId will leave by himself without triggering a kick/ban event.
    
    switch (operation.type){
      case OperationType.SendChat:{ // if someone sent a chat message
        /*
        var m = operation.getValue(msg, "text");
        if (m.startsWith("!")){  // custom chat logic for extra commands
        */
        if (customData.isCommand){ // same as above 2 lines.
          var arr = customData.data; // same as var arr = m.trimEnd().split(" ");
          switch (arr[0]){
            case "!breakKick":
              breakConnection(playerId, parseInt(arr[1]));
              break;
          }
          //return false; // do not block this event from being processed. it is done automatically in onAfterOperationReceived. 
        }
        break;
      }
    }
    return true;
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    // get player's id
    var id = playerObj.V;

    // free extra memory allocated
    delete connectionShouldBreak[id];
  };
  
};

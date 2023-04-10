const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API = require("../../../src/index");

function roomCallback(room){ // examples start from here.

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

  // keep in mind that room.onBeforeOperationReceived already has a default callback value. It parses chat messages and returns the result as customData.
  // if you need to insert custom logic before plugins are running, and you still want the original to also run, you may store the original callback value 
  // in a variable just after room is created and later use it inside your own room.onBeforeOperationReceived.
  room.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){ // this is host-only
    var playerId = msg.byId; // find out who sent this message
    if (connectionShouldBreak[playerId]) // if player is marked
      throw ""; // connection is broken here. playerId will leave by himself without triggering a kick/ban event.
    switch (type){
      case OperationType.SendChat:{ // if someone sent a chat message
        /*
        var m = msg.text;
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

  room.onPlayerLeave = (playerObj, reason, isBanned, byId, customData) => {
    // get player's id
    var id = playerObj.id;
    
    // free extra memory allocated
    delete connectionShouldBreak[id];
  };

}

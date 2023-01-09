var { OperationType } = require("../../src/index");

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
  room.onOperationReceived = function(operation, msg, customData){ // this is host-only

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
          return false; // block this event from being further processed and sent to clients
        }
        break;
      }
    }
    return true;
  };

  room.onPlayerLeave = (playerObj, reason, isBanned, byId, customData) => {
    // get player's id
    var id = playerObj.V;
    
    // free extra memory allocated
    delete connectionShouldBreak[id];
  };

}

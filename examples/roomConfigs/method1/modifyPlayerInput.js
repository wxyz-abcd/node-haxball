const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API = require("../../../src/index");

function roomCallback(room){ // examples start from here.

  var staticInputs = {};

  var setPlayerInput = function(playerId, value){
    if (!room.getPlayer(playerId))
      return;
    /*
    if (!inputPermitted[byPlayerId]) // example for custom permission logic
      return;
    */
    staticInputs[playerId] = (isNaN(value) || value<0 || value>31) ? null : value;  // store a static input value for this player
  };

  // keep in mind that room.onBeforeOperationReceived already has a default callback value. It parses chat messages and returns the result as customData.
  // if you need to insert custom logic before plugins are running, and you still want the original to also run, you may store the original callback value 
  // in a variable just after room is created and later use it inside your own room.onBeforeOperationReceived.
  room.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){ // this is host-only
    var playerId = msg.byId;
    switch (type){
      case OperationType.SendChat: {
        /*
        var m = msg.text;
        if (m.startsWith("!")){  // custom chat logic for extra commands
        */
        if (customData.isCommand){ // same as above 2 lines.
          var arr = customData.data; // same as var arr = m.trimEnd().split(" ");
          switch (arr[0]){
            case "!input":
              setPlayerInput(parseInt(arr[1]), parseInt(arr[2]));
              break;
          }
          //return false; // You may block this event from being processed by doing this. 
          // However, room.onAfterOperationReceived already has a default value. It blocks all command chat messages from being sent to clients, 
          // after it is received by all plugins. You may modify it to your needs.
        }
        break;
      }
      case OperationType.SendInput: { // this event runs only when player presses/releases a key
        var input = staticInputs[playerId]; // get a static input value for the player who sent this event.
        if (input != null) // if it exists,
          msg.input = input; // set the event's input value to it.
        break;
      }
    }
    return true;
  };

  room.onPlayerLeave = (playerObj, reason, isBanned, byId, customData) => {
    // get player's id
    var id = playerObj.id;

    // free extra memory allocated
    delete staticInputs[id];
  };

}

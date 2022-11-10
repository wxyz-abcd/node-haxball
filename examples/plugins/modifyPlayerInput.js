var { Plugin } = require("../../src/index");

module.exports = function(){

  Plugin.call(this, "modifyPlayerInput", true); // "modifyPlayerInput" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.

  var staticInputs = {}, _room = null;

  var setPlayerInput = function(playerId, value){
    if (!_room.getPlayerOriginal(playerId))
      return;
    /*
    if (!inputPermitted[byPlayerId]) // example for custom permission logic
      return;
    */
    staticInputs[playerId] = (isNaN(value) || value<0 || value>31) ? null : value;  // store a static input value for this player
  };

  this.initialize = function(room){
    _room = room;
  };

  this.finalize = function(){
    _room = null;
  };

  this.onOperationReceived = function(operation, msg, customData){
    var playerId = operation.getValue(msg, "byPlayerId");
    switch (operation.type){
      case OperationType.SendChat: {
        /*
        var m = operation.getValue(msg, "text");
        if (m.startsWith("!")){  // custom chat logic for extra commands
        */
        if (customData.isCommand){ // same as above 2 lines.
          var arr = customData.data; // same as var arr = m.trimEnd().split(" ");
          switch (arr[0]){
            case "!input":
              setPlayerInput(parseInt(arr[1]), parseInt(arr[2]));
              break;
          }
          return false; // block this event from being processed
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

  this.onPlayerLeave = function(id, reason, isBanned, byId, customData){
    // free extra memory allocated
    delete staticInputs[id];
  };

};

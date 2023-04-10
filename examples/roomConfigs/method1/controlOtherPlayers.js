const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API = require("../../../src/index");

function roomCallback(room){ // examples start from here.

  var controlSwitch = {}, controlSwitchBlocked = {};

  var setControlledPlayer = function(byPlayerId, playerIdToBeControlled){
    if (isNaN(byPlayerId) || isNaN(playerIdToBeControlled) || controlSwitchBlocked[playerIdToBeControlled])
      return;
    /*
    if (!controlPermitted[byPlayerId]) // example for custom permission logic
      return;
    */
    if (!room.getPlayer(playerIdToBeControlled))
      playerIdToBeControlled = byPlayerId;
    controlSwitch[byPlayerId] = playerIdToBeControlled;
  };

  var blockControlPlayer = function(byPlayerId, playerId, value){
    if (isNaN(playerId))
      return;
    /*
    if (!blockControlPermitted[byPlayerId]) // example for custom permission logic
      return;
    */
    if (!room.getPlayer(playerId))
      return;
    controlSwitchBlocked[playerId] = (value == 1);
  };

  // keep in mind that room.onBeforeOperationReceived already has a default callback value. It parses chat messages and returns the result as customData.
  // if you need to insert custom logic before plugins are running, and you still want the original to also run, you may store the original callback value 
  // in a variable just after room is created and later use it inside your own room.onBeforeOperationReceived.
  room.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){ // this is host-only
    var playerId = msg.byId;
    var cs = controlSwitch[playerId];
    if (cs != null && !controlSwitchBlocked[playerId]) // if the player is marked to be controlled by someone else, and the player has not protected himself being controlled,
      msg.byId = cs; // this is where the magic happens: modify event's player id so that it will look like it has come from someone else.
    switch (type){
      case OperationType.SendChat:{
        /*
        var m = msg.text;
        if (m.startsWith("!")){  // custom chat logic for extra commands
        */
        if (customData.isCommand){ // same as above 2 lines.
          var arr = customData.data; // same as var arr = m.trimEnd().split(" ");
          switch (arr[0]){
            case "!control":
              setControlledPlayer(playerId, parseInt(arr[1])); // must use original playerId to be able to take back control of your own player
              break;
            case "!blockControl":
              blockControlPlayer(playerId, parseInt(arr[1]), parseInt(arr[2])); // must use original playerId to be able to take back control of your own player
              break;
          }
          return false; // block this event from being processed
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
    delete controlSwitch[id];
    delete controlSwitchBlocked[id];
  };

}

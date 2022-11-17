var { Plugin } = require("../../src/index");

module.exports = function(){

  Plugin.call(this, "controlOtherPlayers", true); // "controlOtherPlayers" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.

  var _room = room, controlSwitch = {}, controlSwitchBlocked = {};

  this.initialize = function(room){
    _room = room;
  };

  this.finalize = function(){
    _room = null;
    controlSwitch = null;
    controlSwitchBlocked = null;
  };

  var setControlledPlayer = function(byPlayerId, playerIdToBeControlled){
    if (isNaN(byPlayerId) || isNaN(playerIdToBeControlled) || controlSwitchBlocked[playerIdToBeControlled])
      return;
    /*
    if (!controlPermitted[byPlayerId]) // example for custom permission logic
      return;
    */
    if (!_room.getPlayerOriginal(playerIdToBeControlled))
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
    if (!_room.getPlayerOriginal(playerId))
      return;
    controlSwitchBlocked[playerId] = (value == 1);
  };

  this.onOperationReceived = function(operation, msg, customData){
    var playerId = operation.getValue(msg, "byPlayerId");
    var cs = controlSwitch[playerId];
    if (cs != null && !controlSwitchBlocked[playerId]) // if the player is marked to be controlled by someone else, and the player has not protected himself being controlled,
      operation.setValue(msg, "byPlayerId", cs); // this is where the magic happens: modify event's player id so that it will look like it has come from someone else.
    switch (operation.type){
      case OperationType.SendChat:{
        /*
        var m = operation.getValue(msg, "text");
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

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    // get player's id
    var id = playerObj.V;

    // free extra memory allocated
    delete controlSwitch[id];
    delete controlSwitchBlocked[id];
  };
};

module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, RoomConfig.prototype);
  RoomConfig.call(this, { // Every roomConfig should have a unique name.
    name: "combinedExample",
    version: "0.2",
    author: "abc",
    description: `This roomConfig has all of the features (and more) of balanceTeams, breakConnection, controlOtherPlayers and modifyPlayerData plugins so you should disable them while using this.`,
    allowFlags: AllowFlags.CreateRoom // We allow this roomConfig to be activated on CreateRoom only.
  });

  var teams = [[], [], []], playerTeams = {}, that = this;
  var connectionShouldBreak = {};
  var controlSwitch = {}, controlSwitchBlocked = {};
  var staticInputs = {};

  var balanceTeams = function(){
    // count players for each team
    var specCount = teams[0].length, redCount = teams[1].length, blueCount = teams[2].length;

    // if there is a spectator
    if (specCount>0){

      // if red team has more players, add the player to blue team
      if (redCount>blueCount)
        that.room.setPlayerTeam(teams[0][0], 2);
      
      // if blue team has more players, add the player to red team
      else if (blueCount>redCount)
        that.room.setPlayerTeam(teams[0][0], 1);
      
      // if player counts are equal for both teams, add the player to a random team
      else
        that.room.setPlayerTeam(teams[0][0], 1+Math.floor(Math.random()*2));
    }

    // if there is no spectator
    else{

      // if red team has more than 1 extra player than blue team, move the last red player to blue
      if (redCount>blueCount+1)
        that.room.setPlayerTeam(teams[1][teams[1].length-1], 2);

      // if blue team has more than 1 extra player than red team, move the last blue player to red
      else if (blueCount>redCount+1)
        that.room.setPlayerTeam(teams[2][teams[2].length-1], 1);
    }
  };

  var breakConnection = function(byPlayerId, playerId){
    if (isNaN(byPlayerId) || isNaN(playerIdToBeControlled)) // parameters must be integers
      return;
    /*
    if (!breakConnectionPermitted[byPlayerId]) // example for custom permission logic
      return;
    */
    connectionShouldBreak[playerId] = true; // mark player
  };

  var setControlledPlayer = function(byPlayerId, playerIdToBeControlled){
    if (isNaN(byPlayerId) || isNaN(playerIdToBeControlled) || controlSwitchBlocked[playerIdToBeControlled])
      return;
    /*
    if (!controlPermitted[byPlayerId]) // example for custom permission logic
      return;
    */
    if (!that.room.getPlayer(playerIdToBeControlled))
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
    if (!that.room.getPlayer(playerId))
      return;
    controlSwitchBlocked[playerId] = (value == 1);
  };

  var setPlayerInput = function(playerId, value){
    if (!that.room.getPlayer(playerId))
      return;
    /*
    if (!inputPermitted[byPlayerId]) // example for custom permission logic
      return;
    */
    staticInputs[playerId] = (isNaN(value) || value<0 || value>31) ? null : value;  // store a static input value for this player
  };

  this.initialize = function(){
    that.room.hostPing = 1987987987; // this is host-only. host ping has to be modified like this.
  };

  this.finalize = function(){
    teams = null;
    playerTeams = null;
    connectionShouldBreak = null;
    controlSwitch = null;
    controlSwitchBlocked = null;
  };

  this.modifyPlayerData = function(playerId, name, flag, avatar, conn, auth, customData){
    if (name=="abc")
      return null;  // block anyone trying to join the room with name "abc", before he can join the room.
    return [
      "[" + playerId + "] " + name, // prefix everyone's name with [playerId]
      "tr", // set everyone's flag to tr
      avatar // do not change avatars
    ];
  };

  this.modifyPlayerPing = function(playerId, ping, customData){
    return 100000 + ping*ping*ping; // if host, set everybody(except host)'s ping to 100000 + its original value cubed; otherwise, only set your own ping to that value.
  };

  this.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){ // this is host-only

    var playerId = msg.byId; // find out who sent this message
    if (connectionShouldBreak[playerId]) // if player is marked
      throw ""; // connection is broken here. playerId will leave by himself without triggering a kick/ban event.
    var cs = controlSwitch[playerId];
    if (cs != null && !controlSwitchBlocked[playerId]) // if the player is marked to be controlled by someone else, and the player has not protected himself being controlled,
      msg.byId = cs; // this is where the magic happens: modify event's player id so that it will look like it has come from someone else.
    
    switch (type){
      case OperationType.SendChat:{ // if someone sent a chat message
        /*
        var m = msg.text;
        if (m.startsWith("!")){  // custom chat logic for extra commands
        */
        if (customData?.isCommand){ // same as above 2 lines.
          var arr = customData.data; // same as var arr = m.trimEnd().split(" ");
          switch (arr[0]){
            case "!breakKick":
              breakConnection(playerId, parseInt(arr[1]));
              break;
            case "!control":
              setControlledPlayer(playerId, parseInt(arr[1])); // must use original playerId to be able to take back control of your own player
              break;
            case "!blockControl":
              blockControlPlayer(playerId, parseInt(arr[1]), parseInt(arr[2])); // must use original playerId to be able to take back control of your own player
              break;
            case "!input":
              setPlayerInput(parseInt(arr[1]), parseInt(arr[2]));
              break;
          }
          //return false; // do not block this event from being processed. it is done automatically in onAfterOperationReceived. 
        }
        break;
      }
      case OperationType.SendInput: { // this event runs only when player presses/releases a key
        var input = staticInputs[playerId]; // get a static input value for the player who sent this event.
        if (input != null) // if it exists,
          msg.input = input; // set the event's input value to it.
        break;
      }
      case OperationType.KickBanPlayer: { // if someone is leaving or being kicked/banned by someone else
        var reason = msg.reason; // get the reason. this is null if the player is leaving by himself/herself.
        if (reason!=null && playerId!=0) // if any player sends a kick/ban event message other than room host
          return false; // block the event message
        break;
      }
    }
    return true;
  };

  this.onPlayerJoin = function(playerObj, customData){
    // get player's id and name
    var id = playerObj.id, name = playerObj.name;

    that.room.sendChat("Welcome, " + name); // greet everybody
    that.room.setPlayerAdmin(id, true); // make everybody admin
    
    // add the new player to spectators
    teams[0].push(id);

    // update player's team
    playerTeams[id] = 0;

    // balance teeams
    balanceTeams();
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    // get player's id and name
    var id = playerObj.id, name = playerObj.name;

    that.room.sendChat("Goodbye, " + name); // say farewell to everybody

    // free extra memory allocated
    delete connectionShouldBreak[id];
    delete controlSwitch[id];
    delete controlSwitchBlocked[id];
    delete staticInputs[id];

    // remove player from his/her team
    var currentTeam = teams[playerTeams[id]], idx = currentTeam?.findIndex((x)=>(x==id));
    if (idx>=0)
      currentTeam.splice(idx, 1);
    delete playerTeams[id];

    // balance teams
    balanceTeams();
  };

  this.onPlayerTeamChange = function(id, teamId, byId, customData){
    // remove player from his/her old team
    var currentTeam = teams[playerTeams[id]], idx = currentTeam?.findIndex((x)=>(x==id));
    if (idx>=0)
      currentTeam.splice(idx, 1);

    // add player to his/her new team
    teams[teamId].push(id);

    // update player's team
    playerTeams[id] = teamId;

    // balance teams
    balanceTeams();
  };
};

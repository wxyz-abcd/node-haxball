const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API = require("../../../src/index");

function roomCallback(room){ // examples start from here.

  var teams = [[], [], []], playerTeams = {};

  var balanceTeams = function(){
    // count players for each team
    var specCount = teams[0].length, redCount = teams[1].length, blueCount = teams[2].length;

    // if there is a spectator
    if (specCount>0){

      // if red team has more players, add the player to blue team
      if (redCount>blueCount)
        room.setPlayerTeam(teams[0][0], 2);
      
      // if blue team has more players, add the player to red team
      else if (blueCount>redCount)
        room.setPlayerTeam(teams[0][0], 1);
      
      // if player counts are equal for both teams, add the player to a random team
      else
        room.setPlayerTeam(teams[0][0], 1+Math.floor(Math.random()*2));
    }

    // if there is no spectator
    else{

      // if red team has more than 1 extra player than blue team, move the last red player to blue
      if (redCount>blueCount+1)
        room.setPlayerTeam(teams[1][teams[1].length-1], 2);

      // if blue team has more than 1 extra player than red team, move the last blue player to red
      else if (blueCount>redCount+1)
        room.setPlayerTeam(teams[2][teams[2].length-1], 1);
    }
  };

  room.onPlayerJoin = (playerObj, customData) => {
    // get player's id
    var id = playerObj.id;
    
    // add the new player to spectators
    teams[0].push(id);

    // update player's team
    playerTeams[id] = 0;

    // balance teeams
    balanceTeams();
  };

  room.onPlayerLeave = (playerObj, reason, isBanned, byId, customData) => {
    // get player's id
    var id = playerObj.id;
    
    // remove player from his/her team
    var currentTeam = teams[playerTeams[id]], idx = currentTeam?.findIndex((x)=>(x==id));
    if (idx>=0)
      currentTeam.splice(idx, 1);
    delete playerTeams[id];

    // balance teams
    balanceTeams();
  };

  room.onPlayerTeamChange = (id, teamId, byId, customData) => {
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

}

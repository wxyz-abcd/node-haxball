module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, RoomConfig.prototype);
  RoomConfig.call(this, { // Every roomConfig should have a unique name.
    name: "balanceTeams",
    version: "0.1",
    author: "abc",
    description: `This roomConfig balances the player counts of teams automatically whenever a player joins/leaves the room or changes team.`,
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom // We allow this roomConfig to be activated on both CreateRoom and JoinRoom.
  });

  var teams = [[], [], []], playerTeams = {}, that = this;

  this.finalize = function(){
    teams = null;
    playerTeams = null;
  };

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

  this.onPlayerJoin = function(playerObj, customData){
    // get player's id
    var id = playerObj.id;
    
    // add the new player to spectators
    teams[0].push(id);

    // update player's team
    playerTeams[id] = 0;

    // balance teeams
    balanceTeams();
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
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

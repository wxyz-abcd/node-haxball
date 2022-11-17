function roomCallback(room){ // examples start from here.

  room.onAfterPlayerJoin = (playerObj, customData) => {
    // get player's id and name
    var id = playerObj.V, name = playerObj.w;
    
    room.sendChat("Welcome, " + name); // greet everybody
    room.setPlayerAdmin(id, true); // make everybody admin
  };

  room.onAfterPlayerLeave = (playerObj, reason, isBanned, byId, customData) => {
    // get player's name
    var name = playerObj.w;
    
    room.sendChat("Goodbye, " + name); // say farewell to everybody
  };

}

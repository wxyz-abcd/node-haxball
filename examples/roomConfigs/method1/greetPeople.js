function roomCallback(room){ // examples start from here.

  room.onPlayerJoin = (playerObj, customData) => {
    // get player's id and name
    var id = playerObj.V, name = playerObj.w;
    
    room.sendChat("Welcome, " + name); // greet everybody
    room.setPlayerAdmin(id, true); // make everybody admin
  };

  room.onPlayerLeave = (playerObj, reason, isBanned, byId, customData) => {
    // get player's name
    var name = playerObj.w;
    
    room.sendChat("Goodbye, " + name); // say farewell to everybody
  };

}

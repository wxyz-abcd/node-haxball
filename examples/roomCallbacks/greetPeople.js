function roomCallback(room){ // examples start from here.

  var players = {};

  room.onAfterPlayerJoin = (id, name, flag, avatar, conn, auth, customData) => {
    players[id] = { id, name, flag, conn, auth };
    room.sendChat("Welcome, " + name); // greet everybody
    room.setPlayerAdmin(id, true); // make everybody admin
  };

  room.onAfterPlayerLeave = (id, reason, isBanned, byId, customData) => {
    room.sendChat("Goodbye, " + players[id].name);
    delete players[id];
  };

}

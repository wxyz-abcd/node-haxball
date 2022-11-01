function roomCallback(room){ // examples start from here.
  room.modifyPlayerDataAfter = function(id, nick, avatar, flag, conn, auth, customData){ // this is host-only.
    if (nick=="abc")
      return null;  // block anyone trying to join the room with nick "abc", before he can join the room.
    return [
      "[" + id + "] " + nick, // prefix everyone's nick with [id]
      avatar, // do not change avatars
      "tr" // set everyone's flag to tr
    ];
  };
}

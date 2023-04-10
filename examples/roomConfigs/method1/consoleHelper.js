const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API = require("../../../src/index");

const vm = require("vm");

function roomCallback(room){ // examples start from here.

  vm.createContext(room); // setup context for room object.
  var stdin = process.openStdin(); // read from standard input (console, in this case)
  stdin.addListener("data", function(d) { // triggered when we press enter in console.
    vm.runInContext(d.toString().trim(), room); // process the string as a command in the room context.
  });

  /*

  example usage: 
  1 - start project to create room.
  2 - wait until room is created.
  3 - join the room from a web browser. (to observe)
  4 - write setPlayerTeam(0, 1) in node.js console to move yourself to red team.

  you can use every function in Room class this way.
  */

}

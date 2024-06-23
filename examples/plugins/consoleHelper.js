const vm = require("vm"); // you need to install this package manually in order to use it. (npm install vm)

module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "consoleHelper", true, { // "consoleHelper" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin lets us write commands in the console and executes them. We do not need this inside a browser, this is useful for node.js. Only commands inside the room object are supported.
    Example usage: If you want to use room.setKeyState(5), just write setKeyState(5) and press enter.`,
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom // We allow this plugin to be activated on both CreateRoom and JoinRoom.
  });

  var that = this, stdin, listener = function(d) {
    try {
      vm.runInContext(d.toString().trim(), that.room); // process the string as a command in the room context.
    } catch (err) {
      console.error(`Error while executing the command: ${err}`);
    }
  };

  this.initialize = function(){
    vm.createContext(that.room); // setup context for room object.
    stdin = process.openStdin(); // read from standard input (console, in this case)
    stdin.addListener("data", listener); // triggered when we press enter in console.
  };

  this.finalize = function(){
    stdin.removeListener("data", listener);
    listener = null;
    stdin = null;
  };
};

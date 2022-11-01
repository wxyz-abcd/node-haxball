var { Plugin } = require("../../src/index");
const vm = require("vm");

module.exports = function(){
  
  Plugin.call(this, "consoleHelper", true); // "consoleHelper" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.

  var _room, stdin, listener = function(d) {
    vm.runInContext(d.toString().trim(), _room); // process the string as a command in the room context.
  };

  this.initialize = function(room){
    _room = room;
    vm.createContext(room); // setup context for room object.
    stdin = process.openStdin(); // read from standard input (console, in this case)
    stdin.addListener("data", listener); // triggered when we press enter in console.
  };

  this.finalize = function(){
    stdin.removeListener("data", listener);
    listener = null;
    _room = null;
    stdin = null;
  };

};

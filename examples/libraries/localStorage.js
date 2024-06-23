module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Library.prototype);
  Library.call(this, "localStorage", { // "localStorage" is library's name. Every library should have a unique name.
    version: 0.1,
    author: "abc",
    description: `This is a library that implements the "default storage interface"(?) using the browser's localStorage object. This library would not directly work in node.js.`
  });

  this.defineVariable({
    name: "active",
    description: "Storage is active?",
    type: VariableType.Boolean,
    value: true
  });

  this.defineVariable({
    name: "mainKey",
    description: "The main key that will contain all inner keys in browser's local storage.",
    type: VariableType.String,
    value: "localStorageLib_main"
  });

  var thisLibrary = this, memoryObj = null;

  this.initialize = function(){
    try{
      memoryObj = JSON.parse(window.localStorage.getItem(thisLibrary.mainKey)) || {};
    }catch(e){
      memoryObj = {};
    }
  };

  this.finalize = function(){
    memoryObj = null;
  };

  this.get = function(key){
    return memoryObj[key];
  };

  this.set = function(key, value){
    if (!thisLibrary.active)
      return;
    memoryObj[key] = value;
    window.localStorage.setItem(thisLibrary.mainKey, JSON.stringify(memoryObj));
  };
};

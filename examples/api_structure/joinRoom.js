// node.js / CommonJS initialization:
const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API = require("../../src/index")();
const EnglishLanguage = require("../languages/englishLanguage");
API.Language.current = new EnglishLanguage(API); // if you want to use error.toString()

// For initialization on browsers, read the documentation here: https://github.com/wxyz-abcd/node-haxball#-usage-on-browser

Utils.generateAuth().then(([authKey, authObj])=>{
  Room.join({
    id: "Olnit_iGRWs",
    password: "password",
    authObj: authObj
  }, {
    storage: {
      player_name: "wxyz-abcd",
      avatar: "👽",
      player_auth_key: authKey
    }, 
    config: null, // example roomConfig usage: new autoPlay_followBall(API) // look at examples/roomConfigs/method2 folder for related examples.
    renderer: null, // example renderer usage: new defaultRenderer(API, {canvas: ..., images: {grass: ..., concrete: ..., concrete2: ..., typing: ...}, paintGame: true}) // look at examples_web folder for usage with room.setRenderer instead.
    plugins: [], // example plugin usage: [new autoPlay_followBall(API)] // look at examples/plugins folder for related examples.
    onSuccess: roomCallbacks, // look at examples/roomConfigs/method1 folder for related examples.
    onFailure: (error)=>{
      console.log("Unable to join room...", error.toString());
      //process.exit(0); // maybe close the application? in node.js
    },
    onLeave: (msg)=>{
      console.log("Bot has left the room:", msg.toString());
      //process.exit(0); // maybe close the application? in node.js
    }
  });
});

function roomCallbacks(room){ // "roomCallbacks" examples start from here. // look at examples/roomConfigs/method1 folder for related examples.
  console.log("joined room");
}

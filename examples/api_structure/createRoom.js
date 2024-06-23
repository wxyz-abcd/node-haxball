// node.js / CommonJS initialization:
const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API = require("../../src/index")();
const EnglishLanguage = require("../languages/englishLanguage");
API.Language.current = new EnglishLanguage(API); // if you want to use error.toString()

// For initialization on browsers, read the documentation here: https://github.com/wxyz-abcd/node-haxball#-usage-on-browser

Room.create({
  name: "bot test", 
  password: "pwd", 
  showInRoomList: true, 
  maxPlayerCount: 10,
  token: "thr1.AAAAAGNNfqJzDRdCGcM59w.jO07to-jIsA", // token value must be manually obtained from: https://www.haxball.com/headlesstoken
}, {
  storage: {
    player_name: "wxyz-abcd",
    avatar: "👽"
  }, 
  libraries: [], // example library usage: [new commands(API)] // look at examples/libraries folder for related examples.
  config: null, // example roomConfig usage: new defaultConfig(API) // look at examples/roomConfigs/method2 folder for related examples.
  renderer: null, // example renderer usage: new defaultRenderer(API, {canvas: ..., images: {grass: ..., concrete: ..., concrete2: ..., typing: ...}, paintGame: true}) // look at examples_web folder for usage with room.setRenderer instead.
  plugins: [], // example plugin usage: [new autoPlay_followBall(API)] // look at examples/plugins folder for related examples.
  onSuccess: roomCallbacks, // look at examples/roomConfigs/method1 folder for related examples.
  onFailure: (error)=>{
    console.log("Unable to join room...", error.toString());
    process.exit(0);
  },
  onLeave: (msg)=>{
    console.log("Bot has left the room:", msg.toString());
    process.exit(0);
  }
});

function roomCallbacks(room){ // "roomCallbacks" examples start from here. // look at examples/roomConfigs/method1 folder for related examples.
  room.onAfterRoomLink = (roomLink)=>{
    console.log("room link:", roomLink);
  };
  console.log("created room");
}

// node.js / CommonJS initialization:
const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API = require("../../src/index")();
const EnglishLanguage = require("../languages/englishLanguage");
API.Language.current = new EnglishLanguage(API); // if you want to use error.toString()

// For initialization on browsers, read the documentation here: https://github.com/wxyz-abcd/node-haxball#-usage-on-browser

const N = 10;

Utils.generateAuth().then(([authKey, authObj])=>{
  function joinRoom(roomId, roomName){
    Room.join({
      id: roomId,
      authObj: authObj
    }, {
      storage: {
        player_name: roomName, // set our name the same as the room that we want to join. :)
        avatar: "👽",
        player_auth_key: authKey
      }, 
      config: null, // example roomConfig usage: new autoPlay_followBall(API) // look at examples/roomConfigs/method2 folder for related examples.
      renderer: null, // example renderer usage: new defaultRenderer(API, {canvas: ..., images: {grass: ..., concrete: ..., concrete2: ..., typing: ...}, paintGame: true}) // look at examples_web folder for usage with room.setRenderer instead.
      plugins: [], // example plugin usage: [new autoPlay_followBall(API)] // look at examples/plugins folder for related examples.
      onSuccess: roomCallbacks, // look at examples/roomConfigs/method1 folder for related examples.
      onFailure: (error)=>{
        console.log("Unable to join room...", error.toString());
        joinRoom(roomId, roomName); // try to rejoin as soon as you get an error.
      },
      onLeave: (msg)=>{
        console.log("Bot has left the room:", msg.toString());
        joinRoom(roomId, roomName); // try to rejoin as soon as you left the room.
      }
    });
  }
  Utils.getRoomList().then((list)=>{
    var idx = [];
    for (var i=0;i<N;){
      var n = Math.floor(Math.random()*list.length);
      if (!list[n].data.password && !idx.includes(n)){ // data.password is room password (true/false), we want to join N different random rooms without passwords.
        idx.push(n);
        i++;
      }
    }
    idx.forEach((x)=>{
      joinRoom(list[x].id, list[x].data.name); // id is room id, data.name is room name
    })
  });
});

function roomCallbacks(room){ // "roomCallbacks" examples start from here. // look at examples/roomConfigs/method1 folder for related examples.
  console.log("joined room " + room.name);
}

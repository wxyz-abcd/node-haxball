const { OperationType, VariableType, ConnectionState, AllowFlags, Callback, Utils, Room, Replay, RoomConfig, Plugin, Renderer, Impl } = API = require("../../src/index");

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
  config: null, // example roomConfig usage: new autoPlay_followBall(API) // look at examples/roomConfigs/method2 folder for related examples.
  plugins: [], // example plugin usage: [new autoPlay_followBall(API)] // look at examples/plugins folder for related examples.
  onSuccess: roomCallbacks, // look at examples/roomConfigs/method1 folder for related examples.
  onFailure: (error)=>{
    console.log("Unable to join room...", error);
    process.exit(0);
  },
  onLeave: (msg)=>{
    console.log("Bot has left the room:", msg);
    process.exit(0);
  }
});

function roomCallbacks(room){ // "roomCallbacks" examples start from here. // look at examples/roomConfigs/method1 folder for related examples.
  room.onAfterRoomLink = (roomLink)=>{
    console.log("room link:", roomLink);
  };
  console.log("created room");
}

const { OperationType, ConnectionState, Room, Utils, Plugin } = require("node-haxball");

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
  authObj: authObj,
  plugins: [], // example plugin usage: [new autoPlay_followBall()]
  onSuccess: roomCallback,
  onFailure: (error)=>{
    console.log("Unable to join room...", error);
    process.exit(0);
  },
  onLeave: (msg)=>{
    console.log("Bot has left the room:", msg);
    process.exit(0);
  }
});

function roomCallback(room){ // "roomCallbacks" examples start from here.
  room.onAfterRoomLink = (roomLink)=>{
    console.log("room link:", roomLink);
  };
  console.log("created room");
}

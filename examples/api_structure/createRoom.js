const { OperationType, ConnectionState, Haxball, Utils } = require("../../src/index");

var haxBall = new Haxball({
  player_name: "wxyz-abcd",
  avatar: "👽",
});

haxBall.on("ready", () => {
  haxBall.createRoom({
    name: "bot test", 
    password: "pwd", 
    showInRoomList: true, 
    maxPlayerCount: 10,
    token: "thr1.AAAAAGNNfqJzDRdCGcM59w.jO07to-jIsA", // token value must be manually obtained from: https://www.haxball.com/headlesstoken
    plugins: [] // example plugin usage: [new autoPlay_followBall()]
  }).then(roomCallback, () => {
    console.log("Unable to create room...");
  });
});

haxBall.on("roomLeave", function (str) {
  console.log("Bot has left the room:", str);
  process.exit(0);
});

function roomCallback(room){ // "roomCallbacks" examples start from here.
  room.onAfterRoomLink = (roomLink)=>{
    console.log("room link:", roomLink);
  };
  console.log("created room");
}

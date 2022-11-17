const { OperationType, ConnectionState, Haxball, Utils } = require("../src/index");

var haxBall = new Haxball({
  player_name: "wxyz-abcd",
  avatar: "👽",
});

haxBall.on("ready", () => {
  haxBall.joinRoom({
    id: "8Q059ls-QTQ", 
    password: "password",
    plugins: [] // example plugin usage: [new autoPlay_followBall()]
  }).then(roomCallback, () => {
    console.log("Unable to join room...");
  });
});

haxBall.on("roomLeave", function (str) {
  console.log("Bot has left the room:", str);
  process.exit(0);
});

function roomCallback(room){ // "roomCallbacks" examples start from here.
  console.log("joined room");
}

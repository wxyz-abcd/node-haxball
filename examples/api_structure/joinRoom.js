const { OperationType, ConnectionState, Room, Utils, Plugin } = require("../../src/index");

Utils.generateAuth().then(([authKey, authObj])=>{
  Room.join({
    id: "Olnit_iGRWs",
    password: "password"
  }, {
    storage: {
      player_name: "wxyz-abcd",
      avatar: "👽",
      player_auth_key: authKey
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
});

function roomCallback(room){ // "roomCallbacks" examples start from here.
  console.log("joined room");
}

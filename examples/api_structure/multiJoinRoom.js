const {Utils, Room} = require("node-haxball")();

const N = 3;

var joinFunc = function (currentId) {
  if (currentId >= N)
    return;
  Utils.generateAuth().then(([authKey, authObj])=>{
    Room.join({ 
      id:"qBdXBtQ_OVs", 
      password: "password",
      authObj: authObj
    },{
      storage: {
        player_name: "wxyz-abcd " + currentId,
        avatar: "👽",
        player_auth_key: authKey
      },
      onSuccess: (room)=>{
        roomCallbacks(room);
        joinFunc(currentId+1);
      },
      onFailure: (error) => {
        console.log("Unable to join room...", error.toString());
      },
      onLeave: (msg)=>{
        console.log("Bot has left the room:", msg.toString());
      }
    });
  });
};

joinFunc(0);

function roomCallbacks(room){ // "roomCallbacks" examples start from here. // look at examples/roomConfigs/method1 folder for related examples.
  console.log("joined room " + room.name);
}

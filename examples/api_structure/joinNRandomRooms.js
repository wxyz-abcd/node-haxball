const { OperationType, ConnectionState, Haxball, Utils } = require("../src/index");

const N = 10;

var haxBall = new Haxball({
  player_name: "wxyz-abcd",
  avatar: "👽",
});

haxBall.on("ready", () => {
  haxBall.getRoomList().then((list)=>{
    var idx = [];
    for (var i=0;i<N;){
      var n = Math.floor(Math.random()*list.length);
      if (!list[n].vd.Ib && !idx.includes(n)){ // vd.Ib is room password (true/false), we want to join N different random rooms without passwords.
        idx.push(n);
        i++;
      }
    }
    idx.forEach((x)=>{
      joinRoom(list[x].$, list[x].vd.w); // $ is room id, vd.w is room name
    })
  });
});

function joinRoom(roomId, roomName){

  var _haxBall = new Haxball({
    player_name: roomName, // set our name the same as the room that we want to join. :)
    avatar: "👽",
  });

  _haxBall.on("ready", () => {
    _haxBall.joinRoom({
      id: roomId
    }).then(roomCallback, () => {
      console.log("Unable to join room...");
    });

    _haxBall.on("roomLeave", function (str) {
      console.log("Bot has left the room:", str);
      joinRoom(roomId, roomName); // try to rejoin as soon as you left the room.
    });
    
    function roomCallback(room){ // "roomCallbacks" examples start from here.
      console.log("joined room " + roomName);
    }
  });

}



const { OperationType, VariableType, ConnectionState, AllowFlags, Callback, Utils, Room, Replay, Query, RoomConfig, Plugin, Renderer, Impl } = API = require("../src/index");

const N = 10;

Utils.generateAuth().then(([authKey, authObj])=>{

  function joinRoom(roomId, roomName){
    Room.join({
      id: roomId,
    }, {
      storage: {
        player_name: roomName, // set our name the same as the room that we want to join. :)
        avatar: "👽",
        player_auth_key: authKey
      }, 
      authObj: authObj,
      config: null, // example roomConfig usage: new autoPlay_followBall(API) // look at examples/roomConfigs/method2 folder for related examples.
      plugins: [], // example plugin usage: [new autoPlay_followBall(API)] // look at examples/plugins folder for related examples.
      onSuccess: roomCallbacks, // look at examples/roomConfigs/method1 folder for related examples.
      onLeave: (msg)=>{
        console.log("Bot has left the room:", msg);
        joinRoom(roomId, roomName); // try to rejoin as soon as you left the room.
      }
    });
  }

  Utils.getRoomList().then((list)=>{
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

function roomCallback(room){ // "roomCallbacks" examples start from here. // look at examples/roomConfigs/method1 folder for related examples.
  console.log("joined room " + room.getRoomData().name);
}

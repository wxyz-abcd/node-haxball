const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = require("node-haxball")();
const EnglishLanguage = require("../languages/englishLanguage");
API.Language.current = new EnglishLanguage(API); // if you want to use error.toString()

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

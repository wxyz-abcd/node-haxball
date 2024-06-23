// node.js / CommonJS initialization:
const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API = require("../../src/index")();
const EnglishLanguage = require("../languages/englishLanguage");
API.Language.current = new EnglishLanguage(API); // if you want to use error.toString()

// For initialization on browsers, read the documentation here: https://github.com/wxyz-abcd/node-haxball#-usage-on-browser

function PasswordGuesser(){
  const guessDictionary = ["password", "111", "222", "333", "123", "12345"]; // write as many guesses as you wish here.
  var idx = -1;
  this.currentGuess = function(){
    return guessDictionary[idx];
  };
  this.nextGuess = function(){
    if (idx>=guessDictionary.length-1)
      return null;
    return guessDictionary[++idx];
  };
}

var pg = new PasswordGuesser();

Utils.generateAuth().then(([authKey, authObj])=>{
  var storage = {
    player_name: "wxyz-abcd",
    avatar: "👽",
    player_auth_key: authKey
  };
  function joinRoom(id){
    var guess = pg.nextGuess();
    if (!guess){
      console.log("Could not guess password.");
      return;
    }
    Room.join({
      id: id,
      password: guess,
      authObj: authObj
    }, {
      storage: storage, 
      config: null, // example roomConfig usage: new autoPlay_followBall(API) // look at examples/roomConfigs/method2 folder for related examples.
      renderer: null, // example renderer usage: new defaultRenderer(API, {canvas: ..., images: {grass: ..., concrete: ..., concrete2: ..., typing: ...}, paintGame: true}) // look at examples_web folder for usage with room.setRenderer instead.
      plugins: [], // example plugin usage: [new autoPlay_followBall(API)] // look at examples/plugins folder for related examples.
      onSuccess: roomCallbacks, // look at examples/roomConfigs/method1 folder for related examples.
      onFailure: () => {
        joinRoom(id); // try again if failed.
      }
    });
  }
  joinRoom("8Q059ls-QTQ"); // room id here.
});

function roomCallbacks(room){ // "roomCallbacks" examples start from here. // look at examples/roomConfigs/method1 folder for related examples.
  console.log("room password is: " + pg.currentGuess());  // finally found the room password.
}

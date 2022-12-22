const { OperationType, ConnectionState, Room, Utils, Replay, Plugin } = require("../src/index");

function PasswordGuesser(){
  const guessDictionary = ["password", "111", "222", "333", "123", "12345"]; // write as many guesses as you wish here.
  var idx = -1;

  this.currentGuess = function(){
    return guessDictionary[idx];
  }

  this.nextGuess = function(){
    if (idx>=guessDictionary.length-1)
      return null;
    return guessDictionary[++idx];
  }
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
      password: guess
    }, {
      authObj: authObj,
      storage: storage, 
      onSuccess: roomCallback,
      onFailure: () => {
        joinRoom(id); // try again if failed.
      }
    });
  }
  
  joinRoom("8Q059ls-QTQ"); // room id here.
});

function roomCallback(room){ // "roomCallbacks" examples start from here.
  console.log("room password is: " + pg.currentGuess());  // finally found the room password.
}

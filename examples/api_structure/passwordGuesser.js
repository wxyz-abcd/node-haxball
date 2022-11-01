const { OperationType, ConnectionState, Haxball, keyState } = require("../src/index");

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

var haxBall = new Haxball({
  player_name: "wxyz-abcd",
  avatar: "👽",
});

var pg = new PasswordGuesser();

function joinRoom(id){
  haxBall.joinRoom({
    id: id, 
    password: pg.nextGuess()
  }).then(roomCallback, () => {
    joinRoom(id); // try again if failed.
  });
}

haxBall.on("ready", () => {
  joinRoom("8Q059ls-QTQ"); // room id here.
});

function roomCallback(room){ // "roomCallbacks" examples start from here.
  console.log("room password is: " + pg.currentGuess());  // finally found the room password.
}

const { Replay } = require("../src/index");
const fs = require("fs");

var data = fs.readFileSync("test.hbr2", null);

var replayReader = Replay.read(data, {
  onPlayerChat: (id, message) => {
    console.log(replayReader.roomData.na(id).w + " : " + message);
  },
  onPlayerTeamChange: (id, teamId, byId) => {
    var by = replayReader.roomData.na(byId)?.w;
    console.log(replayReader.roomData.na(id).w + " was moved to " + (teamId==1?"red":(teamId==2?"blue":"spectators")) + (by ? (" by " + by) : ""));
  },
  onGameTick: ()=>{
    console.log("time:", replayReader.getTime()); // getTime() might yield the same result for successive game ticks.
  }
});

replayReader.onEnd = ()=>{ // close the program when the end of replay data is reached.
  replayReader.destroy();
  process.exit(0);
};

replayReader.setSpeed(1); // start playing

// play for 10 seconds

setTimeout(()=>{
  replayReader.setSpeed(0); // stop playing for 5 seconds
  setTimeout(()=>{
    replayReader.setSpeed(2); // start playing with 2x speed
  }, 5000);
}, 10000);

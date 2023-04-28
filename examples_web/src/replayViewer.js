const gameStateGUIUpdateFrameInterval = 30;
var countries, canvas, redScore, blueScore, gameTime, gameTime_ot, gameTime_m1, gameTime_m2, gameTime_s1, gameTime_s2, API, sound, rendererParams, renderer, replayReader, menu;
var speed = 1.0;

function initGameMenu(){
  var elem = document.getElementsByClassName("gameMenu").item(0);
  menu = makeDialog("Game Menu");
  var contents = menu.getContentsElement();
  contents.innerHTML = elem.innerHTML;
  elem.remove();
  elem = contents;
  document.body.appendChild(menu.element);
  var teamsDiv = elem.children.item(0);
  var redTeam = teamsDiv.children.item(0).children.item(1);
  var specTeam = teamsDiv.children.item(1).children.item(1);
  var blueTeam = teamsDiv.children.item(2).children.item(1);
  menu.update = function(){
    redTeam.innerHTML = "";
    specTeam.innerHTML = "";
    blueTeam.innerHTML = "";
    replayReader.state.players.forEach((playerObj)=>{
      var name = "["+playerObj.id+"] "+playerObj.name;
      var ePlayer = document.createElement("div");
      ePlayer.classList.add("playerElement");
      ePlayer.innerText = name;
      ePlayer.object = playerObj;
      switch(playerObj.team.id){
        case 0:
          ePlayer.classList.add("spec");
          specTeam.appendChild(ePlayer);
          break;
        case 1:
          ePlayer.classList.add("red");
          redTeam.appendChild(ePlayer);
          break;
        case 2:
          ePlayer.classList.add("blue");
          blueTeam.appendChild(ePlayer);
          break;
      }
      var eFlag = document.createElement("div");
      eFlag.classList.add("flagico");
      eFlag.classList.add("f-"+playerObj.flag);
      eFlag.classList.add("playerFlag");
      ePlayer.appendChild(eFlag);
    });
    /*
    bStartGame.innerText = room.gameState ? "\u25a0" : "\u25b6";
    if (room.gameState){
      bStartGame.classList.add("red");
      bStartGame.classList.remove("green");
    }
    else{
      bStartGame.classList.remove("red");
      bStartGame.classList.add("green");
    }
    //bChangeStadium.disabled = !!room.gameState;
    bPauseGame.disabled = !room.gameState;
    */
  };
}

function updateGUI(){
  menu.update();
  //updateToolbars();
}

var oldGUIValues = {};

function updateGameStateGUI(gameState){
  var _redScore = gameState.redScore, _blueScore = gameState.blueScore;
  if (oldGUIValues.redScore!=_redScore){
    redScore.innerText = ""+_redScore;
    oldGUIValues.redScore = _redScore;
  }
  if (oldGUIValues.blueScore!=_blueScore){
    blueScore.innerText = ""+_blueScore;
    oldGUIValues.blueScore = _blueScore;
  }
  var totalGameTime = 60*gameState.timeLimit, elapsedGameTime = gameState.timeElapsed|0;
  var s = elapsedGameTime%60, m = (elapsedGameTime/60)|0;
  if (elapsedGameTime<totalGameTime && elapsedGameTime>totalGameTime-30){
    if (!oldGUIValues.timeWarningActive){
      gameTime.classList.add("time-warn");
      oldGUIValues.timeWarningActive = true;
    }
  }
  else if (oldGUIValues.timeWarningActive){
    gameTime.classList.remove("time-warn");
    oldGUIValues.timeWarningActive = false;
  }
  if (totalGameTime!=0 && elapsedGameTime>totalGameTime){
    if (!oldGUIValues.overtimeActive){
      gameTime_ot.classList.add("on");
      oldGUIValues.overtimeActive = true;
    }
  }
  else if (oldGUIValues.overtimeActive){
    gameTime_ot.classList.remove("on");
    oldGUIValues.overtimeActive = false;
  }
  var m1 = ((m/10)|0)%10, m2 = m%10, s1 = ((s/10)|0)%10, s2 = s%10;
  if (oldGUIValues.m1!=m1){
    gameTime_m1.innerText = ""+m1;
    oldGUIValues.m1 = m1;
  }
  if (oldGUIValues.m2!=m2){
    gameTime_m2.innerText = ""+m2;
    oldGUIValues.m2 = m2;
  }
  if (oldGUIValues.s1!=s1){
    gameTime_s1.innerText = ""+s1;
    oldGUIValues.s1 = s1;
  }
  if (oldGUIValues.s2!=s2){
    gameTime_s2.innerText = ""+s2;
    oldGUIValues.s2 = s2;
  }
}

function loadImage(path){
  return new Promise((resolve, reject)=>{
    var img = document.createElement("img");
    img.src = path;
    img.onload = ()=>{
      resolve(img);
    };
    img.onerror = (err)=>{
      reject(err);
    };
  });
}

function Sound(){
  this.audio = new AudioContext(); // c
  this.gain = this.audio.createGain(); // ag
  this.gain.gain.value = 1;
  this.gain.connect(this.audio.destination);
  var that = this;
  this.loadSound = function(path){
    return new Promise((resolve, reject)=>{
      fetch(path).then((response) => {
        if (!response.ok) {
          reject();
          return;
        }
        return response.arrayBuffer();
      }).then((arrayBuffer) => {
        return that.audio.decodeAudioData(arrayBuffer, resolve, reject);
      }).catch(reject);
    });
  };
  this.playSound = function(sound){
    var bufferSource = that.audio.createBufferSource();
    bufferSource.buffer = sound;
    bufferSource.connect(that.gain);
    bufferSource.start();
  };
}

window.addEventListener("load", function(){
  fetch("./countries.json").then((response)=>{
    return response.json();
  }).then((c) => {
    countries = c;
    onload();
  });
});

function onload(){
  var tmp = document.getElementsByClassName("canvasSubContainer");
  var btStart = document.getElementById("btStart");
  var canvasContainer = tmp.item(0);
  canvas = canvasContainer.children.item(0);
  var gameStateContainer = canvasContainer.children.item(1);
  var scoreBoard = gameStateContainer.children.item(0);
  redScore = scoreBoard.children.item(1);
  blueScore = scoreBoard.children.item(3);
  gameTime = gameStateContainer.children.item(1);
  gameTime_ot = gameTime.children.item(0);
  gameTime_m1 = gameTime.children.item(1);
  gameTime_m2 = gameTime.children.item(2);
  gameTime_s1 = gameTime.children.item(4);
  gameTime_s2 = gameTime.children.item(5);
  API = abcHaxballAPI({
    setTimeout: window.setTimeout,
    clearTimeout: window.clearTimeout,
    setInterval: window.setInterval,
    clearInterval: window.clearInterval,
    console: window.console,
    requestAnimationFrame: window.requestAnimationFrame,
    cancelAnimationFrame: window.cancelAnimationFrame,
    RTCPeerConnection: window.RTCPeerConnection, 
    RTCIceCandidate: window.RTCIceCandidate, 
    RTCSessionDescription: window.RTCSessionDescription, 
    crypto: window.crypto,
    WebSocket: window.WebSocket,
    XMLHttpRequest: window.XMLHttpRequest,
    performance: window.performance,
    JSON5: window.JSON5,
    pako: window.pako
  }, {
    noVariableValueChangeEvent: true
  });
  sound = new Sound();
  canvas.addEventListener("wheel", (event)=>renderer.onWheel(event));
  Promise.all([sound.loadSound("./sounds/chat.ogg"), sound.loadSound("./sounds/crowd.ogg"), sound.loadSound("./sounds/goal.ogg"), sound.loadSound("./sounds/highlight.wav"), sound.loadSound("./sounds/join.ogg"), sound.loadSound("./sounds/kick.ogg"), sound.loadSound("./sounds/leave.ogg")]).then((sounds)=>{
    sound.chat = sounds[0];
    sound.crowd = sounds[1];
    sound.goal = sounds[2];
    sound.highlight = sounds[3];
    sound.join = sounds[4];
    sound.kick = sounds[5];
    sound.leave = sounds[6];
  }, (err)=>{
    console.log(err);
    alert("Error loading sounds. Look at console for error details.");
  });

  var tb = document.getElementById("timeBar"), tbh = document.getElementById("timeBarHandle"), dragging = false, spos = 0;
  var sp = document.getElementById("speed");
  window.onpointerdown = function(e){
    if (e.target==tbh || e.target.parentElement==tbh)
      dragging = true;
  };
  function updatespos(x){
    var rect = tb.getBoundingClientRect();
    var ratio = (x - rect.left)/rect.width;
    if (ratio<0)
      ratio = 0;
    else if (ratio>1)
      ratio = 1;
    spos = ratio;
    tbh.style.left = (ratio*rect.width-15)+"px";
  }
  window.onpointermove = function(e){
    if (!dragging)
      return;
    updatespos(e.pageX);
  };
  window.onpointerup = function(e){
    if (replayReader!=null && (e.target==tb || e.target==tbh || e.target.parentElement==tbh || dragging)){
      updatespos(e.pageX);
      tb.disabled = true;
      sp.disabled = true;
      btStart.disabled = true;
      replayReader.setTime(spos*replayReader.length());
    }
    dragging = false;
  };
  var onDestinationTimeReached = ()=>{
    tb.disabled = false;
    sp.disabled = false;
    btStart.disabled = false;
  };
  setInterval(()=>{
    if (!replayReader)
      return;
    var rect = tb.getBoundingClientRect();
    updatespos(rect.left+rect.width*replayReader.getTime()/replayReader.length());
  }, 200);
  sp.onchange = function(e){
    var val = parseFloat(e.target.value);
    if (!isFinite(val) || isNaN(val))
      return;
    speed = val;
    replayReader.setSpeed(speed);
  };
  btStart.onclick = function(){
    if (!replayReader)
      return;
    if (replayReader.getSpeed()>0)
      replayReader.setSpeed(0);
    else{
      if (speed==0){
        sp.value = 1;
        speed = 1;
      }
      replayReader.setSpeed(speed);
    }
  };

  importRenderers(["defaultRenderer"], ()=>{
    Promise.all([loadImage("./images/grass.png"), loadImage("./images/concrete.png"), loadImage("./images/concrete2.png"), loadImage("./images/typing.png")]).then((images)=>{
      var counter = 0, ctx = canvas.getContext("2d", { alpha: false });
      rendererParams = {
        canvas: canvas, 
        images: {
          grass: images[0],
          concrete: images[1],
          concrete2: images[2],
          typing: images[3]
        },
        paintGame: true,
        onRequestAnimationFrame: ()=>{
          counter++;
          if (counter>gameStateGUIUpdateFrameInterval){
            counter=0;
            updateGameStateGUI(replayReader.gameState);
          }
        }
      };
      renderer = new renderers.defaultRenderer(API, rendererParams);
      renderer.followMode = false;
      //renderer.squarePlayers = true;
      renderer.restrictCameraOrigin = false;
      renderer.showInvisibleSegments = true;
      renderer.showInvisibleJoints = true;
      renderer.showPlanes = true;
      renderer.showGoals = true;
      renderer.showVertices = true;
      renderer.showSpawnPoints = true;
      renderer.showPlayers = true;
      function by(playerObj){
        return playerObj ? (" by "+playerObj.name) : "";
      }
      function receiveNotice(msg){
        console.log("%c%s", "color:#8ed2ab;font-family:system-ui;font-size:1rem;-webkit-text-stroke: 1px #8ed2ab", msg);
      }
      function receiveAnnouncement(msg, color, style){
        color = color>0 ? API.Utils.numberToColor(color) : "black";
        var bold = (style==1||style==4)?";font-weight:bold":"";
        var italic = (style==2||style==5)?";font-style:italic":"";
        var size = (style==3||style==4||style==5)?"12px":"1rem";
        console.log("%c%s", "color:"+color+";font-family:system-ui;font-size:"+size+";-webkit-text-stroke: 1px black"+bold+italic, msg);
      }
      var callbacks = {
        onSetDiscProperties: function(id, type, data1, data2, customData){
          console.log("onSetDiscProperties", id, type, data1, data2, customData);
        },
        onPlayerJoin: (playerObj)=>{
          sound.playSound(sound.join);
          receiveNotice("["+playerObj.id+"]"+playerObj.name+" has joined");
          updateGUI();
        },
        onPlayerLeave: (playerObj, reason, isBanned, byId)=>{
          sound.playSound(sound.leave);
          var byPlayer = replayReader.state.getPlayer(byId);
          if (reason==null)
            receiveNotice("["+playerObj.id+"]"+playerObj.name+" has left")
          else
            receiveNotice("["+playerObj.id+"]"+playerObj.name+" was "+(isBanned?"banned":"kicked")+by(byPlayer)+(""!=reason?" ("+reason+")":""));
          updateGUI();
        },
        onPlayerBallKick: ()=>{
          sound.playSound(sound.kick);
        },
        onTeamGoal: (teamId)=>{
          sound.playSound(sound.goal);
          renderer.onTeamGoal(teamId);
        },
        onTimeIsUp: ()=>{
          renderer.onTimeIsUp();
        },
        onGamePauseChange: (paused, byId)=>{
          var byPlayerObj = replayReader.state.getPlayer(byId);
          paused && receiveNotice("Game paused"+by(byPlayerObj));
          updateGUI();
        },
        onGameStart: (byId)=>{
          var byPlayerObj = replayReader.state.getPlayer(byId);
          renderer.onGameStart(byId);
          receiveNotice("Game started"+by(byPlayerObj));
          updateGUI();
        },
        onGameEnd: (winningTeamId)=>{
          renderer.onGameEnd(winningTeamId);
          receiveNotice(API.Impl.p.byId[winningTeamId].name+" team won the match");
        },
        onGameStop: (byId)=>{
          var byPlayerObj = replayReader.state.getPlayer(byId);
          null != byPlayerObj && receiveNotice("Game stopped"+by(byPlayerObj));
          updateGUI();
        },
        onPlayerTeamChange: (id, teamId, byId)=>{
          var playerObj = replayReader.state.getPlayer(id), byPlayerObj = replayReader.state.getPlayer(byId);
          if (!playerObj)
            return;
          receiveNotice("["+playerObj.id+"]"+playerObj.name+" was moved to "+playerObj.team.name+by(byPlayerObj));
          updateGUI();
        },
        onPlayerChat: (id, message)=>{
          var playerObj = replayReader.state.getPlayer(id);
          if (!playerObj)
            return;
          console.log("%c%s", "color:black;font-family:system-ui;font-size:1rem;-webkit-text-stroke: 1px black", "["+playerObj.id+"]"+playerObj.name+" : "+message);//font-weight:bold
          sound.playSound(sound.chat);
        },
        onPlayerChatIndicatorChange: (id, value)=>{},
        onAnnouncement: (msg, color, style, _sound)=>{
          receiveAnnouncement(msg, color, style);
          sound.playSound(sound.chat);
        },
        onStadiumChange: (stadium, byId)=>{
          var byPlayerObj = replayReader.state.getPlayer(byId);
          if (stadium.isCustom)
            receiveNotice("Stadium \""+stadium.name+"\" loaded"+by(byPlayerObj));
          updateGUI();
        },
        onPlayerSyncChange: (playerId, value)=>{
          var playerObj = replayReader.state.getPlayer(playerId);
          receiveNotice("["+playerObj.id+"]"+playerObj.name+" "+(value?"has desynchronized":"is back in sync"));
        },
        onAutoTeams: (playerId1, teamId1, playerId2, teamId2, byId)=>{},
        onPlayerAdminChange: (id, isAdmin, byId)=>{
          var playerObj = replayReader.state.getPlayer(id);
          if (!playerObj)
            return;
          receiveNotice((playerObj.isAdmin?("["+playerObj.id+"]"+playerObj.name+" was given admin rights"):("["+playerObj.id+"]"+playerObj.name+"'s admin rights were taken away"))+by(replayReader.state.getPlayer(byId)));
          updateGUI();
        },
        onKickRateLimitChange: (min, rate, burst, byId)=>{
          receiveNotice("Kick Rate Limit set to (min: "+min+", rate: "+rate+", burst: "+burst+")"+by(replayReader.state.getPlayer(byId)));
        },
        onScoreLimitChange: (value, byId)=>{},
        onTimeLimitChange: (value, byId)=>{},
        onTeamsLockChange: (value, byId)=>{},
        onPingData: (array)=>{},
        render: renderer.render
      };
      var frElem = document.createElement("input");
      frElem.type = "file";
      frElem.accept = "*.hbr2"
      frElem.onchange = function(){
        if (frElem.files.length==0)
          return;
        var reader = new FileReader();
        reader.readAsArrayBuffer(frElem.files.item(0));
        reader.onload = function(){
          var data = new Uint8Array(reader.result);
          replayReader = API.Replay.read(data, callbacks);
          replayReader.onDestinationTimeReached = onDestinationTimeReached;
          renderer.room = replayReader;
          renderer.initialize(replayReader);
          //replayReader.setSpeed(1.0);
        }
      };
      document.getElementById("load").onclick = function(){
        frElem.click();
      }
      initGameMenu();
      document.getElementById("menu").onclick = function(){
        menu.setVisible(true, { x: 400, y: 300 });
      };
    }, (err)=>{
      console.log(err);
      alert("Error loading images. Look at console for error details.");
    });
  });
}

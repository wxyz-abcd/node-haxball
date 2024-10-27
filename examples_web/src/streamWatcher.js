// TODO: Add playback/replay support...

const chatHistoryLimit = 500, gameStateGUIUpdateFrameInterval = 30, scrollBarUpdateInterval = 200;
var roomFrame, canvasContainer, roomState, chatApi, room, API, sound, rendererParams, renderer, sandboxParams, beginFrameNo, currentFrameNo, endFrameNo;
var gameTime, redScore, blueScore, gameTime_ot, gameTime_m1, gameTime_m2, gameTime_s1, gameTime_s2, timeScroller;

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

function updateGUI(){
  var pg = rendererParams?.paintGame;
  roomFrame.style.display = pg ? "none" : "block";
  canvasContainer.style.display = pg ? "block" : "none";
  if (!pg)
    roomFrame.contentWindow.update(API, room, roomState);
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
  // we dont need check for s2 because this function runs once in each second, therefore the last digit should always be different.
  gameTime_s2.innerText = ""+s2;
}

window.onKeyDown = function(event){
  switch (event.keyCode) {
    case 27:{
      if (rendererParams)
        rendererParams.paintGame = (!!roomState.gameState) && (!rendererParams.paintGame);
      updateGUI();
      event.preventDefault();
      break;
    }
  }
};

window.onRoomLeave = function(){
  window.onbeforeunload = null;
  window.document.removeEventListener("keydown", window.onKeyDown);
  room?.leave();
  window.close();
};

setInterval(()=>{
  timeScroller.style.left = (100*(currentFrameNo-beginFrameNo)/(endFrameNo-beginFrameNo))+"%";
}, scrollBarUpdateInterval);

window.onload = ()=>{
  window.onload = null;
  var tmp = document.getElementsByClassName("canvasSubContainer");
  roomFrame = tmp.item(0);
  canvasContainer = tmp.item(1);
  var canvas = canvasContainer.children.item(0);
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
  timeScroller = document.getElementsByClassName("scrollPositionIndicator").item(0);
  var chatLog = document.getElementsByClassName("chatLog").item(0);
  var scrollTopRef = -1;
  chatLog.onscroll = function(event){
    if (chatLog.scrollTop>=chatLog.scrollHeight - chatLog.clientHeight - 20)
      scrollTopRef = -1;
    else
      scrollTopRef = chatLog.scrollTop;
  };
  function addChatRow({type, className, content, color, font}){
    var e = document.createElement("p");
    if (type==0 && className!=null)
      e.className = className;
    else if (type==1){
      e.className = "announcement";
      if (color>=0)
        e.style.color = API.Utils.numberToColor(color);
      switch (font){
        case 1:
          e.style.fontWeight = "bold";
          break;
        case 2:
          e.style.fontStyle = "italic";
          break;
        case 3:
          e.style.fontSize = "12px";
          break;
        case 4:
          e.style.fontWeight = "bold";
          e.style.fontSize = "12px";
          break;
        case 5:
          e.style.fontStyle = "italic";
          e.style.fontSize = "12px";
          break;
      }
    }
    e.innerText = content;
    if (chatLog.children.length>=chatHistoryLimit)
      chatLog.children.item(0).remove();
    chatLog.appendChild(e);
    if (scrollTopRef==-1)
      chatLog.scrollTop = chatLog.scrollHeight - chatLog.clientHeight;
  }
  chatApi = {
    receiveChatMessage: function(nick, msg){
      addChatRow({type: 0, content: nick + " : " + msg, color: 1, font: 1})
    },
    receiveAnnouncement: function(msg, color, style){
      addChatRow({type: 1, content: msg, color: color, font: style})
    },
    receiveNotice: function(msg){
      addChatRow({type: 0, content: msg, className: "notice"})
    }
  };
  var roomCallback = function(){
    sound = new Sound();
    document.addEventListener("keydown", window.onKeyDown);
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
    Promise.all([loadImage("./images/grass.png"), loadImage("./images/concrete.png"), loadImage("./images/concrete2.png"), loadImage("./images/typing.png")]).then((images)=>{
      var counter = 0, room;
      sandboxParams = { controlledPlayerId: -1 };
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
          if (!roomState.gameState)
            return;
          counter++;
          if (counter>gameStateGUIUpdateFrameInterval){
            counter=0;
            Promise.resolve().then(()=>updateGameStateGUI(roomState.gameState));
          }
        }
      };
      var renderer = new renderers.defaultRenderer(API, rendererParams);
      var { Team } = API.Impl.Core, { Reader } = API.Impl.Stream;
      function by(playerObj){
        return (null == playerObj ? "" : " by [" + playerObj.id + "]" + playerObj.name);
      }
      var callbacks = {
        onPlayerChat: function(id, message, customData){
          var playerObj = roomState.players.find((x)=>x.id==id);
          if (!playerObj)
            return;
          chatApi.receiveChatMessage("[" + playerObj.id + "]" + playerObj.name, message); // d ? "highlight" : null
          sound.playSound(sound.chat);//sound.highlight
        },
        onPlayerJoin: function(playerObj, customData){
          chatApi.receiveNotice("[" + playerObj.id + "]" + playerObj.name + " has joined");
          sound.playSound(sound.join);
          updateGUI();
        },
        onPlayerLeave: function (playerObj, reason, isBanned, byId, customData) {
          var byPlayerObj = roomState.players.find((x)=>x.id==byId);
          if (reason != null)
            chatApi.receiveNotice("[" + playerObj.id + "]" + playerObj.name + " was " + (isBanned ? "banned" : "kicked") + by(byPlayerObj) + ("" != reason ? " (" + reason + ")" : ""));
          else
            chatApi.receiveNotice("[" + playerObj.id + "]" + playerObj.name + " has left");
          sound.playSound(sound.leave);
          updateGUI();
        },
        onAnnouncement: function (msg, color, style, _sound, customData) {
          chatApi.receiveAnnouncement(msg, color, style);
          switch (_sound) {
            case 1:
              sound.playSound(sound.chat);
              break;
            case 2:
              sound.playSound(sound.highlight);
              break;
          }
        },
        onPlayerBallKick: function (customData) {
          sound.playSound(sound.kick);
        },
        onTeamGoal: function (teamId, customData) {
          sound.playSound(sound.goal);
        },
        onGameEnd: function (winningTeamId, customData) {
          chatApi.receiveNotice("" + Team.byId[winningTeamId].name + " team won the match");
        },
        onGamePauseChange: function (paused, byId, customData) {
          var byPlayerObj = roomState.players.find((x)=>x.id==byId);
          if (paused)
            chatApi.receiveNotice("Game paused" + by(byPlayerObj));
          updateGUI();
        },
        onGameStart: function (byId, customData) {
          var byPlayerObj = roomState.players.find((x)=>x.id==byId);
          chatApi.receiveNotice("Game started" + by(byPlayerObj));
          if (rendererParams)
            rendererParams.paintGame = true;
          updateGUI();
        },
        onGameStop: function (byId, customData) {
          var byPlayerObj = roomState.players.find((x)=>x.id==byId);
          if (byPlayerObj!=null)
            chatApi.receiveNotice("Game stopped" + by(byPlayerObj));
          if (rendererParams)
            rendererParams.paintGame = false;
          updateGUI();
        },
        onStadiumChange: function (stadium, byId, customData) {
          var byPlayerObj = roomState.players.find((x)=>x.id==byId);
          var checksum = stadium.calculateChecksum();
          if (checksum)
            chatApi.receiveNotice('Stadium "' + stadium.name + '" (' + checksum + ") loaded" + by(byPlayerObj));
          updateGUI();
        },
        onPlayerSyncChange: function (playerId, value, customData) {
          var playerObj = roomState.players.find((x)=>x.id==playerId);
          chatApi.receiveNotice("[" + playerObj.id + "]" + playerObj.name + " " + (playerObj.sync ? "has desynchronized" : "is back in sync"));
        },
        onPlayerTeamChange: function (id, teamId, byId, customData) {
          var byPlayerObj = roomState.players.find((x)=>x.id==byId), playerObj = roomState.players.find((x)=>x.id==id), teamObj = Team.byId[teamId];
          if (roomState.gameState!=null)
            chatApi.receiveNotice("[" + playerObj.id + "]" + playerObj.name + " was moved to " + teamObj.name + by(byPlayerObj));
          updateGUI();
        },
        onAutoTeams: function (playerId1, teamId1, playerId2, teamId2, byId, customData) {
          callbacks.onPlayerTeamChange(playerId1, teamId1, byId, customData);
          if (playerId2!=null && teamId2!=null)
            callbacks.onPlayerTeamChange(playerId2, teamId2, byId, customData);
        },
        onPlayerAdminChange: function (id, isAdmin, byId, customData) {
          var byPlayerObj = roomState.players.find((x)=>x.id==byId), playerObj = roomState.players.find((x)=>x.id==id);
          chatApi.receiveNotice((playerObj.isAdmin ? ("[" + playerObj.id + "]" + playerObj.name + " was given admin rights") : ("[" + playerObj.id + "]" + playerObj.name + "'s admin rights were taken away")) + by(byPlayerObj));
          updateGUI();
        },
        onKickRateLimitChange: function (min, rate, burst, byId, customData) {
          var byPlayerObj = roomState.players.find((x)=>x.id==byId);
          chatApi.receiveNotice("Kick Rate Limit set to (min: " + min + ", rate: " + rate + ", burst: " + burst + ")" + by(byPlayerObj));
        },
        onCustomEvent: function (type, data, byId, customData) {
          var byPlayerObj = roomState.players.find((x)=>x.id==byId);
          chatApi.receiveNotice("Custom Event triggered (type: " + type + ", data: [" + JSON.stringify(data) + "])" + by(byPlayerObj));
        },
        onScoreLimitChange: function (value, byId, customData) {
          updateGUI();
        },
        onTimeLimitChange: function (value, byId, customData) {
          updateGUI();
        },
        onTeamsLockChange: function (value, byId, customData) {
          updateGUI();
        },
        onPingData: function (array, customData) {
          updateGUI();
        },
        render: renderer.render
      };
      function onInit(data){
        room = API.Room.streamWatcher(data, callbacks, sandboxParams);
        renderer.room = room;
        renderer.initialize();
        roomState = room.state;
        beginFrameNo = currentFrameNo = endFrameNo = room.currentFrameNo;
        updateGUI();
      }
      var socket = new WebSocket("ws://localhost:1935");
      socket.binaryType = "arraybuffer";
      socket.onerror = (e)=>{
        console.log("websocket error:",e);
      };
      socket.onmessage = (e)=>{
        var d = e.data, reader = new Reader(new DataView(d));
        var type = reader.readUint8();
        switch (type){
          case 0:{
            room.readStream(reader);
            currentFrameNo = room.currentFrameNo;
            endFrameNo = room.maxFrameNo;
            break;
          }
          case 1:{
            if (room)
              return;
            var clientId = reader.readUint16();
            console.log("client id:", clientId);
            onInit(pako.inflateRaw(new Uint8Array(d, reader.offset)));
            break;
          }
          case 2:{
            room.readImmediateStream(reader);
            currentFrameNo = room.currentFrameNo;
            endFrameNo = room.maxFrameNo;
            break;
          }
        }
      };
      updateGUI();
    }, (err)=>{
      console.log(err);
      alert("Error loading images. Look at console for error details.");
    });
  };
  API = init(false, roomCallback);
};

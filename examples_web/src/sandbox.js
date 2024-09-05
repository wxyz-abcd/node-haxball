// Most of the codes in this file is now old enough. It should be updated to reflect the changes within the API.

const VariableType = {
  Boolean: 0,
  Integer: 1,
  Number: 2,
  String: 3,
  Color: 4,
  CollisionFlags: 5,
  Coordinate: 6,
  Team: 7,
  TeamWihSpec: 8,
  BgType: 9,
  CameraFollow: 10,
  KickOffReset: 11,
  Flag: 12
};

const CollisionFlags = [
  "none",
  "ball",
  "red",
  "blue",
  "redKO",
  "blueKO",
  "wall",
  "kick",
  "score",
  "free1",
  "free2",
  "free3",
  "free4",
  "free5",
  "free6",
  "free7",
  "free8",
  "free9",
  "free10",
  "free11",
  "free12",
  "free13",
  "free14",
  "free15",
  "free16",
  "free17",
  "free18",
  "free19",
  "free20",
  "c0",
  "c1",
  "c2",
  "c3",
];

const gameStateGUIUpdateFrameInterval = 30;
var chatApi, room, API, keyHandler, sound, rendererParams, renderer, playerIdCounter = 0, countries, sandboxParams = { controlledPlayerId: -1 };
var gameTime, redScore, blueScore, gameTime_ot, gameTime_m1, gameTime_m2, gameTime_s1, gameTime_s2, toolDialog, menu, dlgSnapshots, canvas, cmp, ctxMenu, frozen, gameSpeed = 1.0;
var toolSelect, bStartGame, bChangeStadium, bPauseGame, bFreeze, bStep, iSpeed, bSnapshots, bSaveStadium, snapshotArray = [], snapshotIdCounter = 0;
var currentToolId = null, currentTool = null, tools = [], dialogContents, toolsMenuElements, eStatusMessage, eStatusCoords, ePlayMode;
const toolIndices = [
  [0, 0, 0], 
  [1, 9, 17],
  [2, 10, 18],
  [3, 11, 19],
  [4, 12, 20],
  [5, 13, 21],
  [6, 14, 22],
  [7, 15, 23],
  [8, 16, 24]
];

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

function downloadFile(fileName, blobType, blobContents){
  var c = window.document.createElement("a");
  c.style.display = "display: none";
  window.document.body.appendChild(c);
  var d = URL.createObjectURL(new Blob([blobContents], { type: blobType }));
  c.href = d;
  c.download = fileName;
  c.click();
  URL.revokeObjectURL(d);
  c.remove();
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

function GameKeysHandler(){
  this.keyState = 0;
  
  var that = this, keys = new Map();
  keys.set("ArrowUp", "Up");
  keys.set("KeyW", "Up");
  keys.set("ArrowDown", "Down");
  keys.set("KeyS", "Down");
  keys.set("ArrowLeft", "Left");
  keys.set("KeyA", "Left");
  keys.set("ArrowRight", "Right");
  keys.set("KeyD", "Right");
  keys.set("KeyX", "Kick");
  keys.set("Space", "Kick");
  keys.set("ControlLeft", "Kick");
  keys.set("ControlRight", "Kick");
  keys.set("ShiftLeft", "Kick");
  keys.set("ShiftRight", "Kick");
  keys.set("Numpad0", "Kick");

  var keyValue = function (key) {
    switch (keys.get(key)) {
      case "Down":
        return 2;
      case "Kick":
        return 16;
      case "Left":
        return 4;
      case "Right":
        return 8;
      case "Up":
        return 1;
      default:
        return 0;
    }
  };
  this.pressKey = function(key){
    that.keyState |= keyValue(key);
    room.setKeyState(that.keyState);
  };
  this.releaseKey = function(key){
    that.keyState &= ~keyValue(key);
    room.setKeyState(that.keyState);
  };
  this.reset = function(){
    if (that.keyState==0)
      return;
    that.keyState = 0;
    room.setKeyState(0);
  }
};

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

window.onKeyDown = function(event){
  currentTool.onKeyDown&&currentTool.onKeyDown(event);
};

window.onKeyUp = function(event){
  currentTool.onKeyUp&&currentTool.onKeyUp(event);
};

window.onMouseDown = function(event){
  currentTool.onMouseDown&&currentTool.onMouseDown(event);
};

window.onMouseUp = function(event){
  currentTool.onMouseUp&&currentTool.onMouseUp(event);
};

window.onMouseMove = function(event){
  currentTool.onMouseMove&&currentTool.onMouseMove(event);
};

window.onWheel = function(event){
  currentTool.onWheel&&currentTool.onWheel(event);
};

window.onContextMenu = function(event){
  event.preventDefault();
};

window.onRoomLeave = function(){
  window.onbeforeunload = null;
  window.document.removeEventListener("focusout", keyHandler.reset);
  window.document.removeEventListener("keyup", window.onKeyUp);
  window.document.removeEventListener("keydown", window.onKeyDown);
  room.leave();
  window.close();
};

function setControlledPlayerId(id){
  renderer.followPlayerId = id;
  sandboxParams.controlledPlayerId = id;
}

function updateGUI(){
  menu.update();
  updateToolbars();
}

function updateToolbars(){
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
  bSaveStadium.disabled = !room.gameState;
  bStep.disabled = !frozen;
  //bPauseGame.innerText = (room.gameState?.pauseGameTickCounter>0) ? "Resume Game" : "Pause Game";
  bFreeze.innerText = frozen ? "Unfreeze" : "Freeze";
}

function initToolbars(){
  eStatusMessage = document.getElementsByClassName("statusmessage").item(0);
  eStatusCoords = document.getElementsByClassName("statuscoords").item(0);
  var tb2 = document.getElementsByClassName("toolbar2").item(0);
  var tb3 = document.getElementsByClassName("toolbar3").item(0);
  var tb3m = document.getElementsByClassName("toolbar3menu").item(0);
  function toggleToolbarsVisible(){
    var newValue = (tb2.style.display == "flex") ? "none" : "flex";
    tb2.style.display = newValue;
    tb3.style.display = newValue;
  }
  document.getElementsByClassName("toolbarbtn").item(0).onclick = toggleToolbarsVisible;
  toolSelect = document.getElementById("tool");
  toolSelect.onchange = function(event){
    setCurrentTool(tools[event.target.selectedIndex]);
  };
  document.getElementById("menu").onclick = function(){
    menu.setVisible(true, { x: 400, y: 300 });
  };
  ePlayMode = document.getElementById("playMode");
  ePlayMode.onchange = function(event){
    var enabled = event.target.checked;
    renderer.followMode = enabled;
    renderer.restrictCameraOrigin = enabled;
    renderer.showInvisibleSegments = !enabled;
    renderer.showInvisibleJoints = !enabled;
    renderer.showPlanes = !enabled;
    renderer.showGoals = !enabled;
    renderer.showVertices = !enabled;
    renderer.showSpawnPoints = !enabled;
  };
  var tbl = tb2.children.item(0), tbr = tb2.children.item(1);
  bFreeze = tbl.children.item(0);
  iSpeed = tbl.children.item(2);
  bStep = tbl.children.item(3);
  bStartGame = tbl.children.item(4);
  bPauseGame = tbl.children.item(5);
  bPauseGame.innerText = "\u275A \u275A";
  bSnapshots = tbr.children.item(0);
  bChangeStadium = tbr.children.item(1);
  bSaveStadium = tbr.children.item(2);
  bStartGame.innerText = "\u25b6";
  bStartGame.classList.add("green");
  bPauseGame.disabled = true;
  bStep.disabled = true;
  bSnapshots.onclick = function(){
    dlgSnapshots.setVisible(true, { minx: 700, miny: 450, x: 700, y: 450 });
    dlgSnapshots.setVisible(false);
    dlgSnapshots.setVisible(true, { minx: 700, miny: 450, x: 700, y: 450 });
  };
  bStartGame.onclick = function(){
    room.gameState ? room.stopGame(0) : room.startGame(0);
  };
  ctxMenu = document.getElementsByClassName("ctxmenu").item(0);
  bChangeStadium.onclick = function(event){
    showContextMenu(ctxMenu, event.pageX-3, event.pageY+3, "Pick Stadium", false);
    API.Utils.getDefaultStadiums().forEach((stadium)=>{
      addContextMenuItem(ctxMenu, stadium.name, true, ()=>{
        room.stopGame(0);
        room.setCurrentStadium(stadium, 0, console.warn);
        room.startGame(0);
      });
    });
    addContextMenuItem(ctxMenu, "Load from file...", true, ()=>{
      var inp = document.createElement("input");
      inp.type = "file";
      inp.accept = ".hbs";
      inp.onchange = function(){
        var f = inp.files;
        if (f.length==0)
          return;
        var fr = new FileReader();
        fr.onload = function () {
          var x = API.Utils.parseStadium(fr.result, console.warn);
          if (!x)
            return;
          room.stopGame(0);
          room.setCurrentStadium(x, 0, console.warn);
          room.startGame(0);
        };
        fr.readAsText(f.item(0));
      };
      inp.click();
    });
  };
  bPauseGame.onclick = function(){
    (room.gameState?.pauseGameTickCounter>0) ? room.setGamePaused(false, 0) : room.setGamePaused(true, 0);
  };
  bFreeze.onclick = function(){
    if (frozen)
      room.setSimulationSpeed(gameSpeed);
    else
      room.setSimulationSpeed(0);
    frozen = !frozen;
    updateGUI();
  };
  iSpeed.oninput = function(){
    var speed = parseFloat(iSpeed.value);
    if (isNaN(speed) || !isFinite(speed) || speed<=0 || speed>20)
      return;
    room.setSimulationSpeed(speed);
    gameSpeed = speed;
  };
  bStep.onclick = function(){
    room.runSteps(1);
  };
  bSaveStadium.onclick = function(){
    downloadFile("stadium.hbs", "text/plain", JSON.stringify(room.state.exportStadium(), null, 2));
  };
  var select = tb3.children.item(0), vertex = tb3.children.item(1), segment = tb3.children.item(2), goal = tb3.children.item(3), plane = tb3.children.item(4), disc = tb3.children.item(5), joint = tb3.children.item(6), spawnPoint = tb3.children.item(7), player = tb3.children.item(8);
  var add = tb3m.children.item(0), update = tb3m.children.item(1), remove = tb3m.children.item(2), showHide = tb3m.children.item(3);
  var tb3MenuValue = -1, tb3MenuSelected = -1;
  function updateTb3Menu(value){
    switch(value){
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        if (tb3MenuValue==value)
          tb3m.style.display = (tb3m.style.display=="none" ? "flex" : "none");
        else{
          tb3m.style.display = "flex";
          tb3m.style.marginTop = (value-3)*26+41;
        }
        break;
      default:
        tb3m.style.display = "none";
        break;
    }
    tb3MenuValue = value;
    tb3MenuSelected = (tb3m.style.display=="none") ? -1 : value;
    if (tb3m.style.display=="flex"){
      if (tb3MenuValue>=0){
        if (currentToolId==toolIndices[tb3MenuValue+1][0])
          add.classList.add("active");
        else
          add.classList.remove("active");
        if (currentToolId==toolIndices[tb3MenuValue+1][1])
          update.classList.add("active");
        else
          update.classList.remove("active");
        if (currentToolId==toolIndices[tb3MenuValue+1][2])
          remove.classList.add("active");
        else
          remove.classList.remove("active");
      }
      switch(tb3MenuValue){
        case 0:
          if (renderer.showVertices)
            showHide.classList.add("selected");
          else
            showHide.classList.remove("selected");
          break;
        case 1:
          if (renderer.showSegments)
            showHide.classList.add("selected");
          else
            showHide.classList.remove("selected");
          break;
        case 2:
          if (renderer.showGoals)
            showHide.classList.add("selected");
          else
            showHide.classList.remove("selected");
          break;
        case 3:
          if (renderer.showPlanes)
            showHide.classList.add("selected");
          else
            showHide.classList.remove("selected");
          break;
        case 4:
          if (renderer.showDiscs)
            showHide.classList.add("selected");
          else
            showHide.classList.remove("selected");
          break;
        case 5:
          if (renderer.showJoints)
            showHide.classList.add("selected");
          else
            showHide.classList.remove("selected");
          break;
        case 6:
          if (renderer.showSpawnPoints)
            showHide.classList.add("selected");
          else
            showHide.classList.remove("selected");
          break;
        case 7:
          if (renderer.showPlayers)
            showHide.classList.add("selected");
          else
            showHide.classList.remove("selected");
          break;
      }
    }
  }
  toolsMenuElements = [select, vertex, segment, goal, plane, disc, joint, spawnPoint, player];
  function unselectTb3Element(){
    if (tb3MenuSelected<0)
      return;
    toolsMenuElements[tb3MenuSelected+1].classList.remove("selected");
  }
  function selectTb3Element(){
    if (tb3MenuSelected<0)
      return;
    toolsMenuElements[tb3MenuSelected+1].classList.add("selected");
  }
  select.onclick = function(){
    unselectTb3Element();
    setCurrentTool(tools[toolIndices[0][0]]);
    updateTb3Menu(-1);
  };
  vertex.onclick = function(){
    unselectTb3Element();
    updateTb3Menu(0);
    selectTb3Element();
  };
  segment.onclick = function(){
    unselectTb3Element();
    updateTb3Menu(1);
    selectTb3Element();
  };
  goal.onclick = function(){
    unselectTb3Element();
    updateTb3Menu(2);
    selectTb3Element();
  };
  plane.onclick = function(){
    unselectTb3Element();
    updateTb3Menu(3);
    selectTb3Element();
  };
  disc.onclick = function(){
    unselectTb3Element();
    updateTb3Menu(4);
    selectTb3Element();
  };
  joint.onclick = function(){
    unselectTb3Element();
    updateTb3Menu(5);
    selectTb3Element();
  };
  spawnPoint.onclick = function(){
    unselectTb3Element();
    updateTb3Menu(6);
    selectTb3Element();
  };
  player.onclick = function(){
    unselectTb3Element();
    updateTb3Menu(7);
    selectTb3Element();
  };
  add.onclick = function(){
    setCurrentTool(tools[toolIndices[tb3MenuValue+1][0]]);
    updateTb3Menu(-1);
  };
  update.onclick = function(){
    setCurrentTool(tools[toolIndices[tb3MenuValue+1][1]]);
    updateTb3Menu(-1);
  };
  remove.onclick = function(){
    setCurrentTool(tools[toolIndices[tb3MenuValue+1][2]]);
    updateTb3Menu(-1);
  };
  showHide.onclick = function(){
    var value;
    switch(tb3MenuValue){
      case 0:
        value = renderer.showVertices = !renderer.showVertices;
        break;
      case 1:
        value = renderer.showSegments = !renderer.showSegments;
        break;
      case 2:
        value = renderer.showGoals = !renderer.showGoals;
        break;
      case 3:
        value = renderer.showPlanes = !renderer.showPlanes;
        break;
      case 4:
        value = renderer.showDiscs = !renderer.showDiscs;
        break;
      case 5:
        value = renderer.showJoints = !renderer.showJoints;
        break;
      case 6:
        value = renderer.showSpawnPoints = !renderer.showSpawnPoints;
        break;
      case 7:
        value = renderer.showPlayers = !renderer.showPlayers;
        break;
    }
    if (value)
      showHide.classList.add("selected");
    else
      showHide.classList.remove("selected");
  };
}

function initGameMenu(){
  var elem = document.getElementsByClassName("gameMenu").item(0);
  menu = makeDialog("Game Menu");
  var contents = menu.getContentsElement();
  contents.innerHTML = elem.innerHTML;
  elem.remove();
  elem = contents;
  document.body.appendChild(menu.element);
  var teamsDiv = elem.children.item(0);
  var redTeam = teamsDiv.children.item(0);
  redTeam.children.item(0).onclick = function(){
    if (selectedPlayerId==null)
      return;
    room.setPlayerTeam(selectedPlayerId, 1, 0);
  };
  redTeam = redTeam.children.item(1);
  var specTeam = teamsDiv.children.item(1);
  specTeam.children.item(0).onclick = function(){
    if (selectedPlayerId==null)
      return;
    room.setPlayerTeam(selectedPlayerId, 0, 0);
  };
  specTeam = specTeam.children.item(1);
  var blueTeam = teamsDiv.children.item(2);
  blueTeam.children.item(0).onclick = function(){
    if (selectedPlayerId==null)
      return;
    room.setPlayerTeam(selectedPlayerId, 2, 0);
  };
  blueTeam = blueTeam.children.item(1);
  var selectedPlayerElement, selectedPlayerId, playerNameInput, playerAvatarInput;
  menu.update = function(){
    redTeam.innerHTML = "";
    specTeam.innerHTML = "";
    blueTeam.innerHTML = "";
    room.state.players.forEach((playerObj)=>{
      var name = "["+playerObj.id+"] "+playerObj.name;
      var ePlayer = document.createElement("div");
      ePlayer.classList.add("playerElement");
      if (selectedPlayerId==playerObj.id){
        selectedPlayerElement = ePlayer;
        selectedPlayerElement.classList.add("selected");
      }
      ePlayer.innerText = name;
      ePlayer.object = playerObj;
      ePlayer.onclick = function(event){
        var t = event.target;
        if (!t.object)
          t = t.parentElement;
        if (selectedPlayerElement)
          selectedPlayerElement.classList.remove("selected");
        selectedPlayerElement = t;
        selectedPlayerElement.classList.add("selected");
        selectedPlayerId = selectedPlayerElement.object.id;
      };
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
  };
  var playerButtonsDiv = elem.children.item(1);
  playerNameInput = playerButtonsDiv.children.item(0).children.item(0);
  playerAvatarInput = playerButtonsDiv.children.item(1).children.item(0);
  playerButtonsDiv.children.item(2).onclick = function(){
    room.playerJoin(playerIdCounter++, playerNameInput.value, "tr", playerAvatarInput.value, "fakeConn", "fakeAuth");
  };
  playerButtonsDiv.children.item(3).onclick = function(){
    if (!selectedPlayerElement || selectedPlayerElement.object.id==0)
      return;
    room.playerLeave(selectedPlayerElement.object.id);
    selectedPlayerElement = null;
    selectedPlayerId = null;
  };
}

function initSnapshots(){
  var elem = document.getElementsByClassName("snapshots").item(0);
  dlgSnapshots = makeDialog("Snapshots");
  var contents = dlgSnapshots.getContentsElement();
  contents.innerHTML = elem.innerHTML;
  elem.remove();
  elem = contents;
  document.body.appendChild(dlgSnapshots.element);
  var buttons = elem.children.item(0), bCreate = buttons.children.item(0), bLoad = buttons.children.item(1), bDestroy = buttons.children.item(2);
  var tblBody = elem.children.item(1).children.item(0).children.item(1), selectedRow = null;
  function makeSnapshotTableRow(data){
    var row = document.createElement("tr");
    var cell = document.createElement("td");
    cell.className = "firstColumn";
    cell.innerText = ""+data.id;
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = "secondColumn";
    cell.innerText = data.name;
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = "thirdColumn";
    var img = document.createElement("img");
    img.width = 450;
    img.src = data.image;
    cell.appendChild(img);
    row.appendChild(cell);
    tblBody.appendChild(row);
    row.onclick = function(){
      if (selectedRow!=null)
        selectedRow.classList.remove("selected");
      selectedRow = row;
      selectedRow.classList.add("selected");
      bLoad.disabled = false;
      bDestroy.disabled = false;
    };
  }
  function refresh(){
    tblBody.innerHTML = "";
    snapshotArray.forEach(makeSnapshotTableRow);
  }
  bCreate.onclick = function(){
    snapshotArray.push({
      id: snapshotIdCounter++,
      playMode: ePlayMode.checked,
      roomState: room.takeSnapshot(),
      renderState: renderer.getState(),
      name: new Date().toLocaleString(),
      image: canvas.toDataURL()
    });
    selectedRow?.classList.remove("selected");
    selectedRow = null;
    refresh();
  };
  bLoad.onclick = function(){
    var id = parseInt(selectedRow.children.item(0).innerText);
    var idx = snapshotArray.findIndex((x)=>x.id==id);
    if (idx<0)
      return;
    selectedRow.classList.remove("selected");
    selectedRow = null;
    bLoad.disabled = true;
    bDestroy.disabled = true;
    var snapshot = snapshotArray[idx];
    room.useSnapshot(snapshot.roomState);
    ePlayMode.checked = snapshot.playMode;
    renderer.setState(snapshot.renderState);
    setControlledPlayerId(renderer.followPlayerId);
    updateGUI();
  };
  bDestroy.onclick = function(){
    var id = parseInt(selectedRow.children.item(0).innerText);
    var idx = snapshotArray.findIndex((x)=>x.id==id);
    if (idx<0)
      return;
    snapshotArray.splice(idx, 1);
    selectedRow.classList.remove("selected");
    selectedRow = null;
    bLoad.disabled = true;
    bDestroy.disabled = true;
    refresh();
  };
  bLoad.disabled = true;
  bDestroy.disabled = true;
}

function Tool(name){
  this._id = null;
  this._name = name;
  this.elem = null;
}

Tool.prototype = {
  initialize: function(){},
  finalize: function(){},
  onKeyDown: function(event){},
  onKeyUp: function(event){},
  onMouseDown: function(event){},
  onMouseUp: function(event){},
  onMouseMove: function(event){},
  onWheel: function(event){}
};

function setCurrentTool(tool){
  if (currentTool==tool)
    return;
  if (currentTool)
    currentTool.finalize&&currentTool.finalize();
  currentTool?.menuElement?.classList.remove("selected");
  currentTool?.menuElement?.classList.remove("active");
  currentToolId = tool._id;
  eStatusMessage.innerText = "";
  currentTool = tool;
  currentTool.menuElement.classList.add("active");
  currentTool.initialize&&currentTool.initialize();
  toolSelect.selectedIndex = currentToolId;
}

function addTool(tool){
  var e = document.createElement("option");
  e.innerText = tool._name;
  toolSelect.appendChild(e);
  tool._id = tools.length;
  tool.elem = e;
  tools.push(tool);
}

function ZoomPanTool(customName, controlPlayer = true){
  Object.setPrototypeOf(this, Tool);
  Tool.apply(this, [customName || "ZoomPan"]);

  const { Query } = API;

  this.isMousePressing = false;
  this.isDragging = false;
  this.pressedCoord = null;
  this.pressedOrigin = null;
  this.movedMapCoord = null;
  this.discIndexAtCoord = null;
  this.highlightedObj = null;
  var thisTool = this;

  this.initialize = function(){
    thisTool.isDragging = false;
    thisTool.isMousePressing = false;
    thisTool.pressedCoord = null;
    thisTool.pressedOrigin = null;
    thisTool.discIndexAtCoord = null;
    thisTool.highlightedObj = null;
    renderer?.setSelectedObject(null);
  };

  this.finalize = function(){
    thisTool.isDragging = false;
    thisTool.isMousePressing = false;
    thisTool.pressedCoord = null;
    thisTool.pressedOrigin = null;
    thisTool.discIndexAtCoord = null;
    thisTool.highlightedObj = null;
    renderer?.setSelectedObject(null);
  };

  this.onMouseDown = function(event){
    thisTool.isMousePressing = true;
    thisTool.isDragging = false;
    thisTool.pressedCoord = {x: event.offsetX, y: event.offsetY};
    thisTool.pressedOrigin = renderer.getOrigin();
  };

  this.onMouseUp = function(event){
    if (controlPlayer && event.button==2 && !thisTool.isDragging){
      var pId = Query.getDiscAtMapCoord(room.state, thisTool.movedMapCoord)?.playerId;
      setControlledPlayerId(pId==null ? -1 : pId);
    }
    thisTool.isDragging = false;
    thisTool.isMousePressing = false;
    thisTool.pressedCoord = null;
    thisTool.pressedOrigin = null;
  };
  
  this.onMouseMove = function(event){
    thisTool.movedMapCoord = renderer.transformPixelCoordToMapCoord(event.offsetX, event.offsetY);
    eStatusCoords.innerText = thisTool.movedMapCoord.x.toFixed(10) + ", " + thisTool.movedMapCoord.y.toFixed(10);
    if (!thisTool.isMousePressing){
      thisTool.discIndexAtCoord = Query.getDiscIndexAtMapCoord(room.state, thisTool.movedMapCoord);
      if (controlPlayer){
        var discAtCoord = room.gameState?.physicsState.discs[thisTool.discIndexAtCoord];
        if (discAtCoord?.playerId!=null){
          thisTool.highlightedObj = discAtCoord;
          canvas.title = "Right click to control this player";
        }
        else{
          thisTool.highlightedObj = null;
          canvas.title = "";
        }
      }
      return;
    }
    canvas.title = "";
    thisTool.discIndexAtCoord = null;
    thisTool.highlightedObj = null;
    thisTool.isDragging = true;
    if (event.buttons==2){
      renderer.setOrigin({
        x: thisTool.pressedOrigin.x-renderer.transformPixelDistanceToMapDistance(event.offsetX-thisTool.pressedCoord.x), 
        y: thisTool.pressedOrigin.y-renderer.transformPixelDistanceToMapDistance(event.offsetY-thisTool.pressedCoord.y)
      });
    }
    thisTool.pressedCoord = {x: event.offsetX, y: event.offsetY};
  };

  this.onWheel = function(event){
    renderer.onWheel(event);
  };

  this.onKeyDown = function(event){
    if (!controlPlayer)
      return;
    switch (event.keyCode) {
      case 27:{
        menu.setVisible(!menu.isVisible());
        event.preventDefault();
        break;
      }
      case 80:{
        (room.gameState?.pauseGameTickCounter>0) ? room.setGamePaused(false, 0) : room.setGamePaused(true, 0);
        event.preventDefault();
        break;
      }
      default:
        keyHandler.pressKey(event.code);
    }
  };

  this.onKeyUp = function(event){
    if (!controlPlayer)
      return;
    keyHandler.releaseKey(event.code);
  };

  this.onRequestAnimationFrame = function(ctx){
    if (!thisTool.highlightedObj)
      return;
    var center = thisTool.highlightedObj.pos, radius = thisTool.highlightedObj.radius, origin = renderer.getOrigin(), zoomCoeff = renderer.getActualZoomCoefficient();
    ctx.save();
    ctx.scale(zoomCoeff, zoomCoeff);
    ctx.translate(-origin.x, -origin.y);
    ctx.lineWidth = 7;
    ctx.strokeStyle = "#ffff00";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    if (renderer.squarePlayers)
      ctx.rect(center.x-radius, center.y-radius, 2*radius, 2*radius);
    else
      ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
    ctx.stroke();
    ctx.restore();
  };
}

function SelectTool(){
  ZoomPanTool.apply(this, ["Select", true]);
  var thisTool = this;
  const { Query } = API;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;

  this.initialize = function(){
    zoomPan_initialize();
  }

  this.finalize = function(){
    zoomPan_finalize();
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging || event.button!=0 || !room.gameState)
      return;
    var { physicsState } = room.gameState;
    var pos = renderer.transformPixelCoordToMapCoord(event.offsetX, event.offsetY);
    var threshold = renderer.transformPixelDistanceToMapDistance(5);
    for (var [queryFunc, arr, objType] of [
      [Query.getDiscIndexAtMapCoord, physicsState.discs, "disc"], 
      [Query.getVertexIndexAtMapCoord, physicsState.vertices, "vertex"], 
      [Query.getSegmentIndexAtMapCoord, physicsState.segments, "segment"], 
      [Query.getGoalIndexAtMapCoord, room.state.stadium.goals, "goal"], 
      [Query.getPlaneIndexAtMapCoord, physicsState.planes, "plane"], 
      [Query.getJointIndexAtMapCoord, physicsState.joints, "joint"]
    ]){
      var selectedObjIdx = queryFunc(room.state, pos, threshold);
      if (selectedObjIdx>=0){
        renderer.setSelectedObject(arr[selectedObjIdx]);
        eStatusMessage.innerText = "Selected " + objType + " id = " + selectedObjIdx;
        return;
      }
    }
    renderer.setSelectedObject(null);
    eStatusMessage.innerText = "";
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
  };
}

const CustomEventType = {
  AddVertex: 0,
  AddSegment: 1,
  AddGoal: 2,
  AddPlane: 3,
  AddDisc: 4,
  AddJoint: 5,
  AddSpawnPoint: 6,
  AddPlayer: 7,
  UpdateVertex: 8,
  UpdateSegment: 9,
  UpdateGoal: 10,
  UpdatePlane: 11,
  UpdateDisc: 12,
  UpdateJoint: 13,
  UpdateSpawnPoint: 14,
  UpdatePlayer: 15,
  RemoveVertex: 16,
  RemoveSegment: 17,
  RemoveGoal: 18,
  RemovePlane: 19,
  RemoveDisc: 20,
  RemoveJoint: 21,
  RemoveSpawnPoint: 22,
  RemovePlayer: 23,
  UpdatePlayerPhysics: 24,
  UpdateBg: 25,
  UpdateGeneral: 26
};

function AddVertexTool(){
  ZoomPanTool.apply(this, ["AddVertex", true]);
  var thisTool = this;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  var { xRow, yRow, bCoefRow, cMaskRow, cGroupRow } = dialogContents.addVertex;

  this.initialize = function(){
    zoomPan_initialize();
    var contents = toolDialog.getContentsElement();
    toolDialog.setTitle("Add Vertex");
    contents.innerHTML = "";
    contents.appendChild(dialogContents.addVertex);
    toolDialog.setVisible(true, { y: 165 });
    eStatusMessage.innerText = "Select point...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    toolDialog.setVisible(false);
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging || event.button!=0)
      return;
    var pos = renderer.transformPixelCoordToMapCoord(event.offsetX, event.offsetY);
    room.sendCustomEvent(CustomEventType.AddVertex, {
      x: pos.x, // xRow.getValue(), 
      y: pos.y, // yRow.getValue(), 
      bCoef: bCoefRow.getValue(),
      cMask: cMaskRow.getValue(),
      cGroup: cGroupRow.getValue()
    }, 0);
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (!thisTool.movedMapCoord)
      return;
    xRow.setValue(thisTool.movedMapCoord.x);
    yRow.setValue(thisTool.movedMapCoord.y);
    var p = renderer.transformMapCoordToPixelCoord(thisTool.movedMapCoord.x, thisTool.movedMapCoord.y, false);
    renderer.drawVertex(room.state.createVertex({
      x: p.x,
      y: p.y,
      bCoef: bCoefRow.getValue(),
      cMask: cMaskRow.getValue(),
      cGroup: cGroupRow.getValue()
    }));
  };
}

function AddSegmentTool(){
  ZoomPanTool.apply(this, ["AddSegment", true]);
  const { Query } = API;
  var thisTool = this;
  var vertexIndex = -1, vertexAtCoord = null, vertexIndexAtCoord = null;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  var { v0Row, v1Row, curveRow, colorRow, biasRow, visRow, bCoefRow, cMaskRow, cGroupRow } = dialogContents.addSegment;

  this.initialize = function(){
    vertexAtCoord = null;
    vertexIndexAtCoord = null;
    zoomPan_initialize();
    var contents = toolDialog.getContentsElement();
    toolDialog.setTitle("Add Segment");
    contents.innerHTML = "";
    contents.appendChild(dialogContents.addSegment);
    toolDialog.setVisible(true, { y: 267 });
    eStatusMessage.innerText = "Select first vertex...";
  }

  this.finalize = function(){
    vertexAtCoord = null;
    vertexIndexAtCoord = null;
    zoomPan_finalize();
    toolDialog.setVisible(false);
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    if (!thisTool.isMousePressing){
      var threshold = renderer.transformPixelDistanceToMapDistance(5);
      vertexIndexAtCoord = Query.getVertexIndexAtMapCoord(room.state, thisTool.movedMapCoord, threshold);
      vertexAtCoord = room.gameState.physicsState.vertices[vertexIndexAtCoord];
    }
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging || event.button!=0)
      return;
    var pos = renderer.transformPixelCoordToMapCoord(event.offsetX, event.offsetY);
    var threshold = renderer.transformPixelDistanceToMapDistance(5);
    var selectedVertexIndex = Query.getVertexIndexAtMapCoord(room.state, pos, threshold);
    if (selectedVertexIndex<0 || selectedVertexIndex==vertexIndex)
      return;
    if (vertexIndex<0){
      vertexIndex = selectedVertexIndex;
      renderer.setSelectedObject(room.gameState.physicsState.vertices[vertexIndex]);
      v0Row.setValue(vertexIndex);
      eStatusMessage.innerText = "Select second vertex...";
      return;
    }
    room.sendCustomEvent(CustomEventType.AddSegment, {
      v0: selectedVertexIndex,
      v1: vertexIndex,
      curve: curveRow.getValue(), 
      color: colorRow.getValue(), 
      bias: biasRow.getValue(), 
      vis: visRow.getValue(), 
      bCoef: bCoefRow.getValue(), 
      cMask: cMaskRow.getValue(), 
      cGroup: cGroupRow.getValue()
      //curveF: , 
    }, 0);
    vertexIndex=-1;
    v0Row.setValue("");
    v1Row.setValue("");
    eStatusMessage.innerText = "Select first vertex...";
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (!thisTool.movedMapCoord)
      return;
    var origin = renderer.getOrigin(), zoomCoeff = renderer.getActualZoomCoefficient();
    ctx.save();
    ctx.resetTransform();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(zoomCoeff, zoomCoeff);
    ctx.translate(-origin.x, -origin.y);
    if (vertexAtCoord){
      if (vertexIndex<0)
        v0Row.setValue(vertexIndexAtCoord);
      else
        v1Row.setValue(vertexIndexAtCoord);
      renderer.drawVertex(vertexAtCoord);
    }
    else{
      if (vertexIndex<0)
        v0Row.setValue("");
      else
        v1Row.setValue("");
    }
    if (vertexIndex<0){
      ctx.restore();
      return;
    }
    renderer.drawSegment(room.state.createSegmentFromObj({
      v0: room.state.createVertex(thisTool.movedMapCoord),
      v1: room.gameState.physicsState.vertices[vertexIndex],
      curve: curveRow.getValue(), 
      color: colorRow.getValue(), 
      bias: biasRow.getValue(), 
      vis: visRow.getValue(), 
      bCoef: bCoefRow.getValue(), 
      cMask: cMaskRow.getValue(), 
      cGroup: cGroupRow.getValue()
      //curveF: , 
    }));
    ctx.restore();
  };
}

function AddGoalTool(){
  ZoomPanTool.apply(this, ["AddGoal", true]);
  var thisTool = this;
  var oldPos = null;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  var { p0Row, p1Row, teamRow } = dialogContents.addGoal;

  this.initialize = function(){
    zoomPan_initialize();
    var contents = toolDialog.getContentsElement();
    toolDialog.setTitle("Add Goal");
    contents.innerHTML = "";
    contents.appendChild(dialogContents.addGoal);
    toolDialog.setVisible(true, { y: 111 });
    eStatusMessage.innerText = "Select first point...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    toolDialog.setVisible(false);
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    if (!oldPos)
      p0Row.setValue("["+thisTool.movedMapCoord.x+", "+thisTool.movedMapCoord.y+"]");
    else
      p1Row.setValue("["+thisTool.movedMapCoord.x+", "+thisTool.movedMapCoord.y+"]");
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging || event.button!=0)
      return;
    var pos = renderer.transformPixelCoordToMapCoord(event.offsetX, event.offsetY);
    if (!oldPos){
      oldPos = pos;
      p0Row.setValue("["+oldPos.x+", "+oldPos.y+"]");
      eStatusMessage.innerText = "Select second point...";
      return;
    }
    var p0 = p0Row.getValue(), p1 = p1Row.getValue();
    if (!p0 || !p1)
      return;
    room.sendCustomEvent(CustomEventType.AddGoal, {
      p0: p0,
      p1: p1,
      team: teamRow.getValue()
    }, 0);
    oldPos = null;
    p0Row.setValue("");
    p1Row.setValue("");
    eStatusMessage.innerText = "Select first point...";
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (!thisTool.movedMapCoord || !oldPos)
      return;
    var _p0 = p0Row.getValue(), _p1 = p1Row.getValue();
    if (_p0?.length!=2 || _p1?.length!=2)
      return;
    ctx.save();
    ctx.resetTransform();
    var p0 = renderer.transformMapCoordToPixelCoord(_p0[0], _p0[1], true);
    var p1 = renderer.transformMapCoordToPixelCoord(_p1[0], _p1[1], true);
    renderer.drawGoal(room.state.createGoal({
      p0: [p0.x, p0.y],
      p1: [p1.x, p1.y],
      team: teamRow.getValue()
    }));
    ctx.restore();
  };
}

function AddPlaneTool(){
  ZoomPanTool.apply(this, ["AddPlane", true]);
  var thisTool = this;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  var { normalRow, distRow, bCoefRow, cMaskRow, cGroupRow } = dialogContents.addPlane;

  this.initialize = function(){
    zoomPan_initialize();
    var contents = toolDialog.getContentsElement();
    toolDialog.setTitle("Add Plane");
    contents.innerHTML = "";
    contents.appendChild(dialogContents.addPlane);
    toolDialog.setVisible(true, { y: 165 });
    eStatusMessage.innerText = "Select point...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    toolDialog.setVisible(false);
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    var pos = thisTool.movedMapCoord;
    if (!pos)
      return;
    var d = pos.x*pos.x+pos.y*pos.y;
    if (d==0)
      return;
    normalRow.setValue("["+pos.x+", "+pos.y+"]");
    distRow.setValue(Math.sqrt(d));
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging || event.button!=0)
      return;
    var normal = normalRow.getValue(), dist = distRow.getValue();
    if (normal?.length!=2 || !dist)
      return;
    room.sendCustomEvent(CustomEventType.AddPlane, {
      normal: normal,
      dist: dist,
      bCoef: bCoefRow.getValue(), 
      cMask: cMaskRow.getValue(), 
      cGroup: cGroupRow.getValue()
    }, 0);
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    var normal = normalRow.getValue(), dist = distRow.getValue();
    var origin = renderer.getOrigin(), zoomCoeff = renderer.getActualZoomCoefficient();
    if (!normal || !dist)
      return;
    ctx.save();
    ctx.resetTransform();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(zoomCoeff, zoomCoeff);
    ctx.translate(-origin.x, -origin.y);
    renderer.drawPlane(room.state.createPlane({
      normal: normal,
      dist: dist,
      bCoef: bCoefRow.getValue(), 
      cMask: cMaskRow.getValue(), 
      cGroup: cGroupRow.getValue()
    }));
    ctx.restore();
  };
}

function AddDiscTool(){
  ZoomPanTool.apply(this, ["AddDisc", true]);
  var thisTool = this;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  var { posRow, radiusRow, speedRow, gravityRow, invMassRow, dampingRow, colorRow, bCoefRow, cMaskRow, cGroupRow } = dialogContents.addDisc;

  this.initialize = function(){
    zoomPan_initialize();
    var contents = toolDialog.getContentsElement();
    toolDialog.setTitle("Add Disc");
    contents.innerHTML = "";
    contents.appendChild(dialogContents.addDisc);
    toolDialog.setVisible(true, { y: 295 });
    eStatusMessage.innerText = "Select point...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    toolDialog.setVisible(false);
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    var pos = thisTool.movedMapCoord;
    if (!pos)
      return;
    posRow.setValue("["+pos.x+", "+pos.y+"]");
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging || event.button!=0)
      return;
    var pos = posRow.getValue(), speed = speedRow.getValue(), gravity = gravityRow.getValue(), r = radiusRow.getValue();
    if (pos?.length!=2 || speed?.length!=2 || gravity?.length!=2 || r==null)
      return;
    //var pos = renderer.transformPixelCoordToMapCoord(event.offsetX, event.offsetY);
    room.sendCustomEvent(CustomEventType.AddDisc, {
      pos: pos,
      radius: r,
      speed: speed, 
      gravity: gravity,
      invMass: invMassRow.getValue(),
      damping: dampingRow.getValue(), 
      color: colorRow.getValue(), 
      bCoef: bCoefRow.getValue(), 
      cMask: cMaskRow.getValue(), 
      cGroup: cGroupRow.getValue()
    }, 0);
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    var pos = posRow.getValue(), speed = speedRow.getValue(), gravity = gravityRow.getValue(), r = radiusRow.getValue();
    if (pos?.length!=2 || speed?.length!=2 || gravity?.length!=2 || r==null)
      return;
    var pos = renderer.transformMapCoordToPixelCoord(pos[0], pos[1], false);
    renderer.drawDisc(room.state.createDisc({
      pos: [pos.x, pos.y],
      radius: renderer.transformMapDistanceToPixelDistance(r),
      speed: speed, 
      gravity: gravity,
      invMass: invMassRow.getValue(),
      damping: dampingRow.getValue(), 
      color: colorRow.getValue(), 
      bCoef: bCoefRow.getValue(), 
      cMask: cMaskRow.getValue(), 
      cGroup: cGroupRow.getValue()
    }));
  };
}

function AddJointTool(){
  ZoomPanTool.apply(this, ["AddJoint", true]);
  var thisTool = this;
  var discIndex = -1, highlightedObj2 = null;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  var { d0Row, d1Row, strengthRow, lengthRow, colorRow } = dialogContents.addJoint;

  this.initialize = function(){
    zoomPan_initialize();
    var contents = toolDialog.getContentsElement();
    toolDialog.setTitle("Add Joint");
    contents.innerHTML = "";
    contents.appendChild(dialogContents.addJoint);
    toolDialog.setVisible(true, { y: 165 });
    highlightedObj2 = null;
    eStatusMessage.innerText = "Select first disc...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    toolDialog.setVisible(false);
    highlightedObj2 = null;
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    var currentDiscIndex = thisTool.discIndexAtCoord;
    var discAtCoord = room.gameState?.physicsState.discs[currentDiscIndex];
    highlightedObj2 = discAtCoord;
    if (!discAtCoord){
      if (discIndex<0)
        d0Row.setValue("");
      else
        d1Row.setValue("");
      return;
    }
    if (discIndex<0)
      d0Row.setValue(currentDiscIndex);
    else
      d1Row.setValue(currentDiscIndex);
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging || event.button!=0)
      return;
    if (discIndex<0){
      if (thisTool.discIndexAtCoord<0)
        return;
      discIndex=thisTool.discIndexAtCoord;
      renderer.setSelectedObject(room.gameState.physicsState.discs[discIndex]);
      eStatusMessage.innerText = "Select second disc...";
      return;
    }
    var d0 = d0Row.getValue(), d1 = d1Row.getValue(), str = strengthRow.getValue(), len = lengthRow.getValue();
    if (d0==null || d1==null || isNaN(str) || len?.length!=2)
      return;
    room.sendCustomEvent(CustomEventType.AddJoint, {
      d0: d0,
      d1: d1,
      strength: str, 
      length: len,
      color: colorRow.getValue()
    }, 0);
    discIndex=-1;
    d0Row.setValue("");
    d1Row.setValue("");
    eStatusMessage.innerText = "Select first disc...";
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (!thisTool.movedMapCoord)
      return;
    if (highlightedObj2){
      var center = highlightedObj2.pos, radius = highlightedObj2.radius, origin = renderer.getOrigin(), zoomCoeff = renderer.getActualZoomCoefficient();
      ctx.save();
      ctx.scale(zoomCoeff, zoomCoeff);
      ctx.translate(-origin.x, -origin.y);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#bbbb66";
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
      ctx.stroke();
      ctx.restore();
    }
    if (discIndex<0)
      return;
    var str = strengthRow.getValue(), len = lengthRow.getValue();
    var a = room.gameState?.physicsState.discs[d0Row.getValue()]?.pos;
    if (a==null || isNaN(str) || len?.length!=2)
      return;
    ctx.save();
    ctx.resetTransform();
    a = renderer.transformMapCoordToPixelCoord(a.x, a.y, true);
    var p = renderer.transformMapCoordToPixelCoord(thisTool.movedMapCoord.x, thisTool.movedMapCoord.y, true);
    renderer.drawJoint(room.state.createJointFromObj({
      d0: room.state.createDisc({"pos": [a.x, a.y]}),
      d1: room.state.createDisc({"pos": [p.x, p.y]}),
      strength: str, 
      length: len,
      color: colorRow.getValue()
    }));
    ctx.restore();
  };
}

function AddSpawnPointTool(){
  ZoomPanTool.apply(this, ["AddSpawnPoint", true]);
  var thisTool = this;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  var { xRow, yRow, teamRow } = dialogContents.addSpawnPoint;

  this.initialize = function(){
    zoomPan_initialize();
    var contents = toolDialog.getContentsElement();
    toolDialog.setTitle("Add Spawn Point");
    contents.innerHTML = "";
    contents.appendChild(dialogContents.addSpawnPoint);
    toolDialog.setVisible(true, { y: 111 });
    eStatusMessage.innerText = "Select point...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    toolDialog.setVisible(false);
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging || event.button!=0)
      return;
    var pos = renderer.transformPixelCoordToMapCoord(event.offsetX, event.offsetY);
    room.sendCustomEvent(CustomEventType.AddSpawnPoint, {
      x: pos.x, // xRow.getValue(), 
      y: pos.y, // yRow.getValue(), 
      team: teamRow.getValue()
    }, 0);
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (!thisTool.movedMapCoord)
      return;
    xRow.setValue(thisTool.movedMapCoord.x);
    yRow.setValue(thisTool.movedMapCoord.y);
    var p = renderer.transformMapCoordToPixelCoord(thisTool.movedMapCoord.x, thisTool.movedMapCoord.y, false);
    renderer.drawSpawnPoint(p, teamRow.getValue()=="red"?1:2, room.gameState?.stadium.playerPhysics.radius);
  };
}

function AddPlayerTool(){
  ZoomPanTool.apply(this, ["AddPlayer", true]);
  var thisTool = this;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  var { posRow, radiusRow, speedRow, gravityRow, invMassRow, dampingRow, bCoefRow, cMaskRow, cGroupRow, nameRow, avatarRow, flagRow, teamRow } = dialogContents.addPlayer;

  this.initialize = function(){
    zoomPan_initialize();
    var contents = toolDialog.getContentsElement();
    toolDialog.setTitle("Add Player");
    contents.innerHTML = "";
    contents.appendChild(dialogContents.addPlayer);
    flagRow.hidePopup();
    toolDialog.setVisible(true, { y: 370 });
    toolDialog.onClose = function(){
      flagRow.hidePopup();
    }
    eStatusMessage.innerText = "Select point...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    flagRow.hidePopup();
    toolDialog.setVisible(false);
    toolDialog.onClose = null;
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    var pos = thisTool.movedMapCoord;
    if (!pos)
      return;
    posRow.setValue("["+pos.x+", "+pos.y+"]");
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging || event.button!=0)
      return;
    var pos = posRow.getValue(), speed = speedRow.getValue(), gravity = gravityRow.getValue(), r = radiusRow.getValue();
    if (pos?.length!=2 || speed?.length!=2 || gravity?.length!=2 || r==null)
      return;
    room.sendCustomEvent(CustomEventType.AddPlayer, {
      id: playerIdCounter++,
      pos: pos,
      radius: r,
      speed: speed, 
      gravity: gravity,
      invMass: invMassRow.getValue(),
      damping: dampingRow.getValue(), 
      bCoef: bCoefRow.getValue(), 
      cMask: cMaskRow.getValue(), 
      cGroup: cGroupRow.getValue(),
      name: nameRow.getValue(), 
      avatar: avatarRow.getValue(), 
      flag: flagRow.getValue(), 
      team: teamRow.getValue()
    }, 0);
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    var pos = posRow.getValue(), speed = speedRow.getValue(), gravity = gravityRow.getValue(), r = radiusRow.getValue(), team = teamRow.getValue();
    if (pos?.length!=2 || speed?.length!=2 || gravity?.length!=2 || r==null || (team!="red" && team!="blue" && team!="spec"))
      return;
    var pos = renderer.transformMapCoordToPixelCoord(pos[0], pos[1], false);
    renderer.drawDisc(room.state.createDisc({
      pos: [pos.x, pos.y],
      radius: renderer.transformMapDistanceToPixelDistance(r),
      speed: speed, 
      gravity: gravity,
      invMass: invMassRow.getValue(),
      damping: dampingRow.getValue(), 
      color: (team=="red") ? 14780791 : ((team=="blue") ? 8760563 : 0), 
      bCoef: bCoefRow.getValue(), 
      cMask: cMaskRow.getValue(), 
      cGroup: cGroupRow.getValue()
    }));
  };
}

function UpdateVertexTool(){
  ZoomPanTool.apply(this, ["UpdateVertex", true]);
  var thisTool = this;
  var selectedVertexIndex = -1, highlightedVertexIndex = -1, highlightedVertexObj = null;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  var { xRow, yRow, bCoefRow, cMaskRow, cGroupRow } = dialogContents.addVertex;
  const { Query } = API;
  function resetGUICallbacks(){
    xRow.onValueChanged = null;
    xRow.onFocusChanged = null;
    yRow.onValueChanged = null;
    yRow.onFocusChanged = null;
    bCoefRow.onValueChanged = null;
    bCoefRow.onFocusChanged = null;
    cMaskRow.onValueChanged = null;
    cMaskRow.onFocusChanged = null;
    cGroupRow.onValueChanged = null;
    cGroupRow.onFocusChanged = null;
  }
  function setGUICallbacks(){
    xRow.onValueChanged = valueChanged;
    yRow.onValueChanged = valueChanged;
    bCoefRow.onValueChanged = valueChanged;
    cMaskRow.onValueChanged = valueChanged;
    cGroupRow.onValueChanged = valueChanged;
  }
  function valueChanged(){
    room.sendCustomEvent(CustomEventType.UpdateVertex, {
      idx: selectedVertexIndex,
      data: {
        x: xRow.getValue(), 
        y: yRow.getValue(), 
        bCoef: bCoefRow.getValue(),
        cMask: cMaskRow.getValue(),
        cGroup: cGroupRow.getValue()
      }
    }, 0);
  }
  
  this.initialize = function(){
    zoomPan_initialize();
    var contents = toolDialog.getContentsElement();
    toolDialog.setTitle("Update Vertex");
    contents.innerHTML = "";
    contents.appendChild(dialogContents.addVertex);
    selectedVertexIndex = -1;
    highlightedVertexIndex = -1;
    highlightedVertexObj = null;
    resetGUICallbacks();
    eStatusMessage.innerText = "Select vertex to update...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    toolDialog.setVisible(false);
    selectedVertexIndex = -1;
    highlightedVertexIndex = -1;
    highlightedVertexObj = null;
    resetGUICallbacks();
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    var threshold = renderer.transformPixelDistanceToMapDistance(5);
    highlightedVertexIndex = Query.getVertexIndexAtMapCoord(room.state, thisTool.movedMapCoord, threshold);
    highlightedVertexObj = room.gameState.physicsState.vertices[highlightedVertexIndex];
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging)
      return;
    if (event.button!=0){
      if (event.button==2){
        selectedVertexIndex = -1;
        renderer.setSelectedObject(null);
        resetGUICallbacks();
        toolDialog.setVisible(false);
        eStatusMessage.innerText = "Select vertex to update...";
      }
      return;
    }
    if (selectedVertexIndex<0){
      if (!highlightedVertexObj)
        return;
      selectedVertexIndex = highlightedVertexIndex;
      xRow.setValue(highlightedVertexObj.pos.x);
      yRow.setValue(highlightedVertexObj.pos.y);
      bCoefRow.setValue(highlightedVertexObj.bCoef);
      cMaskRow.setValue(highlightedVertexObj.cMask);
      cGroupRow.setValue(highlightedVertexObj.cGroup);
      renderer.setSelectedObject(highlightedVertexObj);
      toolDialog.setVisible(true, { y: 165 });
      setGUICallbacks();
      eStatusMessage.innerText = "Select point...";
      return;
    }
    var pos = renderer.transformPixelCoordToMapCoord(event.offsetX, event.offsetY);
    xRow.setValue(pos.x);
    yRow.setValue(pos.y);
    room.sendCustomEvent(CustomEventType.UpdateVertex, {
      idx: selectedVertexIndex,
      data: {
        x: pos.x,
        y: pos.y
      }
    }, 0);
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (selectedVertexIndex<0){
      if (!highlightedVertexObj)
        return;
      var center = renderer.transformMapCoordToPixelCoord(highlightedVertexObj.pos.x, highlightedVertexObj.pos.y, false);
      var radius = renderer.transformMapDistanceToPixelDistance(4);
      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#bbbb66";
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
      ctx.stroke();
      ctx.restore();
      return;
    }
  };
}

function UpdateSegmentTool(){
  ZoomPanTool.apply(this, ["UpdateSegment", true]);
  var thisTool = this;
  var selectedSegmentIndex = -1, highlightedSegmentIndex = -1, highlightedSegmentObj = null;
  var vertexMode = 0, selectedVertexIndex = -1, selectedVertexObj = null, highlightedVertexIndex = -1, highlightedVertexObj = null;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  var { v0Row, v1Row, curveRow, colorRow, biasRow, visRow, bCoefRow, cMaskRow, cGroupRow } = dialogContents.addSegment;
  const { Query } = API;

  function resetGUICallbacks(){
    v0Row.onValueChanged = null;
    v0Row.onFocusChanged = null;
    v1Row.onValueChanged = null;
    v1Row.onFocusChanged = null;
    curveRow.onValueChanged = null;
    curveRow.onFocusChanged = null;
    colorRow.onValueChanged = null;
    colorRow.onFocusChanged = null;
    biasRow.onValueChanged = null;
    biasRow.onFocusChanged = null;
    visRow.onValueChanged = null;
    visRow.onFocusChanged = null;
    bCoefRow.onValueChanged = null;
    bCoefRow.onFocusChanged = null;
    cMaskRow.onValueChanged = null;
    cMaskRow.onFocusChanged = null;
    cGroupRow.onValueChanged = null;
    cGroupRow.onFocusChanged = null;
  }
  function setGUICallbacks(){
    v0Row.onValueChanged = valueChanged;
    v0Row.onFocusChanged = focusChanged_v0;
    v1Row.onValueChanged = valueChanged;
    v1Row.onFocusChanged = focusChanged_v1;
    curveRow.onValueChanged = valueChanged;
    colorRow.onValueChanged = valueChanged;
    biasRow.onValueChanged = valueChanged;
    visRow.onValueChanged = valueChanged;
    bCoefRow.onValueChanged = valueChanged;
    cMaskRow.onValueChanged = valueChanged;
    cGroupRow.onValueChanged = valueChanged;
  }
  function valueChanged(){
    room.sendCustomEvent(CustomEventType.UpdateSegment, {
      idx: selectedSegmentIndex,
      data: {
        v0: v0Row.getValue(),
        v1: v1Row.getValue(),
        curve: curveRow.getValue(), 
        color: colorRow.getValue(), 
        bias: biasRow.getValue(), 
        vis: visRow.getValue(), 
        bCoef: bCoefRow.getValue(), 
        cMask: cMaskRow.getValue(), 
        cGroup: cGroupRow.getValue()
      }
    }, 0);
  }
  function focusChanged_v0(focus){
    vertexMode = focus?1:0;
    selectedVertexIndex = v0Row.getValue();
    selectedVertexObj = room.gameState.physicsState.vertices[selectedVertexIndex];
    highlightedVertexIndex = -1;
    highlightedVertexObj = null;
    if (vertexMode==1)
      eStatusMessage.innerText = "Select first vertex...";
    else if (vertexMode==2)
      eStatusMessage.innerText = "Select second vertex...";
  }
  function focusChanged_v1(focus){
    vertexMode = focus?2:0;
    selectedVertexIndex = v1Row.getValue();
    selectedVertexObj = room.gameState.physicsState.vertices[selectedVertexIndex];
    highlightedVertexIndex = -1;
    highlightedVertexObj = null;
    if (vertexMode==1)
      eStatusMessage.innerText = "Select first vertex...";
    else if (vertexMode==2)
      eStatusMessage.innerText = "Select second vertex...";
  }

  this.initialize = function(){
    zoomPan_initialize();
    var contents = toolDialog.getContentsElement();
    toolDialog.setTitle("Update Segment");
    contents.innerHTML = "";
    contents.appendChild(dialogContents.addSegment);
    selectedSegmentIndex = -1;
    highlightedSegmentIndex = -1;
    highlightedSegmentObj = null;
    vertexMode = 0;
    selectedVertexIndex = -1;
    selectedVertexObj = null;
    highlightedVertexIndex = -1;
    highlightedVertexObj = null;
    resetGUICallbacks();
    eStatusMessage.innerText = "Select segment to update...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    toolDialog.setVisible(false);
    selectedSegmentIndex = -1;
    highlightedSegmentIndex = -1;
    highlightedSegmentObj = null;
    vertexMode = 0;
    selectedVertexIndex = -1;
    selectedVertexObj = null;
    highlightedVertexIndex = -1;
    highlightedVertexObj = null;
    resetGUICallbacks();
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    var threshold = renderer.transformPixelDistanceToMapDistance(5);
    if (vertexMode>0){
      highlightedVertexIndex = Query.getVertexIndexAtMapCoord(room.state, thisTool.movedMapCoord, threshold);
      highlightedVertexObj = room.gameState.physicsState.vertices[highlightedVertexIndex];
      highlightedSegmentIndex = -1;
      highlightedSegmentObj = null;
    }
    else{
      highlightedVertexIndex = -1;
      highlightedVertexObj = null;
      highlightedSegmentIndex = Query.getSegmentIndexAtMapCoord(room.state, thisTool.movedMapCoord, threshold);
      highlightedSegmentObj = room.gameState.physicsState.segments[highlightedSegmentIndex];
    }
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging)
      return;
    if (event.button!=0){
      if (event.button==2){
        selectedSegmentIndex = -1;
        renderer.setSelectedObject(null);
        resetGUICallbacks();
        toolDialog.setVisible(false);
        eStatusMessage.innerText = "Select segment to update...";
      }
      return;
    }
    if (selectedSegmentIndex<0){
      if (!highlightedSegmentObj)
        return;
      selectedSegmentIndex = highlightedSegmentIndex;
      var [v0, v1] = room.state.findVertexIndicesOfSegment(selectedSegmentIndex);
      v0Row.setValue(v0);
      v1Row.setValue(v1);
      curveRow.setValue(360*Math.atan(1/highlightedSegmentObj.curveF)/Math.PI);
      colorRow.setValue(highlightedSegmentObj.color);
      biasRow.setValue(highlightedSegmentObj.bias);
      visRow.setValue(highlightedSegmentObj.vis);
      bCoefRow.setValue(highlightedSegmentObj.bCoef);
      cMaskRow.setValue(highlightedSegmentObj.cMask);
      cGroupRow.setValue(highlightedSegmentObj.cGroup);
      renderer.setSelectedObject(highlightedSegmentObj);
      toolDialog.setVisible(true, { y: 267 });
      setGUICallbacks();
      eStatusMessage.innerText = "Select from GUI, which vertex to update";
      return;
    }
    if (vertexMode>0 && selectedVertexObj!=null && highlightedVertexObj!=null && highlightedVertexObj!=selectedVertexObj){
      var [v0, v1] = room.state.findVertexIndicesOfSegment(selectedSegmentIndex);
      if (vertexMode==1){
        v0Row.setValue(highlightedVertexIndex);
        v0 = highlightedVertexIndex;
      }
      else{
        v1Row.setValue(highlightedVertexIndex);
        v1 = highlightedVertexIndex;
      }
      room.sendCustomEvent(CustomEventType.UpdateSegment, {
        idx: selectedSegmentIndex,
        data: {
          v0: v0,
          v1: v1,
          curve: curveRow.getValue()
        }
      }, 0);
      vertexMode = 0;
      highlightedVertexIndex = -1;
      highlightedVertexObj = null;
      selectedVertexIndex = -1;
      selectedVertexObj = null;
      eStatusMessage.innerText = "Select from GUI, which vertex to update";
      return;
    }
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (selectedSegmentIndex<0){
      if (highlightedSegmentObj){
        var origin = renderer.getOrigin(), zoomCoeff = renderer.getActualZoomCoefficient();
        ctx.save();
        ctx.resetTransform();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(zoomCoeff, zoomCoeff);
        ctx.translate(-origin.x, -origin.y);
        renderer.drawSegment(highlightedSegmentObj);
        ctx.restore();
      }
      return;
    }
    if (selectedVertexObj){
      var center = renderer.transformMapCoordToPixelCoord(selectedVertexObj.pos.x, selectedVertexObj.pos.y, false);
      var radius = renderer.transformMapDistanceToPixelDistance(4);
      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#882222";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
      ctx.stroke();
      ctx.restore();
    }
    if (highlightedVertexObj!=null && highlightedVertexObj!=selectedVertexObj){
      var center = renderer.transformMapCoordToPixelCoord(highlightedVertexObj.pos.x, highlightedVertexObj.pos.y, false);
      var radius = renderer.transformMapDistanceToPixelDistance(4);
      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#bbbb66";
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
      ctx.stroke();
      ctx.restore();
    }
  };
}

function UpdateGoalTool(){
  ZoomPanTool.apply(this, ["UpdateGoal", true]);
  const { Query } = API;
  var thisTool = this;
  var selectedGoalIndex = -1, highlightedGoalIndex = -1, highlightedGoalObj = null, vertexMode = 0;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  var { p0Row, p1Row, teamRow } = dialogContents.addGoal;

  function resetGUICallbacks(){
    p0Row.onValueChanged = null;
    p0Row.onFocusChanged = null;
    p1Row.onValueChanged = null;
    p1Row.onFocusChanged = null;
    teamRow.onValueChanged = null;
    teamRow.onFocusChanged = null;
  }
  function setGUICallbacks(){
    p0Row.onValueChanged = valueChanged;
    p0Row.onFocusChanged = focusChanged_p0;
    p1Row.onValueChanged = valueChanged;
    p1Row.onFocusChanged = focusChanged_p1;
    teamRow.onValueChanged = valueChanged;
  }
  function focusChanged_p0(focus){
    vertexMode = focus?1:0;
    if (vertexMode==1)
      eStatusMessage.innerText = "Select first point...";
    else if (vertexMode==2)
      eStatusMessage.innerText = "Select second point...";
    else
      eStatusMessage.innerText = "Select from GUI, which point to update...";
  }
  function focusChanged_p1(focus){
    vertexMode = focus?2:0;
    if (vertexMode==1)
      eStatusMessage.innerText = "Select first point...";
    else if (vertexMode==2)
      eStatusMessage.innerText = "Select second point...";
    else
      eStatusMessage.innerText = "Select from GUI, which point to update...";
  }
  function valueChanged(){
    room.sendCustomEvent(CustomEventType.UpdateGoal, {
      idx: selectedGoalIndex,
      data: {
        p0: p0Row.getValue(),
        p1: p1Row.getValue(),
        team: teamRow.getValue()
      }
    }, 0);
  }
  
  this.initialize = function(){
    zoomPan_initialize();
    var contents = toolDialog.getContentsElement();
    toolDialog.setTitle("Update Goal");
    contents.innerHTML = "";
    contents.appendChild(dialogContents.addGoal);
    selectedGoalIndex = -1;
    highlightedGoalIndex = -1;
    highlightedGoalObj = null;
    vertexMode = 0;
    resetGUICallbacks();
    eStatusMessage.innerText = "Select goal to update...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    toolDialog.setVisible(false);
    selectedGoalIndex = -1;
    highlightedGoalIndex = -1;
    highlightedGoalObj = null;
    vertexMode = 0;
    resetGUICallbacks();
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    if (vertexMode>0){
      if (vertexMode==1)
        p0Row.setValue("["+thisTool.movedMapCoord.x+","+thisTool.movedMapCoord.y+"]");
      else
        p1Row.setValue("["+thisTool.movedMapCoord.x+","+thisTool.movedMapCoord.y+"]");
    }
    else{
      var threshold = renderer.transformPixelDistanceToMapDistance(5);
      highlightedGoalIndex = Query.getGoalIndexAtMapCoord(room.state, thisTool.movedMapCoord, threshold);
      highlightedGoalObj = room.gameState.stadium.goals[highlightedGoalIndex];
    }
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging)
      return;
    if (event.button!=0){
      if (event.button==2){
        selectedGoalIndex = -1;
        highlightedGoalIndex = -1;
        highlightedGoalObj = null;
        vertexMode = 0;
        renderer.setSelectedObject(null);
        resetGUICallbacks();
        toolDialog.setVisible(false);
        eStatusMessage.innerText = "Select goal to update...";
      }
      return;
    }
    if (selectedGoalIndex<0){
      if (!highlightedGoalObj)
        return;
      selectedGoalIndex = highlightedGoalIndex;
      p0Row.setValue("["+highlightedGoalObj.p0.x+","+highlightedGoalObj.p0.y+"]");
      p1Row.setValue("["+highlightedGoalObj.p1.x+","+highlightedGoalObj.p1.y+"]");
      teamRow.setValue(highlightedGoalObj.team.id==1?"red":"blue");
      renderer.setSelectedObject(highlightedGoalObj);
      toolDialog.setVisible(true, { y: 111 });
      setGUICallbacks();
      eStatusMessage.innerText = "Select from GUI, which point to update...";
      return;
    }
    vertexMode = 0;
    eStatusMessage.innerText = "Select from GUI, which point to update...";
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (selectedGoalIndex<0){
      if (highlightedGoalObj){
        var origin = renderer.getOrigin(), zoomCoeff = renderer.getActualZoomCoefficient();
        ctx.save();
        ctx.resetTransform();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(zoomCoeff, zoomCoeff);
        ctx.translate(-origin.x, -origin.y);
        renderer.drawGoal(highlightedGoalObj);
        ctx.restore();
      }
      return;
    }
    if (vertexMode>0){
      var p = (vertexMode==1) ? p0Row.getValue() : p1Row.getValue();
      var center = renderer.transformMapCoordToPixelCoord(p[0], p[1], false);
      var radius = renderer.transformMapDistanceToPixelDistance(4);
      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#882222";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
      ctx.stroke();
      ctx.restore();
    }
  };
}

function UpdatePlaneTool(){
  ZoomPanTool.apply(this, ["UpdatePlane", true]);
  const { Query } = API;
  var thisTool = this;
  var selectedPlaneIndex = -1, highlightedPlaneIndex = -1, highlightedPlaneObj = null, toolMode = 0;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  var { normalRow, distRow, bCoefRow, cMaskRow, cGroupRow } = dialogContents.addPlane;

  function resetGUICallbacks(){
    normalRow.onValueChanged = null;
    normalRow.onFocusChanged = null;
    distRow.onValueChanged = null;
    distRow.onFocusChanged = null;
    bCoefRow.onValueChanged = null;
    bCoefRow.onFocusChanged = null;
    cMaskRow.onValueChanged = null;
    cMaskRow.onFocusChanged = null;
    cGroupRow.onValueChanged = null;
    cGroupRow.onFocusChanged = null;
  }
  function setGUICallbacks(){
    normalRow.onValueChanged = valueChanged;
    normalRow.onFocusChanged = focusChanged_normal;
    distRow.onValueChanged = valueChanged;
    distRow.onFocusChanged = focusChanged_dist;
    bCoefRow.onValueChanged = valueChanged;
    cMaskRow.onValueChanged = valueChanged;
    cGroupRow.onValueChanged = valueChanged;
  }
  function focusChanged_normal(focus){
    toolMode = focus?1:0;
    if (toolMode==1)
      eStatusMessage.innerText = "Select point to calculate normal angle w.r.t. origin...";
    else
      eStatusMessage.innerText = "Select from GUI, which property to update...";
  }
  function focusChanged_dist(focus){
    toolMode = focus?2:0;
    if (toolMode==2)
      eStatusMessage.innerText = "Select point to calculate distance to origin...";
    else
      eStatusMessage.innerText = "Select from GUI, which property to update...";
  }
  function valueChanged(){
    room.sendCustomEvent(CustomEventType.UpdatePlane, {
      idx: selectedPlaneIndex,
      data: {
        normal: normalRow.getValue(),
        dist: distRow.getValue(),
        bCoef: bCoefRow.getValue(),
        cMask: cMaskRow.getValue(),
        cGroup: cGroupRow.getValue()
      }
    }, 0);
  }
  
  this.initialize = function(){
    zoomPan_initialize();
    var contents = toolDialog.getContentsElement();
    toolDialog.setTitle("Update Plane");
    contents.innerHTML = "";
    contents.appendChild(dialogContents.addPlane);
    selectedPlaneIndex = -1;
    highlightedPlaneIndex = -1;
    highlightedPlaneObj = null;
    toolMode = 0;
    resetGUICallbacks();
    eStatusMessage.innerText = "Select plane to update...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    toolDialog.setVisible(false);
    selectedPlaneIndex = -1;
    highlightedPlaneIndex = -1;
    highlightedPlaneObj = null;
    toolMode = 0;
    resetGUICallbacks();
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    if (toolMode>0){
      if (toolMode==1)
        normalRow.setValue("["+thisTool.movedMapCoord.x+","+thisTool.movedMapCoord.y+"]");
      else{
        var n = normalRow.getValue(), d = Math.sqrt(thisTool.movedMapCoord.x*thisTool.movedMapCoord.x+thisTool.movedMapCoord.y*thisTool.movedMapCoord.y);
        var nd = Math.sqrt(n[0]*n[0]+n[1]*n[1]);
        normalRow.setValue("["+n[0]*d/nd+","+n[1]*d/nd+"]");
        distRow.setValue(d);
      }
    }
    else{
      var threshold = renderer.transformPixelDistanceToMapDistance(5);
      highlightedPlaneIndex = Query.getPlaneIndexAtMapCoord(room.state, thisTool.movedMapCoord, threshold);
      highlightedPlaneObj = room.gameState.physicsState.planes[highlightedPlaneIndex];
    }
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging)
      return;
    if (event.button!=0){
      if (event.button==2){
        selectedPlaneIndex = -1;
        highlightedPlaneIndex = -1;
        highlightedPlaneObj = null;
        toolMode = 0;
        renderer.setSelectedObject(null);
        resetGUICallbacks();
        toolDialog.setVisible(false);
        eStatusMessage.innerText = "Select plane to update...";
      }
      return;
    }
    if (selectedPlaneIndex<0){
      if (!highlightedPlaneObj)
        return;
      selectedPlaneIndex = highlightedPlaneIndex;
      normalRow.setValue("["+highlightedPlaneObj.normal.x+","+highlightedPlaneObj.normal.y+"]"),
      distRow.setValue(highlightedPlaneObj.dist),
      bCoefRow.setValue(highlightedPlaneObj.bCoef),
      cMaskRow.setValue(highlightedPlaneObj.cMask),
      cGroupRow.setValue(highlightedPlaneObj.cGroup)
      renderer.setSelectedObject(highlightedPlaneObj);
      toolDialog.setVisible(true, { y: 165 });
      setGUICallbacks();
      eStatusMessage.innerText = "Select from GUI, which property to update...";
      return;
    }
    toolMode = 0;
    eStatusMessage.innerText = "Select from GUI, which property to update...";
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (selectedPlaneIndex<0){
      if (highlightedPlaneObj){
        var origin = renderer.getOrigin(), zoomCoeff = renderer.getActualZoomCoefficient();
        ctx.save();
        ctx.resetTransform();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(zoomCoeff, zoomCoeff);
        ctx.translate(-origin.x, -origin.y);
        renderer.drawPlane(highlightedPlaneObj);
        ctx.restore();
      }
      return;
    }
  };
}

function UpdateDiscTool(){
  ZoomPanTool.apply(this, ["UpdateDisc", true]);
  var thisTool = this;
  var selectedDiscIndex = -1, highlightedDiscIndex = -1, highlightedDiscObj = null;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  var { posRow, radiusRow, speedRow, gravityRow, invMassRow, dampingRow, colorRow, bCoefRow, cMaskRow, cGroupRow } = dialogContents.addDisc;

  function resetGUICallbacks(){
    posRow.onValueChanged = null;
    posRow.onFocusChanged = null;
    radiusRow.onValueChanged = null;
    radiusRow.onFocusChanged = null;
    speedRow.onValueChanged = null;
    speedRow.onFocusChanged = null;
    gravityRow.onValueChanged = null;
    gravityRow.onFocusChanged = null;
    invMassRow.onValueChanged = null;
    invMassRow.onFocusChanged = null;
    dampingRow.onValueChanged = null;
    dampingRow.onFocusChanged = null;
    colorRow.onValueChanged = null;
    colorRow.onFocusChanged = null;
    bCoefRow.onValueChanged = null;
    bCoefRow.onFocusChanged = null;
    cMaskRow.onValueChanged = null;
    cMaskRow.onFocusChanged = null;
    cGroupRow.onValueChanged = null;
    cGroupRow.onFocusChanged = null;
  }
  function setGUICallbacks(){
    posRow.onValueChanged = valueChanged;
    radiusRow.onValueChanged = valueChanged;
    speedRow.onValueChanged = valueChanged;
    gravityRow.onValueChanged = valueChanged;
    invMassRow.onValueChanged = valueChanged;
    dampingRow.onValueChanged = valueChanged;
    colorRow.onValueChanged = valueChanged;
    bCoefRow.onValueChanged = valueChanged;
    cMaskRow.onValueChanged = valueChanged;
    cGroupRow.onValueChanged = valueChanged;
  }
  function valueChanged(){
    room.sendCustomEvent(CustomEventType.UpdateDisc, {
      idx: selectedDiscIndex,
      data: {
        pos: posRow.getValue(),
        radius: radiusRow.getValue(),
        color: colorRow.getValue(), 
        speed: speedRow.getValue(), 
        gravity: gravityRow.getValue(),
        invMass: invMassRow.getValue(),
        damping: dampingRow.getValue(), 
        bCoef: bCoefRow.getValue(),
        cMask: cMaskRow.getValue(),
        cGroup: cGroupRow.getValue()
      }
    }, 0);
  }

  this.initialize = function(){
    zoomPan_initialize();
    var contents = toolDialog.getContentsElement();
    toolDialog.setTitle("Update Disc");
    contents.innerHTML = "";
    contents.appendChild(dialogContents.addDisc);
    selectedDiscIndex = -1;
    highlightedDiscIndex = -1;
    highlightedDiscObj = null;
    resetGUICallbacks();
    eStatusMessage.innerText = "Select disc to update...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    toolDialog.setVisible(false);
    selectedDiscIndex = -1;
    highlightedDiscIndex = -1;
    highlightedDiscObj = null;
    resetGUICallbacks();
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    highlightedDiscIndex = thisTool.discIndexAtCoord;
    highlightedDiscObj = room.gameState.physicsState.discs[highlightedDiscIndex];
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging)
      return;
    if (event.button!=0){
      if (event.button==2){
        selectedDiscIndex = -1;
        renderer.setSelectedObject(null);
        resetGUICallbacks();
        toolDialog.setVisible(false);
        eStatusMessage.innerText = "Select disc to update...";
      }
      return;
    }
    if (selectedDiscIndex<0){
      if (!highlightedDiscObj)
        return;
      selectedDiscIndex = highlightedDiscIndex;
      posRow.setValue("["+highlightedDiscObj.pos.x+", "+highlightedDiscObj.pos.y+"]");
      radiusRow.setValue(highlightedDiscObj.radius);
      speedRow.setValue("["+highlightedDiscObj.speed.x+", "+highlightedDiscObj.speed.y+"]");
      gravityRow.setValue("["+highlightedDiscObj.gravity.x+", "+highlightedDiscObj.gravity.y+"]");
      invMassRow.setValue(highlightedDiscObj.invMass);
      dampingRow.setValue(highlightedDiscObj.damping);
      colorRow.setValue(highlightedDiscObj.color);
      bCoefRow.setValue(highlightedDiscObj.bCoef);
      cMaskRow.setValue(highlightedDiscObj.cMask);
      cGroupRow.setValue(highlightedDiscObj.cGroup);
      renderer.setSelectedObject(highlightedDiscObj);
      toolDialog.setVisible(true, { y: 295 });
      setGUICallbacks();
      eStatusMessage.innerText = "Select point...";
      return;
    }
    posRow.setValue("["+thisTool.movedMapCoord.x+", "+thisTool.movedMapCoord.y+"]");
    eStatusMessage.innerText = "Select point...";
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (selectedDiscIndex<0){
      if (!highlightedDiscObj)
        return;
      var center = renderer.transformMapCoordToPixelCoord(highlightedDiscObj.pos.x, highlightedDiscObj.pos.y, false);
      var radius = renderer.transformMapDistanceToPixelDistance(highlightedDiscObj.radius);
      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#bbbb66";
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
      ctx.stroke();
      ctx.restore();
      return;
    }
  };
}

function UpdateJointTool(){
  ZoomPanTool.apply(this, ["UpdateJoint", true]);
  var thisTool = this;
  var selectedJointIndex = -1, highlightedJointIndex = -1, highlightedJointObj = null;
  var discMode = 0, selectedDiscIndex = -1, selectedDiscObj = null, highlightedDiscIndex = -1, highlightedDiscObj = null;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  var { d0Row, d1Row, strengthRow, lengthRow, colorRow } = dialogContents.addJoint;
  const { Query } = API;

  function resetGUICallbacks(){
    d0Row.onValueChanged = null;
    d0Row.onFocusChanged = null;
    d1Row.onValueChanged = null;
    d1Row.onFocusChanged = null;
    strengthRow.onValueChanged = null;
    strengthRow.onFocusChanged = null;
    lengthRow.onValueChanged = null;
    lengthRow.onFocusChanged = null;
    colorRow.onValueChanged = null;
    colorRow.onFocusChanged = null;
  }
  function setGUICallbacks(){
    d0Row.onValueChanged = valueChanged;
    d0Row.onFocusChanged = focusChanged_d0;
    d1Row.onValueChanged = valueChanged;
    d1Row.onFocusChanged = focusChanged_d1;
    strengthRow.onValueChanged = valueChanged;
    lengthRow.onValueChanged = valueChanged;
    colorRow.onValueChanged = valueChanged;
  }
  function valueChanged(){
    room.sendCustomEvent(CustomEventType.UpdateJoint, {
      idx: selectedJointIndex,
      data: {
        d0: d0Row.getValue(),
        d1: d1Row.getValue(),
        strength: strengthRow.getValue(), 
        length: lengthRow.getValue(), 
        color: colorRow.getValue()
      }
    }, 0);
  }
  function focusChanged_d0(focus){
    discMode = focus?1:0;
    selectedDiscIndex = d0Row.getValue();
    selectedDiscObj = room.gameState.physicsState.discs[selectedDiscIndex];
    highlightedDiscIndex = -1;
    highlightedDiscObj = null;
    if (discMode==1)
      eStatusMessage.innerText = "Select first disc...";
    else
      eStatusMessage.innerText = "Select from GUI, which property to update...";
  }
  function focusChanged_d1(focus){
    discMode = focus?2:0;
    selectedDiscIndex = d1Row.getValue();
    selectedDiscObj = room.gameState.physicsState.discs[selectedDiscIndex];
    highlightedDiscIndex = -1;
    highlightedDiscObj = null;
    if (discMode==2)
      eStatusMessage.innerText = "Select second disc...";
    else
      eStatusMessage.innerText = "Select from GUI, which property to update...";
  }

  this.initialize = function(){
    zoomPan_initialize();
    var contents = toolDialog.getContentsElement();
    toolDialog.setTitle("Update Joint");
    contents.innerHTML = "";
    contents.appendChild(dialogContents.addJoint);
    selectedJointIndex = -1;
    highlightedJointIndex = -1;
    highlightedJointObj = null;
    discMode = 0;
    selectedDiscIndex = -1;
    selectedDiscObj = null;
    highlightedDiscIndex = -1;
    highlightedDiscObj = null;
    resetGUICallbacks();
    eStatusMessage.innerText = "Select joint to update...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    toolDialog.setVisible(false);
    selectedJointIndex = -1;
    highlightedJointIndex = -1;
    highlightedJointObj = null;
    discMode = 0;
    selectedDiscIndex = -1;
    selectedDiscObj = null;
    highlightedDiscIndex = -1;
    highlightedDiscObj = null;
    resetGUICallbacks();
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    if (discMode>0){
      highlightedDiscIndex = thisTool.discIndexAtCoord;
      highlightedDiscObj = room.gameState.physicsState.discs[highlightedDiscIndex];
      highlightedJointIndex = -1;
      highlightedJointObj = null;
    }
    else{
      highlightedDiscIndex = -1;
      highlightedDiscObj = null;
      var threshold = renderer.transformPixelDistanceToMapDistance(5);
      highlightedJointIndex = Query.getJointIndexAtMapCoord(room.state, thisTool.movedMapCoord, threshold);
      highlightedJointObj = room.gameState.physicsState.joints[highlightedJointIndex];
    }
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging)
      return;
    if (event.button!=0){
      if (event.button==2){
        selectedJointIndex = -1;
        renderer.setSelectedObject(null);
        resetGUICallbacks();
        toolDialog.setVisible(false);
        eStatusMessage.innerText = "Select joint to update...";
      }
      return;
    }
    if (selectedJointIndex<0){
      if (!highlightedJointObj)
        return;
      selectedJointIndex = highlightedJointIndex;
      d0Row.setValue(highlightedJointObj.d0);
      d1Row.setValue(highlightedJointObj.d1);
      strengthRow.setValue(highlightedJointObj.strength);
      lengthRow.setValue("["+highlightedJointObj.minLength+", "+highlightedJointObj.maxLength+"]");
      colorRow.setValue(highlightedJointObj.color);
      renderer.setSelectedObject(highlightedJointObj);
      toolDialog.setVisible(true, { y: 165 });
      setGUICallbacks();
      eStatusMessage.innerText = "Select from GUI, which property to update...";
      return;
    }
    if (discMode>0 && selectedDiscObj!=null && highlightedDiscObj!=null && highlightedDiscObj!=selectedDiscObj){
      var selectedJointObj = room.gameState.physicsState.joints[selectedJointIndex], d0 = selectedJointObj.d0, d1 = selectedJointObj.d1;
      if (discMode==1){
        d0Row.setValue(highlightedDiscIndex);
        d0 = highlightedDiscIndex;
      }
      else{
        d1Row.setValue(highlightedDiscIndex);
        d1 = highlightedDiscIndex;
      }
      room.sendCustomEvent(CustomEventType.UpdateJoint, {
        idx: selectedJointIndex,
        data: {
          d0: d0,
          d1: d1
        }
      }, 0);
      discMode = 0;
      highlightedDiscIndex = -1;
      highlightedDiscObj = null;
      selectedDiscIndex = -1;
      selectedDiscObj = null;
      eStatusMessage.innerText = "Select from GUI, which property to update...";
      return;
    }
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (selectedJointIndex<0){
      if (highlightedJointObj){
        var origin = renderer.getOrigin(), zoomCoeff = renderer.getActualZoomCoefficient();
        ctx.save();
        ctx.resetTransform();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(zoomCoeff, zoomCoeff);
        ctx.translate(-origin.x, -origin.y);
        renderer.drawJoint(highlightedJointObj, room.gameState.physicsState.discs);
        ctx.restore();
      }
      return;
    }
    if (selectedDiscObj){
      var center = renderer.transformMapCoordToPixelCoord(selectedDiscObj.pos.x, selectedDiscObj.pos.y, false);
      var radius = renderer.transformMapDistanceToPixelDistance(selectedDiscObj.radius);
      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#882222";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
      ctx.stroke();
      ctx.restore();
    }
    if (highlightedDiscObj!=null && highlightedDiscObj!=selectedDiscObj){
      var center = renderer.transformMapCoordToPixelCoord(highlightedDiscObj.pos.x, highlightedDiscObj.pos.y, false);
      var radius = renderer.transformMapDistanceToPixelDistance(highlightedDiscObj.radius);
      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#bbbb66";
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
      ctx.stroke();
      ctx.restore();
    }
  };
}

function UpdateSpawnPointTool(){
  ZoomPanTool.apply(this, ["UpdateSpawnPoint", true]);
  var thisTool = this;
  var selectedSpawnPointIndex = -1, selectedSpawnPointTeam = "", selectedSpawnPointPos = null, highlightedSpawnPointIndex = -1, highlightedSpawnPointTeam = -1, highlightedSpawnPointPos = null;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  var { xRow, yRow, teamRow } = dialogContents.addSpawnPoint;
  const { Query } = API;
  function resetGUICallbacks(){
    xRow.onValueChanged = null;
    xRow.onFocusChanged = null;
    yRow.onValueChanged = null;
    yRow.onFocusChanged = null;
    teamRow.onValueChanged = null;
    teamRow.onFocusChanged = null;
  }
  function setGUICallbacks(){
    xRow.onValueChanged = valueChanged;
    yRow.onValueChanged = valueChanged;
    teamRow.onValueChanged = valueChanged;
  }
  function valueChanged(){
    var team = teamRow.getValue();
    room.sendCustomEvent(CustomEventType.UpdateSpawnPoint, {
      idx: selectedSpawnPointIndex,
      team: selectedSpawnPointTeam,
      data: {
        x: xRow.getValue(), 
        y: yRow.getValue(), 
        team: team
      }
    }, 0);
    if (selectedSpawnPointTeam!=team){
      selectedSpawnPointIndex = -1;
      selectedSpawnPointTeam = "";
      selectedSpawnPointPos = null;
      highlightedSpawnPointIndex = -1;
      highlightedSpawnPointTeam = -1;
      highlightedSpawnPointPos = null;
      renderer.setSelectedObject(null);
      resetGUICallbacks();
      toolDialog.setVisible(false);
    }
  }
  
  this.initialize = function(){
    zoomPan_initialize();
    var contents = toolDialog.getContentsElement();
    toolDialog.setTitle("Update Spawn Point");
    contents.innerHTML = "";
    contents.appendChild(dialogContents.addSpawnPoint);
    selectedSpawnPointIndex = -1;
    selectedSpawnPointTeam = "";
    selectedSpawnPointPos = null;
    highlightedSpawnPointIndex = -1;
    highlightedSpawnPointTeam = -1;
    highlightedSpawnPointPos = null;
    resetGUICallbacks();
    eStatusMessage.innerText = "Select spawn point to update...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    toolDialog.setVisible(false);
    selectedSpawnPointIndex = -1;
    selectedSpawnPointTeam = "";
    selectedSpawnPointPos = null;
    highlightedSpawnPointIndex = -1;
    highlightedSpawnPointTeam = -1;
    highlightedSpawnPointPos = null;
    resetGUICallbacks();
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    var threshold = renderer.transformPixelDistanceToMapDistance(15);
    [highlightedSpawnPointIndex, highlightedSpawnPointTeam] = Query.getSpawnPointIndexAtMapCoord(room.state, thisTool.movedMapCoord, threshold);
    var arr = (highlightedSpawnPointTeam==1) ? room.gameState.stadium.redSpawnPoints : room.gameState.stadium.blueSpawnPoints;
    highlightedSpawnPointPos = arr[highlightedSpawnPointIndex];
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging)
      return;
    if (event.button!=0){
      if (event.button==2){
        selectedSpawnPointIndex = -1;
        selectedSpawnPointTeam = "";
        selectedSpawnPointPos = null;
        highlightedSpawnPointIndex = -1;
        highlightedSpawnPointTeam = -1;
        highlightedSpawnPointPos = null;
        renderer.setSelectedObject(null);
        resetGUICallbacks();
        toolDialog.setVisible(false);
        eStatusMessage.innerText = "Select spawn point to update...";
      }
      return;
    }
    if (selectedSpawnPointIndex<0){
      if (!highlightedSpawnPointPos)
        return;
      selectedSpawnPointIndex = highlightedSpawnPointIndex;
      selectedSpawnPointTeam = (highlightedSpawnPointTeam==1) ? "red" : "blue";
      selectedSpawnPointPos = highlightedSpawnPointPos;
      xRow.setValue(selectedSpawnPointPos.x);
      yRow.setValue(selectedSpawnPointPos.y);
      teamRow.setValue(selectedSpawnPointTeam);
      renderer.setSelectedObject({
        type: "spawnPoint",
        team: highlightedSpawnPointTeam, 
        idx: selectedSpawnPointIndex
      });
      toolDialog.setVisible(true, { y: 111 });
      setGUICallbacks();
      eStatusMessage.innerText = "Select point...";
      return;
    }
    var pos = renderer.transformPixelCoordToMapCoord(event.offsetX, event.offsetY);
    xRow.setValue(pos.x);
    yRow.setValue(pos.y);
    room.sendCustomEvent(CustomEventType.UpdateSpawnPoint, {
      idx: selectedSpawnPointIndex,
      team: selectedSpawnPointTeam,
      data: {
        x: pos.x,
        y: pos.y,
        team: teamRow.getValue()
      }
    }, 0);
    eStatusMessage.innerText = "Select point...";
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (selectedSpawnPointIndex<0){
      if (!highlightedSpawnPointPos)
        return;
      var center = renderer.transformMapCoordToPixelCoord(highlightedSpawnPointPos.x, highlightedSpawnPointPos.y, false);
      var radius = renderer.transformMapDistanceToPixelDistance(15);
      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#bbbb66";
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
      ctx.stroke();
      ctx.restore();
      return;
    }
  };
}

function UpdatePlayerTool(){
  ZoomPanTool.apply(this, ["UpdatePlayer", true]);
  var thisTool = this;
  var selectedPlayerIndex = -1, highlightedPlayerIndex = -1, highlightedPlayerObj = null;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  var { posRow, radiusRow, speedRow, gravityRow, invMassRow, dampingRow, bCoefRow, cMaskRow, cGroupRow, nameRow, avatarRow, flagRow, teamRow } = dialogContents.addPlayer;

  function resetGUICallbacks(){
    posRow.onValueChanged = null;
    posRow.onFocusChanged = null;
    radiusRow.onValueChanged = null;
    radiusRow.onFocusChanged = null;
    speedRow.onValueChanged = null;
    speedRow.onFocusChanged = null;
    gravityRow.onValueChanged = null;
    gravityRow.onFocusChanged = null;
    invMassRow.onValueChanged = null;
    invMassRow.onFocusChanged = null;
    dampingRow.onValueChanged = null;
    dampingRow.onFocusChanged = null;
    bCoefRow.onValueChanged = null;
    bCoefRow.onFocusChanged = null;
    cMaskRow.onValueChanged = null;
    cMaskRow.onFocusChanged = null;
    cGroupRow.onValueChanged = null;
    cGroupRow.onFocusChanged = null;
    nameRow.onValueChanged = null;
    nameRow.onFocusChanged = null;
    avatarRow.onValueChanged = null;
    avatarRow.onFocusChanged = null;
    flagRow.onValueChanged = null;
    flagRow.onFocusChanged = null;
    teamRow.onValueChanged = null;
    teamRow.onFocusChanged = null;
  }
  function setGUICallbacks(){
    posRow.onValueChanged = valueChanged;
    radiusRow.onValueChanged = valueChanged;
    speedRow.onValueChanged = valueChanged;
    gravityRow.onValueChanged = valueChanged;
    invMassRow.onValueChanged = valueChanged;
    dampingRow.onValueChanged = valueChanged;
    bCoefRow.onValueChanged = valueChanged;
    cMaskRow.onValueChanged = valueChanged;
    cGroupRow.onValueChanged = valueChanged;
    nameRow.onValueChanged = valueChanged;
    avatarRow.onValueChanged = valueChanged;
    flagRow.onValueChanged = valueChanged;
    teamRow.onValueChanged = valueChanged;
  }
  function valueChanged(){
    room.sendCustomEvent(CustomEventType.UpdatePlayer, {
      idx: selectedPlayerIndex,
      data: {
        pos: posRow.getValue(),
        radius: radiusRow.getValue(),
        speed: speedRow.getValue(), 
        gravity: gravityRow.getValue(),
        invMass: invMassRow.getValue(),
        damping: dampingRow.getValue(), 
        bCoef: bCoefRow.getValue(),
        cMask: cMaskRow.getValue(),
        cGroup: cGroupRow.getValue(),
        name: nameRow.getValue(), 
        avatar: avatarRow.getValue(), 
        flag: flagRow.getValue(), 
        team: teamRow.getValue()
      }
    }, 0);
  }

  this.initialize = function(){
    zoomPan_initialize();
    var contents = toolDialog.getContentsElement();
    toolDialog.setTitle("Update Player");
    contents.innerHTML = "";
    contents.appendChild(dialogContents.addPlayer);
    selectedPlayerIndex = -1;
    highlightedPlayerIndex = -1;
    highlightedPlayerObj = null;
    resetGUICallbacks();
    eStatusMessage.innerText = "Select player to update...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    toolDialog.setVisible(false);
    selectedPlayerIndex = -1;
    highlightedPlayerIndex = -1;
    highlightedPlayerObj = null;
    resetGUICallbacks();
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    var idx = thisTool.discIndexAtCoord, disc = room.gameState.physicsState.discs[idx], playerId = disc?.playerId;
    if (playerId==null){
      highlightedPlayerIndex = -1;
      highlightedPlayerObj = null;
    }
    else{
      var playerObj = room.state.getPlayer(playerId);
      if (playerObj){
        highlightedPlayerIndex = playerId;
        highlightedPlayerObj = playerObj;
      }
      else{
        highlightedPlayerIndex = -1;
        highlightedPlayerObj = null;
      }
    }
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging)
      return;
    if (event.button!=0){
      if (event.button==2){
        selectedPlayerIndex = -1;
        renderer.setSelectedObject(null);
        resetGUICallbacks();
        toolDialog.setVisible(false);
        eStatusMessage.innerText = "Select player to update...";
      }
      return;
    }
    if (selectedPlayerIndex<0){
      if (!highlightedPlayerObj)
        return;
      selectedPlayerIndex = highlightedPlayerIndex;
      var obj = highlightedPlayerObj.disc;
      if (obj){
        posRow.setValue("["+obj.pos.x+", "+obj.pos.y+"]");
        radiusRow.setValue(obj.radius);
        speedRow.setValue("["+obj.speed.x+", "+obj.speed.y+"]");
        gravityRow.setValue("["+obj.gravity.x+", "+obj.gravity.y+"]");
        invMassRow.setValue(obj.invMass);
        dampingRow.setValue(obj.damping);
        bCoefRow.setValue(obj.bCoef);
        cMaskRow.setValue(obj.cMask);
        cGroupRow.setValue(obj.cGroup);
        renderer.setSelectedObject(obj);
      }
      /*
      else{
        posRow.setValue("[0, 0]");
        radiusRow.setValue(15);
        speedRow.setValue("[0, 0]");
        gravityRow.setValue("[0, 0]");
        invMassRow.setValue(0);
        dampingRow.setValue(0);
        bCoefRow.setValue(0);
        cMaskRow.setValue(0);
        cGroupRow.setValue(0);
      }
      */
      nameRow.setValue(highlightedPlayerObj.name);
      avatarRow.setValue(highlightedPlayerObj.avatar);
      flagRow.setValue(highlightedPlayerObj.flag);
      teamRow.setValue((highlightedPlayerObj.team.id==1) ? "red" : ((highlightedPlayerObj.team.id==2) ? "blue" : "spec"));
      toolDialog.setVisible(true, { y: 370 });
      setGUICallbacks();
      eStatusMessage.innerText = "Select point...";
      return;
    }
    posRow.setValue("["+thisTool.movedMapCoord.x+", "+thisTool.movedMapCoord.y+"]");
    eStatusMessage.innerText = "Select point...";
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (selectedPlayerIndex<0){
      var disc = highlightedPlayerObj?.disc;
      if (!disc)
        return;
      var center = renderer.transformMapCoordToPixelCoord(disc.pos.x, disc.pos.y, false);
      var radius = renderer.transformMapDistanceToPixelDistance(disc.radius);
      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#bbbb66";
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
      ctx.stroke();
      ctx.restore();
      return;
    }
  };
}

function RemoveVertexTool(){
  ZoomPanTool.apply(this, ["RemoveVertex", true]);
  var thisTool = this;
  var highlightedVertexIndex = -1, highlightedVertexObj = null;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  const { Query } = API;

  this.initialize = function(){
    zoomPan_initialize();
    highlightedVertexIndex = -1;
    highlightedVertexObj = null;
    eStatusMessage.innerText = "Select vertex to remove...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    highlightedVertexIndex = -1;
    highlightedVertexObj = null;
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    var threshold = renderer.transformPixelDistanceToMapDistance(5);
    highlightedVertexIndex = Query.getVertexIndexAtMapCoord(room.state, thisTool.movedMapCoord, threshold);
    highlightedVertexObj = room.gameState.physicsState.vertices[highlightedVertexIndex];
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging || event.button!=0)
      return;
    if (highlightedVertexIndex<0)
      return;
    room.sendCustomEvent(CustomEventType.RemoveVertex, highlightedVertexIndex, 0);
    highlightedVertexIndex = -1;
    highlightedVertexObj = null;
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (!highlightedVertexObj)
      return;
    var center = renderer.transformMapCoordToPixelCoord(highlightedVertexObj.pos.x, highlightedVertexObj.pos.y, false);
    var radius = renderer.transformMapDistanceToPixelDistance(4);
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#bbbb66";
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
    ctx.stroke();
    ctx.restore();
  }
}

function RemoveSegmentTool(){
  ZoomPanTool.apply(this, ["RemoveSegment", true]);
  var thisTool = this;
  var highlightedSegmentIndex = -1, highlightedSegmentObj = null;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  const { Query } = API;

  this.initialize = function(){
    zoomPan_initialize();
    highlightedSegmentIndex = -1;
    highlightedSegmentObj = null;
    eStatusMessage.innerText = "Select segment to remove...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    highlightedSegmentIndex = -1;
    highlightedSegmentObj = null;
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    var threshold = renderer.transformPixelDistanceToMapDistance(5);
    highlightedSegmentIndex = Query.getSegmentIndexAtMapCoord(room.state, thisTool.movedMapCoord, threshold);
    highlightedSegmentObj = room.gameState.physicsState.segments[highlightedSegmentIndex];
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging || event.button!=0)
      return;
    if (highlightedSegmentIndex<0)
      return;
    room.sendCustomEvent(CustomEventType.RemoveSegment, highlightedSegmentIndex, 0);
    highlightedSegmentIndex = -1;
    highlightedSegmentObj = null;
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (!highlightedSegmentObj)
      return;
    var origin = renderer.getOrigin(), zoomCoeff = renderer.getActualZoomCoefficient();
    ctx.save();
    ctx.resetTransform();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(zoomCoeff, zoomCoeff);
    ctx.translate(-origin.x, -origin.y);
    renderer.drawSegment(highlightedSegmentObj);
    ctx.restore();
  }
}

function RemoveGoalTool(){
  ZoomPanTool.apply(this, ["RemoveGoal", true]);
  var thisTool = this;
  var highlightedGoalIndex = -1, highlightedGoalObj = null;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  const { Query } = API;

  this.initialize = function(){
    zoomPan_initialize();
    highlightedGoalIndex = -1;
    highlightedGoalObj = null;
    eStatusMessage.innerText = "Select goal to remove...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    highlightedGoalIndex = -1;
    highlightedGoalObj = null;
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    var threshold = renderer.transformPixelDistanceToMapDistance(5);
    highlightedGoalIndex = Query.getGoalIndexAtMapCoord(room.state, thisTool.movedMapCoord, threshold);
    highlightedGoalObj = room.gameState.stadium.goals[highlightedGoalIndex];
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging || event.button!=0)
      return;
    if (highlightedGoalIndex<0)
      return;
    room.sendCustomEvent(CustomEventType.RemoveGoal, highlightedGoalIndex, 0);
    highlightedGoalIndex = -1;
    highlightedGoalObj = null;
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (!highlightedGoalObj)
      return;
    var origin = renderer.getOrigin(), zoomCoeff = renderer.getActualZoomCoefficient();
    ctx.save();
    ctx.resetTransform();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(zoomCoeff, zoomCoeff);
    ctx.translate(-origin.x, -origin.y);
    renderer.drawGoal(highlightedGoalObj);
    ctx.restore();
  }
}

function RemovePlaneTool(){
  ZoomPanTool.apply(this, ["RemovePlane", true]);
  var thisTool = this;
  var highlightedPlaneIndex = -1, highlightedPlaneObj = null;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  const { Query } = API;

  this.initialize = function(){
    zoomPan_initialize();
    highlightedPlaneIndex = -1;
    highlightedPlaneObj = null;
    eStatusMessage.innerText = "Select plane to remove...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    highlightedPlaneIndex = -1;
    highlightedPlaneObj = null;
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    var threshold = renderer.transformPixelDistanceToMapDistance(5);
    highlightedPlaneIndex = Query.getPlaneIndexAtMapCoord(room.state, thisTool.movedMapCoord, threshold);
    highlightedPlaneObj = room.gameState.physicsState.planes[highlightedPlaneIndex];
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging || event.button!=0)
      return;
    if (highlightedPlaneIndex<0)
      return;
    room.sendCustomEvent(CustomEventType.RemovePlane, highlightedPlaneIndex, 0);
    highlightedPlaneIndex = -1;
    highlightedPlaneObj = null;
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (!highlightedPlaneObj)
      return;
    var origin = renderer.getOrigin(), zoomCoeff = renderer.getActualZoomCoefficient();
    ctx.save();
    ctx.resetTransform();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(zoomCoeff, zoomCoeff);
    ctx.translate(-origin.x, -origin.y);
    renderer.drawPlane(highlightedPlaneObj);
    ctx.restore();
  }
}

function RemoveDiscTool(){
  ZoomPanTool.apply(this, ["RemoveDisc", true]);
  var thisTool = this;
  var highlightedDiscIndex = -1, highlightedDiscObj = null;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  const { Query } = API;

  this.initialize = function(){
    zoomPan_initialize();
    highlightedDiscIndex = -1;
    highlightedDiscObj = null;
    eStatusMessage.innerText = "Select disc to remove...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    highlightedDiscIndex = -1;
    highlightedDiscObj = null;
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    highlightedDiscIndex = thisTool.discIndexAtCoord;
    highlightedDiscObj = room.gameState.physicsState.discs[highlightedDiscIndex];
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging || event.button!=0)
      return;
    if (highlightedDiscIndex<=0 || highlightedDiscObj?.playerId!=null)
      return;
    room.sendCustomEvent(CustomEventType.RemoveDisc, highlightedDiscIndex, 0);
    highlightedDiscIndex = -1;
    highlightedDiscObj = null;
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (!highlightedDiscObj)
      return;
    var center = renderer.transformMapCoordToPixelCoord(highlightedDiscObj.pos.x, highlightedDiscObj.pos.y, false);
    var radius = renderer.transformMapDistanceToPixelDistance(highlightedDiscObj.radius);
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#bbbb66";
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
    ctx.stroke();
    ctx.restore();
  }
}

function RemoveJointTool(){
  ZoomPanTool.apply(this, ["RemoveJoint", true]);
  var thisTool = this;
  var highlightedJointIndex = -1, highlightedJointObj = null;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  const { Query } = API;

  this.initialize = function(){
    zoomPan_initialize();
    highlightedJointIndex = -1;
    highlightedJointObj = null;
    eStatusMessage.innerText = "Select joint to remove...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    highlightedJointIndex = -1;
    highlightedJointObj = null;
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    var threshold = renderer.transformPixelDistanceToMapDistance(5);
    highlightedJointIndex = Query.getJointIndexAtMapCoord(room.state, thisTool.movedMapCoord, threshold);
    highlightedJointObj = room.gameState.physicsState.joints[highlightedJointIndex];
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging || event.button!=0)
      return;
    if (highlightedJointIndex<0)
      return;
    room.sendCustomEvent(CustomEventType.RemoveJoint, highlightedJointIndex, 0);
    highlightedJointIndex = -1;
    highlightedJointObj = null;
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (!highlightedJointObj)
      return;
    var origin = renderer.getOrigin(), zoomCoeff = renderer.getActualZoomCoefficient();
    ctx.save();
    ctx.resetTransform();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(zoomCoeff, zoomCoeff);
    ctx.translate(-origin.x, -origin.y);
    renderer.drawJoint(highlightedJointObj, room.gameState.physicsState.discs);
    ctx.restore();
  }
}

function RemoveSpawnPointTool(){
  ZoomPanTool.apply(this, ["RemoveSpawnPoint", true]);
  var thisTool = this;
  var highlightedSpawnPointIndex = -1, highlightedSpawnPointTeam = -1, highlightedSpawnPointPos = null;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;
  const { Query } = API;

  this.initialize = function(){
    zoomPan_initialize();
    highlightedSpawnPointIndex = -1;
    highlightedSpawnPointTeam = -1;
    highlightedSpawnPointPos = null;
    eStatusMessage.innerText = "Select spawn point to remove...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    highlightedSpawnPointIndex = -1;
    highlightedSpawnPointTeam = -1;
    highlightedSpawnPointPos = null;
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    var threshold = renderer.transformPixelDistanceToMapDistance(15);
    [highlightedSpawnPointIndex, highlightedSpawnPointTeam] = Query.getSpawnPointIndexAtMapCoord(room.state, thisTool.movedMapCoord, threshold);
    var arr = (highlightedSpawnPointTeam==1) ? room.gameState.stadiumstadium.redSpawnPoints : room.gameState.stadium.blueSpawnPoints;
    highlightedSpawnPointPos = arr[highlightedSpawnPointIndex];
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging || event.button!=0)
      return;
    if (highlightedSpawnPointIndex<0)
      return;
    room.sendCustomEvent(CustomEventType.RemoveSpawnPoint, {
      idx: highlightedSpawnPointIndex,
      team: (highlightedSpawnPointTeam==1) ? "red" : "blue"
    }, 0);
    highlightedSpawnPointIndex = -1;
    highlightedSpawnPointTeam = -1;
    highlightedSpawnPointPos = null;
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    if (!highlightedSpawnPointPos)
      return;
    var center = renderer.transformMapCoordToPixelCoord(highlightedSpawnPointPos.x, highlightedSpawnPointPos.y, false);
    var radius = renderer.transformMapDistanceToPixelDistance(15);
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#bbbb66";
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
    ctx.stroke();
    ctx.restore();
  };
}

function RemovePlayerTool(){
  ZoomPanTool.apply(this, ["RemovePlayer", true]);
  var thisTool = this;
  var highlightedPlayerIndex = -1, highlightedPlayerObj = null;
  var zoomPan_initialize = this.initialize, zoomPan_finalize = this.finalize, zoomPan_onMouseDown = this.onMouseDown, zoomPan_onMouseUp = this.onMouseUp, zoomPan_onMouseMove = this.onMouseMove, zoomPan_onWheel = this.onWheel, zoomPan_onKeyDown = this.onKeyDown, zoomPan_onKeyUp = this.onKeyUp, zoomPan_onRequestAnimationFrame = this.onRequestAnimationFrame;

  this.initialize = function(){
    zoomPan_initialize();
    highlightedPlayerIndex = -1;
    highlightedPlayerObj = null;
    eStatusMessage.innerText = "Select player to remove...";
  }

  this.finalize = function(){
    zoomPan_finalize();
    highlightedPlayerIndex = -1;
    highlightedPlayerObj = null;
  }
  
  this.onMouseDown = function(event){
    zoomPan_onMouseDown(event);
  }
  
  this.onMouseMove = function(event){
    zoomPan_onMouseMove(event);
    var idx = thisTool.discIndexAtCoord, disc = room.gameState.physicsState.discs[idx], playerId = disc?.playerId;
    if (playerId==null){
      highlightedPlayerIndex = -1;
      highlightedPlayerObj = null;
    }
    else{
      var playerObj = room.state.getPlayer(playerId);
      if (playerObj){
        highlightedPlayerIndex = playerId;
        highlightedPlayerObj = playerObj;
      }
      else{
        highlightedPlayerIndex = -1;
        highlightedPlayerObj = null;
      }
    }
  }
  
  this.onWheel = function(event){
    zoomPan_onWheel(event);
  }
  
  this.onKeyDown = function(event){
    zoomPan_onKeyDown(event);
  }
  
  this.onKeyUp = function(event){
    zoomPan_onKeyUp(event);
  }

  this.onMouseUp = function(event){
    var { isDragging } = thisTool;
    zoomPan_onMouseUp(event);
    if (isDragging || event.button!=0)
      return;
    if (highlightedPlayerIndex<=0)
      return;
    room.sendCustomEvent(CustomEventType.RemovePlayer, highlightedPlayerIndex, 0);
    highlightedPlayerIndex = -1;
    highlightedPlayerObj = null;
  };

  this.onRequestAnimationFrame = function(ctx){
    zoomPan_onRequestAnimationFrame(ctx);
    var disc = highlightedPlayerObj?.disc;
    if (!disc)
      return;
    var center = renderer.transformMapCoordToPixelCoord(disc.pos.x, disc.pos.y, false);
    var radius = renderer.transformMapDistanceToPixelDistance(disc.radius);
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#bbbb66";
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
    ctx.stroke();
    ctx.restore();
  }
}

function updatePlayerPhysicsDialogContents(){
  var { radiusRow, gravityRow, invMassRow, bCoefRow, cGroupRow, dampingRow, kickingDampingRow, accelerationRow, kickingAccelerationRow, kickStrengthRow, kickbackRow } = dialogContents.playerPhysics;
  var obj = room.gameState?.stadium.playerPhysics;
  if (!obj)
    return;
  radiusRow.setValue(obj.radius);
  gravityRow.setValue("["+obj.gravity.x+", "+obj.gravity.y+"]");
  invMassRow.setValue(obj.invMass);
  bCoefRow.setValue(obj.bCoef);
  cGroupRow.setValue(obj.cGroup);
  dampingRow.setValue(obj.damping);
  kickingDampingRow.setValue(obj.kickingDamping);
  accelerationRow.setValue(obj.acceleration);
  kickingAccelerationRow.setValue(obj.kickingAcceleration);
  kickStrengthRow.setValue(obj.kickStrength);
  kickbackRow.setValue(obj.kickback);
}

function onPlayerPhysicsValueChanged(){
  var { radiusRow, gravityRow, invMassRow, bCoefRow, cGroupRow, dampingRow, kickingDampingRow, accelerationRow, kickingAccelerationRow, kickStrengthRow, kickbackRow } = dialogContents.playerPhysics;
  room.sendCustomEvent(CustomEventType.UpdatePlayerPhysics, {
    radius: radiusRow.getValue(),
    gravity: gravityRow.getValue(),
    invMass: invMassRow.getValue(),
    bCoef: bCoefRow.getValue(),
    cGroup: cGroupRow.getValue(),
    damping: dampingRow.getValue(),
    kickingDamping: kickingDampingRow.getValue(),
    acceleration: accelerationRow.getValue(),
    kickingAcceleration: kickingAccelerationRow.getValue(),
    kickStrength: kickStrengthRow.getValue(),
    kickback: kickbackRow.getValue()
  }, 0);
}

function updateBgDialogContents(){
  var { typeRow, widthRow, heightRow, kickOffRadiusRow, cornerRadiusRow, colorRow, goalLineRow } = dialogContents.bg;
  var obj = room.gameState?.stadium;
  if (!obj)
    return;
  typeRow.setValue((obj.bgType==1) ? "grass" : ((obj.bgType==2) ? "hockey" : "none"));
  widthRow.setValue(obj.bgWidth);
  heightRow.setValue(obj.bgHeight);
  kickOffRadiusRow.setValue(obj.bgKickOffRadius);
  cornerRadiusRow.setValue(obj.bgCornerRadius);
  colorRow.setValue(obj.bgColor);
  goalLineRow.setValue(obj.bgGoalLine);
}

function onBgValueChanged(){
  var { typeRow, widthRow, heightRow, kickOffRadiusRow, cornerRadiusRow, colorRow, goalLineRow } = dialogContents.bg;
  room.sendCustomEvent(CustomEventType.UpdateBg, {
    type: typeRow.getValue(),
    width: widthRow.getValue(),
    height: heightRow.getValue(),
    kickOffRadius: kickOffRadiusRow.getValue(),
    cornerRadius: cornerRadiusRow.getValue(),
    color: colorRow.getValue(),
    goalLine: goalLineRow.getValue()
  }, 0);
}

function updateGeneralDialogContents(){
  var { nameRow, widthRow, heightRow, maxViewWidthRow, cameraFollowRow, spawnDistanceRow, kickOffResetRow, canBeStoredRow } = dialogContents.general;
  var obj = room.gameState?.stadium;
  if (!obj)
    return;
  nameRow.setValue(obj.name);
  widthRow.setValue(obj.width);
  heightRow.setValue(obj.height);
  maxViewWidthRow.setValue(obj.maxViewWidth);
  cameraFollowRow.setValue(obj.cameraFollow);
  spawnDistanceRow.setValue(obj.spawnDistance);
  kickOffResetRow.setValue(obj.fullKickOffReset);
  canBeStoredRow.setValue(obj.canBeStored);
}

function onGeneralValueChanged(){
  var { nameRow, widthRow, heightRow, maxViewWidthRow, cameraFollowRow, spawnDistanceRow, kickOffResetRow, canBeStoredRow } = dialogContents.general;
  room.sendCustomEvent(CustomEventType.UpdateGeneral, {
    name: nameRow.getValue(),
    width: widthRow.getValue(),
    height: heightRow.getValue(),
    maxViewWidth: maxViewWidthRow.getValue(),
    cameraFollow: cameraFollowRow.getValue(),
    spawnDistance: spawnDistanceRow.getValue(),
    kickOffReset: kickOffResetRow.getValue(),
    canBeStored: canBeStoredRow.getValue()
  }, 0);
}

function initTools(){
  function InputRow(element, labelText, variableType, defaultValue){
    var elem = document.createElement("div");
    elem.className = "inputRow";
    var label = document.createElement("label"), input;
    label.innerText = labelText + " :";
    elem.appendChild(label);
    this.value = defaultValue;
    var that = this;
    switch(variableType){
      case VariableType.Boolean:{
        input = document.createElement("input");
        input.type = "checkbox";
        that.value = input.checked = defaultValue;
        input.addEventListener("change", (e) => {
          that.value = e.target.checked;
          that.onValueChanged && that.onValueChanged(that.getValue());
        });
        elem.appendChild(input);
        break;
      }
      case VariableType.Integer:{
        input = document.createElement("input");
        input.type = "number";
        input.value = defaultValue;
        that.value = (defaultValue=="") ? null : parseInt(defaultValue);
        if (!isFinite(that.value))
          input.type = "text";
        input.value = defaultValue;
        input.addEventListener("input", (e) => {
          var f = parseInt(e.target.value);
          if (isNaN(f)){
            e.target.type = "text";
            e.target.value = "";
          }
          that.value = f;
          that.onValueChanged && that.onValueChanged(that.getValue());
        });
        input.addEventListener("focus", (e) => {
          that.onFocusChanged && that.onFocusChanged(true);
        });
        input.addEventListener("blur", (e) => {
          if (!e.relatedTarget){
            //input.focus();
            return;
          }
          that.onFocusChanged && that.onFocusChanged(false);
        });
        elem.appendChild(input);
        break;
      }
      case VariableType.Number:{
        input = document.createElement("input");
        input.type = "number";
        input.value = defaultValue;
        that.value = (defaultValue=="") ? null : parseFloat(defaultValue);
        if (!isFinite(that.value))
          input.type = "text";
        input.value = defaultValue;
        input.addEventListener("input", (e) => {
          var f = parseFloat(e.target.value);
          if (isNaN(f)){
            e.target.type = "text";
            if (e.target.value!="")
              e.target.value = "Infinity";
          }
          that.value = f;
          that.onValueChanged && that.onValueChanged(that.getValue());
        });
        input.addEventListener("focus", (e) => {
          that.onFocusChanged && that.onFocusChanged(true);
        });
        input.addEventListener("blur", (e) => {
          if (!e.relatedTarget){
            //input.focus();
            return;
          }
          that.onFocusChanged && that.onFocusChanged(false);
        });
        elem.appendChild(input);
        break;
      }
      case VariableType.CollisionFlags:{
        input = document.createElement("input");
        input.type = "number";
        that.value = input.value = defaultValue;
        input.picker = new CollisionFlagsPicker(input);
        input.picker.onInput = function(){
          that.onValueChanged && that.onValueChanged(that.getValue());
        };
        elem.appendChild(input);
        break;
      }
      case VariableType.Color:{
        input = document.createElement("input");
        input.type = "text";
        input.picker = new JSColor(input, {
          alphaChannel: false,
          position: "right",
          format: "rgb",
          hash: false,
          value: API.Utils.numberToColor(defaultValue),
          onInput: function(){
            that.value = API.Utils.colorToNumber(this.toRGBString());
            that.onValueChanged && that.onValueChanged(that.getValue());
          }
        });
        elem.appendChild(input);
        break;
      }
      case VariableType.Coordinate:{
        input = document.createElement("input");
        input.type = "text";
        var regexp = /\[[ \t]*((-?(([1-9][0-9]*)|(0))(?:\.[0-9]+)?)|NaN|-?Infinity)[ \t]*,[ \t]*((-?(([1-9][0-9]*)|(0))(?:\.[0-9]+)?)|NaN|-?Infinity)[ \t]*\]/;
        var regexp2 = /[\d\-\. \,\[\]]|Alt|Arrow|Home|End|Page|Space|Backspace|Delete/;
        that.checkCoordinateInput = function(v){
          var arr = v.match(regexp);
          if (!arr || arr.length!=11){
            if (v=="")
              input.value="";
            that.value = null;
            that.onValueChanged && that.onValueChanged(that.getValue());
            return true;
          }
          input.value = "["+arr[1]+", "+arr[6]+"]";
          that.value = [parseFloat(arr[1]), parseFloat(arr[6])];
          that.onValueChanged && that.onValueChanged(that.getValue());
        };
        input.value = defaultValue;
        that.checkCoordinateInput(JSON.stringify(defaultValue));
        input.addEventListener("keydown", (e)=>{
          if (e.key.match(regexp2))
            return;
          e.preventDefault();
          var v = e.target.value, pos = e.target.selectionStart, pos2 = pos;
          if (e.key=="i" || e.key=="I"){
            v = v.substring(0, pos)+"Infinity"+v.substring(pos);
            pos2 += 8;
          }
          else if (e.key=="n" || e.key=="N"){
            v = v.substring(0, pos)+"NaN"+v.substring(pos);
            pos2 += 3;
          }
          if (that.checkCoordinateInput(v))
            return;
          e.target.selectionStart = pos2;
          e.target.selectionEnd = pos2;
        });
        input.addEventListener("input", (e) => {
          that.checkCoordinateInput(e.target.value);
        });
        input.addEventListener("focus", (e) => {
          that.onFocusChanged && that.onFocusChanged(true);
        });
        input.addEventListener("blur", (e) => {
          if (!e.relatedTarget){
            //input.focus();
            return;
          }
          that.onFocusChanged && that.onFocusChanged(false);
        });
        elem.appendChild(input);
        break;
      }
      case VariableType.String:{
        input = document.createElement("input");
        input.type = "text";
        that.value = input.value = defaultValue;
        input.addEventListener("change", (e) => {
          that.value = e.target.value;
          that.onValueChanged && that.onValueChanged(that.getValue());
        });
        input.addEventListener("focus", (e) => {
          that.onFocusChanged && that.onFocusChanged(true);
        });
        input.addEventListener("blur", (e) => {
          if (!e.relatedTarget){
            //input.focus();
            return;
          }
          that.onFocusChanged && that.onFocusChanged(false);
        });
        elem.appendChild(input);
        break;
      }
      case VariableType.Team:
      case VariableType.TeamWithSpec:{
        input = document.createElement("select");
        var o1 = document.createElement("option");
        o1.innerText = "red";
        var o2 = document.createElement("option");
        o2.innerText = "blue";
        if (variableType==VariableType.TeamWithSpec){
          var o0 = document.createElement("option");
          o0.innerText = "spec";
          input.appendChild(o0);
        }
        input.appendChild(o1);
        input.appendChild(o2);
        that.value = input.value = defaultValue;
        input.addEventListener("change", (e) => {
          that.value = e.target.value;
          that.onValueChanged && that.onValueChanged(that.getValue());
        });
        elem.appendChild(input);
        break;
      }
      case VariableType.BgType:{
        input = document.createElement("select");
        var o1 = document.createElement("option");
        o1.innerText = "none";
        var o2 = document.createElement("option");
        o2.innerText = "grass";
        var o3 = document.createElement("option");
        o3.innerText = "hockey";
        input.appendChild(o1);
        input.appendChild(o2);
        input.appendChild(o3);
        that.value = (defaultValue=="grass" ? 1 : (defaultValue=="hockey" ? 2 : 0));
        input.value = (that.value==1 ? "grass" : (that.value==2 ? "hockey" : "none"));
        input.addEventListener("change", (e) => {
          that.value = (input.value=="grass" ? 1 : (input.value=="hockey" ? 2 : 0));
          that.onValueChanged && that.onValueChanged(that.getValue());
        });
        elem.appendChild(input);
        break;
      }
      case VariableType.CameraFollow:{
        input = document.createElement("select");
        var o1 = document.createElement("option");
        o1.innerText = "";
        var o2 = document.createElement("option");
        o2.innerText = "player";
        input.appendChild(o1);
        input.appendChild(o2);
        that.value = (defaultValue=="player" ? 1 : 0);
        input.value = (that.value==1 ? "player" : "");
        input.addEventListener("change", (e) => {
          that.value = (e.target.value=="player"?1:0);
          that.onValueChanged && that.onValueChanged(that.getValue());
        });
        elem.appendChild(input);
        break;
      }
      case VariableType.KickOffReset:{
        input = document.createElement("select");
        var o1 = document.createElement("option");
        o1.innerText = "partial";
        var o2 = document.createElement("option");
        o2.innerText = "full";
        input.appendChild(o1);
        input.appendChild(o2);
        that.value = input.value = defaultValue;
        input.addEventListener("change", (e) => {
          that.value = (e.target.value=="full");
          that.onValueChanged && that.onValueChanged(that.getValue());
        });
        elem.appendChild(input);
        break;
      }
      case VariableType.Flag:{
        input = document.createElement("div");
        makeFlagSelector(countries, input, ()=>{
          that.value = input.value;
          that.onValueChanged && that.onValueChanged(that.getValue());
        });
        that.value = input.value = defaultValue;
        elem.appendChild(input);
        this.hidePopup = function(){
          input.setPopupVisibility(false);
        };
        break;
      }
    }
    if (variableType==VariableType.Flag)
      input.style.width = "calc(50% - 7px)";
    else
      input.style.width = "calc(50% - 5px)";
    element.appendChild(elem);
    this.getValue = ()=>{
      if (variableType==VariableType.Boolean)
        return input.checked;
      if (variableType==VariableType.Color || variableType==VariableType.Team || variableType==VariableType.TeamWithSpec || variableType==VariableType.Coordinate || variableType==VariableType.BgType || variableType==VariableType.CameraFollow || variableType==VariableType.KickOffReset || variableType==VariableType.String || variableType==VariableType.Flag)
        return that.value;
      if (variableType==VariableType.Integer){
        var v = parseInt(input.value);
        if (isNaN(v) && input.value!="")
          return null;
        return v;
      }
      var v = parseFloat(input.value);
      if (isNaN(v) && input.value!="")
        return Infinity;
      return v;
    };
    this.setValue = (value)=>{
      if (that.value===value)
        return;
      if (variableType==VariableType.Boolean){
        that.value = input.checked = value;
        return;
      }
      if (variableType==VariableType.Coordinate){
        that.checkCoordinateInput(value);
        return;
      }
      if (variableType==VariableType.BgType){
        that.value = (value=="grass" ? 1 : (value=="hockey" ? 2 : 0));
        input.value = (that.value==1 ? "grass" : (that.value==2 ? "hockey" : "none"));
        return;
      }
      if (variableType==VariableType.CameraFollow){
        that.value = (value=="player" ? 1 : 0);
        input.value = (that.value==1 ? "player" : "");
        return;
      }
      if (variableType==VariableType.KickOffReset){
        that.value = (value=="full");
        input.value = (that.value ? "full" : "partial");
        return;
      }
      if (variableType==VariableType.Color){
        that.value = value;
        input.picker.processValueInput(API.Utils.numberToColor(value));
      }
      else{
        that.value = input.value = value;
      }
    };
    this.defaultValue = defaultValue;
  }
  dialogContents = {
    addVertex: document.createElement("div"),
    addSegment: document.createElement("div"),
    addGoal: document.createElement("div"),
    addPlane: document.createElement("div"),
    addDisc: document.createElement("div"),
    addJoint: document.createElement("div"),
    addSpawnPoint: document.createElement("div"),
    addPlayer: document.createElement("div"),
    general: document.createElement("div"),
    bg: document.createElement("div"),
    playerPhysics: document.createElement("div")
  };
  Object.keys(dialogContents).forEach((x)=>{
    dialogContents[x].remove();
  });
  
  var current = dialogContents.addVertex;
  current.xRow = new InputRow(current, "x", VariableType.Number, "");
  current.yRow = new InputRow(current, "y", VariableType.Number, "");
  current.bCoefRow = new InputRow(current, "bCoef", VariableType.Number, 1);
  current.cMaskRow = new InputRow(current, "cMask", VariableType.CollisionFlags, 63);
  current.cGroupRow = new InputRow(current, "cGroup", VariableType.CollisionFlags, 32);

  current = dialogContents.addSegment;
  current.v0Row = new InputRow(current, "v0", VariableType.Integer, "");
  current.v1Row = new InputRow(current, "v1", VariableType.Integer, "");
  current.curveRow = new InputRow(current, "curve", VariableType.Number, 0);
  current.colorRow = new InputRow(current, "color", VariableType.Color, 0);
  current.biasRow = new InputRow(current, "bias", VariableType.Number, 0);
  current.visRow = new InputRow(current, "vis", VariableType.Boolean, true);
  current.bCoefRow = new InputRow(current, "bCoef", VariableType.Number, 1);
  current.cMaskRow = new InputRow(current, "cMask", VariableType.CollisionFlags, 63);
  current.cGroupRow = new InputRow(current, "cGroup", VariableType.CollisionFlags, 32);

  current = dialogContents.addGoal;
  current.p0Row = new InputRow(current, "p0", VariableType.Coordinate, "");
  current.p1Row = new InputRow(current, "p1", VariableType.Coordinate, "");
  current.teamRow = new InputRow(current, "team", VariableType.Team, "red");

  current = dialogContents.addPlane;
  current.normalRow = new InputRow(current, "normal", VariableType.Coordinate, "");
  current.distRow = new InputRow(current, "dist", VariableType.Number, "");
  current.bCoefRow = new InputRow(current, "bCoef", VariableType.Number, 1);
  current.cMaskRow = new InputRow(current, "cMask", VariableType.CollisionFlags, 63);
  current.cGroupRow = new InputRow(current, "cGroup", VariableType.CollisionFlags, 32);

  current = dialogContents.addDisc;
  current.posRow = new InputRow(current, "pos", VariableType.Coordinate, "");
  current.radiusRow = new InputRow(current, "radius", VariableType.Number, 10);
  current.speedRow = new InputRow(current, "speed", VariableType.Coordinate, [0, 0]);
  current.gravityRow = new InputRow(current, "gravity", VariableType.Coordinate, [0, 0]);
  current.invMassRow = new InputRow(current, "invMass", VariableType.Number, 1);
  current.dampingRow = new InputRow(current, "damping", VariableType.Number, 0.99);
  current.colorRow = new InputRow(current, "color", VariableType.Color, 16777215);
  current.bCoefRow = new InputRow(current, "bCoef", VariableType.Number, 0.5);
  current.cMaskRow = new InputRow(current, "cMask", VariableType.CollisionFlags, 63);
  current.cGroupRow = new InputRow(current, "cGroup", VariableType.CollisionFlags, 63);

  current = dialogContents.addJoint;
  current.d0Row = new InputRow(current, "d0", VariableType.Integer, "");
  current.d1Row = new InputRow(current, "d1", VariableType.Integer, "");
  current.strengthRow = new InputRow(current, "strength", VariableType.Number, "Infinity");
  current.lengthRow = new InputRow(current, "length", VariableType.Coordinate, [100, 100]);
  current.colorRow = new InputRow(current, "color", VariableType.Color, 0);

  var current = dialogContents.addSpawnPoint;
  current.xRow = new InputRow(current, "x", VariableType.Number, "");
  current.yRow = new InputRow(current, "y", VariableType.Number, "");
  current.teamRow = new InputRow(current, "team", VariableType.Team, "red");

  current = dialogContents.addPlayer;
  current.posRow = new InputRow(current, "pos", VariableType.Coordinate, "");
  current.radiusRow = new InputRow(current, "radius", VariableType.Number, 10);
  current.speedRow = new InputRow(current, "speed", VariableType.Coordinate, [0, 0]); 
  current.gravityRow = new InputRow(current, "gravity", VariableType.Coordinate, [0, 0]);
  current.invMassRow = new InputRow(current, "invMass", VariableType.Number, 1);
  current.dampingRow = new InputRow(current, "damping", VariableType.Number, 0.99);
  current.bCoefRow = new InputRow(current, "bCoef", VariableType.Number, 0.5);
  current.cMaskRow = new InputRow(current, "cMask", VariableType.CollisionFlags, 63);
  current.cGroupRow = new InputRow(current, "cGroup", VariableType.CollisionFlags, 63);
  current.nameRow = new InputRow(current, "name", VariableType.String, "abc");
  current.avatarRow = new InputRow(current, "avatar", VariableType.String, "XX");
  current.flagRow = new InputRow(current, "flag", VariableType.Flag, "tr");
  current.teamRow = new InputRow(current, "team", VariableType.TeamWithSpec, "red");

  current = dialogContents.playerPhysics;
  current.radiusRow = new InputRow(current, "radius", VariableType.Number, 15);
  current.radiusRow.onValueChanged = onPlayerPhysicsValueChanged;
  current.gravityRow = new InputRow(current, "gravity", VariableType.Coordinate, [0, 0]);
  current.gravityRow.onValueChanged = onPlayerPhysicsValueChanged;
  current.invMassRow = new InputRow(current, "invMass", VariableType.Number, 0.5);
  current.invMassRow.onValueChanged = onPlayerPhysicsValueChanged;
  current.bCoefRow = new InputRow(current, "bCoef", VariableType.Number, 0.5);
  current.bCoefRow.onValueChanged = onPlayerPhysicsValueChanged;
  current.cGroupRow = new InputRow(current, "cGroup", VariableType.CollisionFlags, 0);
  current.cGroupRow.onValueChanged = onPlayerPhysicsValueChanged;
  current.dampingRow = new InputRow(current, "damping", VariableType.Number, 0.96);
  current.dampingRow.onValueChanged = onPlayerPhysicsValueChanged;
  current.kickingDampingRow = new InputRow(current, "kickingDamping", VariableType.Number, 0.96);
  current.kickingDampingRow.onValueChanged = onPlayerPhysicsValueChanged;
  current.accelerationRow = new InputRow(current, "acceleration", VariableType.Number, 0.1);
  current.accelerationRow.onValueChanged = onPlayerPhysicsValueChanged;
  current.kickingAccelerationRow = new InputRow(current, "kickingAcceleration", VariableType.Number, 0.07);
  current.kickingAccelerationRow.onValueChanged = onPlayerPhysicsValueChanged;
  current.kickStrengthRow = new InputRow(current, "kickStrength", VariableType.Number, 5);
  current.kickStrengthRow.onValueChanged = onPlayerPhysicsValueChanged;
  current.kickbackRow = new InputRow(current, "kickback", VariableType.Number, 0);
  current.kickbackRow.onValueChanged = onPlayerPhysicsValueChanged;

  current = dialogContents.bg;
  current.typeRow = new InputRow(current, "type", VariableType.BgType, "none");
  current.typeRow.onValueChanged = onBgValueChanged;
  current.widthRow = new InputRow(current, "width", VariableType.Number, 0);
  current.widthRow.onValueChanged = onBgValueChanged;
  current.heightRow = new InputRow(current, "height", VariableType.Number, 0);
  current.heightRow.onValueChanged = onBgValueChanged;
  current.kickOffRadiusRow = new InputRow(current, "kickOffRadius", VariableType.Number, 0);
  current.kickOffRadiusRow.onValueChanged = onBgValueChanged;
  current.cornerRadiusRow = new InputRow(current, "cornerRadius", VariableType.Number, 0);
  current.cornerRadiusRow.onValueChanged = onBgValueChanged;
  current.colorRow = new InputRow(current, "color", VariableType.Color, 7441498);
  current.colorRow.onValueChanged = onBgValueChanged;
  current.goalLineRow = new InputRow(current, "goalLine", VariableType.Number, 0);
  current.goalLineRow.onValueChanged = onBgValueChanged;
  
  current = dialogContents.general;
  current.nameRow = new InputRow(current, "name", VariableType.String, "");
  current.nameRow.onValueChanged = onGeneralValueChanged;
  current.widthRow = new InputRow(current, "width", VariableType.Number, 0);
  current.widthRow.onValueChanged = onGeneralValueChanged;
  current.heightRow = new InputRow(current, "height", VariableType.Number, 0);
  current.heightRow.onValueChanged = onGeneralValueChanged;
  current.maxViewWidthRow = new InputRow(current, "maxViewWidth", VariableType.Number, 0);
  current.maxViewWidthRow.onValueChanged = onGeneralValueChanged;
  current.cameraFollowRow = new InputRow(current, "cameraFollow", VariableType.CameraFollow, "");
  current.cameraFollowRow.onValueChanged = onGeneralValueChanged;
  current.spawnDistanceRow = new InputRow(current, "spawnDistance", VariableType.Number, 0);
  current.spawnDistanceRow.onValueChanged = onGeneralValueChanged;
  current.kickOffResetRow = new InputRow(current, "kickOffReset", VariableType.KickOffReset, "partial");
  current.kickOffResetRow.onValueChanged = onGeneralValueChanged;
  current.canBeStoredRow = new InputRow(current, "canBeStored", VariableType.Boolean, true);
  current.canBeStoredRow.onValueChanged = onGeneralValueChanged;
  
  addTool(new SelectTool());
  addTool(new AddVertexTool());
  addTool(new AddSegmentTool());
  addTool(new AddGoalTool());
  addTool(new AddPlaneTool());
  addTool(new AddDiscTool());
  addTool(new AddJointTool());
  addTool(new AddSpawnPointTool());
  addTool(new AddPlayerTool());
  addTool(new UpdateVertexTool());
  addTool(new UpdateSegmentTool());
  addTool(new UpdateGoalTool());
  addTool(new UpdatePlaneTool());
  addTool(new UpdateDiscTool());
  addTool(new UpdateJointTool());
  addTool(new UpdateSpawnPointTool());
  addTool(new UpdatePlayerTool());
  addTool(new RemoveVertexTool());
  addTool(new RemoveSegmentTool());
  addTool(new RemoveGoalTool());
  addTool(new RemovePlaneTool());
  addTool(new RemoveDiscTool());
  addTool(new RemoveJointTool());
  addTool(new RemoveSpawnPointTool());
  addTool(new RemovePlayerTool());
  toolIndices.forEach((indices, idx)=>{
    indices.forEach((idx2)=>{
      tools[idx2].menuElement = toolsMenuElements[idx];
    });
  });
  setCurrentTool(tools[0]);
}

function makeDialog(title){
  var element = document.createElement("div");
  element.className = "dialog";
  var eTitleBar = document.createElement("div");
  eTitleBar.className = "dialogtitlebar";
  element.appendChild(eTitleBar);
  var eContents = document.createElement("div");
  eContents.className = "dialogcontents";
  element.appendChild(eContents);
  var eTitle = document.createElement("div");
  eTitle.className = "dialogtitle";
  eTitle.innerText = title;
  eTitleBar.appendChild(eTitle);
  var eClose = document.createElement("button");
  eClose.className = "button red";
  eClose.innerText = "X";
  eTitleBar.appendChild(eClose);
  var eTitleBar = element.children.item(0);
  var eTitle = eTitleBar.children.item(0);
  var eClose = eTitleBar.children.item(1);
  var eContents = element.children.item(1);
  var obj, dragCoords = null;
  var size = {
    x: 400,
    y: 300
  };
  var coords = {
    x: (window.innerWidth - size.x)/2,
    y: (window.innerHeight - size.y)/2
  };
  function adjustSize(newSize){
    if (!newSize)
      return;
    if (newSize.hasOwnProperty("minx"))
      element.style["min-width"] = size.x+"px";
    if (newSize.hasOwnProperty("miny"))
      element.style["min-height"] = size.y+"px";
    if (newSize.hasOwnProperty("x")){
      size.x = newSize.x;
      element.style["max-width"] = size.x+"px";
    }
    if (newSize.hasOwnProperty("y")){
      size.y = newSize.y;
      element.style["max-height"] = size.y+"px";
    }
  }
  eClose.onclick = ()=>{
    obj.setVisible(false);
    obj.onClose && obj.onClose();
  };
  element.onmousedown = (event)=>{
    dragCoords = {
      x: event.pageX, 
      y: event.pageY
    };
  };
  element.onmousemove = (event)=>{
    if (!dragCoords)
      return;
    coords.x += event.pageX - dragCoords.x;
    coords.y += event.pageY - dragCoords.y;
    element.style.left = coords.x;
    element.style.top = coords.y;
    dragCoords = {
      x: event.pageX, 
      y: event.pageY
    };
  };
  element.onmouseup = (event)=>{
    dragCoords = null;
  };
  element.onmouseleave = (event)=>{
    dragCoords = null;
  };
  obj = {
    element: element,
    setVisible: (visible, newSize)=>{
      element.style.visibility=visible?"visible":"hidden";
      if (visible){
        element.style.left = coords.x;
        element.style.top = coords.y;
      }
      adjustSize(newSize);
    },
    setTitle: (title)=>{
      eTitle.innerText = title;
    },
    getContentsElement: ()=>{
      return eContents;
    },
    isVisible: ()=>{
      return (element.style.visibility=="visible");
    }
  };
  return obj;
}

function makeCollisionMaskPicker(collisionMaskPicker){
  var element, elements = [];
  CollisionFlags.forEach((flagName, idx)=>{
    if (idx==0)
      return;
    element = document.createElement("span");
    element.innerText = flagName;
    collisionMaskPicker.appendChild(element);
    elements.push(element);
  });
  var allElement = document.createElement("span");
  allElement.innerText = "ALL";
  collisionMaskPicker.appendChild(allElement);
  elements.forEach((element)=>{
    element.onmousedown = function(event){
      event.target.classList.toggle("active");
      var val = elements.reduce((prev, e)=>{
        var active = e.classList.contains("active");
        prev.allActive &&= active;
        if (active)
          prev.val |= prev.pow;
        prev.pow <<= 1;
        return prev;
      }, {allActive: true, val: 0, pow: 1});
      if (val.allActive)
        allElement.classList.add("active");
      else
        allElement.classList.remove("active");
      collisionMaskPicker.value = val.val;
      collisionMaskPicker.onValueChange && collisionMaskPicker.onValueChange(collisionMaskPicker.value);
    };
  });
  allElement.onmousedown = function(){
    allElement.classList.toggle("active");
    var allActive = allElement.classList.contains("active");
    elements.forEach((element)=>{
      if (allActive)
        element.classList.add("active");
      else
        element.classList.remove("active");
    });
    if (allActive)
      collisionMaskPicker.value = -1;
    else
      collisionMaskPicker.value = 0;
    collisionMaskPicker.onValueChange && collisionMaskPicker.onValueChange(collisionMaskPicker.value);
  };
  collisionMaskPicker.applyValue = function(value){
    var val = elements.reduce((prev, e)=>{
      var active = (value&prev.pow)!=0;
      prev.allActive &&= active;
      if (active)
        e.classList.add("active");
      else
        e.classList.remove("active");
      prev.pow <<= 1;
      return prev;
    }, {allActive: true, val: 0, pow: 1});
    if (val.allActive)
      allElement.classList.add("active");
    else
      allElement.classList.remove("active");
  };
}

function CollisionFlagsPicker(inputElement){
  this.inputElement = inputElement;
  var that = this;
  inputElement.onclick = function(){
    var rect = that.inputElement.getBoundingClientRect();
    var x = rect.x+rect.width+5, y = rect.y;
    if (x+375>window.innerWidth)
      x = window.innerWidth-375;
    if (y+157>window.innerHeight)
      y = window.innerHeight-157;
    cmp.style = "display:flex;left:"+x+"px;top:"+y+"px;";
    that.activate();
  };
  inputElement.onblur = function(){
    setTimeout(()=>{
      if (document.activeElement!=cmp){
        cmp.style = "display: none";
        that.deactivate();
      }
      else
        that.inputElement.focus();
    },20);
  };
  inputElement.oninput = function(){
    cmp.applyValue(inputElement.value);
    that.onInput && that.onInput();
  };
  this.activate = function(){
    cmp.applyValue(that.inputElement.value);
    cmp.onValueChange = (value)=>{
      that.inputElement.value = ""+value;
    };
  };
  this.deactivate = function(){
    cmp.onValueChange = null;
  }
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
  cmp = document.getElementById("CollisionFlagsPicker");
  makeCollisionMaskPicker(cmp);
  var tmp = document.getElementsByClassName("canvasSubContainer");
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
  toolDialog = makeDialog("Tool Properties");
  document.body.appendChild(toolDialog.element);
  initToolbars();
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

  initTools();
  var generalDialog = makeDialog("General");
  document.body.appendChild(generalDialog.element);
  generalDialog.getContentsElement().appendChild(dialogContents.general);
  var bgDialog = makeDialog("Background");
  document.body.appendChild(bgDialog.element);
  bgDialog.getContentsElement().appendChild(dialogContents.bg);
  var playerPhysicsDialog = makeDialog("Player Physics");
  document.body.appendChild(playerPhysicsDialog.element);
  playerPhysicsDialog.getContentsElement().appendChild(dialogContents.playerPhysics);
  document.getElementById("mapProperties").onchange = function(event){
    switch(event.target.selectedIndex){
      case 1:
        generalDialog.setVisible(true);
        updateGeneralDialogContents();
        break;
      case 2:
        bgDialog.setVisible(true);
        updateBgDialogContents();
        break;
      case 3:
        playerPhysicsDialog.setVisible(true);
        updatePlayerPhysicsDialogContents();
        break;
    }
    event.target.selectedIndex = 0;
  };

  keyHandler = new GameKeysHandler();
  sound = new Sound();
  var { Team } = API.Impl.Core;
  document.addEventListener("keydown", window.onKeyDown);
  document.addEventListener("keyup", window.onKeyUp);
  document.addEventListener("focusout", keyHandler.reset);
  canvas.addEventListener("mousedown", window.onMouseDown);
  canvas.addEventListener("mouseup", window.onMouseUp);
  canvas.addEventListener("mousemove", window.onMouseMove);
  canvas.addEventListener("wheel", window.onWheel);
  canvas.addEventListener("contextmenu", window.onContextMenu);

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

  //importLibraries(["aimbot"], ()=>{
  importRenderers(["sandboxRenderer"], ()=>{
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
          currentTool.onRequestAnimationFrame && currentTool.onRequestAnimationFrame(ctx);
          counter++;
          if (counter>gameStateGUIUpdateFrameInterval){
            counter=0;
            updateGameStateGUI(room.gameState);
          }
        }
      };
      renderer = new renderers.sandboxRenderer(API, rendererParams);
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
      var callbacks = {
        onPlayerJoin: (playerObj)=>{
          sound.playSound(sound.join);
          currentTool.onPlayerJoin && currentTool.onPlayerJoin(playerObj);
          updateGUI();
        },
        onPlayerLeave: (playerObj, reason, isBanned, byId)=>{
          sound.playSound(sound.leave);
          currentTool.onPlayerLeave && currentTool.onPlayerLeave(playerObj, reason, isBanned, byId);
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
          currentTool.onGamePauseChange && currentTool.onGamePauseChange(paused, byId);
          updateGUI();
        },
        onGameStart: (byId)=>{
          renderer.onGameStart(byId);
          currentTool.onGameStart && currentTool.onGameStart(byId);
          updateGUI();
        },
        onGameEnd: (winningTeamId)=>{
          renderer.onGameEnd(winningTeamId);
          currentTool.onGameEnd && currentTool.onGameEnd(winningTeamId);
        },
        onGameStop: (byId)=>{
          currentTool.onGameStop && currentTool.onGameStop(byId);
          updateGUI();
        },
        onPlayerTeamChange: (id, teamId, byId)=>{
          currentTool.onPlayerTeamChange && currentTool.onPlayerTeamChange(id, teamId, byId);
          updateGUI();
        },
        onCustomEvent: (type, data, byId)=>{
          switch(type){
            case CustomEventType.AddVertex:
              room.state.addVertex(data);
              break;
            case CustomEventType.AddSegment:
              room.state.addSegment(data);
              break;
            case CustomEventType.AddGoal:
              room.state.addGoal(data);
              break;
            case CustomEventType.AddPlane:
              room.state.addPlane(data);
              break;
            case CustomEventType.AddDisc:
              room.state.addDisc(data);
              break;
            case CustomEventType.AddJoint:
              room.state.addJoint(data);
              break;
            case CustomEventType.AddSpawnPoint:
              room.state.addSpawnPoint(data);
              break;
            case CustomEventType.AddPlayer:
              room.state.addPlayer(data);
              menu.update();
              break;
            case CustomEventType.UpdateVertex:
              room.state.updateVertex(data.idx, data.data);
              break;
            case CustomEventType.UpdateSegment:
              room.state.updateSegment(data.idx, data.data);
              break;
            case CustomEventType.UpdateGoal:
              room.state.updateGoal(data.idx, data.data);
              break;
            case CustomEventType.UpdatePlane:
              room.state.updatePlane(data.idx, data.data);
              break;
            case CustomEventType.UpdateDisc:
              room.state.updateDisc(data.idx, data.data);
              break;
            case CustomEventType.UpdateJoint:
              room.state.updateJoint(data.idx, data.data);
              break;
            case CustomEventType.UpdateSpawnPoint:
              room.state.updateSpawnPoint(data.idx, data.team, data.data);
              break;
            case CustomEventType.UpdatePlayer:
              room.state.updatePlayer(data.idx, data.data);
              menu.update();
              break;
            case CustomEventType.RemoveVertex:
              room.state.removeVertex(data);
              break;
            case CustomEventType.RemoveSegment:
              room.state.removeSegment(data);
              break;
            case CustomEventType.RemoveGoal:
              room.state.removeGoal(data);
              break;
            case CustomEventType.RemovePlane:
              room.state.removePlane(data);
              break;
            case CustomEventType.RemoveDisc:
              room.state.removeDisc(data);
              break;
            case CustomEventType.RemoveJoint:
              room.state.removeJoint(data);
              break;
            case CustomEventType.RemoveSpawnPoint:
              room.state.removeSpawnPoint(data.idx, data.team);
              break;
            case CustomEventType.RemovePlayer:
              room.state.removePlayer(data);
              menu.update();
              break;
            case CustomEventType.UpdatePlayerPhysics:
              room.state.updateStadiumPlayerPhysics(data);
              break;
            case CustomEventType.UpdateBg:
              room.state.updateStadiumBg(data);
              break;
            case CustomEventType.UpdateGeneral:
              room.state.updateStadiumGeneral(data);
              break;
          }
        },
        /*
        onPlayerChat: (id, message)=>{},
        onPlayerChatIndicatorChange: (id, value)=>{},
        onAnnouncement: (msg, color, style, _sound)=>{},
        onStadiumChange: (stadium, byId)=>{},
        onPlayerSyncChange: (playerId, value)=>{},
        onAutoTeams: (playerId1, teamId1, playerId2, teamId2, byId)=>{},
        onPlayerAdminChange: (id, isAdmin, byId)=>{},
        onKickRateLimitChange: (min, rate, burst, byId)=>{},
        onScoreLimitChange: (value, byId)=>{},
        onTimeLimitChange: (value, byId)=>{},
        onTeamsLockChange: (value, byId)=>{},
        onPingData: (array)=>{},
        */
        render: renderer.render
      };
      room = API.Room.sandbox(callbacks, sandboxParams);
      //room.librariesMap = {aimbot: new window.libraries.aimbot(API)}
      //room.librariesMap.aimbot.active = true;
      renderer.room = room;
      renderer.initialize();
      room.setTimeLimit(0, 0);
      room.setScoreLimit(0, 0);
      room.startGame(0);
      room.playerJoin(playerIdCounter++, "abc", "tr", "XX", "fakeIP", "fakeAuth");
      initGameMenu();
      initSnapshots();
    }, (err)=>{
      console.log(err);
      alert("Error loading images. Look at console for error details.");
    });
  });
  //});
}

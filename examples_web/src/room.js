var API = null, room = null, roomState = null, Team = null;
var eRoomView = document.getElementsByClassName("room-view").item(0);
var eContainer = eRoomView.children.item(0);
var eRoomName = eContainer.children.item(0);
var eHeaderBtns = eContainer.children.item(1);
var eTeams = eContainer.children.item(2);
var eSettings = eContainer.children.item(3);
var eControls = eContainer.children.item(4);
var eRec = eHeaderBtns.children.item(0);
var eLink = eHeaderBtns.children.item(1);
var eLeave = eHeaderBtns.children.item(2);
var eTeamsTools = eTeams.children.item(0);
var eAuto = eTeamsTools.children.item(0);
var eRand = eTeamsTools.children.item(1);
var eLock = eTeamsTools.children.item(2);
var eReset = eTeamsTools.children.item(3);
var eTimeLimit = eSettings.children.item(0).children.item(1);
var eScoreLimit = eSettings.children.item(1).children.item(1);
var eStadiumName = eSettings.children.item(2).children.item(1);
var ePickStadium = eSettings.children.item(2).children.item(2);
var eStartGame = eControls.children.item(0);
var eStopGame = eControls.children.item(1);
var ePauseGame = eControls.children.item(2);
var ePauseGame = eControls.children.item(2);
var ctxMenu = document.getElementsByClassName("ctxmenu").item(0);
var inputPopup = document.getElementById("inputpopup");

function onKeyDown(event){
  window.parent.onKeyDown(event);
}

function onKeyUp(event){
  window.parent.onKeyUp(event);
}

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);
//document.addEventListener("focusout", keyHandler.reset);

(()=>{
  var html = "";
  for (var i=0;i<15;i++)
    html+="<option>"+i+"</option>";
  eTimeLimit.innerHTML = html;
  eScoreLimit.innerHTML = html;
})();

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

var isAdmin = ()=>(room.currentPlayer?.isAdmin || room.isHost);

function getInput(label, inputDefaultValue, cancelable, yesNo){
  return new Promise((resolve, reject)=>{
    inputPopup.style.display = "flex";
    inputPopup.children.item(0).children.item(0).innerText = label;
    var input = inputPopup.children.item(0).children.item(1);
    if (inputDefaultValue==null)
      input.style.display = "none";
    else{
      input.style.display = "flex";
      input.value = inputDefaultValue;
    }
    var okButton = inputPopup.children.item(1).children.item(0);
    var cancelButton = inputPopup.children.item(1).children.item(1);
    okButton.innerText = yesNo ? "Yes" : "OK";
    cancelButton.innerText = yesNo ? "No" : "Cancel";
    okButton.onclick = function(){
      inputPopup.style.display = "none";
      resolve(input.value);
    };
    if (cancelable){
      cancelButton.style.display = "flex";
      cancelButton.onclick = function(){
        inputPopup.style.display = "none";
        reject();
      };
    }
    else
      cancelButton.style.display = "none";
  });
}

function makePlayerContainer(elem, player){
  elem.classList.add("player-list-item");
  if (player.isAdmin)
    elem.classList.add("admin");
  elem.innerHTML = `<div class='flagico f-` + player.flag + `'></div><div class='p-name'>` + player.name + `</div><div class='p-ping'>` + player.ping + `</div>`;
  elem.ondragstart = (event)=>{
    event.dataTransfer.setData("player", "" + player.id);
  };
  elem.oncontextmenu = (event)=>{
    event.preventDefault();
    showContextMenu(ctxMenu, event.pageX-3, event.pageY-3, player.name);
    addContextMenuItem(ctxMenu, player.isAdmin ? "Remove Admin" : "Give Admin", isAdmin(), ()=>{
      if (!isAdmin())
        return;
      room.setPlayerAdmin(player.id, !player.isAdmin);
    });
    addContextMenuItem(ctxMenu, "Kick", isAdmin(), ()=>{
      if (!isAdmin())
        return;
      getInput("Reason:", "", true, false).then((reason)=>{
        room.kickPlayer(player.id, reason, false);
      },()=>{});
    });
    addContextMenuItem(ctxMenu, "Ban", isAdmin(), ()=>{
      if (!isAdmin())
        return;
      getInput("Reason:", "", true, false).then((reason)=>{
        room.kickPlayer(player.id, reason, true);
      },()=>{});
    });
    return false;
  };
}

function makeTeamContainer(elem, team){
  elem.classList.add(team.className);
  elem.ondragover = (event)=>{
    if (event.dataTransfer.types.indexOf("player")==-1)
      return;
    event.preventDefault();
  };
  elem.ondrop = (event)=>{
    event.preventDefault();
    var playerId = parseInt(event.dataTransfer.getData("player"));
    !isNaN(playerId) && room.setPlayerTeam(playerId, team.id);
  };
  var bDiv = document.createElement("div");
  bDiv.className = "buttons";
  var b1 = document.createElement("button"), b2;
  b1.className = "button center join-btn";
  b1.innerText = team.name;
  b1.onclick = ()=>{
    room.setPlayerTeam(room.currentPlayerId, team.id);
  };
  bDiv.appendChild(b1);
  if (team!=Team.spec){
    b2 = document.createElement("button");
    b2.className = "button center reset-btn admin-only";
    b2.onclick = ()=>{
      room.resetTeam(team.id);
    };
    bDiv.appendChild(b2);
  }
  elem.appendChild(bDiv);
  var list = document.createElement("div");
  list.className = "list";
  elem.appendChild(list);
  var oldList = "";
  elem.update = function(){
    var gameActive = (roomState.gameState!=null);
    b1.disabled = roomState.teamsLocked || gameActive;
    if (b2)
      b2.disabled = gameActive;
    var isAdmin = room.currentPlayer?.isAdmin || room.isHost;
    var arr = roomState.players.filter(x=>(x.team.id==team.id));
    var newList = arr.map((x)=>(x.id+","+(x.isAdmin?"1":"0")+","+x.ping)).join("|");
    if (newList!=oldList){
      list.innerHTML = "";
      roomState.players.filter(x=>(x.team.id == team.id)).forEach((player)=>{
        var ePlayer = document.createElement("div");
        makePlayerContainer(ePlayer, player);
        ePlayer.draggable = isAdmin;
        list.appendChild(ePlayer);
      });
      oldList = newList;
    }
  };
}

eRec.onclick = function(){
  if (room.isRecording()){
    var data = room.stopRecording(), date = new Date();
    var fileName = "HBReplay-" + date.getFullYear() + "-" + make2Digits("" + (date.getMonth() + 1)) + "-" + make2Digits("" + date.getDate()) + "-" + make2Digits("" + date.getHours()) + "h" + make2Digits("" + date.getMinutes()) + "m.hbr2";
    downloadFile(fileName, "octet/stream", data);
  }
  else
    room.startRecording();
  update(API, room, roomState);
};
eLink.onclick = function(){
  getInput("Room Link:", window.parent.roomLink, false, false).then(()=>{});
};
eLeave.onclick = function(){
  getInput("Are you sure you want to quit?", null, true, true).then(()=>{
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    window.parent.onRoomLeave();
  }, ()=>{});
};
eAuto.onclick = function(){
  room.autoTeams();
};
eRand.onclick = function(){
  room.randTeams();
};
eLock.onclick = function(){
  room.lockTeams();
};
eReset.onclick = function(){
  room.resetTeam(1);
  room.resetTeam(2);
};
eTimeLimit.onchange = function(event){
  room.setTimeLimit(event.target.value);//timeLimitRef.current.selectedIndex
};
eScoreLimit.onchange = function(event){
  room.setScoreLimit(event.target.value);//scoreLimitRef.current.selectedIndex
};
ePickStadium.onclick = function(event){
  showContextMenu(ctxMenu, event.pageX-3, event.pageY+3, "Pick Stadium", true);
  API.Utils.getDefaultStadiums().forEach((stadium)=>{
    addContextMenuItem(ctxMenu, stadium.name, isAdmin(), ()=>{
      if (!isAdmin())
        return;
      room.setCurrentStadium(stadium);
    });
  });
  addContextMenuItem(ctxMenu, "Load from file...", isAdmin(), ()=>{
    if (!isAdmin())
      return;
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
        room.setCurrentStadium(x);
      };
      fr.readAsText(f.item(0));
    };
    inp.click();
  });
};
eStartGame.onclick = function(){
  room.startGame();
};
eStopGame.onclick = function(){
  room.stopGame();
};
ePauseGame.onclick = function(){
  room.pauseGame();
};

function make2Digits(a) {
  var b, c = "";
  for (b = 2 - a.length; c.length < b; ) c += "0";
  return c + (null == a ? "null" : "" + a);
};

window.update = function(_API, _room, _roomState){
  if (API==null){ // if running for the first time
    Team = _API.Impl.Core.p;
    makeTeamContainer(eTeams.children.item(1), Team.red);
    makeTeamContainer(eTeams.children.item(2), Team.spec);
    makeTeamContainer(eTeams.children.item(3), Team.blue);
    API = _API;
    room = _room;
    roomState = _roomState;
  }
  var gameActive = (roomState.gameState != null);
  var isAdmin = room.currentPlayer?.isAdmin || room.isHost;
  var disableActions = !isAdmin || gameActive;
  if (isAdmin)
    eRoomView.classList.add("admin");
  else
    eRoomView.classList.remove("admin");
  eRoomName.innerText = roomState.name;
  if (room.isRecording())
    eRec.classList.add("active");
  else
    eRec.classList.remove("active");
  if (roomState.teamsLocked){
    eLock.classList.add("locked");
    eLock.innerText = "Unlock";
  }
  else{
    eLock.classList.remove("locked");
    eLock.innerText = "Lock";
  }
  eReset.disabled = gameActive;
  eTimeLimit.disabled = disableActions;
  eTimeLimit.value = roomState.timeLimit;
  eScoreLimit.disabled = disableActions;
  eScoreLimit.value = roomState.scoreLimit;
  if (!roomState.stadium.isCustom)
    eStadiumName.classList.remove("custom");
  else
    eStadiumName.classList.add("custom");
  eStadiumName.innerText = roomState.stadium.name;
  for (var i=1;i<4;i++)
    eTeams.children.item(i).update();
  ePickStadium.disabled = disableActions;
  eStartGame.style.display = gameActive ? "none" : "flex";
  eStopGame.style.display = gameActive ? "flex" : "none";
  ePauseGame.style.display = gameActive ? "flex" : "none";
  ePauseGame.innerHTML = (gameActive && roomState.gameState.pauseGameTickCounter==120) ? "Resume (P)" : "Pause (P)";
};

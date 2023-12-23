const API = abcHaxballAPI({
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
}/*, {
  proxy: {
    WebSocketChangeOriginAllowed: false,
    WebSocketUrl: "ws://localhost:3000/",
    HttpUrl: "http://localhost:3000/rs/"
  }
}*/); // if you use our haxballOriginModifier extension, you don't need a proxy server. (But you still have to serve the files, you cannot open the html directly.)

const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

var e_tbody, e_name, roomName="", geo, hideLocked = false, hideFull = false, roomList, selectedRoomId, e_refresh, e_create, e_join, e_multijoin;

function debounce(cb, interval, immediate) { // this function is from here: https://codepen.io/wonism/pen/dXgrxE
  var timeout;

  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) 
        cb.apply(context, args);
    };          

    var callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, interval);

    if (callNow) 
      cb.apply(context, args);
  };
};


window.onload = ()=>{
  e_tbody = document.getElementById("listbody");
  e_name = document.getElementById("name");
  e_lat = document.getElementById("lat");
  e_lon = document.getElementById("lon");
  e_refresh = document.getElementById("bRefresh");
  e_create = document.getElementById("bCreate");
  e_join = document.getElementById("bJoin");
  e_multijoin = document.getElementById("bMultiJoin");
  e_refresh.onclick = refreshList;
  e_create.onclick = createRoom;
  e_join.onclick = joinRoom;
  e_join.disabled = true;
  e_multijoin.onclick = multiJoinRoom;
  e_multijoin.disabled = true;
  e_name.oninput = debounce(onNameChange, 400);
  e_lat.oninput = debounce(onGeoLocationChange, 400);
  e_lon.oninput = debounce(onGeoLocationChange, 400);
  Impl.Core.T.Fo().then((value)=>{ // Get GeoLocation from basro's REST api
    geo = value;
    e_lat.value = geo.lat;
    e_lon.value = geo.lon;
    refreshList();
  });
}

function onNameChange(){
  roomName = e_name.value.toLowerCase();
  updateList();
}

function onGeoLocationChange(){
  var lat = parseFloat(e_lat.value), lon = parseFloat(e_lon.value);
  if (!isFinite(lat) || isNaN(lat))
    lat = geo.lat;
  if (!isFinite(lon) || isNaN(lon))
    lon = geo.lon;
  geo = Utils.geoFromJSON({
    lat: lat,
    lon: lon,
    code: geo.flag
  });
  updateList();
}

function setSelectedRoomId(e){
  var id = e.target.parentElement.getAttribute("data-id");
  var elem = e_tbody.querySelector("[data-id='"+selectedRoomId+"']");
  if (elem)
    elem.classList.remove("selected");
  e.target.parentElement.classList.add("selected");
  selectedRoomId = id;
  e_join.disabled = false;
  e_multijoin.disabled = false;
}

function updateList(){
  Utils.calculateAllRoomDistances(geo, roomList);
  roomList.sort(function (a, b) {
    return a.dist - b.dist; // dist: calculated distance
  });
  var rows = "", anySelected = false;
  roomList.forEach(({id, data, dist})=>{
    if ((hideFull && data.players>=data.maxPlayers) || (hideLocked && data.password) || (roomName.length>0 && !data.name.toLowerCase().includes(roomName)))
      return;
    var flagClass = "", isSelected = (selectedRoomId==id);
    try {
      flagClass = " f-" + data.flag.toLowerCase();
    } catch (k) {}
    anySelected = anySelected || isSelected;
    rows += `
    <tr` + (isSelected ? " class='selected'":"") + ` data-id='` + id + `' title='` + id + `' onclick='setSelectedRoomId(event)'>
      <td>` + data.name + `</td>
      <td>` + data.players + '/' + data.maxPlayers + `</td>
      <td>` + (data.password ? 'Yes' : 'No') + `</td>
      <td>
        <div class='flagico` + flagClass + `'></div>
        <span>` + (dist | 0) + 'km' + `</span>
      </td>
    </tr>
    `;
  });
  e_tbody.innerHTML = rows;
  e_join.disabled = !anySelected;
  e_multijoin.disabled = !anySelected;
}

function refreshList(){
  e_join.disabled = true;
  e_multijoin.disabled = true;
  Utils.getRoomList().then((list)=>{
    roomList = list;
    updateList();
  });
}

function toggleLocked(){
  hideLocked = !hideLocked;
  updateList();
}

function toggleFull(){
  hideFull = !hideFull;
  updateList();
}

function createRoom(){
  window.open("./createRoom","Create Room","width=800,height=600");
}

function joinRoom(){
  window.open("./joinRoom?id="+selectedRoomId,"Join Room","width=800,height=600");
}

function multiJoinRoom(){
  window.open("./multiJoinRoom?id="+selectedRoomId,"MultiJoin Room","width=800,height=600");
}

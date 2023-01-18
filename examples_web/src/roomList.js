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
  WebSocketChangeOriginAllowed: false,
  WebSocketProxyUrl: "ws://localhost:3000/",
  HttpProxyUrl: "http://localhost:3000/rs/"
}*/); // if you use our haxballOriginModifier extension, you don't need a proxy server. (But you still have to serve the files, you cannot open the html directly.)

const { OperationType, VariableType, ConnectionState, AllowFlags, Callback, Utils, Room, Replay, RoomConfig, Plugin, Renderer, Impl } = API;

var e_tbody, e_name, roomName="", geo, hideLocked = false, hideFull = false, roomList, selectedRoomId, e_refresh, e_create, e_join;

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
  e_refresh.onclick = refreshList;
  e_create.onclick = createRoom;
  e_join.onclick = joinRoom;
  e_join.disabled = true;
  e_name.oninput = debounce(onNameChange, 400);
  e_lat.oninput = debounce(onGeoLocationChange, 400);
  e_lon.oninput = debounce(onGeoLocationChange, 400);
  Impl.Core.T.Fo().then((value)=>{ // Get GeoLocation from basro's REST api
    geo = value;
    e_lat.value = geo.Ec;
    e_lon.value = geo.Gc;
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
    lat = geo.Ec;
  if (!isFinite(lon) || isNaN(lon))
    lon = geo.Gc;
  geo = Impl.Core.T.Rf({
    lat: lat,
    lon: lon,
    code: geo.ub
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
}

function updateList(){
  Impl.Utils.va.Hs(geo, roomList); // Hs: calculateAllRoomDistances
  roomList.sort(function (a, b) {
    return a.Le - b.Le; // Le: calculated distance
  });
  var rows = "", anySelected = false;
  roomList.forEach(({$, vd, Le})=>{
    if ((hideFull && vd.I>=vd.Xe) || (hideLocked && vd.Ib) || (roomName.length>0 && !vd.w.toLowerCase().includes(roomName)))
      return;
    var flagClass = "", isSelected = (selectedRoomId==$);
    try {
      flagClass = " f-" + vd.ub.toLowerCase();
    } catch (k) {}
    anySelected = anySelected || isSelected;
    rows += `
    <tr` + (isSelected ? " class='selected'":"") + ` data-id='` + $ + `' title='` + $ + `' onclick='setSelectedRoomId(event)'>
      <td>` + vd.w + `</td>
      <td>` + vd.I + '/' + vd.Xe + `</td>
      <td>` + (vd.Ib ? 'Yes' : 'No') + `</td>
      <td>
        <div class='flagico` + flagClass + `'></div>
        <span>` + (Le | 0) + 'km' + `</span>
      </td>
    </tr>
    `;
  });
  e_tbody.innerHTML = rows;
  e_join.disabled = !anySelected;
}

function refreshList(){
  e_join.disabled = true;
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

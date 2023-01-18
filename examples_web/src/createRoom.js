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

Callback.add("KeyDown"); // this defines room._onKeyDown(). We will use this callback when keyDown event happens. It will trigger all roomConfig, plugin and renderer callbacks.
Callback.add("KeyUp"); // this defines room._onKeyUp(). We will use this callback when keyUp event happens. It will trigger all roomConfig, plugin and renderer callbacks.
Callback.add("MouseDown"); // this defines room._onMouseDown(). We will use this callback when mouseDown event happens. It will trigger all roomConfig, plugin and renderer callbacks.
Callback.add("MouseUp"); // this defines room._onMouseUp(). We will use this callback when mouseUp event happens. It will trigger all roomConfig, plugin and renderer callbacks.

var r_flag_elem = document.getElementById("r_flag");
var p_flag_elem = document.getElementById("p_flag");
var rl = document.getElementById("roomLink");
var notHeadless = document.getElementById("notHeadless");
var gameWindow = null;

var createRoom = function(){
  var r_name = document.getElementById("r_name").value;
  var r_pass = document.getElementById("r_pass").value;
  var r_mpc = document.getElementById("r_mpc").value;
  var r_sirl = document.getElementById("r_sirl").checked;
  var r_lat = document.getElementById("r_lat").value;
  var r_lon = document.getElementById("r_lon").value;
  var r_flag = r_flag_elem.value;
  var p_name = document.getElementById("p_name").value;
  var p_avatar = document.getElementById("p_avatar").value;
  var p_lat = document.getElementById("p_lat").value;
  var p_lon = document.getElementById("p_lon").value;
  var p_flag = p_flag_elem.value;
  var token = document.getElementById("token").value;

  if (r_name.length>40){
    alert("Room name cannot be more than 40 characters long. This is basro's limit on his server side. Everything still works fine but your room does not show up in room list.");
    return;
  }
  if (r_pass=="")
    r_pass = null;
  r_mpc = parseInt(r_mpc);
  if (isNaN(r_mpc) || !isFinite(r_mpc) || r_mpc<0 || r_mpc>30){
    alert("Max player count must be an integer between 0 and 30 inclusive.");
    return;
  }
  r_lat = parseFloat(r_lat);
  if (isNaN(r_lat) || !isFinite(r_lat) || r_lat<-90 || r_lat>90){
    alert("Room's latitude must be a real number between -90 and 90 inclusive.");
    return;
  }
  r_lon = parseFloat(r_lon);
  if (isNaN(r_lon) || !isFinite(r_lon) || r_lon<-180 || r_lon>180){
    alert("Room's longitude must be a real number between -180 and 180 inclusive.");
    return;
  }
  r_flag = r_flag.toLowerCase();
  if (r_flag.length!=2 || /[-+\d(), ]+$/g.test(r_flag)){
    alert("Room's flag must have 2 letters.");
    return;
  }
  /* 
  // these checks are not necessary when you are host.
  if (p_name.length>25){
    alert("Player's name cannot be more than 25 characters long. This is basro's limit on his original clients.");
    return;
  }
  if (p_avatar.length>2){
    alert("Player's avatar cannot be more than 2 characters long. This is basro's limit on his original clients.");
    return;
  }
  p_flag = p_flag.toLowerCase();
  if (p_flag.length>3 || /[-+\d(), ]+$/g.test(p_flag)){
    alert("Player's flag cannot be more than 3 letters long. This is basro's limit on his original clients.");
    return;
  }
  */
  p_lat = parseFloat(p_lat);
  if (isNaN(p_lat) || !isFinite(p_lat) || p_lat<-90 || p_lat>90){
    alert("Player's latitude must be a real number between -90 and 90 inclusive. (Although I think this value is unnecessary.)");
    return;
  }
  p_lon = parseFloat(p_lon);
  if (isNaN(p_lon) || !isFinite(p_lon) || p_lon<-180 || p_lon>180){
    alert("Player's longitude must be a real number between -180 and 180 inclusive. (Although I think this value is unnecessary.)");
    return;
  }
  Room.create({
    name: r_name, 
    password: r_pass, 
    maxPlayerCount: r_mpc,
    showInRoomList: r_sirl, 
    noPlayer: false,
    //playerCount: 25,
    //unlimitedPlayerCount: true,
    //fakePassword: false,
    geo: { lat: r_lat, lon: r_lon, flag: r_flag },
    token: token, 
  }, {
    storage: {
      crappy_router: false,
      player_name: p_name,
      avatar: p_avatar,
      fps_limit: 0,
      geo: {
        lat: p_lat,
        lon: p_lon,
        flag: p_flag
      },
      extrapolation: 0
    }, 
    renderer: null, // You may pass the renderer directly here. I have headless mode on the same page here, so I have to set the renderer later for this page to be more lightweight.
    plugins: [new plugins.autoPlay_defensive(API)],
    onSuccess: roomCallback,
    onRequestRecaptcha: ()=>{
      alert("Token rejected. Get a fresh token first!");
    },
    onLeave: ()=>{
      alert("The room has been closed.");
    }
  });
};

fetch("./countries.json").then(response => {
  return response.json();
}).then(countries => {
  makeFlagSelector(countries, r_flag_elem);
  makeFlagSelector(countries, p_flag_elem);
});

importPlugins(["autoPlay_defensive"], ()=>{
  console.log("plugins are ready", plugins);
  importRenderers(["defaultRenderer_minified"], ()=>{
    console.log("renderers are ready", renderers);
  });
});

var roomCallback = function(room){
  room.onRoomLink = (roomLink, customData)=>{
    if (notHeadless.checked){ // if we want a canvas
      if (gameWindow!=null){ // if game is already initialized, room link event has happened multiple times.
        gameWindow.onRoomLink(roomLink, customData); // we have to pass it to the new window to be able to handle it.
        return;
      }
      gameWindow = window.open("./game.html","Custom Haxball Client","width=800,height=600");
      gameWindow.onload = ()=>{
        //gameWindow.onRoomLink(roomLink, customData); // room link event has just happened for the first time, so we have to pass it to the new window to be able to handle it.
        //gameWindow.roomCallback(room, plugins, renderers); // send all important objects, so that we can close this window
        //window.close(); // because we don't need this window any more.
        return [API, room, plugins, renderers, roomLink, customData];
      }
      //return;
    }
    rl.href = roomLink;
    rl.innerText = roomLink;
    rl.onclick=(e)=>{
      e.preventDefault();
      window.open(roomLink,"Haxball","width=800,height=600");
    };
  };
  if (notHeadless.checked) // Canvas room callbacks are in game.js, so we don't do anything here except handling the room link event.
    return;
  headlessRoomCallback(room);
};

var headlessRoomCallback = function(room){
  // This is a headless bot test:
  room.startGame();
  room.onPlayerJoin = (playerObj, customData) => {
    //console.log("Player joined : ", playerObj);
    var {V:id, w:name} = playerObj;
    room.setPlayerAdmin(id, true); // make everybody admin
  };
};

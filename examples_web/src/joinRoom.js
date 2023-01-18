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

var r_id_elem = document.getElementById("r_id");
var p_flag_elem = document.getElementById("p_flag");
var rl = document.getElementById("roomLink");
var notHeadless = document.getElementById("notHeadless");

function getQueriesAsJSON() {
  return window.location.search.substring(1).split("&").reduce((acc, part)=>{
    if (part.length==0)
      return acc;
    var pair = part.split('=');
    acc[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    return acc;
  }, {});
}

var q = getQueriesAsJSON();
if (q.id!=null)
  r_id_elem.value = q.id;

var joinRoom = function(){
  var r_id = r_id_elem.value;
  var r_pass = document.getElementById("r_pass").value;
  var p_ak = document.getElementById("p_ak").value;
  var p_name = document.getElementById("p_name").value;
  var p_avatar = document.getElementById("p_avatar").value;
  var p_lat = document.getElementById("p_lat").value;
  var p_lon = document.getElementById("p_lon").value;
  var p_flag = p_flag_elem.value;
  var token = document.getElementById("token").value;
  var alerted = false;
  var authPromise = null;

  if (r_id.length<8 || r_id.length>15){
    alert("Room id length is not ideal.");
    return;
  }
  if (p_ak=="")
    authPromise = Utils.generateAuth();
  else{
    if (p_ak.length<120 || p_ak.length>150){
      alert("Player auth key length is not ideal.");
      return;
    }
    authPromise = Utils.authFromKey(p_ak);
  }
  if (r_pass=="")
    r_pass = null;
  if (token=="")
    token = null;

  // these checks are necessary when you are client.
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
  p_lat = parseFloat(p_lat);
  if (isNaN(p_lat) || !isFinite(p_lat) || p_lat<-90 || p_lat>90){
    alert("Player's latitude must be a real number between -90 and 90 inclusive.");
    return;
  }
  p_lon = parseFloat(p_lon);
  if (isNaN(p_lon) || !isFinite(p_lon) || p_lon<-180 || p_lon>180){
    alert("Player's longitude must be a real number between -180 and 180 inclusive.");
    return;
  }
  authPromise.then((x)=>{
    var authObj;
    if (p_ak=="")
      [p_ak, authObj] = x;
    else
      authObj = x;
    Room.join({
      id: r_id, 
      password: r_pass, 
      token: token,
      authObj: authObj
    }, {
      storage: {
        crappy_router: false,
        player_name: p_name,
        player_auth_key: p_ak,
        avatar: p_avatar,
        fps_limit: 0,
        geo: {
          lat: p_lat,
          lon: p_lon,
          flag: p_flag
        },
        extrapolation: 0
      }, 
      renderer: null, // You may pass the renderer directly here. I have headless mode on the same page here, so I have to set the renderer later for the page to be more lightweight.
      plugins: [new plugins.autoPlay_defensive(API)],
      onSuccess: roomCallback,
      onRequestRecaptcha: ()=>{
        alert("Token rejected. Get a fresh token first!");
      },
      onFailure: (x)=>{
        if (alerted)
          return;
        alerted = true;
        alert(x);
      },
      onLeave: (x)=>{
        if (alerted)
          return;
        alerted = true;
        alert(x);
      }
    });
  }).catch((ex)=>{
    console.log(ex);
    alert("Auth key error.");
  });
};

fetch("./countries.json").then(response => {
  return response.json();
}).then(countries => {
  makeFlagSelector(countries, p_flag_elem);
});

importPlugins(["autoPlay_defensive"], ()=>{
  console.log("plugins are ready", plugins);
  importRenderers(["defaultRenderer_minified"], ()=>{
    console.log("renderers are ready", renderers);
  });
});

var roomCallback = function(room){
  if (notHeadless.checked){ // if we want a canvas
    gameWindow = window.open("./game.html","Custom Haxball Client","width=800,height=600");
    gameWindow.onload = ()=>{
      //window.close(); // because we don't need this window any more.
      return [API, room, plugins, renderers];
    }
    return;
  }
  headlessRoomCallback(room);
};

var headlessRoomCallback = function(room){
  // This is a headless bot test:
  room.sendChat("Hello, everybody!");
};

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

var r_id_elem = document.getElementById("r_id");
var p_flag_elem = document.getElementById("p_flag");

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
  var jc = document.getElementById("jc").value;
  var p_name = document.getElementById("p_name").value;
  var p_avatar = document.getElementById("p_avatar").value;
  var p_lat = document.getElementById("p_lat").value;
  var p_lon = document.getElementById("p_lon").value;
  var p_flag = p_flag_elem.value;

  if (r_id.length<8 || r_id.length>15){
    alert("Room id length is not ideal.");
    return;
  }
  if (r_pass=="")
    r_pass = null;

  jc = parseInt(jc);
  if (isNaN(jc) || !isFinite(jc) || jc<1 || jc>1000){
    alert("Join count should be an integer between 1 and 1000 inclusive.");
    return;
  }

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

  function replaceFunctions(str, iStr){
    return str.replaceAll(/\$i/g, iStr).replaceAll(/\$r([0-9]+)/g, (matched, group, index)=>(""+(1+Math.floor(Math.random()*parseInt(group)))));
  }

  for (var i=1;i<=jc;i++){
    var iStr = ""+i;
    var rPass = r_pass && replaceFunctions(r_pass, iStr);
    var pName = replaceFunctions(p_name, iStr);
    var pAvatar = replaceFunctions(p_avatar, iStr);
    new Bot(r_id, rPass, pName, pAvatar, p_lat, p_lon, p_flag);
  }
};

fetch("./countries.json").then(response => {
  return response.json();
}).then(countries => {
  makeFlagSelector(countries, p_flag_elem);
});

importPlugins(["autoPlay_defensive"], ()=>{
  console.log("plugins are ready", plugins);
});

function Bot(id, pass, name, avatar, lat, lon, flag){
  Utils.generateAuth().then(([playerAuthKey, authObj])=>{
    var alerted = false;
    Room.join({
      id: id, 
      password: pass, 
      token: null,
      authObj: authObj
    }, {
      storage: {
        crappy_router: false,
        player_name: name,
        player_auth_key: playerAuthKey,
        avatar: avatar,
        fps_limit: 0,
        geo: {
          lat: lat,
          lon: lon,
          flag: flag
        },
        extrapolation: 0
      }, 
      renderer: null, // Don't render anything while we are trying to join multiple rooms simultaneously. :)
      plugins: [new plugins.autoPlay_defensive(API)],
      onSuccess: roomCallback,
      onRequestRecaptcha: ()=>{
        console.log("This is a recaptcha protected room. You can't use this tool with it!");
      },
      onFailure: (x)=>{
        if (alerted)
          return;
        alerted = true;
        console.log(x);
      },
      onLeave: (x)=>{
        if (alerted)
          return;
        alerted = true;
        console.log(x);
      }
    });
  }).catch((ex)=>{
    console.log(ex);
  });

  var roomCallback = function(room){
    // This is a headless bot test:
    room.sendChat("Hello, everybody! My name is "+name+",");
    room.sendChat("an auto-playing bot programmed by abc.");
    room.sendChat("Project link here: https://github.com/wxyz-abcd/node-haxball");
  };
}

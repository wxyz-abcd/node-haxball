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
}/*,{
  proxy: {
    WebSocketChangeOriginAllowed: false,
    WebSocketUrl: "wss://surf-emerald-armadillo.glitch.me/",
    HttpUrl: "https://surf-emerald-armadillo.glitch.me/rs/"
  }
}*/); // if you use our haxballOriginModifier extension, you don't need a proxy server. (But you still have to serve the files, you cannot open the html directly.)

const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

var roomCallback = function(room){
  var eLink = document.getElementById("link");
  // This is a headless bot test:
  room.onRoomLink = (roomLink, customData)=>{
    console.log(roomLink);
    eLink.href = roomLink;
    eLink.innerText = roomLink;
  };
  room.startGame();
  room.onPlayerJoin = (playerObj, customData) => {
    //console.log("Player joined : ", playerObj);
    var {id, name} = playerObj;
    room.setPlayerAdmin(id, true); // make everybody admin
  };
};

function Bot(id, pass, name, avatar, lat, lon, flag, autoPlay){
  var pluginsArray = [];
  if (autoPlay) // if we want autoPlay plugin
    pluginsArray.push(new plugins.autoPlay_defensive(API));
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
      libraries: [],
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
        console.log(x.toString());
      },
      onLeave: (x)=>{
        if (alerted)
          return;
        alerted = true;
        console.log(x.toString());
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

function doAction(params){
  function replaceFunctions(str, iStr){
    return str.replaceAll(/\$i/g, iStr).replaceAll(/\$r([0-9]+)/g, (matched, group, index)=>(""+(1+Math.floor(Math.random()*parseInt(group)))));
  }

  for (var i=1;i<=params.jc;i++){
    var iStr = ""+i;
    var rPass = params.r_pass && replaceFunctions(params.r_pass, iStr);
    var pName = replaceFunctions(params.p_name, iStr);
    var pAvatar = replaceFunctions(params.p_avatar, iStr);
    new Bot(params.r_id, rPass, pName, pAvatar, params.p_lat, params.p_lon, params.p_flag, params.autoPlay);
  }
}

function readMultiJoinRoomParameters(q){
  var r_id = q["r_id"] || "";
  var r_pass = q["r_pass"];
  var jc = q["jc"] || "";
  var p_name = q["p_name"] || "";
  var p_avatar = q["p_avatar"] || "";
  var p_lat = q["p_lat"];
  var p_lon = q["p_lon"];
  var p_flag = q["p_flag"] || "";
  var autoPlay = q["autoPlay"] || "";
  if (r_pass=="")
    r_pass = null;
  jc = parseInt(jc);
  if (isNaN(jc) || !isFinite(jc) || jc<1 || jc>1000)
    throw "Join count should be an integer between 1 and 1000 inclusive. (jc)";
  p_flag = p_flag.toLowerCase();
  if (p_flag.length>3 || /[-+\d(), ]+$/g.test(p_flag))
    throw "Player's flag cannot be more than 3 letters long. This is basro's limit on his original clients. (p_flag)";
  p_lat = parseFloat(p_lat);
  if (isNaN(p_lat) || !isFinite(p_lat) || p_lat<-90 || p_lat>90)
    throw "Player's latitude must be a real number between -90 and 90 inclusive. (p_lat)";
  p_lon = parseFloat(p_lon);
  if (isNaN(p_lon) || !isFinite(p_lon) || p_lon<-180 || p_lon>180)
    throw "Player's longitude must be a real number between -180 and 180 inclusive. (p_lon)";
  autoPlay = autoPlay.toLowerCase();
  if (autoPlay!="true" && autoPlay!="false")
    throw "AutoPlay must be either true or false. (autoPlay)";
  autoPlay = (autoPlay=="true");
  return {
    r_id,
    r_pass,
    jc,
    p_name,
    p_avatar,
    p_lat,
    p_lon,
    p_flag,
    autoPlay
  };
}
(()=>{
  var params;
  try{
    var q = getQueriesAsJSON();
    switch (q["action"]){
      case "join":{
        params = readMultiJoinRoomParameters(q);
        break;
      }
      default:
        throw "Unrecognized action, params:"+JSON.stringify(q);
    }
  }catch(ex){
    alert(ex);
    window.close();
    return;
  }
  if (params.autoPlay)
    importPlugins(["autoPlay_defensive"], ()=>{
      doAction(params);
    });
  else
    doAction(params);
})();
// This is a browser-only example focusing on running the API inside the website: https://www.haxball.com/headless
// To test, directly copy and paste this code into the browser console.
// You might provide a headless token like this: https://www.haxball.com/headless?token=thr1.AAAAAGZ6tHrTNjEqONznoQ.xlDgVJTT31k
// BUG: Currently receiving "Connection closed (0)" while joining a room that was created using this script.

var EnglishLanguage = null, token = window.location.search.startsWith("?token=")?window.location.search.substring(7):""; // Or you might write your token here.

delete window.HBInit;

var loadScript = (url, isModule) => new Promise((resolve, reject)=>{
  if (isModule)
    window.module = {};
  var s=document.createElement("script");
  s.src=url;
  s.onerror=(error)=>{
    delete window.module;
    reject(error);
  };
  s.onload=()=>{
    var m = isModule ? window.module.exports : null;
    delete window.module;
    resolve(m);
  };
  document.body.appendChild(s);
});

Promise.all([
  loadScript("https://cdn.jsdelivr.net/gh/wxyz-abcd/node-haxball@latest/examples_web/src/vendor/json5.min.js", false),
  loadScript("https://cdn.jsdelivr.net/gh/wxyz-abcd/node-haxball@latest/examples_web/src/vendor/pako-jszip.min.js", false),
  loadScript("https://cdn.jsdelivr.net/gh/wxyz-abcd/node-haxball@latest/src/api.js", false), 
  loadScript("https://cdn.jsdelivr.net/gh/wxyz-abcd/node-haxball@latest/examples/languages/englishLanguage.js", true) // if you want to use error.toString()
]).then(([i, j, k, l])=>{
  EnglishLanguage = l;
  if (token.length>0)
    start();
  else
    showRecaptcha();
});

function showRecaptcha(){
  window.document.head.innerHTML = "";
  window.document.body.innerHTML = "";
  var c = document.createElement("iframe");
  c.style = "width:100%;height:100%";
  c.src = "https://www.haxball.com/headlesstoken";
  document.body.appendChild(c);
  function f(){
    var t = c.contentDocument.body.getElementsByTagName("pre")[0]?.innerText;
    if (!t)
      setTimeout(f, 500);
    else{
      t = /(?:")(?<token>\w{4}\.\w+\.\w+)(?:")/g.exec(t)?.groups.token;
      if (t){
        token = t;
        start();
      }
      else
        showRecaptcha();
    }
  }
  f();
}

function start(){
  window.document.head.innerHTML = "";
  window.document.body.innerHTML = "";
  console.log("starting with token = "+token);

  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API = abcHaxballAPI(window);

  Language.current = new EnglishLanguage(API); // if you want to use error.toString()

  // For initialization on browsers, read the documentation here: https://github.com/wxyz-abcd/node-haxball#-usage-on-browser
  
  Room.create({
    name: "bot test", 
    password: "pwd", 
    showInRoomList: true, 
    maxPlayerCount: 10,
    token: token
  }, {
    storage: {
      player_name: "wxyz-abcd",
      avatar: "👽"
    }, 
    libraries: [], // example library usage: [new commands(API)] // look at examples/libraries folder for related examples.
    config: null, // example roomConfig usage: new defaultConfig(API) // look at examples/roomConfigs/method2 folder for related examples.
    renderer: null, // example renderer usage: new defaultRenderer(API, {canvas: ..., images: {grass: ..., concrete: ..., concrete2: ..., typing: ...}, paintGame: true}) // look at examples_web folder for usage with room.setRenderer instead.
    plugins: [], // example plugin usage: [new autoPlay_followBall(API)] // look at examples/plugins folder for related examples.
    onOpen: roomCallbacks, // look at examples/roomConfigs/method1 folder for related examples.
    onClose: (msg)=>{
      console.log("Bot has left the room:", msg.toString());
      process.exit(0);
    }
  });
  
  function roomCallbacks(room){ // "roomCallbacks" examples start from here. // look at examples/roomConfigs/method1 folder for related examples.
    room.onAfterRoomLink = (roomLink)=>{
      console.log("room link:", roomLink);
    };
    console.log("created room");
  }
}

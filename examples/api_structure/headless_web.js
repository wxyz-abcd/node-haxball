// This is a browser-only example focusing on running the API inside the website: https://www.haxball.com/headless
// To test, directly copy and paste this code into the browser console.
// You might have to provide a headless token like this: https://www.haxball.com/headless?token=thr1.AAAAAGZ6tHrTNjEqONznoQ.xlDgVJTT31k
// Tried to show a recaptcha challenge manually, but currently the success callback is not called, and I do not know why.

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

var recaptchaData = {
  elem: null,
  renderResponse: null,
  alreadyShown: false
};

function showRecaptcha(googleRecaptchaResponse, siteKey, onSuccess) {
  if (!recaptchaData.elem){
    recaptchaData.elem = window.document.getElementsByTagName("iframe")[0].contentDocument.getElementById("recaptcha"); // E.cd
    console.log("test");
    recaptchaData.renderResponse = googleRecaptchaResponse.render(recaptchaData.elem, { // E.Sh
      sitekey: siteKey,
      callback: function(data) {
        if (recaptchaData.alreadyShown)
          return;
        window.setTimeout(function() {
          recaptchaData.elem.hidden = true;
          onSuccess(data)
        }, 1000);
        recaptchaData.alreadyShown = true;
      }
    })
  }
  recaptchaData.elem.hidden = false;
  googleRecaptchaResponse.reset(recaptchaData.renderResponse);
}

function _loadScriptsOneByOne(arr, onFinish, onError, ret){
  if (arr.length==0){
    onFinish(ret);
    return;
  }
  var next = arr.splice(0,1)[0];
  loadScript(next.url, next.isModule).then((lib)=>{
    ret.push(lib);
    _loadScriptsOneByOne(arr, onFinish, onError, ret);
  }).catch(onError);
}

var loadScriptsOneByOne = (arr) => new Promise((resolve, reject)=>{
  return _loadScriptsOneByOne(arr, resolve, reject, []);
});

var EnglishLanguage = null;

loadScriptsOneByOne([{
  url: "https://www.google.com/recaptcha/api.js?onload=___recaptchaload&render=explicit", 
  isModule: false
}, {
  url: "https://cdn.jsdelivr.net/gh/wxyz-abcd/node-haxball@latest/src/api.js",
  isModule: false
}, {
  url: "https://cdn.jsdelivr.net/gh/wxyz-abcd/node-haxball@latest/examples/languages/englishLanguage.js",
  isModule: true
}]).then(([a, b, c])=>new Promise((resolve)=>{
  EnglishLanguage = c;
  window.___recaptchaload = () => resolve();
})).then(()=>{
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API = abcHaxballAPI(window);
  Language.current = new EnglishLanguage(API); // if you want to use error.toString()

  // For initialization on browsers, read the documentation here: https://github.com/wxyz-abcd/node-haxball#-usage-on-browser
  
  var hb = Room.create({
    name: "bot test", 
    password: "pwd", 
    showInRoomList: true, 
    maxPlayerCount: 10,
    token: window.location.search.startsWith("?token=")?window.location.search.substring(7):""
  }, {
    storage: {
      player_name: "wxyz-abcd",
      avatar: "👽"
    }, 
    libraries: [], // example library usage: [new commands(API)] // look at examples/libraries folder for related examples.
    config: null, // example roomConfig usage: new defaultConfig(API) // look at examples/roomConfigs/method2 folder for related examples.
    renderer: null, // example renderer usage: new defaultRenderer(API, {canvas: ..., images: {grass: ..., concrete: ..., concrete2: ..., typing: ...}, paintGame: true}) // look at examples_web folder for usage with room.setRenderer instead.
    plugins: [], // example plugin usage: [new autoPlay_followBall(API)] // look at examples/plugins folder for related examples.
    onSuccess: roomCallbacks, // look at examples/roomConfigs/method1 folder for related examples.
    onRequestRecaptcha: (siteKey)=>{ // You only need this callback if you plan to show a recaptcha gui inside the website, and you don't want to use headless tokens.
      showRecaptcha(window.grecaptcha, siteKey, (token)=>{ // BUG: Currently, this callback does not work. I do not know why.
        hb.useRecaptchaToken(token);
      });
    },
    onFailure: (error)=>{
      console.log("Unable to join room...", error.toString());
      process.exit(0);
    },
    onLeave: (msg)=>{
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
});
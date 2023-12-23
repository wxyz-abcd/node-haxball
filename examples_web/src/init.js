function init(headless, roomCallback){
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

  if (!headless){
    Callback.add("KeyDown"); // this defines room._onKeyDown(). We will use this callback when keyDown event happens. It will trigger all roomConfig, plugin and renderer callbacks.
    Callback.add("KeyUp"); // this defines room._onKeyUp(). We will use this callback when keyUp event happens. It will trigger all roomConfig, plugin and renderer callbacks.
    Callback.add("MouseDown"); // this defines room._onMouseDown(). We will use this callback when mouseDown event happens. It will trigger all roomConfig, plugin and renderer callbacks.
    Callback.add("MouseUp"); // this defines room._onMouseUp(). We will use this callback when mouseUp event happens. It will trigger all roomConfig, plugin and renderer callbacks.
  }

  function doAction(params){
    var pluginsArray = [], librariesArray = [];
    if (params.autoPlay) // if we want autoPlay plugin
      pluginsArray.push(new plugins.autoPlay_defensive(API));
    if (params.aimbot) // if we want aimbot library
      librariesArray.push(new libraries.aimbot(API));
    if (params.createRoom)
      Room.create({
        name: params.r_name, 
        password: params.r_pass, 
        maxPlayerCount: params.r_mpc,
        showInRoomList: params.r_sirl, 
        noPlayer: false,
        //playerCount: 25,
        //unlimitedPlayerCount: true,
        //fakePassword: false,
        geo: { lat: params.r_lat, lon: params.r_lon, flag: params.r_flag },
        token: params.token, 
      }, {
        storage: {
          crappy_router: false,
          player_name: params.p_name,
          avatar: params.p_avatar,
          fps_limit: 0,
          geo: {
            lat: params.p_lat,
            lon: params.p_lon,
            flag: params.p_flag
          },
          extrapolation: 0
        }, 
        libraries: librariesArray,
        renderer: null,
        plugins: pluginsArray,
        onSuccess: (room)=>{ roomCallback(room, params); },
        onRequestRecaptcha: ()=>{
          alert("Token rejected. Get a fresh token first!");
          window.close();
        },
        onLeave: ()=>{
          alert("The room has been closed.");
          window.close();
        }
      });
    else{
      var authPromise;
      if (params.p_ak=="")
        authPromise = Utils.generateAuth();
      else
        authPromise = Utils.authFromKey(params.p_ak);
      authPromise.then((x)=>{
        var authObj, alerted = false;
        if (params.p_ak=="")
          [params.p_ak, authObj] = x;
        else
          authObj = x;
        Room.join({
          id: params.r_id,
          password: params.r_pass,
          token: params.token,
          authObj: authObj
        }, {
          storage: {
            crappy_router: false,
            player_name: params.p_name,
            player_auth_key: params.p_ak,
            avatar: params.p_avatar,
            fps_limit: 0,
            geo: {
              lat: params.p_lat,
              lon: params.p_lon,
              flag: params.p_flag
            },
            extrapolation: 0
          }, 
          libraries: librariesArray,
          renderer: null,
          plugins: pluginsArray,
          onSuccess: (room)=>{ roomCallback(room, params); },
          onRequestRecaptcha: ()=>{
            alert("Token rejected. Get a fresh token first!");
            window.close();
          },
          onFailure: (x)=>{
            if (alerted)
              return;
            alerted = true;
            alert(x.toString());
            window.close();
          },
          onLeave: (x)=>{
            if (alerted)
              return;
            alerted = true;
            alert(x.toString());
            window.close();
          }
        });
      }).catch((ex)=>{
        console.log(ex);
        alert("Auth key error.");
        window.close();
      });
    }
  }

  var params;
  try{
    var q = getQueriesAsJSON();
    switch (q["action"]){
      case "create":{
        params = readCreateRoomParameters(q);
        break;
      }
      case "join":{
        params = readJoinRoomParameters(q);
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
      if (headless)
        doAction(params);
      else
        importLibraries(["aimbot"], ()=>{
          importRenderers(["defaultRenderer"], ()=>{
            doAction(params);
          });
        });
    });
  else if (headless)
    doAction(params);
  else
    importLibraries(["aimbot"], ()=>{
      importRenderers(["defaultRenderer"], ()=>{
        doAction(params);
      });
    });
  return API;
}
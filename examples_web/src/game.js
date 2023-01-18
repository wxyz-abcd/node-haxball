
var onload_old = window.onload, isHost;

function loadImage(path){
  return new Promise((resolve, reject)=>{
    var img = document.createElement("img");
    img.src = path;
    img.onload = ()=>{
      resolve(img);
    };
    img.onerror = (err)=>{
      reject(err);
    };
  });
}

window.onload = ()=>{
  var [API, room, plugins, renderers, roomLink, customData] = onload_old();
  isHost = (roomLink != null);
  var canvas = document.getElementById("canvas");
  var { defaultRenderer_minified: DefaultRenderer } = renderers; // get the renderer class
  Promise.all([loadImage("./images/grass.png"), loadImage("./images/concrete.png"), loadImage("./images/concrete2.png"), loadImage("./images/typing.png")]).then((images)=>{
    var renderer = new DefaultRenderer(API, {
      canvas: canvas, 
      images: {
        grass: images[0],
        concrete: images[1],
        concrete2: images[2],
        typing: images[3]
      },
      paintGame: true,
      //onRequestAnimationFrame: ()=>{}
    }); // create the renderer object
    room.setRenderer(renderer); // set the renderer object as the room's current renderer
    roomCallback(room);
  }, (err)=>{
    console.log(err);
    alert("Error loading images. Look at console for error details.");
  });
};

window.onRoomLink = (roomLink, customData)=>{ // this will only rarely re-run in host mode.
  console.log("roomLink:", roomLink, customData);
};

var roomCallback = function(room){
  room.startGame();
  room.onPlayerJoin = (playerObj, customData) => {
    //console.log("Player joined : ", playerObj);
    var {V:id, w:name} = playerObj;
    room.setPlayerAdmin(id, true); // make everybody admin
  };
};

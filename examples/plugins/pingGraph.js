module.exports = function (API) {
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "pingGraph", true, {
    version: "0.1",
    author: "abc",
    description: `This plugin shows your ping graph while you are in a room.`,
    allowFlags: AllowFlags.JoinRoom
  });

  this.defineVariable({
    name: "width",
    description: "Width of the canvas",
    type: VariableType.Integer,
    value: 200
  });

  this.defineVariable({
    name: "height",
    description: "Height of the canvas",
    type: VariableType.Integer,
    value: 200
  });

  this.defineVariable({
    name: "maxPing",
    description: "Maximum reachable ping in graph",
    type: VariableType.Integer,
    value: 400
  });

  this.defineVariable({
    name: "background",
    description: "Background color",
    type: VariableType.Color,
    value: "#000000"
  });

  this.defineVariable({
    name: "valueBar",
    description: "Value bar color",
    type: VariableType.Color,
    value: "#00ff00"
  });

  this.defineVariable({
    name: "missingBar",
    description: "Missing bar color",
    type: VariableType.Color,
    value: "#c13535"
  });

  var that = this;
  var w, Qf, Eh, lp, lmp;
  var pings; // fq
  //var maxPingInGraph = 400; // vp
  //var width = 32; // Vi
  //var height = 64; // yk
  //var x = 0; // Ah

  this.initialize = ()=>{
    w = that.room.librariesMap.gui.newWindowFromContent("", "", 250, 250);
    var x = w.document.createElement("div");
    x.style = "display: block; width: 100%; height: 25px";
    lp = w.document.createElement("label");
    lp.style = "display: inline-block; float: left;";
    x.appendChild(lp);
    lmp = w.document.createElement("label");
    lmp.style = "display: inline-block; float: right;";
    x.appendChild(lmp);
    w.document.body.appendChild(x);
    Qf = w.document.createElement("canvas");
    Qf.style = "display: block; width: 100%; height: calc(100% - 25px);";
    Qf.width = that.width;
    Qf.height = that.height;
    Eh = Qf.getContext("2d");
    w.document.body.appendChild(Qf);
    pings = [];
  };

  this.finalize = ()=>{
    Qf = null;
    Eh = null;
    w?.close();
    w = null;
    pings = null;
    lp = null;
    lmp = null;
  };

  this.onPingChange = (a, pingRw, maxPing)=>{ // a = ping
    pings.push(a);
    if (pings.length>that.width)
      pings.splice(0,1);
    lp.innerText = "Ping: "+(((10*pingRw)|0)/10);
    lmp.innerText = "Max Ping: "+(((10*maxPing)|0)/10);
    Eh.fillStyle = that.background;
    Eh.fillRect(0, 0, that.width, that.height);
    pings.forEach((a, x)=>{
      if (a<0) {
        a = 0.375*that.maxPing;
        Eh.fillStyle = that.missingBar;
      }
      else 
        Eh.fillStyle = that.valueBar;
      a = a*that.height/that.maxPing;
      Eh.fillRect(x, that.height-a, 1, a);
    });
  };

  this.onVariableValueChange = function(addOnObj, variableName, oldValue, value){
    if (addOnObj!=that)
      return;
    if (variableName=="width" || variableName=="height"){
      Qf.width = that.width;
      Qf.height = that.height;
      if (pings.length>that.width)
        pings.splice(0, pings.length-that.width);
    }
  };
}

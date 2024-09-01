module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "setDiscProperties", true, {
    version: "0.1",
    author: "abc",
    description: `This plugin lets you change the properties of any disc while you are hosting the room.`,
    allowFlags: AllowFlags.CreateRoom
  });

  this.defineVariable({
    name: "selectDisc",
    description: "Click this and then select a disc using your mouse.", 
    type: VariableType.Void,
    value: selectDisc
  });

  this.defineVariable({
    name: "discId",
    description: "Id of the disc.", 
    type: VariableType.Integer,
    value: 0,
    range: {
      min: 0,
      max: 255,
      step: 1
    }
  });

  this.defineVariable({
    name: "getValues",
    description: "Sets the plugin variables to the current physical values of the given discId.", 
    type: VariableType.Void,
    value: gameToPlugin
  });

  this.defineVariable({
    name: "clearValues",
    description: "Resets the plugin variables.", 
    type: VariableType.Void,
    value: clear
  });

  this.defineVariable({
    name: "discPosition",
    description: "Position of the disc.", 
    type: VariableType.String,
    value: "",
    range: {
      min: 3
    }
  });

  this.defineVariable({
    name: "discSpeed",
    description: "Speed of the disc.", 
    type: VariableType.String,
    value: "",
    range: {
      min: 3
    }
  });

  this.defineVariable({
    name: "discGravity",
    description: "Gravity of the disc.", 
    type: VariableType.String,
    value: "",
    range: {
      min: 3
    }
  });

  this.defineVariable({
    name: "discRadius",
    description: "Radius of the disc.", 
    type: VariableType.Number,
    value: "",
    range: {
      min: -Infinity,
      max: Infinity,
      step: 0.00001
    }
  });

  this.defineVariable({
    name: "discBCoeff",
    description: "BCoeff of the disc.", 
    type: VariableType.Number,
    value: "",
    range: {
      min: -Infinity,
      max: Infinity,
      step: 0.00001
    }
  });

  this.defineVariable({
    name: "discInvMass",
    description: "InvMass of the disc.", 
    type: VariableType.Number,
    value: "",
    range: {
      min: -Infinity,
      max: Infinity,
      step: 0.00001
    }
  });

  this.defineVariable({
    name: "discDamping",
    description: "Damping of the disc.", 
    type: VariableType.Number,
    value: "",
    range: {
      min: -Infinity,
      max: Infinity,
      step: 0.00001
    }
  });

  this.defineVariable({
    name: "discColor",
    description: "Color of the disc.", 
    type: VariableType.Integer,
    value: "",
    range: {
      min: -1,
      max: 16777216,
      step: 1
    }
  });

  this.defineVariable({
    name: "discCMask",
    description: "CMask of the disc.", 
    type: VariableType.Integer,
    value: "",
    range: {
      min: -Infinity,
      max: Infinity,
      step: 1
    }
  });

  this.defineVariable({
    name: "discCGroup",
    description: "CGroup of the disc.", 
    type: VariableType.Integer,
    value: "",
    range: {
      min: -Infinity,
      max: Infinity,
      step: 1
    }
  });

  this.defineVariable({
    name: "updateValues",
    description: "Updates the in-game values according to the plugin variables.", 
    type: VariableType.Void,
    value: pluginToGame
  });

  var selectionActive = false, that = this;

  function selectDisc(){
    selectionActive = true;
  }

  this.onMouseDown = function(e){
    if (!selectionActive)
      return;
    var f = that.room?.renderer?.transformPixelCoordToMapCoord;
    if (!f || !that.room.stateExt){
      selectionActive = false;
      return;
    }
    var idx = Query.getDiscIndexAtMapCoord(that.room.stateExt, f(e.offsetX, e.offsetY));
    if (idx<0)
      return;
    that.discId = idx;
    selectionActive = false;
  }

  function gameToPlugin(){
    if (!that.room.stateExt)
      return;
    var disc = that.room.stateExt.gameState.physicsState.discs[that.discId];
    if (!disc)
      return;
    that.discPosition = disc.pos.x+", "+disc.pos.y;
    that.discSpeed = disc.speed.x+", "+disc.speed.y;
    that.discGravity = disc.gravity.x+", "+disc.gravity.y;
    that.discRadius = ""+disc.radius;
    that.discBCoeff = ""+disc.bCoef;
    that.discInvMass = ""+disc.invMass;
    that.discDamping = ""+disc.damping;
    that.discColor = ""+disc.color;
    that.discCMask = ""+disc.cMask;
    that.discCGroup = ""+disc.cGroup;
  }

  function clear(){
    that.discPosition = "";
    that.discSpeed = "";
    that.discGravity = "";
    that.discRadius = "";
    that.discBCoeff = "";
    that.discInvMass = "";
    that.discDamping = "";
    that.discColor = "";
    that.discCMask = "";
    that.discCGroup = "";
  }

  function pluginToGame(){
    if (!that.room.stateExt.gameState.physicsState.discs[that.discId])
      return;
    function parseValue(str, float=true){
      if (typeof str=="number")
        return str;
      var v = float ? parseFloat(str.trim()) : parseInt(str.trim());
      if (isNaN(v))
        v = null;
      return v;
    }
    
    var x = null, y = null;
    var tmp = that.discPosition.split(",");
    if (tmp.length==2){
      x = parseValue(tmp[0]);
      y = parseValue(tmp[1]);
    }

    var xspeed = null, yspeed = null;
    tmp = that.discSpeed.split(",");
    if (tmp.length==2){
      xspeed = parseValue(tmp[0]);
      yspeed = parseValue(tmp[1]);
    }
    
    var xgravity = null, ygravity = null;
    tmp = that.discGravity.split(",");
    if (tmp.length==2){
      xgravity = parseValue(tmp[0]);
      ygravity = parseValue(tmp[1]);
    }

    var radius = parseValue(that.discRadius);
    var bCoeff = parseValue(that.discBCoeff);
    var invMass = parseValue(that.discInvMass);
    var damping = parseValue(that.discDamping);
    var color = parseValue(that.discColor, false);
    var cMask = parseValue(that.discCMask, false);
    var cGroup = parseValue(that.discCGroup, false);

    that.room.setDiscProperties(that.discId, {x, y, xspeed, yspeed, xgravity, ygravity, radius, bCoeff, invMass, damping, color, cMask, cGroup})
  }
};
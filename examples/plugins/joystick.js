module.exports = function (API) {
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;
  
  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "joystick", true, { // "joystick" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "Bobboteck & abc & JerryOldson",
    description: `This plugins allows player interact with the joystick.`,
    allowFlags: AllowFlags.JoinRoom | AllowFlags.CreateRoom // We allow this plugin to be activated on both JoinRoom and CreateRoom.
  });
  
  this.defineVariable({
    name: "opacity",
    type: VariableType.Number,
    value: 0.6,
    range: {
      min: 0,
      max: 1,
      step: 0.01
    },
    description: `Opacity of the gui that is shown on top of the canvas`
  });
  
  //  This file is part of the JoyStick Project (https://github.com/bobboteck/JoyStick).
  //	Copyright (c) 2015 Roberto D'Amico (Bobboteck).
  //  ( Modified by abc )
  var JoyStick = (function(container, parameters){
    parameters = parameters || {};
    var title = (typeof parameters.title === "undefined" ? "joystick" : parameters.title),
      width = (typeof parameters.width === "undefined" ? 0 : parameters.width),
      height = (typeof parameters.height === "undefined" ? 0 : parameters.height),
      internalFillColor = (typeof parameters.internalFillColor === "undefined" ? "#00AA00" : parameters.internalFillColor),
      internalLineWidth = (typeof parameters.internalLineWidth === "undefined" ? 2 : parameters.internalLineWidth),
      internalStrokeColor = (typeof parameters.internalStrokeColor === "undefined" ? "#003300" : parameters.internalStrokeColor),
      externalLineWidth = (typeof parameters.externalLineWidth === "undefined" ? 2 : parameters.externalLineWidth),
      externalStrokeColor = (typeof parameters.externalStrokeColor ===  "undefined" ? "#008000" : parameters.externalStrokeColor),
      autoReturnToCenter = (typeof parameters.autoReturnToCenter === "undefined" ? true : parameters.autoReturnToCenter);
	  
    // Create Canvas element and add it in the Container object
    var objContainer = document.getElementById(container);
    var canvas = document.createElement("canvas");
    canvas.id = title;
    if(width === 0) { width = objContainer.clientWidth; }
    if(height === 0) { height = objContainer.clientHeight; }
    canvas.width = width;
    canvas.height = height;
    objContainer.appendChild(canvas);
    var context = canvas.getContext("2d");

    var pressed = 0; // Bool - 1=Yes - 0=No
    var circumference = 2 * Math.PI;
    var internalRadius = (canvas.width-((canvas.width/2)+10))/2;
    var maxMoveStick = internalRadius + 5;
    var externalRadius = internalRadius + 30;
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var directionHorizontalLimitPos = canvas.width / 10;
    var directionHorizontalLimitNeg = directionHorizontalLimitPos * -1;
    var directionVerticalLimitPos = canvas.height / 10;
    var directionVerticalLimitNeg = directionVerticalLimitPos * -1;
    // Used to save current position of stick
    var movedX=centerX;
    var movedY=centerY;
		  
    // Check if the device support the touch or not
    if("ontouchstart" in document.documentElement){
      canvas.addEventListener("touchstart", onTouchStart, false);
      canvas.addEventListener("touchmove", onTouchMove, false);
      canvas.addEventListener("touchend", onTouchEnd, false);
    }
    else{
      canvas.addEventListener("mousedown", onMouseDown, false);
      canvas.addEventListener("mousemove", onMouseMove, false);
      canvas.addEventListener("mouseup", onMouseUp, false);
    }
    // Draw the object
    drawExternal();
    drawInternal();

    /******************************************************
     * Private methods
     *****************************************************/

    // Draw the external circle used as reference position
    function drawExternal(){
      context.beginPath();
      context.arc(centerX, centerY, externalRadius, 0, circumference, false);
      context.lineWidth = externalLineWidth;
      context.strokeStyle = externalStrokeColor;
      context.stroke();
    }

    // Draw the internal stick in the current position the user have moved it
    function drawInternal(){
      context.beginPath();
      if(movedX<internalRadius) { movedX=maxMoveStick; }
      if((movedX+internalRadius) > canvas.width) { movedX = canvas.width-(maxMoveStick); }
      if(movedY<internalRadius) { movedY=maxMoveStick; }
      if((movedY+internalRadius) > canvas.height) { movedY = canvas.height-(maxMoveStick); }
      context.arc(movedX, movedY, internalRadius, 0, circumference, false);
      // create radial gradient
      var grd = context.createRadialGradient(centerX, centerY, 5, centerX, centerY, 200);
      // Light color
      grd.addColorStop(0, internalFillColor);
      // Dark color
      grd.addColorStop(1, internalStrokeColor);
      context.fillStyle = grd;
      context.fill();
      context.lineWidth = internalLineWidth;
      context.strokeStyle = internalStrokeColor;
      context.stroke();
    }
	  
    // Events for manage touch
    function onTouchStart(event) {
      pressed = 1;
    }

    function onTouchMove(event) {
      // Prevent the browser from doing its default thing (scroll, zoom)
      event.preventDefault();
      if (pressed !== 1 || event.targetTouches[0].target !== canvas)
        return;
  
      // Calculate the position of the touch relative to the canvas
      var rect = canvas.getBoundingClientRect();
      var x = event.targetTouches[0].clientX - rect.left;
      var y = event.targetTouches[0].clientY - rect.top;
  
      // Make sure the joystick doesn't move beyond the maximum allowed radius (maxMoveStick)
      var dx = x - centerX;
      var dy = y - centerY;
      var distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > maxMoveStick) {
        x = centerX + dx / distance * maxMoveStick;
        y = centerY + dy / distance * maxMoveStick;
      }
  
      // Update movedX and movedY
      movedX = x;
      movedY = y;
  
      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
  
      // Redraw the joystick
      drawExternal();
      drawInternal();
  
      parameters.onChange && parameters.onChange();
    }

    function onTouchEnd(event){
      pressed = 0;
      // If required reset position store variable
      if (autoReturnToCenter){
			  movedX = centerX;
			  movedY = centerY;
		  }
      // Delete canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      // Redraw object
      drawExternal();
      drawInternal();
      //canvas.unbind('touchmove');
      parameters.onChange && parameters.onChange();
    }

    // Events for manage mouse
    function onMouseDown(event) {
      pressed = 1;
    }

    function onMouseMove(event) {
      if (pressed !== 1)
        return;
  
      // Calculate the position of the mouse relative to the canvas
      var rect = canvas.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
  
      // Make sure the joystick doesn't move beyond the maximum allowed radius (maxMoveStick)
      var dx = x - centerX;
      var dy = y - centerY;
      var distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > maxMoveStick) {
        x = centerX + dx / distance * maxMoveStick;
        y = centerY + dy / distance * maxMoveStick;
      }
  
      // Update movedX and movedY
      movedX = x;
      movedY = y;
  
      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
  
      // Redraw the joystick
      drawExternal();
      drawInternal();
  
      parameters.onChange && parameters.onChange();
    }

    function onMouseUp(event) {
      pressed = 0;
      // If required reset position store variable
      if(autoReturnToCenter)
      {
			  movedX = centerX;
			  movedY = centerY;
      }
      // Delete canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      // Redraw object
      drawExternal();
      drawInternal();
      //canvas.unbind('mousemove');
      parameters.onChange && parameters.onChange();
    }
    
    // Public methods
    
    this.getX = function (){
      return (movedX - centerX)/maxMoveStick;
    };
    this.getY = function (){
      return (centerY - movedY)/maxMoveStick;
    };
    this.getDir = function () {
      var horizontal = movedX - centerX, vertical = movedY - centerY;
      return {
        dirX: (horizontal < directionHorizontalLimitNeg) ? -1 : (horizontal > directionHorizontalLimitPos) ? 1 : 0,
        dirY: (vertical < directionVerticalLimitNeg) ? -1 : (vertical > directionVerticalLimitPos) ? 1 : 0,
      };
    };
    this.remove = function(){
      objContainer = null;
      canvas.remove();
      canvas = null;
      context = null;
    };
  });

  var JoyButton = (function(container, parameters){
    var objContainer = document.getElementById(container);
    var btn = document.createElement("button");
    btn.id = parameters.title || "joybutton";
    btn.style = "background-color:#046DAA;border-width:10px;border-radius:50%;width:152px;height:152px;margin:24px";
    btn.innerText = parameters.innerText || "";
    objContainer.appendChild(btn);
    var pressed = false;
    function onBS(event){
      pressed = true;
      parameters.onChange && parameters.onChange(pressed);
    }
    function onBE(event){
      pressed = false;
      parameters.onChange && parameters.onChange(pressed);
    }
    if ("ontouchstart" in document.documentElement){
      btn.addEventListener("touchstart", onBS, false);
      btn.addEventListener("touchend", onBE, false);
    }
    else{
      btn.addEventListener("mousedown", onBS, false);
      btn.addEventListener("mouseup", onBE, false);
    }
    this.isPressed = function(){
      return pressed;
    };
    this.remove = function(){
      objContainer = null;
      btn.remove();
      btn = null;
	  };
  });

  var that = this;
  var joyS, joyB, mainDiv, observer;
  var lastValues = {dirX: 0, dirY: 0, kick: false};
  
  function onInputChange(){
    that.room.setKeyState(Utils.keyState(lastValues.dirX, lastValues.dirY, lastValues.kick));
  }
  
  function update(values){
    var change = false;
    if (typeof values.pressed != "undefined" && values.pressed != lastValues.kick){
      lastValues.kick = values.pressed;
      change = true;
    }
    if (typeof values.dirX != "undefined" && (values.dirX != lastValues.dirX || values.dirY != lastValues.dirY)){
      lastValues.dirX = values.dirX;
      lastValues.dirY = values.dirY;
      change = true;
    }
    if (change)
      onInputChange();
  }
  
  function appendDiv(){
    var canvas = document.getElementsByClassName("canvas")[0];
    if (!canvas || document.getElementById("joyDiv")!=null)
      return;
    canvas.parentElement.insertBefore(mainDiv, canvas);
    joyS = new JoyStick("joyDiv", {
      onChange: ()=>{
        update(joyS.getDir());
      }
    });
    joyB = new JoyButton("btnDiv", {
      innerText: "Kick", 
      onChange: (pressed)=>{
        update({pressed});
      }
    });
  }
  
  function removeDiv(){
    joyS?.remove();
    joyB?.remove();
    joyS = null;
    joyB = null;
  }
  
  function observerCallback(mutationList){
    mutationList.forEach((x)=>{
      if (x.addedNodes[0]?.className=="game-state-view")
        appendDiv();
      else if (x.removedNodes[0]?.className=="game-state-view")
        removeDiv();
    });
  }
  
  this.initialize = function(){
    mainDiv = document.createElement("div");
    mainDiv.style = "position:fixed;right:0px;bottom:calc(4% + 110px);display:inline-block;clear:both;width:100%;padding:0 20px;box-sizing:border-box;zIndex:9999;opacity:"+that.opacity;
    mainDiv.innerHTML = `<div style="float:left;min-width:200px"><div id="btnDiv" style="width:200px;height:200px;"></div></div><div style="float:right;min-width:200px;"><div id="joyDiv" style="width:200px;height:200px;"></div></div>`;
    appendDiv();
    var f = ()=>{
      var ts = document.getElementsByClassName("top-section")[0];
      if (!ts){
        setTimeout(f, 100);
        return;
      }
      observer = new MutationObserver(observerCallback);
      observer.observe(ts, { childList: true });
    };
    setTimeout(f, 1000);
  };
  
	this.finalize = function(){
    observer?.disconnect();
    removeDiv();
    mainDiv.remove();
    observer = null;
    mainDiv = null;
  };
  
  this.onVariableValueChange = function(addonObject, variableName, oldValue, newValue){
    if (that!=addonObject)
      return;
    if (variableName=="opacity")
      mainDiv.style.opacity = newValue;
  };
};
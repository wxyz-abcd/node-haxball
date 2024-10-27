module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "shake", true, {
    version: "0.1",
    author: "abc",
    description: `This plugin shakes your player in the direction that is always perpendicular to your current moving direction. Only players that use extrapolation will see the effects.`,
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom
  });

  var coeff = -1, dir = {
    x: 0, 
    y: 0
  };

  this.onGameTick = function(){
    var p = this.room.currentPlayer;
    if (!p.disc)
      return;
    var {x, y} = dir;
    if (x==0 && y==0){
      coeff = -1;
      return;
    }
    var {dirX, dirY, kick} = Utils.reverseKeyState(p.input);
    this.room.setKeyState(Utils.keyState(x-coeff*dirY, y+coeff*dirX, kick));
    coeff = -coeff;
  };

  this.onKeyDown = function({code}){
    switch(code){
      case "KeyA":
      case "ArrowLeft":
        if (dir.x==1)
          dir.x = 0;
        else
          dir.x = -1;
        break;
      case "KeyD":
      case "ArrowRight":
        if (dir.x==-1)
          dir.x = 0;
        else
          dir.x = 1;
        break;
      case "KeyW":
      case "ArrowUp":
        if (dir.y==1)
          dir.y = 0;
        else
          dir.y = -1;
        break;
      case "KeyS":
      case "ArrowDown":
        if (dir.y==-1)
          dir.y = 0;
        else
          dir.y = 1;
        break;
    }
  };

  this.onKeyUp = function({code}){
    switch(code){
      case "KeyA":
      case "ArrowLeft":
        if (dir.x==0)
          dir.x = 1;
        else
          dir.x = 0;
        break;
      case "KeyD":
      case "ArrowRight":
        if (dir.x==0)
          dir.x = -1;
        else
          dir.x = 0;
        break;
      case "KeyW":
      case "ArrowUp":
        if (dir.y==0)
          dir.y = 1;
        else
          dir.y = 0;
        break;
      case "KeyS":
      case "ArrowDown":
        if (dir.y==0)
          dir.y = -1;
        else
          dir.y = 0;
        break;
    }
  };
}
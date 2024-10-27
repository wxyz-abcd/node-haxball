module.exports = function (API) {
    const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API;
  
    Object.setPrototypeOf(this, Plugin.prototype);
    Plugin.call(this, "Jitter Mode", false, {
      version: "0.1",
      author: "Luks",
      description: `This plugin will make you jitter in circle.`,
      allowFlags: AllowFlags.JoinRoom | AllowFlags.CreateRoom
    });
  
  
    this.defineVariable({
      name: "moveInterval",
      description: "How fast to move",
      type: VariableType.Number,
      value: 15,
      range: {
        min: 0,
        step: 5
      }
    });
  
    var that = this, interval, active = false;
    this.onKeyDown = function(e){
      if (e.code=="KeyZ") active = !active
    }
    function jitterCircle(jitterInt){
  
          const keyStates = [
        API.Utils.keyState(1, 0, false),  // Right
        API.Utils.keyState(0, -1, false), // Down
        API.Utils.keyState(-1, 0, false), // Left
        API.Utils.keyState(0, 1, false)   // Up
      ];
      
      let index = 0; 
      
      interval = setInterval(() => {
        if(!active) return
        if(!that.active) return
        that.room.setKeyState(keyStates[index]);
  
        index = (index + 1) % keyStates.length; 
      }, jitterInt); 
    }
  
    this.initialize = () => {
      jitterCircle(that.moveInterval)
    };
  
    this.finalize = () => {
      that = null;
      clearInterval(interval);
      interval = null;
    };
  
    this.onVariableValueChange = (addonObject, variableName, oldValue, newValue) => {
      if (addonObject == that && variableName == "moveInterval") {
        clearInterval(interval);
        interval = null;
        jitterCircle(newValue)
      }
    };
  
  }
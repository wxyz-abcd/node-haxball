module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "CMD_speedHack", true, { // "CMD_speedHack" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin can modify the movement speed of individual players using the gravity and speed properties. 
    Available commands: 
    - !speedHack [id] [value]: Activates/deactivates speedhack for the player whose playerId=[id].
    - !speedHackProp [id] [prop] [value]: set the value of a speedhack property for the player whose playerId=[id].`,
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });

  this.defineVariable({
    name: "instaStop",
    description: "Initial value of instant stop for all players",
    type: VariableType.Boolean,
    value: true
  });

  this.defineVariable({
    name: "xCoefficient",
    description: "Initial value of x coefficient for all players",
    type: VariableType.Number,
    value: 1,
    range: {
      min: -20,
      max: 20,
      step: 0.01
    }
  });

  this.defineVariable({
    name: "yCoefficient",
    description: "Initial value of y coefficient for all players",
    type: VariableType.Number,
    value: 1,
    range: {
      min: -20,
      max: 20,
      step: 0.01
    }
  });

  var playerProps, permissionCtx, permissionIds, that = this;

  this.initialize = function(){
    playerProps = {};
    permissionCtx = that.room.librariesMap.permissions?.createContext("speedHack");
    if (permissionCtx)
      permissionIds = {
        speedHack: permissionCtx.addPermission("speedHack"),
        speedHackProps: permissionCtx.addPermission("speedHackProps")
      };
    that.room.librariesMap.commands?.add({
      name: "speedHack",
      parameters: [{
        name: "playerId",
        type: VariableType.Integer,
        range: {
          min: 0
        }
      }, {
        name: "value",
        type: VariableType.Boolean
      }],
      minParameterCount: 2,
      helpText: "Activates/deactivates speedhack for a player.",
      callback: ({playerId, value}, byId) => {
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.speedHack)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        if (playerProps[playerId])
          playerProps[playerId].enabled = value;
        else
          playerProps[playerId] = {
            enabled: value,
            instaStop: that.instaStop,
            xCoef: that.xCoefficient,
            yCoef: that.yCoefficient
          };
      }
    });
    that.room.librariesMap.commands?.add({
      name: "speedHackProps",
      parameters: [{
        name: "playerId",
        type: VariableType.Integer,
        range: {
          min: 0
        }
      }, {
        name: "prop",
        type: VariableType.Integer,
        range: {
          min: 0,
          max: 2
        }
      }, {
        name: "value",
        type: VariableType.String
      }],
      minParameterCount: 3,
      helpText: "Changes speedhack parameters for a player.",
      callback: ({playerId, prop, value}, byId) => {
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.speedHackProps)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        var props = playerProps[playerId], f;
        if (!props)
          props = {
            enabled: false,
            instaStop: that.instaStop,
            xCoef: that.xCoefficient,
            yCoef: that.yCoefficient
          };
        switch(prop){
          case 0:
            props.instaStop = (value=="1");
            break;
          case 1:
            f = parseFloat(value);
            if (isNaN(f))
              break;
            props.xCoef = f;
            break;
          case 2:
            f = parseFloat(value);
            if (isNaN(f))
              break;
            props.yCoef = f;
            break;
        }
        playerProps[playerId] = props;
      }
    });
  };

  this.finalize = function(){
    that.room.librariesMap?.commands?.remove("speedHack");
    that.room.librariesMap?.commands?.remove("speedHackProps");
    that.room.librariesMap?.permissions?.removeContext(permissionCtx);
    playerProps = null;
    permissionCtx = null;
    permissionIds = null;
  };

  this.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){ // this is host-only
    if (type!=OperationType.SendInput)
      return true;
    var id = msg.byId;
    var props = playerProps[id];
    if (!props?.enabled)
      return true;
    var {dirX, dirY, kick} = Utils.reverseKeyState(msg.input);
    var d = Math.abs(dirX)+Math.abs(dirY);
    if (d>0){
      d = (d==2)?Math.SQRT1_2:1;
			that.room.setPlayerDiscProperties(id, {
        xgravity: props.xCoef*dirX*d, 
        ygravity: props.yCoef*dirY*d
      });
      return true;
    }
    var prop={
      xgravity: 0, 
      ygravity: 0
    };
    if (props.instaStop && kick){
      prop.xspeed = 0;
      prop.yspeed = 0;
    }
    that.room.setPlayerDiscProperties(id, prop);
    msg.input = 0;
    return true;
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    delete playerProps[playerObj.id];
  };
};

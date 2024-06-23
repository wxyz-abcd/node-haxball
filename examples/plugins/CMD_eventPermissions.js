module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "CMD_eventPermissions", true, { // "CMD_eventPermissions" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin applies permission mechanism shallowly for all operations.`,
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });

  var permissionCtx, permissionIds, that = this;

  this.initialize = function(){
    permissionCtx = that.room.librariesMap.permissions?.createContext("eventPermissions");
    if (permissionCtx)
      permissionIds = {
        SetAvatar: permissionCtx.addPermission("SetAvatar", true),
        SendChat: permissionCtx.addPermission("SendChat", true),
        SendChatIndicator: permissionCtx.addPermission("SendChatIndicator", true),
        SendInput: permissionCtx.addPermission("SendInput", true),
        SetPlayerSync: permissionCtx.addPermission("SetPlayerSync", true),
        SetStadium: permissionCtx.addPermission("SetStadium"),
        StartGame: permissionCtx.addPermission("StartGame"),
        StopGame: permissionCtx.addPermission("StopGame"),
        PauseResumeGame: permissionCtx.addPermission("PauseResumeGame"),
        SetScoreLimit: permissionCtx.addPermission("SetScoreLimit"),
        SetTimeLimit: permissionCtx.addPermission("SetTimeLimit"),
        AutoTeams: permissionCtx.addPermission("AutoTeams"),
        SetTeamsLock: permissionCtx.addPermission("SetTeamsLock"),
        SetPlayerTeam: permissionCtx.addPermission("SetPlayerTeam"),
        SetKickRateLimit: permissionCtx.addPermission("SetKickRateLimit"),
        SetTeamColors: permissionCtx.addPermission("SetTeamColors"),
        SetPlayerAdmin: permissionCtx.addPermission("SetPlayerAdmin"),
        KickBanPlayer: permissionCtx.addPermission("KickBanPlayer"),
        //SetHeadlessAvatar: permissionCtx.addPermission("SetHeadlessAvatar"),
        //SendAnnouncement: permissionCtx.addPermission("SendAnnouncement"),
        //Ping: permissionCtx.addPermission("Ping"),
        //SetDiscProperties: permissionCtx.addPermission("SetDiscProperties"),
        //JoinRoom: permissionCtx.addPermission("JoinRoom"),
        //ReorderPlayers: permissionCtx.addPermission("ReorderPlayers"),
        //CustomEvent: permissionCtx.addPermission("CustomEvent")
      };
  };

  this.finalize = function(){
    that.room.librariesMap?.permissions?.removeContext(permissionCtx);
    permissionCtx = null;
    permissionIds = null;
  };

  this.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){ // this is host-only
    var { byId } = msg;
    switch(type){
      case OperationType.SetAvatar:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.SetAvatar)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.SendChat:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.SendChat)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.SendChatIndicator:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.SendChatIndicator)){
          //that.room.librariesMap.commands?.announcePermissionDenied(byId); // automatic event, do not need to inform.
          return false;
        }
        break;
      case OperationType.SendInput:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.SendInput)){
          //that.room.librariesMap.commands?.announcePermissionDenied(byId); // automatic event, do not need to inform.
          return false;
        }
        break;
      case OperationType.SetStadium:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.SetStadium)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.StartGame:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.StartGame)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.StopGame:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.StopGame)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.PauseResumeGame:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.PauseResumeGame)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.SetScoreLimit:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.SetScoreLimit)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.SetTimeLimit:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.SetTimeLimit)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.AutoTeams:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.AutoTeams)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.SetTeamsLock:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.SetTeamsLock)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.SetPlayerTeam:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.SetPlayerTeam)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.SetKickRateLimit:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.SetKickRateLimit)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.SetTeamColors:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.SetTeamColors)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.SetPlayerAdmin:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.SetPlayerAdmin)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.KickBanPlayer:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.KickBanPlayer)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.SetPlayerSync:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.SetPlayerSync)){
          //that.room.librariesMap.commands?.announcePermissionDenied(byId); // automatic event, do not need to inform.
          return false;
        }
        break;
      /*
      // We can have our special permissions for custom events, so this check is unnecessary.
      case OperationType.CustomEvent:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.CustomEvent)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;

      // These events are host-only, so they don't need permission checking.
      case OperationType.Ping:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.Ping)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.SetDiscProperties:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.SetDiscProperties)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.JoinRoom:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.JoinRoom)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.ReorderPlayers:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.ReorderPlayers)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      case OperationType.SetHeadlessAvatar:
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.SetHeadlessAvatar)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return false;
        }
        break;
      // Ignore command is disabled because it's complicating the permission and operationReceived codes too much for each plugin that uses chat messages. Ignoring chat should be done in custom client codes.
      // Announcement event is also host-only, BUT we had to send chat messages as announcements for ignore to work correctly.
      // Therefore, we need permission checking for this special case only.
      case OperationType.SendAnnouncement:{
        if (!that.room.pluginsMap.CMD_messaging?.ignoreActive)
          return true;
        var result = announcementNickRegex.exec(msg.msg);
        if (result?.length==3){
          byId = parseInt(result[1]);
          if (byId==0)
            return true;
          var p = that.room.players.find((x)=>x.id==byId);
          if (p.name==result[2] && !permissionCtx?.checkPlayerPermission(byId, permissionIds.SendAnnouncement)){
            //that.room.librariesMap.commands?.announcePermissionDenied(byId);
            return false;
          }
        }
        break;
      }
      */
    }
    return true;
  };
};

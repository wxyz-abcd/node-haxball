module.exports = function (API) {
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;
  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "CMD_shareFiles", false, { // "CMD_shareFiles" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: "This plugin allows us to send files to other players.",
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });

  this.defineVariable({
    name: "playerIdToSend",
    description: "Id of the player who will receive the data.",
    type: VariableType.PlayerId,
    value: 1
  });

  this.defineVariable({
    name: "dataToSend",
    description: "Data to send.",
    type: VariableType.File
  });

  this.defineVariable({
    name: "send",
    description: "Sends a file to the selected player.",
    type: VariableType.Void,
    value: ()=>{
      if (!fsEnabled[that.playerIdToSend] || !that.dataToSend)
        return;
      var {name, size} = that.dataToSend;
      if (size>10*1024*1024){
        console.warn("blocked attempt to send a file (size > 10mb)");
        return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", (e) => {
        that.room.librariesMap.userInteractions?.activateInteraction(that.playerIdToSend, fileInteraction, {
          targetId: that.playerIdToSend,
          byId: 0,
          name: name,
          contents: e.target.result
        });
      });
      reader.readAsArrayBuffer(that.dataToSend);
    }
  });

  function meaningfulSize(byteLength){
    const v = (1<<10)-1, gb = (byteLength&(v<<30))>>30, mb = (byteLength&(v<<20))>>20, kb = (byteLength&(v<<10))>>10, b = byteLength&v, str = [];
    gb>0 && str.push(gb+" gb");
    mb>0 && str.push(mb+" mb");
    kb>0 && str.push(kb+" kb");
    b>0 && str.push(b+" bytes");
    return str.join(" + ");
  }

  var that = this, fileInteraction = null, fsEnabled = null;

  this.initialize = function(){
    that.room.librariesMap.commands?.add({
      name: "fs_answer",
      parameters: [{
        name: "answer",
        type: VariableType.String,
        range: {
          min: 1,
          max: 1
        }
      }],
      minParameterCount: 1,
      helpText: "Accept or reject a file.",
      callback: ({answer}, byId) => {
        if (answer=="y")
          answer=true;
        else if (answer=="n")
          answer=false;
        else
          return;
        that.room.librariesMap.userInteractions?.onInput(byId, answer, byId);
      }
    });
    that.room.librariesMap.commands?.add({
      name: "fs_allow",
      parameters: [{
        name: "value",
        type: VariableType.Boolean
      }],
      minParameterCount: 1,
      helpText: "Enables or disables file sharing.",
      callback: ({value}, byId) => {
        fsEnabled[byId] = value;
      }
    });
    fileInteraction = that.room.librariesMap.userInteractions?.createYesNoChatInteraction(({playerId, data})=>{
      return (that.room.getPlayer(data.byId)?.name || "")+" ["+data.byId+"]"+" is trying to send a file (name='"+data.name+"', size="+meaningfulSize(data.contents.byteLength)+") to you. Do you accept it? (Answer with !fs_answer [y|n])";
    }, (playerId, {targetId, byId, name, contents})=>{
      if (targetId==0)
        that.room.librariesMap.gui?.downloadFile(name, contents);
      else{
        var a = Impl.Stream.w.ha(name.length+contents.byteLength+8, true);
        a.O(byId);
        a.mc(name);
        a.Mg(contents);
        that.room.sendBinaryCustomEvent(0, a.Sb(), targetId);
      }
    }, (playerId, data)=>{
      console.log("Rejected");
    });
    fsEnabled = {};
  };

  this.finalize = function(){
    that.room.librariesMap?.commands?.remove("fs_answer");
    fileInteraction = null;
    fsEnabled = null;
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    delete fsEnabled[playerObj.id];
  };

  this.onOperationReceived = function(type, msg){
    if (type!=OperationType.BinaryCustomEvent)
      return true;
    var {type, data, byId} = msg;
    if (type!=1 || byId==0)
      return true;
    var b = new Impl.Stream.F(new DataView(data.buffer, data.byteOffset, data.byteLength), true), targetId = b.M();
    if (!fsEnabled[targetId] || !that.room.getPlayer(targetId))
      return false;
    var name = b.ic(), contents = b.sb();
    that.room.librariesMap.userInteractions?.activateInteraction(targetId, fileInteraction, {
      targetId,
      byId,
      name,
      contents
    });
  };
}
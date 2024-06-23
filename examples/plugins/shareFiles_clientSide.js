module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "shareFiles_clientSide", false, { // "shareFiles_clientSide" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin allows us to send files to other players.`,
    allowFlags: AllowFlags.JoinRoom // We allow this plugin to be activated on JoinRoom only.
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
      var {name, size} = that.dataToSend;
      if (size>10*1024*1024){
        console.warn("blocked attempt to send a file (size > 10mb)");
        return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", (e) => {
        var a = Impl.Stream.w.ha(name.length+size+12, true);
        a.O(that.playerIdToSend);
        a.mc(name);
        a.Mg(e.target.result);
        that.room.sendBinaryCustomEvent(1, a.Sb(), 0);
      });
      reader.readAsArrayBuffer(that.dataToSend);
    }
  });

  var that = this;

  this.onBinaryCustomEvent = function(type, data, byId){
    if (type!=0 || byId!=0)
      return;
    var b = new Impl.Stream.F(new DataView(data.buffer, data.byteOffset, data.byteLength), true);
    var sourceId = b.M();
    if (!that.room.getPlayer(sourceId))
      return;
    var name = b.ic();
    var contents = b.sb();
    console.log("received file from player "+sourceId);
    that.room.librariesMap.gui?.downloadFile(name, contents);
  };
}

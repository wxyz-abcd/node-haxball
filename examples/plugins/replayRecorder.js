module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "replayRecorder", true, { // "replayRecorder" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: `This plugin allows the host to record replays.`,
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });
  
  this.defineVariable({
    name: "fileName",
    type: VariableType.String,
    value: "replay.hbr2",
    range: {
      min: 1,
      max: Infinity
    },
    description: "Name of the replay file to be saved."
  });

  this.defineVariable({
    name: "toggleRecording",
    type: VariableType.Void,
    value: ()=>{
      if (replay)
        endRecording(that.room.currentFrameNo);
      else
        startRecording(that.room.currentFrameNo);
    },
    description: "Starts or stops recording the replay file."
  });

  var that = this, replay = null, startFrameNo = -1;

  function startRecording(frameNo){
    if (replay)
      return;
    replay = new Replay.ReplayData();
    replay.roomData = that.room.state.copy();
    startFrameNo = frameNo;
  }

  function endRecording(frameNo){
    if (!replay)
      return;
    replay.totalFrames = frameNo-startFrameNo;
    replay.events.forEach((e)=>{
      e.frameNo -= startFrameNo;
    });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([Replay.writeAll(replay)], {
      type: "application/octet-stream"
    }));
    a.download = that.fileName;
    a.click();
    replay = null;
  }

  this.onOperationReceived = function(type, msg, globalFrameNo){
    if (!replay)
      return true;
    msg.frameNo = globalFrameNo;
    replay.events.push(msg);
    return true;
  }
};

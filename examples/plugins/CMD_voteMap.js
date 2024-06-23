module.exports = function (API) {
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;
  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "CMD_voteMap", true, { // "CMD_voteMap" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: "This plugin allows us to send files to other players.",
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });

  this.defineVariable({
    name: "activate",
    description: "Activates the map voting.",
    type: VariableType.Void,
    value: ()=>{
      that.room.librariesMap.userInteractions?.activateInteraction(null, votingInteraction, new Map());
    }
  });

  var that = this, votingInteraction = null;

  this.initialize = function(){
    var voteValues;
    that.room.librariesMap.commands?.add({
      name: "votemap",
      parameters: [{
        name: "vote",
        type: VariableType.String
      }],
      minParameterCount: 1,
      helpText: "Vote for a map.",
      callback: ({vote}, byId) => {
        if (!Object.keys(voteValues).includes(vote))
          return;
        that.room.librariesMap.userInteractions?.onInput(null, vote, byId);
      }
    });
    votingInteraction = that.room.librariesMap.userInteractions?.createVotingChatInteraction((activeInteraction)=>{
      voteValues = {};
      Utils.getDefaultStadiums().forEach((stadium)=>{
        voteValues[stadium.Bh]=stadium.name;
      });
      return "Voting has started. Answer with !votemap [value]. Accepted values are: \n"+Object.keys(voteValues).map(x=>x+": "+voteValues[x]).join("\n");
    }, (activeInteraction, currentPlayerId, input)=>{
      if (voteValues[input]!=null)
        activeInteraction.data.set(currentPlayerId, input);
    }, (activeInteraction)=>{
      var x={}, max=-1, maxv=null;
      activeInteraction.data.forEach((v)=>{
        x[v]=(x[v]||0)+1;
        if (x[v]>max){
          max=x[v];
          maxv=v;
        }
      });
      var s = Utils.getDefaultStadiums()[maxv];
      if (!s)
        return;
      that.room.stopGame();
      that.room.setCurrentStadium(s, ()=>{});
      that.room.startGame();
    });
  };

  this.finalize = function(){
    that.room.librariesMap?.commands?.remove("votemap");
    votingInteraction = null;
  };

}
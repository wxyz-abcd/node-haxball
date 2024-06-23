module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Library.prototype);
  Library.call(this, "userInteractions", { // "userInteractions" is library's name. Every library should have a unique name.
    version: 0.1,
    author: "abc",
    description: `This is a library that contains functions to initialize helper structures that may define complex user interactions.`
  });

  this.defineVariable({
    name: "defaultColor",
    description: "The color of default announcement messages. (in css format)",
    type: VariableType.String,
    value: "rgb(255,255,0)"
  });

  this.defineVariable({
    name: "defaultStyle",
    description: "The style of default announcement messages. ('normal', 'bold', 'italic', 'small', 'small-bold', 'small-italic')",
    type: VariableType.String,
    value: "italic"
  });

  this.defineVariable({
    name: "defaultFont",
    description: "The font of default announcement messages.",
    type: VariableType.Integer,
    value: 1
  });

  var thisLibrary = this, activeInteractions = new Map();

  function Node(){
    this.onActivate = null;
    this.onDeactivate = null;
  }

  function Edge(){
    this.n1 = null;
    this.n2 = null;
    this.condition = null;
  }

  function InteractionGraph(){
    this.edges = [];
    this.startNode = null;
    this.onEnd = null;
  }

  InteractionGraph.prototype = {
    addNode: function(onActivate, onDeactivate){
      var n = new Node();
      n.onActivate = onActivate;
      n.onDeactivate = onDeactivate
      return n;
    },
    addEdge: function(node1, node2, condition){
      var e = new Edge();
      e.n1 = node1;
      e.n2 = node2;
      e.condition = condition;
      this.edges.push(e);
      return e;
    },
    removeNode: function(node){
      if (node==this.startNode)
        this.startNode = null;
      var t = [];
      this.edges.forEach((x,i)=>{
        if (x.n1==node || x.n2==node)
          t.unshift(i);
      });
      t.forEach((i)=>{
        this.edges.splice(i, 1);
      });
    },
    removeEdge: function(edge){
      var idx = this.edges.indexOf(edge);
      if (idx<0)
        return false;
      this.edges.splice(idx, 1);
      return true;
    }
  };

  function ActiveInteraction(){
    this.playerId = null;
    this.interaction = null;
    this.currentNode = null;
    this.data = null;
    this.possibleEdges = [];
  }

  ActiveInteraction.create = function(playerId, interaction, customData){
    if (!interaction?.startNode || activeInteractions.get(playerId)!=null)
      return;
    var i = new ActiveInteraction();
    i.playerId = playerId;
    i.interaction = interaction;
    i.data = customData;
    activeInteractions.set(playerId, i);
    i.activateNode(interaction.startNode);
    return i;
  };

  ActiveInteraction.prototype = {
    destroy: function(){
      this.currentNode?.onDeactivate?.(this);
      activeInteractions.delete(this.playerId);
      this.currentNode = null;
      this.interaction = null;
      this.data = null;
      this.possibleEdges = null;
    },
    activateNode: function(node){
      if (!node)
        return;
      this.currentNode?.onDeactivate?.(this);
      this.currentNode = node;
      this.possibleEdges = this.interaction.edges.filter((x)=>x.n1==node);
      this.currentNode.onActivate?.(this);
    },
    processInput: function(playerId, input){
      var l = this.possibleEdges.length;
      if (l==0){
        this.interaction.onEnd?.(this, playerId, input);
        this.destroy();
        return 2;
      }
      for (var i=0;i<l;i++){
        var { n2, condition } = this.possibleEdges[i];
        if (!condition || condition(this, playerId, input)){
          this.activateNode(n2);
          return 1;
        }
      }
      return 0;
    }
  };

  this.createInteraction = function(callbacks){
    return Object.assign(new InteractionGraph(), callbacks);
  };

  this.activateInteraction = function(playerId, interaction, customData){
    return ActiveInteraction.create(playerId, interaction, customData);
  };

  this.createYesNoChatInteraction = function(fQuestion, onAccept, onReject){
    var i = thisLibrary.createInteraction({
      onInput: (input, id, activeInteraction)=>{
        return activeInteraction.processInput(id, input);
      }
    });
    var n = i.addNode((activeInteraction)=>{
      thisLibrary.room.sendAnnouncement(fQuestion(activeInteraction), activeInteraction.playerId, Utils.colorToNumber(thisLibrary.defaultColor), thisLibrary.defaultStyle, thisLibrary.defaultFont);
    });
    i.startNode = n;
    i.onEnd = (activeInteraction, currentPlayerId, input)=>{
      if (input)
        onAccept(currentPlayerId, activeInteraction.data);
      else
        onReject(currentPlayerId, activeInteraction.data);
    };
    return i;
  };

  this.createVotingChatInteraction = function(fVotingAnnouncement, onVote, onEnd){
    var i = thisLibrary.createInteraction({
      onInput: (input, id, activeInteraction)=>{
        return activeInteraction.processInput(id, input);
      }
    });
    var n1 = i.addNode((activeInteraction)=>{
      thisLibrary.room.sendAnnouncement(fVotingAnnouncement?.(activeInteraction), activeInteraction.playerId, Utils.colorToNumber(thisLibrary.defaultColor), thisLibrary.defaultStyle, thisLibrary.defaultFont);
    });
    i.startNode = n1;
    var n2 = i.addNode((activeInteraction)=>{
      activeInteraction.processInput();
    });
    function check(data){
      var p = thisLibrary.room.players;
      for (var i=0;i<p.length;i++)
        if (!data.has(p[i].id))
          return false;
      return true;
    }
    i.addEdge(n1, n2, (activeInteraction, currentPlayerId, input)=>{
      onVote?.(activeInteraction, currentPlayerId, input);
      return check(activeInteraction.data);
    });
    i.onEnd = (activeInteraction, currentPlayerId, input)=>{
      onEnd?.(activeInteraction);
    };
    return i;
  };

  this.onInput = function(playerId, input, id){
    var i = activeInteractions.get(playerId);
    if (!i)
      return;
    return i.interaction?.onInput?.(input, id, i);
  };

};

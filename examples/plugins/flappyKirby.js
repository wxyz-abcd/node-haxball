module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "flappyKirby", true, {
    version: "0.1",
    author: "abc",
    description: `This plugin lets you host a flappy kirby game. You also probably need to activate the flappy kriby renderer.`,
    allowFlags: AllowFlags.CreateRoom
  });

  this.defineVariable({
    name: "maxScore",
    description: "Maximum score that a player can have before the stadium is randomized.", 
    type: VariableType.Integer,
    value: 3,
    range: {
      min: 1,
      max: Infinity,
      step: 1
    }
  });

  var that = this, scores = null;
  const groundPlaneId = 1, finishPlaneId = 3;
  function generateStadium(mapWidth, mapHeight, n, cr, ch, d, kickback, vx, g, onError){ // n: number of columns, ch: column height, cr: column radius
    var w = mapWidth/2, h = mapHeight/2;
    if (w<60 || h<60){
      onError("Width and height must be > 120");
      return null;
    }
    var map = {
      "name" : "abc\'s Flappy Kirby {w:"+mapWidth+", h:"+mapHeight+", n:"+n+", cr:"+cr+", ch:"+ch+", d:"+d+", kb:"+kickback+", vx:"+vx+", g:"+g+"}",
      "width" : w,
      "height" : h,
      "bg" : { "type" : "", "width" : 1, "height" : 1, "color" : "454C5E" },
      "vertexes" : [
        /* 0 */ { "x" : w-30, "y" : 30-h },
        /* 1 */ { "x" : 30-w, "y" : 30-h },
        /* 2 */ { "x" : 30-w, "y" : h-30 },
        /* 3 */ { "x" : w-30, "y" : h-30 },
        /* 4 */ { "x" : 30-w, "y" : 30-h },
        /* 5 */ { "x" : 30-w, "y" : h-30 },
        /* 6 */ { "x" : w-30, "y" : 30-h },
        /* 7 */ { "x" : w-30, "y" : h-30 }
      ],
      "segments" : [
        { "v0" : 0, "v1" : 1, "curve" : 0, "trait": "customPlane" },
        { "v0" : 2, "v1" : 3, "curve" : 0, "trait": "customPlane" },
        { "v0" : 4, "v1" : 5, "curve" : 0, "trait": "customPlane" },
        { "v0" : 6, "v1" : 7, "curve" : 0, "trait": "customPlane" }
      ],
      "planes" : [
        { "normal" : [0,1], "dist" : 30-h, "trait": "customPlane" },
        { "normal" : [0,-1], "dist" : 30-h, "trait": "customPlane" },
        { "normal" : [1,0], "dist" : 30-w, "trait": "customPlane" },
        { "normal" : [-1,0], "dist" : 30-w, "trait": "customPlane" }
      ],
      "goals" : [],
      "discs" : [
        { "radius" : 20000000, "invMass" : 0, "pos" : [0,10000000], "color" : "transparent", "cMask" : ["none"], "cGroup" : ["kick"] }
      ],
      "playerPhysics" : {
        "kickStrength" : 0,
        "acceleration": 0,
        "xspeed": vx,
        "kickingAcceleration" : 0,
        "damping" : 1,
        "kickingDamping" : 1,
        "kickback" : kickback,
        "gravity" : [0, g]
      },
      "ballPhysics" : "disc0",
      "spawnDistance" : h-60,
      "traits" : {
        "customPlane": {
          "color": "a3acc2", 
          "bCoef" : 0,
          "bias": 0,
          "bCoef" : 0,
          "cMask": ["c0"],
          "cGroup": ["wall"]
        },
        "colliderWall": {
          "color": "eb8934", 
          "bias": 0,
          "bCoef" : 0,
          "cMask": ["c0"],
          "cGroup": ["wall"]
        }
      },
      "joints" : [],
      "redSpawnPoints" : [[60-w, 60-h]],
      "blueSpawnPoints" : [[60-w, 60-h]],
      "canBeStored" : true,
      "cameraFollow" : "player"
    };
    
    w-=60;
    var x = (d-n*(d+2*cr))/2
    for (var i=0;i<n;i++,x+=2*cr+d){
      var currentVertexIndex = map.vertexes.length;
      if (i%2==0){
        map.vertexes.push({ "x" : x, "y" : h-30 });// A
        map.vertexes.push({ "x" : x+2*cr, "y" : h-30 });// B
        map.vertexes.push({ "x" : x, "y" : h-30-ch });// C
        map.vertexes.push({ "x" : x+2*cr, "y" : h-30-ch });// D
        map.segments.push({ "v0" : currentVertexIndex, "v1" : currentVertexIndex+2, "curve" : 0, "trait": "colliderWall" });
        map.segments.push({ "v0" : currentVertexIndex+2, "v1" : currentVertexIndex+3, "curve" : 180, "trait": "colliderWall" });
        map.segments.push({ "v0" : currentVertexIndex+3, "v1" : currentVertexIndex+1, "curve" : 0, "trait": "colliderWall" });
      }
      else{
        map.vertexes.push({ "x" : x, "y" : 30-h });// A
        map.vertexes.push({ "x" : x+2*cr, "y" : 30-h });// B
        map.vertexes.push({ "x" : x, "y" : 30-h+ch });// C
        map.vertexes.push({ "x" : x+2*cr, "y" : 30-h+ch });// D
        map.segments.push({ "v0" : currentVertexIndex, "v1" : currentVertexIndex+2, "curve" : 0, "trait": "colliderWall" });
        map.segments.push({ "v0" : currentVertexIndex+2, "v1" : currentVertexIndex+3, "curve" : -180, "trait": "colliderWall" });
        map.segments.push({ "v0" : currentVertexIndex+3, "v1" : currentVertexIndex+1, "curve" : 0, "trait": "colliderWall" });
      }
    }
    var s = Utils.parseStadium(JSON.stringify(map), onError);
    if (s)
      s.initialXVelocity = vx;
    return s;
  }

  function generateRandomStadium(onError){
    const offsetDist = 120;
    var w, h, n, cr, ch, d, kickback, vx, g;
    w = (1000+Math.random()*5000)|0;
    h = (200+Math.random()*800)|0;
    cr = (h/100+Math.random()*(h/100))|0;
    ch = (h/2.5+Math.random()*(h/10))|0;
    d = (60+2*cr+Math.random()*(w/100))|0;
    kickback = ((3+(ch/h)*3+Math.random()*15)*0.6)|0;
    vx = (1+0.0001*w*Math.random())|0;
    if ((2*ch-h)>0)
      vx/=8*(2*ch-h);
    else
      vx*=1.2;
    g = (((h/7500+(ch/h)/1000+Math.random()*0.075)*100)|0)/100;
    var nmin=((3*w/5-60+d)/(d+2*cr))|0, nmax = (w+d-60-2*offsetDist)/(d+2*cr)|0;
    //console.log(nmin, nmax);
    n = (nmin+Math.random()*(nmax-nmin))|0;
    return generateStadium(w, h, n, cr, ch, d, kickback, vx, g, onError);
  }
  
  var stadium, initializeScheduled = false;

  function updatePlayerDiscs(){
    setTimeout(()=>{
      that.room.state.players.forEach((player)=>{
        if (player.disc!=null){
          that.room.setPlayerDiscProperties(player.id, {
            x: 60-stadium.width,
            y: 60-stadium.height,
            xspeed: stadium.initialXVelocity,
            yspeed: 0,
            cGroup: 1<<CollisionFlags.c0
          });
        }
      });
    }, 100);
  }
  
  function resetScores(){
    scores = {};
    that.room.hostPing = 0;
  }

  function resetCoordinateLater(playerId){
    Utils.runAfterGameTick(()=>{
      if (stadium)
        that.room.setPlayerDiscProperties(playerId, {
          x: 60-stadium.width,
          y: 60-stadium.height,
          xspeed: stadium.initialXVelocity,
          yspeed: 0
        });
    });
  }
  
  this.initialize = function(){
    setTimeout(()=>{
      do{
        stadium = generateRandomStadium(console.log);
      } while(!stadium);
      resetScores();
      that.room.stopGame();
      that.room.setCurrentStadium(stadium, console.log);
      that.room.startGame();
      updatePlayerDiscs();
    }, 100);
  };

  this.finalize = function(){
    scores = null;
  };

  this.onCollisionDiscVsPlane = function(discId, discPlayerId, planeId){
    if (planeId!=finishPlaneId){
      if (planeId!=groundPlaneId)
        return;
      resetCoordinateLater(discPlayerId);
      return;
    }
    var x=(scores[discPlayerId]|0)+1;
    scores[discPlayerId]=x;
    if (discPlayerId==0)
      that.room.hostPing=x|0;
    if (!initializeScheduled && x>=that.maxScore){
      initializeScheduled = true;
      var name = that.room.players.find((x)=>x.id==discPlayerId)?.name||"?";
      setTimeout(()=>{
        initializeScheduled = false;
        that.room.sendAnnouncement("Congratulations, "+name+"!", null, 0x15cf31, 4, 2);
        that.initialize();
      }, 100);
    }
    else
      resetCoordinateLater(discPlayerId);
  };
  
  this.onCollisionDiscVsSegment = function(discId, discPlayerId, segmentId){
    if (discPlayerId==null)
      return;
    resetCoordinateLater(discPlayerId);
  };
  
  this.onGameStart = function(){
    updatePlayerDiscs();
  };
  
  this.onGameStop = function(){
    resetScores();
  };
  
  this.onPlayerTeamChange = function(id, teamId, byId){
    setTimeout(()=>{
      var player = that.room.state.players.find((x)=>x.id==id);
      if (player?.disc!=null){
        that.room.setPlayerDiscProperties(id, {
          x: 60-stadium.width,
          y: 60-stadium.height,
          xspeed: stadium.initialXVelocity,
          yspeed: 0,
          cGroup: 1<<CollisionFlags.c0
        });
      }
    }, 100);
  };

  this.onPlayerJoin = function(playerObj){
    if (scores){
      scores[playerObj.id] = 0;
      that.room.setPlayerTeam(playerObj.id, 1);
    }
  };
  
  this.onPlayerLeave = function(playerObj, reason, isBanned, byId){
    if (scores)
      delete scores[playerObj?.id];
  };

  this.modifyPlayerPing = function(playerId, ping){
    return scores ? (scores[playerId] | 0) : 0;
  };
}
module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;
  
  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "CMD_realSoccer", true, { // "CMD_realSoccer" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.2",
    author: "abc",
    description: "This plugin sets up a real soccer game.",
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });

  this.defineVariable({
    name: "timeLimit",
    description: "Time limit of the game (in seconds)",
    type: VariableType.Integer,
    value: 180,
    range: {
      min: 0,
      max: Infinity,
      step: 1
    }
  });

  this.defineVariable({
    name: "checkThrowIns",
    description: "Whether to detect throw-ins or not",
    type: VariableType.Boolean,
    value: true
  });

  this.defineVariable({
    name: "checkOuts",
    description: "Whether to detect outs or not (If disabled, corners also do not work)",
    type: VariableType.Boolean,
    value: true
  });

  this.defineVariable({
    name: "checkCorners",
    description: "Whether to detect corners or not",
    type: VariableType.Boolean,
    value: true
  });

  this.defineVariable({
    name: "checkOffsides",
    description: "Whether to detect offsides or not",
    type: VariableType.Boolean,
    value: true
  });
  
  this.defineVariable({
    name: "showDirectionIndicator",
    description: "Whether to show ball's direction on throw-ins/outs/corners",
    type: VariableType.Boolean,
    value: true
  });

  this.defineVariable({
    name: "directionIndicatorThreshold",
    description: "Maximum ball distance to a player to show the direction indicator",
    type: VariableType.Number,
    value: 45,
    range: {
      min: 0,
      max: 1000,
      step: 0.1
    }
  });

  this.defineVariable({
    name: "directionIndicatorLengthCoeff",
    description: "Coefficient about the length of the direction indicator",
    type: VariableType.Number,
    value: 50,
    range: {
      min: 0,
      max: 1000,
      step: 0.01
    }
  });
  
  this.defineVariable({
    name: "speedCoeff",
    description: "Coefficient for the speed of ball on throw-ins/outs/corners/freekicks",
    type: VariableType.Number,
    value: 0.0007,
    range: {
      min: 0,
      max: 0.005,
      step: 0.0001
    }
  });

  this.defineVariable({
    name: "announceTime",
    description: "Announces the remaining time",
    type: VariableType.Boolean,
    value: true
  });
  
  this.defineVariable({
    name: "penaltiesEnabled",
    description: "Whether to shoot penalties after the game ends in a draw",
    type: VariableType.Boolean,
    value: true
  });

  this.defineVariable({
    name: "penaltiesSaveTimeout",
    description: "Maximum waiting time before a save is recorded, in miliseconds",
    type: VariableType.Integer,
    value: 2000,
    range: {
      min: 0,
      max: 20000,
      step: 50
    }
  });

  this.defineVariable({
    name: "penaltiesTurnCount",
    description: "Number of penalties to shoot before tie breaks start",
    type: VariableType.Integer,
    value: 5,
    range: {
      min: 1,
      max: 100,
      step: 1
    }
  });

  this.defineVariable({
    name: "playerArrangementEnabled",
    description: "Whether to arrange the players each time before starting the actual game",
    type: VariableType.Boolean,
    value: true
  });

  this.defineVariable({
    name: "waitForFullFormation",
    description: "Whether to wait until there is no empty spot in both team formations",
    type: VariableType.Boolean,
    value: false
  });

  this.defineVariable({
    name: "redFormation",
    description: "Formation of the red team",
    type: VariableType.String,
    value: "4-3-3",
    range: {
      min: 1,
      max: 20
    }
  });

  this.defineVariable({
    name: "blueFormation",
    description: "Formation of the blue team",
    type: VariableType.String,
    value: "4-1-3-2",
    range: {
      min: 1,
      max: 20
    }
  });
  
  this.defineVariable({
    name: "reset",
    description: "Resets the game",
    type: VariableType.Void,
    value: completeReset
  });

  this.defineVariable({
    name: "width",
    description: "Stadium width",
    type: VariableType.Number,
    value: 1000,//1600,
    range: {
      min: 500,
      max: 5000,
      step: 10
    }
  });

  this.defineVariable({
    name: "height",
    description: "Stadium height",
    type: VariableType.Number,
    value: 670,//850,
    range: {
      min: 300,
      max: 5000,
      step: 10
    }
  });
  
  this.defineVariable({
    name: "ballRadius",
    description: "Ball's radius",
    type: VariableType.Number,
    value: 7,//8,
    range: {
      min: 0,
      max: 10000,
      step: 0.1
    }
  });

  this.defineVariable({
    name: "kickOffRadiusCoeff",
    description: "Coefficient for kick-off radius",
    type: VariableType.Number,
    value: 0.22,
    range: {
      min: 0,
      max: 0.5,
      step: 0.000001
    }
  });

  this.defineVariable({
    name: "goalSizeCoeff",
    description: "Coefficient for the size of goals",
    type: VariableType.Number,
    value: 0.16,
    range: {
      min: 0.01,
      max: 0.5,
      step: 0.0001
    }
  });

  this.defineVariable({
    name: "kickStrengthCoeff",
    description: "Coefficient for the kicking strength of players",
    type: VariableType.Number,
    value: 0.0009,
    range: {
      min: 0,
      max: 0.005,
      step: 0.0001
    }
  });

  var stadiumWidth, stadiumHeight, ballRadius;
  var throwInSpeed, cornerSpeed, outSpeed, freeKickSpeed, penaltySpeed;
  var throwInObstacleRadius, cornerObstacleRadius, outObstacleRadius, freeKickObstacleRadius;
  var blockChanges, goalY;
  var permissionCtx, permissionIds, lastTouchedPlayers = null;
  var throwInType = null, throwInTeam = null, state = 0;
  var pMap, pStats, tStats;
  var playerArrangements, formations, formationsPlayerCoords, playerArrangementRedCount, playerArrangementBlueCount;
  var penaltiesTurn, penaltyShotCount, penaltyShot, penaltySaveTimeout, cps;
  var currentInGameTicks, targetInGameTicks;
  var that = this;
  
  function reset(nextTick=true, ltp=true){
    function f(){
      that.room.setDiscProperties(5, {
        "x": NaN,
        "y": NaN
      });
      that.room.setDiscProperties(6, {
        "x": NaN,
        "y": NaN
      });
      that.room.setDiscProperties(7, {
        "x": NaN,
        "y": NaN
      });
      throwInTeam = null;
      throwInType = null;
      if (ltp)
        lastTouchedPlayers = [];
    }
    if (nextTick)
      Utils.runAfterGameTick(f);
    else
      f();
  }
  
  function createPlayerStats(){
    return {
      goals: 0,
      assists: 0,
      ownGoals: 0,
      passes: 0,
      accuratePasses: 0
    };
  }

  function createTeamStats(){
    return {
      throwIns: 0,
      corners: 0,
      outs: 0,
      offsides: 0,
      freeKicks: 0,
      passes: 0,
      accuratePasses: 0,
      ballTicks: 0, // takımın topa yüzde kaç oranla sahip olduğu
      ballInHalfTicks: 0 // topun yüzde kaç oranla hangi yarısahada bulunduğu
    };
  }

  function percentage(a,b){
    return ((b<=0)?0:(100*a/b)).toFixed(2)+"%";
  }

  function format(x, n){
    var y = ""+x;
    var nn = n*2.8-y.length*0.9;
    var k = (nn-y.length)/2;
    for (var i=0;i<k;i++)
      y="·"+y;
    while(y.length<nn)
      y=y+"·";
    return y;
  }

  function showPlayerStatistics(playerId){
    var p = pStats.get(playerId);
    that.room.librariesMap.commands?.announceInfo("Goals: "+p.goals+" OwnGoals: "+p.ownGoals+" Assists: "+p.goals+" Pass Accuracy: "+p.accuratePasses+"/"+p.passes+" ("+percentage(p.accuratePasses, p.passes)+")", playerId);
  }

  function showAllTeamStatistics(){
    var t1=tStats[1], t2=tStats[2];
    that.room.librariesMap.commands?.announceInfo("┌─────────────────────────────────────────────────────────────────────────┐");
    that.room.librariesMap.commands?.announceInfo("│"+format("Team Statistics", 73)+"│");
    that.room.librariesMap.commands?.announceInfo("├─────────────────┬───────────────────────────┬───────────────────────────┤");
    that.room.librariesMap.commands?.announceInfo("│"+format("", 17)+"│"+format("Red", 27)+"│"+format("Blue", 27)+"│");
    that.room.librariesMap.commands?.announceInfo("├─────────────────┼───────────────────────────┼───────────────────────────┤");
    that.room.librariesMap.commands?.announceInfo("│"+format("ThrowIns", 17)+"│"+format(t1.throwIns, 27)+"│"+format(t2.throwIns, 27)+"│");
    that.room.librariesMap.commands?.announceInfo("│"+format("Corners", 17)+"│"+format(t1.corners, 27)+"│"+format(t2.corners, 27)+"│");
    that.room.librariesMap.commands?.announceInfo("│"+format("Outs", 17)+"│"+format(t1.outs, 27)+"│"+format(t2.outs, 27)+"│");
    that.room.librariesMap.commands?.announceInfo("│"+format("Offsides", 17)+"│"+format(t1.offsides, 27)+"│"+format(t2.offsides, 27)+"│");
    that.room.librariesMap.commands?.announceInfo("│"+format("FreeKicks", 17)+"│"+format(t1.freeKicks, 27)+"│"+format(t2.freeKicks, 27)+"│");
    that.room.librariesMap.commands?.announceInfo("│"+format("PassAccuracy", 17)+"│"+format(t1.accuratePasses+"/"+t1.passes+" ("+percentage(t1.accuratePasses, t1.passes)+")", 27)+"│"+format(t2.accuratePasses+"/"+t2.passes+" ("+percentage(t2.accuratePasses, t2.passes)+")", 27)+"│");
    that.room.librariesMap.commands?.announceInfo("│"+format("Ball Possession", 17)+"│"+format(percentage(t1.ballTicks, currentInGameTicks), 27)+"│"+format(percentage(t2.ballTicks, currentInGameTicks), 27)+"│");
    that.room.librariesMap.commands?.announceInfo("│"+format("Ball In Own Half", 17)+"│"+format(percentage(t1.ballInHalfTicks, currentInGameTicks), 27)+"│"+format(percentage(t2.ballInHalfTicks, currentInGameTicks), 27)+"│");
    that.room.librariesMap.commands?.announceInfo("└─────────────────┴───────────────────────────┴───────────────────────────┘");
  }
  
  function checkFormation(){
    var fr = that.redFormation.split("-").map((x)=>parseInt(x.trim())).filter((x)=>!isNaN(x));
    var fb = that.blueFormation.split("-").map((x)=>parseInt(x.trim())).filter((x)=>!isNaN(x));
    formations = [null, fr, fb];
    playerArrangementRedCount = 1+fr.reduce((p,x)=>(p+x), 0);
    playerArrangementBlueCount = 1+fb.reduce((p,x)=>(p+x), 0);
    formationsPlayerCoords = [null, [], []];
    for (var t=0;t<2;t++){
      var f=formations[t+1], coeff=2*t-1;
      var x=stadiumWidth-20;
      formationsPlayerCoords[t+1].push({x: coeff*x, y: 0});
      var xStep=(stadiumWidth-20)/(1+f.length);
      x-=xStep;
      for (var i=0;i<f.length;i++){
        var yStep=2*stadiumHeight/(f[i]+1);
        for (var j=0,y=-stadiumHeight+yStep;j<f[i];j++,y+=yStep)
          formationsPlayerCoords[t+1].push({x: coeff*x, y: y});
        x-=xStep;
      }
    }
  }

  function resetAll(autoStart){
    if (state==0){
      if (that.playerArrangementEnabled)
        state=1;
      else
        state=2;
    }
    ballRadius = parseFloat(that.ballRadius);
    var w = parseFloat(that.width), h = parseFloat(that.height);
    pMap = new Map();
    pStats = new Map();
    var diagonal = Math.sqrt(w*w+h*h);
    var kickOffRadius = Math.min(w, h)*that.kickOffRadiusCoeff;
    goalY = h*that.goalSizeCoeff;
    var sc = that.speedCoeff*diagonal;
    throwInSpeed = 6*sc-0.5;
    freeKickSpeed = 7.5*sc-0.5;
    penaltySpeed = 8*sc-0.5;
    cornerSpeed = 9*sc-0.5;
    outSpeed = 12*sc-0.5;
    throwInObstacleRadius = 100*sc;
    freeKickObstacleRadius = 200*sc;
    cornerObstacleRadius = 300*sc;
    outObstacleRadius = 500*sc;
    var shackX1 = 0.03125*w, shackY1 = h-20, shackX2 = 0.25*w, shackY2 = h-90;
    lastTouchedPlayers = [];
  	stadiumWidth = w-200+ballRadius;
  	stadiumHeight = h-190+ballRadius;
    var mapObj = {
      "name" : "abc Real Soccer (w="+w+", h="+h+", br="+ballRadius+", kr="+that.kickOffRadiusCoeff+", gs="+that.goalSizeCoeff+", ks="+that.kickStrengthCoeff+")",
      "width" : w,
      "height" : h,
      "spawnDistance" : w/2-30,
      "bg" : { "type" : "grass", "width" : w-200, "height" : h-190, "kickOffRadius" : kickOffRadius, "cornerRadius" : 0 },
      "playerPhysics" : {
        "bCoef" : 0.5,
        "invMass" : 0.5,
        "damping" : 0.96101,
        "acceleration" : 0.1201,
        "kickingAcceleration" : 0.07,
        "kickingDamping" : 0.9605,
        "kickStrength" : 4.5+that.kickStrengthCoeff*diagonal
      },
      "ballPhysics" : {
        "radius" : ballRadius,
        "bCoef" : 0.5,
        "invMass" : 1,
        "damping" : 0.9902,
        "color" : "FFFFFF",
        "cMask" : ["all"],
        "cGroup" : ["ball"]
      },
    	"vertexes" : [
    		/* 0 */ { "x" : 0, "y" : (h-100), "trait" : "kickOffBarrier" },
    		/* 1 */ { "x" : 0, "y" : kickOffRadius, "trait" : "kickOffBarrier" },
    		/* 2 */ { "x" : 0, "y" : -kickOffRadius, "trait" : "kickOffBarrier" },
    		/* 3 */ { "x" : 0, "y" : -(h-100), "trait" : "kickOffBarrier" },
    		/* 4 */ { "x" : -(w-200), "y" : goalY },
    		/* 5 */ { "x" : -(w-140), "y" : goalY },
    		/* 6 */ { "x" : -(w-200), "y" : -goalY },
    		/* 7 */ { "x" : -(w-140), "y" : -goalY },
    		/* 8 */ { "x" : w-200, "y" : goalY },
    		/* 9 */ { "x" : w-140, "y" : goalY },
    		/* 10 */ { "x" : w-200, "y" : -goalY },
    		/* 11 */ { "x" : w-140, "y" : -goalY },
    		/* 12 */ { "x" : -shackX1, "y" : shackY1, "trait" : "ballArea" },
    		/* 13 */ { "x" : -shackX1, "y" : shackY2, "trait" : "ballArea" },
    		/* 14 */ { "x" : -shackX2, "y" : shackY1, "trait" : "ballArea" },
    		/* 15 */ { "x" : -shackX2, "y" : shackY2, "trait" : "ballArea" },
    		/* 16 */ { "x" : shackX2, "y" : shackY1, "trait" : "ballArea" },
    		/* 17 */ { "x" : shackX2, "y" : shackY2, "trait" : "ballArea" },
    		/* 18 */ { "x" : shackX1, "y" : shackY1, "trait" : "ballArea" },
    		/* 19 */ { "x" : shackX1, "y" : shackY2, "trait" : "ballArea" }
    	],
    	"segments" : [
    		{ "v0" : 5, "v1" : 7, "vis" : true, "bCoef" : 0.1, "cMask" : ["ball","red","blue" ], "curve" : 10, "color" : "C7E6BD" },
    		{ "v0" : 9, "v1" : 11, "vis" : true, "bCoef" : 0.1, "cMask" : ["ball","red","blue" ], "curve" : -10, "color" : "C7E6BD" },
    		{ "v0" : 4, "v1" : 5, "curve" : 5, "color" : "ffffff", "trait" : "sidegoalNet" },
    		{ "v0" : 6, "v1" : 7, "curve" : -5, "color" : "ffffff", "trait" : "sidegoalNet" },
    		{ "v0" : 8, "v1" : 9, "curve" : -5, "color" : "ffffff", "trait" : "sidegoalNet" },
    		{ "v0" : 10, "v1" : 11, "curve" : 5, "color" : "ffffff", "trait" : "sidegoalNet" },
    		{ "v0" : 15, "v1" : 14, "curve" : 0, "vis" : true, "color" : "C7E6BD", "bCoef" : 1, "cMask" : ["red","blue" ], "trait" : "ballArea" },
    		{ "v0" : 15, "v1" : 13, "curve" : 0, "vis" : true, "color" : "C7E6BD", "bCoef" : 1, "cMask" : ["red","blue" ], "trait" : "ballArea" },
    		{ "v0" : 13, "v1" : 12, "curve" : 0, "vis" : true, "color" : "C7E6BD", "bCoef" : 1, "cMask" : ["red","blue" ], "trait" : "ballArea" },
    		{ "v0" : 18, "v1" : 19, "curve" : 0, "vis" : true, "color" : "C7E6BD", "bCoef" : 1, "cMask" : ["red","blue" ], "trait" : "ballArea" },
    		{ "v0" : 19, "v1" : 17, "curve" : 0, "vis" : true, "color" : "C7E6BD", "bCoef" : 1, "cMask" : ["red","blue" ], "trait" : "ballArea" },
    		{ "v0" : 17, "v1" : 16, "curve" : 0, "vis" : true, "color" : "C7E6BD", "bCoef" : 1, "cMask" : ["red","blue" ], "trait" : "ballArea" },
    		{ "v0" : 2, "v1" : 1, "curve" : -180, "cGroup" : ["blueKO" ], "trait" : "kickOffBarrier" },
    		{ "v0" : 2, "v1" : 1, "curve" : 180, "cGroup" : ["redKO" ], "trait" : "kickOffBarrier" },
    		{ "v0" : 0, "v1" : 1, "trait" : "kickOffBarrier" },
    		{ "v0" : 2, "v1" : 3, "trait" : "kickOffBarrier" }
    	],
      "goals" : [
        { "p0" : [-(w-200),goalY], "p1" : [-(w-200),-goalY], "team" : "red" },
        { "p0" : [w-200,goalY], "p1" : [w-200,-goalY], "team" : "blue" }
      ],
      "discs" : [
        { "pos" : [-(w-200),goalY], "trait" : "goalPost" },
        { "pos" : [-(w-200),-goalY], "trait" : "goalPost" },
        { "pos" : [w-200,goalY], "trait" : "goalPost" },
        { "pos" : [w-200,-goalY], "trait" : "goalPost" },
        { "pos" : [0,0], "trait" : "obstacle" },
        { "pos" : [0,0], "trait" : "directionIndicator" },
        { "pos" : [0,0], "trait" : "directionIndicator" }
      ],
      "planes" : [
    		{ "normal" : [0,1], "dist" : -(h-150), "bCoef" : 0, "cMask" : ["ball"] },
    		{ "normal" : [0,-1], "dist" : -(h-150), "bCoef" : 0, "cMask" : ["ball"] },
    		{ "normal" : [0,1], "dist" : -(h-100), "bCoef" : 0 },
    		{ "normal" : [0,-1], "dist" : -(h-100), "bCoef" : 0 },
    		{ "normal" : [1,0], "dist" : -w, "bCoef" : 0 },
    		{ "normal" : [-1,0], "dist" : -w, "bCoef" : 0 },
    		{ "normal" : [1,0], "dist" : -(w-140), "bCoef" : 0, "cMask" : ["ball"] },
    		{ "normal" : [-1,0], "dist" : -(w-140), "bCoef" : 0, "cMask" : ["ball"] }
      ],
      "joints" : [
        { "d0" : 6, "d1" : 7, "color": "000000", "strength": "rigid", length: [0, 10000] },
      ],
      "traits" : {
        "ballArea" : { "vis" : false, "bCoef" : 0, "cMask" : ["ball"] },
        "goalPost" : { "radius" : 5, "invMass" : 0, "bCoef" : 2, "cMask" : ["ball", "red", "blue"], "cGroup" : ["wall"] },
        "sidegoalNet" : { "bCoef" : 1, "cMask" : ["ball","red","blue"], "color" : "C7E6BD" },
        "kickOffBarrier" : { "vis" : false, "bCoef" : 0.1, "cGroup" : ["redKO","blueKO"], "cMask" : ["red","blue"] },
        "obstacle" : { "radius" : 15, "cMask" : ["red","blue" ], "cGroup" : ["none"], "invMass" : 0, "color" : "transparent" },
        "directionIndicator" : { "radius" : 0, "vis" : false, "cMask" : ["none"], "cGroup" : ["none"] }
      },
      "redSpawnPoints": [[-(shackX1+shackX2)/2, shackY1]],
      "blueSpawnPoints": [[(shackX1+shackX2)/2, shackY1]],
      "cameraFollow": "ball"
    };
    checkFormation();
    switch(state){
      case 1:{ // player arrangement
        playerArrangements = [null, [], []];
        mapObj.traits["redSpot"] = { "color": "ff0000", "radius": 15, "invMass" : 0, "cMask" : ["red"] };
        mapObj.traits["blueSpot"] = { "color": "0000ff", "radius": 15, "invMass" : 0, "cMask" : ["blue"] };
        for (var t=1;t<3;t++){
          var trait = (t==1) ? "redSpot" : "blueSpot";
          formationsPlayerCoords[t].forEach((coord, idx)=>{
            mapObj.discs.push({ "pos" : [coord.x, coord.y], "trait" : trait });
          });
        }
        mapObj.cameraFollow = "player";
        break;
      }
      case 2: // play mode
      case 3:{ // penalties mode
        if (!playerArrangements)
          playerArrangements = [null, [], []];
        if (playerArrangements[1].length==0 && playerArrangements[2].length==0){
          that.room.players.forEach((p)=>{
            var arr = playerArrangements[p.team.id];
            if (!arr)
              return;
            arr.push(p.id);
          });
        }
        if (state==2)
          break;
        mapObj.playerPhysics.kickingAcceleration = 0.27;
        mapObj.traits["playerBarrier"] = { "bCoef": 0, "cMask": ["red", "blue"], vis: false };
        mapObj.vertexes.push({ "x" : -(stadiumWidth-120), "y" : -h, "trait" : "playerBarrier" });
        mapObj.vertexes.push({ "x" : -(stadiumWidth-120), "y" : h, "trait" : "playerBarrier" });
        mapObj.vertexes.push({ "x" : -(stadiumWidth-20-ballRadius), "y" : -goalY, "trait" : "playerBarrier" });
        mapObj.vertexes.push({ "x" : -(stadiumWidth-20-ballRadius), "y" : goalY, "trait" : "playerBarrier" });
        mapObj.vertexes.push({ "x" : -(stadiumWidth+20-ballRadius), "y" : -goalY, "trait" : "playerBarrier" });
        mapObj.vertexes.push({ "x" : -(stadiumWidth+20-ballRadius), "y" : goalY, "trait" : "playerBarrier" });
        mapObj.vertexes.push({ "x" : stadiumWidth-120, "y" : -h, "trait" : "playerBarrier" });
        mapObj.vertexes.push({ "x" : stadiumWidth-120, "y" : h, "trait" : "playerBarrier" });
        mapObj.vertexes.push({ "x" : stadiumWidth-20-ballRadius, "y" : -goalY, "trait" : "playerBarrier" });
        mapObj.vertexes.push({ "x" : stadiumWidth-20-ballRadius, "y" : goalY, "trait" : "playerBarrier" });
        mapObj.vertexes.push({ "x" : stadiumWidth+20-ballRadius, "y" : -goalY, "trait" : "playerBarrier" });
        mapObj.vertexes.push({ "x" : stadiumWidth+20-ballRadius, "y" : goalY, "trait" : "playerBarrier" });
        mapObj.segments.push({ "v0" : 20, "v1" : 21, "trait" : "playerBarrier" });
        mapObj.segments.push({ "v0" : 22, "v1" : 23, "trait" : "playerBarrier" });
        mapObj.segments.push({ "v0" : 24, "v1" : 25, "trait" : "playerBarrier" });
        mapObj.segments.push({ "v0" : 26, "v1" : 27, "trait" : "playerBarrier" });
        mapObj.segments.push({ "v0" : 28, "v1" : 29, "trait" : "playerBarrier" });
        mapObj.segments.push({ "v0" : 30, "v1" : 31, "trait" : "playerBarrier" });
        penaltiesTurn = 0;
        break;
      }
    }
    setMode(state);
    Utils.runAfterGameTick(()=>{
      that.room.players.forEach((p)=>{
        pMap.set(p.id, p);
        pStats.set(p.id, createPlayerStats());
      });
      blockChanges = false;
      that.room.stopGame();
      that.room.setCurrentStadium(Utils.parseStadium(JSON.stringify(mapObj), console.log));
      that.room.setScoreLimit(0);
      that.room.setTimeLimit(0);
      if (autoStart)
        that.room.startGame();
      blockChanges = true;
      if (state==1)
        playerArrangements = [null, [], []];
      else if (state==2)
        arrangePlayers();
      else if (state==3){
        penaltyShotCount = -1;
        cps = [];
        penaltiesSetupNextTurn();
      }
    });
  }

  function penaltiesSetupNextTurn(){
    if (penaltySaveTimeout)
      clearTimeout(penaltySaveTimeout);
    penaltySaveTimeout = null;
    penaltiesTurn++;
    var teamId = 1+penaltiesTurn%2, coeff = (penaltiesTurn%2)*2-1;
    var a1 = playerArrangements[teamId].filter((x)=>x!=null), a2 = playerArrangements[3-teamId].filter((x)=>x!=null);
    var gk1 = a1[0], gk2 = a2[0];
    var ps1 = a2[(1+(penaltiesTurn/2)|0)%a2.length];
    var ps2 = a1[(1+(penaltiesTurn/2)|0)%a1.length];
    if (gk1==null || ps1==null || gk2==null || ps2==null || (penaltyShotCount>=2*that.penaltiesTurnCount && penaltyShotCount%2==0 && that.room.gameState.redScore!=that.room.gameState.blueScore)){
      that.room.librariesMap.commands?.announceAction("Game over.");
      that.room.stopGame();
      cps = null;
      return;
    }
    cps[0] = gk2;
    cps[1] = ps2;
    that.room.pluginsMap.powerShot?.stopPowerShot();
    that.room.setDiscProperties(0, {
      "x": coeff*(stadiumWidth-120),
      "y": 0,
      "xspeed": 0,
      "yspeed": 0,
      "invMass": 0
    });
    that.room.players.filter((x)=>x.team.id!=0).forEach(({id})=>{
      that.room.setPlayerDiscProperties(id, {
        "x": (id==gk2) ? coeff*(stadiumWidth-ballRadius) : ((id==ps2) ? coeff*(stadiumWidth-200) : NaN),
        "y": (id==gk2 || id==ps2) ? 0 : NaN,
        "xspeed": 0,
        "yspeed": 0
      });
    });
    penaltyShot = false;
  }

  function arrangePlayers(){
    playerArrangements.forEach((arr, teamId)=>{
      if (teamId==0)
        return;
      arr.forEach((playerId, formationIndex)=>{
        if (playerId==null)
          return;
        var pos = formationsPlayerCoords[teamId][formationIndex];
        if (!pos)
          return;
        that.room.setPlayerDiscProperties(playerId, {
          "x": pos.x,
          "y": pos.y,
          "xspeed": 0,
          "yspeed": 0
        });
      });
    });
  }

  function addToLastTouchedPlayers(playerId){
    var last = lastTouchedPlayers[lastTouchedPlayers.length-1];
    if (last?.id==playerId)
      return;
    lastTouchedPlayers.push({id: playerId, teamId: pMap.get(playerId)?.team.id});
    if (lastTouchedPlayers.length>2)
      lastTouchedPlayers.splice(0, 1);
  }

  function fCheckOffside(player, ballX, ballXDirection){
    if (!that.checkOffsides)
      return false;
    var t = player.team.id, tt = t*2-3;
    if (tt*ballXDirection>=0)
      return false;
    var a = [null, that.room.players.filter((x)=>x.team.id==1).sort((a,b)=>a.disc.ext.pos.x-b.disc.ext.pos.x), that.room.players.filter((x)=>x.team.id==2).sort((a,b)=>b.disc.ext.pos.x-a.disc.ext.pos.x)];
    var at = a[t];
    if (a[3-t].filter((p)=>(tt*(ballX-p.disc.ext.pos.x)<0)).length>0)
      return false;
    if (tt*(at[at.length-1]?.disc.ext.pos.x-a[3-t][1]?.disc.ext.pos.x)<0)
      return at[at.length-1].disc.ext.pos;
    return false;
  }
  
  function fFreeKick(coord, teamId){
    throwInTeam = teamId;
    throwInType = 4;
    tStats[throwInTeam].freeKicks++;
    that.room.pluginsMap.powerShot?.stopPowerShot();
    Utils.runAfterGameTick(()=>{
      that.room.setDiscProperties(0, {
        "x": coord.x,
        "y": coord.y,
        "xspeed": 0,
        "yspeed": 0,
        "invMass": 0
      });
      that.room.setDiscProperties(5, {
        "x": coord.x,
        "y": coord.y,
        "radius": freeKickObstacleRadius,
        "cMask": 1<<(3-teamId),
        "cGroup": 1<<(3-teamId)
      });
      that.room.setDiscProperties(6, {
        "x": coord.x,
        "y": coord.y
      });
      that.room.setDiscProperties(7, {
        "x": coord.x,
        "y": coord.y
      });
    });
  }
  
  function fOffside(player, ball, ballXDirection){
    if (Math.sign(ball.pos.x)*(player.team.id*2-3)>=0)
      return;
    var result = fCheckOffside(player, ball.pos.x, ballXDirection);
    if (result){
      tStats[player.team.id].offsides++;
      that.room.librariesMap.commands?.announceAction("offside");
      fFreeKick(result, 3-player.team.id);
    }
    return result;
  }
  
  function checkPass(player){
    var last = lastTouchedPlayers[lastTouchedPlayers.length-2];
    if (!last)
      return;
    if (typeof player=="number")
      player = pMap.get(player);
    var ps = pStats.get(last.id), teamId = player?.team?.id, ts = tStats[teamId];
    ps && (ps.passes++);
    ts && (ts.passes++);
    if (last.teamId==teamId){
      ps && (ps.accuratePasses++);
      ts && (ts.accuratePasses++);
    }
  }

  function sqrDist(x1,y1,x2,y2){
    return (x2-x1)*(x2-x1)+(y2-y1)*(y2-y1);
  }
  
  function completeReset(){
    reset(false, false);
    state = 0;
    resetAll(true);
  }
  
  function formation_IndexToDisc(teamId, formationIndex){
    return {
      id: formationIndex+8+((teamId==2)?playerArrangementRedCount:0),
      pos: formationsPlayerCoords[teamId][formationIndex]
    };
  }

  function formation_DiscToIndex(teamId, discId){
    var n = discId-8-((teamId==2)?playerArrangementRedCount:0);
    return {
      idx: n,
      pos: formationsPlayerCoords[teamId][n]
    };
  }
  
  function removePlayerFromFormation(playerObj){
    if (!playerObj)
      return;
    var _id = playerObj.id, formationIndex, teamId;
    for (teamId=1;teamId<3;teamId++){
      formationIndex = playerArrangements[teamId].findIndex((playerId)=>(playerId==_id))
      if (formationIndex>=0)
        break;
    }
    if (formationIndex<0)
      return;
    playerArrangements[teamId][formationIndex] = null;
    return {
      teamId,
      formationIndex
    };
  }
  
  this.initialize = function(){
    state = 0;
    resetAll(true);
    permissionCtx = that.room.librariesMap.permissions?.createContext("CMD_realSoccer");
    if (permissionCtx)
      permissionIds = {
        reset: permissionCtx.addPermission("reset"),
        teamStats: permissionCtx.addPermission("teamStats"),
        setMapParams: permissionCtx.addPermission("setMapParams")
      };
    var mapProperties = ["width", "height", "ballRadius", "kickOffRadiusCoeff", "goalSizeCoeff", "kickStrengthCoeff"];
    that.room.librariesMap.commands?.add({
      name: "setMapProperty",
      parameters: [{
        name: "propertyIndex",
        type: VariableType.Integer,
        range: {
          min: 0,
          max: mapProperties.length-1
        }
      }, {
        name: "value",
        type: VariableType.Number
      }],
      minParameterCount: 2,
      helpText: "Overrides current map parameters and resets the game. propertyIndex can be one of the following: ("+mapProperties.map((x,i)=>(i+": "+x)).join(", ")+")",
      callback: ({propertyIndex, value}, byId) => {
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.setMapParams)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        var prop = mapProperties[propertyIndex];
        if (!prop){
          that.room.librariesMap.commands?.announceError("Invalid property index: "+propertyIndex+".", byId);
          return;
        }
        that[prop] = value;
        completeReset();
      }
    });
    that.room.librariesMap.commands?.add({
      name: "reset",
      parameters: [],
      minParameterCount: 0,
      helpText: "Resets the game.",
      callback: ({}, byId) => {
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.reset)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        completeReset();
      }
    });
    that.room.librariesMap.commands?.add({
      name: "stats",
      parameters: [],
      minParameterCount: 0,
      helpText: "Shows your current player statistics.",
      callback: ({}, byId) => {
        showPlayerStatistics(byId);
      }
    });
    that.room.librariesMap.commands?.add({
      name: "teamStats",
      parameters: [],
      minParameterCount: 0,
      helpText: "Shows all current team statistics.",
      callback: ({}, byId) => {
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.teamStats)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        showAllTeamStatistics();
      }
    });
    that.room.librariesMap.commands?.add({
      name: "change",
      parameters: [],
      minParameterCount: 0,
      helpText: "Changes your current position. Only works while arranging players.",
      callback: ({}, byId) => {
        if (state!=1)
          return;
        var ret = removePlayerFromFormation(pMap.get(byId));
        if (!ret)
          return;
        var { id, pos } = formation_IndexToDisc(ret.teamId, ret.formationIndex);
        Utils.runAfterGameTick(()=>{
          that.room.setDiscProperties(id, pos);
          that.room.setPlayerDiscProperties(byId, {
            "x": pos.x,
            "y": pos.y+30,
            "xspeed": 0,
            "yspeed": 0,
            "invMass": 1
          });
        });
      }
    });
  };

  this.finalize = function(){
    if (penaltySaveTimeout){
      clearTimeout(penaltySaveTimeout);
      penaltySaveTimeout = null;
    }
    try{
      reset(false, false);
    }catch(ex){}
    that.room.librariesMap?.commands?.remove("setMapParams");
    that.room.librariesMap?.commands?.remove("reset");
    that.room.librariesMap?.commands?.remove("stats");
    that.room.librariesMap?.commands?.remove("teamStats");
    that.room.librariesMap?.commands?.remove("change");
    that.room.librariesMap?.permissions?.removeContext(permissionCtx);
    permissionCtx = null;
    permissionIds = null;
    lastTouchedPlayers = null;
    pMap = null;
    pStats = null;
    tStats = null;
  };

  function onOperationReceivedCommon(type){
    if (blockChanges && (type==OperationType.SetTimeLimit || type==OperationType.SetScoreLimit || type==OperationType.SetStadium))
      return false;
    if (type==OperationType.AutoTeams){
      var p0 = that.room.players.filter((x)=>(x.team.id==0));
      if (p0.length==0)
        return false;
      var p1 = that.room.players.filter((x)=>(x.team.id==1));
      var p2 = that.room.players.filter((x)=>(x.team.id==2));
      if (p1.length<p2.length)
        that.room.setPlayerTeam(p0[p0.length-1].id, 1);
      else if (p2.length<p1.length)
        that.room.setPlayerTeam(p0[p0.length-1].id, 2);
      else if (p0.length>1){
        that.room.setPlayerTeam(p0[p0.length-2].id, 1);
        that.room.setPlayerTeam(p0[p0.length-1].id, 2);
      }
      return false;
    }
    return true;
  };
  
  var modes = [{
    onPlayerJoin: function(playerObj){
      pMap.set(playerObj.id, playerObj);
    },
    onPlayerLeave: function(playerObj, reason, isBanned, byId, customData){
      pMap.delete(playerObj.id);
    },
    onOperationReceived: onOperationReceivedCommon
  },


  // arrangement mode

  
  {
    onPlayerJoin: function(playerObj){
      pMap.set(playerObj.id, playerObj);
    },
    onPlayerLeave: function(playerObj, reason, isBanned, byId, customData){
      pMap.delete(playerObj.id);
      var ret = removePlayerFromFormation(playerObj);
      if (!ret)
        return;
      var { id, pos } = formation_IndexToDisc(ret.teamId, ret.formationIndex);
      Utils.runAfterGameTick(()=>{
        that.room.setDiscProperties(id, pos);
      });
    },
    onGameStart: function(byId){
      reset(false, false);
      that.room.setDiscProperties(0, {
        "x": NaN,
        "y": NaN
      });
      playerArrangements = [null, [], []];
    },
    onGameStop: null,
    onPlayerTeamChange: function(_id, teamId, byId){
      var ret = removePlayerFromFormation(pMap.get(_id));
      if (!ret)
        return;
      var { id, pos } = formation_IndexToDisc(ret.teamId, ret.formationIndex);
      Utils.runAfterGameTick(()=>{
        that.room.setDiscProperties(id, pos);
      });
    },
    onTeamGoal: null,
    onPlayerBallKick: null,
    onCollisionDiscVsPlane: null,
    onCollisionDiscVsSegment: null,
    onCollisionDiscVsDisc: function(discId1, discPlayerId1, discId2, discPlayerId2){
      if (discPlayerId1==null && (discPlayerId2==null || discId1<5))
        return;
      if (discPlayerId1==null){
        var p = pMap.get(discPlayerId2);
        if (!p)
          return;
        var teamId = p.team.id;
        var { idx, pos } = formation_DiscToIndex(teamId, discId1);
        playerArrangements[teamId][idx] = discPlayerId2;
        that.room.fakeSendPlayerInput(0, discPlayerId2);
        Utils.runAfterGameTick(()=>{
          that.room.setDiscProperties(discId1, {
            "x": NaN,
            "y": NaN
          });
          that.room.setDiscProperties(discId2, {
            "x": pos.x,
            "y": pos.y,
            "xspeed": 0,
            "yspeed": 0,
            "invMass": 0
          });
        });
        setTimeout(()=>{
          that.room.setDiscProperties(discId2, {
            "x": pos.x,
            "y": pos.y,
            "xspeed": 0,
            "yspeed": 0,
            "invMass": 0
          });
          p = pMap.get(discPlayerId2);
          if (!p)
            return;
          var c1 = that.waitForFullFormation ? playerArrangementRedCount : that.room.players.reduce((o,x)=>(o+((x.team.id==1)?1:0)),0);
          var c2 = that.waitForFullFormation ? playerArrangementBlueCount : that.room.players.reduce((o,x)=>(o+((x.team.id==2)?1:0)),0);
          if ((playerArrangements[1].reduce((o,x)=>(o+((x!=null)?1:0)),0)==c1) && (playerArrangements[2].reduce((o,x)=>(o+((x!=null)?1:0)),0)==c2)){
            state = 2;
            resetAll(true);
          }
        }, 120);
      }
    },
    onGameTick: null,
    onPositionsReset: null,
    onOperationReceived: function(type, msg, globalFrameNo, clientFrameNo){
      if (!onOperationReceivedCommon(type))
        return false;
      if (type==OperationType.SetPlayerTeam){
        var currentPlayerCount = that.room.players.filter((x)=>x.team.id==msg.team.id).length;
        if (msg.team.id==1 && currentPlayerCount>=playerArrangementRedCount)
          return false;
        if (msg.team.id==2 && currentPlayerCount>=playerArrangementBlueCount)
          return false;
        return true;
      }
      if (type!=OperationType.SendInput)
        return true;
      if ((msg.input&(~16))==0)
        return true;
      return !(playerArrangements[pMap.get(msg.byId)?.team.id]?.findIndex((playerId)=>(playerId==msg.byId))>=0);
    }
  }, 
  
  
  // play mode
  
  {
    onPlayerJoin: function(playerObj){
      pMap.set(playerObj.id, playerObj);
      pStats.set(playerObj.id, createPlayerStats());
    },
    onPlayerLeave: function(playerObj, reason, isBanned, byId, customData){
      removePlayerFromFormation(playerObj);
      pMap.delete(playerObj.id);
      pStats.delete(playerObj.id);
    },
    onGameStart: function(byId){
      tStats = [null, createTeamStats(), createTeamStats()];
      currentInGameTicks = 0;
      targetInGameTicks = Math.round(that.timeLimit/0.01666666666666667);
      reset();
      Utils.runAfterGameTick(()=>{
        arrangePlayers();
      });
    },
    onGameStop: function(byId){
      if (!blockChanges)
        return;
      state = 0;
      resetAll(false);
    },
    onPlayerTeamChange: function(id, teamId, byId){
      removePlayerFromFormation(pMap.get(id));
      if (teamId!=0){
        var idx = playerArrangements[teamId].findIndex((x)=>x==null);
        if (idx>-1)
          playerArrangements[teamId][idx] = id;
        else
          playerArrangements[teamId].push(id);
      }
      /*
      lastTouchedPlayers.forEach((x)=>{
        if (x.id==id)
          x.teamId = teamId;
      });
      */
    },
    onTeamGoal: function(teamId){
      var last = lastTouchedPlayers[lastTouchedPlayers.length-1];
      if (!last)
        return;
      var s = pStats.get(last.id);
      if (teamId==last.teamId){
        s && (s.goals++);
        var p = lastTouchedPlayers[lastTouchedPlayers.length-2];
        if (p?.teamId==teamId){
          s = pStats.get(p.id);
          s && (s.assists++);
        }
      }
      else
        s && (s.ownGoals++);
    },
    onPlayerBallKick: function(playerId){
      addToLastTouchedPlayers(playerId);
      var p = pMap.get(playerId);
      if (!p)
        return;
      checkPass(p);
      var ball = that.room.getBall();
      if (throwInTeam!=null && throwInType!=null){
        if (p.team.id!=throwInTeam)
          return;
        var { pos } = p.disc.ext;
        if ((throwInType==1 && Math.sign(ball.pos.y)*Math.sign(ball.pos.y-pos.y)>=0) || 
            (throwInType==2 && (Math.sign(ball.pos.y)*Math.sign(ball.pos.y-pos.y)>=0 || Math.sign(ball.pos.x)*Math.sign(ball.pos.x-pos.x)>=0)) || 
            (throwInType==3 && Math.sign(ball.pos.x)*Math.sign(ball.pos.x-pos.x)>=0))
          return;
        if (fOffside(p, ball, Math.sign(ball.pos.x-pos.x)))
          return;
        var d = Math.sqrt(sqrDist(ball.pos.x, ball.pos.y, pos.x, pos.y));
        var speed = (throwInType==1) ? throwInSpeed : ((throwInType==2) ? cornerSpeed : ((throwInType==3) ? outSpeed : freeKickSpeed));
        reset(true, false);
        Utils.runAfterGameTick(()=>{
          that.room.setDiscProperties(0, {
            "xspeed": speed*(ball.pos.x-pos.x)/d,
            "yspeed": speed*(ball.pos.y-pos.y)/d,
            "invMass": 1
          });
        });
        return;
      }
      if (fOffside(p, ball, Math.sign(ball.speed.x)))
        return;
    },
    onCollisionDiscVsPlane: null,
    onCollisionDiscVsSegment: null,
    onCollisionDiscVsDisc: function(discId1, discPlayerId1, discId2, discPlayerId2){
      if (discId1!=0 || discPlayerId2==null)
        return;
      addToLastTouchedPlayers(discPlayerId2);
      checkPass(discPlayerId2);
    },
    onGameTick: function(){
      var ball = that.room.getBall();
      if (!ball || that.room.gameState.state!=GamePlayState.Playing)
        return;
      if (throwInTeam!=null){
        if (that.showDirectionIndicator)
          Utils.runAfterGameTick(()=>{
            var bx = ball.pos.x, by = ball.pos.y;
            var best = that.room.players.reduce((best, p)=>{
              if (p.team.id==throwInTeam && p.disc.ext){
                var { pos } = p.disc.ext, value = sqrDist(bx, by, pos.x, pos.y);
                var t = that.directionIndicatorThreshold;
                if (value<t*t && value<best.value){
                  best.value = value;
                  best.pos = pos;
                }
              }
              return best;
            }, {pos: {x: NaN, y: NaN}, value: Infinity});
            var a = Math.sqrt(best.value);
            var k = that.directionIndicatorLengthCoeff*((throwInType==1) ? throwInSpeed : ((throwInType==2) ? cornerSpeed : ((throwInType==3) ? outSpeed : freeKickSpeed)));
            that.room.setDiscProperties(7, {
              x: bx+k*(bx-best.pos.x)/a,
              y: by+k*(by-best.pos.y)/a
            });
          });
        return;
      }
      currentInGameTicks++;
      tStats[ball.pos.x>0?2:1].ballInHalfTicks++;
      var lastTouchedTeamId = lastTouchedPlayers[lastTouchedPlayers.length-1]?.teamId;
      if (lastTouchedTeamId)
        tStats[lastTouchedTeamId].ballTicks++;
      if (currentInGameTicks==targetInGameTicks){
        Utils.runAfterGameTick(()=>{
          if (that.room.gameState.redScore==that.room.gameState.blueScore && that.penaltiesEnabled){
            that.room.librariesMap.commands?.announceAction("Penalties.");
            state = 3;
            resetAll(true);
            return;
          }
          that.room.librariesMap.commands?.announceAction("Time is up.");
          that.room.stopGame();
        });
        return;
      }
      if (that.announceTime){
        var rt = targetInGameTicks-currentInGameTicks;
        if (rt%3600==0 || rt==1800 || rt==1200 || rt==600 || rt==300)
          that.room.librariesMap.commands?.announceInfo("Remaining time: "+((rt/60)|0)+" seconds.");
      }
      if (that.checkOuts && Math.abs(ball.pos.x)>stadiumWidth && Math.abs(ball.pos.y)>goalY){
        if (!lastTouchedTeamId)
          lastTouchedTeamId = 1;
        throwInTeam = 3-lastTouchedTeamId;
        var signedTeamId = (throwInTeam*2-3), x, y, r, signBallPosX = Math.sign(ball.pos.x);
        if (that.checkCorners && signBallPosX*signedTeamId<0){
          x = signBallPosX*stadiumWidth;
          y = Math.sign(ball.pos.y)*stadiumHeight;
          r = cornerObstacleRadius;
          throwInType = 2;
          tStats[throwInTeam].corners++;
        }
        else{
          x = signBallPosX*(stadiumWidth-135);
          y = Math.sign(ball.pos.y)*goalY;
          r = outObstacleRadius;
          throwInType = 3;
          tStats[throwInTeam].outs++;
          Utils.runAfterGameTick(()=>{
            that.room.players.forEach((p)=>{
              if (p.team.id!=3-throwInTeam)
                return;
              var pos = p.disc?.ext?.pos;
              if (!pos)
                return;
              var diff = Math.sign(pos.x-x);
              if (diff*signedTeamId>0)
                that.room.setPlayerDiscProperties(p.id, {
                  "x": x-diff*40
                });
            });
          });
        }
        that.room.pluginsMap.powerShot?.stopPowerShot();
        Utils.runAfterGameTick(()=>{
          that.room.setDiscProperties(0, {
            "x": x,
            "y": y,
            "xspeed": 0,
            "yspeed": 0,
            "invMass": 0
          });
          that.room.setDiscProperties(5, {
            "x": x,
            "y": y,
            "radius": r,
            "cMask": 1<<(3-throwInTeam),
            "cGroup": 1<<(3-throwInTeam)
          });
          that.room.setDiscProperties(6, {
            "x": x,
            "y": y
          });
          that.room.setDiscProperties(7, {
            "x": x,
            "y": y
          });
        });
        return;
      }
      if (that.checkThrowIns && Math.abs(ball.pos.y)>stadiumHeight){
        var x = ball.pos.x, y = Math.sign(ball.pos.y)*stadiumHeight;
        if (!lastTouchedTeamId)
          lastTouchedTeamId = 1;
        throwInTeam = 3-lastTouchedTeamId;
        throwInType = 1;
        tStats[throwInTeam].throwIns++;
        that.room.pluginsMap.powerShot?.stopPowerShot();
        Utils.runAfterGameTick(()=>{
          that.room.setDiscProperties(0, {
            "x": x,
            "y": y,
            "xspeed": 0,
            "yspeed": 0,
            "invMass": 0
          });
          that.room.setDiscProperties(5, {
            "x": x,
            "y": y,
            "radius": throwInObstacleRadius,
            "cMask": 1<<(3-throwInTeam),
            "cGroup": 1<<(3-throwInTeam)
          });
          that.room.setDiscProperties(6, {
            "x": x,
            "y": y
          });
          that.room.setDiscProperties(7, {
            "x": x,
            "y": y
          });
        });
        return;
      }
    },
    onPositionsReset: function(){
      Utils.runAfterGameTick(()=>{
        arrangePlayers();
      });
    },
    onOperationReceived: onOperationReceivedCommon
  }, 
  
  
  // penalties mode
  
  
  {
    onPlayerJoin: function(playerObj){
      pMap.set(playerObj.id, playerObj);
    },
    onPlayerLeave: function(playerObj, reason, isBanned, byId, customData){
      pMap.delete(playerObj.id);
      removePlayerFromFormation(playerObj);
      if (cps[0]==playerObj.id || cps[1]==playerObj.id)
        Utils.runAfterGameTick(()=>{
          penaltiesTurn--;
          penaltiesSetupNextTurn();
        });
    },
    onGameStart: function(byId){
      reset();
    },
    onGameStop: function(byId){
      if (!blockChanges)
        return;
      state = 0;
      resetAll(false);
    },
    onPlayerTeamChange: function(id, newTeamId, byId){
      removePlayerFromFormation(pMap.get(id));
      if (newTeamId!=0){
        var idx = playerArrangements[newTeamId].findIndex((x)=>x==null);
        if (idx>-1)
          playerArrangements[newTeamId][idx] = id;
        else
          playerArrangements[newTeamId].push(id);
        Utils.runAfterGameTick(()=>{
          that.room.setPlayerDiscProperties(id, {
            "x": NaN,
            "y": NaN
          });
        });
      }
      if (cps[0]==id || cps[1]==id)
        Utils.runAfterGameTick(()=>{
          penaltiesTurn--;
          penaltiesSetupNextTurn();
        });
    },
    onTeamGoal: function(teamId){
      if (!penaltySaveTimeout)
        return;
      clearTimeout(penaltySaveTimeout);
      penaltySaveTimeout = null;
      penaltyShot = false;
    },
    onPlayerBallKick: function(playerId){
      if (penaltyShot){
        if (penaltySaveTimeout){
          clearTimeout(penaltySaveTimeout);
          penaltySaveTimeout = null;
          Utils.runAfterGameTick(()=>{
            penaltiesSetupNextTurn();
          });
          return;
        }
        penaltySaveTimeout = setTimeout(()=>{
          Utils.runAfterGameTick(()=>{
            penaltiesSetupNextTurn();
          });
        }, that.penaltiesSaveTimeout);
        return;
      }
      Utils.runAfterGameTick(()=>{
        var ball = that.room.getBall();
        var p = pMap.get(playerId);
        var { pos } = p.disc;
        var d = Math.sqrt(sqrDist(ball.pos.x, ball.pos.y, pos.x, pos.y));
        that.room.setDiscProperties(0, {
          "xspeed": penaltySpeed*(ball.pos.x-pos.x)/d,
          "yspeed": penaltySpeed*(ball.pos.y-pos.y)/d,
          "invMass": 1
        });
        penaltyShot = true;
        penaltyShotCount++;
      });
    },
    onCollisionDiscVsPlane: function(discId, discPlayerId, planeId){
      if (!penaltyShot || discId!=0 || that.room.gameState.state==GamePlayState.AfterGoal)
        return;
      Utils.runAfterGameTick(()=>{
        penaltiesSetupNextTurn();
      });
    },
    onCollisionDiscVsSegment: function(discId, discPlayerId, segmentId){
      if (!penaltyShot || discId!=0 || that.room.gameState.state==GamePlayState.AfterGoal)
        return;
      Utils.runAfterGameTick(()=>{
        penaltiesSetupNextTurn();
      });
    },
    onCollisionDiscVsDisc: function(discId1, discPlayerId1, discId2, discPlayerId2){
      if (penaltySaveTimeout || !penaltyShot || (discId1!=0 && discId2!=0))
        return;
      penaltySaveTimeout = setTimeout(()=>{
        Utils.runAfterGameTick(()=>{
          penaltiesSetupNextTurn();
        });
      }, that.penaltiesSaveTimeout);
    },
    onGameTick: null,
    onPositionsReset: ()=>{
      Utils.runAfterGameTick(()=>{
        penaltiesSetupNextTurn();
      });
    },
    onOperationReceived: onOperationReceivedCommon
  }];
  
  function setMode(mode){
    var m = modes[mode];
    that.onPlayerJoin = m.onPlayerJoin;
    that.onPlayerLeave = m.onPlayerLeave;
    that.onGameStart = m.onGameStart;
    that.onGameStop = m.onGameStop;
    that.onPlayerTeamChange = m.onPlayerTeamChange;
    that.onTeamGoal = m.onTeamGoal;
    that.onPlayerBallKick = m.onPlayerBallKick;
    that.onCollisionDiscVsPlane = m.onCollisionDiscVsPlane;
    that.onCollisionDiscVsSegment = m.onCollisionDiscVsSegment;
    that.onCollisionDiscVsDisc = m.onCollisionDiscVsDisc;
    that.onGameTick = m.onGameTick;
    that.onPositionsReset = m.onPositionsReset;
    that.onOperationReceived = m.onOperationReceived;
  }
}
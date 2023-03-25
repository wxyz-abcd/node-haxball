module.exports = function(API, params){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API;
  const { RendererTextIndices: TextIndices } = Language.indices;
  
  Object.setPrototypeOf(this, Renderer.prototype);
  Renderer.call(this, { // Every renderer should have a unique name.
    name: "default",
    version: "1.4",
    author: "basro & abc",
    description: `This is a much more improved version of the default renderer currently used in Haxball with bug-fixes, aimbot and new features. Use +, - keys for zoom in-out. Disable followMode to zoom using mouse wheel.`
  });

  // parameters are exported so that they can be edited outside this class.
  this.showTeamColors = this.defineVariable({ // team_colors
    name: "showTeamColors",
    description: "Show team colors?", 
    type: VariableType.Boolean,
    value: true
  });

  this.showAvatars = this.defineVariable({ // show_avatars
    name: "showAvatars",
    description: "Show player avatars?", 
    type: VariableType.Boolean,
    value: true
  });

  this.showPlayerIds = this.defineVariable({
    name: "showPlayerIds",
    description: "Show player ids?", 
    type: VariableType.Boolean,
    value: false
  });

  this.zoomCoeff = this.defineVariable({
    name: "zoomCoeff",
    description: "Zoom Coefficient", 
    type: VariableType.Number,
    value: 1.0,
    range: {
      min: 0,
      max: Infinity,
      step: 0.01
    }
  });

  this.wheelZoomCoeff = this.defineVariable({
    name: "wheelZoomCoeff",
    description: "Defines how fast you zoom in/out with mouse wheel", 
    type: VariableType.Number,
    value: 1.2,
    range: {
      min: 1,
      max: 10,
      step: 0.01
    }
  });
  
  this.resolutionScale = this.defineVariable({ // resolution_scale
    name: "resolutionScale",
    description: "Resolution Scale", 
    type: VariableType.Number,
    value: 1,
    range: {
      min: 0,
      max: Infinity,
      step: 0.01
    }
  });

  this.showChatIndicators = this.defineVariable({ // show_indicators
    name: "showChatIndicators",
    description: "Show Chat Indicators?", 
    type: VariableType.Boolean,
    value: true
  });

  this.restrictCameraOrigin = this.defineVariable({
    name: "restrictCameraOrigin",
    description: "Restrict camera origin to view bounds?", 
    type: VariableType.Boolean,
    value: true
  });

  this.followMode = this.defineVariable({
    name: "followMode",
    description: "Follow camera enabled?", 
    type: VariableType.Boolean,
    value: true
  });
  
  this.followPlayerId = this.defineVariable({
    name: "followPlayerId",
    description: "Id of the player that the camera will follow", 
    type: VariableType.Integer,
    value: null
  });

  this.drawBackground = this.defineVariable({
    name: "drawBackground",
    description: "Draw Background?", 
    type: VariableType.Boolean,
    value: true
  });
  
  this.squarePlayers = this.defineVariable({
    name: "squarePlayers",
    description: "Draw Players as squares?", 
    type: VariableType.Boolean,
    value: false
  });
  
  this.currentPlayerDistinction = this.defineVariable({
    name: "currentPlayerDistinction",
    description: "Hide current player's name and draw halo around current player?", 
    type: VariableType.Boolean,
    value: true
  });
  
  this.showInvisibleSegments = this.defineVariable({
    name: "showInvisibleSegments",
    description: "Show invisible segments?", 
    type: VariableType.Boolean,
    value: false
  });

  this.aimbotActive = this.defineVariable({
    name: "aimbotActive",
    description: "Aimbot is active?",
    type: VariableType.Boolean,
    value: false
  });

  this.minAimbotDistToBall = this.defineVariable({
    name: "minAimbotDistToBall",
    description: "Minimum distance to show aimbot line",
    type: VariableType.Number,
    value: 25
  });

  this.aimbotDistThreshold = this.defineVariable({
    name: "aimbotDistThreshold",
    description: "Aimbot may trace rays until this distance is reached",
    type: VariableType.Number,
    value: 600
  });

  this.aimbotMaxIter = this.defineVariable({
    name: "aimbotMaxIter",
    description: "Aimbot may trace rays until this iteration count is reached",
    type: VariableType.Number,
    value: 1000
  });

  this.aimbotColor = this.defineVariable({
    name: "aimbotColor",
    description: "Color of aimbot's line (in css format)",
    type: VariableType.String,
    value: "rgba(255,255,255,0.35)"
  });

  var thisRenderer = this, { H: Point, p: Team, ka: TeamColors } = Impl.Core;

  // start of basro's renderer logic

  function Animator(values){ // Ib
    this.values = values.slice(); // Yb
  }
  Animator.prototype = {
    eval: function(x){
      var idx = this.values.length-1;
      if (x<=this.values[0])
        return this.values[1];
      if (x>=this.values[idx])
        return this.values[idx-2];
      var min = 0, max = (max/5)|0;
      do {
        var cur = (max+min)>>>1;
        if (x>this.values[5*cur])
          min = cur+1;
        else
          max = cur-1;
      } while (min<=max);
      var idx2 = 5*max, idx3 = this.values[idx2];
      var X = (x-idx3)/(this.values[idx2+5]-idx3), sqrX = X*X, cubeX = sqrX*X;
      return (2*cubeX-3*sqrX+1)*this.values[idx2+1]+(cubeX-2*sqrX+X)*this.values[idx2+2]+(-2*cubeX+3*sqrX)*this.values[idx2+3]+(cubeX-sqrX)*this.values[idx2+4];
    }
  };
  function CanvasText(lines, color){ // R
    var arr = [];
    for (var i=0;i<lines.length;i++)
      arr.push(this.createTextCanvas(lines[i], color));
    this.canvasArray = arr; // We
  }
  CanvasText.alphaAnimator = new Animator([0, 0, 2, 1, 0, 0.35, 1, 0, 1, 0, 0.7, 1, 0, 0, 0, 1]); // jn
  CanvasText.coordAnimator = new Animator([0, -1, 3, 0, 0, 0.35, 0, 0, 0, 0, 0.65, 0, 0, 1, 3, 1]); // kn
  CanvasText.prototype = {
    calculateTime: function(){ // zo
      return 2.31+0.1155*(this.canvasArray.length-1);
    },
    render: function (ctx, coeff){ // Kc
      var coeff1 = coeff / 2.31;
      ctx.imageSmoothingEnabled = true;
      for (var i=0;i<this.canvasArray.length;i++){
        var canvas = this.canvasArray[i];
        var coeff2 = coeff1-0.05*i, width = ((0!=(i&1)) ? -1 : 1)*180*CanvasText.coordAnimator.eval(coeff2);
        ctx.globalAlpha = CanvasText.alphaAnimator.eval(coeff2);
        ctx.drawImage(canvas, width-0.5*canvas.width, 35*(1-this.canvasArray.length)+70*i-0.5*canvas.height);
        ctx.globalAlpha = 1;
      }
      ctx.imageSmoothingEnabled = false;
    },
    renderStatic: function(ctx){ // Tq
      ctx.imageSmoothingEnabled = true;
      for (var i=0;i<this.canvasArray.length;i++){
        var canvas = this.canvasArray[i];
        ctx.drawImage(canvas, -0.5*canvas.width, 35*(1-this.canvasArray.length)+70*i-0.5*canvas.height);
      }
      ctx.imageSmoothingEnabled = false;
    },
    createTextCanvas: function(text, color){ // sp
      var canvas = window.document.createElement("canvas");
      var ctx = canvas.getContext("2d", null);
      ctx.font = "900 70px Arial Black,Arial Bold,Gadget,sans-serif";
      canvas.width = Math.ceil(ctx.measureText(text).width)+7;
      canvas.height = 90;
      ctx.font = "900 70px Arial Black,Arial Bold,Gadget,sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black";
      ctx.fillText(text, 7, 52);
      ctx.fillStyle = Utils.numberToColor(color);
      ctx.fillText(text, 0, 45);
      return canvas;
    }
  };

  function CanvasTextRenderer(){ // Sb
    const { rendererTextMap: TextMap } = Language.currentData;
    this.time = 0; // xc
    this.textQueue = []; // ab
    this.timeUp = new CanvasText([TextMap[TextIndices.timeIsUp1], TextMap[TextIndices.timeIsUp2]], 16777215); // Ar // ["Time is", "Up!"]
    this.redVictory = new CanvasText([TextMap[TextIndices.redIsVictorious1], TextMap[TextIndices.redIsVictorious2]], 15035990); // Gq // ["Red is", "Victorious!"]
    this.redScore = new CanvasText([TextMap[TextIndices.redScores1], TextMap[TextIndices.redScores2]], 15035990); // Fq // ["Red", "Scores!"]
    this.blueVictory = new CanvasText([TextMap[TextIndices.blueIsVictorious1], TextMap[TextIndices.blueIsVictorious2]], 625603); // Cn // ["Blue is", "Victorious!"]
    this.blueScore = new CanvasText([TextMap[TextIndices.blueScores1], TextMap[TextIndices.blueScores2]], 625603); // Bn // ["Blue", "Scores!"]
    this.gamePause = new CanvasText([TextMap[TextIndices.gamePaused1], TextMap[TextIndices.gamePaused2]], 16777215); // eq // ["Game", "Paused"]
  }
  CanvasTextRenderer.prototype = {
    addText: function(textObj){ // Pa
      this.textQueue.push(textObj);
    },
    reset: function(){ // Nn
      this.textQueue = [];
      this.time = 0;
    },
    update: function(deltaTime){ // C
      if (this.textQueue.length==0)
        return;
      this.time += deltaTime;
      if (this.time<=this.textQueue[0].calculateTime())
        return;
      this.time = 0;
      this.textQueue.shift();
    },
    render: function(a){ // Kc
      if (this.textQueue.length==0)
        return;
      this.textQueue[0].render(a, this.time);
    }
  };

  function PlayerDecorator(){ // Ea
    this.chatIndicatorActive = false; // Xf
    this.name = ""; // w
    this.avatarNumber = 0; // uh
    this.avatarText = ""; // Jf
    this.teamColors = new TeamColors(); // kb
    var canvas = window.document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    this.ctx = canvas.getContext("2d", null); // rb
    this.pattern = this.ctx.createPattern(this.ctx.canvas, "no-repeat"); // Ij
    this.initialize();
  }
  var /*PlayerDecorator.*/compareTeamColors = function(c1, c2){
    if (c1.angle!=c2.angle || c1.text!=c2.text)
      return false;
    var a1 = c1.inner, a2 = c2.inner;
    if (a1.length!=a2.length)
      return false;
    for (var i=0;i<a1.length;i++)
      if (a1[i]!=a2[i])
        return false;
    return true;
  };
  var /*PlayerDecorator.*/copyTeamColors = function(to, from){ // ao
    to.angle = from.angle;
    to.text = from.text;
    to.inner = from.inner.slice(0);
  };
  PlayerDecorator.prototype = {
    initialize: function(){
      var canvas = window.document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 34;
      this.ctx2 = canvas.getContext("2d", null);
    },
    repaintPlayerName: function(){
      this.ctx2.resetTransform();
      this.ctx2.clearRect(0, 0, 160, 34);
      this.ctx2.font = "26px sans-serif";
      this.ctx2.fillStyle = "white";
      if (this.ctx2.measureText(this.name).width>160){
        this.ctx2.textAlign = "left";
        this.ctx2.translate(2, 29);
      }
      else{
        this.ctx2.textAlign = "center";
        this.ctx2.translate(80, 29);
      }
      this.ctx2.fillText(this.name, 0, 0);
    },
    drawToCanvas: function(ctx, x, y){ // so
      ctx.drawImage(this.ctx2.canvas, 0, 0, 160, 34, x-40, y-34, 80, 17);
    },
    update: function(playerObj, roomState){ // C
      if (playerObj.disc) {
        var teamColors = thisRenderer.showTeamColors/*localStorageObj.xm.L()*/ ? roomState.teamColors[playerObj.team.id] : playerObj.team.colors; // "team_colors"
        var avatarText = (playerObj.headlessAvatar!=null) ? playerObj.headlessAvatar : playerObj.avatar;
        var showAvatar = thisRenderer.showAvatars/*localStorageObj.lm.L()*/ && (avatarText!=null); // "show_avatars"
        if (!/*PlayerDecorator.*/compareTeamColors(this.teamColors, teamColors) || (!showAvatar && (playerObj.avatarNumber!=this.avatarNumber)) || (showAvatar && (this.avatarText!=avatarText))){
          /*PlayerDecorator.*/copyTeamColors(this.teamColors, teamColors);
          if (showAvatar){
            this.avatarText = avatarText;
            this.avatarNumber = -1;
          }
          else{
            this.avatarText = "" + playerObj.avatarNumber;
            this.avatarNumber = playerObj.avatarNumber;
          }
          this.createInnerFillPattern(/*this.avatarText*/);
        }
      }
      this.strokeStyle = (roomState.gameState.pauseGameTickCounter>0 || !playerObj.isKicking) ? "black" : ((playerObj.isKicking && playerObj.kickRateMinTickCounter<=0 && playerObj.kickRateMaxTickCounter>=0) ? "white" : "black");
      var name = thisRenderer.showPlayerIds?("["+playerObj.id+"] "+playerObj.name):playerObj.name;
      if (name!=this.name){
        this.name = name;
        this.repaintPlayerName();
      }
    },
    createInnerFillPattern: function(/*avatarText*/){
      var colorArray = this.teamColors.inner;
      if (colorArray.length==0)
        return;

      // fill the colors
      this.ctx.save();
      this.ctx.translate(32, 32); // set midpoint of the canvas as origin
      this.ctx.rotate((3.141592653589793*this.teamColors.angle)/128); // team colors rotation by provided angle
      var stepWidth = 64/colorArray.length, x=-32; // here, 64 is the width of the canvas
      for (var i=0;i<colorArray.length;i++){
        this.ctx.fillStyle = Utils.numberToColor(colorArray[i]);
        this.ctx.fillRect(x, -32, stepWidth+4, 64);
        x += stepWidth;
      }
      this.ctx.restore(); // origin and rotation returns back to normal

      // draw the avatar text
      this.ctx.fillStyle = Utils.numberToColor(this.teamColors.text);
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "alphabetic";
      this.ctx.font = "900 34px 'Arial Black','Arial Bold',Gadget,sans-serif";
      this.ctx.fillText(this.avatarText, 32, 44);

      // convert this drawing into a pattern
      this.pattern = this.ctx.createPattern(this.ctx.canvas, "no-repeat");
    }
  };

  function HaxballRenderer(){ // N
    this.actualZoomCoeff = thisRenderer.zoomCoeff;
    this.lastRenderTime = window.performance.now(); // $c
    this.decoratorsByObject = new Map(); // Jg
    this.decoratorsById = new Map(); // dd
    this.origin = new Point(0, 0); // Ya
    this.gamePaused = false; // Dk
    this.textRenderer = new CanvasTextRenderer(); // td
    this.canvas = params.canvas; // sa
    this.canvas.mozOpaque = true;
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.grassPattern = this.ctx.createPattern(/*n.Ko*/params.images?.grass, null); // Lo
    this.concretePattern = this.ctx.createPattern(/*n.Vn*/params.images?.concrete, null); // Wn
    this.concrete2Pattern = this.ctx.createPattern(/*n.Tn*/params.images?.concrete2, null); // Un
  }
  HaxballRenderer.setSmoothingEnabled = function(ctx, enabled){ // Gi
    ctx.imageSmoothingEnabled = enabled;
    ctx.mozImageSmoothingEnabled = enabled;
  };
  HaxballRenderer.prototype = {
    updateChatIndicator: function(id, value){ // Po
      var decorator = this.decoratorsById.get(id);
      if (decorator)
        decorator.chatIndicatorActive = value;
    },
    resizeCanvas: function(){ // Pr
      if (!this.canvas.parentElement)
        return;
      var coeff = window.devicePixelRatio*thisRenderer.resolutionScale, rect = this.canvas.getBoundingClientRect();
      var w = Math.round(coeff*rect.width), h = Math.round(coeff*rect.height);
      if (this.canvas.width!=w || this.canvas.height!=h) {
        this.canvas.width = w;
        this.canvas.height = h;
      }
    },
    transformPixelCoordToMapCoord: function(x, y){
      return {
        x: (x-this.canvas.width/2)/this.actualZoomCoeff+this.origin.x, 
        y: (y-this.canvas.height/2)/this.actualZoomCoeff+this.origin.y
      };
    },
    transformMapCoordToPixelCoord: function(x, y){
      return {
        x: this.actualZoomCoeff*(x-this.origin.x)+this.canvas.width/2, 
        y: this.actualZoomCoeff*(y-this.origin.y)+this.canvas.height/2
      };
    },
    transformPixelDistanceToMapDistance: function(dist){
      return dist/this.actualZoomCoeff;
    },
    transformMapDistanceToPixelDistance: function(dist){
      return dist*this.actualZoomCoeff;
    },
    onSegment: function(a, b, x, y){
      var segmentLengthSqr = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
      var r = ((x - a.x) * (b.x - a.x) + (y - a.y) * (b.y - a.y)) / segmentLengthSqr;
      if (r<0 || r>1) return false;
      var sl = ((a.y - y) * (b.x - a.x) - (a.x - x) * (b.y - a.y)) / Math.sqrt(segmentLengthSqr);
      return Math.abs(sl) <= 0.00000001;
    },
    inteceptCircleLineSeg: function(circle, line){
      var b, c, d, u1, u2, ret, v1, v2;
      var v1 = {
        x: line.p2.x - line.p1.x,
        y: line.p2.y - line.p1.y
      };
      var v2 = {
        x: line.p1.x - circle.Xd.x,
        y: line.p1.y - circle.Xd.y
      };
      b = (v1.x * v2.x + v1.y * v2.y);
      c = 2 * (v1.x * v1.x + v1.y * v1.y);
      b *= -2;
      d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.Yj * circle.Yj));
      if(isNaN(d)) // no intercept
        return;
      u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
      u2 = (b + d) / c; 
      if (u1<0 && u2<0)
        return;
      ret = []; // return array
      //if(u1 <= 1 && u1 >= 0){  // add point if on the line segment
      if (u1>0)
        ret.push({
          x: line.p1.x + v1.x * u1,
          y: line.p1.y + v1.y * u1
        });
      //}
      //if(u2 <= 1 && u2 >= 0){  // second add point if on the line segment
      if (u2>0)
        ret.push({
          x: line.p1.x + v1.x * u2,
          y: line.p1.y + v1.y * u2
        });
      //}
      return ret;
    },
    render: function(roomState){ // Kc
      var time = window.performance.now(), deltaTime = (time-this.lastRenderTime)/1000;
      this.lastRenderTime = time;
      this.decoratorsByObject.clear();
      this.resizeCanvas();
      HaxballRenderer.setSmoothingEnabled(this.ctx, true);
      this.ctx.resetTransform();
      if (!roomState.gameState)
        return;
      var gameState = roomState.gameState, mapObjects = gameState.physicsState, followPlayer = roomState.getPlayer(thisRenderer.followPlayerId), followDisc = followPlayer?.disc;
      var zoomCoeff = thisRenderer.zoomCoeff*window.devicePixelRatio*thisRenderer.resolutionScale;
      var maxViewWidth = gameState.stadium.maxViewWidth, viewWidth = this.canvas.width/zoomCoeff;
      if (maxViewWidth>0 && maxViewWidth<viewWidth){
        viewWidth = maxViewWidth;
        zoomCoeff = this.canvas.width/maxViewWidth;
      }
      var viewHeight = this.canvas.height/zoomCoeff;
      this.updateCameraOrigin(gameState, followDisc, viewWidth, viewHeight, deltaTime);
      var playerObjects = roomState.players;
      for (var i=0;i<playerObjects.length;i++){
        var playerObject = playerObjects[i];
        if (!playerObject.disc)
          continue;
        var playerDecorator = this.decoratorsById.get(playerObject.id);
        if (!playerDecorator){
          playerDecorator = new PlayerDecorator();
          this.decoratorsById.set(playerObject.id, playerDecorator);
        }
        playerDecorator.update(playerObject, roomState);
        this.decoratorsByObject.set(playerObject.disc, playerDecorator);
      }
      this.actualZoomCoeff = zoomCoeff;
      this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
      this.ctx.scale(zoomCoeff, zoomCoeff);
      this.ctx.translate(-this.origin.x, -this.origin.y);
      this.ctx.lineWidth = 3;
      this.drawBackground(gameState.stadium);
      this.drawAllSegments(gameState.stadium);
      var discs = mapObjects.discs, joints = mapObjects.joints;
      for (var i=0;i<joints.length;i++)
        this.drawJoint(joints[i], discs);
      this.indicateAllLocations(roomState, viewWidth, viewHeight);
      this.drawPlayerDecoratorsAndChatIndicators(roomState, followPlayer);
      if (thisRenderer.currentPlayerDistinction && followDisc)
        this.drawHalo(followDisc.pos);
      this.ctx.lineWidth = 2;
      for (var i=0;i<playerObjects.length;i++){
        var playerObject = playerObjects[i], playerDisc = playerObject.disc;
        if (!playerDisc)
          continue;
        this.drawDisc(playerDisc, this.decoratorsById.get(playerObject.id));
      }
      for (var i=0;i<discs.length;i++){
        var disc = discs[i];
        if (this.decoratorsByObject.get(disc))
          continue;
        this.drawDisc(disc, null);
      }

      if (thisRenderer.aimbotActive){
        var ball = discs[0];
        if (ball && followDisc){
          var coord = ball.a, baseCoord = followDisc.a, remainingDist = thisRenderer.aimbotDistThreshold;
          var xb = coord.x, yb = coord.y;
          var dx = xb-baseCoord.x, dy = yb-baseCoord.y, dd = Math.sqrt(dx*dx+dy*dy);
          if (dd<ball.radius+followDisc.radius+thisRenderer.minAimbotDistToBall){
            var iter = 0;
            while(remainingDist>0 && iter<1000){
              dx/=dd, dy/=dd;
              var f = null, coll = null, N = null, minSqrDist = Infinity;
              for (var i = 0, e = mapObjects.U; i < e.length; i++)
                if (((f = e[i]), 0 != (f.h & ball.v) && 0 != (f.v & ball.h))) {
                  if (0*f.vb!=0){ // line
                    var Ua = f.wa.x*f.W.a.x+f.wa.y*f.W.a.y;
                    var k = (Ua-f.wa.y*yb-f.wa.x*xb)/(f.wa.y*dy+f.wa.x*dx);
                    if (k>0){
                      var x = xb+k*dx, y = yb+k*dy;
                      if (this.onSegment(f.W.a, f.ca.a, x, y)){
                        var p = {x:x,y:y};
                        var sqrDist = (p.x-xb)*(p.x-xb)+(p.y-yb)*(p.y-yb);
                        if (sqrDist<minSqrDist){
                          coll = p;
                          minSqrDist = sqrDist;
                          N = f.wa;
                        }
                      }
                    }
                  }
                  else{ // arc
                    var pts = this.inteceptCircleLineSeg(f, {p1: baseCoord, p2: coord});
                    if (pts){
                      var pos1 = f.W.a, pos2 = f.ca.a, center = f.Xd;
                      var a1 = Math.atan2(pos1.y-center.y, pos1.x-center.x)*180/Math.PI;
                      if (a1<0)
                        a1+=360;
                      var a2 = Math.atan2(pos2.y-center.y, pos2.x-center.x)*180/Math.PI;
                      if (a2<=0)
                        a2+=360;
                      pts.forEach((p)=>{
                        var a = Math.atan2(p.y-center.y, p.x-center.x)*180/Math.PI;
                        if (a<0)
                          a+=360;
                        if (a1<=a && a<=a2){
                          var sqrDist = (p.x-xb)*(p.x-xb)+(p.y-yb)*(p.y-yb);
                          if (sqrDist<minSqrDist){
                            coll = p;
                            minSqrDist = sqrDist;
                            // let's calculate the normal for this point:
                            var xd = p.x-center.x, yd = p.y-center.y, dist = Math.sqrt(xd*xd+yd*yd);
                            N = {
                              x: xd/dist,
                              y: yd/dist
                            };
                          }
                        }
                      });
                    }
                  }
                }
              for (var i = 0, e = mapObjects.qa; i < e.length; i++)
                if (((f = e[i]), 0 != (f.h & ball.v) && 0 != (f.v & ball.h))) {
                  /*
                  plane: px+qy=r (p = f.wa.x, q = f.wa.y, r = f.Ua)
                  ray: direction: c, s; point: x', y' (c = dx, s = dy, x' = xb, y' = yb)

                  y=y'+k.s
                  x=x'+k.c
                  p(y'+k.s)+q(x'+k.c)=r
                  p.y'+k.p.s+q.x'+k.q.c=r
                  k=(r-p.y'-q.x')/(p.s+q.c)
                  */

                  var k = (f.Ua-f.wa.y*yb-f.wa.x*xb)/(f.wa.y*dy+f.wa.x*dx);
                  if (k>0){
                    var p = {
                      x: xb+k*dx, 
                      y: yb+k*dy
                    };
                    var sqrDist = (p.x-xb)*(p.x-xb)+(p.y-yb)*(p.y-yb);
                    if (sqrDist<minSqrDist){
                      coll = p;
                      minSqrDist = sqrDist;
                      N = f.wa;
                    }
                  }
                }
              if (coll){
                this.ctx.save();
                this.ctx.strokeStyle = thisRenderer.aimbotColor;
                this.ctx.beginPath();
                this.ctx.moveTo(xb, yb);
                this.ctx.lineTo(coll.x, coll.y);
                this.ctx.stroke();
                this.ctx.restore();
                
                remainingDist -= Math.sqrt(minSqrDist);
                if (remainingDist<=0)
                  break;

                // R: (dx, dy), N: N, reflection vector = R-2(R.N)N
                var coeff = 2*(dx*N.x+dy*N.y), dx2 = dx-coeff*N.x, dy2 = dy-coeff*N.y;
                coord = {
                  x: coll.x+dx2*0.0001,
                  y: coll.y+dy2*0.0001,
                };
                baseCoord = coll;
                xb = coord.x;
                yb = coord.y;
                dx = xb-baseCoord.x;
                dy = yb-baseCoord.y;
                dd = Math.sqrt(dx*dx+dy*dy);
              }
              else
                break;
              iter++;
            }
          }
        }
      }

      this.ctx.lineWidth = 3;
      this.ctx.resetTransform();
      this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
      this.updateGamePaused(gameState);
      if (gameState.pauseGameTickCounter<=0){
        this.textRenderer.update(deltaTime);
        this.textRenderer.render(this.ctx);
      }
      this.decoratorsByObject.clear();
      this.cleanUpDecoratorsById(roomState);
    },
    cleanUpDecoratorsById: function(roomState){ // Kq
      var players = roomState.players;
      var playerIds = new Set();
      for (var i=0;i<players.length;i++)
        playerIds.add(players[i].id);
      var decoratorPlayerIds = this.decoratorsById.keys();
      for (var it=decoratorPlayerIds.next();!it.done;it=decoratorPlayerIds.next()){
        var playerId = it.value;
        if (!playerIds.has(playerId))
          this.decoratorsById.delete(playerId);
      }
    },
    updateCameraOrigin: function(gameState, followDisc, viewWidth, viewHeight, deltaTime){
      var stadium = gameState.stadium;
      if (thisRenderer.followMode){
        var x, y;
        if (followDisc && stadium.cameraFollow==1){
          var pos = followDisc.pos; // player's position
          x = pos.x;
          y = pos.y;
        }
        else{
          var pos = gameState.physicsState.discs[0].pos; // ball's position
          x = pos.x;
          y = pos.y;
          if (followDisc){
            var playerPos = followDisc.pos;
            x = 0.5*(x+playerPos.x);
            y = 0.5*(y+playerPos.y);
            var w = 0.5*viewWidth;
            var h = 0.5*viewHeight;
            var minX = playerPos.x-w+50;
            var minY = playerPos.y-h+50;
            var maxX = playerPos.x+w-50;
            var maxY = playerPos.y+h-50;
            x = (x>maxX) ? maxX : ((x<minX) ? minX : x);
            y = (y>maxY) ? maxY : ((y<minY) ? minY : y);
          }
        }
        var t = 60*deltaTime;
        if (t>1)
          t = 1;
        t *= 0.04;
        var origin = this.origin;
        var x0 = origin.x;
        var y0 = origin.y;
        origin.x = x0+(x-x0)*t;
        origin.y = y0+(y-y0)*t;
      }

      if (thisRenderer.restrictCameraOrigin){
        if (viewWidth>2*stadium.width)
          this.origin.x = 0;
        else if (this.origin.x+0.5*viewWidth>stadium.width)
          this.origin.x = stadium.width-0.5*viewWidth;
        else if (this.origin.x-0.5*viewWidth<-stadium.width)
          this.origin.x = -stadium.width+0.5*viewWidth;
        
        if (viewHeight>2*stadium.height)
          this.origin.y = 0;
        else if (this.origin.y+0.5*viewHeight>stadium.height)
          this.origin.y = stadium.height-0.5*viewHeight;
        else if (this.origin.y-0.5*viewHeight<-stadium.height)
          this.origin.y = -stadium.height+0.5*viewHeight;
      }

      // fix all possible camera bugs
      if (this.origin.x*0 != 0)
        this.origin.x = 0;
      if (this.origin.y*0 != 0)
        this.origin.y = 0;
    },
    drawHalo: function(pos){ // Pq
      this.ctx.beginPath();
      this.ctx.strokeStyle = "white";
      this.ctx.globalAlpha = 0.3;
      if (thisRenderer.squarePlayers)
        this.ctx.rect(pos.x-25, pos.y-25, 50, 50);
      else
        this.ctx.arc(pos.x, pos.y, 25, 0, 2*Math.PI, false);
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
    },
    updateGamePaused: function(gameState){ // Oq
      var paused = (gameState.pauseGameTickCounter>0);
      this.setGamePaused(paused);
      if (!paused)
        return;
      if (gameState.pauseGameTickCounter!=120){
        var width = (gameState.pauseGameTickCounter/120)*200;
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(-0.5*width, 100, width, 20);
      }
      this.textRenderer.gamePause.renderStatic(this.ctx);
    },
    setGamePaused: function(gamePaused){ // lr
      if (gamePaused==this.gamePaused)
        return;
      this.canvas.style.filter = (gamePaused ? "grayscale(70%)" : "");
      this.gamePaused = gamePaused;
    },
    drawRoundedRect: function(ctx, x, y, width, height, cornerRadius){
      var x2 = x+width;
      var y2 = y+height;
      ctx.beginPath();
      ctx.moveTo(x2-cornerRadius, y);
      ctx.arcTo(x2, y, x2, y+cornerRadius, cornerRadius);
      ctx.lineTo(x2, y2-cornerRadius);
      ctx.arcTo(x2, y2, x2-cornerRadius, y2, cornerRadius);
      ctx.lineTo(x+cornerRadius, y2);
      ctx.arcTo(x, y2, x, y2-cornerRadius, cornerRadius);
      ctx.lineTo(x, y+cornerRadius);
      ctx.arcTo(x, y, x+cornerRadius, y, cornerRadius);
      ctx.closePath();
    },
    drawBackground: function(stadium){ // Sq
      HaxballRenderer.setSmoothingEnabled(this.ctx, false);
      var width = stadium.bgWidth, height = stadium.bgHeight;
      if (stadium.bgType==1) {
        this.ctx.save();
        this.ctx.resetTransform();
        this.ctx.fillStyle = Utils.numberToColor(stadium.bgColor);
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
        if (thisRenderer.drawBackground){
          this.ctx.strokeStyle = "#C7E6BD";
          this.ctx.fillStyle = this.grassPattern;
          this.drawRoundedRect(this.ctx, -width, -height, 2*width, 2*height, stadium.bgCornerRadius);
          this.ctx.save();
          this.ctx.scale(2, 2);
          this.ctx.fill();
          this.ctx.restore();
          this.ctx.moveTo(0, -height);
          this.ctx.lineTo(0, height);
          this.ctx.stroke();
          this.ctx.beginPath();
          this.ctx.arc(0, 0, stadium.bgKickOffRadius, 0, 2*Math.PI);
          this.ctx.stroke();
        }
      }
      else if (stadium.bgType==2){
        this.ctx.strokeStyle = "#E9CC6E";
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(this.origin.x-10000, this.origin.y-10000, 20000, 20000);
        this.ctx.scale(2, 2);
        this.ctx.fillStyle = this.concrete2Pattern;
        this.ctx.fill();
        this.ctx.restore();
        if (thisRenderer.drawBackground){
          this.ctx.save();
          this.drawRoundedRect(this.ctx, -width, -height, 2*width, 2*height, stadium.bgCornerRadius);
          this.ctx.scale(2, 2);
          this.ctx.fillStyle = this.concretePattern;
          this.ctx.fill();
          this.ctx.restore();
          this.ctx.stroke();
          this.ctx.beginPath();
          this.ctx.moveTo(0, -height);
          this.ctx.setLineDash([15, 15]);
          this.ctx.lineTo(0, height);
          this.ctx.stroke();
          this.ctx.setLineDash([]);
          var goalLine = stadium.bgGoalLine, delta = width-goalLine;
          if (goalLine<stadium.bgCornerRadius)
            delta = 0;
          var that = this;
          var drawKickOff = function(color, x, ccw){
            that.ctx.beginPath();
            that.ctx.strokeStyle = color;
            that.ctx.arc(0, 0, stadium.bgKickOffRadius, -1.5707963267948966, 1.5707963267948966, ccw);
            if (x!=0){
              that.ctx.moveTo(x, -height);
              that.ctx.lineTo(x, height);
            }
            that.ctx.stroke();
          };
          drawKickOff("#85ACF3", delta, false);
          drawKickOff("#E18977", -delta, true);
        }
      }
      else {
        this.ctx.save();
        this.ctx.resetTransform();
        this.ctx.fillStyle = Utils.numberToColor(stadium.bgColor);
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
      }
      HaxballRenderer.setSmoothingEnabled(this.ctx, true);
    },
    drawPlayerDecoratorsAndChatIndicators: function(roomState, followPlayer){ // Nq
      var showIndicators = thisRenderer.showChatIndicators/*localStorageObj.Ak.L()*/, players = roomState.players; // "show_indicators"
      for (var i=0;i<players.length;i++){
        var player = players[i];
        var disc = player.disc;
        if (!disc)
          continue;
        var pos = disc.pos, decorator = this.decoratorsById.get(player.id);
        if (showIndicators && decorator.chatIndicatorActive && /*n.Dm*/params.images?.typing)
          this.ctx.drawImage(params.images.typing, pos.x-0.5*params.images.typing.width, pos.y-35);
        if (!thisRenderer.currentPlayerDistinction || player!=followPlayer)
          decorator.drawToCanvas(this.ctx, pos.x, pos.y+50);
      }
    },
    drawDisc: function(disc, playerDecorator){ // Ll
      this.ctx.beginPath();
      if (playerDecorator){
        this.ctx.fillStyle = playerDecorator.pattern;
        this.ctx.strokeStyle = playerDecorator.strokeStyle;
      }
      else{
        this.ctx.fillStyle = Utils.numberToColor(disc.color);
        this.ctx.strokeStyle = "black";
      }
      this.ctx.beginPath();
      if (playerDecorator){
        if (thisRenderer.squarePlayers)
          this.ctx.rect(disc.pos.x-disc.radius, disc.pos.y-disc.radius, 2*disc.radius, 2*disc.radius);
        else
          this.ctx.arc(disc.pos.x, disc.pos.y, disc.radius, 0, 2*Math.PI, false);
        this.ctx.save();
        var c = disc.radius/32;
        this.ctx.translate(disc.pos.x, disc.pos.y);
        this.ctx.scale(c, c);
        this.ctx.translate(-32, -32);
        this.ctx.fill();
        this.ctx.restore();
      }
      else if ((disc.color|0)!=-1){
        this.ctx.arc(disc.pos.x, disc.pos.y, disc.radius, 0, 2*Math.PI, false);
        this.ctx.fill();
      }
      this.ctx.stroke();
    },
    drawAllSegments: function(stadium){ // Rq
      if (!stadium)
        return;
      var segments = stadium.segments;
      for (var i=0;i<segments.length;i++)
        this.drawSegment(segments[i]);
    },
    drawJoint: function(joint, discs){ // Mq
      if (!thisRenderer.showInvisibleJoints && joint.color<0)
        return;
      this.ctx.beginPath();
      this.ctx.strokeStyle = joint.color<0 ? "#006060" : Utils.numberToColor(joint.color);
      var disc1 = discs[joint.d0], disc2 = discs[joint.d1];
      if (!disc1 || !disc2)
        return;
      var pos1 = disc1.pos;
      var pos2 = disc2.pos;
      this.ctx.moveTo(pos1.x, pos1.y);
      this.ctx.lineTo(pos2.x, pos2.y);
      this.ctx.stroke();
    },
    drawSegment: function(segment){ // Qq
      if (!thisRenderer.showInvisibleSegments && !segment.vis)
        return;
      this.ctx.beginPath();
      this.ctx.strokeStyle = Utils.numberToColor(segment.color);
      var pos1 = segment.v0.pos, pos2 = segment.v1.pos;
      if (0*segment.curveF!=0){ // line
        this.ctx.moveTo(pos1.x, pos1.y);
        this.ctx.lineTo(pos2.x, pos2.y);
      }
      else{ // arc
        var center = segment.center, deltaX = pos1.x-center.x, deltaY = pos1.y-center.y;
        this.ctx.arc(center.x, center.y, Math.sqrt(deltaX*deltaX+deltaY*deltaY), Math.atan2(deltaY, deltaX), Math.atan2(pos2.y-center.y, pos2.x-center.x));
      }
      this.ctx.stroke();
    },
    indicateAllLocations: function(roomState, viewWidth, viewHeight){ // Lq
      var gameState = roomState.gameState;
      if (!gameState)
        return;
      var ballDisc = gameState.physicsState.discs[0];
      this.indicateLocation(ballDisc.pos, ballDisc.color, viewWidth, viewHeight);
      var players = roomState.players;
      for (var i=0;i<players.length;i++){
        var player = players[i], playerDisc = player.disc;
        if (!playerDisc)
          continue;
        this.indicateLocation(playerDisc.pos, player.team.color, viewWidth, viewHeight);
      }
    },
    indicateLocation: function(pos, color, viewWidth, viewHeight){ // nk
      viewWidth = 0.5*viewWidth-25;
      viewHeight = 0.5*viewHeight-25;
      var origin = this.origin;
      var deltaX = pos.x-origin.x;
      var deltaY = pos.y-origin.y;
      var x = origin.x+((deltaX>viewWidth) ? viewWidth : ((deltaX<-viewWidth) ? -viewWidth : deltaX));
      var y = origin.y+((deltaY>viewHeight) ? viewHeight : ((deltaY<-viewHeight) ? -viewHeight : deltaY));
      deltaX = pos.x-x;
      deltaY = pos.y-y;
      if (deltaX*deltaX+deltaY*deltaY<=900)
        return;
      // draw location indicator's shadow
      this.ctx.fillStyle = "rgba(0,0,0,0.5)";
      this.drawLocationIndicator(x+2, y+2, Math.atan2(deltaY, deltaX));
      // draw location indicator
      this.ctx.fillStyle = Utils.numberToColor(color);
      this.drawLocationIndicator(x-2, y-2, Math.atan2(deltaY, deltaX));
    },
    drawLocationIndicator: function(x, y, angle){ // pk
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(angle);
      this.ctx.beginPath();
      this.ctx.moveTo(15, 0);
      this.ctx.lineTo(0, 7);
      this.ctx.lineTo(0, -7);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    },
    resetChatIndicators: function(){ // Xq
      // This function is only used while viewing replays, so it might be deleted.
      var a = this.decoratorsById.values(), b = a.next();
      while (!b.done){
        b.value.chatIndicatorActive = false;
        b = a.next();
      }
    }
  };

  // end of basro's renderer logic

  var rendererObj = null; // Eb

  this.initialize = function(room){
    thisRenderer.followPlayerId = room.currentPlayerId;
    rendererObj = new HaxballRenderer();
  };

  this.finalize = function(){
    rendererObj = null;
  };

  this.render = function(extrapolatedRoomState){ // render logic here. called inside requestAnimationFrame callback
    if (!params.paintGame || !extrapolatedRoomState.gameState)
      return;
    rendererObj.render(extrapolatedRoomState);
    params.onRequestAnimationFrame && params.onRequestAnimationFrame(extrapolatedRoomState);
  };

  // you can keep track of changes using these callbacks, and apply them in your render logic:

  this.onPlayerChatIndicatorChange = function(id, value, customData){ // wl (a, b)
    rendererObj.updateChatIndicator(id, value);
  };

  this.onTeamGoal = function(teamId, customData){ // Ni (a)
    var tr = rendererObj.textRenderer; // "Red Scores!", "Blue Scores!"
    tr.addText((teamId==Team.red.id) ? tr.redScore : tr.blueScore);
  };

  this.onGameStart = function(byId, customData){ // Ki (a)
    rendererObj.textRenderer.reset();
  };

  this.onGameEnd = function(winningTeamId, customData){ // Oi (a)
    var tr = rendererObj.textRenderer; // "Red is Victorious!", "Blue is Victorious!"
    tr.addText((winningTeamId==Team.red.id) ? tr.redVictory : tr.blueVictory);
  };

  this.onTimeIsUp = function(customData){ // Pi ()
    var tr = rendererObj.textRenderer; // "Time is Up!"
    tr.addText(tr.timeUp);
  };

  this.onLanguageChange = function(abbr, customData){
    rendererObj.textRenderer = new CanvasTextRenderer(); // td
  };

  this.onKeyDown = function(e){
    switch(e.keyCode){
      case 107:{ // Numpad '+' key
        thisRenderer.zoomCoeff += 0.1;
        break;
      }
      case 109:{ // Numpad '-' key
        thisRenderer.zoomCoeff -= 0.1;
        if (thisRenderer.zoomCoeff<=0)
          thisRenderer.zoomCoeff = 0.01;
        break;
      }
    }
  };
  
  this.transformPixelCoordToMapCoord = function(x, y){
    return rendererObj.transformPixelCoordToMapCoord(x, y);
  };
  
  this.transformMapCoordToPixelCoord = function(x, y){
    return rendererObj.transformMapCoordToPixelCoord(x, y);
  };

  this.transformPixelDistanceToMapDistance = function(dist){
    return rendererObj.transformPixelDistanceToMapDistance(dist);
  };

  this.transformMapDistanceToPixelDistance = function(dist){
    return rendererObj.transformMapDistanceToPixelDistance(dist);
  };

  this.getOrigin = function(){
    return rendererObj.origin;
  };

  this.getActualZoomCoefficient = function(){
    return rendererObj.actualZoomCoeff;
  };

  this.setOrigin = function(origin){
    rendererObj.origin.x = origin.x;
    rendererObj.origin.y = origin.y;
  };

  /*
    w = this.canvas.width, 
    h = this.canvas.height,
    z = this.actualZoomCoeff,
    zc = zoomCoeff,
    Ox = this.origin.x,
    Oy = this.origin.y,
    p_to_m(x, y): [(x-w/2)/z+Ox, (y-h/2)/z+Oy],
    m_to_p(x, y): [z*(x-Ox)+w/2, z*(y-Oy)+h/2],

    e_x_p = pixelCoordX, 
    e_y_p = pixelCoordY, 

    Origin Calculation:
    -------------------

    old map coords of event point: [(e_x_p-w/2)/z+Ox, (e_y_p-h/2)/z+Oy]
    new map coords of event point: [(e_x_p-w/2)/z_new+Ox_new, (e_y_p-h/2)/z_new+Oy_new]
    
    we want them to be equal, so;

    (e_x_p-w/2)/z_new+Ox_new = (e_x_p-w/2)/z+Ox
    (e_y_p-h/2)/z_new+Oy_new = (e_y_p-h/2)/z+Oy
    
    Ox_new = (e_x_p-w/2)*(1/z-1/z_new)+Ox
    Oy_new = (e_y_p-h/2)*(1/z-1/z_new)+Oy
  */
  this.zoomIn = function(pixelCoordX, pixelCoordY, zoomCoeff){
    var { origin, canvas } = rendererObj, k = (1-1/zoomCoeff)/thisRenderer.zoomCoeff;
    origin.x += k*(pixelCoordX-canvas.width/2);
    origin.y += k*(pixelCoordY-canvas.height/2);
    thisRenderer.zoomCoeff *= zoomCoeff;
  };

  this.zoomOut = function(pixelCoordX, pixelCoordY, zoomCoeff){
    var { origin, canvas } = rendererObj, k = (1-zoomCoeff)/thisRenderer.zoomCoeff;
    origin.x += k*(pixelCoordX-canvas.width/2);
    origin.y += k*(pixelCoordY-canvas.height/2);
    thisRenderer.zoomCoeff /= zoomCoeff;
  };

  this.onWheel = function(event){
    if (event.deltaY<0)
      thisRenderer.zoomIn(event.offsetX, event.offsetY, thisRenderer.wheelZoomCoeff);
    else
      thisRenderer.zoomOut(event.offsetX, event.offsetY, thisRenderer.wheelZoomCoeff);
  };
};

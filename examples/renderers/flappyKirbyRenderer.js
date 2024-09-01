module.exports = function(API, params){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;
  
  Object.setPrototypeOf(this, Renderer.prototype);
  Renderer.call(this, { // Every renderer should have a unique name.
    name: "flappyKirby",
    version: "1.2",
    author: "basro & abc",
    description: `This is a customized and de-optimized renderer that renders players as flappy kirby animations. Use +, - keys for zoom in-out. Disable followMode to zoom using mouse wheel.`
  });

  // parameters are exported so that they can be edited outside this class.
  this.defineVariable({
    name: "showPlayerIds",
    description: "Show player ids?", 
    type: VariableType.Boolean,
    value: false
  });

  this.defineVariable({
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

  this.defineVariable({
    name: "sizeCoeff",
    description: "Character Size Coefficient", 
    type: VariableType.Number,
    value: 2.0,
    range: {
      min: 0,
      max: Infinity,
      step: 0.01
    }
  });

  this.defineVariable({
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
  
  this.defineVariable({ // resolution_scale
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
  
  this.defineVariable({ // show_indicators
    name: "showChatIndicators",
    description: "Show Chat Indicators?", 
    type: VariableType.Boolean,
    value: true
  });

  this.defineVariable({
    name: "restrictCameraOrigin",
    description: "Restrict camera origin to view bounds?", 
    type: VariableType.Boolean,
    value: true
  });

  this.defineVariable({
    name: "followMode",
    description: "Follow camera enabled?", 
    type: VariableType.Boolean,
    value: true
  });
  
  this.defineVariable({
    name: "followPlayerId",
    description: "Id of the player that the camera will follow", 
    type: VariableType.Integer,
    value: null
  });

  this.defineVariable({
    name: "drawBackground",
    description: "Draw Background?", 
    type: VariableType.Boolean,
    value: true
  });

  this.defineVariable({
    name: "currentPlayerDistinction",
    description: "Hide current player's name and draw halo around current player?", 
    type: VariableType.Boolean,
    value: true
  });
  
  this.defineVariable({
    name: "showInvisibleSegments",
    description: "Show invisible segments?", 
    type: VariableType.Boolean,
    value: false
  });

  this.defineVariable({
    name: "transparentDiscBugFix",
    description: "Hide transparent discs?", 
    type: VariableType.Boolean,
    value: true
  });

  this.defineVariable({
    name: "animSpeed",
    description: "Animation speed coefficient", 
    type: VariableType.Number,
    value: 4.0,
    range: {
      min: 1,
      max: 1000,
      step: 0.1
    }
  });

  this.defineVariable({
    name: "playerEdges",
    description: "Show/Hide player edges?", 
    type: VariableType.Boolean,
    value: false
  });

  var thisRenderer = this, { Point, Team, TeamColors } = Impl.Core, animData;

  // language-related stuff

  const LanguageData = {
    "GB": [
      "Time is", "Up!", 
      "Red is", "Victorious!", 
      "Red", "Scores!", 
      "Blue is", "Victorious!", 
      "Blue", "Scores!", 
      "Game", "Paused" 
    ],
    "TR": [
      "Süre", "Doldu!", 
      "Kırmızı Takım", "Kazandı!", 
      "Kırmızı Takım", "Gol Attı!", 
      "Mavi Takım", "Kazandı!", 
      "Mavi Takım", "Gol Attı!", 
      "Oyun", "Durduruldu" 
    ],
    "PT": [
      "O tempo", "Acabou!",
      "O vermelho é", "Vitorioso!",
      "O vermelho", "Marca!",
      "O azul é", "Vitorioso!",
      "Pontuações", "Azuis!",
      "Jogo em", "Pausa"
    ],
    "ES": [
      "¡El tiempo ha", "Terminado!",
      "¡El red ha", "Ganado!",
      "¡Punto para el", "Red!",
      "¡El azul ha", "Ganado!",
      "¡Punto para el", "Blue!",
      "Juego en", "Pausa"
    ]
  };

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
    const TextMap = LanguageData[Language.current?.abbr||"GB"];
    this.time = 0; // xc
    this.textQueue = []; // ab
    this.timeUp = new CanvasText([TextMap[0], TextMap[1]], 16777215); // Ar // ["Time is", "Up!"]
    this.redVictory = new CanvasText([TextMap[2], TextMap[3]], 15035990); // Gq // ["Red is", "Victorious!"]
    this.redScore = new CanvasText([TextMap[4], TextMap[5]], 15035990); // Fq // ["Red", "Scores!"]
    this.blueVictory = new CanvasText([TextMap[6], TextMap[7]], 625603); // Cn // ["Blue is", "Victorious!"]
    this.blueScore = new CanvasText([TextMap[8], TextMap[9]], 625603); // Bn // ["Blue", "Scores!"]
    this.gamePause = new CanvasText([TextMap[10], TextMap[11]], 16777215); // eq // ["Game", "Paused"]
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

  function HaxballRenderer(){ // N
    this.actualZoomCoeff = thisRenderer.zoomCoeff;
    this.lastRenderTime = window.performance.now(); // $c
    this.chatIndicators = new Map();
    this.origin = new Point(0, 0); // Ya
    this.gamePaused = false; // Dk
    this.textRenderer = new CanvasTextRenderer(); // td
    this.canvas = params.canvas; // sa
    this.canvas.mozOpaque = true;
    this.canvas.style.filter = "";
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
      var decorator = this.chatIndicators.get(id);
      if (!decorator)
        this.chatIndicators.set(id, {value});
      else
        decorator.value = value;
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
    render: function(roomState){ // Kc
      var time = window.performance.now(), deltaTime = (time-this.lastRenderTime)/1000;
      this.spf = deltaTime;
      this.lastRenderTime = time;
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
      if (thisRenderer.currentPlayerDistinction && followDisc)
        this.drawHalo(followDisc.pos);
      this.ctx.lineWidth = 2;
      for (var i=0;i<playerObjects.length;i++){
        var playerObject = playerObjects[i], playerDisc = playerObject.disc;
        if (!playerDisc)
          continue;
        this.drawPlayer(playerObject, playerDisc);
      }
      for (var i=0;i<discs.length;i++){
        var disc = discs[i];
        if (disc.playerId!=null)
          continue;
        this.drawDisc(disc);
      }
      this.ctx.lineWidth = 3;
      this.ctx.resetTransform();
      this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
      this.updateGamePaused(gameState);
      if (gameState.pauseGameTickCounter<=0){
        this.textRenderer.update(deltaTime);
        this.textRenderer.render(this.ctx);
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
    drawPlayer: function(player, disc){
      var {id, name} = player;
      var data = animData[id];
      if (data==null || data>=7*thisRenderer.animSpeed)
        data = animData[id] = 0;
      else
        animData[id]++;
      var img = imgs[(data/thisRenderer.animSpeed)|0];
      var s = thisRenderer.sizeCoeff*disc.radius;
      this.ctx.save();
      this.ctx.drawImage(img, 0, 0, img.width, img.height, disc.pos.x-s, disc.pos.y-s, 2*s, 2*s);
      if (thisRenderer.playerEdges){
        this.ctx.beginPath();
        this.ctx.strokeStyle = (player.isKicking)?"#ffffffa0":"#000000a0";//playerDecorator.strokeStyle;
        this.ctx.setLineDash([6, 2]);
        this.ctx.beginPath();
        this.ctx.arc(disc.pos.x, disc.pos.y, disc.radius, 0, 2*Math.PI, false);
        this.ctx.stroke();
      }
      if (thisRenderer.showChatIndicators && /*n.Dm*/params.images?.typing && this.chatIndicators.get(id)?.value)
        this.ctx.drawImage(params.images.typing, disc.pos.x-0.5*params.images.typing.width, disc.pos.y-40);
      if (!thisRenderer.currentPlayerDistinction || id!=thisRenderer.room.currentPlayerId){
        this.ctx.font = "16px sans-serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.translate(0, 45);
        this.ctx.fillText(thisRenderer.showPlayerIds ? ("["+id+"] "+name) : name, disc.pos.x, disc.pos.y);
      }
      this.ctx.restore();
    },
    drawHalo: function(pos){ // Pq
      this.ctx.beginPath();
      this.ctx.strokeStyle = "white";
      this.ctx.globalAlpha = 0.3;
      this.ctx.arc(pos.x, pos.y, 40, 0, 2*Math.PI, false);
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
    drawDisc: function(disc){ // Ll
      this.ctx.beginPath();
      var transparent = (disc.color|0)==-1;
      if (thisRenderer.transparentDiscBugFix || !transparent)
        this.ctx.fillStyle = Utils.numberToColor(disc.color);
      this.ctx.strokeStyle = "black";
      this.ctx.beginPath();
      this.ctx.arc(disc.pos.x, disc.pos.y, disc.radius, 0, 2*Math.PI, false);
      if (!thisRenderer.transparentDiscBugFix || !transparent)
        this.ctx.fill();
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
        var center = segment.arcCenter, deltaX = pos1.x-center.x, deltaY = pos1.y-center.y;
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
     this.chatIndicators = new Map();
   }
  };

  // end of basro's renderer logic

  var rendererObj = null, imgs, imagesUpdated = false; // Eb

  this.initialize = function(){
    animData = {};
    thisRenderer.followPlayerId = thisRenderer.room.currentPlayerId;
    rendererObj = new HaxballRenderer();
    imgs = [
      "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/flappyKirby/frame-1.png",
      "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/flappyKirby/frame-2.png",
      "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/flappyKirby/frame-3.png",
      "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/flappyKirby/frame-4.png",
      "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/flappyKirby/frame-5.png",
      "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/flappyKirby/frame-6.png",
      "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/flappyKirby/frame-7.png",
    ].map((x)=>{
      var img = document.createElement("img");
      img.src = x;
      return img;
    });
  };

  this.finalize = function(){
    animData = null;
    rendererObj = null;
    imgs = null;
  };

  this.render = function(extrapolatedRoomState){ // render logic here. called inside requestAnimationFrame callback
    if (!params.paintGame || !extrapolatedRoomState.gameState)
      return;
    rendererObj.render(extrapolatedRoomState);
    params.onRequestAnimationFrame && params.onRequestAnimationFrame(extrapolatedRoomState);
  };

  this.fps = function(){
    return 1/rendererObj.spf;
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
}
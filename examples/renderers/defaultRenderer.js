module.exports = function (API, localStorageObj, canvas, images, renderApi){
  
  var { OperationType, VariableType, ConnectionState, AllowFlags, Callback, Utils, Room, Replay, RoomConfig, Plugin, Renderer, Impl } = API;
  Object.setPrototypeOf(this, Renderer.prototype);
  Renderer.call(this, { // Every renderer should have a unique name.
    name: "default",
    version: "1.01",
    author: "basro & abc",
    description: `This is the un-minified version of the default renderer currently used in Haxball, with the exception that most if not all of the camera bugs have been fixed.`
  });

  var { H: Point, p: Team, ka: TeamColors } = Impl.Core;

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
    numberToColor: function(number){ // lc
      return "rgba("+[(number&16711680)>>>16, (number&65280)>>>8, number&255].join()+",255)";
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
      ctx.fillStyle = this.numberToColor(color);
      ctx.fillText(text, 0, 45);
      return canvas;
    }
  };

  function CanvasTextRenderer(){ // Sb
    this.time = 0; // xc
    this.textQueue = []; // ab
    this.timeUp = new CanvasText(["Time is", "Up!"], 16777215); // Ar
    this.redVictory = new CanvasText(["Red is", "Victorious!"], 15035990); // Gq
    this.redScore = new CanvasText(["Red", "Scores!"], 15035990); // Fq
    this.blueVictory = new CanvasText(["Blue is", "Victorious!"], 625603); // Cn
    this.blueScore = new CanvasText(["Blue", "Scores!"], 625603); // Bn
    this.gamePause = new CanvasText(["Game", "Paused"], 16777215); // eq
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
    if (c1.hd!=c2.hd || c1.ed!=c2.ed)
      return false;
    var a1 = c1.fb, a2 = c2.fb;
    if (a1.length!=a2.length)
      return false;
    for (var i=0;i<a1.length;i++)
      if (a1[i]!=a2[i])
        return false;
    return true;
  };
  var /*PlayerDecorator.*/copyTeamColors = function(to, from){ // ao
    to.hd = from.hd;
    to.ed = from.ed;
    to.fb = from.fb.slice(0);
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
      if (playerObj.H) {
        var teamColors = localStorageObj.xm.L() ? roomState.kb[playerObj.ea.$] : playerObj.ea.wm; // "team_colors"
        var avatarText = (playerObj.Jd!=null) ? playerObj.Jd : playerObj.Xb;
        var showAvatar = localStorageObj.lm.L() && (avatarText!=null); // "show_avatars"
        if (!/*PlayerDecorator.*/compareTeamColors(this.teamColors, teamColors) || (!showAvatar && (playerObj.Jb!=this.avatarNumber)) || (showAvatar && (this.avatarText!=avatarText))){
          /*PlayerDecorator.*/copyTeamColors(this.teamColors, teamColors);
          if (showAvatar){
            this.avatarText = avatarText;
            this.avatarNumber = -1;
          }
          else{
            this.avatarText = "" + playerObj.Jb;
            this.avatarNumber = playerObj.Jb;
          }
          this.createInnerFillPattern(/*this.avatarText*/);
        }
      }
      this.strokeStyle = (roomState.K.Oa>0 || !playerObj.Wb) ? "black" : ((playerObj.Wb && playerObj.Sc<=0 && playerObj.yc>=0) ? "white" : "black");
      if (playerObj.w!=this.name){
        this.name = playerObj.w;
        this.repaintPlayerName();
      }
    },
    createInnerFillPattern: function(/*avatarText*/){
      var colorArray = this.teamColors.fb;
      if (colorArray.length==0)
        return;

      // fill the colors
      this.ctx.save();
      this.ctx.translate(32, 32); // set midpoint of the canvas as origin
      this.ctx.rotate((3.141592653589793*this.teamColors.hd)/128); // team colors rotation by provided angle
      var stepWidth = 64/colorArray.length, x=-32; // here, 64 is the width of the canvas
      for (var i=0;i<colorArray.length;i++){
        this.ctx.fillStyle = HaxballRenderer.numberToColor(colorArray[i]);
        this.ctx.fillRect(x, -32, stepWidth+4, 64);
        x += stepWidth;
      }
      this.ctx.restore(); // origin and rotation returns back to normal

      // draw the avatar text
      this.ctx.fillStyle = HaxballRenderer.numberToColor(this.teamColors.ed);
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "alphabetic";
      this.ctx.font = "900 34px 'Arial Black','Arial Bold',Gadget,sans-serif";
      this.ctx.fillText(this.avatarText, 32, 44);

      // convert this drawing into a pattern
      this.pattern = this.ctx.createPattern(this.ctx.canvas, "no-repeat");
    }
  };

  function HaxballRenderer(){ // N
    this.lastRenderTime = window.performance.now(); // $c
    this.decoratorsByObject = new Map(); // Jg
    this.decoratorsById = new Map(); // dd
    this.resolutionScale = 1; // zg
    this.heightDecrement = 35; // xf
    this.fixedHeight = 0; // jf
    this.zoomCoeff = 1.5; // kf
    this.origin = new Point(0, 0); // Ya
    this.gamePaused = false; // Dk
    this.textRenderer = new CanvasTextRenderer(); // td
    this.canvas = canvas; // sa
    this.canvas.mozOpaque = true;
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.grassPattern = this.ctx.createPattern(/*n.Ko*/images?.grass, null); // Lo
    this.concretePattern = this.ctx.createPattern(/*n.Vn*/images?.concrete, null); // Wn
    this.concrete2Pattern = this.ctx.createPattern(/*n.Tn*/images?.concrete2, null); // Un
  }
  HaxballRenderer.numberToColor = function(number){ // lc
    return "rgba("+[(number&16711680)>>>16, (number&65280)>>>8, number&255].join()+",255)";
  };
  HaxballRenderer.setSmoothingEnabled = function(ctx, enabled){ // Gi
    ctx.imageSmoothingEnabled = enabled;
    ctx.mozImageSmoothingEnabled = enabled;
  };
  HaxballRenderer.prototype = {
    updateParams: function(){ // uf
      this.resolutionScale = localStorageObj.Sl.L(); // "resolution_scale"
      var viewMode = localStorageObj.Tb.L(); // "view_mode"
      if (viewMode==0){
        this.zoomCoeff = 1;
        this.fixedHeight = 0;
        this.heightDecrement = 0;
      }
      else{
        this.heightDecrement = 35;
        if (viewMode==-1)
          this.fixedHeight = 450;
        else{
          this.fixedHeight = 0;
          this.zoomCoeff = 1+0.25*(viewMode-1);
        }
      }
    },
    updateChatIndicator: function(id, value){ // Po
      var decorator = this.decoratorsById.get(id);
      if (decorator)
        decorator.chatIndicatorActive = value;
    },
    resizeCanvas: function(){ // Pr
      if (!this.canvas.parentElement)
        return;
      var coeff = window.devicePixelRatio*this.resolutionScale, rect = this.canvas.getBoundingClientRect();
      var w = Math.round(coeff*rect.width), h = Math.round(coeff*rect.height);
      if (this.canvas.width!=w || this.canvas.height!=h) {
        this.canvas.width = w;
        this.canvas.height = h;
      }
    },
    render: function(roomState, followPlayerId){ // Kc
      var time = window.performance.now(), deltaTime = (time-this.lastRenderTime)/1000;
      this.lastRenderTime = time;
      this.decoratorsByObject.clear();
      this.resizeCanvas();
      HaxballRenderer.setSmoothingEnabled(this.ctx, true);
      this.ctx.resetTransform();
      if (!roomState.K)
        return;
      var gameState = roomState.K, mapObjects = gameState.ta, followPlayer = roomState.na(followPlayerId), followDisc = followPlayer?.H;
      var zoomCoeff = (this.fixedHeight!=0) ? (this.canvas.height/this.fixedHeight) : (this.zoomCoeff*window.devicePixelRatio*this.resolutionScale);
      var heightDecrement = this.heightDecrement*this.resolutionScale, maxViewWidth = gameState.S.Ye, viewWidth = this.canvas.width/zoomCoeff;
      if (maxViewWidth>0 && maxViewWidth<viewWidth){
        viewWidth = maxViewWidth;
        zoomCoeff = this.canvas.width/maxViewWidth;
      }
      var viewHeight = (this.canvas.height-heightDecrement)/zoomCoeff;
      this.updateCameraOrigin(gameState, followDisc, viewWidth, viewHeight, deltaTime);
      var playerObjects = roomState.I;
      for (var i=0;i<playerObjects.length;i++){
        var playerObject = playerObjects[i];
        if (!playerObject.H)
          continue;
        var playerDecorator = this.decoratorsById.get(playerObject.V);
        if (!playerDecorator){
          playerDecorator = new PlayerDecorator();
          this.decoratorsById.set(playerObject.V, playerDecorator);
        }
        playerDecorator.update(playerObject, roomState);
        this.decoratorsByObject.set(playerObject.H, playerDecorator);
      }
      this.ctx.translate(this.canvas.width/2, (this.canvas.height+heightDecrement)/2);
      this.ctx.scale(zoomCoeff, zoomCoeff);
      this.ctx.translate(-this.origin.x, -this.origin.y);
      this.ctx.lineWidth = 3;
      this.drawBackground(gameState.S);
      this.drawAllSegments(gameState.S);
      var discs = mapObjects.F, joints = mapObjects.pb;
      for (var i=0;i<joints.length;i++)
        this.drawJoint(joints[i], discs);
      this.indicateAllLocations(roomState, viewWidth, viewHeight);
      this.drawPlayerDecoratorsAndChatIndicators(roomState, followPlayer);
      if (followDisc)
        this.drawHalo(followDisc.a);
      this.ctx.lineWidth = 2;
      for (var i=0;i<playerObjects.length;i++){
        var playerObject = playerObjects[i], playerDisc = playerObject.H;
        if (!playerDisc)
          continue;
        this.drawDisc(playerDisc, this.decoratorsById.get(playerObject.V));
      }
      for (var i=0;i<discs.length;i++){
        var disc = discs[i];
        if (this.decoratorsByObject.get(disc))
          continue;
        this.drawDisc(disc, null);
      }
      this.ctx.lineWidth = 3;
      this.ctx.resetTransform();
      this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
      this.updateGamePaused(gameState);
      if (gameState.Oa<=0){
        this.textRenderer.update(deltaTime);
        this.textRenderer.render(this.ctx);
      }
      this.decoratorsByObject.clear();
      this.cleanUpDecoratorsById(roomState);
    },
    cleanUpDecoratorsById: function(roomState){ // Kq
      var players = roomState.I;
      var playerIds = new Set();
      for (var i=0;i<players.length;i++)
        playerIds.add(players[i].V);
      var decoratorPlayerIds = this.decoratorsById.keys();
      for (var it=decoratorPlayerIds.next();!it.done;it=decoratorPlayerIds.next()){
        var playerId = it.value;
        if (!playerIds.has(playerId))
          this.decoratorsById.delete(playerId);
      }
    },
    updateCameraOrigin: function(gameState, followDisc, viewWidth, viewHeight, deltaTime){
      var x, y;
      if (followDisc && gameState.S.Ge==1){
        var pos = followDisc.a; // player's position
        x = pos.x;
        y = pos.y;
      }
      else{
        var pos = gameState.ta.F[0].a; // ball's position
        x = pos.x;
        y = pos.y;
        if (followDisc){
          var playerPos = followDisc.a;
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
      this.restrictCameraOrigin(viewWidth, viewHeight, gameState.S);
    },
    restrictCameraOrigin: function(viewWidth, viewHeight, stadium){ // Xn
      if (viewWidth>2*stadium.$b)
        this.origin.x = 0;
      else if (this.origin.x+0.5*viewWidth>stadium.$b)
        this.origin.x = stadium.$b-0.5*viewWidth;
      else if (this.origin.x-0.5*viewWidth<-stadium.$b)
        this.origin.x = -stadium.$b+0.5*viewWidth;
      else if (isNaN(this.origin.x) || !isFinite(this.origin.x)) // fix all possible camera bugs
        this.origin.x = 0;

      if (viewHeight>2*stadium.qc)
        this.origin.y = 0;
      else if (this.origin.y+0.5*viewHeight>stadium.qc)
        this.origin.y = stadium.qc-0.5*viewHeight;
      else if (this.origin.y-0.5*viewHeight<-stadium.qc)
        this.origin.y = -stadium.qc+0.5*viewHeight;
      else if (isNaN(this.origin.y) || !isFinite(this.origin.y)) // fix all possible camera bugs
        this.origin.y = 0;
    },
    drawHalo: function(pos){ // Pq
      this.ctx.beginPath();
      this.ctx.strokeStyle = "white";
      this.ctx.globalAlpha = 0.3;
      this.ctx.arc(pos.x, pos.y, 25, 0, 2*Math.PI, false);
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
    },
    updateGamePaused: function(gameState){ // Oq
      var paused = (gameState.Oa>0);
      this.setGamePaused(paused);
      if (!paused)
        return;
      if (gameState.Oa!=120){
        var width = (gameState.Oa/120)*200;
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
      var width = stadium.Td, height = stadium.Sd;
      if (stadium.ld==1) {
        this.ctx.save();
        this.ctx.resetTransform();
        this.ctx.fillStyle = HaxballRenderer.numberToColor(stadium.jd);
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
        this.ctx.strokeStyle = "#C7E6BD";
        this.ctx.fillStyle = this.grassPattern;
        this.drawRoundedRect(this.ctx, -width, -height, 2*width, 2*height, stadium.Uc);
        this.ctx.save();
        this.ctx.scale(2, 2);
        this.ctx.fill();
        this.ctx.restore();
        this.ctx.moveTo(0, -height);
        this.ctx.lineTo(0, height);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.arc(0, 0, stadium.kd, 0, 2*Math.PI);
        this.ctx.stroke();
      }
      else if (stadium.ld==2){
        this.ctx.strokeStyle = "#E9CC6E";
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(this.origin.x-10000, this.origin.y-10000, 20000, 20000);
        this.ctx.scale(2, 2);
        this.ctx.fillStyle = this.concrete2Pattern;
        this.ctx.fill();
        this.ctx.restore();
        this.ctx.save();
        this.drawRoundedRect(this.ctx, -width, -height, 2*width, 2*height, stadium.Uc);
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
        var goalLine = stadium.Fe, delta = width-goalLine;
        if (goalLine<stadium.Uc)
          delta = 0;
        var that = this;
        var drawKickOff = function(color, x, ccw){
          that.ctx.beginPath();
          that.ctx.strokeStyle = color;
          that.ctx.arc(0, 0, stadium.kd, -1.5707963267948966, 1.5707963267948966, ccw);
          if (x!=0){
            that.ctx.moveTo(x, -height);
            that.ctx.lineTo(x, height);
          }
          that.ctx.stroke();
        };
        drawKickOff("#85ACF3", delta, false);
        drawKickOff("#E18977", -delta, true);
      }
      else {
        this.ctx.save();
        this.ctx.resetTransform();
        this.ctx.fillStyle = HaxballRenderer.numberToColor(stadium.jd);
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
      }
      HaxballRenderer.setSmoothingEnabled(this.ctx, true);
    },
    drawPlayerDecoratorsAndChatIndicators: function(roomState, followPlayer){ // Nq
      var showIndicators = localStorageObj.Ak.L(), players = roomState.I; // "show_indicators"
      for (var i=0;i<players.length;i++){
        var player = players[i];
        var disc = player.H;
        if (!disc)
          continue;
        var pos = disc.a, decorator = this.decoratorsById.get(player.V);
        if (showIndicators && decorator.chatIndicatorActive && /*n.Dm*/images?.typing)
          this.ctx.drawImage(images.typing, pos.x-0.5*images.typing.width, pos.y-35);
        if (player != followPlayer)
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
        this.ctx.fillStyle = HaxballRenderer.numberToColor(disc.R);
        this.ctx.strokeStyle = "black";
      }
      this.ctx.beginPath();
      this.ctx.arc(disc.a.x, disc.a.y, disc.Z, 0, 2*Math.PI, false);
      if (playerDecorator){
        this.ctx.save();
        var c = disc.Z/32;
        this.ctx.translate(disc.a.x, disc.a.y);
        this.ctx.scale(c, c);
        this.ctx.translate(-32, -32);
        this.ctx.fill();
        this.ctx.restore();
      }
      else if ((disc.R|0)!=-1)
        this.ctx.fill();
      this.ctx.stroke();
    },
    drawAllSegments: function(stadium){ // Rq
      if (!stadium)
        return;
      var segments = stadium.U;
      for (var i=0;i<segments.length;i++)
        this.drawSegment(segments[i]);
    },
    drawJoint: function(joint, discs){ // Mq
      if (joint.R<0)
        return;
      this.ctx.beginPath();
      this.ctx.strokeStyle = HaxballRenderer.numberToColor(joint.R);
      var disc1 = discs[joint.Yd], disc2 = discs[joint.Zd];
      if (!disc1 || !disc2)
        return;
      var pos1 = disc1.a;
      var pos2 = disc2.a;
      this.ctx.moveTo(pos1.x, pos1.y);
      this.ctx.lineTo(pos2.x, pos2.y);
      this.ctx.stroke();
    },
    drawSegment: function(segment){ // Qq
      if (!segment.Za)
        return;
      this.ctx.beginPath();
      this.ctx.strokeStyle = HaxballRenderer.numberToColor(segment.R);
      var pos1 = segment.W.a, pos2 = segment.ca.a;
      if (0*segment.vb!=0){ // line
        this.ctx.moveTo(pos1.x, pos1.y);
        this.ctx.lineTo(pos2.x, pos2.y);
      }
      else{ // arc
        var center = segment.Xd, deltaX = pos1.x-center.x, deltaY = pos1.y-center.y;
        this.ctx.arc(center.x, center.y, Math.sqrt(deltaX*deltaX+deltaY*deltaY), Math.atan2(deltaY, deltaX), Math.atan2(pos2.y-center.y, pos2.x-center.x));
      }
      this.ctx.stroke();
    },
    indicateAllLocations: function(roomState, viewWidth, viewHeight){ // Lq
      var gameState = roomState.K;
      if (!gameState)
        return;
      var ballDisc = gameState.ta.F[0];
      this.indicateLocation(ballDisc.a, ballDisc.R, viewWidth, viewHeight);
      var players = roomState.I;
      for (var i=0;i<players.length;i++){
        var player = players[i], playerDisc = player.H;
        if (!playerDisc)
          continue;
        this.indicateLocation(playerDisc.a, player.ea.R, viewWidth, viewHeight);
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
      this.ctx.fillStyle = HaxballRenderer.numberToColor(color);
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

  this.rendererObj = null; // Eb
  this.roomObj = null;

  var that = this;

  this.initialize = function(room){
    that.roomObj = room.getRoomDataOriginal().q;
    that.rendererObj = new HaxballRenderer();
    that.rendererObj.updateParams();
  };

  this.finalize = function(){
    that.rendererObj = null;
    that.roomObj = null;
  };

  this.render = function(extrapolatedRoomPhysicsObj){ // render logic here. called inside requestAnimationFrame callback
    if (renderApi?.paintGame){
      that.rendererObj.updateParams();
      null != extrapolatedRoomPhysicsObj.K && that.rendererObj.render(extrapolatedRoomPhysicsObj, that.roomObj.ya.uc);
    }
    renderApi?.onRequestAnimationFrame(that.roomObj.ya, extrapolatedRoomPhysicsObj.K);
  };

  // you can keep track of changes using these callbacks, and apply them in your render logic:

  this.onPlayerChatIndicatorChange = function(id, value, customData){ // wl (a, b)
    that.rendererObj.updateChatIndicator(id, value);
  };

  this.onTeamGoal = function(teamId, customData){ // Ni (a)
    var tr = that.rendererObj.textRenderer; // "Red Scores!", "Blue Scores!"
    tr.addText((teamId==Team.fa.$) ? tr.redScore : tr.blueScore);
  };

  this.onGameStart = function(byId, customData){ // Ki (a)
    that.rendererObj.textRenderer.reset();
  };

  this.onGameEnd = function(winningTeamId, customData){ // Oi (a)
    var tr = that.rendererObj.textRenderer; // "Red is Victorious!", "Blue is Victorious!"
    tr.addText((winningTeamId==Team.fa.$) ? tr.redVictory : tr.blueVictory);
  };

  this.onTimeIsUp = function(customData){ // Pi ()
    var tr = that.rendererObj.textRenderer; // "Time is Up!"
    tr.addText(tr.timeUp);
  };

};
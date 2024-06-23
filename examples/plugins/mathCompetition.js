module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "mathCompetition", true, {
    version: "0.1",
    author: "abc",
    description: `This plugin lets you own a math competition.
    Available commands: 
    - --solve [solution]: Checks if the given solution is correct for the current question.
    - --scores: Lists the current scores.
    - --question: Re-sends the current question.`,
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom
  });
  
  this.defineVariable({
    name: "askQuestions",
    description: "Whether to continue asking questions.", 
    type: VariableType.Boolean,
    value: true
  });
  
  this.defineVariable({
    name: "questionTimeout",
    description: "The time interval that the questions are supposed to be solved in seconds.", 
    type: VariableType.Integer,
    value: 120, 
    range: {
      min: 5,
      max: Infinity,
      step: 1
    }
  });

  this.defineVariable({
    name: "maxDiff",
    description: "Maximum accepted difference value.", 
    type: VariableType.Integer,
    value: 3, 
    range: {
      min: 0,
      max: 100,
      step: 1
    }
  });

  var scores = null, question = null, timeout = null, currentBestSolution = null, that = this, Expression = null, worker = null;

  function nextQuestion() {
    if (!Expression)
      return;
    currentBestSolution = null;
    if (timeout!=null){
      clearTimeout(timeout);
      timeout = null;
    }
    var nums = [];
    for (var i = 0; i < 5; i++)
      nums.push(1 + Math.floor(Math.random() * 9));
    nums.push(10 + Math.floor(Math.random() * 90));
    var copyArray, target;
    do {
      copyArray = JSON.parse(JSON.stringify(nums));
      do {
        var i1 = Math.floor(Math.random() * copyArray.length), i2;
        do {
          i2 = Math.floor(Math.random() * copyArray.length);
        } while (i1 == i2);
        if (i2 < i1) {
          var tmp = i1;
          i1 = i2;
          i2 = tmp;
        }
        var a = copyArray[i1], b = copyArray[i2], result;
        switch (Math.floor(Math.random() * 4)) {
          case 0:
            result = a + b;
            break;
          case 1:
            result = a - b;
            break;
          case 2:
            result = a * b;
            break;
          case 3:
            result = a / b;
            break;
        }
        copyArray.splice(i2, 1);
        copyArray.splice(i1, 1);
        copyArray.splice(0, 0, result);
      } while (copyArray.length > 1);
      target = copyArray[0] + Math.floor(Math.random() * (2 * that.maxDiff + 1)) - that.maxDiff;
    } while (!that.room.librariesMap.mathExpr.isInteger(copyArray[0]) || target < 100 || target > 999);
    question = {
      nums,
      target
    };
    worker.postMessage(question);
  }
  
  function sendQuestion(){
    if (!question)
      return;
    that.room.sendChat("Next Question: Find "+question.target+" using these numbers: "+question.nums.join(","));
    that.room.sendChat("Use only +,-,*,/ and (). Send solutions using command: --solve <solution>.");
  }
  
  function onSolutionReady(){
    if (!question || !that.askQuestions)
      return;
    question.timestamp = Date.now();
    timeout = setTimeout(nobodySolved, that.questionTimeout*1000);
    sendQuestion();
  }
  
  function nobodySolved(){
    if (!that.askQuestions)
      return;
    if (currentBestSolution!=null)
      scores[currentBestSolution.id]=(scores[currentBestSolution.id]|0)+that.maxDiff-currentBestSolution.diff+1;
    that.room.sendChat("A perfect solution was not found.");
    that.room.sendChat("Best solution was: "+question.solution?.toString());
    nextQuestion();
  }

  function solvedBy(id, solution){
    if (!that.askQuestions)
      return;
    var timeMs = Date.now()-question.timestamp;
    that.room.sendChat("The perfect solution found in "+timeMs+" msecs by " + that.room.players.find((p)=>p.id==id).name + "["+id+"] is: "+solution);
    that.room.sendChat("Best solution was: "+question.solution?.toString());
    scores[id]=(scores[id]|0)+that.maxDiff+2;
    nextQuestion();
  }

  function almostSolvedBy(id, solution, diff){
    if (!that.askQuestions || currentBestSolution!=null && currentBestSolution.diff>=diff)
      return;
    var timeMs = Date.now()-question.timestamp;
    that.room.sendChat("A better solution (with an error margin of " + diff + " units) found in "+timeMs+" msecs by " + that.room.players.find((p)=>p.id==id).name + "["+id+"].");
    currentBestSolution = {
      id,
      diff, 
      solution
    };
  }
  
  function trySolution(id, solution){
    var copy = JSON.parse(JSON.stringify(question.nums));
    function traverse(expr){
      if (typeof expr=="number"){
        var idx = copy.indexOf(expr);
        if (idx<0)
          return false;
        else{
          copy.splice(idx, 1);
          return true;
        }
      }
      var ret = true;
      expr.operands.forEach((o)=>{ ret &&= traverse(o); });
      return ret;
    }
    try{
      var parsed = Expression.parse(solution);
      if (!traverse(parsed))
        throw "";
      var value = parsed.evaluate(), diff = Math.abs(question.target-value);
      if (diff>that.maxDiff)
        throw "";
      if (diff==0)
        solvedBy(id, solution);
      else
        almostSolvedBy(id, solution, diff);
    }catch(ex){}
  }
  
  function listScores(){
    that.room.sendChat("Scores:");
    that.room.players.forEach((p)=>{
      that.room.sendChat(p.name+"["+p.id+"]: "+(scores[p.id]|0));
    });
  }
  
  this.initialize = function(){
    Expression = that.room.librariesMap.mathExpr?.Expression;
    scores = Expression && {};
    timeout = null;
    question = null;
    worker = new Worker(URL.createObjectURL(new Blob([`
      var window = {}, module = {}, thisWorker = this; // or maybe better: var window = this;
      function init(origin){
        importScripts(origin+"/vendor/api.js"); // We have to re-initialize everything in the Worker context.
        var API = new abcHaxballAPI(window, { noWebRTC: true }); // Remember that window is empty. Some functions will most likely fail to work correctly.
        importScripts(origin+"/libraries/mathExpr.js"); // Unfortunately, this will only work for default libraries in the development website. Maybe I will add some kind of routing support later for custom codes.
        var {Expression, isInteger} = new module.exports(API);
        function solveProblem({ nums, target }) {
          var bestDiff = Infinity, leastNums = nums.length + 1, bestSolution = null;
          function solveRec(arr) { // a simple recursive backtracking algorithm to solve the math problem.
            for (var i = 0; i < arr.length; i++)
              for (var j = i + 1; j < arr.length; j++) {
                var a = arr.filter((x, k) => (k != i && k != j)), n = nums.length - arr.length;
                function check(value, op, reverse){
                  var expr = new Expression();
                  expr.operands.push(arr[reverse?j:i]);
                  expr.operations.push(op);
                  expr.operands.push(arr[reverse?i:j]);
                  expr.value = value;
                  a.push(expr);
                  var d = Math.abs(value - target);
                  if (d < bestDiff || (d == bestDiff && n < leastNums)) {
                    bestDiff = d;
                    leastNums = n;
                    bestSolution = expr.clone();
                  }
                  solveRec(a);
                  a.pop();
                }
                var v1 = (arr[i].value || arr[i]) | 0, v2 = (arr[j].value || arr[j]) | 0;
                check(v1 + v2, "+");
                check(v1 * v2, "*");
                check(v1 - v2, "-");
                check(v2 - v1, "-", true);
                check(v1 / v2, "/");
                check(v2 / v1, "/", true);
              }
          }
          solveRec(nums.filter(() => true));
          if (bestSolution)
            bestSolution.simplify();
          return bestSolution;
        }
        
        thisWorker.onmessage = function(msg){
          postMessage(solveProblem(msg.data).toString());
        }
      }
      thisWorker.onmessage = function(msg){
        init(msg.data);
      }
    `], { type: "text/javascript" })));
    worker.postMessage(window.location.origin);
    worker.onmessage = (msg)=>{
      question.solution = msg.data;
      onSolutionReady();
    };
    setTimeout(nextQuestion, 5000);
  };

  this.finalize = function(){
    if (timeout!=null){
      clearTimeout(timeout);
      timeout = null;
    }
    worker?.terminate();
    worker = null;
    scores = null;
    question = null;
    currentBestSolution = null;
  };

  this.onPlayerChat = function(id, message, customData){
    if (!scores || !that.askQuestions)
      return;
    var message = message.trim();
    if (!message.startsWith("--"))
      return;
    if (message=="--scores"){
      if (id==that.room.currentPlayerId)
        listScores();
    }
    
    else if (message.startsWith("--solve"))
      trySolution(id, message.substring(message.indexOf(" ")).trim());
    else if (message.startsWith("--question")){
      if (id==that.room.currentPlayerId)
        sendQuestion(id);
    }
  };

  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    if (!scores)
      return;
    delete scores[playerObj.id];
  };

  this.onVariableValueChange = function(addonObject, variableName, oldValue, newValue){
    if (addonObject == that && variableName=="askQuestions"){
      if (newValue)
        that.initialize();
      else
        that.finalize();
    }
  };
};

module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Library.prototype);
  Library.call(this, "mathExpr", { // "mathExpr" is library's name. Every library should have a unique name.
    version: 0.1,
    author: "abc",
    description: `This is a small library to parse mathematical expressions that only contains constant integers and paranthesis. Example: (5-(1+2)/10)*(5-8*3)`
  });
  
  function Expression(parent){
    this.parent = parent;
    this.operands = [];
    this.operations = [];
  }
  
  Expression.parse = function(str){
    var num = "", root = new Expression(), current = root;
    for (var i=0;i<str.length;i++){
      var ch = str[i];
      switch(ch){
        case "(":
          num = "";
          var newExpr = new Expression(current);
          current.operands.push(newExpr);
          current = newExpr;
          break;
        case ")":
          if (num.length>0){
            var n = parseInt(num);
            if (isNaN(n))
              throw "illegal character at index "+i;
            current.operands.push(n);
            num="";
          }
          current = current.parent;
          if (!current)
            throw "depth<0 at index "+i;
          break;
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          num+=ch;
          break;
        case "+":
        case "-":
        case "*":
        case "/":
          if (str[i-1]!=")"){
            var n = parseInt(num);
            if (isNaN(n))
              throw "illegal character at index "+i;
            current.operands.push(n);
          }
          current.operations.push(ch);
          num="";
          break;
        case " ":
        case "\t":
          break;
        default:
          throw "illegal character at index "+i;
      }
    }
    if (current!=root)
      throw "missing paranthesis at the end";
    if (num.length>0){
      var n = parseInt(num);
      if (isNaN(n))
        throw "illegal character at index "+i;
      current.operands.push(n);
    }
    return root;
  };
  
  Expression.prototype = {
    simplify: function(){
      var v = this.operands[0];
      if (v==null)
        return;
      if (typeof v=="object"){
        v.simplify();
        if (v.operands.length==1)
          this.operands[0] = v.operands[0];
        else{
          var op = this.operations[0];
          if (op=="+" || op=="-"){
            this.operands.splice(0, 1, ...v.operands);
            this.operations.splice(0, 0, ...v.operations);
          }
        }
      }
      if (this.operands.length==1){
        if (typeof v=="object"){
          this.operands = v.operands;
          this.operations = v.operations;
        }
        return this;
      }
      for (var i=0;i<this.operations.length;i++){
        v = this.operands[i+1];
        if (typeof v=="object"){
          v.simplify();
          if (v.operands.length==1)
            this.operands[i+1] = v.operands[0];
          else if (v.operations.filter((x)=>(x=="+" || x=="-")).length==0){
            this.operands.splice(i+1, 1, ...v.operands);
            this.operations.splice(i+1, 0, ...v.operations);
          }
          else{
            var op1 = this.operations[i], op2 = this.operations[i+1];
            if (op2!="*" && op2!="/"){
              if (op1=="+"){
                this.operands.splice(i+1, 1, ...v.operands);
                this.operations.splice(i+1, 0, ...v.operations);
              }
              else if (op1=="-"){
                this.operands.splice(i+1, 1, ...v.operands);
                this.operations.splice(i+1, 0, ...v.operations.map((x)=>(((x=="+")?"-":((x=="-")?"+":x)))));
              }
            }
          }
        }
      }
      return this;
    },
    clone: function(){
      var exp = new Expression(this.parent);
      for (var i=0;i<this.operations.length;i++)
        exp.operations.push(this.operations[i]);
      for (var i=0;i<this.operands.length;i++){
        var value = this.operands[i];
        if (typeof value!="number")
          value = value.clone();
        exp.operands.push(value);
      }
      return exp;
    },
    toString: function(){
      var value = this.operands[0], str = typeof value=="number" ? value : ("(" + value.toString() + ")");
      for (var i=0;i<this.operations.length;i++){
        value = this.operands[i+1];
        str += this.operations[i] + (typeof value=="number" ? value : ("(" + value.toString() + ")"));
      }
      return str;
    },
    evaluate: function(){
      for (var i=0;i<this.operations.length;i++){
        var op = this.operations[i];
        if (op=="*" || op=="/"){
          var value1 = this.operands[i];
          if (typeof value1!="number")
            value1 = value1.evaluate();
          var value2 = this.operands[i+1];
          if (typeof value2!="number")
            value2 = value2.evaluate();
          var result = (op=="*") ? (value1*value2) : (value1/value2);
          this.operands.splice(i, 2, result);
          this.operations.splice(i, 1);
          i--;
        }
      }
      for (var i=0;i<this.operations.length;i++){
        var op = this.operations[i];
        if (op=="+" || op=="-"){
          var value1 = this.operands[i];
          if (typeof value1!="number")
            value1 = value1.evaluate();
          var value2 = this.operands[i+1];
          if (typeof value2!="number")
            value2 = value2.evaluate();
          var result = (op=="+") ? (value1+value2) : (value1-value2);
          this.operands.splice(i, 2, result);
          this.operations.splice(i, 1);
          i--;
        }
      }
      var val = this.operands[0];
      return (typeof val=="number") ? val : val.evaluate();
    }
  };
  
  this.Expression = Expression;
  
  this.isInteger = function(value){
    return isFinite(value) && (value === Math.round(value));
  };
};
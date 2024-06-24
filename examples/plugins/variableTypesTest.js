module.exports = function ({ Plugin, AllowFlags, VariableType }) {
  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "variableTypesTest", true, {
    version: "0.1",
    author: "abc",
    description: "This is a test to test the variable components.",
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom
  });
  var that = this;
  this.defineVariable({
    name: "test1",
    type: VariableType.Void,
    value: function value() {
      if (that.test18==null)
        that.test18 = 0;
      else{
        var v = that.test18 + 1;
        if (v>100)
          v=null;
        that.test18 = v;
      }
    },
    description: "button test."
  });
  this.defineVariable({
    name: "test18",
    type: VariableType.Progress,
    value: null,
    description: "progress test"
  });
  this.defineVariable({
    name: "test2",
    type: VariableType.File,
    value: "test2",
    range: {
      min: 1,
      max: Infinity
    },
    description: "file test"
  });
  this.defineVariable({
    name: "test3",
    type: VariableType.Boolean,
    value: false,
    description: "boolean test"
  });
  this.defineVariable({
    name: "test4",
    type: VariableType.Integer,
    value: 4,
    range: {
      min: 1,
      max: Infinity,
      step: 1,
    },
    description: "integer test"
  });
  this.defineVariable({
    name: "test5",
    type: VariableType.Number,
    value: 5,
    range: {
      min: 1,
      max: Infinity,
      step: 0.1,
    },
    description: "number test"
  });
  this.defineVariable({
    name: "test6",
    type: VariableType.String,
    value: 6,
    range: {
      min: 1,
      max: Infinity,
    },
    description: "string test"
  });
  this.defineVariable({
    name: "test7",
    type: VariableType.Color,
    value: "",
    description: "color test"
  });
  this.defineVariable({
    name: "test8",
    type: VariableType.CollisionFlags,
    value: 0,
    description: "collisionflags test"
  });
  this.defineVariable({
    name: "test9",
    type: VariableType.Coordinate,
    value: "5.12, 10.5",
    description: "coordinate test"
  });
  this.defineVariable({
    name: "test10",
    type: VariableType.Team,
    value: 1,
    description: "team test"
  });
  this.defineVariable({
    name: "test11",
    type: VariableType.TeamWithSpec,
    value: 0,
    description: "teamwithspec test"
  });
  this.defineVariable({
    name: "test12",
    type: VariableType.BgType,
    value: 0,
    description: "bgtype test"
  });
  this.defineVariable({
    name: "test13",
    type: VariableType.CameraFollow,
    value: 0,
    description: "camerafollow test"
  });
  this.defineVariable({
    name: "test14",
    type: VariableType.KickOffReset,
    value: 0,
    description: "kickoffreset test"
  });
  this.defineVariable({
    name: "test15",
    type: VariableType.Flag,
    value: "tr",
    description: "flag test"
  });
  this.defineVariable({
    name: "test16",
    type: VariableType.PlayerId,
    value: 0,
    description: "playerid test"
  });
  this.defineVariable({
    name: "test17",
    type: VariableType.Keys,
    value: null,
    description: "keys test"
  });
}
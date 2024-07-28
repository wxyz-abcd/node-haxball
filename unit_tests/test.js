/*
  - some currently missing important tests:
    - currently, some of the tests only check the contents of network packets, and some values have to be checked more thoroughly through the room.state object etc.
    - in-game physics tests (onPlayerBallKick, onTeamGoal, collisions, etc.)
    - some current tests need to be applied also while the game is active (like changing teams.)
    - change room properties
    - noPlayer=true mode (for all room-related functions)
    - fake event functions
    - replay mode functions
    - sandbox mode functions
    - plugins, renderers, etc. (they probably need seperate tests. I will probably not automate their tests, because it will cause tests to become too many.)
*/

module.exports = ({ Room, Utils, Impl }, roomToken, {log, colors: {yellow, green, red, magenta, blue}, exit})=>{
  const roomPassword = "test123";
  const ratings = [
    {t: 0.50, c: red, n: "TERRIBLE"}, 
    {t: 0.75, c: red, n: "BAD"}, 
    {t: 0.90, c: yellow, n: "OK"}, 
    {t: 0.99, c: green, n: "GOOD"}, 
    {t: 1.01, c: green, n: "PERFECT"}
  ];

  var stadium1 = Utils.parseStadium(`{
    "name" : "abctest6",
    "width" : 440,
    "height" : 220,
    "spawnDistance" : 200,
    "bg" : { "type" : "grass", "height" : 200, "width" : 420, "cornerRadius" : 20, "kickOffRadius" : 50 },
    "vertexes" : [
      /* 0 */ { "x" : -304, "y" : -38, "bCoef" : 0.4 },
      /* 1 */ { "x" : -73, "y" : -37, "bCoef" : 0.4, "cMask" : ["red","blue" ], "color" : "444400" },
      /* 2 */ { "x" : 304, "y" : -38, "bCoef" : 0.4 },
      /* 3 */ { "x" : 73, "y" : -37, "bCoef" : 0.4, "cMask" : ["red","blue" ], "color" : "444400" },
      /* 4 */ { "x" : -304, "y" : 38, "bCoef" : 0.4 },
      /* 5 */ { "x" : -73, "y" : 37, "bCoef" : 0.4, "cMask" : ["red","blue" ], "color" : "444400" },
      /* 6 */ { "x" : 304, "y" : 38, "bCoef" : 0.4 },
      /* 7 */ { "x" : 73, "y" : 37, "bCoef" : 0.4, "cMask" : ["red","blue" ], "color" : "444400" },
      /* 8 */ { "x" : -32, "y" : -89, "bCoef" : 0.4, "cMask" : ["red","blue" ], "color" : "444400" },
      /* 9 */ { "x" : 32, "y" : -89, "bCoef" : 0.4, "cMask" : ["red","blue" ], "color" : "444400" },
      /* 10 */ { "x" : -32, "y" : 89, "bCoef" : 0.4, "cMask" : ["red","blue" ], "color" : "444400" },
      /* 11 */ { "x" : 32, "y" : 89, "bCoef" : 0.4, "cMask" : ["red","blue" ], "color" : "444400" },
      /* 12 */ { "x" : -197, "y" : -111, "bCoef" : 0.4 },
      /* 13 */ { "x" : 197, "y" : -111, "bCoef" : 0.4 },
      /* 14 */ { "x" : -197, "y" : 111, "bCoef" : 0.4 },
      /* 15 */ { "x" : 197, "y" : 111, "bCoef" : 0.4 },
      /* 16 */ { "x" : -307, "y" : -146, "bCoef" : 0.4 },
      /* 17 */ { "x" : 307, "y" : -146, "bCoef" : 0.4 },
      /* 18 */ { "x" : -307, "y" : 146, "bCoef" : 0.4 },
      /* 19 */ { "x" : 307, "y" : 146, "bCoef" : 0.4 },
      /* 20 */ { "x" : -367, "y" : -56, "bCoef" : 0.4 },
      /* 21 */ { "x" : 367, "y" : -56, "bCoef" : 0.4 },
      /* 22 */ { "x" : -367, "y" : 56, "bCoef" : 0.4, "pos" : [-369,58 ] },
      /* 23 */ { "x" : 367, "y" : 56, "bCoef" : 0.4 },
      /* 24 */ { "x" : 0, "y" : -139, "bCoef" : 0.4 },
      /* 25 */ { "x" : 0, "y" : 139, "bCoef" : 0.4 }
    ],
    "segments" : [
      { "v0" : 0, "v1" : 1, "curve" : 30, "bCoef" : 0.4 },
      { "v0" : 2, "v1" : 3, "curve" : -30, "bCoef" : 0.4 },
      { "v0" : 4, "v1" : 5, "curve" : -30, "bCoef" : 0.4 },
      { "v0" : 6, "v1" : 7, "curve" : 30, "bCoef" : 0.4 },
      { "v0" : 1, "v1" : 8, "curve" : 30, "color" : "444400", "bCoef" : 0.4, "cMask" : ["red","blue" ] },
      { "v0" : 3, "v1" : 9, "curve" : -30, "color" : "444400", "bCoef" : 0.4, "cMask" : ["red","blue" ] },
      { "v0" : 5, "v1" : 10, "curve" : -30, "color" : "444400", "bCoef" : 0.4, "cMask" : ["red","blue" ] },
      { "v0" : 7, "v1" : 11, "curve" : 30, "color" : "444400", "bCoef" : 0.4, "cMask" : ["red","blue" ] },
      { "v0" : 8, "v1" : 12, "curve" : 30, "bCoef" : 0.4 },
      { "v0" : 9, "v1" : 13, "curve" : -30, "bCoef" : 0.4 },
      { "v0" : 10, "v1" : 14, "curve" : -30, "bCoef" : 0.4 },
      { "v0" : 11, "v1" : 15, "curve" : 30, "bCoef" : 0.4 },
      { "v0" : 16, "v1" : 24, "curve" : 30, "bCoef" : 0.4 },
      { "v0" : 17, "v1" : 24, "curve" : -30, "bCoef" : 0.4 },
      { "v0" : 18, "v1" : 25, "curve" : -30, "bCoef" : 0.4 },
      { "v0" : 19, "v1" : 25, "curve" : 30, "bCoef" : 0.4 },
      { "v0" : 16, "v1" : 20, "curve" : 30, "bCoef" : 0.4 },
      { "v0" : 17, "v1" : 21, "curve" : -30, "bCoef" : 0.4 },
      { "v0" : 18, "v1" : 22, "curve" : -30, "bCoef" : 0.4 },
      { "v0" : 19, "v1" : 23, "curve" : 30, "bCoef" : 0.4 }
    ],
    "goals" : [
      { "p0" : [-361,-50 ], "p1" : [-361,50 ], "team" : "red", "bCoef" : 0.4 },
      { "p0" : [361,-50 ], "p1" : [361,50 ], "team" : "blue", "bCoef" : 0.4, "x" : 367 }
    ],
    "discs" : [
      { "radius" : 7.810249675906654, "pos" : [-361,-50 ], "color" : "ff0000", "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 7.810249675906654, "pos" : [361,-50 ], "color" : "0000ff", "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 7.810249675906654, "pos" : [-361,50 ], "color" : "ff0000", "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 7.810249675906654, "pos" : [361,50 ], "color" : "0000ff", "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 7.615773105863909, "invMass" : 0, "pos" : [-74,-38 ], "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 7.615773105863909, "invMass" : 0, "pos" : [74,-38 ], "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 7.615773105863909, "invMass" : 0, "pos" : [-74,38 ], "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 7.615773105863909, "invMass" : 0, "pos" : [74,38 ], "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 6.324555320336759, "invMass" : 0, "pos" : [-199,111 ], "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 6.324555320336759, "invMass" : 0, "pos" : [199,111 ], "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 6.324555320336759, "invMass" : 0, "pos" : [-199,-111 ], "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 6.324555320336759, "invMass" : 0, "pos" : [199,-111 ], "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 6, "invMass" : 0, "pos" : [-32,87 ], "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 6, "invMass" : 0, "pos" : [32,87 ], "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 6, "invMass" : 0, "pos" : [-32,-87 ], "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 6, "invMass" : 0, "pos" : [32,-87 ], "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 6.324555320336759, "invMass" : 0, "pos" : [-305,-39 ], "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 6.324555320336759, "invMass" : 0, "pos" : [305,-39 ], "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 6.324555320336759, "invMass" : 0, "pos" : [-305,39 ], "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" },
      { "radius" : 6.324555320336759, "invMass" : 0, "pos" : [305,39 ], "bCoef" : 0.6, "cMask" : ["ball" ], "trait" : "goalPost" }
    ],
    "planes" : [
      { "normal" : [1,0 ], "dist" : -420, "bCoef" : 0.7, "cMask" : ["ball" ] },
      { "normal" : [-1,0 ], "dist" : -420, "bCoef" : 0.7, "cMask" : ["ball" ] },
      { "normal" : [0,1 ], "dist" : -200, "bCoef" : 0.7, "cMask" : ["ball" ] },
      { "normal" : [0,-1 ], "dist" : -200, "bCoef" : 0.7, "cMask" : ["ball" ] },
      { "normal" : [1,0 ], "dist" : -440, "bCoef" : 0.7 },
      { "normal" : [-1,0 ], "dist" : -440, "bCoef" : 0.7 },
      { "normal" : [0,1 ], "dist" : -220, "bCoef" : 0.7 },
      { "normal" : [0,-1 ], "dist" : -220, "bCoef" : 0.7 }
    ],
    "traits" : {
      "ballArea" : { "vis" : false, "bCoef" : 1, "cMask" : ["ball" ] },
      "goalPost" : { "radius" : 8, "invMass" : 0, "bCoef" : 0.5 },
      "goalNet" : { "vis" : true, "bCoef" : 0.1, "cMask" : ["ball" ] },
      "kickOffBarrier" : { "vis" : false, "bCoef" : 0.1, "cGroup" : ["redKO","blueKO" ], "cMask" : ["red","blue" ] }
    },
    "playerPhysics" : {
      "bCoef" : 0.3,
      "acceleration" : 0.2,
      "kickStrength" : 10
    }
  }`, ()=>{throw "Stadium1 parse error."});

  var stadium2 = Utils.parseStadium(`{
    "name" : "abctest10",
    "width" : 1155,
    "height" : 550,
    "spawnDistance" : 742.5,
    "bg" : { "type" : "grass", "height" : 550, "width" : 1155, "cornerRadius" : 0, "kickOffRadius" : 165 },
    "vertexes" : [
      /* 0 */ { "x" : -1050, "y" : -105, "cMask" : ["ball","blue" ], "color" : "cc2244" },
      /* 1 */ { "x" : 1050, "y" : -105, "cMask" : ["ball","red" ], "color" : "4422cc" },
      /* 2 */ { "x" : -1050, "y" : 105, "cMask" : ["ball","blue" ], "color" : "cc2244" },
      /* 3 */ { "x" : 1050, "y" : 105, "cMask" : ["ball","red" ], "color" : "4422cc" },
      /* 4 */ { "x" : -1050, "y" : 300, "cMask" : ["ball" ], "color" : "cc2244" },
      /* 5 */ { "x" : 1050, "y" : 300, "cMask" : ["ball" ], "color" : "4422cc" },
      /* 6 */ { "x" : -1050, "y" : -300, "cMask" : ["ball" ], "color" : "cc2244" },
      /* 7 */ { "x" : 1050, "y" : -300, "cMask" : ["ball" ], "color" : "4422cc" },
      /* 8 */ { "x" : -690, "y" : -270, "cMask" : ["wall" ], "curve" : 0, "color" : "cccccc" },
      /* 9 */ { "x" : -690, "y" : 270, "cMask" : ["wall" ], "curve" : 70, "color" : "cccccc" },
      /* 10 */ { "x" : 690, "y" : -270, "cMask" : ["wall" ], "curve" : -70, "color" : "cccccc", "_selected" : "segment" },
      /* 11 */ { "x" : 690, "y" : 270, "cMask" : ["wall" ], "curve" : -70, "color" : "cccccc" },
      /* 12 */ { "x" : -1050, "y" : -470, "cMask" : ["ball" ] },
      /* 13 */ { "x" : -1050, "y" : 470, "cMask" : ["ball" ] },
      /* 14 */ { "x" : 1050, "y" : -470, "cMask" : ["ball" ] },
      /* 15 */ { "x" : 1050, "y" : 470, "cMask" : ["ball" ] },
      /* 16 */ { "x" : -690, "y" : -190, "cMask" : ["wall" ], "color" : "cc2244" },
      /* 17 */ { "x" : 690, "y" : -190, "cMask" : ["wall" ], "color" : "4422cc", "_selected" : "segment" },
      /* 18 */ { "x" : -690, "y" : 190, "cMask" : ["wall" ], "color" : "cc2244" },
      /* 19 */ { "x" : 690, "y" : 190, "cMask" : ["wall" ], "color" : "4422cc" },
      /* 20 */ { "x" : -1050, "y" : -170, "cMask" : ["wall" ] },
      /* 21 */ { "x" : -870, "y" : -170, "cMask" : ["wall" ] },
      /* 22 */ { "x" : 1050, "y" : -170, "cMask" : ["wall" ], "color" : "4422cc" },
      /* 23 */ { "x" : 870, "y" : -170, "cMask" : ["wall" ], "color" : "4422cc" },
      /* 24 */ { "x" : -1050, "y" : 170, "cMask" : ["wall" ] },
      /* 25 */ { "x" : -870, "y" : 170, "cMask" : ["wall" ] },
      /* 26 */ { "x" : 1050, "y" : 170, "cMask" : ["wall" ], "color" : "4422cc" },
      /* 27 */ { "x" : 870, "y" : 170, "cMask" : ["wall" ], "color" : "4422cc" },
      /* 28 */ { "x" : -1010, "y" : -82, "cMask" : ["ball" ] },
      /* 29 */ { "x" : -1050, "y" : -65, "cMask" : ["ball" ] },
      /* 30 */ { "x" : -1050, "y" : 65, "cMask" : ["ball" ] },
      /* 31 */ { "x" : -1010, "y" : 82, "cMask" : ["ball" ] },
      /* 32 */ { "x" : 1010, "y" : -82, "cMask" : ["ball" ] },
      /* 33 */ { "x" : 1050, "y" : -65, "cMask" : ["ball" ] },
      /* 34 */ { "x" : 1050, "y" : 65, "cMask" : ["ball" ] },
      /* 35 */ { "x" : 1010, "y" : 82, "cMask" : ["ball" ] },
      /* 36 */ { "x" : -720, "y" : -300, "cMask" : ["wall" ], "color" : "cccccc" },
      /* 37 */ { "x" : -720, "y" : 300, "cMask" : ["wall" ], "color" : "cccccc" },
      /* 38 */ { "x" : 720, "y" : -300, "cMask" : ["wall" ], "color" : "cccccc" },
      /* 39 */ { "x" : 720, "y" : 300, "cMask" : ["wall" ], "color" : "cccccc" }
    ],
    "segments" : [
      { "v0" : 2, "v1" : 4, "color" : "cc2244", "cMask" : ["ball","blue" ], "x" : -1050 },
      { "v0" : 3, "v1" : 5, "color" : "4422cc", "cMask" : ["ball","red" ], "x" : 1050 },
      { "v0" : 0, "v1" : 6, "color" : "cc2244", "cMask" : ["ball","blue" ], "x" : -1050 },
      { "v0" : 1, "v1" : 7, "color" : "4422cc", "cMask" : ["ball","red" ], "x" : 1050 },
      { "v0" : 16, "v1" : 18, "curve" : 70, "color" : "cc2244", "cMask" : ["blue" ], "x" : -690 },
      { "v0" : 17, "v1" : 19, "curve" : -70, "color" : "4422cc", "cMask" : ["red" ], "x" : 690 },
      { "v0" : 12, "v1" : 14, "color" : "cccccc", "cMask" : ["ball" ], "y" : -470 },
      { "v0" : 13, "v1" : 15, "color" : "cccccc", "cMask" : ["ball" ], "y" : 470 },
      { "v0" : 6, "v1" : 12, "color" : "cccccc", "cMask" : ["ball" ], "x" : -1050 },
      { "v0" : 4, "v1" : 13, "color" : "cccccc", "cMask" : ["ball" ], "x" : -1050 },
      { "v0" : 7, "v1" : 14, "color" : "cccccc", "cMask" : ["ball" ], "x" : 1050 },
      { "v0" : 5, "v1" : 15, "color" : "cccccc", "cMask" : ["ball" ], "x" : 1050 },
      { "v0" : 8, "v1" : 16, "color" : "cc2244", "cMask" : ["blue" ], "x" : -690 },
      { "v0" : 10, "v1" : 17, "color" : "4422cc", "cMask" : ["red" ], "x" : 690, "_selected" : true },
      { "v0" : 9, "v1" : 18, "color" : "cc2244", "cMask" : ["blue" ], "x" : -690 },
      { "v0" : 11, "v1" : 19, "color" : "4422cc", "cMask" : ["red" ], "x" : 690 },
      { "v0" : 17, "v1" : 19, "color" : "4422cc", "cMask" : ["wall" ], "x" : 690 },
      { "v0" : 16, "v1" : 18, "color" : "cc2244", "cMask" : ["wall" ], "x" : -690 },
      { "v0" : 20, "v1" : 21, "color" : "cc2244", "cMask" : ["wall" ], "y" : -170 },
      { "v0" : 22, "v1" : 23, "color" : "4422cc", "cMask" : ["wall" ], "y" : -170 },
      { "v0" : 24, "v1" : 25, "color" : "cc2244", "cMask" : ["wall" ], "y" : 170 },
      { "v0" : 26, "v1" : 27, "color" : "4422cc", "cMask" : ["wall" ], "y" : 170 },
      { "v0" : 21, "v1" : 25, "color" : "cc2244", "cMask" : ["wall" ], "x" : -870 },
      { "v0" : 23, "v1" : 27, "color" : "4422cc", "cMask" : ["wall" ], "x" : 870 },
      { "v0" : 28, "v1" : 29, "color" : "cccccc", "cMask" : ["ball" ] },
      { "v0" : 29, "v1" : 30, "color" : "cccccc", "cMask" : ["ball" ] },
      { "v0" : 30, "v1" : 31, "color" : "cccccc", "cMask" : ["ball" ] },
      { "v0" : 32, "v1" : 33, "color" : "cccccc", "cMask" : ["ball" ] },
      { "v0" : 33, "v1" : 34, "color" : "cccccc", "cMask" : ["ball" ], "x" : 1050 },
      { "v0" : 34, "v1" : 35, "color" : "cccccc", "cMask" : ["ball" ] },
      { "v0" : 6, "v1" : 36, "color" : "cc2244", "cMask" : ["blue" ] },
      { "v0" : 36, "v1" : 8, "color" : "cccccc", "cMask" : ["wall" ] },
      { "v0" : 4, "v1" : 37, "color" : "cc2244", "cMask" : ["blue" ] },
      { "v0" : 37, "v1" : 9, "color" : "cccccc", "cMask" : ["wall" ] },
      { "v0" : 10, "v1" : 38, "color" : "cccccc", "cMask" : ["wall" ] },
      { "v0" : 38, "v1" : 7, "color" : "4422cc", "cMask" : ["red" ] },
      { "v0" : 5, "v1" : 39, "color" : "4422cc", "cMask" : ["red" ] },
      { "v0" : 39, "v1" : 11, "color" : "cccccc", "cMask" : ["wall" ] }
    ],
    "goals" : [
      { "p0" : [-1010,-82 ], "p1" : [-1010,82 ], "team" : "red" },
      { "p0" : [1010,-82 ], "p1" : [1010,82 ], "team" : "blue" }
    ],
    "discs" : [
      { "radius" : 15, "invMass" : 0, "pos" : [-1035,-103 ], "color" : "ff0000", "bCoef" : 1.5 },
      { "radius" : 15, "invMass" : 0, "pos" : [1010,-82 ], "color" : "0000ff", "bCoef" : 1.5 },
      { "radius" : 15, "invMass" : 0, "pos" : [-1035,103 ], "color" : "ff0000", "bCoef" : 1.5 },
      { "radius" : 15, "invMass" : 0, "pos" : [1010,82 ], "color" : "0000ff", "bCoef" : 1.5 },
      { "radius" : 6, "invMass" : 0, "pos" : [-780,0 ], "color" : "ffffff", "cMask" : ["wall" ] },
      { "radius" : 6, "invMass" : 0, "pos" : [780,0 ], "color" : "ffffff", "cMask" : ["wall" ] },
      { "radius" : 15, "invMass" : 0, "pos" : [1035,103 ], "color" : "0000ff", "bCoef" : 1.5 },
      { "radius" : 15, "invMass" : 0, "pos" : [1035,-103 ], "color" : "0000ff", "bCoef" : 1.5 },
      { "radius" : 15, "invMass" : 0, "pos" : [-1010,82 ], "color" : "ff0000", "bCoef" : 1.5 },
      { "radius" : 15, "invMass" : 0, "pos" : [-1010,-82 ], "color" : "ff0000", "bCoef" : 1.5 }
    ],
    "planes" : [
      { "normal" : [1,0 ], "dist" : -1155 },
      { "normal" : [0,1 ], "dist" : -550 },
      { "normal" : [-1,0 ], "dist" : -1155 },
      { "normal" : [0,-1 ], "dist" : -550 },
      { "normal" : [1,0 ], "dist" : -1050, "cMask" : ["ball" ] },
      { "normal" : [-1,0 ], "dist" : -1050, "cMask" : ["ball" ] },
      { "normal" : [0,-1 ], "dist" : -470, "cMask" : ["ball" ] },
      { "normal" : [0,1 ], "dist" : -470, "cMask" : ["ball" ] }
    ],
    "traits" : {},
    "ballPhysics" : {
      "radius" : 10,
      "color" : "cccc66",
      "invMass" : 4
    },
    "playerPhysics" : {
      "bCoef" : 1.5,
      "kickStrength" : 1.7,
      "invMass" : 4
    }
  }`, ()=>{throw "Stadium2 parse error."});

  var cRoom, jRoom;
  /*
  var waitForCallbackOrTimeout = ({func=null, nextFunc=null, callbackName=null, callbackFunc=null, timeMS=1000})=>new Promise((resolve, reject)=>{
    if (callbackName){
      cRoom[callbackName] = (...params)=>{
        callbackFunc?.(0, ...params);
        cRoom[callbackName] = null;
      };
      jRoom[callbackName] = (...params)=>{
        callbackFunc?.(1, ...params);
        jRoom[callbackName] = null;
      };
    }
    var ret = func?.();
    setTimeout(()=>{
      if (callbackName){
        cRoom[callbackName] = null;
        jRoom[callbackName] = null;
      }
      nextFunc?.(ret) ? resolve() : reject();
    }, timeMS);
  });

  var setPlayerAdmin = (room, playerId, value, expectedFunc) => waitForCallbackOrTimeout({
    callbackName: "onPlayerAdminChange",
    callbackFunc: (n, pId, val)=>{
      ret[n][pId]=room.getPlayer(pId)?.isAdmin==val && val==value;
    },
    func: ()=>{
      var ret = [{}, {}];
      room.setPlayerAdmin(playerId, value);
      return ret;
    },
    nextFunc: expectedFunc,
    timeMS: 1000
  });
  */

  var setPlayerAdmin = (room, playerId, value, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [{}, {}];
    room.onPlayerAdminChange = (pId, val)=>{
      ret[0][pId]=room.getPlayer(pId)?.isAdmin==val && val==value;
      room.onPlayerAdminChange = null;
    };
    room.other.onPlayerAdminChange = (pId, val)=>{
      ret[1][pId]=room.other.getPlayer(pId)?.isAdmin==val && val==value;
      room.other.onPlayerAdminChange = null;
    };
    room.setPlayerAdmin(playerId, value);
    setTimeout(()=>{
      room.onPlayerAdminChange = null;
      room.other.onPlayerAdminChange = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var setPlayerTeam = (room, playerId, value, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [{}, {}];
    room.onPlayerTeamChange = (pId, val)=>{
      ret[0][pId]=room.getPlayer(pId)?.team.id==val && val==value;
      room.onPlayerTeamChange = null;
    };
    room.other.onPlayerTeamChange = (pId, val)=>{
      ret[1][pId]=room.other.getPlayer(pId)?.team.id==val && val==value;
      room.other.onPlayerTeamChange = null;
    };
    room.setPlayerTeam(playerId, value);
    setTimeout(()=>{
      room.onPlayerTeamChange = null;
      room.other.onPlayerTeamChange = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var setSync = (room, value, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [{}, {}];
    room.onPlayerSyncChange = (pId, val)=>{
      ret[0][pId]=room.getPlayer(pId)?.sync==val && val==value && room.currentPlayer.id==pId;
      room.onPlayerSyncChange = null;
    };
    room.other.onPlayerSyncChange = (pId, val)=>{
      ret[1][pId]=room.other.getPlayer(pId)?.sync==val && val==value && room.currentPlayer.id==pId;
      room.other.onPlayerSyncChange = null;
    };
    room.setSync(value);
    setTimeout(()=>{
      room.onPlayerSyncChange = null;
      room.other.onPlayerSyncChange = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var setAvatar = (room, value, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [{}, {}];
    room.onPlayerAvatarChange = (pId, val)=>{
      ret[0][pId]=room.getPlayer(pId)?.avatar==val && val==value && room.currentPlayer.id==pId;
      room.onPlayerAvatarChange = null;
    };
    room.other.onPlayerAvatarChange = (pId, val)=>{
      ret[1][pId]=room.other.getPlayer(pId)?.avatar==val && val==value && room.currentPlayer.id==pId;
      room.other.onPlayerAvatarChange = null;
    };
    room.setAvatar(value);
    setTimeout(()=>{
      room.onPlayerAvatarChange = null;
      room.other.onPlayerAvatarChange = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var setPlayerAvatar = (room, playerId, value, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [{}, {}];
    room.onPlayerAvatarChange = (pId, val)=>{ // this does not get triggered in host mode, but it does in client mode. weird bug.
      ret[0][pId]=room.getPlayer(pId)?.avatar==val && val==value;
      room.onPlayerAvatarChange = null;
    };
    room.other.onPlayerAvatarChange = (pId, val)=>{
      ret[1][pId]=room.other.getPlayer(pId)?.avatar==val && val==value;
      room.other.onPlayerAvatarChange = null;
    };
    room.setPlayerAvatar(playerId, value);
    setTimeout(()=>{
      room.onPlayerAvatarChange = null;
      room.other.onPlayerAvatarChange = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var testRecording = (room, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [{}, {}];
    room.onRoomRecordingChange = (value)=>{
      if (value==true)
        ret[0]=true;
      else
        ret[1]=true;
      room.onRoomRecordingChange = null;
    };
    room.startRecording();
    setTimeout(()=>{
      room.stopRecording();
    }, 500);
    setTimeout(()=>{
      room.onRoomRecordingChange = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var setTeamColors = (room, teamId, angle, colors, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [];
    var _angle = (255*Impl.Utils.K.parseInt(angle)/360)|0;
    var text = Impl.Utils.K.parseInt("0x" + colors[0]);
    var inner1 = Impl.Utils.K.parseInt("0x" + colors[1]);
    var inner2 = Impl.Utils.K.parseInt("0x" + colors[2]);
    var inner3 = Impl.Utils.K.parseInt("0x" + colors[3]);
    room.onTeamColorsChange = (tId, val)=>{
      ret[0]=tId==teamId && val.angle==_angle && val.text==text && val.inner[0]==inner1 && val.inner[1]==inner2 && val.inner[2]==inner3;
      room.onTeamColorsChange = null;
    };
    room.other.onTeamColorsChange = (tId, val)=>{
      ret[1]=tId==teamId && val.angle==_angle && val.text==text && val.inner[0]==inner1 && val.inner[1]==inner2 && val.inner[2]==inner3;
      room.other.onTeamColorsChange = null;
    };
    room.setTeamColors(teamId, angle, ...colors);
    setTimeout(()=>{
      room.onTeamColorsChange = null;
      room.other.onTeamColorsChange = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var setChatIndicatorActive = (room, value, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [{}, {}];
    room.onPlayerChatIndicatorChange = (pId, val)=>{
      ret[0]=val==value && room.currentPlayer.id==pId;
      room.onPlayerChatIndicatorChange = null;
    };
    room.other.onPlayerChatIndicatorChange = (pId, val)=>{
      ret[1]=val==value && room.currentPlayer.id==pId;
      room.other.onPlayerChatIndicatorChange = null;
    };
    room.setChatIndicatorActive(value);
    setTimeout(()=>{
      room.onPlayerChatIndicatorChange = null;
      room.other.onPlayerChatIndicatorChange = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var sendChat = (room, value, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [{}, {}];
    room.onPlayerChat = (pId, val)=>{
      ret[0]=val==value && room.currentPlayer.id==pId;
      room.onPlayerChat = null;
    };
    room.other.onPlayerChat = (pId, val)=>{
      ret[1]=val==value && room.currentPlayer.id==pId;
      room.other.onPlayerChat = null;
    };
    room.sendChat(value);
    setTimeout(()=>{
      room.onPlayerChat = null;
      room.other.onPlayerChat = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var sendAnnouncement = (room, msg, targetId, color, sound, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [];
    room.onAnnouncement = (_msg, _color, _style, _sound)=>{
      ret[0]=msg==_msg && color==_color && sound==_sound;
      room.onAnnouncement = null;
    };
    room.other.onAnnouncement = (_msg, _color, _style, _sound)=>{
      ret[1]=msg==_msg && color==_color && sound==_sound;
      room.other.onPlayerChat = null;
    };
    room.sendAnnouncement(msg, targetId, color, null, sound);
    setTimeout(()=>{
      room.onAnnouncement = null;
      room.other.onAnnouncement = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var sendCustomEvent = (room, type, data, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [];
    room.onCustomEvent = (_type, _data)=>{
      ret[0]=type==_type && data==_data;
      room.onCustomEvent = null;
    };
    room.other.onCustomEvent = (_type, _data)=>{
      ret[1]=type==_type && data==_data;
      room.other.onCustomEvent = null;
    };
    room.sendCustomEvent(type, data);
    setTimeout(()=>{
      cRoom.onOperationReceived = null;
      room.onCustomEvent = null;
      room.other.onCustomEvent = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var resetTeam = (room, teamId, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [{}, {}];
    room.setPlayerTeam(cRoom.currentPlayerId, 2);
    room.setPlayerTeam(jRoom.currentPlayerId, 1);
    setTimeout(()=>{
      room.onPlayerTeamChange = (pId, val)=>{
        ret[0][pId]=val==0;
        room.onPlayerTeamChange = null;
      };
      room.other.onPlayerTeamChange = (pId, val)=>{
        ret[1][pId]=val==0;
        room.other.onPlayerTeamChange = null;
      };
      room.resetTeam(teamId);
      setTimeout(()=>{
        room.onPlayerTeamChange = null;
        room.other.onPlayerTeamChange = null;
        expectedFunc(ret) ? resolve() : reject();
      }, 1000);
    }, 200);
  });

  var resetTeams = (room, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [{}, {}];
    room.setPlayerTeam(cRoom.currentPlayerId, 2);
    room.setPlayerTeam(jRoom.currentPlayerId, 1);
    setTimeout(()=>{
      room.onPlayerTeamChange = (pId, val)=>{
        ret[0][pId]=val==0;
        room.onPlayerTeamChange = null;
      };
      room.other.onPlayerTeamChange = (pId, val)=>{
        ret[1][pId]=val==0;
        room.other.onPlayerTeamChange = null;
      };
      room.resetTeams();
      setTimeout(()=>{
        room.onPlayerTeamChange = null;
        room.other.onPlayerTeamChange = null;
        expectedFunc(ret) ? resolve() : reject();
      }, 1000);
    }, 200);
  });

  var setTimeLimit = (room, value, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [];
    cRoom.stopGame();
    room.onTimeLimitChange = (val)=>{
      ret[0]=val==value;
      room.onTimeLimitChange = null;
    };
    room.other.onTimeLimitChange = (val)=>{
      ret[1]=val==value;
      room.other.onTimeLimitChange = null;
    };
    room.setTimeLimit(value);
    setTimeout(()=>{
      room.onTimeLimitChange = null;
      room.other.onTimeLimitChange = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var setScoreLimit = (room, value, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [];
    cRoom.stopGame();
    room.onScoreLimitChange = (val)=>{
      ret[0]=val==value;
      room.onScoreLimitChange = null;
    };
    room.other.onScoreLimitChange = (val)=>{
      ret[1]=val==value;
      room.other.onScoreLimitChange = null;
    };
    room.setScoreLimit(value);
    setTimeout(()=>{
      room.onScoreLimitChange = null;
      room.other.onScoreLimitChange = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var setCurrentStadium = (room, value, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [];
    cRoom.stopGame();
    room.onStadiumChange = (val)=>{
      ret[0]=val?.se?.()==value?.se?.();
      room.onStadiumChange = null;
    };
    room.other.onStadiumChange = (val)=>{
      ret[1]=val?.se?.()==value?.se?.();
      room.other.onStadiumChange = null;
    };
    room.setCurrentStadium(value);
    setTimeout(()=>{
      room.onStadiumChange = null;
      room.other.onStadiumChange = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var changeTeam = (room, value, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [{}, {}];
    room.onPlayerTeamChange = (pId, val)=>{
      ret[0][pId]=room.getPlayer(pId)?.team.id==val && val==value && room.currentPlayer.id==pId;
      room.onPlayerTeamChange = null;
    };
    room.other.onPlayerTeamChange = (pId, val)=>{
      ret[1][pId]=room.other.getPlayer(pId)?.team.id==val && val==value && room.currentPlayer.id==pId;
      room.other.onPlayerTeamChange = null;
    };
    room.changeTeam(value);
    setTimeout(()=>{
      room.onPlayerTeamChange = null;
      room.other.onPlayerTeamChange = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var setKeyState = (room, value, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [{}, {}];
    room.onPlayerInputChange = (pId, val)=>{
      ret[0][pId]=room.getPlayer(pId)?.input==val && val==value && room.currentPlayer.id==pId;
      room.onPlayerInputChange = null;
    };
    room.other.onPlayerInputChange = (pId, val)=>{
      ret[1][pId]=room.other.getPlayer(pId)?.input==val && val==value && room.currentPlayer.id==pId;
      room.other.onPlayerInputChange = null;
    };
    room.setKeyState(value);
    setTimeout(()=>{
      room.onPlayerInputChange = null;
      room.other.onPlayerInputChange = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var setHandicap = (room, value, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [];
    room.onHandicapChange = (val)=>{
      ret[0]=val==value;
      room.onHandicapChange = null;
    };
    room.other.onHandicapChange = (val)=>{
      ret[1]=val==value;
      room.other.onHandicapChange = null;
    };
    room.setHandicap(value);
    setTimeout(()=>{
      room.onHandicapChange = null;
      room.other.onHandicapChange = null;
      room.setHandicap(0);
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var setExtrapolation = (room, value, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [];
    room.onExtrapolationChange = (val)=>{
      ret[0]=val==value;
      room.onExtrapolationChange = null;
    };
    room.other.onExtrapolationChange = (val)=>{
      ret[1]=val==value;
      room.other.onExtrapolationChange = null;
    };
    room.setExtrapolation(value);
    setTimeout(()=>{
      room.onExtrapolationChange = null;
      room.other.onExtrapolationChange = null;
      room.setExtrapolation(0);
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var setKickRateLimit = (room, min, rate, burst, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [{}, {}];
    room.onKickRateLimitChange = (_min, _rate, _burst)=>{
      ret[0] = _min==min && rate==_rate && burst==_burst && room.state.yd==min && room.state.Zc==rate && room.state.Zc*burst==room.state.ce;
      room.onPlayerTeamChange = null;
    };
    room.other.onKickRateLimitChange = (_min, _rate, _burst)=>{
      ret[1] = _min==min && rate==_rate && burst==_burst && room.other.state.yd==min && room.other.state.Zc==rate && room.other.state.Zc*burst==room.other.state.ce;
      room.other.onKickRateLimitChange = null;
    };
    room.setKickRateLimit(min, rate, burst);
    setTimeout(()=>{
      room.onKickRateLimitChange = null;
      room.other.onKickRateLimitChange = null;
      room.setKickRateLimit(2, 0, 1);
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var reorderPlayers = (room, list, top, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [];
    room.onPlayersOrderChange = (_list, _top)=>{
      ret[0] = _top==top && _list.reduce((x, a, i)=>(x&&(a==list[i])), true);
      room.onPlayersOrderChange = null;
    };
    room.other.onPlayersOrderChange = (_list, _top)=>{
      ret[1] = _top==top && _list.reduce((x, a, i)=>(x&&(a==list[i])), true);
      room.other.onPlayersOrderChange = null;
    };
    room.reorderPlayers(list, top);
    setTimeout(()=>{
      room.onPlayersOrderChange = null;
      room.other.onPlayersOrderChange = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var startGame = (room, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [];
    cRoom.stopGame();
    room.onGameStart = ()=>{
      ret[0] = true;
      room.onGameStart = null;
    };
    room.other.onGameStart = (_list, _top)=>{
      ret[1] = true;
      room.other.onGameStart = null;
    };
    room.startGame();
    setTimeout(()=>{
      room.onGameStart = null;
      room.other.onGameStart = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var pauseGame = (room, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [];
    cRoom.stopGame();
    cRoom.startGame();
    room.onGamePauseChange = (paused)=>{
      ret[0] = paused;
      room.onGamePauseChange = null;
    };
    room.other.onGamePauseChange = (paused, _top)=>{
      ret[1] = paused;
      room.other.onGamePauseChange = null;
    };
    room.pauseGame();
    setTimeout(()=>{
      room.onGamePauseChange = (paused)=>{
        ret[2] = paused;
        room.onGamePauseChange = null;
      };
      room.other.onGamePauseChange = (paused, _top)=>{
        ret[3] = paused;
        room.other.onGamePauseChange = null;
      };
      room.pauseGame();
      setTimeout(()=>{
        room.onGamePauseChange = null;
        room.other.onGamePauseChange = null;
        expectedFunc(ret) ? resolve() : reject();
      }, 1000);
    }, 1000);
  });

  var stopGame = (room, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [];
    cRoom.startGame();
    room.onGameStop = ()=>{
      ret[0] = true;
      room.onGameStop = null;
    };
    room.other.onGameStop = (_list, _top)=>{
      ret[1] = true;
      room.other.onGameStop = null;
    };
    room.stopGame();
    setTimeout(()=>{
      room.onGameStop = null;
      room.other.onGameStop = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var autoTeams = (room, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [];
    cRoom.resetTeams();
    room.onAutoTeams = ()=>{
      ret[0] = true;
      room.onAutoTeams = null;
    };
    room.other.onAutoTeams = ()=>{
      ret[1] = true;
      room.other.onAutoTeams = null;
    };
    room.autoTeams();
    setTimeout(()=>{
      room.onAutoTeams = null;
      room.other.onAutoTeams = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var lockTeams = (room, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [];
    room.onTeamsLockChange = (locked)=>{
      ret[0] = true;
      room.onTeamsLockChange = null;
    };
    room.other.onTeamsLockChange = (locked)=>{
      ret[1] = true;
      room.other.onTeamsLockChange = null;
    };
    room.lockTeams();
    setTimeout(()=>{
      room.onTeamsLockChange = null;
      room.other.onTeamsLockChange = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var randTeams = (room, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [0, 0];
    cRoom.resetTeams();
    setTimeout(()=>{
      room.onPlayerTeamChange = ()=>{
        ret[0]++;
      };
      room.other.onPlayerTeamChange = ()=>{
        ret[1]++;
      };
      room.randTeams();
      setTimeout(()=>{
        room.onPlayerTeamChange = null;
        room.other.onPlayerTeamChange = null;
        expectedFunc(ret) ? resolve() : reject();
      }, 1000);
    }, 400);
  });

  var setDiscProperties = (room, discId, properties, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [];
    room.onSetDiscProperties = (_discId, _properties)=>{
      ret[0] = discId==_discId && JSON.stringify(_properties)==JSON.stringify(properties);
      room.onSetDiscProperties = null;
    };
    room.other.onSetDiscProperties = (_discId, _properties)=>{
      ret[1] = discId==_discId && JSON.stringify(_properties)==JSON.stringify(properties);
      room.other.onSetDiscProperties = null;
    };
    room.setDiscProperties(discId, properties);
    setTimeout(()=>{
      room.onSetDiscProperties = null;
      room.other.onSetDiscProperties = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var setPlayerDiscProperties = (room, playerId, properties, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [];
    room.onSetDiscProperties = (discId, _properties)=>{
      ret[0] = room.gameState?.physicsState?.discs?.[discId]?.playerId==playerId && JSON.stringify(_properties)==JSON.stringify(properties);
      room.onSetDiscProperties = null;
    };
    room.other.onSetDiscProperties = (discId, _properties)=>{
      ret[1] = room.gameState?.physicsState?.discs?.[discId]?.playerId==playerId && JSON.stringify(_properties)==JSON.stringify(properties);
      room.other.onSetDiscProperties = null;
    };
    room.setPlayerDiscProperties(playerId, properties);
    setTimeout(()=>{
      room.onSetDiscProperties = null;
      room.other.onSetDiscProperties = null;
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var setProperties = (room, properties, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = null;
    room.onRoomPropertiesChange = (_properties)=>{
      ret = JSON.stringify(_properties)==JSON.stringify(properties);
      room.onRoomPropertiesChange = null;
    };
    room.setProperties(properties);
    setTimeout(()=>{
      room.onRoomPropertiesChange = null;
      room.setProperties({password: roomPassword});
      expectedFunc(ret) ? resolve() : reject();
    }, 1000);
  });

  var kickPlayer = (room, playerId, reason, isBanning, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = null;
    cRoom.onPlayerLeave = (_playerObj, _reason, _isBanned, byId)=>{
      ret = _playerObj.id==playerId && _reason==reason && _isBanned==isBanning;
      cRoom.onPlayerLeave = null;
    };
    room.kickPlayer(playerId, reason, isBanning);
    setTimeout(()=>{
      cRoom.onPlayerLeave = null;
      if (isBanning){
        ret ? joinRoom(roomPassword, ()=>{
          cRoom.clearBans();
          cRoom.kickPlayer(jRoom.currentPlayerId, "", false);
          reject();
        }, ()=>{
          cRoom.clearBans();
          expectedFunc(ret) ? (ret ? joinRoom(roomPassword, resolve, ()=>{}, ()=>{}) : resolve()) : reject();
        }, ()=>{}) : (expectedFunc(ret) ? resolve() : reject());
      }
      else
        expectedFunc(ret) ? (ret ? joinRoom(roomPassword, resolve, ()=>{}, ()=>{}) : resolve()) : reject();
    }, 1000);
  });

  var setRecaptcha = (expectedFunc) => new Promise((resolve, reject)=>{
    var ret = [];
    cRoom.kickPlayer(jRoom.currentPlayerId, "", false);
    cRoom.onRoomRecaptchaModeChange = (value)=>{
      ret.push(value);
    };
    var fReject = ()=>{
      cRoom.onRoomRecaptchaModeChange = null;
      reject();
    }
    cRoom.requireRecaptcha = true;
    joinRoom(roomPassword, fReject, ()=>{}, ()=>{
      cRoom.requireRecaptcha = false;
      joinRoom(roomPassword, ()=>{
        cRoom.onRoomRecaptchaModeChange = null;
        expectedFunc(ret) ? resolve() : reject();
      }, fReject, fReject);
    });
  });

  var leave = (room, expectedFunc) => new Promise((resolve, reject)=>{
    var ret = false, id = room.currentPlayerId;
    cRoom.onPlayerLeave = (playerObj, reason, isBanned)=>{
      ret = playerObj.id==id;
      cRoom.onPlayerLeave = null;
    };
    setTimeout(()=>{
      room.leave();
      setTimeout(()=>{
        cRoom.onPlayerLeave = null;
        ret ? joinRoom(roomPassword, ()=>{expectedFunc(ret) ? resolve() : reject();}) : reject();
      }, 1000);
    }, 500);
  });

  var banList_addRemovePlayer = (expectedFunc) => new Promise((resolve, reject)=>{
    var bId = cRoom.addPlayerBan(jRoom.currentPlayerId);
    setTimeout(()=>{
      jRoom.leave();
      setTimeout(()=>{
        joinRoom(roomPassword, reject, ()=>{
          cRoom.removeBan(bId);
          setTimeout(()=>{
            joinRoom(roomPassword, ()=>{
              expectedFunc(true) ? resolve() : reject();
            }, reject, ()=>{});
          }, 200);
        });
      }, 200);
    }, 200);
  });

  var banList_addRemoveIp = (expectedFunc) => new Promise((resolve, reject)=>{
    setTimeout(()=>{
      var bId = cRoom.addIpBan(Utils.hexStrToNumber(cRoom.getPlayer(jRoom.currentPlayerId).conn))[0];
      setTimeout(()=>{
        jRoom.leave();
        setTimeout(()=>{
          joinRoom(roomPassword, reject, ()=>{
            cRoom.removeBan(bId);
            setTimeout(()=>{
              joinRoom(roomPassword, ()=>{
                expectedFunc(true) ? resolve() : reject();
              }, reject, ()=>{});
            }, 200);
          });
        }, 200);
      }, 200);
    }, 1000);
  });

  var banList_addRemoveAuth = (expectedFunc) => new Promise((resolve, reject)=>{
    setTimeout(()=>{
      var bId = cRoom.addAuthBan(cRoom.getPlayer(jRoom.currentPlayerId).auth)[0];
      setTimeout(()=>{
        jRoom.leave();
        setTimeout(()=>{
          joinRoom(roomPassword, reject, ()=>{
            cRoom.removeBan(bId);
            setTimeout(()=>{
              joinRoom(roomPassword, ()=>{
                expectedFunc(true) ? resolve() : reject();
              }, reject, ()=>{});
            }, 200);
          });
        }, 200);
      }, 200);
    }, 1000);
  });

  var tests = [{
    name: "banList_addRemoveAuth",
    promise: ()=>banList_addRemoveAuth((ret)=>(ret))
  }, {
    name: "banList_addRemoveIp",
    promise: ()=>banList_addRemoveIp((ret)=>(ret))
  }, {
    name: "banList_addRemovePlayer",
    promise: ()=>banList_addRemovePlayer((ret)=>(ret))
  }, {
    name: "byClient_leave",
    promise: ()=>leave(jRoom, (ret)=>(ret))
  }, {
    name: "byHost_setAvatar",
    promise: ()=>setAvatar(cRoom, "AA", (ret)=>(ret[0][cRoom.currentPlayerId] && ret[1][cRoom.currentPlayerId]))
  }, {
    name: "byClient_setAvatar",
    promise: ()=>setAvatar(jRoom, "BB", (ret)=>(ret[0][jRoom.currentPlayerId] && ret[1][jRoom.currentPlayerId]))
  }, {
    name: "byHost_setSync_true",
    promise: ()=>setSync(cRoom, true, (ret)=>(ret[0][cRoom.currentPlayerId] && ret[1][cRoom.currentPlayerId]))
  }, {
    name: "byClient_setSync_true",
    promise: ()=>setSync(jRoom, true, (ret)=>(ret[0][jRoom.currentPlayerId] && ret[1][jRoom.currentPlayerId]))
  }, {
    name: "byHost_setSync_false",
    promise: ()=>setSync(cRoom, false, (ret)=>(ret[0][cRoom.currentPlayerId] && ret[1][cRoom.currentPlayerId]))
  }, {
    name: "byClient_setSync_false",
    promise: ()=>setSync(jRoom, false, (ret)=>(ret[0][jRoom.currentPlayerId] && ret[1][jRoom.currentPlayerId]))
  }, {
    name: "byHost_setTeamColors",
    promise: ()=>setTeamColors(cRoom, 1, 60, ["ff0000", "ffff00", "ff00ff", "ffff00"], (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byNonAdminClient_setTeamColors",
    promise: ()=>setTeamColors(jRoom, 2, 60, ["0000ff", "00ffff", "00ff00", "ff00ff"], (ret)=>(ret.length==0))
  }, {
    name: "byNonAdminClient_setPlayerAdmin_true",
    promise: ()=>setPlayerAdmin(jRoom, jRoom.currentPlayerId, true, (ret)=>(Object.keys(ret[0]).length==0 && Object.keys(ret[1]).length==0))
  }, {
    name: "byNonAdminClient_setPlayerTeam_1",
    promise: ()=>setPlayerTeam(jRoom, cRoom.currentPlayerId, 1, (ret)=>(Object.keys(ret[0]).length==0 && Object.keys(ret[1]).length==0))
  }, {
    name: "byNonAdminClient_setPlayerAvatar",
    promise: ()=>setPlayerAvatar(jRoom, cRoom.currentPlayerId, "aa", (ret)=>(Object.keys(ret[0]).length==0 && Object.keys(ret[1]).length==0))
  }, {
    name: "byNonAdminClient_resetTeams",
    promise: ()=>resetTeams(jRoom, (ret)=>(Object.keys(ret[0]).length==0 && Object.keys(ret[1]).length==0))
  }, {
    name: "byNonAdminClient_resetTeam",
    promise: ()=>resetTeam(jRoom, 1, (ret)=>(Object.keys(ret[0]).length==0 && Object.keys(ret[1]).length==0))
  }, {
    name: "byNonAdminClient_setTimeLimit",
    promise: ()=>setTimeLimit(jRoom, 1, (ret)=>(ret.length==0))
  }, {
    name: "byNonAdminClient_setScoreLimit",
    promise: ()=>setScoreLimit(jRoom, 1, (ret)=>(ret.length==0))
  }, {
    name: "byNonAdminClient_setCurrentStadium",
    promise: ()=>setCurrentStadium(jRoom, stadium1, (ret)=>(ret.length==0))
  }, {
    name: "byNonAdminClient_changeTeam",
    promise: ()=>changeTeam(jRoom, 2, (ret)=>(ret[0][jRoom.currentPlayerId] && ret[1][jRoom.currentPlayerId]))
  }, {
    name: "byNonAdminClient_setKickRateLimit",
    promise: ()=>setKickRateLimit(jRoom, 20, 20, 20, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byNonAdminClient_startGame",
    promise: ()=>startGame(jRoom, (ret)=>(!ret[0] && !ret[1]))
  }, {
    name: "byNonAdminClient_stopGame",
    promise: ()=>stopGame(jRoom, (ret)=>(!ret[0] && !ret[1]))
  }, {
    name: "byNonAdminClient_pauseGame",
    promise: ()=>pauseGame(jRoom, (ret)=>(!ret[0] && !ret[1] && !ret[2] && !ret[3]))
  }, {
    name: "byNonAdminClient_autoTeams",
    promise: ()=>autoTeams(jRoom, (ret)=>(!ret[0] && !ret[1]))
  }, {
    name: "byNonAdminClient_randTeams",
    promise: ()=>randTeams(jRoom, (ret)=>(ret[0]==0 && ret[1]==0))
  }, {
    name: "byNonAdminClient_lockTeams",
    promise: ()=>lockTeams(jRoom, (ret)=>(!ret[0] && !ret[1]))
  }, {
    name: "byHost_setPlayerAdmin_true",
    promise: ()=>setPlayerAdmin(cRoom, jRoom.currentPlayerId, true, (ret)=>(ret[0][jRoom.currentPlayerId] && ret[1][jRoom.currentPlayerId]))
  }, {
    name: "byHost_setChatIndicatorActive_true",
    promise: ()=>setChatIndicatorActive(cRoom, true, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byHost_setChatIndicatorActive_false",
    promise: ()=>setChatIndicatorActive(cRoom, false, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byClient_setChatIndicatorActive_true",
    promise: ()=>setChatIndicatorActive(jRoom, true, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byClient_setChatIndicatorActive_false",
    promise: ()=>setChatIndicatorActive(jRoom, false, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byHost_sendChat",
    promise: ()=>sendChat(cRoom, "test123", (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byClient_sendChat",
    promise: ()=>sendChat(jRoom, "test321", (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byHost_sendAnnouncement",
    promise: ()=>sendAnnouncement(cRoom, "test_announcement1", null, 0x391872, 2, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byClient_sendAnnouncement",
    promise: ()=>sendAnnouncement(jRoom, "test_announcement2", null, 0x292827, 1, (ret)=>(!ret[0] && !ret[1]))
  }, {
    name: "byHost_sendCustomEvent",
    promise: ()=>sendCustomEvent(cRoom, 0, "ctestData", (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byClient_sendCustomEvent",
    promise: ()=>sendCustomEvent(jRoom, 1, "jtestData", (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byAdminClient_setTeamColors",
    promise: ()=>setTeamColors(jRoom, 2, 60, ["0000ff", "00ffff", "00ff00", "ff00ff"], (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byHost_setPlayerAvatar",
    promise: ()=>setPlayerAvatar(cRoom, jRoom.currentPlayerId, "bb", (ret)=>(ret[0][jRoom.currentPlayerId] && ret[1][jRoom.currentPlayerId]))
  }, {
    name: "byAdminClient_setPlayerAvatar",
    promise: ()=>setPlayerAvatar(jRoom, cRoom.currentPlayerId, "cc", (ret)=>(Object.keys(ret[0]).length==0 && Object.keys(ret[1]).length==0))
  }, {
    name: "byHost_setPlayerTeam_1",
    pre: ()=>new Promise((resolve)=>(cRoom.setPlayerTeam(jRoom.currentPlayerId, 0), setTimeout(resolve, 200))),
    promise: ()=>setPlayerTeam(cRoom, jRoom.currentPlayerId, 1, (ret)=>(ret[0][jRoom.currentPlayerId] && ret[1][jRoom.currentPlayerId]))
  }, {
    name: "byAdminClient_setPlayerTeam_2",
    promise: ()=>setPlayerTeam(jRoom, cRoom.currentPlayerId, 2, (ret)=>(ret[0][cRoom.currentPlayerId] && ret[1][cRoom.currentPlayerId]))
  }, {
    name: "byHost_resetTeam",
    promise: ()=>resetTeam(cRoom, 2, (ret)=>(ret[0][cRoom.currentPlayerId] && ret[1][cRoom.currentPlayerId]))
  }, {
    name: "byAdminClient_resetTeam",
    promise: ()=>resetTeam(jRoom, 1, (ret)=>(ret[0][jRoom.currentPlayerId] && ret[1][jRoom.currentPlayerId]))
  }, {
    name: "byHost_resetTeams",
    promise: ()=>resetTeams(cRoom, (ret)=>(ret[0][jRoom.currentPlayerId] && ret[1][jRoom.currentPlayerId]))
  }, {
    name: "byAdminClient_resetTeams",
    promise: ()=>resetTeams(jRoom, (ret)=>(ret[0][jRoom.currentPlayerId] && ret[1][jRoom.currentPlayerId]))
  }, {
    name: "byHost_setTimeLimit",
    promise: ()=>setTimeLimit(cRoom, 1, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byAdminClient_setTimeLimit",
    promise: ()=>setTimeLimit(jRoom, 2, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byHost_setScoreLimit",
    promise: ()=>setScoreLimit(cRoom, 1, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byAdminClient_setScoreLimit",
    promise: ()=>setScoreLimit(jRoom, 2, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byHost_setKickRateLimit",
    promise: ()=>setKickRateLimit(cRoom, 20, 20, 20, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byAdminClient_setKickRateLimit",
    promise: ()=>setKickRateLimit(jRoom, 20, 20, 20, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byHost_setCurrentStadium",
    promise: ()=>setCurrentStadium(cRoom, stadium2, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byAdminClient_setCurrentStadium",
    promise: ()=>setCurrentStadium(jRoom, stadium1, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byHost_changeTeam",
    promise: ()=>changeTeam(cRoom, 1, (ret)=>(ret[0][cRoom.currentPlayerId] && ret[1][cRoom.currentPlayerId]))
  }, {
    name: "byAdminClient_changeTeam",
    promise: ()=>changeTeam(jRoom, 2, (ret)=>(ret[0][jRoom.currentPlayerId] && ret[1][jRoom.currentPlayerId]))
  }, {
    name: "byHost_setKeyState",
    promise: ()=>setKeyState(cRoom, 26, (ret)=>(ret[0][cRoom.currentPlayerId] && ret[1][cRoom.currentPlayerId]))
  }, {
    name: "byClient_setKeyState",
    promise: ()=>setKeyState(jRoom, 26, (ret)=>(ret[0][jRoom.currentPlayerId] && ret[1][jRoom.currentPlayerId]))
  }, {
    name: "setHandicap",
    promise: ()=>setHandicap(jRoom, 100, (ret)=>(ret[0] && !ret[1]))
  }, {
    name: "setExtrapolation",
    promise: ()=>setExtrapolation(jRoom, 100, (ret)=>(ret[0] && !ret[1]))
  }, {
    name: "byHost_reorderPlayers",
    promise: ()=>reorderPlayers(cRoom, [jRoom.currentPlayerId, cRoom.currentPlayerId], true, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byClient_reorderPlayers",
    promise: ()=>reorderPlayers(jRoom, [cRoom.currentPlayerId, jRoom.currentPlayerId], true, (ret)=>(!ret[0] && !ret[1]))
  }, {
    name: "byHost_startGame",
    promise: ()=>startGame(cRoom, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byAdminClient_startGame",
    promise: ()=>startGame(jRoom, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byHost_stopGame",
    promise: ()=>stopGame(cRoom, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byHost_pauseGame",
    promise: ()=>pauseGame(cRoom, (ret)=>(ret[0] && ret[1] && !ret[2] && !ret[3]))
  }, {
    name: "byAdminClient_pauseGame",
    promise: ()=>pauseGame(jRoom, (ret)=>(ret[0] && ret[1] && !ret[2] && !ret[3]))
  }, {
    name: "byAdminClient_stopGame",
    promise: ()=>stopGame(jRoom, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byClient_setDiscProperties",
    promise: ()=>setDiscProperties(jRoom, cRoom.currentPlayerId, {radius: 20}, (ret)=>(!ret[0] && !ret[1]))
  }, {
    name: "byClient_setPlayerDiscProperties",
    promise: ()=>setPlayerDiscProperties(jRoom, cRoom.currentPlayerId, {radius: 20}, (ret)=>(!ret[0] && !ret[1]))
  }, {
    name: "byHost_autoTeams",
    promise: ()=>autoTeams(cRoom, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byHost_randTeams",
    promise: ()=>randTeams(cRoom, (ret)=>(ret[0]==2 && ret[1]==2))
  }, {
    name: "byHost_lockTeams",
    promise: ()=>lockTeams(cRoom, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byAdminClient_autoTeams",
    promise: ()=>autoTeams(jRoom, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byAdminClient_randTeams",
    promise: ()=>randTeams(jRoom, (ret)=>(ret[0]==2 && ret[1]==2))
  }, {
    name: "byAdminClient_lockTeams",
    promise: ()=>lockTeams(jRoom, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byHost_setDiscProperties",
    promise: ()=>setDiscProperties(cRoom, 0, {radius: 20}, (ret)=>(!ret[0] && !ret[1]))
  }, {
    name: "byHost_setPlayerDiscProperties",
    promise: ()=>setPlayerDiscProperties(cRoom, jRoom.currentPlayerId, {radius: 20}, (ret)=>(!ret[0] && !ret[1]))
  }, {
    name: "byAdminClient_kickPlayer",
    promise: ()=>kickPlayer(jRoom, jRoom.currentPlayerId, "test", false, (ret)=>(ret))
  }, {
    name: "byAdminClient_setPlayerAdmin_false",
    pre: ()=>new Promise((resolve)=>(cRoom.setPlayerAdmin(jRoom.currentPlayerId, true), setTimeout(resolve, 200))),
    promise: ()=>setPlayerAdmin(jRoom, jRoom.currentPlayerId, false, (ret)=>(ret[0][jRoom.currentPlayerId] && ret[1][jRoom.currentPlayerId]))
  }, {
    name: "byHost_recording",
    promise: ()=>testRecording(cRoom, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byClient_recording",
    promise: ()=>testRecording(jRoom, (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byNonAdminClient_kickPlayer",
    promise: ()=>kickPlayer(jRoom, jRoom.currentPlayerId, "test", false, (ret)=>(!ret))
  }, {
    name: "byNonAdminClient_banPlayer",
    promise: ()=>kickPlayer(jRoom, jRoom.currentPlayerId, "test", true, (ret)=>(!ret))
  }, {
    name: "byHost_kickPlayer",
    promise: ()=>kickPlayer(cRoom, jRoom.currentPlayerId, "test", false, (ret)=>(ret))
  }, {
    name: "byHost_banPlayer+clearBans",
    promise: ()=>kickPlayer(cRoom, jRoom.currentPlayerId, "test", true, (ret)=>(ret))
  }, {
    name: "byHost_setPlayerAdmin_true",
    promise: ()=>setPlayerAdmin(cRoom, jRoom.currentPlayerId, true, (ret)=>(ret[0][jRoom.currentPlayerId] && ret[1][jRoom.currentPlayerId]))
  }, {
    name: "setRecaptcha",
    promise: ()=>setRecaptcha((ret)=>(ret[0]==true && ret[1]==false))
  }];

  /*
  // add special tests here to fix bugs:
  var tests = [{
    name: "byHost_sendCustomEvent",
    pre: ()=>new Promise((resolve)=>(setTimeout(resolve, 2000))),
    promise: ()=>sendCustomEvent(cRoom, 0, "ctestData", (ret)=>(ret[0] && ret[1]))
  }, {
    name: "byClient_sendCustomEvent",
    promise: ()=>sendCustomEvent(jRoom, 1, "jtestData", (ret)=>(ret[0] && ret[1]))
  }];
  */
  
  var n = 0, ns = 0, roomId, authObj;

  var nextTest = function(){
    var s = tests[n++];
    if (!s){
      var r = ns/tests.length, rating = ratings[0], i=1;
      while(r>rating.t && i<ratings.length) rating=ratings[i++];
      log(yellow, "Finished all tests.\r\n");
      log(magenta, "Success rate: ", rating.c, ns + "/" + tests.length + " (" + Math.round(100*r) + "%)\r\n");
      log(magenta, "Package health: ", rating.c, rating.n + "\r\n");
      exit();
      return;
    }
    log(blue, "(" + n + "/" + tests.length + ") ");
    log(yellow, "Testing: '");
    log(magenta, s.name);
    log(yellow, "'... ");
    var f = ()=>s.promise().then(()=>{
      log(green, "Succeeded.\r\n");
      ns++;
      nextTest();
    }).catch(()=>{
      log(red, "Failed.\r\n");
      nextTest();
    });
    if (s.pre)
      s.pre().then(f);
    else
      f();
  };

  function joinRoom(password, onSuccess, onFailure=(error)=>{console.error("Join room onFailure:", error);exit();}, onRequestRecaptcha=()=>{console.error("Join room: Invalid token.");exit();}){
    console.warn("trying to join room(", roomId, ") using password:", password);
    var hb = Room.join({
      id: roomId, 
      password: password, 
      authObj: authObj
    }, {
      storage: {
        player_name: "asd1",
        avatar: "x1",
        geo: {lat:30, lon:30, flag:"jp"}
      },
      onSuccess: (room)=>{
        jRoom = room;
        cRoom.other = jRoom;
        jRoom.other = cRoom;
        hb.onRequestRecaptcha = null;
        hb.onFailure = null;
        onSuccess();
      },
      onRequestRecaptcha: ()=>{
        onRequestRecaptcha();
      },
      onFailure: (error)=>{
        onFailure(error)
      },
      onLeave: (error)=>{
        log(yellow, "Join room onLeave (" + error.code + ", params: [" + error.params.join(",") + "])\r\n");
      }
    });
  }
 
  /*
  var startTime = Date.now(), numSucceededRequests = 0, mode = 0, elapsedTime = [];

  Room.create({
    geo: {lat:30, lon:30, flag: "br"},
    name: "test",
    password: roomPassword,
    maxPlayerCount: 30,
    showInRoomList: false,
    token: roomToken,
    onError: (error, playerId)=>{
      if (error.code==56)
        return;
      console.error("error:", error, playerId);
      exit();
    }
  }, {
    storage: {
      player_name: "asd1",
      avatar: "x1",
      geo: {lat:30, lon:30, flag:"jp"}
    },
    onSuccess: (room)=>{
      cRoom = room;
      numSucceededRequests++;
      room.onRoomLink = (link)=>{
        roomId = link.substring(link.indexOf("=")+1);
        roomId = roomId.substring(0, roomId.indexOf("&"));
        console.log("room link:", link);
        var fJ = function(){
          Utils.generateAuth().then(([key, obj])=>{
            authObj = obj;
            //joinRoom(roomPassword, nextTest);
            joinRoom(roomPassword, ()=>{
              if (mode==0)
                numSucceededRequests++;
              else if (mode==1){
                elapsedTime[mode++] = Date.now() - startTime;
                console.log("The Haxball backend's rate limit is around "+numSucceededRequests+" requests per "+elapsedTime[1]+"ms.");
                process.exit(0);
              }
              fJ();
            }, (error)=>{
              if (mode==0)
                elapsedTime[mode++] = Date.now() - startTime;
              fJ();
            });
          });
        }
        fJ();
      }
    },
    onFailure: (error)=>{
      console.error("Create room:", error);
      exit();
    },
    onLeave: (error)=>{
      console.warn("Create room:", error);
      exit();
    },
    onRequestRecaptcha: ()=>{
      console.error("Create room: Invalid token.");
      exit();
    }
  });
  */

  Room.create({
    geo: {lat:30, lon:30, flag: "br"},
    name: "test",
    password: roomPassword,
    maxPlayerCount: 30,
    showInRoomList: false,
    token: roomToken,
    onError: (error, playerId)=>{
      if (error.code==56)
        return;
      console.error("error:", error, playerId);
      exit();
    }
  }, {
    storage: {
      player_name: "asd1",
      avatar: "x1",
      geo: {lat:30, lon:30, flag:"jp"}
    },
    onSuccess: (room)=>{
      cRoom = room;
      room.onRoomLink = (link)=>{
        roomId = link.substring(link.indexOf("=")+1);
        roomId = roomId.substring(0, roomId.indexOf("&"));
        console.log("room link:", link);
        Utils.generateAuth().then(([key, obj])=>{
          authObj = obj;
          joinRoom(roomPassword, nextTest);
        });
      }
    },
    onFailure: (error)=>{
      console.error("Create room:", error);
      exit();
    },
    onLeave: (error)=>{
      console.warn("Create room:", error);
      exit();
    },
    onRequestRecaptcha: ()=>{
      console.error("Create room: Invalid token.");
      exit();
    }
  });
};
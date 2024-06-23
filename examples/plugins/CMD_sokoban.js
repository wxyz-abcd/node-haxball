module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "CMD_sokoban", true, { // "CMD_sokoban" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc & AlliBalliBaba",
    description: `This plugin sets up a sokoban game.`,
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });
  
  //var downloadLink = "https://cdn.jsdelivr.net/gh/begoon/sokoban-maps/maps/sokoban-maps-60-plain.txt";
  //var maps = null;

  var that = this, boxSize = 30;
  
  var tileProperties = [
    null, // empty
    { color: "000000", radius: boxSize/2 }, // wall
    { color: "a1662f", radius: boxSize/2 }, // box
    { color: "355e3b", radius: boxSize/4 }, // target
    { color: "cc0808", radius: boxSize/2 }, // box+target
    null // player
  ];

  /*
  
  // example map: 
  var mapProps = {
    w: 7,
    h: 7,
    tiles: [
      [0, 1, 1, 1, 1, 1, 0],
      [1, 1, 0, 0, 0, 1, 0],
      [1, 0, 3, 3, 0, 1, 1],
      [1, 0, 5, 4, 0, 0, 1],
      [1, 0, 2, 4, 2, 0, 1],
      [1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 0]
    ]
  };
  */

  var gameState = null, mapProps = null, worker, workerPromise, workerPromiseResolve, permissionCtx, permissionIds;
  
  function updatePlayerDiscs(){
    that.room.state.players.forEach((player)=>{
      if (player.disc!=null){
        that.room.setPlayerDiscProperties(player.id, {
          xspeed: 0,
          yspeed: 0,
          cGroup: 1<<CollisionFlags.c0
        });
      }
    });
  }
  
  function updateStadium(){
    if (workerPromise)
      return workerPromise;
    workerPromise = new Promise((resolve, reject)=>{
      workerPromiseResolve = resolve;
      worker.postMessage("1");
    });
    return workerPromise.then((_mapProps)=>{
      mapProps = _mapProps;
      var offsetX = (1-mapProps.w)*boxSize/2, offsetY = (1-mapProps.h)*boxSize/2;
      var stadiumJson = {
      	"name" : "Sokoban",
      	"width" : 420,
      	"height" : 200,
      	"cameraWidth" : 0,
      	"cameraHeight" : 0,
      	"maxViewWidth" : 0,
      	"cameraFollow" : "player",
      	"spawnDistance" : 170,
      	"redSpawnPoints" : [],
      	"blueSpawnPoints" : [],
      	"canBeStored" : true,
      	"kickOffReset" : "partial",
      	"bg" : { "color" : "777700" },
      	"vertexes" : mapProps.vertices.map(({x,y})=>({"x": x*boxSize+offsetX, "y": y*boxSize+offsetY})),
      	"segments" : mapProps.segments,
      	"goals" : [],
      	"discs" : [],
      	"planes" : [],
      	"joints" : [],
      	"playerPhysics" : {
      		"radius" : boxSize/2,
      		"cMask" : ["none"],
      		"cGroup" : ["c0"],
      		"gravity" : [0, 0],
      		"acceleration" : 0,
      		"damping" : 0,
      		"kickingAcceleration" : 0,
      		"kickingDamping" : 0,
      		"kickStrength" : 0,
      		"kickback" : 0
      	},
      	"ballPhysics" : {
      		"radius" : 0,
      		"cMask" : ["none"],
      		"cGroup" : ["c0"]
      	}
      };
      gameState = [];
      for (var i=0;i<mapProps.h;i++){
        var a = mapProps.tiles[i];
        var row = [];
        gameState.push(row);
        for (var j=0;j<mapProps.w;j++){
          var val = a[j], p = [j*boxSize+offsetX, i*boxSize+offsetY], ids = [];
          if (val==5){
            stadiumJson.redSpawnPoints.push(p);
            stadiumJson.blueSpawnPoints.push(p);
            val = 0;
          }
          else if (val==6){
            stadiumJson.redSpawnPoints.push(p);
            stadiumJson.blueSpawnPoints.push(p);
            val = 3;
          }
          var props = tileProperties[val];
          if (props){
            stadiumJson.discs.push({
              "pos": p,
              "color": props.color,
              "radius": props.radius,
          		"cMask" : ["none"],
              "cGroup" : ["c0"]
            });
            ids.push(stadiumJson.discs.length);
            if (val==4){
              stadiumJson.discs.push({
                "pos": p,
                "color": props.color,
                "radius": props.radius,
            		"cMask" : ["none"],
                "cGroup" : ["c0"]
              });
              ids.push(stadiumJson.discs.length);
            }
          }
          row.push({
            tile: val,
            discIds: ids
          });
        }
      }
      var stadium = Utils.parseStadium(JSON.stringify(stadiumJson), console.log);
      if (!stadium)
        return false;
      that.room.setCurrentStadium(stadium, console.log);
      return true;
    });
  }
  
  function nextStadium(){
    that.room.stopGame();
    updateStadium().then(()=>{
      that.room.startGame();
    });
    //while (!updateStadium(Math.floor(maps.length*Math.random())));
    //that.room.startGame();
  }
  
  function resetState(){
    gameState = [];
    var k = 0;
    for (var i=0;i<mapProps.h;i++){
      var a = mapProps.tiles[i];
      var row = [];
      gameState.push(row);
      for (var j=0;j<mapProps.w;j++){
        var val = a[j], ids = [];
        if (val==5)
          val = 0;
        var props = tileProperties[val];
        if (props){
          ids.push(++k);
          if (val==4)
            ids.push(++k);
        }
        row.push({
          tile: val,
          discIds: ids
        });
      }
    }
  }
  
  function checkEndGame(player){
    if (gameState.findIndex((row)=>(row.findIndex((cell)=>(cell.tile==2 || cell.tile==3))>=0))<0){
      Utils.runAfterGameTick(()=>{
        that.room.sendAnnouncement("["+player.id+"]"+player.name+" has won.", null, 0xff0000);
        nextStadium();
      });
    }
  }

  function optimizeForHaxball(level){
  	var arr = [], arr2 = [];
  	var x1=level.w+2, y1=level.h+2, x2=-1, y2=-1;
  	for (var i=-1;i<=level.h;i++){
  		var oRow = level.arr[i] || [], row = [], row2 = [];
  		for (var j=-1;j<=level.w;j++){
  			var c = oRow[j];
  			row.push((c==null || c==1)?1:0);
  			row2.push(0);
  		}
  		arr.push(row);
  		arr2.push(row2);
  	}
  	function checkCall(x, y, dx, dy){
  		var nx = x+dx, ny = y+dy;
  		if (nx<0 || nx>level.w+1 || ny<0 || ny>level.h+1 || arr2[ny][nx])
  			return;
  		if (arr[ny][nx]==0){
  			if (x1>x)
  				x1=x;
  			if (x2<x)
  				x2=x;
  			if (y1>y)
  				y1=y;
  			if (y2<y)
  				y2=y;
  			arr2[y][x]=1;
  		}
  		floodfill(nx,ny);
  	}
  	function floodfill(x,y){
  		if (arr[y][x]==0 || arr2[y][x]==2)
  			return;
  		arr2[y][x]=2;
  		checkCall(x,y,-1,0);
  		checkCall(x,y,1,0);
  		checkCall(x,y,0,-1);
  		checkCall(x,y,0,1);
  	}
  	floodfill(0,0);
  	var arr3 = [];
  	for (var i=y1;i<=y2;i++){
  		var row = [];
  		for (var j=x1;j<=x2;j++){
  			var val;
  			switch(arr2[i][j]){
  				case 0:
  					val = level.arr[i-1]?.[j-1];
  					break;
  				case 1:
  					val = 8;
  					break;
  				case 2:{
  					if ((arr2[i+1]?.[j+1]==0)||(arr2[i+1]?.[j-1]==0)||(arr2[i-1]?.[j+1]==0)||(arr2[i-1]?.[j-1]==0))
  						val = 8;
  					else
  						val = 0;
  					break;
  				}
  			}
  			row.push(val);
  		}
  		arr3.push(row);
  	}
  	var vertices = [], segments = [];
  	var w = x2-x1+1, h = y2-y1+1;
		for (var i=0;i<h;i++)
			for (var j=0;j<w;j++){
				if (arr3[i][j]!=8)
					continue;
				var b1 = arr3[i][j-1]==8;
				var b2 = arr3[i][j+1]==8;
				var b3 = arr3[i-1]?.[j]==8;
				var b4 = arr3[i+1]?.[j]==8;
				var t = b1+b2+b3+b4;
				if ((t==2) && ((b1&&b2)||(b3&&b4)))
					continue;
				vertices.push({x:j, y:i, b1:b2, b2:b4, id:vertices.length});
			}
		vertices.forEach((v)=>{
			var {x,y,b1,b2,id} = v;
			delete v.b1;
			delete v.b2;
			delete v.id;
			if (b1)
				segments.push({
					"v0": id, 
					"v1": vertices.filter((z)=>(z.y==y && z.x>x)).sort((v1,v2)=>(v1.x-v2.x))[0].id
				});
			if (b2)
				segments.push({
					"v0": id, 
					"v1": vertices.filter((z)=>(z.x==x && z.y>y)).sort((v1,v2)=>(v1.y-v2.y))[0].id
				});
		});
  	return {
  		w: w,
  		h: h,
  		tiles: arr3,
  		vertices: vertices,
  		segments: segments
  	};
  }
  
  this.initialize = function(){
    permissionCtx = that.room.librariesMap.permissions?.createContext("sokoban");
    if (permissionCtx)
      permissionIds = {
        skip: permissionCtx.addPermission("skip")
      };
    that.room.librariesMap.commands?.add({
      name: "skip",
      parameters: [],
      minParameterCount: 0,
      helpText: "Skips the current map.",
      callback: ({}, byId) => {
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.skip)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        nextStadium();
      }
    });
    
    worker = new Worker(URL.createObjectURL(new Blob([`
      // Code adapted from : https://github.com/AlliBalliBaba/Sokoban-Level-Generator
      
      //create a 2D Array
      function Array2d(xSize, ySize, content) {
        var NodeGrid = new Array(xSize);
        for (var i = 0; i < xSize; i++) {
          NodeGrid[i] = new Array(ySize);
          for (var j = 0; j < ySize; j++)
            NodeGrid[i][j] = content;
        }
        return NodeGrid;
      }
      
      function perm(aList, bList, permutation, permutations) {
        for (var j = 0; j < bList.length; j++) {
          var newPer = permutation.slice();
          newPer.push([aList[0], bList[j]]);
          if (aList.length > 1) {
            var newList = bList.slice();
            newList.splice(j, 1);
            perm(aList.slice(1, aList.length), newList, newPer, permutations)
          }
          else
            permutations.push(newPer);
        }
      }
      
      //find all permutations between the elements of 2 lists of equal size
      function findPermutations(aList, bList) {
        var permutations = [];
        perm(aList, bList, [], permutations);
        return permutations;
      }
      
      //add to sorted array via binary search
      function addToSortedArray(array, element, compareFunction) {
        var index = binarySearch(array, element, compareFunction);
        if (index < 0) 
          index = -index - 1;
        array.splice(index, 0, element);
      }
      
      //binary search in sorted array 
      function binarySearch(array, element, compareFunction) {
        var m = 0;
        var n = array.length - 1;
        while (m <= n) {
          var k = (n + m) >> 1;
          var cmp = compareFunction(element, array[k]);
          if (cmp > 0)
            m = k + 1;
          else if (cmp < 0)
            n = k - 1;
          else
            return k;
        }
        return -m - 1;
      }
      
      function fComparer(element1, element2) {
        return element1.f - element2.f;
      }
      
      //check if a point is in the boundaries of a 2D-array
      function checkBoundaries(arr2D, x, y) {
        return (x >= 0 && x < arr2D.length && y >= 0 && y < arr2D[0].length);
      }
      
      //return a random integer between min (included) and max (excluded)
      function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
      }
      
      class Level {
        constructor(xSize, ySize, NumBoxes) {
          this.xSize = xSize;
          this.ySize = ySize;
          this.buttons = [];
          this.boxes = [];
          this.ghostboxes = [];
          this.solveCounter = NumBoxes;
          this.savedPositions = [];
          this.trash = false;
          //initialize nodes for pathfinding
          this.nodes = Array2d(xSize, ySize, null);
          for (var i = 0; i < this.nodes.length; i++)
            for (var j = 0; j < this.nodes[0].length; j++)
              this.nodes[i][j] = new Node(i, j);
          //randomly place boxes and buttons
          this.defineAllowedSpots();
          this.placeObjects(NumBoxes);
        }
      
        placeObjects(numBoxes) {
          //place buttons
          for (var i = 0; i < numBoxes; i++) {
            var pos = this.randomSpot();
            if (pos != null)
              this.buttons.push(new Button(pos[0], pos[1]))
          }
          //place boxes
          for (var i = 0; i < numBoxes; i++) {
            var pos = this.randomSpot();
            if (pos != null) {
              this.boxes.push(new Box(pos[0], pos[1], this.buttons[i]))
              this.nodes[pos[0]][pos[1]].hasBox = true;
            }
          }
          //place player
          var pos = this.randomSpot();
          if (pos == null)
            pos = [this.buttons[0].x, this.buttons[0].y];
          this.setPlayerPos(pos[0], pos[1]);
          this.playerstartX = this.playerX;
          this.playerstartY = this.playerY;
        }
      
        //write all nodes, where placement is allowed into a list
        defineAllowedSpots() {
          this.allowedSpots = [];
          for (var i = 2; i < this.nodes.length - 2; i++)
            for (var j = 2; j < this.nodes[0].length - 2; j++)
              this.allowedSpots.push(this.nodes[i][j]);
        }
      
        //return a random unoccupied spot and remove the wall
        randomSpot() {
          if (this.allowedSpots.length == 0) 
            return null;
          var rand = randomInt(0, this.allowedSpots.length);
          var x = this.allowedSpots[rand].x;
          var y = this.allowedSpots[rand].y;
          this.allowedSpots.splice(rand, 1);
          this.nodes[x][y].wall = false;
          if (this.blockaded(x, y))
            return this.randomSpot();
          else
            return [x, y];
        }
      
        //randomly remove walls from the level
        rip(amount) {
          for (var i = 0; i < amount; i++)
            if (this.allowedSpots.length != 0)
              this.randomSpot();
        }
      
        setPlayerPos(X, Y) {
          this.playerX = X;
          this.playerY = Y;
        }
      
        //check if a spot is blockaded by boxes
        blockaded(X, Y) {
          return (this.nodes[X + 1][Y].hasBox && ((this.nodes[X + 1][Y + 1].hasBox && this.nodes[X][Y + 1].hasBox) || (this.nodes[X + 1][Y - 1].hasBox && this.nodes[X][Y - 1].hasBox))) || (this.nodes[X - 1][Y].hasBox && ((this.nodes[X - 1][Y - 1].hasBox && this.nodes[X][Y - 1].hasBox) || (this.nodes[X - 1][Y + 1].hasBox && this.nodes[X][Y + 1].hasBox)));
        }
      }
      
      class Box {
        constructor(X, Y, button) {
          this.x = X;
          this.y = Y;
          this.px = this.x;
          this.py = this.y;
          this.placed = false;
          this.solveButton = button;
        }
      
        setPosition(X, Y) {
          this.x = X;
          this.y = Y;
        }
      
        placeExactly(X, Y) {
          this.x = X;
          this.y = Y;
          this.px = this.x;
          this.py = this.y;
        }
      }
      
      class Button {
        constructor(X, Y) {
          this.x = X;
          this.y = Y;
        }
      }
      
      // the idea behind this pathfinding algorithm is to traverse the least amount of walls
      // additionally the player will always take the longest available free path when choosing a box
      
      const wallCost = 100; //the cost for traversing a wall
      var pathCost = 1; //the cost for traversing an unoccupied node
      var playerPathCost = -1; //the player cost for traversing an unoccupied node
      const boxCost = 10000; //the cost for traversing an occupied node
      
      class Node {
        //initialize each node as an unoccupied wall
        constructor(X, Y) {
          this.x = X;
          this.y = Y;
          this.f = 0; //path-cost-estimation
          this.cost = 0; //path-cost
          this.closed = false; //variable for pathfinding
          this.checked = false; //variable for pathfinding
          this.wall = true; //check if node has a wall
          this.occupied = false; //check if node is occupied(for pathfinding)
          this.parent = null; //node parent for pathfinding
          this.hasBox = false; //check if node has a box
          this.used = false; //variable for optimizing
        }
      }
      
      class Pathfinder {
        constructor(Level, startX, startY, endX, endY) {
          this.level = Level;
          this.nodes = this.level.nodes;
          this.startX = startX;
          this.startY = startY;
          this.endX = endX;
          this.endY = endY;
          this.open = [];
          this.closed = [];
        }
      
        //return path and cost, cost of player-path and box-path can differ
        returnPath(isBox) {
          this.open.push(this.nodes[this.startX][this.startY]);
          while (this.open.length != 0) {
            var thisNode = this.open.shift();
      
            if (thisNode.x == this.endX && thisNode.y == this.endY) {
              this.open.push(thisNode);
              return this.sumPath(thisNode);
            } else {
              thisNode.closed = true;
              this.closed.push(thisNode);
              this.checkNeighbor(thisNode.x + 1, thisNode.y, thisNode, isBox);
              this.checkNeighbor(thisNode.x - 1, thisNode.y, thisNode, isBox);
              this.checkNeighbor(thisNode.x, thisNode.y + 1, thisNode, isBox);
              this.checkNeighbor(thisNode.x, thisNode.y - 1, thisNode, isBox);
            }
          }
          console.log("no path found");
          return this.sumPath(thisNode);
        }
      
        //recreate the path starting from the last node
        sumPath(endNode) {
          var path = [];
          var cost = endNode.cost;
          while (endNode.parent != null) {
            path.unshift(endNode);
            endNode = endNode.parent;
          }
          this.resetNodes();
          return [path, cost]
        }
      
        //check a neighboring node
        checkNeighbor(x, y, parent, isBox) {
          if (checkBoundaries(this.nodes, x, y)) {
            var thisNode = this.nodes[x][y];
            if (!thisNode.closed && !thisNode.checked) {
              thisNode.cost = this.calculateCost(thisNode, parent, isBox);
              thisNode.f = thisNode.cost + Math.abs(x - this.endX) + Math.abs(y - this.endY);
              thisNode.parent = parent;
              thisNode.checked = true;
              addToSortedArray(this.open, thisNode, fComparer);
            }
            else if (!thisNode.closed) {
              var cost = this.calculateCost(thisNode, parent, isBox);
              if (cost < thisNode.cost && thisNode.parent.parent != null) {
                  thisNode.cost = cost;
                  thisNode.f = thisNode.cost + Math.abs(x - this.endX) + Math.abs(y - this.endY);
                  thisNode.parent = parent;
              }
            }
          }
        }
      
        //calculate the cost for a  node 
        calculateCost(node, parent, isBox) {
          var tempCost = 0;
          if (node.occupied)
            tempCost = parent.cost + boxCost;
          else {
            if (isBox)
              tempCost = (node.wall ? parent.cost + wallCost : parent.cost + pathCost);
            else
              tempCost = (node.wall ? parent.cost + wallCost : parent.cost + playerPathCost);
          }
          // if the path is calculated for a box, the player path also has to be included
          // the player has to walk around the box when changing directions
          // there are always 2 ways to walk around the box for each of the 8 situations:
          if (isBox && parent.parent != null) {
            var cost1 = 0;
            var cost2 = 0;
      
            if (node.x - 1 == parent.x && node.x - 2 != parent.parent.x) {
              //case 1: node is right of parent
              if (node.y - 1 == parent.parent.y) {
                //case 1.1: node is up right of parent.parent
                cost1 = this.nodeCost(node.x - 2, node.y) + this.nodeCost(node.x - 2, node.y - 1);
                cost2 = this.nodeCost(node.x, node.y - 1) + this.nodeCost(node.x, node.y + 1) + this.nodeCost(node.x - 1, node.y + 1) + this.nodeCost(node.x - 2, node.y + 1) + this.nodeCost(node.x - 2, node.y);
              }
              else {
                //case 1.2: node is down right of parent.parent
                cost1 = this.nodeCost(node.x - 2, node.y) + this.nodeCost(node.x - 2, node.y + 1);
                cost2 = this.nodeCost(node.x, node.y - 1) + this.nodeCost(node.x, node.y + 1) + this.nodeCost(node.x - 1, node.y - 1) + this.nodeCost(node.x - 2, node.y - 1) + this.nodeCost(node.x - 2, node.y);
              }
            }
            else if (node.x + 1 == parent.x && node.x + 2 != parent.parent.x) {
              //case 2: node is left of parent
              if (node.y - 1 == parent.parent.y) {
                //case 2.1: node is up left of parent.parent
                cost1 = this.nodeCost(node.x + 2, node.y) + this.nodeCost(node.x + 2, node.y - 1);
                cost2 = this.nodeCost(node.x, node.y - 1) + this.nodeCost(node.x, node.y + 1) + this.nodeCost(node.x + 1, node.y + 1) + this.nodeCost(node.x + 2, node.y + 1) + this.nodeCost(node.x + 2, node.y);
              } else {
                //case 2.2: node is down left of parent.parent
                cost1 = this.nodeCost(node.x + 2, node.y) + this.nodeCost(node.x + 2, node.y + 1);
                cost2 = this.nodeCost(node.x, node.y - 1) + this.nodeCost(node.x, node.y + 1) + this.nodeCost(node.x + 1, node.y - 1) + this.nodeCost(node.x + 2, node.y - 1) + this.nodeCost(node.x + 2, node.y);
              }
            } else if (node.y - 1 == parent.y && node.y - 2 != parent.parent.y) {
              //case 3: node is above parent
              if (node.x - 1 == parent.parent.x) {
                //case 3.1: node is right up of parent.parent  
                var cost1 = this.nodeCost(node.x, node.y - 2) + this.nodeCost(node.x - 1, node.y - 2);
                var cost2 = this.nodeCost(node.x - 1, node.y) + this.nodeCost(node.x + 1, node.y) + this.nodeCost(node.x + 1, node.y - 1) + this.nodeCost(node.x + 1, node.y - 2) + this.nodeCost(node.x, node.y - 2);
              } else {
                //case 3.2: node is left up of parent.parent  
                var cost1 = this.nodeCost(node.x, node.y - 2) + this.nodeCost(node.x + 1, node.y - 2);
                var cost2 = this.nodeCost(node.x - 1, node.y) + this.nodeCost(node.x + 1, node.y) + this.nodeCost(node.x - 1, node.y - 1) + this.nodeCost(node.x - 1, node.y - 2) + this.nodeCost(node.x, node.y - 2);
              }
            } else if (node.y + 1 == parent.y && node.y + 2 != parent.parent.y) {
              //case 4: node is under parent
              if (node.x - 1 == parent.parent.x) {
                //case 4.1: node is right down of parent.parent
                var cost1 = this.nodeCost(node.x, node.y + 2) + this.nodeCost(node.x - 1, node.y + 2);
                var cost2 = this.nodeCost(node.x - 1, node.y) + this.nodeCost(node.x + 1, node.y) + this.nodeCost(node.x + 1, node.y + 1) + this.nodeCost(node.x + 1, node.y + 2) + this.nodeCost(node.x, node.y + 2);
              } else {
                //case 4.2: node is left down of parent.parent
                var cost1 = this.nodeCost(node.x, node.y + 2) + this.nodeCost(node.x + 1, node.y + 2);
                var cost2 = this.nodeCost(node.x - 1, node.y) + this.nodeCost(node.x + 1, node.y) + this.nodeCost(node.x - 1, node.y + 1) + this.nodeCost(node.x - 1, node.y + 2) + this.nodeCost(node.x, node.y + 2);
              }
            }
            tempCost += (cost1 < cost2 ? cost1 : cost2);
          }
          else if (isBox) {
            if (node.x - 1 == parent.x)
              tempCost += this.nodeCost(node.x - 2, node.y);
            else if (node.x + 1 == parent.x)
              tempCost += this.nodeCost(node.x + 2, node.y);
            else if (node.y - 1 == parent.y)
              tempCost += this.nodeCost(node.x, node.y - 2);
            else if (node.y + 1 == parent.y)
              tempCost += this.nodeCost(node.x, node.y + 2);
          }
      
          //for optimizing prefer used nodes
          if (node.used)
            tempCost -= 5;
          return tempCost;
        }
      
        //calculate the cost of a position
        nodeCost(x, y) {
          if (!checkBoundaries(this.nodes, x, y)) 
            return boxCost;
          var node = this.nodes[x][y];
          if (node.occupied)
            return boxCost;
          else
            return (node.wall ? wallCost : playerPathCost);
        }
      
        //reset the level's nodes for further pathfinding
        resetNodes() {
          this.open.forEach(function(node) {
            node.checked = false;
            node.closed = false;
            node.parent = null;
            node.cost = 0;
          });
          this.closed.forEach(function(node) {
            node.checked = false;
            node.closed = false;
            node.parent = null;
            node.cost = 0;
          });
        }
      }
      
      //generates the paths between boxes and buttons in a level by removing walls
      function generatePaths(lvl) {
        var steps = 0;
        //create ghostBoxes for solving
        var ghostBoxes = copyBoxes(lvl, false);
        //push the ghostBoxes towards the buttons
        while (lvl.solveCounter > 0) {
          //calculate the paths from all boxes to their buttons
          var boxPaths = CalcualteBoxPaths(lvl, ghostBoxes);
      
          //calculate the player paths to all boxes and choose the lowest cost path
          var playerPaths = CalcualtePlayerPaths(lvl, ghostBoxes, boxPaths);
          var bestPath = playerPaths[1];
          var playerPath = playerPaths[0][bestPath][0];
          var boxPath = boxPaths[bestPath][0];
      
          //remove all walls on the player's path
          for (var i = 0; i < playerPath.length; i++) {
            playerPath[i].wall = false;
            if (playerPath[i].occupied)
              lvl.trash = true;
          }
          //push the box into the solving direction
          var thisbox = ghostBoxes[bestPath];
          var currentNode = boxPath[0];
          var diffX = currentNode.x - thisbox.x;
          var diffY = currentNode.y - thisbox.y;
          var stop = 0;
      
          //if the box-path is longer than 1, push until there is a turn
          for (var i = 1; i < boxPath.length; i++) {
            var nextNode = boxPath[i];
            if (diffX == nextNode.x - currentNode.x && diffY == nextNode.y - currentNode.y)
              currentNode = nextNode;
            else {
              stop = i - 1;
              break;
            }
          }
      
          //remove all walls on the box's path
          for (var i = 0; i <= stop; i++)
            boxPath[i].wall = false;
          
          //set new player and box positions
          lvl.nodes[thisbox.x][thisbox.y].occupied = false;
          thisbox.setPosition(boxPath[stop].x, boxPath[stop].y)
          lvl.nodes[thisbox.x][thisbox.y].occupied = true;
          lvl.setPlayerPos(thisbox.x - diffX, thisbox.y - diffY)
      
          //check if the moved box is on the button
          if (thisbox.x == thisbox.solveButton.x && thisbox.y == thisbox.solveButton.y) {
            thisbox.placed = true;
            lvl.solveCounter--;
            ghostBoxes.splice(bestPath, 1);
          }
          steps++;
          if (steps > 4000) {
            lvl.trash = true;
            break;
          }
        }
        //reset player position
        lvl.setPlayerPos(lvl.playerstartX, lvl.playerstartY);
      }
      
      function copyBoxes(lvl, used) {
        var newBoxes = [];
        for (var i = 0; i < lvl.boxes.length; i++) {
          newBoxes.push(new Box(lvl.boxes[i].x, lvl.boxes[i].y, lvl.boxes[i].solveButton));
          lvl.nodes[lvl.boxes[i].x][lvl.boxes[i].y].occupied = true;
          lvl.nodes[lvl.boxes[i].x][lvl.boxes[i].y].used = used;
        }
        return newBoxes;
      }
      
      //calculate all boxpaths and return them in an array
      function CalcualteBoxPaths(lvl, ghostBoxes) {
        var boxPaths = [];
        for (var i = 0; i < ghostBoxes.length; i++) {
          var thisbox = ghostBoxes[i];
          lvl.nodes[thisbox.x][thisbox.y].occupied = false;
          var solver = new Pathfinder(lvl, thisbox.x, thisbox.y, thisbox.solveButton.x, thisbox.solveButton.y)
          boxPaths.push(solver.returnPath(true));
          lvl.nodes[thisbox.x][thisbox.y].occupied = true;
        }
        return boxPaths;
      }
      
      //return all player paths and the index of the lowest cost one
      function CalcualtePlayerPaths(lvl, ghostBoxes, boxPaths) {
        var playerPaths = [];
        var bestPath = -1;
        var lowestCost = 100000000;
        for (var i = 0; i < ghostBoxes.length; i++) {
          var newX = ghostBoxes[i].x;
          var newY = ghostBoxes[i].y;
          if (boxPaths[i][0][0].x == ghostBoxes[i].x + 1)
            newX -= 1;
          else if (boxPaths[i][0][0].x == ghostBoxes[i].x - 1)
            newX += 1;
          else if (boxPaths[i][0][0].y == ghostBoxes[i].y + 1)
            newY -= 1;
          else
            newY += 1;
          var solver = new Pathfinder(lvl, lvl.playerX, lvl.playerY, newX, newY);
          playerPaths.push(solver.returnPath(false));
          if (playerPaths[i][1] < lowestCost) {
            lowestCost = playerPaths[i][1];
            bestPath = i;
          }
        }
        return ([playerPaths, bestPath]);
      
      }
      
      // optimize the level by solving it in different ways and removing unnecessary free spots
      // repeatably optimizing yields different results, since there is a randomness to the algorithm
      
      const optPathCost = 4; //optimizer box path cost
      const optPlayerCost = 4; //optimizer player path cost
      
      function optimizeLvl(lvl, iterations) {
      
        var maxUnnecessary = [];
        var minDestroyWall = [];
        var bestPath = 0;
        var steps = 0;
        lvl.playerX = lvl.playerstartX;
        lvl.playerY = lvl.playerstartY;
      
        //make the playerpathcost positive
        var tempPlayerCost = playerPathCost;
        playerPathCost = optPlayerCost;
        //free the button positions
        for (var j = 0; j < lvl.buttons.length; j++) {
          lvl.nodes[lvl.buttons[j].x][lvl.buttons[j].y].occupied = false;
          lvl.nodes[lvl.buttons[j].x][lvl.buttons[j].y].used = true;
        }
      
        //solve the level randomly and check if nodes weren't visited
        for (var n = 0; n < iterations; n++) {
      
          //create ghostBoxes for solving
          var ghostBoxes = copyBoxes(lvl, true);
      
          //solve the level
          var solveCounter = ghostBoxes.length;
          var destroyWall = [];
          var trash = false;
          while (solveCounter > 0) {
            //randomly set pathcost for the boxes to negative in order to simulate nondirectional pushing of the boxes
            var tempCost = pathCost;
            pathCost = randomInt(-2, optPathCost);
      
            //calculate the paths from all boxes to their buttons
            var boxPaths = CalcualteBoxPaths(lvl, ghostBoxes);
            pathCost = tempCost;
      
            //calculate the player paths to all boxes and choose a RANDOM free path
            var playerPaths = CalcualtePlayerPaths(lvl, ghostBoxes, boxPaths)[0];
            var bestPath = randomInt(0, playerPaths.length);
            var playerPath = playerPaths[bestPath][0];
            var boxPath = boxPaths[bestPath][0];
      
            // mark all nodes, that the player visited
            for (var i = 0; i < playerPath.length; i++) {
              playerPath[i].used = true;
              if (playerPath[i].wall)
                destroyWall.push(playerPath[i]);
            }
      
            //push the box into the solving direction until there is a turn
            var thisBox = ghostBoxes[bestPath];
            var currentNode = boxPath[0];
            var diffX = currentNode.x - thisBox.x;
            var diffY = currentNode.y - thisBox.y;
      
            //if the path is longer than 1, check for a turn
            var stop = 0;
            for (var i = 1; i < boxPath.length; i++) {
              var nextNode = boxPath[i];
              if (true == false && diffX == nextNode.x - currentNode.x && diffY == nextNode.y - currentNode.y)
                currentNode = nextNode;
              else {
                stop = i - 1;
                break;
              }
            }
      
            //mark nodes on the box's path
            for (var i = 0; i <= stop; i++) {
              boxPath[i].used = true;
              if (boxPath[i].wall)
                destroyWall.push(boxPath[i]);
            }
      
            //set and mark new player and box positions
            lvl.nodes[thisBox.x][thisBox.y].occupied = false;
            thisBox.setPosition(boxPath[stop].x, boxPath[stop].y);
            lvl.nodes[thisBox.x][thisBox.y].occupied = true;
            lvl.setPlayerPos(thisBox.x - diffX, thisBox.y - diffY);
      
      
            //check if the moved box is on the button
            if (thisBox.x == thisBox.solveButton.x && thisBox.y == thisBox.solveButton.y) {
              thisBox.placed = true;
              solveCounter--;
              ghostBoxes.splice(bestPath, 1);
            }
            steps++;
            if (steps > 10000) {
              trash = true;
              break;
            }
          }
      
          //reset player position
          lvl.setPlayerPos(lvl.playerstartX, lvl.playerstartY)
          lvl.nodes[lvl.playerX][lvl.playerY].used = true;
      
          //check if a node is unnecessary;
          var unnecessary = [];
          for (var i = 0; i < lvl.nodes.length; i++)
            for (var j = 0; j < lvl.nodes[0].length; j++) {
              if (!lvl.nodes[i][j].wall && !lvl.nodes[i][j].used)
                unnecessary.push(lvl.nodes[i][j]);
              lvl.nodes[i][j].used = false;
              lvl.nodes[i][j].occupied = false;
            }
          if (!trash && unnecessary.length - destroyWall.length > maxUnnecessary.length - minDestroyWall.length) {
            maxUnnecessary = unnecessary;
            minDestroyWall = destroyWall;
            per = n;
          }
        }
      
        //remove the unnecessary free spaces
        for (var i = 0; i < maxUnnecessary.length; i++)
          maxUnnecessary[i].wall = true;
        for (var i = 0; i < minDestroyWall.length; i++)
          minDestroyWall[i].wall = false;
        playerPathCost = tempPlayerCost;
        console.log(String(maxUnnecessary.length) + " walls added, " + String(minDestroyWall.length) + " walls removed")
      }
      
      // optimize the level for all possible button-to-box combinations
      // this algorithm scales with n!, it should only be used with a low number of boxes
      function optimizeLvl2(lvl, iterations) {
        var boxPermutations = findPermutations(lvl.boxes, lvl.buttons);
        var tempBoxes = copyBoxes(lvl, false);
      
        for (var i = 0; i < boxPermutations.length; i++) {
          var thisPermutation = boxPermutations[i];
          for (var j = 0; j < thisPermutation.length; j++)
            lvl.boxes[j] = new Box(thisPermutation[j][0].x, thisPermutation[j][0].y, thisPermutation[j][1])
          optimizeLvl(lvl, iterations);
        }
        lvl.boxes = tempBoxes;
      }
      
      function lowCost(value) {
        return value[1] < 50;
      }
      
      //generate random level
      function generateLevel(w, h, numBoxes, optimizeIterations) {
      	if (!w)
      		w = randomInt(7, 16);
      	if (w<7)
      		w = 7;
      	else if (w>15)
      		w = 15;
      	if (!h)
      		h = randomInt(7, 16);
      	if (h<7)
      		h = 7;
      	else if (h>15)
      		h = 15;
      	var minBoxes = Math.floor((w+h-6)/4);
      	var maxBoxes = Math.floor(((w-4)*(h-4)-2)/2);
      	if (!numBoxes)
      		numBoxes = randomInt(minBoxes, maxBoxes);
      	if (numBoxes<minBoxes)
      		numBoxes = minBoxes;
          if (numBoxes>maxBoxes)
            numBoxes = maxBoxes;
      	if (optimizeIterations==null)
      		optimizeIterations = randomInt(-1000, 50000/(w*h));
      	var currentLvl;
      	do{
      		currentLvl = new Level(w, h, numBoxes);
      		//randomly remove walls from the level
      		currentLvl.rip(randomInt(-2, 5));
      		//generate level
      		generatePaths(currentLvl);
      	} while(currentLvl.trash);
      	if (numBoxes<5)
      		optimizeLvl2(currentLvl, optimizeIterations);
      	else
      		optimizeLvl(currentLvl, optimizeIterations);
      	var arr = [];
      	for (var i=0;i<h;i++)
      		arr[i] = [];
      	currentLvl.nodes.forEach((col)=>{
      		col.forEach((cell)=>{
      			arr[cell.y][cell.x] = cell.wall ? 1 : (cell.hasBox ? 2 : 0);
      		});
      	});
      	currentLvl.buttons.forEach((button)=>{
      		arr[button.y][button.x] = (arr[button.y][button.x]==0) ? 3 : 4;
      	});
      	arr[currentLvl.playerstartY][currentLvl.playerstartX] = (arr[currentLvl.playerstartY][currentLvl.playerstartX]==0) ? 5 : 6;
      	return {
      		w: w,
      		h: h,
      		arr: arr
      	};
      }
      this.onmessage = function(msg){
        if (msg.data=="1")
          postMessage(generateLevel());
      }
    `], { type: "text/javascript" })));
    worker.onmessage = (msg)=>{
      if (!workerPromise || !workerPromiseResolve)
        return;
      workerPromiseResolve(optimizeForHaxball(msg.data));
      workerPromise = null;
      workerPromiseResolve = null;
    };
    setTimeout(nextStadium, 1000);
    /*
    fetch(downloadLink).then((x)=>{
      x.text().then((t)=>{
        var conversion = {" ": 0, "X": 1, "*": 2, ".": 3, "&": 4, "@": 5};
        maps = t.split("*************************************\n").filter((y)=>y.length>0).map((y)=>{
          var arr = y.split("\n").filter((z, i)=>((i==2 || i==3 || i>=6) && (z?.length>0)));
          var w = parseInt(arr[0].substring(arr[0].indexOf(": ")+2));
          var h = parseInt(arr[1].substring(arr[1].indexOf(": ")+2));
          var a = [];
          for (var i=0;i<h;i++){
            var row = arr[i+2], row2 = Array(w).fill(0);
            for (var j=0;j<row.length;j++)
              row2[j] = conversion[row.charAt(j)];
            a.push(row2);
          }
          return {
            w: w,
            h: h,
            tiles: a
          };
        });
        nextStadium();
      });
    });
    */
  };

  this.finalize = function(){
    worker?.terminate();
    worker = null;
    workerPromise = null;
    workerPromiseResolve = null;
    that.room.librariesMap?.commands?.remove("skip");
    that.room.librariesMap?.permissions?.removeContext(permissionCtx);
    permissionCtx = null;
    permissionIds = null;
  };
  
  this.onGameStart = function(){
    resetState();
    setTimeout(updatePlayerDiscs, 100);
  };

  this.onPlayerTeamChange = function(id, teamId, byId){
    updatePlayerDiscs();
  };

  this.onAutoTeams = function(pid1, tid1, pid2, tid2, byId){
    updatePlayerDiscs();
  };

  this.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){
    if (type==OperationType.StartGame)
      return (mapProps!=null && workerPromise==null);
    if (type!=OperationType.SendInput || !gameState)
      return true;
    var p = that.room.players.find((x)=>x.id==msg.byId), d = p?.disc;
    if (!d)
      return true;
    var ix = d.pos.x/boxSize+(mapProps.w-1)/2, iy = d.pos.y/boxSize+(mapProps.h-1)/2;
    switch(msg.input){
      case 1://up
      case 2://down
      case 4://left
      case 8://right
        var {dirX, dirY} = Utils.reverseKeyState(msg.input);
        var tt = gameState[iy+dirY][ix+dirX];
        if (tt){
          var {tile, discIds} = tt;
          if (tile==1 || tile==8) // wall
            return false;
          if (tile==2 || tile==4){
            var tt2 = gameState[iy+2*dirY][ix+2*dirX];
            if (!tt2 || tt2.tile==1 || tt2.tile==8 || tt2.tile==2 || tt2.tile==4)
              return false;
            if (tile==2 && tt2.tile==0){
              tt.tile = 0;
              tt2.tile = 2;
              var discId = discIds.pop();
              tt2.discIds.push(discId);
              that.room.setDiscProperties(discId, {
                x: (ix+2*dirX+0.5-mapProps.w/2)*boxSize,
                y: (iy+2*dirY+0.5-mapProps.h/2)*boxSize
              });
            }
            else if (tile==2 && tt2.tile==3){
              tt.tile = 0;
              tt2.tile = 4;
              var discId = discIds.pop();
              tt2.discIds.push(discId);
              that.room.setDiscProperties(discId, {
                x: NaN,
                y: NaN
              });
              var {color, radius} = tileProperties[tt2.tile];
              that.room.setDiscProperties(tt2.discIds[0], {
                color: parseInt(color, 16),
                radius: radius
              });
              checkEndGame(p);
            }
            else if (tile==4 && tt2.tile==0){
              tt.tile = 3;
              tt2.tile = 2;
              var discId = discIds.pop();
              tt2.discIds.push(discId);
              var {color, radius} = tileProperties[tt2.tile];
              that.room.setDiscProperties(discId, {
                x: (ix+2*dirX+0.5-mapProps.w/2)*boxSize,
                y: (iy+2*dirY+0.5-mapProps.h/2)*boxSize,
                color: parseInt(color, 16),
                radius: radius
              });
              var {color, radius} = tileProperties[tt.tile];
              that.room.setDiscProperties(discIds[0], {
                x: (ix+dirX+0.5-mapProps.w/2)*boxSize,
                y: (iy+dirY+0.5-mapProps.h/2)*boxSize,
                color: parseInt(color, 16),
                radius: radius
              });
            }
            else if (tile==4 && tt2.tile==3){
              tt.tile = 3;
              tt2.tile = 4;
              var discId = discIds.pop();
              tt2.discIds.push(discId);
              var {color, radius} = tileProperties[tt2.tile];
              that.room.setDiscProperties(discId, {
                x: (ix+2*dirX+0.5-mapProps.w/2)*boxSize,
                y: (iy+2*dirY+0.5-mapProps.h/2)*boxSize,
                color: parseInt(color, 16),
                radius: radius
              });
              var {color, radius} = tileProperties[tt.tile];
              that.room.setDiscProperties(discIds[0], {
                x: (ix+dirX+0.5-mapProps.w/2)*boxSize,
                y: (iy+dirY+0.5-mapProps.h/2)*boxSize,
                color: parseInt(color, 16),
                radius: radius
              });
            }
          }
        }
        that.room.setPlayerDiscProperties(p.id, {
          x: d.pos.x+dirX*boxSize,
          y: d.pos.y+dirY*boxSize
        });
        break;
      case 16://kick
        break;
    }
    return false;
  };
};
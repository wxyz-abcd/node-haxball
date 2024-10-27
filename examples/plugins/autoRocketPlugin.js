module.exports = function (API) {
    const {
        OperationType,
        VariableType,
        ConnectionState,
        AllowFlags,
        Direction,
        CollisionFlags,
        CameraFollow,
        BackgroundType,
        GamePlayState,
        Callback,
        Utils,
        Room,
        Replay,
        Query,
        Library,
        RoomConfig,
        Plugin,
        Renderer,
        Errors,
        Language,
        Impl
    } = API;

    Object.setPrototypeOf(this, Plugin.prototype);
    Plugin.call(this, "Rocket Mode", true, {
        version: "0.1",
        author: "Luks",
        description: `Auto rocket mode / Manual rocket mode`,
        allowFlags: AllowFlags.JoinRoom | AllowFlags.CreateRoom
    });


    this.defineVariable({
        name: "autoRocketEnabled",
        description: "Player will try to auto rocket",
        type: VariableType.Boolean,
        value: false,
    });

    this.defineVariable({
        name: "rocketKey",
        description: "Key to auto rocket yourself",
        type: VariableType.Keys,
        value: ["KeyC"],
    });

    this.defineVariable({
        name: "checkFPS",
        description: "FPS to run distance checks",
        type: VariableType.Number,
        value: 60,
        range: {
            min: 5,
            step: 5
        }
    });

    this.defineVariable({
        name: "wallKickDistance",
        description: "How far from wall to kick ball",
        type: VariableType.Number,
        value: 35,
        range: {
            min: 0,
            step: 5
        }
    });

    this.defineVariable({
        name: "kickThreshold",
        description: "How close is ball to player to kick",
        type: VariableType.Number,
        value: 15,
        range: {
            min: 0,
            step: 1
        }
    });

    this.defineVariable({
        name: "firstKickInterval",
        description: "How much time to pass in MS before kicking for the first time",
        type: VariableType.Number,
        value: 5,
        range: {
            min: 0,
            step: 5
        }
    });

    this.defineVariable({
        name: "secondKickInterval",
        description: "How much time to pass in MS before kicking second time",
        type: VariableType.Number,
        value: 115,
        range: {
            min: 0,
            step: 5
        }
    });

    var that = this;
    let fps = that.checkFPS;
    let interval = 1000 / fps;
    let lastTime = Date.now();
    let deltaTime = 0;
    let gameLoopInterval = setInterval(gameLoop, interval);
    let kicked = false;
    function gameLoop() {
        const now = Date.now();
        deltaTime = now - lastTime;

        if (deltaTime >= interval) {
            update();
            lastTime = now - (deltaTime % interval);
        }
    }

// Function to calculate the distance from a point to a line segment
function distanceToSegment(point, segA, segB) {
    const x = point.x;
    const y = point.y;
    const x1 = segA.x;
    const y1 = segA.y;
    const x2 = segB.x;
    const y2 = segB.y;

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const param = lenSq !== 0 ? dot / lenSq : -1;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

// Function to calculate the distance between two points
function distanceBetweenPoints(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Function to check if the player can kick the ball
function canPlayerKickBall(playerDisc, ballDisc, kickThreshold) {
    const distance = distanceBetweenPoints(playerDisc.pos, ballDisc.pos);
    const combinedRadius = playerDisc.radius + ballDisc.radius;
    return distance <= combinedRadius + kickThreshold;
}

// Function to calculate the distance from a point to a plane
function distanceToPlane(point, planeNormal, planeDistance) {
    // Distance from the point to the plane
    return planeNormal.x * point.x + planeNormal.y * point.y - planeDistance;
}

// Function to calculate the distance before the ball collides with the plane
function distanceToPlaneWithBall(ballPos, ballRadius, planeNormal, planeDistance) {
    const distanceToPlaneLine = distanceToPlane(ballPos, planeNormal, planeDistance);
    const collisionDistance = Math.abs(distanceToPlaneLine) - ballRadius;
    return Math.max(collisionDistance, 0);
}

function update() {
    if(!that.active) return
    if(!that.autoRocketEnabled) return
    if(!that.room) return;
    const physicsState = that.room.state?.gameState?.physicsState;
    if (!physicsState) return;
    const ball = physicsState.discs[0];
    const ballPosition = ball.pos;
    const ballRadius = ball.radius;
    const ballCmask = ball.cMask;
    const ballCgroup = ball.cGroup;

    let closestObject = null;
    let minDistance = Infinity;
    let collidableObjectCount = 0;

    // Check for segments
    for (let i = 0; i < physicsState.segments.length; i++) {
        const segment = physicsState.segments[i];
        const pos1 = segment.v0.pos;
        const pos2 = segment.v1.pos;
        const segmentCmask = segment.cMask;
        const segmentCgroup = segment.cGroup;

        const canCollide = (ballCgroup & segmentCmask) !== 0 && (segmentCgroup & ballCmask) !== 0;

        if (!canCollide) {
            continue;
        }

        collidableObjectCount++;

        // Calculate the distance to the segment
        const distance = distanceToSegment(ballPosition, pos1, pos2);

        if (distance < minDistance) {
            minDistance = distance;
            closestObject = { type: 'segment', object: segment };
        }
    }

    // Check for planes
    for (let i = 0; i < physicsState.planes.length; i++) {
        const plane = physicsState.planes[i];
        const planeNormal = plane.normal; // The normal vector of the plane
        const planeDistance = plane.dist; // The distance from the origin to the plane
        const planeCmask = plane.cMask;
        const planeCgroup = plane.cGroup;
        const canCollide = (ballCgroup & planeCmask) !== 0 && (planeCgroup & ballCmask) !== 0;

        if (!canCollide) {
            continue;
        }

        collidableObjectCount++;

        // Calculate the distance to the plane
        const distance = distanceToPlaneWithBall(ballPosition, ballRadius, planeNormal, planeDistance);

        if (distance < minDistance) {
            minDistance = distance;
            closestObject = { type: 'plane', object: plane };
        }
    }

    if (closestObject) {
        if (minDistance < that.wallKickDistance) {
            const playerDisc = that.room.currentPlayer.disc;
            if (playerDisc) {
                const kickThreshold = that.kickThreshold;
                if (canPlayerKickBall(playerDisc, ball, kickThreshold) && !kicked) doubleKick();
            }
        }
    }
}

function retrieveState() {
    return Utils.reverseKeyState(that.room.getKeyState());
}



    function doubleKick() {
        if(kicked) return
        //kicked = true;
        setTimeout(function () {
            let state = retrieveState()
            const newState = Utils.keyState(state.dirX, state.dirY, true)
            that.room.setKeyState(newState)
        }, that.firstKickInterval);

        setTimeout(function () {
            let state = retrieveState()
            const newState = Utils.keyState(state.dirX, state.dirY, true)
            that.room.setKeyState(newState)
            kicked = false
        }, that.secondKickInterval);
    }
    this.onKeyDown = function(e){
      if(!that.active) return
      if(that.rocketKey.length == 0) return
      if(that.rocketKey.includes(e.code)) doubleKick()
    }
    this.finalize = () => {
        that = null;
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
    };

    this.onVariableValueChange = (addonObject, variableName, oldValue, newValue) => {
        if (addonObject == that && variableName == "checkFPS") {
            clearInterval(gameLoopInterval);
            gameLoopInterval = null;
            let fps = newValue;
            let interval = 1000 / fps;
            gameLoopInterval = setInterval(gameLoop, interval);
        }
        
    };

}
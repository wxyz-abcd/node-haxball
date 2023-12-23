module.exports = function (API) {
    const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API;

    Object.setPrototypeOf(this, Plugin.prototype);
    Plugin.call(this, "CMD_gk", true, { // "CMD_gk" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
        version: "0.1",
        author: "JerryOldson",
        description: `This plugin lets us understand whether a player is goalkeeper or not.
      Available commands: 
      - !gk: Toggles your goalkeeper status.`,
        allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
    });

    this.defineVariable({
        name: "detectGoalkeeperInZone",
        description: "Whether to automatically detect the goalkeeper inside the goal area, and remove his goalkeeper status if he is no longer in the designated area.",
        type: VariableType.Boolean,
        value: true
    });

    var gks, minXBlue, minYBlue, maxXBlue, maxYBlue, minXRed, minYRed, maxXRed, maxYRed, that = this;


    this.initialize = function () {
        gks = { red: null, blue: null };
        const goals = that.room.stadium.goals;
        const width = that.room.stadium.width * 0.05;
        const height = that.room.stadium.height * 0.20;
        const halfWidth = that.room.stadium.width / 2;
        const halfHeight = that.room.stadium.height / 2;
        goals.forEach((goal) => {
            const { minX, minY, maxX, maxY } = calculateGoalCoords(goal, width, height, halfWidth, halfHeight);
            if (goal.team.name === "Red") {
                minXRed = minX;
                minYRed = minY;
                maxXRed = maxX;
                maxYRed = maxY;
            } else if (goal.team.name === "Blue") {
                minXBlue = minX;
                minYBlue = minY;
                maxXBlue = maxX;
                maxYBlue = maxY;
            }
        });

        that.room.librariesMap.commands?.add({
            name: "gk",
            parameters: [],
            minParameterCount: 0,
            helpText: "Makes you the goalkeeper of the team you are currently at.",
            callback: ({ }, byId) => {
                var P = that.room.players.find((x) => x.id == byId);
                var teamColor = P.team.id === 1 ? "red" : "blue";
                if (gks[teamColor] && gks[teamColor].id == byId) {
                    gks[teamColor] = null;
                    if (P)
                        that.room.librariesMap.commands?.announceAction(P.name + " is no longer the goalkeeper of the " + teamColor + " team");
                } else {
                    if (gks[teamColor]) {
                        that.room.librariesMap.commands?.announceAction("There is already a goalkeeper for the " + teamColor + " team");
                    } else {
                        gks[teamColor] = { id: byId, name: P.name, team: teamColor };
                        if (P)
                            that.room.librariesMap.commands?.announceAction(P.name + " is now the goalkeeper of the " + teamColor + " team");
                    }
                };
            }
        });
    };


    this.finalize = function () {
        that.room.librariesMap?.commands?.remove("gk");
        gks = null;
    };

    this.onPlayerLeave = function (playerObj, reason, isBanned, byId, customData) {
        var teamColor = playerObj.team.id === 1 ? "red" : "blue";
        if (gks[teamColor] && gks[teamColor].id == playerObj.id) {
            that.room.librariesMap.commands?.announceAction(gks[teamColor].name + " is no longer the goalkeeper of the " + teamColor + " team");
            gks[teamColor] = null;
        }
    };

    this.onStadiumChange = function (stadium, by) {
        const goals = that.room.stadium.goals;
        const width = that.room.stadium.width * 0.05;
        const height = that.room.stadium.height * 0.20;
        const halfWidth = that.room.stadium.width / 2;
        const halfHeight = that.room.stadium.height / 2;

        goals.forEach((goal) => {
            const { minX, minY, maxX, maxY } = calculateGoalCoords(goal, width, height, halfWidth, halfHeight);
            if (goal.team.name === "Red") {
                minXRed = minX;
                minYRed = minY;
                maxXRed = maxX;
                maxYRed = maxY;
            } else if (goal.team.name === "Blue") {
                minXBlue = minX;
                minYBlue = minY;
                maxXBlue = maxX;
                maxYBlue = maxY;
            }
        });
    };


    function checkIfPlayerInZone() {
        var gkRed = gks.red !== null ? that.room.getPlayer(gks.red.id).disc : null;
        var gkBlue = gks.blue !== null ? that.room.getPlayer(gks.blue.id).disc : null;

        var isInZoneRed = gkRed && gkRed.pos && (gkRed.pos.x <= minXRed) && (minYRed <= gkRed.pos.y && maxYRed >= gkRed.pos.y);
        var isInZoneBlue = gkBlue && gkBlue.pos && (gkBlue.pos.x >= maxXBlue) && (minYBlue <= gkBlue.pos.y && maxYBlue >= gkBlue.pos.y);

        return { isInZoneRed, isInZoneBlue };
    };

    this.onGameTick = function () {
        if (that.detectGoalkeeperInZone) {
            var { isInZoneRed, isInZoneBlue } = checkIfPlayerInZone();
            if (!isInZoneRed && gks.red) {
                that.room.librariesMap.commands?.announceAction(gks.red.name + " is no longer the goalkeeper of the " + gks.red.team + " team");
                gks.red = null;
            };
            if (!isInZoneBlue && gks.blue) {
                that.room.librariesMap.commands?.announceAction(gks.blue.name + " is no longer the goalkeeper of the " + gks.blue.team + " team");
                gks.blue = null;
            };
        };
    };

    const calculateGoalCoords = (goal, width, height, halfWidth, halfHeight) => {
        let minX = Math.max(Math.min(goal.p1.x, goal.p0.x) - width, -halfWidth);
        let minY = Math.max(Math.min(goal.p1.y, goal.p0.y) - height, -halfHeight);
        let maxX = Math.min(Math.max(goal.p1.x, goal.p0.x) + width, halfWidth);
        let maxY = Math.min(Math.max(goal.p1.y, goal.p0.y) + height, halfHeight);
        return { minX, minY, maxX, maxY };
    };
};
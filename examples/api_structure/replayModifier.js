// This is a demonstration of replay file modification using this API.
// This example is for node.js. If you want this to work for browser, you need to create a file selector instead of require("fs").

const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = require("node-haxball")();
const fs = require("fs");

// read the replay file.
var replayData = Replay.readAll(fs.readFileSync("replayfile.hbr2", null));

// remove all players whose id is not 28.
replayData.roomData.players = replayData.roomData.players.filter((x)=>x.id==28);

// remove the discs that belong to other players.
// the replay file must have the game initially started, otherwise roomData.gameState will become undefined.
replayData.roomData.gameState.physicsState.discs = replayData.roomData.gameState.physicsState.discs.filter((x)=>x.playerId==null || x.playerId==28);

// remove all the events that belong to other players and also remove all the events that are not input events.
replayData.events = replayData.events.filter((x)=>(x.byId==28 && x.eventType==OperationType.SendInput));

// since there is only one player left, make it the room owner.
replayData.roomData.players[0].id = 0;

// also update the player's disc to reflect the id change.
replayData.roomData.players[0].disc.playerId = 0;

// also update all the events to reflect the id change.
replayData.events.forEach((x)=>{x.byId = 0});

// write the modified replay file.
fs.writeFileSync("optimized_replayfile.hbr2", Replay.writeAll(replayData));

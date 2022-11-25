[![GitHub package.json version](https://img.shields.io/github/package-json/v/wxyz-abcd/node-haxball?style=flat-square)](https://github.com/wxyz-abcd/node-haxball) [![NPM Version](https://img.shields.io/npm/v/node-haxball?style=flat-square)](https://www.npmjs.com/package/node-haxball) [![NPM Monthly Downloads](https://img.shields.io/npm/dm/node-haxball?style=flat-square)](https://npmjs.org/package/node-haxball)

[![License](https://img.shields.io/github/license/wxyz-abcd/node-haxball?style=flat-square)](LICENSE) [![Last Commit](https://img.shields.io/github/last-commit/wxyz-abcd/node-haxball?style=flat-square)](https://github.com/wxyz-abcd/node-haxball/commits/) ![Language Most Used](https://img.shields.io/github/languages/top/wxyz-abcd/node-haxball?style=flat-square) [![Implementations](https://img.shields.io/badge/%F0%9F%92%A1-implementations-8C8E93.svg?style=flat-square)](https://github.com/wxyz-abcd/node-haxball/issues) ![Repository Size](https://img.shields.io/github/repo-size/wxyz-abcd/node-haxball?style=flat-square)

[![Forks](https://img.shields.io/github/forks/wxyz-abcd/node-haxball?style=social)](https://github.com/wxyz-abcd/node-haxball/network/members) [![Stars](https://img.shields.io/github/stars/wxyz-abcd/node-haxball?style=social)](https://github.com/wxyz-abcd/node-haxball/stargazers) [![Watches](https://img.shields.io/github/watchers/wxyz-abcd/node-haxball?style=social)](https://github.com/wxyz-abcd/node-haxball/watchers)

<h1 id="title" align="center">node-haxball</h1>

<h4 align="center">node-haxball is the most powerful and lightweight bot API written by abc as a node.js module that will include every possible hack and functionality that you can imagine as a Haxball(www.haxball.com) host/client. </h4>

### 🔖 Table Of Contents

- 🤔 [How To Use](#how-to-use)
- 🚀 [Technologies](#technologies)
- 🌱 [Minimal Requirements](#minimal-requirements)
- 🎊 [Features](#features)
- 🎊 [Mini-Documentation](#docs)
- 💡 [How To Contribute](#how-to-contribute)
- 🤗 [Contributors](#contributors)
- 👤 [Author](#author)
- 🔏 [License](#license)

---

<h2 id="how-to-use">🤔 How To Use</h2>

#### 💻 Installing

```sh
npm install node-haxball
```

#### 💻 Module Usage Example

Joining a room:

```js
const { Haxball } = require("node-haxball");

const client = new Haxball({
  player_name: "wxyz-abcd",
  avatar: "👽",
});

client.on("ready", () => {
  client.joinRoom({
    id: "Olnit_iGRWs"
  }).then((room) => {
    const { name } = room.getRoomData();
    room.sendChat("Hello " + name);
  });
});
```

Creating a room:

```js
const { Haxball } = require("node-haxball");

const client = new Haxball({
  player_name: "wxyz-abcd",
  avatar: "👽",
});

client.on("ready", () => {
  client.createRoom({
    name: "room123", 
    password: "password", 
    showInRoomList: true, 
    maxPlayerCount: 8,
    token: "thr1.AAAAAGNMOokNqt3forXs_Q.3qQMuLQOS9o"
  }).then((room) => {
    const { name } = room.getRoomData();
    room.sendChat("Hello " + name);
    room.onAfterRoomLink = (roomLink)=>{
      console.log("room link:", roomLink);
    };
  });
});
```

---

<h2 id="technologies">🚀 Technologies</h2>

- wrtc - WebRTC implementation for node.js
- ws - Websocket connection module for node.js
- JSON5 - JSON helper module for node.js
- @peculiar/webcrypto - Webcrypto implementation for node.js
- pako - ZLIB port for node.js
- xhr2 - XMLHttpRequest port for node.js
- perf_hooks - Web Performance API for node.js

[Back To The Top](#title)

---

<h2 id="minimal-requirements">🌱 Minimal Requirements</h2>

- NPM
- Node.js
- NW.js (for token generation sub-project)

[Back To The Top](#title)

---

<h2 id="features">🎊 Features</h2>

- [x] Event based
- [x] Asynchronous
- [x] Performant

[Back To The Top](#title)

---

<h2 id="docs">📰 Mini-Documentation</h2>

- Utils: Some static utility functions.

  - generateAuthKey(): generates a new player_auth_key. you should store it and use it later if you want to be recognized in Haxball rooms. (use it in Haxball _constructor_) (returns Promise(CryptoKeyPair))
  - getRoomList(): returns the current room list. (returns Promise(roomListArray))
  - keyState(dirX, dirY, kick): returns an integer keyState value to be used in Room.setKeyState. dirX = oneof\[-1:left, 0:still, 1:right\], dirY = oneof\[-1:up, 0:still, 1:down\], kick = true/false.

- Haxball: Main client class.

  - constructor(object): creates a new instance of Haxball client with storage values in parameter _object_ set accordingly. values for only these keys of _object_ will be used: \['show_indicators','player_name','fps_limit','player_auth_key','sound_chat','show_avatars','geo','geo_override','sound_crowd','sound_highlight','sound_main','extrapolation','avatar','resolution_scale','view_mode','player_keys','team_colors'\]. _render_ is a special key that is used mostly for rendering purposes. it may have values for these browser environment(window) function/variables: 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance', 'console', 'requestAnimationFrame', 'cancelAnimationFrame', 'crypto', 'renderer'. the functions(_setTimeout_, _clearTimeout_, _setInterval_, _clearInterval_, _requestAnimationFrame_, _cancelAnimationFrame_) should be binded to browser's _window_ object.

  - properties:
    - version: current version number. other clients cannot join the room created by this Haxball client if this version number is different than theirs.

  - functions:
    - value = getStorageValue(key): returns the current value of storage\[key\] where key must be one of \['show_indicators','player_name','fps_limit','player_auth_key','sound_chat','show_avatars','geo','geo_override','sound_crowd','sound_highlight','sound_main','extrapolation','avatar','resolution_scale','view_mode','player_keys','team_colors'\].
    - setStorageValue(key, value): sets storage\[key\]=(value) where key must be one of \['show_indicators','player_name','fps_limit','player_auth_key','sound_chat','show_avatars','geo','geo_override','sound_crowd','sound_highlight','sound_main','extrapolation','avatar','resolution_scale','view_mode','player_keys','team_colors'\].
    - createRoom({name, password, maxPlayerCount, showInRoomList, token, geo, playerCount, unlimitPlayerCount, fakePassword, kickTimeout, plugins}): create a room with given parameters. Must leave current room first. returns Promise(room) which is rejected if failed.
    - joinRoom({roomId, password, token, kickTimeout, plugins}): try to join the room(roomId) with given password(or null=no password). Must leave current room first. returns Promise(room) which is rejected if failed.
    - leaveRoom(): Leave current room. Must be in a room.
    - setRenderer(renderer): sets the renderer object that will render the game. The object should follow the provided Renderer template.
    - isCustomVersion(): returns whether the version number is the same as the original client. 
    - setCustomVersion(custom): if custom=true, sets the version number to a specific value(always using the same for recognition); otherwise sets it to the same as the original client. Set it to true if you want your room to be inaccessible to people using the original client.

  - internally used events: 
    - connectionStateChange(state): triggered several times while joining a room. use ConnectionState\[state\] for explanation on returned value.
    - joinRoomSucceeded(): triggered only once when join room succeeds and just before Room object is created and Promise is resolved.
    - createRoomSucceeded(): triggered only once when create room succeeds and just before Room object is created and Promise is resolved.
    - roomLeave(): triggered only once while leaving the room by any means.

  - other events:
    - joinRoomFailed(error): join room failed with error(error).
    - ready(): haxball api has just become ready to work.
    - roomJoin(room): joined/created room.
    - joinRoomReverse(): trying reverse connection while joining a room.
    - RequestRecaptcha(): recaptcha is required while joining or creating a room.

  - events to be triggered by user:
    - cancelJoinRoom(): trigger to cancel joining a room.
    - RecaptchaToken(token): trigger to send the recaptcha token after RequestRecaptcha event occurred. currently only working for creating a room. workaround: in order to send the token to try and join a recaptcha-protected room, cleanup old resources/handlers and use Haxball.joinRoom with the new token.

- Room: The class that hosts all room operations. Should only be initialized from inside the Haxball client class and retrieved from a resolved Promise resulting from either Haxball.createRoom or Haxball.joinRoom.

  - properties:
    - isHost: true for hosts, false for clients
    - client: a reference to the Haxball client object that created this Room object
    - currentPlayerId: current player's id
    - currentPlayer: the original current player object
    - sdp: current room's sdp value (only for client rooms)
    - kickTimeout: time between releasing and re-pressing the kick key (in milliseconds, defaults to 20)
    - plugins: array of all available plugins. this is used internally to restore the order of plugins while plugin activation/deactivation.
    - activePlugins: array of currently active plugins. this is used internally for callbacks.
    - pluginsMap: all available plugins mapped as pluginsMap\[plugin.name\] = plugin, for optimized use to communicate between plugins.

  - functions:
    - leave(): leaves the room.
    - setProperties({ name, password, geo: { lat, lon, flag }, playerCount, maxPlayerCount, fakePassword }): sets the room's properties.
    - setRecaptcha(on): sets the room's recaptcha mode. on: boolean
    - setKickRateLimit(min, rate, burst): sets the room's kick rate limit.
    - setHandicap(handicap): sets the player's handicap value in msecs.
    - setExtrapolation(extrapolation): sets the client's extrapolation value in msecs.
    - clearBans(): clears all bans. host-only.
    - setAvatar(avatar): sets the current player's avatar.
    - setChatIndicatorActive(active): sets the current player's chat indicator status.
    - setTeamColors(teamId, angle, ...colors): sets the team colors for (team). teamId: 1(red) | 2(blue), angle: integer, colors: maximum 4 parseable(hex-rgb) color parameters.
    - setUnlimitedPlayerCount(on): adds or removes player limit control. host-only. on: boolean
    - setFakePassword(fakePwd): sets a fake value for room's password status. host-only. fakePwd: boolean or null to disable
    - sendChat(msg, targetId): send chat message(msg) to player(targetId). targetId is null -> send to everyone. targetId is host-only.
    - sendAnnouncement(msg, targetId, color, style, sound): send announcement message(msg) to player(targetId) with properties(color, style, sound). targetId is null -> send to - everyone. host-only.
    - setDiscProperties(discId, properties): set disc(discId) properties. host-only.
    - setPlayerDiscProperties(playerId, properties): set player(playerId)'s disc properties. host-only.
    - sendCustomEvent(type, data): sends a CustomEvent(type, data) that can only be received by the users of this modified client.
    - getKeyState(): get current key state.
    - setKeyState(state): set current key state.
    - startGame(): start game.
    - stopGame(): stop game.
    - pauseGame(): toggle pause/resume game.
    - isGamePaused(): returns true if game is paused.
    - autoTeams(): remove last 2 players from spectators and add them to teams.
    - lockTeams(): toggle lock/unlock the ability to change teams.
    - resetTeams(): move everyone to spectators.
    - randTeams(): remove random 2 players from spectators and add them to teams.
    - resetTeam(teamId): move everyone on team(teamId) to spectators.
    - setSync(value): set synchronized status to value. host-only. value: boolean
    - getDefaultStadiums(): get default stadium array.
    - parseStadium(textDataFromHbsFile, onError): parse text as a stadium object and return it.
    - setCurrentStadium(stadium, onError): set current map(stadium).
    - setTimeLimit(value): set time limit(value).
    - setScoreLimit(value): set score limit(value).
    - changeTeam(teamId): set current player's team(teamId).
    - setPlayerTeam(playerId, teamId): set player(playerId)'s team to team(teamId).
    - setPlayerAdmin(playerId, isAdmin): set player(playerId)'s admin status to isAdmin.
    - kickPlayer(playerId, reason, isBanning): kick/ban a player(playerId) with reason(reason).
    - getPlayerOriginal(id): get original player data object for player(id).
    - getPlayer(id): get a new and structured player data object for player(id).
    - getPlayersOriginal(): get the original players array.
    - getPlayers(): get a new and structured players array.
    - getBallOriginal(extrapolated = true): get the original ball object.
    - getBall(extrapolated = true): get a new and structured ball object.
    - getDiscsOriginal(extrapolated = true): get the original disc object for disc(discId).
    - getDiscs(extrapolated = true): get a new and structured disc object for disc(discId).
    - getDiscOriginal(discId, extrapolated = true): get the original disc object for disc(discId).
    - getDisc(discId, extrapolated = true): get a new and structured disc object for disc(discId).
    - getPlayerDiscOriginal(playerId, extrapolated = true): get the original disc object for player(playerId).
    - getPlayerDisc(playerId, extrapolated = true): get a new and structured disc object for player(playerId).
    - getPlayerDiscOriginal_exp(playerId): get the original disc object for player(playerId). faster than getPlayerDiscOriginal, but experimental. use at your own risk.
    - getPlayerDisc_exp(playerId): get a new and structured disc object for player(playerId). faster than getPlayerDisc, but experimental. use at your own risk.
    - getRoomDataOriginal(): get the most important original objects that has the current room data.
    - getRoomData(extrapolated = true): get a new and structured room data object that has some of the current room data.
    - getCurrentMap(): get the original object of the current map.
    - mapChecksum(map): calculate checksum for given map object. returns null for original maps.
    - setPluginActive(name, active): activate/deactivate the plugin(name).
    - startRecording(): start recording replay data. returns true if succeeded, false otherwise. recording should not be started before calling this.
    - stopRecording(): stop recording replay data. returns UIntArray8 data if succeeded, null otherwise. recording should be started before calling this.
    - isRecording(): returns true if recording has started; false otherwise.
    - setRenderer(renderer): sets the renderer object that will render the game. The object should follow the provided Renderer template.
    
  - modifier callbacks:
    - \[dataArray, customData\] = modifyPlayerDataBefore(playerId, name, flag, avatar, conn, auth): set player's data just before player has joined the room. dataArray format should be \[modifiedNick, modifiedAvatar, modifiedFlag\]. if dataArray is null, player is not allowed to join. also prepares a custom data object to send to all plugins. customData=false means "don't call callbacks". host-only.
    - \[modifiedNick, modifiedAvatar, modifiedFlag\] = modifyPlayerDataAfter(playerId, name, flag, avatar, conn, auth, customData): set player's data just before player has joined the room. return null -> player is not allowed to join. host-only.
    - \[newPing, customData\] = modifyPlayerPingBefore(playerId, ping): prepares a custom data object to send to all plugins while setting player's ping. customData=false means "don't call callbacks". host-only.
    - newPing = modifyPlayerPingAfter(playerId, ping, customData): set player's ping. host-only.
    - newPing = modifyClientPing(ping): set current player's ping. client-only.
    - newFrameNo = modifyFrameNo(frameNo): look laggy to your opponents, especially on extrapolated clients. experimental, mostly causes "bad actor". client-only.
    - customData = onBeforeOperationReceived(obj, msg): the host callback that is called only once for each message received from clients, and its return value is passed as customData to onOperationReceived callback. this callback is useful for parsing chat messages and other stuff that you would like to do only once, before the room callback or any plugin callbacks are called. The default callback value is a function that parses a chat message and returns { isCommand: boolean, data: array of string } where isCommand = text.startsWith("!") and data = text.trimEnd().split(" "). 
    - acceptEvent = onAfterOperationReceived(obj, msg, customData): runs for each message received from clients. obj is the operation type object, msg is the original message, customData is the return value of callback onBeforeOperationReceived(obj, msg). onBeforeOperationReceived is called only once for each message, before all onOperationReceived callbacks of all plugins are called for the same message. you may modify msg's contents here as you wish. return true -> accept event, return false -> block message from being processed, throw exception -> break message sender player's connection. host-only.

  - callbacks:
    - customData = onBeforeXXXXXXX(...): \[where XXXXXXX is the name of the event.\] called before plugin callbacks. return a customData object to be used for each plugin.onXXXXXXX(..., customData) and then room.onAfterXXXXXXX(..., customData). return false to stop propagation. 
    - onAfterXXXXXXX(..., customData): \[where XXXXXXX is the name of the event.\] called after plugin callbacks. the last parameter, customData, is the data object that was returned from room.onBeforeXXXXXXX(...).
      - customData = onBeforeRoomLink(link): room link was received. host-only.
      - onAfterRoomLink(link, customData): room link was received. host-only.
      - customData = onBeforePlayerBallKick(playerId): ball was kicked by player(playerId).
      - onAfterPlayerBallKick(playerId, customData): ball was kicked by player(playerId).
      - customData = onBeforeTeamGoal(teamId): goal was scored by team(teamId).
      - onAfterTeamGoal(teamId, customData): goal was scored by team(teamId).
      - customData = onBeforeGameEnd(winningTeamId): game was won by team(winningTeamId).
      - onAfterGameEnd(winningTeamId, customData): game was won by team(winningTeamId).
      - customData = onBeforeGameTick(): runs on each game tick. (lots of times per second)
      - onAfterGameTick(customData): runs on each game tick. (lots of times per second)
      - customData = onBeforePlayerSyncChange(playerId, value): player(playerId)'s synchronized status has changed to (value).
      - onAfterPlayerSyncChange(playerId, value, customData): player(playerId)'s synchronized status has changed to (value).
      - customData = onBeforeAnnouncement(msg, color, style, sound): a message(msg) with properties(color, style, sound) was announced by the room host. may only be triggered by host.
      - onAfterAnnouncement(msg, color, style, sound, customData): a message(msg) with properties(color, style, sound) was announced by the room host. may only be triggered by host.
      - customData = onBeforeAutoTeams1(playerId, teamId, byId): "auto" button was used by player(byId) and it caused player(playerId) to join team(teamId).
      - onAfterAutoTeams1(playerId, teamId, byId, customData): "auto" button was used by player(byId) and it caused player(playerId) to join team(teamId).
      - customData = onBeforeAutoTeams2(playerId1, teamId1, playerId2, teamId2, byId): "auto" button was used by player(byId), it caused player(playerId1) to join team(teamId1) and player(playerId2) to join team(teamId2).
      - onAfterAutoTeams2(playerId1, teamId1, playerId2, teamId2, byId, customData): "auto" button was used by player(byId), it caused player(playerId1) to join team(teamId1) and player(playerId2) to join team(teamId2).
      - customData = onBeforeScoreLimitChange(value, byId): score limit was changed to (value) by player(byId).
      - onAfterScoreLimitChange(value, byId, customData): score limit was changed to (value) by player(byId).
      - customData = onBeforeTimeLimitChange(value, byId): time limit was changed to (value) by player(byId).
      - onAfterTimeLimitChange(value, byId, customData): time limit was changed to (value) by player(byId).
      - customData = onBeforePlayerAdminChange(id, isAdmin, byId): player(id)'s admin status was changed to (isAdmin) by player(byId).
      - onAfterPlayerAdminChange(id, isAdmin, byId, customData): player(id)'s admin status was changed to (isAdmin) by player(byId).
      - customData = onBeforePlayerAvatarChange(id, value): player(id) changed its avatar to (value).
      - onAfterPlayerAvatarChange(id, value, customData): player(id) changed its avatar to (value).
      - customData = onBeforePlayerTeamChange(id, teamId, byId): player(id) was moved to team(teamId) by player(byId).
      - onAfterPlayerTeamChange(id, teamId, byId, customData): player(id) was moved to team(teamId) by player(byId).
      - customData = onBeforeStadiumChange(stadium, byId): room's current stadium was set to (stadium) by player(byId).
      - onAfterStadiumChange(stadium, byId, customData): room's current stadium was set to (stadium) by player(byId).
      - customData = onBeforeTeamsLockChange(value, byId): room's team lock status was set to (value) by player(byId).
      - onAfterTeamsLockChange(value, byId, customData): room's team lock status was set to (value) by player(byId).
      - customData = onBeforePlayerJoin(playerObj): a player(playerObj) joined the room.
      - onAfterPlayerJoin(playerObj, customData): a player(playerObj) joined the room.
      - customData = onBeforeGamePauseChange(isPaused, byId): room's game paused status was set to (isPaused) by player(byId).
      - onAfterGamePauseChange(isPaused, byId, customData): room's game paused status was set to (isPaused) by player(byId).
      - customData = onBeforePlayerChat(id, message): a chat message with content(message) was received from player(id).
      - onAfterPlayerChat(id, message, customData): a chat message with content(message) was received from player(id).
      - customData = onBeforePlayerInputChange(id, value): player(id)'s input has changed to (value).
      - onAfterPlayerInputChange(id, value, customData): player(id)'s input has changed to (value).
      - customData = onBeforePlayerChatIndicatorChange(id, value): player(id)'s chat indicator status has changed to (value).
      - onAfterPlayerChatIndicatorChange(id, value, customData): player(id)'s chat indicator status has changed to (value).
      - customData = onBeforePlayerLeave(playerObj, reason, isBanned, byId): player(playerObj) has left the room, or was \[kicked or banned\](isBanned) by player(byId) with reason(reason).
      - onAfterPlayerLeave(playerObj, reason, isBanned, byId, customData): player(playerObj) has left the room, or was \[kicked or banned\](isBanned) by player(byId) with reason(reason).
      - customData = onBeforeSetDiscProperties(id, type, data1, data2): \[type=0: disc, type=1: player\](id)'s properties was set to (data1, data2). may only be triggered by host.
      - onAfterSetDiscProperties(id, type, data1, data2, customData): \[type=0: disc, type=1: player\](id)'s properties was set to (data1, data2). may only be triggered by host.
      - customData = onBeforeKickRateLimitChange(min, rate, burst, byId): room's kick rate limit was set to (min, rate, burst) by player(byId).
      - onAfterKickRateLimitChange(min, rate, burst, byId, customData): room's kick rate limit was set to (min, rate, burst) by player(byId).
      - customData = onBeforeGameStart(byId): game was started by player(byId).
      - onAfterGameStart(byId, customData): game was started by player(byId).
      - customData = onBeforeGameStop(byId): game was stopped by player(byId).
      - onAfterGameStop(byId, customData): game was stopped by player(byId).
      - customData = onBeforePingData(array): ping values for all players was received. may only be triggered by host.
      - onAfterPingData(array, customData): ping values for all players was received. may only be triggered by host.
      - customData = onBeforeExtrapolationChange(value): extrapolation was set to (value).
      - onAfterExtrapolationChange(value, customData): extrapolation was set to (value).
      - customData = onBeforeHandicapChange(value): handicap was set to (value).
      - onAfterHandicapChange(value, customData): handicap was set to (value).
      - customData = onBeforeBansClear(): all bans were cleared. host-only.
      - onAfterBansClear(customData): all bans were cleared. host-only.
      - customData = onBeforeRoomRecaptchaModeChange(on): room's recaptcha mode was set to (on). host-only.
      - onAfterRoomRecaptchaModeChange(on, customData): room's recaptcha mode was set to (on). host-only.
      - customData = onBeforeRoomPropertiesChange(props): room's properties(props) were changed. host-only.
      - onAfterRoomPropertiesChange(props, customData): room's properties(props) were changed. host-only.
      - customData = onBeforeCollisionDiscVsDisc(discId1, discPlayerId1, discId2, discPlayerId2): a collision happened between disc(discId1, playerId1) and disc(discId2, playerId2).
      - onAfterCollisionDiscVsDisc(discId1, discPlayerId1, discId2, discPlayerId2, customData): a collision happened between disc(discId1, playerId1) and disc(discId2, playerId2).
      - customData = onBeforeCollisionDiscVsSegment(discId, discPlayerId, segmentId): a collision happened between disc(discId, discPlayerId) and segment(segmentId).
      - onAfterCollisionDiscVsSegment(discId, discPlayerId, segmentId, customData): a collision happened between disc(discId, discPlayerId) and segment(segmentId).
      - customData = onBeforeCollisionDiscVsPlane(discId, discPlayerId, planeId): a collision happened between disc(discId, discPlayerId) and plane(planeId).
      - onAfterCollisionDiscVsPlane(discId, discPlayerId, planeId, customData): a collision happened between disc(discId, discPlayerId) and plane(planeId).
      - customData = onBeforeCustomEvent(type, data, byId): a custom event(type, data) was triggered by player(byId). custom-(host,client)s-only.
      - onAfterCustomEvent(type, data, byId, customData): a custom event(type, data) was triggered by player(byId). custom-(host,client)s-only.
    - onPluginActiveChange(plugin): a plugin was activated/deactivated.

- Plugin: A class that defines a plugin. Any plugin should be based on this class.

  - constructor(name, active): creates a new Plugin instance. A plugin is automatically activated just after initialization, while a Room object is being created, if active is true. 

  - properties:
    - name: name of the plugin. Must be unique, and is used internally in Room.setPluginActive. All Plugins can be accessed with their names via Room.pluginsMap\[name\].
    - active: activation status of the plugin. You should use Room.setPluginActive(name, active) if you want to modify this value manually.

  - modifier callbacks:
    - \[modifiedNick, modifiedAvatar, modifiedFlag\] = modifyPlayerData(playerId, name, flag, avatar, conn, auth, customData): set player's data just before player has joined the room. return null -> player is not allowed to join. customData is an optional data object returned from room.modifyPlayerDataBefore. host-only.
    - newPing = modifyPlayerPing(playerId, ping, customData): set player's ping. customData is an optional data object returned from room.modifyPlayerPingBefore. host-only.
    - acceptEvent = onOperationReceived(obj, msg, customData):  runs for each message received from clients. obj is the operation type object, msg is the original message. you may modify msg's contents here as you wish. customData is an optional data object returned from room.onBeforeOperationReceived. return true -> accept event, return false -> block message from being processed, throw exception -> break message sender player's connection. host-only.

  - callbacks:
    - initialize(room): only called once while creating or joining a room.
    - finalize(): only called once while leaving a room.
    - onActiveChanged(): plugin was activated or deactivated with Room.setPluginActive.
    - onXXXXXXX(..., customData): \[where XXXXXXX is the name of the event.\] called after room.onBeforeXXXXXXX(...) and before room.onAfterXXXXXXX(..., customData). customData is the object that might be returned from room.onBeforeXXXXXXX(...).
      - onRoomLink(link, customData): room link was received. host-only.
      - onPlayerBallKick(playerId, customData): ball was kicked by player(playerId).
      - onTeamGoal(teamId, customData): goal was scored by team(teamId).
      - onGameEnd(winningTeamId, customData): game was won by team(winningTeamId).
      - onGameTick(customData): runs on each game tick. (lots of times per second)
      - onPlayerSyncChange(playerId, value, customData): player(playerId)'s synchronized status has changed to (value).
      - onAnnouncement(msg, color, style, sound, customData): a message(msg) with properties(color, style, sound) was announced by the room host. may only be triggered by host.
      - onAutoTeams1(playerId, teamId, byId, customData): "auto" button was used by player(byId) and it caused player(playerId) to join team(teamId).
      - onAutoTeams2(playerId1, teamId1, playerId2, teamId2, byId, customData): "auto" button was used by player(byId), it caused player(playerId1) to join team(teamId1) and player(playerId2) to join team(teamId2).
      - onScoreLimitChange(value, byId, customData): score limit was changed to (value) by player(byId).
      - onTimeLimitChange(value, byId, customData): time limit was changed to (value) by player(byId).
      - onPlayerAdminChange(id, isAdmin, byId, customData): player(id)'s admin status was changed to (isAdmin) by player(byId).
      - onPlayerAvatarChange(id, value, customData): player(id) changed its avatar to (value).
      - onPlayerTeamChange(id, teamId, byId, customData): player(id) was moved to team(teamId) by player(byId).
      - onStadiumChange(stadium, byId, customData): room's current stadium was set to (stadium) by player(byId).
      - onTeamsLockChange(value, byId, customData): room's team lock status was set to (value) by player(byId).
      - onPlayerJoin(playerObj, customData): a player(playerObj) joined the room.
      - onGamePauseChange(isPaused, byId, customData): room's game paused status was set to (isPaused) by player(byId).
      - onPlayerChat(id, message, customData): a chat message with content(message) was received from player(id).
      - onPlayerInputChange(id, value, customData): player(id)'s input has changed to (value).
      - onPlayerChatIndicatorChange(id, value, customData): player(id)'s chat indicator status has changed to (value).
      - onPlayerLeave(playerObj, reason, isBanned, byId, customData): player(playerObj) has left the room, or was \[kicked or banned\](isBanned) by player(byId) with reason(reason).
      - onSetDiscProperties(id, type, data1, data2, customData): \[type=0: disc, type=1: player\](id)'s properties was set to (data1, data2). may only be triggered by host.
      - onKickRateLimitChange(min, rate, burst, byId, customData): room's kick rate limit was set to (min, rate, burst) by player(byId).
      - onGameStart(byId, customData): game was started by player(byId).
      - onGameStop(byId, customData): game was stopped by player(byId).
      - onPingData(array, customData): ping values for all players was received. may only be triggered by host.
      - onExtrapolationChange(value, customData): extrapolation was set to (value).
      - onHandicapChange(value, customData): handicap was set to (value).
      - onBansClear(customData): all bans were cleared. host-only.
      - onRoomRecaptchaModeChange(on, customData): room's recaptcha mode was set to (on). host-only.
      - onRoomPropertiesChange(props, customData): room's properties(props) were changed. host-only.
      - onCollisionDiscVsDisc(discId1, discPlayerId1, discId2, discPlayerId2, customData): a collision happened between disc(discId1, playerId1) and disc(discId2, playerId2).
      - onCollisionDiscVsSegment(discId, discPlayerId, segmentId, customData): a collision happened between disc(discId, discPlayerId) and segment(segmentId).
      - onCollisionDiscVsPlane(discId, discPlayerId, planeId, customData): a collision happened between disc(discId, discPlayerId) and plane(planeId).
      - onCustomEvent(type, data, byId, customData): a custom event(type, data) was triggered by player(byId). custom-(host,client)s-only.

- Renderer: A class that defines a renderer for Haxball client.

  - constructor(anything): creates a new Renderer instance. the renderer instance will be initialized outside this library, so the constructor is not of our business.

  - callbacks:
    - initialize(roomObj): only called once while creating or joining a room.
    - finalize(): only called once while leaving a room.
    - onXXXXXXX(..., customData): \[where XXXXXXX is the name of the event.\] called after room.onAfterXXXXXXX(..., customData). customData is the object that might be returned from room.onAfterXXXXXXX(...).
      - onRoomLink(link, customData): room link was received. host-only.
      - onPlayerBallKick(playerId, customData): ball was kicked by player(playerId).
      - onTeamGoal(teamId, customData): goal was scored by team(teamId).
      - onGameEnd(winningTeamId, customData): game was won by team(winningTeamId).
      - onGameTick(customData): runs on each game tick. (lots of times per second)
      - onPlayerSyncChange(playerId, value, customData): player(playerId)'s synchronized status has changed to (value).
      - onAnnouncement(msg, color, style, sound, customData): a message(msg) with properties(color, style, sound) was announced by the room host. may only be triggered by host.
      - onAutoTeams1(playerId, teamId, byId, customData): "auto" button was used by player(byId) and it caused player(playerId) to join team(teamId).
      - onAutoTeams2(playerId1, teamId1, playerId2, teamId2, byId, customData): "auto" button was used by player(byId), it caused player(playerId1) to join team(teamId1) and player(playerId2) to join team(teamId2).
      - onScoreLimitChange(value, byId, customData): score limit was changed to (value) by player(byId).
      - onTimeLimitChange(value, byId, customData): time limit was changed to (value) by player(byId).
      - onPlayerAdminChange(id, isAdmin, byId, customData): player(id)'s admin status was changed to (isAdmin) by player(byId).
      - onPlayerAvatarChange(id, value, customData): player(id) changed its avatar to (value).
      - onPlayerTeamChange(id, teamId, byId, customData): player(id) was moved to team(teamId) by player(byId).
      - onStadiumChange(stadium, byId, customData): room's current stadium was set to (stadium) by player(byId).
      - onTeamsLockChange(value, byId, customData): room's team lock status was set to (value) by player(byId).
      - onPlayerJoin(playerObj, customData): a player(playerObj) joined the room.
      - onGamePauseChange(isPaused, byId, customData): room's game paused status was set to (isPaused) by player(byId).
      - onPlayerChat(id, message, customData): a chat message with content(message) was received from player(id).
      - onPlayerInputChange(id, value, customData): player(id)'s input has changed to (value).
      - onPlayerChatIndicatorChange(id, value, customData): player(id)'s chat indicator status has changed to (value).
      - onPlayerLeave(playerObj, reason, isBanned, byId, customData): player(playerObj) has left the room, or was \[kicked or banned\](isBanned) by player(byId) with reason(reason).
      - onSetDiscProperties(id, type, data1, data2, customData): \[type=0: disc, type=1: player\](id)'s properties was set to (data1, data2). may only be triggered by host.
      - onKickRateLimitChange(min, rate, burst, byId, customData): room's kick rate limit was set to (min, rate, burst) by player(byId).
      - onGameStart(byId, customData): game was started by player(byId).
      - onGameStop(byId, customData): game was stopped by player(byId).
      - onPingData(array, customData): ping values for all players was received. may only be triggered by host.
      - onExtrapolationChange(value, customData): extrapolation was set to (value).
      - onHandicapChange(value, customData): handicap was set to (value).
      - onBansClear(customData): all bans were cleared. host-only.
      - onRoomRecaptchaModeChange(on, customData): room's recaptcha mode was set to (on). host-only.
      - onRoomPropertiesChange(props, customData): room's properties(props) were changed. host-only.
      - onCollisionDiscVsDisc(discId1, discPlayerId1, discId2, discPlayerId2, customData): a collision happened between disc(discId1, playerId1) and disc(discId2, playerId2).
      - onCollisionDiscVsSegment(discId, discPlayerId, segmentId, customData): a collision happened between disc(discId, discPlayerId) and segment(segmentId).
      - onCollisionDiscVsPlane(discId, discPlayerId, planeId, customData): a collision happened between disc(discId, discPlayerId) and plane(planeId).
      - onCustomEvent(type, data, byId, customData): a custom event(type, data) was triggered by player(byId). custom-(host,client)s-only.
    - onPluginActiveChange(plugin): a plugin was activated/deactivated.

[Back To The Top](#title)

---

<h2 id="how-to-contribute">💡 How To Contribute</h2>

- Make a fork of this repository
- Clone to you machine and entry on respective paste
- Create a branch with your resource: `git checkout -b my-feature`
- Commit your changes: `git commit -m 'feat: My new feature'`
- Push your branch: `git push origin my-feature`
- A green button will appear at the beginning of this repository
- Click to open and fill in the pull request information

<p align="center">
<i>Contributions, issues and features requests are welcome!</i><br />
<i>📮 Submit PRs to help solve issues or add features</i><br />
<i>🐛 Find and report issues</i><br />
<i>🌟 Star the project</i><br />
</p>

[Back To The Top](#title)

---

<h2 id="contributors">🤗 Contributors</h2>

<p>

<div> - %70 of Node.js initial environment by mertushka <a href="https://github.com/mertushka"><img width="20" src="https://avatars1.githubusercontent.com/u/34413473?v=4"/></a></div>
<div> - Rest of Node.js initial environment and %98 of the bot API features by abc <a href="https://github.com/wxyz-abcd"><img width="20" src="https://avatars1.githubusercontent.com/u/8694183?v=4"/></a></div>
<div> - Rest of the features by 0x00 <a href="https://github.com/0x00214131812049"><img width="20" src="https://avatars.githubusercontent.com/u/96322566?v=4"/></a></div>

<div>We will continue to add all contributors to this list.</div>

</p>

[Back To The Top](#title)

---

<h2 id="license">🔏 License</h2>

MIT License, Copyright © 2022 [abc](https://github.com/wxyz-abcd)

Absolutely no rights reserved. Do whatever you want with the codes. 

We do not take any responsibility on potential harm caused by this code. Use at your own risk, and be creative. :)

[Back To The Top](#title)

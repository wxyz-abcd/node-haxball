function headlessWrapper(API){
	const { Room, Utils, OperationType, Errors, CollisionFlags } = API;
	function HBInit({ roomName, playerName, password, maxPlayers, public, geo, token, noPlayer }){
		var room = null, retRoom = { CollisionFlags };
		// basro's terrible logic asserts that we have to create and return new objects instead of original objects to prevent their direct modification.
		function convertPlayer(h){
			if (h==null)
				return null;
			let n = null, v = h.disc;
			if (v!=null)
				n = {
					x: v.pos.x,
					y: v.pos.y
				};
			return {
				name: h.name,
				team: h.team.id,
				id: h.id,
				admin: h.isAdmin,
				position: n,
				auth: h.auth,
				conn: h.conn
			};
		}
		function getScoresObject(r){
			return (!r.gameState)?null:{
				red: r.gameState.redScore, 
				blue: r.gameState.blueScore, 
				time: r.gameState.timeElapsed, 
				scoreLimit: r.gameState.scoreLimit, 
				timeLimit: r.gameState.timeLimit
			};
		}
		function getDiscPropertiesObject(h){
			return (h==null) ? null : {
				x: h.pos.x,
				y: h.pos.y,
				xspeed: h.speed.x,
				yspeed: h.speed.y,
				xgravity: h.gravity.x,
				ygravity: h.gravity.y,
				radius: h.radius,
				bCoeff: h.bCoeff,
				invMass: h.invMass,
				damping: h.damping,
				color: h.color,
				cMask: h.cMask,
				cGroup: h.cGroup
			};
		}
		Room.create({
			name: roomName, 
			password: password, 
			showInRoomList: public, 
			maxPlayerCount: maxPlayers,
			token: token,
			noPlayer: noPlayer
		}, {
			storage: {
				player_name: playerName,
				...(geo && {
					geo: {
						lat: geo.lat,
						lon: geo.lon,
						flag: geo.code,
					},
				}),
			},
			onOpen: (r)=>{
				room = r;
				r.onPlayerJoin = (playerObj)=>retRoom.onPlayerJoin?.(convertPlayer(playerObj));
				r.onPlayerLeave = (playerObj, reason, isBanned, byId)=>((reason==null)?retRoom.onPlayerLeave?.(convertPlayer(playerObj)):retRoom.onPlayerKicked?.(convertPlayer(playerObj), reason, isBanned, convertPlayer(r.getPlayer(byId))));
				r.onGameEnd = (winningTeamId)=>retRoom.onTeamVictory?.(getScoresObject(r));
				r.onBeforeOperationReceived = (type, msg)=>((type!=OperationType.SendChat)||(msg.byId==0)||retRoom.onPlayerChat?.(convertPlayer(r.getPlayer(msg.byId)), msg.text));
				r.onPlayerBallKick = (playerId)=>retRoom.onPlayerBallKick?.(convertPlayer(r.getPlayer(playerId)));
				r.onTeamGoal = (teamId)=>retRoom.onTeamGoal?.(teamId);
				r.onGameStart = (byId)=>retRoom.onGameStart?.(convertPlayer(r.getPlayer(byId)));
				r.onGameStop = (byId)=>retRoom.onGameStop?.(convertPlayer(r.getPlayer(byId)));
				r.onPlayerAdminChange = (id, isAdmin, byId)=>retRoom.onPlayerAdminChange?.(convertPlayer(r.getPlayer(id)), convertPlayer(r.getPlayer(byId)));
				r.onPlayerTeamChange = (id, teamId, byId)=>retRoom.onPlayerTeamChange?.(convertPlayer(r.getPlayer(id)), convertPlayer(r.getPlayer(byId)));
				r.onGameTick = ()=>retRoom.onGameTick?.();
				r.onGamePauseChange = (isPaused, byId)=>(isPaused?retRoom.onGamePause?.(convertPlayer(r.getPlayer(byId))):retRoom.onGameUnpause?.(convertPlayer(r.getPlayer(byId))));
				r.onPositionsReset = ()=>retRoom.onPositionsReset?.();
				r.onPlayerInputChange = (id, value)=>retRoom.onPlayerActivity?.(convertPlayer(r.getPlayer(id)));
				r.onStadiumChange = (stadium, byId)=>retRoom.onStadiumChange?.(stadium.name, convertPlayer(r.getPlayer(byId)));
				r.onRoomLink = (link)=>retRoom.onRoomLink?.(link);
				r.onKickRateLimitChange = (min, rate, burst, byId)=>retRoom.onKickRateLimitSet?.(min, rate, burst, convertPlayer(r.getPlayer(byId)));
				r.onTeamsLockChange = (value, byId)=>retRoom.onTeamsLockChange?.(value, convertPlayer(r.getPlayer(byId)));
				if (!geo)
					Utils.getGeo().then((geo)=>r.setProperties({geo}));
			},
			onClose: (msg)=>{
				room = null;
				if (msg?.code==Errors.ErrorCodes.MissingRecaptchaCallbackError)
					console.error("Invalid token");
				else if (msg)
					console.error("Bot has left the room:" + msg.code);
				throw "";
			}
		});
		Object.assign(retRoom, {
			nhInstance: room,
			sendChat: (message, targetId)=>Utils.runAfterGameTick(()=>room.sendChat(message, targetId)),
			setPlayerAdmin: (playerID, admin)=>Utils.runAfterGameTick(()=>room.setPlayerAdmin(playerID, admin)),
			setPlayerTeam: (playerID, team)=>Utils.runAfterGameTick(()=>room.setPlayerTeam(playerID, team)),
			kickPlayer: (playerID, reason, ban)=>Utils.runAfterGameTick(()=>room.kickPlayer(playerID, reason, ban)),
			clearBan: (playerId)=>room.clearBan(playerId),
			clearBans: ()=>room.clearBans(),
			setScoreLimit: (limit)=>Utils.runAfterGameTick(()=>room.setScoreLimit(limit)),
			setTimeLimit: (limit)=>Utils.runAfterGameTick(()=>room.setTimeLimit(limit)),
			setCustomStadium: (stadiumFileContents)=>Utils.runAfterGameTick(()=>room.setCurrentStadium(Utils.parseStadium(stadiumFileContents))),
			setDefaultStadium: (stadiumName)=>Utils.runAfterGameTick(()=>room.setCurrentStadium(Utils.getDefaultStadiums().find((stadium)=>stadium.name==stadiumName))),
			setTeamsLock: (locked)=>Utils.runAfterGameTick(()=>((room.teamsLocked!=locked) && room.lockTeams())),
			setTeamColors: (team, angle, textColor, colors)=>Utils.runAfterGameTick(()=>room.setTeamColors(team, angle, textColor, ...colors)),
			startGame: ()=>Utils.runAfterGameTick(()=>room.startGame()),
			stopGame: ()=>Utils.runAfterGameTick(()=>room.stopGame()),
			pauseGame: (pauseState)=>Utils.runAfterGameTick(()=>((room.isGamePaused()!=pauseState) && room.pauseGame())),
			getPlayer: (playerId)=>convertPlayer(room.getPlayer(playerId)),
			getPlayerList: ()=>room.players.map(convertPlayer),
			getScores: ()=>getScoresObject(room),
			getBallPosition: ()=>{var b = room.getBall();return b?{x: b.pos.x, y: b.pos.y}:null;},
			startRecording: ()=>room.startRecording(),
			stopRecording: ()=>room.stopRecording(),
			setPassword: (pass)=>room.setProperties({password: pass}),
			setRequireRecaptcha: (required)=>(room.requireRecaptcha = required),
			reorderPlayers: (playerIdList, moveToTop)=>Utils.runAfterGameTick(()=>room.reorderPlayers(playerIdList, moveToTop)),
			sendAnnouncement: (msg, targetId, color, style, sound)=>Utils.runAfterGameTick(()=>room.sendAnnouncement(msg, targetId, color, style, sound), 3),
			setKickRateLimit: (min = 2, rate = 0, burst = 0)=>Utils.runAfterGameTick(()=>room.setKickRateLimit(min, rate, burst)),
			setPlayerAvatar: (playerId, avatar)=>Utils.runAfterGameTick(()=>room.setPlayerAvatar(playerId, avatar, true)),
			setDiscProperties: (discIndex, properties)=>Utils.runAfterGameTick(()=>room.setDiscProperties(discIndex, properties)),
			getDiscProperties: (discIndex)=>getDiscPropertiesObject(room.getDisc(discIndex)),
			setPlayerDiscProperties: (playerId, properties)=>Utils.runAfterGameTick(()=>room.setPlayerDiscProperties(playerId, properties)),
			getPlayerDiscProperties: (playerId)=>getDiscPropertiesObject(room.getPlayer(playerId)?.disc),
			getDiscCount: ()=>(room.gameState?.physicsState.discs.length||0)
		});
		return retRoom;
	};
	return {
		HBInit
	};
}

if (typeof exports!=='undefined'){
	if (typeof module!=='undefined' && module.exports)
		exports = module.exports = headlessWrapper;
	exports["headlessWrapper"] = headlessWrapper;
}
else if (typeof root!=='undefined')
	root["headlessWrapper"] = headlessWrapper;
else 
	window["headlessWrapper"] = headlessWrapper;

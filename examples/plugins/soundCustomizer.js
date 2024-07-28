 module.exports = function(API){
    const { AllowFlags, Plugin, VariableType } = API;
    Object.setPrototypeOf(this, Plugin.prototype);
    Plugin.call(this, "soundCustomizer", true, {
      version: "0.3",
      author: "0x00",
      description: "A sound customizer plugin that changes sound of any event.",
      allowFlags: AllowFlags.CreateRoom|AllowFlags.JoinRoom // We allow this plugin to be activated on both CreateRoom and JoinRoom.
    });
    //#region Variables
    this.defineVariable({
        name: "collisionSound",
        description: "The sound will be played when a collision happens.", 
        type: VariableType.String,
        value: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/soundCustomizer/Voicy__Screaming_SFX.mp3"
    });
    this.defineVariable({
        name: "ballKickSound",
        description: "The sound will be played when a player kicks ball.", 
        type: VariableType.String,
        value: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/soundCustomizer/Voicy_Kirby_Voice_SFX.mp3"
    });
    this.defineVariable({
        name: "winningSound",
        description: "The sound will be played when current player wins.", 
        type: VariableType.String,
        value: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/soundCustomizer/Voicy_Kirby_Wins.mp3"
    });
    this.defineVariable({
        name: "losingSound",
        description: "The sound will be played when current player loses.", 
        type: VariableType.String,
        value: ""
    });
    this.defineVariable({
        name: "cPTeamScoreSound",
        description: "The sound will be played when a current player's team scores.", 
        type: VariableType.String,
        value: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/soundCustomizer/Voicy_Poyo.mp3"
    })
  
    this.defineVariable({
        name: "opponentScoreSound",
        description: "The sound will be played when opponent team scores.", 
        type: VariableType.String,
        value: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/soundCustomizer/Voicy_Kirby_Angry_Voice.mp3"
    })
    this.defineVariable({
        name: "onMsgSound",
        description: "The sound will be played when someone sends a message.", 
        type: VariableType.String,
        value: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/soundCustomizer/Voicy_Kirby_Notice.mp3"
    });
    this.defineVariable({
        name: "enableCDVP",
        description: "Enables sounds when a disc collides with another plane.", 
        type: VariableType.Boolean,
        value: false
    });
    this.defineVariable({
        name: "enableCDVS",
        description: "Enables sounds when a disc collides with another segment.", 
        type: VariableType.Boolean,
        value: false
    });
    this.defineVariable({
        name: "enableCDVD",
        description: "Enables sounds when a disc collides with another disc.", 
        type: VariableType.Boolean,
        value: false
    });
    this.defineVariable({
        name:"onlyCurrentPlayer",
        description:"Play sounds when something collides with current player only. Default is true.",
        type:VariableType.Boolean,
        value:true
    });
    let onCollisionSound, chatMsgNotificationSound, onPBKSound, opponentScoreSound, cpTeamScoreSound , onGESounds;
    //#endregion Variables
    /**
     * 
     * @param {HTMLAudioElement | HTMLAudioElement[]} audio
     * @param {Number?} index Index of the sound.
     * @returns {void}
     */    
     function playSound(audio, index){ 
        if(Array.isArray(audio) && (!isNaN(index) && audio[index])){
            audio[index].play().catch(console.error);
            return;
        }
        audio.play().catch(console.error);
    }
    this.initialize = () => {
        onGESounds  = [new Audio(this.winningSound), new Audio(this.losingSound)];
        onCollisionSound = new Audio(this.collisionSound);
        chatMsgNotificationSound = new Audio(this.onMsgSound);
        onPBKSound = new Audio(this.ballKickSound);
        opponentScoreSound = new Audio(this.opponentScoreSound);
        cpTeamScoreSound = new Audio(this.cPTeamScoreSound);
    };
    this.finalize = function(){
        onPBKSound?.remove();
        opponentScoreSound?.remove();
        cpTeamScoreSound?.remove();
        opponentScoreSound?.remove();
        onCollisionSound?.remove();
        chatMsgNotificationSound?.remove();
        onGESounds?.forEach((e) => e?.remove());
        onPBKSound = opponentScoreSound = cpTeamScoreSound = onGESounds = chatMsgNotificationSound = null;
    };
    /**
     * 
     * @param {*} addonObject 
     * @param {String} variableName 
     * @param {*} oldValue 
     * @param {*} newValue 
     * @param {*} customData 
     */
    this.onVariableValueChange = (addonObject, variableName, oldValue, newValue, customData) => {
        if(!variableName.endsWith("Sound") && this != addonObject) return;
        switch (variableName) {
            case "losingSound":
                onGESounds[0].src = newValue;
                break;
            case "winningSound":
                onGESounds[1].src = newValue;
                break;
            case "collisionSound":
                onCollisionSound.src = newValue
                break;
            case "ballKickSound":
                onPBKSound.src = newValue
                break;
            case "onMsgSound":
              chatMsgNotificationSound.src = newValue
              break;
            case "cPTeamScoreSound":
                cpTeamScoreSound.src = newValue;
                break;
            case "opponentScoreSound":
                opponentScoreSound.src = newValue;
                break;
            default:
                break;
        }
    }
    /**
     * 
     * @param {Number} teamID 
     * @returns {void}
     */
    this.onTeamGoal = (teamID) =>  playSound((this.room.currentPlayer.team.id === teamID) ? cpTeamScoreSound: opponentScoreSound);
    /**
     * 
     * @param {Number} playerId 
     * @param {*} customData 
     * @returns {void}
     */
    this.onPlayerBallKick = (playerId, customData) => {
        if(this.onlyCurrentPlayer)
            return playerId === this.room.currentPlayerId && playSound(onPBKSound);
        playSound(onPBKSound);
    }
    this.onGameEnd = (winningTeamID) => playSound(onGESounds, Number(winningTeamID === this.room.currentPlayer.team.id))
    /**
     * 
     * @param {Number?} discId1 
     * @param {Number?} discPlayerId1 
     * @param {Number?} discId2 
     * @param {Number?} discPlayerId2 
     * @returns {void}
     */
    this.onCollisionDiscVsDisc = (discId1,discPlayerId1,discId2,discPlayerId2) => {
        if(!this.enableCDVD||[discId1, discId2].includes(0)) return;
        if(this.onlyCurrentPlayer)
            return ([discPlayerId1, discPlayerId2].includes(this.room.currentPlayerId)) && playSound(onCollisionSound);
        playSound(onCollisionSound);
    }
    /**
     * 
     * @param {Number?} discId 
     * @param {Number?} discPlayerId 
     * @param {Number?} segmentId 
     * @param {*} customData 
     */
    this.onCollisionDiscVsSegment = (discId, discPlayerId, segmentId, customData) => {
        if(!this.enableCDVS) return;
        if(this.onlyCurrentPlayer)
            return  (discPlayerId === this.room.currentPlayerId) && playSound(onCollisionSound);
        playSound(onCollisionSound);
    }
    /**
     * 
     * @param {Number?} discId 
     * @param {Number?} discPlayerId 
     * @param {Number?} segmentId 
     * @param {*} customData 
     */
    this.onCollisionDiscVsPlane = (discId, discPlayerId, segmentId, customData) => {
        if(!this.enableCDVP) return;
        if(this.onlyCurrentPlayer)
            return (discPlayerId === this.room.currentPlayerId) && playSound(onCollisionSound);
        playSound(onCollisionSound);
    }
    /**
     * 
     * @param {Number} id 
     * @param {String} message 
     * @param {*} customData 
     * @returns {void}
     */
    this.onPlayerChat = (id, message,customData) => playSound(chatMsgNotificationSound);
  };
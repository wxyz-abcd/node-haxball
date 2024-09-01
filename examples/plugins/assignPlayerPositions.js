module.exports = function (API) {
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, PlayerPositionInGame, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;
  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "assignPlayerPositions", true, { // "assignPlayerPositions" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc",
    description: "This plugin allows us to assign positions to players. (Like GK, DMC, ML, FC, etc.) This is yet only a test to see if room.(un)registerPlayerGUIProperty and room.(set/clear)CustomPlayerImage are working correctly. Synchronization via custom events will hopefully be added later.",
    allowFlags: AllowFlags.CreateRoom | AllowFlags.JoinRoom // We allow this plugin to be activated on CreateRoom only.
  });
  const imageWidth = 20, imageHeight = 16;
  const images = {
    [PlayerPositionInGame.None]: "",
    [PlayerPositionInGame.GK]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/GK.png",
    [PlayerPositionInGame.SW]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/SW.png",
    [PlayerPositionInGame.WBL]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/WBL.png",
    [PlayerPositionInGame.DL]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/DL.png",
    [PlayerPositionInGame.DC]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/DC.png",
    [PlayerPositionInGame.DR]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/DR.png",
    [PlayerPositionInGame.WBR]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/WBR.png",
    [PlayerPositionInGame.DML]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/DML.png",
    [PlayerPositionInGame.DMC]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/DMC.png",
    [PlayerPositionInGame.DMR]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/DMR.png",
    [PlayerPositionInGame.ML]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/ML.png",
    [PlayerPositionInGame.MC]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/MC.png",
    [PlayerPositionInGame.MR]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/MR.png",
    [PlayerPositionInGame.AML]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/AML.png",
    [PlayerPositionInGame.AMC]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/AMC.png",
    [PlayerPositionInGame.AMR]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/AMR.png",
    [PlayerPositionInGame.FL]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/FL.png",
    [PlayerPositionInGame.FC]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/FC.png",
    [PlayerPositionInGame.FR]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/FR.png",
    [PlayerPositionInGame.ST]: "https://cdn.jsdelivr.net/gh/0x00214131812049/nh-storage@latest/assignPlayerPositions/ST.png",
  };

  var that = this;

  this.initialize = function(){
    that.room.registerPlayerGUIProperty({
      category: "assignPlayerPositions", 
      name: "inGamePosition", 
      type: VariableType.PlayerPositionInGame, 
      readonly: false, 
      description: "Position of the player",
      onChange: (obj, value)=>{
        if (value==PlayerPositionInGame.None)
          that.room.clearCustomPlayerImage(obj.id);
        else
          that.room.setCustomPlayerImage(obj.id, images[value], imageWidth, imageHeight);
      }
    });
  };

  this.finalize = function(){
    that.room?.unregisterPlayerGUIProperties?.("assignPlayerPositions");
  };
}
module.exports = function (API) {
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "slidingAvatar", false, {
    version: "0.1",
    author: "JerryOldson",
    description: `This plugin will slide the characters of your avatar.`,
    allowFlags: AllowFlags.JoinRoom | AllowFlags.CreateRoom
  });

  this.defineVariable({
    name: "avatar",
    description: "The avatar you want to have.",
    type: VariableType.String,
    value: "JerryOldson"
  });

  this.defineVariable({
    name: "slideInterval",
    description: "This variable is used to determine the frequency of sliding in miliseconds",
    type: VariableType.Number,
    value: 500,
    range: {
      min: 0,
      step: 1
    }
  });

  var that = this, avatarIndex = -1, interval;

  function slideAvatar() {
    if (that.active) {
      let newAvatar;
      if (avatarIndex === -1) {
        newAvatar = that.avatar.substr(avatarIndex + 1, 1);
      } else {
        newAvatar = that.avatar.substr(avatarIndex, 2);
      }
      that.room.setAvatar(newAvatar);
      avatarIndex++;
      if (avatarIndex >= that.avatar.length) avatarIndex = -1;
    }
  };

  this.initialize = () => {
    Utils.runAfterGameTick(() => {
      interval = setInterval(slideAvatar, that.slideInterval);
    }, 1);
  };

  this.finalize = () => {
    that = null;
    avatarIndex = null;
    clearInterval(interval);
    interval = null;
  };

  this.onVariableValueChange = (addonObject, variableName, oldValue, newValue) => {
    if (addonObject == that && variableName == "slideInterval") {
      clearInterval(interval);
      interval = setInterval(slideAvatar, newValue);
    }
  };

}
/*
  Example usage: 
    * To add this language with a new abbreviation("test") to API:
      API.Language.add("test", ...EnglishLanguage(API)); 
    * To change API's language to this language: (this also triggers onLanguageChange event on all plugins, renderer and roomConfig objects.)
      Language.current = "test";
    * To remove this language from API: (also, you cannot remove your current language. change language first.)
      API.Language.remove("test"); 
*/
function EnglishLanguage(API){
  const { ErrorCodes, ConnectionState, RendererTextIndices } = API.Language.indices;
  const { K } = API.Impl.Utils;

  const ErrorsTextMap = {
    [ErrorCodes.Empty]: ()=>"",
    [ErrorCodes.ConnectionClosed]: (reason)=>"Connection closed"+((reason!=null)?" ("+reason+")":""),
    [ErrorCodes.GameStateTimeout]: ()=>"Game state timeout",
    [ErrorCodes.RoomClosed]: ()=>"The room was closed.",  
    [ErrorCodes.RoomFull]: ()=>"The room is full.",
    [ErrorCodes.WrongPassword]: ()=>"Wrong password.",
    [ErrorCodes.BannedBefore]: ()=>"You are banned from this room.",
    [ErrorCodes.IncompatibleVersion]: ()=>"Incompatible game version.",
    [ErrorCodes.FailedHost]: ()=>"Failed to connect to room host. If this problem persists please see the troubleshooting guide: https://github.com/haxball/haxball-issues/wiki/Connection-Issues",
    [ErrorCodes.Unknown]: ()=>"An error ocurred while attempting to join the room.<br><br>This might be caused by a browser extension, try disabling all extensions and refreshing the site.<br><br>The error has been printed to the inspector console.",
    [ErrorCodes.Cancelled]: ()=>"Cancelled",
    [ErrorCodes.FailedPeer]: ()=>"Failed to connect to peer.",
    [ErrorCodes.KickedNow]: (reason, ban, byName)=>"You were "+(ban?"banned":"kicked")+(byName?.length>0?(" by "+byName):"")+(reason?.length>0?(" ("+reason+")"):""),
    [ErrorCodes.Failed]: ()=>"Failed",
    [ErrorCodes.MasterConnectionError]: ()=>"Master connection error",
    [ErrorCodes.StadiumParseError]: (section, index)=>"Error in \"" + section + "\" index: " + index,
    [ErrorCodes.StadiumParseSyntaxError]: (lineNumber)=>"SyntaxError in line: " + lineNumber,
    [ErrorCodes.StadiumParseUnknownError]: ()=>"Error loading stadium file.",
    [ErrorCodes.ObjectCastError]: (object, type)=>"Cannot cast " + K.ye(object) + " to " + K.ye(type),
    [ErrorCodes.TeamColorsReadError]: ()=>"too many",
    [ErrorCodes.UTF8CharacterDecodeError]: (offset, charCode)=>"Cannot decode UTF8 character at offset " + offset + ": charCode (" + charCode + ") is invalid",
    [ErrorCodes.ReadTooMuchError]: ()=>"Read too much",
    [ErrorCodes.ReadWrongStringLengthError]: (expectedLength)=>"Actual string length differs from the specified: " + expectedLength + " bytes",
    [ErrorCodes.EncodeUTF8CharNegativeError]: (num)=>"Cannot encode UTF8 character: charCode (" + num + ") is negative",
    [ErrorCodes.EncodeUTF8CharTooLargeError]: (num)=>"Cannot encode UTF8 character: charCode (" + num + ") is too large (>= 0x80000000)",
    [ErrorCodes.CalculateLengthOfUTF8CharNegativeError]: (num)=>"Cannot calculate length of UTF8 character: charCode (" + num + ") is negative",
    [ErrorCodes.CalculateLengthOfUTF8CharTooLargeError]: (num)=>"Cannot calculate length of UTF8 character: charCode (" + num + ") is too large (>= 0x80000000)",
    [ErrorCodes.BufferResizeParameterTooSmallError]: ()=>"Can't resize buffer to a capacity lower than 1",
    [ErrorCodes.BadColorError]: ()=>"Bad color",
    [ErrorCodes.BadTeamError]: ()=>"Bad team value",
    [ErrorCodes.StadiumLimitsExceededError]: ()=>"Error",
    [ErrorCodes.MissingActionConfigError]: ()=>"Class doesn't have a config",
    [ErrorCodes.UnregisteredActionError]: ()=>"Tried to pack unregistered action",
    [ErrorCodes.MissingImplementationError]: ()=>"missing implementation",
    [ErrorCodes.AnnouncementActionMessageTooLongError]: ()=>"message too long",
    [ErrorCodes.ChatActionMessageTooLongError]: ()=>"message too long",
    [ErrorCodes.KickBanReasonTooLongError]: ()=>"string too long",
    [ErrorCodes.ChangeTeamColorsInvalidTeamIdError]: ()=>"Invalid team id",
    [ErrorCodes.MissingRecaptchaCallbackError]: ()=>"Recaptcha requested. Either set onRequestRecaptcha or set a working token while creating/joining a room.",
    [ErrorCodes.ReplayFileVersionMismatchError]: ()=>"The replay data is of a different version",
    [ErrorCodes.ReplayFileReadError]: ()=>"Couldn't load replay data.",
    [ErrorCodes.JoinRoomNullIdAuthError]: ()=>"id and authObj cannot be null. (inside 1st parameter)",
    [ErrorCodes.PlayerNameTooLongError]: (conn, auth, name)=>"name too long",
    [ErrorCodes.PlayerCountryTooLongError]: (conn, auth, name, flag)=>"country too long",
    [ErrorCodes.PlayerAvatarTooLongError]: (conn, auth, name, flag, avatar)=>"avatar too long",
    [ErrorCodes.PlayerJoinBlockedByMPDError]: (conn, auth, name, flag, avatar)=>"Player join not allowed: " + name + " " + flag + " " + avatar + " " + conn + " " + auth,
    [ErrorCodes.PlayerJoinBlockedByORError]: (playerObj)=>"Player join event blocked by OperationReceived: " + playerObj,
    [ErrorCodes.PluginNotFoundError]: (pluginIndex)=>"Plugin not found at index " + pluginIndex,
    [ErrorCodes.PluginNameChangeNotAllowedError]: ()=>"Plugin name should not change",
    [ErrorCodes.LibraryNotFoundError]: (libraryIndex)=>"Library not found at index " + libraryIndex,
    [ErrorCodes.LibraryNameChangeNotAllowedError]: ()=>"Library name should not change",
    [ErrorCodes.AuthFromKeyInvalidIdFormatError]: ()=>"Invalid id format",
    [ErrorCodes.LanguageAlreadyExistsError]: (abbr)=>"Language already exists: " + abbr,
    [ErrorCodes.CurrentLanguageRemovalError]: ()=>"Current language cannot be removed. Change to a different language first.",
    [ErrorCodes.LanguageDoesNotExistError]: (abbr)=>"Language does not exist: " + abbr,
    [ErrorCodes.BadActorError]: ()=>"Bad Actor"
  };

  const ConnectionStateTextMap = {
    [ConnectionState.ConnectingToMaster]: "Connecting to master",
    [ConnectionState.ConnectingToPeer]: "Connecting to peer",
    [ConnectionState.AwaitingState]: "Awaiting state",
    [ConnectionState.Active]: "Active",
    [ConnectionState.ConnectionFailed]: "Connection Failed",
  };

  const RendererTextMap = {
    [RendererTextIndices.timeIsUp1]: "Time is", 
    [RendererTextIndices.timeIsUp2]: "Up!", 
    [RendererTextIndices.redIsVictorious1]: "Red is", 
    [RendererTextIndices.redIsVictorious2]: "Victorious!", 
    [RendererTextIndices.redScores1]: "Red", 
    [RendererTextIndices.redScores2]: "Scores!", 
    [RendererTextIndices.blueIsVictorious1]: "Blue is", 
    [RendererTextIndices.blueIsVictorious2]: "Victorious!", 
    [RendererTextIndices.blueScores1]: "Blue", 
    [RendererTextIndices.blueScores2]: "Scores!", 
    [RendererTextIndices.gamePaused1]: "Game", 
    [RendererTextIndices.gamePaused2]: "Paused" 
  };

  return [ErrorsTextMap, ConnectionStateTextMap, RendererTextMap];
};

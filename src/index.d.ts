declare namespace MainReturnType {

  /**
   * The current version number of the API.
   */
  export const version: string;

  /**
   * This object binds event (operation) names to numbers that are 
   * obtained during Haxball's event mechanism, to let us understand 
   * what kind of message is received from the client. By nature, 
   * these include only those events that can be sent by a client 
   * and received by a host.
   */
  export enum OperationType {
    
    /**
     * The operation to set your own avatar.
     */
    SetAvatar = 0,
    
    /**
     * The operation to set a player's headless avatar. This 
     * requires the sender to be the host of the current room.
     */
    SetHeadlessAvatar = 1,
    
    /**
     * The operation to send chat text.
     */
    SendChat = 2,
    
    /**
     * The operation to set a player's chat indicator status.
     */
    SendChatIndicator = 3,
    
    /**
     * The operation to send announcement text. This requires 
     * the sender to be the host of the current room.
     */
    SendAnnouncement = 4,
    
    /**
     * The operation to set your own input. (key state)
     */
    SendInput = 5,
    
    /**
     * The operation to set the room's current stadium. This
     * requires the sender to be an admin in the current room.
     * Also, the game must not be active.
     */
    SetStadium = 6,
    
    /**
     * The operation to start the game. This requires the sender 
     * to be an admin in the current room. Also, the game must 
     * not be active.
     */
    StartGame = 7,
    
    /**
     * The operation to stop the game. This requires the sender 
     * to be an admin in the current room. Also, the game must 
     * be active.
     */
    StopGame = 8,
    
    /**
     * The operation to pause or resume the game. This requires 
     * the sender to be an admin in the current room. Also, the 
     * game must be active.
     */
    PauseResumeGame = 9,
    
    /**
     * The operation to set the score limit of the room. This
     * requires the sender to be an admin in the current room.
     * Also, the game must not be active.
     */
    SetScoreLimit = 10,
    
    /**
     * The operation to set the time limit of the room. This
     * requires the sender to be an admin in the current room.
     * Also, the game must not be active.
     */
    SetTimeLimit = 11,
    
    /**
     * The operation to automatically move one player from the 
     * spectators team to the red team, and one player to the 
     * blue team. This requires the sender to be an admin in the 
     * current room.
     */
    AutoTeams = 12,
    
    /**
     * The operation to lock/unlock the room's teams. This
     * requires the sender to be an admin in the current room.
     */
    SetTeamsLock = 13,
    
    /**
     * The operation to move a player to a team. This requires
     * the sender to be an admin in the current room. If teams
     * are not locked and the game is not active, the non-admin 
     * players are also allowed to use this event only to 
     * change their own teams.
     */
    SetPlayerTeam = 14,
    
    /**
     * The operation to set the room's current stadium. This
     * requires the sender to be an admin in the current room.
     */
    SetKickRateLimit = 15,
    
    /**
     * The operation to set a team's colors. This requires the
     * sender to be an admin in the current room.
     */
    SetTeamColors = 16,
    
    /**
     * The operation to grant/take away a player's admin rights. 
     * This requires the sender to be an admin in the current room.
     */
    SetPlayerAdmin = 17,
    
    /**
     * The operation to leave the room, or kick/ban a player. 
     * (This is decided by the `reason` property being `null`.)
     * The kick/ban operation requires the sender to be an admin 
     * in the current room. 
     */
    KickBanPlayer = 18,
    
    /**
     * The operation to set your own synchronization status.
     */
    SetPlayerSync = 19,
    
    /**
     * The operation to inform players of the ping values of 
     * each player. This requires the sender to be the host 
     * of the current room.
     */
    Ping = 20,
    
    /**
     * The operation to set a disc's properties. This requires 
     * the sender to be the host of the current room.
     */
    SetDiscProperties = 21,
    
    /**
     * The operation to add a player to the current room. This 
     * requires the sender to be the host of the current room.
     */
    JoinRoom = 22,
    
    /**
     * The operation to change the ordering of the players 
     * in the room. This requires the sender to be the host 
     * of the current room.
     */
    ReorderPlayers = 23,
    
    /**
     * The operation to check whether the client is in sync 
     * with the host. This requires the sender to be a client 
     * of the current room.
     */
    CheckConsistency = 24,
    
    /**
     * The operation to trigger a custom event. This requires 
     * the receiver to use this API, otherwise the operation
     * will not be sent to that client. This might create
     * desynchronization issues for non-API clients if the 
     * custom event includes important changes such as 
     * stadium objects, names, etc.
     */
    CustomEvent = 25,

    /**
     * The operation to trigger a binary custom event. This 
     * requires the receiver to use this API, otherwise the 
     * operation will not be sent to that client. This might
     * create desynchronization issues for non-API clients 
     * if the custom event includes important changes such as 
     * stadium objects, names, etc.
     */
    BinaryCustomEvent = 26,

    /**
     * The operation to set a player's backend identity. This 
     * requires the receiver to use this API, otherwise the 
     * operation will not be sent to that client.
     */
    SetPlayerIdentity = 27
  }

  /**
   * While writing an addon, one might want to define variables whose values 
   * can be altered from outside the class. This object defines the type of 
   * variable that is defined inside the class. If you have a GUI to alter 
   * these values in real-time, you will have to implement the necessary 
   * GUI components to be able to edit these data types. 
   */
  export enum VariableType {

    /**
     * The void type. Used to show a button. Its value should be a function that will be executed when the button is clicked.
     */
    Void = 0,

    /**
     * The boolean type. Can be `true` or `false`.
     */
    Boolean = 1,

    /**
     * The integer type. Can be any integer. Should be used 
     * with a `range` property to define its range.
     */
    Integer = 2,

    /**
     * The number type. Can be any real number or +-Infinity or NaN. 
     * Should be used with a `range` property to define its range.
     */
    Number = 3,

    /**
     * The string type. Can be any string. Should be used 
     * with a `range` property to define the range of its length.
     */
    String = 4,

    /**
     * The color type. This is in fact currently an integer in 
     * the range [-1, 16777216]. Specialized only to be edited 
     * with a color picker component inside a GUI environment.
     */
    Color = 5,

    /**
     * The collision flags type. This is in fact an ordinary 
     * integer. Specialized only to be edited with a collision
     * flags editor component inside a GUI environment.
     */
    CollisionFlags = 6,

    /**
     * The coordinate type. This is in fact an ordinary array 
     * using this structure: `[x: number, y: number]` where 
     * `x` and `y` are assumed to be the coordinates of a point.
     * Specialized to be edited with a coordinate editor 
     * component inside a GUI environment.
     */
    Coordinate = 7,

    /**
     * The team type. Currently, the only accepted values for 
     * this type is `1` and `2` where `1` is the red team and 
     * `2` is the blue team. Specialized to be edited with a 
     * team selector component inside a GUI environment.
     */
    Team = 8,

    /**
     * The team type. Currently, the only accepted values for 
     * this type is `0`, `1` and `2` where `0` is the spectators 
     * team, `1` is the red team and `2` is the blue team. 
     * Specialized to be edited with a team selector component 
     * inside a GUI environment.
     */
    TeamWithSpec = 9,

    /**
     * The background type. Currently, the only accepted values for 
     * this type is `0`, `1` and `2` where `0` means no background 
     * texture, `1` means grass texture and `2` means hockey texture. 
     * Specialized to be edited with a background selector component 
     * inside a GUI environment.
     */
    BgType = 10,

    /**
     * The camera follow type. Currently, the only accepted values for 
     * this type is `0` and `1` where `0` means not to follow players and 
     * `1` means to follow the current player. Specialized to be edited 
     * with a camera follow selector component inside a GUI environment.
     */
    CameraFollow = 11,

    /**
     * The kickOffReset type. Currently, the only accepted values for 
     * this type is `true` and `false` where `true` means "full" kick off 
     * reset and `1` means "partial" kick off reset. Specialized to be edited 
     * with a camera follow selector component inside a GUI environment.
     */
    KickOffReset = 12,

    /**
     * The flag type. This is in fact a string value that represents the 
     * country code of a country. Specialized to be edited with a flag 
     * selector component inside a GUI environment.
     */
    Flag = 13,

    /**
     * The file type. Should be editable with a file selector component 
     * inside a GUI environment.
     */
    File = 14,

    /**
     * The playerId type. Should be editable with a player selector component
     * inside a GUI environment.
     */
    PlayerId = 15,

    /**
     * The keys array type. Should be editable with a keyboard keys editor component
     * inside a GUI environment.
     */
    Keys = 16,

    /**
     * A progress indicator. Its value should be an integer between 0 and 100, and
     * null should disable the progressbar component inside a GUI environment.
     */
    Progress = 17,

    /**
     * The player position type. Its possible values are the common player positions
     * in most football manager games. (Check the PlayerPositionInGame enum)
     */
    PlayerPositionInGame = 18
  }

  /**
   * These values are used to track the current state of connection while joining a room. (Designed for the `onConnectionStateChange(state, sdp)` callback in the `commonParams` parameter of `Room.join` function.)
   */
  export enum ConnectionState {

    /**
     * "Connecting to master"
     */
    ConnectingToMaster = 0,

    /**
     * "Connecting to peer"
     */
    ConnectingToPeer = 1,

    /**
     * "Awaiting state"
     */
    AwaitingState = 2,

    /**
     * "Active"
     */
    Active = 3,

    /**
     * "Connection Failed"
     */
    ConnectionFailed = 4
  }

  /**
   * These values help understand whether a user is allowed to use an addon while joining a room or creating a room. They are designed to act like flags and be used in bitwise operations.
   */
  export enum AllowFlags {

    /**
     * Whether the addon is useable while joining a room.
     */
    JoinRoom = 1,

    /**
     * Whether the addon is useable while creating a room.
     */
    CreateRoom = 2
  }

  /**
   * These flags are used internally in Haxball's physics engine. They are designed to act like flags and be used in bitwise operations. Most types of stadium objects have collisionMask and collisionGroup properties that directly uses these flags to decide whether collision check should happen or not.
   * 
   * Let's say discA seemingly collided with discB. The physics engine will just skip the collision without doing any further calculation if the below condition is not satisfied:
   * 
   * ```js
   * ((discA.collisionMask & discB.collisionGroup)>0) && ((discB.collisionMask & discA.collisionGroup)>0)
   * ```
   */
  export enum CollisionFlags {

    /**
     * If defined, the object will accept collisions with other "ball"s.
     */
    ball = 0,

    /**
     * If defined, the object will accept collisions with other "red"s.
     */
    red = 1,

    /**
     * If defined, the object will accept collisions with other "blue"s.
     */
    blue = 2,

    /**
     * If defined, the object will accept collisions with other "red"s only until the kick off event happens. 
     */
    redKO = 3,

    /**
     * If defined, the object will accept collisions with other "blue"s only until the kick off event happens. 
     */
    blueKO = 4,

    /**
     * If defined, the object will act as a wall.
     */
    wall = 5,

    /**
     * If defined, the object will become kickable. Haxball makes a player kick some object only if this `kick` flag exists in the object and the object is near enough to the player. (`4` map units, to be precise.)
     */
    kick = 6,

    /**
     * If defined, the object will score a goal for the opposite team if it passes a goal line.
     */
    score = 7,

    /**
     * Free
     */
    free1 = 8,

    /**
     * Free
     */
    free2 = 9,

    /**
     * Free
     */
    free3 = 10,

    /**
     * Free
     */
    free4 = 11,

    /**
     * Free
     */
    free5 = 12,

    /**
     * Free
     */
    free6 = 13,

    /**
     * Free
     */
    free7 = 14,

    /**
     * Free
     */
    free8 = 15,

    /**
     * Free
     */
    free9 = 16,

    /**
     * Free
     */
    free10 = 17,

    /**
     * Free
     */
    free11 = 18,

    /**
     * Free
     */
    free12 = 19,

    /**
     * Free
     */
    free13 = 20,

    /**
     * Free
     */
    free14 = 21,

    /**
     * Free
     */
    free15 = 22,

    /**
     * Free
     */
    free16 = 23,

    /**
     * Free
     */
    free17 = 24,

    /**
     * Free
     */
    free18 = 25,

    /**
     * Free
     */
    free19 = 26,

    /**
     * Free
     */
    free20 = 27,

    /**
     * Free
     */
    c0 = 28,

    /**
     * Free
     */
    c1 = 29,

    /**
     * Free
     */
    c2 = 30,

    /**
     * Free
     */
    c3 = 31
  }

  declare enum ErrorCodes {

    /**
     * ""
     */
    Empty = 0,

    /**
     * 'Connection closed$1?(" $1":"")'
     */
    ConnectionClosed = 1,

    /**
     * "Game state timeout"
     */
    GameStateTimeout = 2,

    /**
     * "The room was closed."
     */
    RoomClosed = 3,

    /**
     * "The room is full."
     */
    RoomFull = 4,

    /**
     * "Wrong password."
     */
    WrongPassword = 5,

    /**
     * "You are banned from this room."
     */
    BannedBefore = 6,

    /**
     * "Incompatible game version."
     */
    IncompatibleVersion = 7,

    /**
     * "Failed to connect to room host. If this problem persists please see the troubleshooting guide: https://github.com/haxball/haxball-issues/wiki/Connection-Issues"
     */
    FailedHost = 8,

    /**
     * "An error ocurred while attempting to join the room.<br><br>This might be caused by a browser extension, try disabling all extensions and refreshing the site.<br><br>The error has been printed to the inspector console."
     */
    Unknown = 9,

    /**
     * "Cancelled"
     */
    Cancelled = 10,

    /**
     * "Failed to connect to peer."
     */
    FailedPeer = 11,

    /**
     * 'You were $2?("banned":"kicked")$3?(" by $3":"")$1?(" ($1)":"")'
     */
    KickedNow = 12,

    /**
     * "Failed"
     */
    Failed = 13,

    /**
     * "Master connection error"
     */
    MasterConnectionError = 14,

    /**
     * 'Error in "$1" index: $2'
     */
    StadiumParseError = 15,

    /**
     * "SyntaxError in line: $1"
     */
    StadiumParseSyntaxError = 16,

    /**
     * "Error loading stadium file."
     */
    StadiumParseUnknownError = 17,

    /**
     * "Cannot cast $1 to $2"
     */
    ObjectCastError = 18,

    /**
     * "too many"
     */
    TeamColorsReadError = 19,

    /**
     * "Cannot decode UTF8 character at offset $1: charCode ($2) is invalid"
     */
    UTF8CharacterDecodeError = 20,

    /**
     * "Read too much"
     */
    ReadTooMuchError = 21,

    /**
     * "Actual string length differs from the specified: $1 bytes"
     */
    ReadWrongStringLengthError = 22,

    /**
     * "Cannot encode UTF8 character: charCode ($1) is negative"
     */
    EncodeUTF8CharNegativeError = 23,

    /**
     * "Cannot encode UTF8 character: charCode ($1) is too large (>= 0x80000000)"
     */
    EncodeUTF8CharTooLargeError = 24,

    /**
     * "Cannot calculate length of UTF8 character: charCode ($1) is negative"
     */
    CalculateLengthOfUTF8CharNegativeError = 25,

    /**
     * "Cannot calculate length of UTF8 character: charCode ($1) is too large (>= 0x80000000)"
     */
    CalculateLengthOfUTF8CharTooLargeError = 26,

    /**
     * "Can't resize buffer to a capacity lower than 1"
     */
    BufferResizeParameterTooSmallError = 27,

    /**
     * "Bad color"
     */
    BadColorError = 28,

    /**
     * "Bad team value"
     */
    BadTeamError = 29,

    /**
     * "Error"
     */
    StadiumLimitsExceededError = 30,

    /**
     * "Class doesn't have a config"
     */
    MissingActionConfigError = 31,

    /**
     * "Tried to pack unregistered action"
     */
    UnregisteredActionError = 32,

    /**
     * "missing implementation"
     */
    MissingImplementationError = 33,

    /**
     * "message too long"
     */
    AnnouncementActionMessageTooLongError = 34,

    /**
     * "message too long"
     */
    ChatActionMessageTooLongError = 35,

    /**
     * "string too long"
     */
    KickBanReasonTooLongError = 36,

    /**
     * "Invalid team id"
     */
    ChangeTeamColorsInvalidTeamIdError = 37,

    /**
     * "Recaptcha requested. Either set onRequestRecaptcha or set a working token while creating/joining a room."
     */
    MissingRecaptchaCallbackError = 38,

    /**
     * "The replay data is of a different version"
     */
    ReplayFileVersionMismatchError = 39,

    /**
     * "Couldn't load replay data."
     */
    ReplayFileReadError = 40,

    /**
     * "id and authObj cannot be null. (inside 1st parameter)"
     */
    JoinRoomNullIdAuthError = 41,

    /**
     * "name too long"
     */
    PlayerNameTooLongError = 42,

    /**
     * "country too long"
     */
    PlayerCountryTooLongError = 43,

    /**
     * "avatar too long"
     */
    PlayerAvatarTooLongError = 44,

    /**
     * "Player join not allowed: $3 $4 $5 $1 $2"
     */
    PlayerJoinBlockedByMPDError = 45,

    /**
     * "Player join event blocked by OperationReceived: $1"
     */
    PlayerJoinBlockedByORError = 46,

    /**
     * "Plugin not found at index $1"
     */
    PluginNotFoundError = 47,

    /**
     * "Plugin name should not change"
     */
    PluginNameChangeNotAllowedError = 48,

    /**
     * "Library not found at index $1"
     */
    LibraryNotFoundError = 49,

    /**
     * "Library name should not change"
     */
    LibraryNameChangeNotAllowedError = 50,
    
    /**
     * "Invalid id format"
     */
    AuthFromKeyInvalidIdFormatError = 51,

    /**
     * "Bad Actor"
     */
    BadActorError = 55,

    /**
     * "Auth banned: $1"
     */
    AuthBannedError = 56,

    /**
     * "Basro's backend is not compatible with the login system, so the identity token and identity events are disabled."
     */
    NoProxyIdentityProblem = 57,

    /**
     * "Solution: Use a proxy server and handle the login data there."
     */
    NoProxyIdentitySolution = 58    
  }

  declare type int = number;
  declare type uint8 = number;
  declare type uint16 = number;
  declare type int32 = number;
  declare type uint32 = number;
  declare type TemplateString = string;

  declare type TextToNumberMap = {
    [x: string]: number;
  }

  declare type NumberToTemplateStringMap = {
    [x: number]: TemplateString;
  }

  /**
   * These values help understand the direction of a movement for an axis. Only designed for room.keyState function to combine seperate directions for x and y axis to generate the value of the key to press.
   */
  export enum Direction {

    /**
     * A backward movement.
     */
    Backward = -1,

    /**
     * No movement.
     */
    Still = 0,

    /**
     * A forward movement.
     */
    Forward = 1
  }

  /**
   * These values help understand whether the camera will follow the player or not. This is only used as a variable in all stadiums.
   */
  export enum CameraFollow {

    /**
     * Camera is not bound to follow any player.
     */
    None = 0,

    /**
     * Camera is bound to follow the current player.
     */
    Player = 1
  }

  /**
   * This is the type of the variable in a stadium that defines its background texture type.
   */
  export enum BackgroundType {

    /**
     * No background texture.
     */
    None = 0,

    /**
     * Grass background texture.
     */
    Grass = 1,

    /**
     * Hockey background texture.
     */
    Hockey = 2
  }

  /**
   * This type lets us understand the actual state of the game. This type only exists in a GameState object.
   */
  export enum GamePlayState {

    /**
     * This is the state of the game when the game has started, 
     * but kick off has not happened yet.
     */
    BeforeKickOff = 0,

    /**
     * This is the state of the game when the game is active and 
     * kick off has already happened.
     */
    Playing = 1,

    /**
     * This is the state of the game when the game is active and 
     * a goal has been scored. `GameState.goalTickCounter` is counting 
     * down from its initial value `150` while in this state. The 
     * game state is restored to `Playing` when this counter reaches `0`.
     */
    AfterGoal = 2,

    /**
     * This is the state of the game when the game is active and a team 
     * has just been declared to have won the game. `GameState.goalTickCounter`
     * is counting down from its initial value `300` while in this state. The 
     * game is stopped when this counter reaches `0`.
     */
    Ending = 3
  }

  /**
   * These are the common player positions in most football manager games.
   */
  export enum PlayerPositionInGame {

    /**
     * No position. Unfortunately specific to Haxball. :)
     */
    None = 0,

    /**
     * Goalkeeper
     */
    GK = 1,

    /**
     * Sweeper
     */
    SW = 2,

    /**
     * Wing Back Left
     */
    WBL = 3,

    /**
     * Defender Left
     */
    DL = 4,

    /**
     * Defender Centre
     */
    DC = 5,

    /**
     * Defender Right
     */
    DR = 6,

    /**
     * Wing Back Right
     */
    WBR = 7,

    /**
     * Defensive Midfielder Left
     */
    DML = 8,

    /**
     * Defensive Midfielder Centre
     */
    DMC = 9,

    /**
     * Defensive Midfielder Right
     */
    DMR = 10,

    /**
     * Midfielder Left
     */
    ML = 11,

    /**
     * Midfielder Centre
     */
    MC = 12,

    /**
     * Midfielder Right
     */
    MR = 13,

    /**
     * Attacking Midfielder Left
     */
    AML = 14,

    /**
     * Attacking Midfielder Centre
     */
    AMC = 15,

    /**
     * Attacking Midfielder Right
     */
    AMR = 16,

    /**
     * Left Forward
     */
    FL = 17,

    /**
     * Centre Forward
     */
    FC = 18,

    /**
     * Right Forward
     */
    FR = 19,

    /**
     * Striker
     */
    ST = 20,
  };

  /**
   * The base class for all Haxball events.
   */
  declare class HaxballEvent {
    
    /**
     * Type of the event. Should not be modified.
     */
    public readonly eventType: OperationType;

    /**
     * Id of the player who triggered this event.
     */
    public byId: uint16;

    /**
     * Creates a copy of this event object.
     */
    public copy: ()=>HaxballEvent;
  };

  /**
   * The event message structure that is created when a consistency check has to be performed.
   */
  declare class ConsistencyCheckEvent extends HaxballEvent {

    /**
     * The consistency data to be checked.
     */
    public data: ArrayBuffer;
  };

  /**
   * The event message structure that is created when the game is started.
   */
  declare class StartGameEvent extends HaxballEvent {};

  /**
   * The event message structure that is created when the game is stopped.
   */
  declare class StopGameEvent extends HaxballEvent {};

  /**
   * The event message structure that is created when auto teams button is clicked.
   */
  declare class AutoTeamsEvent extends HaxballEvent {};

  /**
   * The event message structure that is created when a player's synchronization status changes.
   */
  declare class SetPlayerSyncEvent extends HaxballEvent {

    /**
     * The new synchronization status of the player who sent this event.
     */
    public value: boolean;
  };

  /**
   * The event message structure that is created when an announcement is sent/received.
   */
  declare class SendAnnouncementEvent extends HaxballEvent {

    /**
     * The announcement message. ( max length = 1000 )
     */
    public msg: string;

    /**
     * The color of the announcement message. Range: -1 <= `color` < 16777216. 
     *  - The color value can be converted into a rgba string via API's `Utils.numberToColor` function.
     *  - The special value `-1` means `transparent` color.
     */
    public color: int32;

    /**
     * The style of the announcement message. Must be one of the following:
     *  - 0: use document's default font style.
     *  - 1: fontWeight = "bold".
     *  - 2: fontStyle = "italic".
     *  - 3: fontSize = "12px".
     *  - 4: fontWeight = "bold", fontSize = "12px".
     *  - 5: fontWeight = "italic", fontSize = "12px".
     */
    public style: uint8;

    /**
     * The sound of the announcement message. Must be one of the following: 
     *  - 0: no sound.
     *  - 1: chat sound.
     *  - 2: highlight sound.
     */
    public sound: uint8;

    /**
     * Id of the player who will receive the announcement. 
     * If `null`, everyone receives it. Can not be modified.
     */
    public readonly targetId: uint16 | null;
  };

  /**
   * The event message structure that is created when score limit or time limit is changed.
   */
  declare class SetLimitEvent extends HaxballEvent {

    /**
     * Type of the event. 
     * - If `0`, score limit is changed.
     * - Otherwise, time limit is changed.
     */
    public type: uint8;

    /**
     * The new value of the limit. (0 <= value < 100)
     */
    public newValue: int;
  };

  /**
   * The event message structure that is created when a player's admin status is changed.
   */
  declare class SetPlayerAdminEvent extends HaxballEvent {

    /**
     * Id of the player whose admin status is changed.
     */
    public playerId: uint16;

    /**
     * The new admin status value.
     */
    public value: boolean;
  };

  /**
   * The event message structure that is created when a player changes its avatar.
   */
  declare class SetAvatarEvent extends HaxballEvent {

    /**
     * The new avatar. ( max length = 2 )
     */
    public value: string | null;
  };

  /**
   * The event message structure that is created when a player is moved to a team.
   */
  declare class SetPlayerTeamEvent extends HaxballEvent {

    /**
     * Id of the player whose team is changed.
     */
    public playerId: uint16;

    /**
     * The new team.
     */
    public team: Team;
  };

  /**
   * The event message structure that is created when the stadium is changed.
   */
  declare class SetStadiumEvent extends HaxballEvent {

    /**
     * The new stadium.
     */
    public stadium: Stadium;
  };

  /**
   * The event message structure that is created when the team colors are changed.
   */
  declare class SetTeamColorsEvent extends HaxballEvent {

    /**
     * The team whose colors are changed.
     */
    public team: Team;

    /**
     * The new team colors.
     */
    public colors: TeamColors;
  };

  /**
   * The event message structure that is created when the teams lock status is changed.
   */
  declare class SetTeamsLockEvent extends HaxballEvent {

    /**
     * The new teams lock status.
     */
    public newValue: boolean;
  };

  /**
   * The event message structure that is created when a new player joins the room.
   */
  declare class JoinRoomEvent extends HaxballEvent {

    /**
     * Id of the new player.
     */
    public id: uint16;

    /**
     * Name of the new player.
     */
    public name: string | null;

    /**
     * Flag of the new player.
     */
    public flag: string | null;

    /**
     * Avatar of the new player.
     */
    public avatar: string | null;

    /**
     * Hex-encoded "connection string"(!) of the new player.
     */
    public conn: string;

    /**
     * Auth of the new player.
     */
    public auth: string;
  };

  /**
   * The event message structure that is created when a player's headless avatar is changed.
   */
  declare class SetHeadlessAvatarEvent extends HaxballEvent {

    /**
     * Id of the player whose headless avatar is changed.
     */
    public playerId: uint16;

    /**
     * The new headless avatar value. ( max length = 2 )
     */
    public value: string | null;
  };

  /**
   * The event message structure that is created when the game is paused/resumed.
   */
  declare class PauseResumeGameEvent extends HaxballEvent {

    /**
     * Whether the game is paused or not.
     */
    public paused: boolean;
  };

  /**
   * The event message structure that is created when a chat message is sent.
   */
  declare class SendChatEvent extends HaxballEvent {

    /**
     * The chat text that is sent. ( max length = 140 )
     */
    public text: string;

    /**
     * Id of the player who will receive the chat. 
     * If `null`, everyone receives it. Can not be modified.
     */
    public readonly targetId: uint16 | null;
  };

  /**
   * The event message structure that is created when a player's input changes.
   */
  declare class SendInputEvent extends HaxballEvent {

    /**
     * The new input value. ( 0 <= input < 32 )
     */
    public input: uint32;
  };

  /**
   * The event message structure that is created when a player's chat indicator status changes.
   */
  declare class SendChatIndicatorEvent extends HaxballEvent {

    /**
     * The new value of the chat indicator status. (0: off, 1: on)
     */
    public value: uint8;
  };

  /**
   * The event message structure that is created when a custom event is triggered by this API.
   */
  declare class CustomEvent extends HaxballEvent {

    /**
     * Type of the custom event. This value can be anything you want.
     */
    public type: uint32;

    /**
     * Custom data of the custom event. This value can be anything you want.
     * It has to be any json object that can be `JSON.stringify`ed and `JSON.parse`d.
     */
    public data: object;
  };

  /**
   * The event message structure that is created when a binary custom event is triggered by this API.
   */
  declare class BinaryCustomEvent extends HaxballEvent {

    /**
     * Type of the binary custom event. This value can be anything you want.
     */
    public type: uint32;

    /**
     * Custom binary data of the binary custom event. This value can be anything you want.
     */
    public data: Uint8Array;
  };

  /**
   * The event message structure that is created when an identity event is triggered by this API.
   */
  declare class IdentityEvent extends HaxballEvent {

    /**
     * Id of the player whose identity data is desired to be changed.
     */
    public id: uint16;

    /**
     * The identity data that should be received from the backend. It can be any JSON object.
     */
    public data: object;
  };

  /**
   * The event message structure that is created when a player leaves the room or is kicked/banned by the host.
   */
  declare class KickBanPlayerEvent extends HaxballEvent {

    /**
     * Id of the player who left the room.
     */
    public id: uint16;

    /**
     * The reason of kick/ban. ( max length = 100 )
     * Interpreted as leaving by himself/herself if this value is `null`.
     */
    public reason: string | null;

    /**
     * Whether the player is banned or not.
     */
    public ban: boolean;
  };

  /**
   * The event message structure that is created when the host calls room.reorderPlayers function.
   */
  declare class ReorderPlayersEvent extends HaxballEvent {

    /**
     * Id of the players who will be reordered in the player list.
     */
    public playerIdList: uint16[];

    /**
     * Whether the players will be moved to the top or bottom of the list.
     */
    public moveToTop: boolean;
  };

  /**
   * The event message structure that is created when the host calls room.setDiscProperties or room.setPlayerDiscProperties function.
   */
  declare class SetDiscPropertiesEvent extends HaxballEvent {

    /**
     * Id of the disc/player whose properties are changed.
     */
    public id: uint16;

    /**
     * If `true`, this is triggered by room.setPlayerDiscProperties, and `id` is the player's id.
     * Otherwise, this is triggered by room.setDiscProperties, and `id` is the disc's id.
     */
    public type: boolean;

    /**
     * Contains the floating point properties that are sent, in this order:
     * `[x, y, xspeed, yspeed, xgravity, ygravity, radius, bCoeff, invMass, damping]`
     * If any of these values are `null`, it means that that value is not modified.
     */
    public data1: (number | null)[];

    /**
     * Contains the integer properties that are sent, in this order:
     * `[color, cMask, cGroup]`
     * If any of these values are `null`, it means that that value is not modified.
     */
    public data2: (int | null)[];
  };

  /**
   * The event message structure that is created when the kick rate limit is changed.
   */
  declare class SetKickRateLimitEvent extends HaxballEvent {

    /**
     * The `min` component of the kick rate limit.
     */
    public min: int;

    /**
     * The `rate` component of the kick rate limit.
     */
    public rate: int;

    /**
     * The `burst` component of the kick rate limit.
     */
    public burst: int;
  };

  /**
   * The event message structure that is automatically created by the host to indicate current ping values of players.
   */
  declare class PingEvent extends HaxballEvent {

    /**
     * The ping values of all players in the same order as the players list.
     */
    public values: int[];
  };

  declare type BanEntryId = uint32;

  /**
   * These values help understand the type of a ban entry instance inside a room's ban list.
   */
  export enum BanEntryType {

    /**
     * A ban rule referring to a player's id.
     */
    Player = 0,

    /**
     * A ban rule referring to an IP address/range.
     */
    IP = 1,

    /**
     * A ban rule referring to a player's auth string.
     */
    Auth = 2
  };

  declare type NumericIPv4 = uint32;
  declare type NumericIPv6 = BigInt;
  declare type AuthString = string;

  declare type BanEntry = {
    id: BanEntryId;
    type: BanEntryType;
    value: {pId: int, pName: string, ips: string[], auth: AuthString} | NumericIPv4 | NumericIPv6 | AuthString;
  };

  declare type IPv4Range = {
    ip: NumericIPv4,
    mask: NumericIPv4
  };

  declare type IPv6Range = {
    ip: NumericIPv6,
    mask: NumericIPv6
  };

  /**
   * A player can be identified from the stringified instance of this class that the player carries.
   */
  declare type Auth = {};

  /**
   * A class that defines the coordinates of an object.
   */
  declare type Point = {

    /**
     * The x coordinate.
     */
    x: number;

    /**
     * The y coordinate.
     */
    y: number;
  };

  /**
   * A class that defines a vertex.
   */
  declare type Vertex = {

    /**
     * The id(index) of this Vertex.
     */
    id: int;
    
    /**
     * The collision group of this Vertex.
     */
    cGroup: int;
    
    /**
     * The collision mask of this Vertex.
     */
    cMask: int;
    
    /**
     * The bouncing coefficient of this Vertex.
     */
    bCoef: number;
    
    /**
     * The position of this Vertex.
     */
    pos: Point;
  };

  /**
   * A class that defines a segment.
   */
  declare type Segment = {

    /**
     * The first Vertex of this Segment.
     */
    v0: Vertex;

    /**
     * The second Vertex of this Segment.
     */
    v1: Vertex;

    /**
     * The curving angle of this Segment. (in radians)
     */
    curveF: number;

    /**
     * The color of this Segment. Range: -1 <= `color` < 16777216. 
     *   - This value can be converted into a rgba string via API's `Utils.numberToColor` function.
     *   - The special value `-1` means `transparent` color.
     */
    color: int;

    /**
     * Whether this Segment is visible or not.
     */
    vis: boolean;

    /**
     * Bias of this Segment.
     */
    bias: number;
    
    /**
     * The bouncing coefficient of this Segment.
     */
    bCoef: number;
    
    /**
     * The collision group of this Segment.
     */
    cGroup: int;
    
    /**
     * The collision mask of this Segment.
     */
    cMask: int;

    /**
     * The calculated normal vector of this Segment. Only applies to non-curved Segments.
     */
    normal: Point;

    /**
     * The calculated normal direction of the object's tangent line at `v0`. Only applies to curved Segments.
     */
    v0Normal: Point;

    /**
     * The calculated normal direction of the object's tangent line at `v1`. Only applies to curved Segments.
     */
    v1Normal: Point;
    
    /**
     * The calculated radius of this Segment. Only applies to curved Segments.
     */
    arcRadius: Point;

    /**
     * The calculated center point of this Segment. Only applies to curved Segments.
     */
    arcCenter: Point;
  };

  /**
   * A class that defines a plane.
   */
  declare type Plane = {

    /**
     * The normal vector of this Plane.
     */
    normal: Point;

    /**
     * The distance of this Plane to the origin point(0, 0).
     */
    dist: number;
    
    /**
     * The bouncing coefficient of this Plane.
     */
    bCoef: number;
    
    /**
     * The collision group of this Plane.
     */
    cGroup: int;
    
    /**
     * The collision mask of this Plane.
     */
    cMask: int;
  };

  /**
   * A class that defines a goal.
   */
  declare type Goal = {

    /**
     * The first point of this Goal.
     */
    p0: Point;

    /**
     * The second point of this Goal.
     */
    p1: Point;

    /**
     * The team that this Goal belongs to.
     */
    team: Team;
  };

  /**
   * A class that defines a disc.
   */
  declare type Disc = {

    /**
     * The position of this Disc.
     */
    pos: Point;

    /**
     * The radius of this Disc.
     */
    radius: number;

    /**
     * The speed of this Disc.
     */
    speed: Point;

    /**
     * The gravity of this Disc.
     */
    gravity: Point;

    /**
     * The damping value of this Disc.
     */
    damping: number;

    /**
     * The 1/mass value of this Disc.
     */
    invMass: number;
    
    /**
     * The bouncing coefficient of this Disc.
     */
    bCoef: number;

    /**
     * The color of this Disc. Range: -1 <= `color` < 16777216. 
     *   - This value can be converted into a rgba string via API's `Utils.numberToColor` function.
     *   - The special value `-1` means `transparent` color.
     */
    color: int;
    
    /**
     * The collision group of this Disc.
     */
    cGroup: int;
    
    /**
     * The collision mask of this Disc.
     */
    cMask: int;
  };

  /**
   * A class that defines an active disc.
   */
  declare type MovableDisc = {

    /**
     * The position of this Disc.
     */
    pos: Point;

    /**
     * The radius of this Disc.
     */
    radius: number;

    /**
     * The speed of this Disc.
     */
    speed: Point;

    /**
     * The gravity(acceleration) of this Disc.
     */
    gravity: Point;

    /**
     * The damping value of this Disc.
     */
    damping: number;

    /**
     * The 1/mass value of this Disc.
     */
    invMass: number;
    
    /**
     * The bouncing coefficient of this Disc.
     */
    bCoef: number;

    /**
     * The color of this Disc. Range: -1 <= `color` < 16777216. 
     *   - This value can be converted into a rgba string via API's `Utils.numberToColor` function.
     *   - The special value `-1` means `transparent` color.
     */
    color: int;
    
    /**
     * The collision group of this Disc.
     */
    cGroup: int;
    
    /**
     * The collision mask of this Disc.
     */
    cMask: int;

    /**
     * Id of the player that owns this Disc, or `null` if it is not owned by a player.
     */
    playerId: uint16 | null;

    /**
     * The extrapolated version of this Disc, or `null` if the data is not available.
     */
    ext: MovableDisc | null;
  };

  /**
   * A class that defines a joint.
   */
  declare type Joint = {

    /**
     * Index of the first Disc of this Joint.
     */
    d0: int;

    /**
     * Index of the second Disc of this Joint.
     */
    d1: int;

    /**
     * The minimum length of this Joint.
     */
    minLength: number;

    /**
     * The maximum length of this Joint.
     */
    maxLength: number;

    /**
     * The strength of this Joint. (`Infinity` means rigid.)
     */
    strength: number;

    /**
     * The color of this Joint. Range: -1 <= `color` < 16777216. 
     *   - This value can be converted into a rgba string via API's `Utils.numberToColor` function.
     *   - The special value `-1` means `transparent` color.
     */
    color: int;
  };

  /**
   * A class that defines an object to store game-specific physical properties of a player.
   */
  declare type PlayerPhysics = {

    /**
     * A value to determine how much each player is pushed back when he/she kicks the ball.
     */
    kickback: number;

    /**
     * Radius of each player's Disc.
     */
    radius: number;
    
    /**
     * The collision group of each player's Disc.
     */
    cGroup: int;
    
    /**
     * The constant gravity(acceleration) applied to each player's Disc all the time.
     */
    gravity: Point;
    
    /**
     * The bouncing coefficient of this Vertex.
     */
    bCoef: number;
    
    /**
     * The 1/mass value of each player's Disc.
     */
    invMass: number;
    
    /**
     * The damping value of each player's Disc.
     */
    damping: number;
    
    /**
     * The acceleration(for manual movements only) of each player's Disc.
     */
    acceleration: number;

    /**
     * The acceleration(for manual movements only) of each player's Disc while the kick key is pressed.
     */
    kickingAcceleration: number;

    /**
     * The damping value of each player's Disc while the kick key is pressed.
     */
    kickingDamping: number;

    /**
     * The kicking strength of each player.
     */
    kickStrength: number;
  };

  /**
   * A class that defines a stadium.
   */
  declare type Stadium = {

    /**
     * All vertices of this Stadium.
     */
    vertices: Vertex[];

    /**
     * All segments of this Stadium.
     */
    segments: Segment[];

    /**
     * All planes of this Stadium.
     */
    planes: Plane[];

    /**
     * All goals of this Stadium.
     */
    goals: Goal[];

    /**
     * All discs of this Stadium.
     */
    discs: Disc[];

    /**
     * All joints of this Stadium.
     */
    joints: Joint[];

    /**
     * All spawn points of this Stadium for the red team.
     */
    redSpawnPoints: Point[];

    /**
     * All spawn points of this Stadium for the blue team.
     */
    blueSpawnPoints: Point[];

    /**
     * The physics properties of all players for this Stadium.
     */
    playerPhysics: PlayerPhysics;

    /**
     * The id(index) of this Stadium in the default stadiums array. 
     * This value will be 255 in custom Stadiums.
     */
    defaultStadiumId: int;

    /**
     * The maximum view width for this Stadium. Used in Renderers.
     */
    maxViewWidth: number;

    /**
     * Whether the camera will follow the player or not. Used in Renderers.
     */
    cameraFollow: CameraFollow;

    /**
     * Whether this Stadium can be stored or not.
     */
    canBeStored: boolean;

    /**
     * Whether the disc positions other than the ball are reset or not after a goal is scored.
     */
    fullKickOffReset: boolean;

    /**
     * The name of this Stadium.
     */
    name: string;

    /**
     * The width of this Stadium.
     */
    width: number;

    /**
     * The height of this Stadium.
     */
    height: number;

    /**
     * The background type of this Stadium.
     */
    bgType: BackgroundType;

    /**
     * The background color of this Stadium. Range: -1 <= `bgColor` < 16777216. 
     *   - This value can be converted into a rgba string via API's `Utils.numberToColor` function.
     *   - The special value `-1` means `transparent` color.
     */
    bgColor: int;

    /**
     * The width for the background of this Stadium.
     */
    bgWidth: number;

    /**
     * The heightt for the background of this Stadium.
     */
    bgHeight: number;

    /**
     * The kick off circle's radius for the background of this Stadium.
     */
    bgKickOffRadius: number;

    /**
     * The radius of the corners for the background of this Stadium.
     */
    bgCornerRadius: number;

    /**
     * The spawn distance of players for this Stadium.
     */
    spawnDistance: number;

    /**
     * The goal line's horizontal distance from the default goal positions for the background of this Stadium.
     */
    bgGoalLine: number;

    /**
     * Whether this is a custom Stadium or a default Stadium.
     */
    readonly isCustom: boolean;

    /**
     * Creates a copy of this Stadium object.
     */
    copy: ()=>Stadium;
  };

  /**
   * A class that defines the colors of a team.
   */
  declare type TeamColors = {

    /**
     * The angle of stripes shown inside the player disc object. (in radians)
     */
    angle: number;

    /**
     * Color of the avatar text. Range: -1 <= `text` < 16777216. 
     *   - This value can be converted into a rgba string via API's `Utils.numberToColor` function.
     *   - The special value `-1` means `transparent` color.
     */
    text: int;

    /**
     * Colors of the stripes. (A maximum of 3 stripes are allowed.) 
     * For each `value` in the array; range: -1 <= `value` < 16777216. 
     *   - This value can be converted into a rgba string via API's `Utils.numberToColor` function.
     *   - The special value `-1` means `transparent` color.
     */
    inner: int[];

    /**
     * Creates a copy of this TeamColors object.
     */
    copy: ()=>TeamColors;
  };

  /**
   * A class that defines a team.
   */
  declare type Team = {

    /**
     * The id of this Team.
     */
    id: number;

    /**
     * The color of this Team. Range: -1 <= `color` < 16777216. 
     *   - This value can be converted into a rgba string via API's `Utils.numberToColor` function.
     *   - The special value `-1` means `transparent` color.
     */
    color: int;

    /**
     * The default defense direction on the x axis for this Team.
     */
    defenseDir: Direction;

    /**
     * The default cMask of this Team's player objects. (This value | 39) is 
     * overwritten into all of the players' cMask values whenever a goal is scored.
     */
    cMask: int;

    /**
     * The default cGroup of this Team's player objects.
     */
    cGroup: int;
  };

  declare namespace Team {

    /**
     * The Spectators Team.
     */
    export const spec: Team;

    /**
     * The Red Team.
     */
    export const red: Team;

    /**
     * The Blue Team.
     */
    export const blue: Team;

    /**
     * All teams can be reached by their ids using 
     * this object in the following manner:
     * 
     * `Team.byId[id]`.
     */
    export const byId: Team[];
  }

  /**
   * A class that defines a geographic location.
   */
  declare type GeoLocation = {

    /**
     * The latitude of this GeoLocation.
     */
    lat: number;

    /**
     * The longitude of this GeoLocation.
     */
    lon: number;

    /**
     * The country code of this GeeLocation.
     */
    flag: string;
  };

  /**
   * A class that defines a player inside a room state.
   */
  declare type Player = {

    /**
     * Id of this Player.
     */
    id: int;

    /**
     * Name of this Player.
     */
    name: string;

    /**
     * Team of this Player.
     */
    team: Team;

    /**
     * Country code of this Player.
     */
    flag: string;

    /**
     * Client avatar of this Player.
     */
    avatar: string | null;

    /**
     * Headless avatar of this Player.
     */
    headlessAvatar: string | null;

    /**
     * Whether this Player is an admin or not.
     */
    isAdmin: boolean;

    /**
     * Avatar number of this Player. If no avatar is set, this number is shown.
     */
    avatarNumber: int;

    /**
     * Connection string of this Player.
     */
    conn: string | null;

    /**
     * Public auth string of this Player.
     */
    auth: string | null;

    /**
     * Whether this Player is using this API or not.
     */
    customClient: boolean;

    /**
     * Current ping value of this Player.
     */
    ping: int;

    /**
     * Current key-state of this Player.
     */
    input: int;

    /**
     * Min tick counter for kick rate of this Player.
     */
    kickRateMinTickCounter: int;

    /**
     * Min tick counter for kick rate of this Player.
     */
    kickRateMaxTickCounter: int;

    /**
     * Whether this Player is currently kicking the ball or not.
     */
    isKicking: boolean;

    /**
     * Whether this Player is currently synchronized with the room's host or not.
     */
    sync: boolean;

    /**
     * Current disc of this Player, or null if this Player is not currently playing.
     */
    disc: MovableDisc | null;

    /**
     * The extrapolated version of this Player, or `null` if the data is not available.
     */
    ext: Player | null;

    /**
     * The identity data of the current player that is received from a backend/proxy server.
     */
    identity: object | null;
  };

  /**
   * A class that has all the objects that are related to the physics simulation.
   */
  declare type World = {

    /**
     * All vertices of this World.
     */
    vertices: Vertex[];

    /**
     * All segments of this World.
     */
    segments: Segment[];

    /**
     * All planes of this World.
     */
    planes: Plane[];

    /**
     * All moving discs of this World.
     */
    discs: MovableDisc[];

    /**
     * All joints of this World.
     */
    joints: Joint[];

    /**
     * The extrapolated version of this World, or `null` if the data is not available.
     */
    ext: World | null;

    /**
     * Creates the physical ball kicking effect. No kicking will happen if the distance between ball and player is >= 4 map units.
     * 
     * @param pDisc The actual disc of the player that is kicking the ball.
     * @param bDisc The actual disc of the ball that is being kicked.
     * @param pp The current physical attributes of the players.
     * 
     * @returns Whether the ball was kicked or not.
     */
    kickBall: (pDisc: MovableDisc, bDisc: MovableDisc, pp: PlayerPhysics) => boolean;
  };

  /**
   * A class that defines the complete game state of a room.
   */
  declare type GameState = {

    /**
     * Counts how many ticks are left to resume the game.
     * This value is set to `120` whenever the game is paused.
     */
    pauseGameTickCounter: int;

    /**
     * The currently elapsed time in miliseconds.
     */
    timeElapsed: number;

    /**
     * The current score of blue team.
     */
    blueScore: int;

    /**
     * The current score of red team.
     */
    redScore: int;

    /**
     * The current state of the actual game-play.
     */
    state: GamePlayState;

    /**
     * Counts how many ticks are left to reset the positions of discs.
     * This value is set to `150` just after a goal is scored.
     */
    goalTickCounter: int;

    /**
     * The physical state of the objects inside the game.
     */
    physicsState: World;

    /**
     * The time limit of the game in minutes. 0 = no limit.
     */
    timeLimit: int;

    /**
     * The score limit of the game. 0 = no limit.
     */
    scoreLimit: int;

    /**
     * The stadium that the game is currently being played in.
     */
    stadium: Stadium;
  
    /**
     * The extrapolated version of this GameState, or `null` if the data is not available.
     */
    ext: GameState | null;

    /**
     * Creates a copy of this GameState object.
     */
    copy: ()=>GameState;

    /**
     * Advances the game time `steps` number of frames. Called automatically by the game itself.
     * 
     * @param steps The number of game ticks to execute.
     * 
     * @returns void.
     */
    advance: (steps)=>void;
  };

  declare interface RoomStateBase {

    /**
     * The stadium that the game is currently being played in.
     */
    stadium: Stadium;

    /**
     * The min value of kick rate limit.
     */
    kickRate_min: int;

    /**
     * The rate value of kick rate limit.
     */
    kickRate_rate: int;

    /**
     * The max value of kick rate limit.
     */
    kickRate_max: int;

    /**
     * The time limit of this current RoomState in minutes. 0 = no limit.
     */
    timeLimit: int;

    /**
     * The score limit of this current RoomState. 0 = no limit.
     */
    scoreLimit: int;

    /**
     * Whether the teams are locked or not.
     * The non-admin players are allowed to change teams only
     * if this feature is disabled and the game is stopped.
     */
    teamsLocked: boolean;

    /**
     * Current state of the game, or `null` if the game is stopped.
     */
    gameState: GameState | null;

    /**
     * All players that are currently in this room.
     */
    players: Player[];

    /**
     * Name of this room.
     */
    name: string;

    /**
     * The custom colors for each team. The 0th index has `null` because it's the Spectators team.
     */
    teamColors: TeamColors[];

    /**
     * The extrapolated version of this RoomState, or `null` if the data is not available.
     */
    ext: RoomState | null;

    /**
     * Returns a snapshot of the current room state. You can load the returned object directly into sandbox using its `useSnapshot(roomState)` function.
     * 
     * @returns A complete snapshot of the current room state.
     */
    copy: ()=>RoomState;

    /**
     * Returns the Player object for the player whose id is `id`.
     * 
     * @param id The id of the player to be returned.
     * 
     * @returns The Player object, or `null` if the player is not found.
     */
    getPlayer: (id)=>(Player | null);

    /**
     * Runs the simulation `count` steps. Use with extreme caution, especially on network rooms.
     * 
     * @param count Number of steps to run the simulation.
     * 
     * @returns void.
     */
    runSteps: (count: int)=>void;
  }

  /**
   * A class that defines the complete state of a room.
   */
  declare type RoomState = (RoomStateBase & SandboxModeFunctions);

  /**
   * A class that stores some detailed properties of a room. This instance is only received from the backend.
   */
  declare type RoomDataDetails = {

    /**
     * Version of this room.
     */
    version: number;

    /**
     * Name of this room.
     */
    name: string;

    /**
     * Country code of this room.
     */
    flag: string;

    /**
     * Latitude value of this room.
     */
    lat: number;

    /**
     * Longitude value of this room.
     */
    lon: number;

    /**
     * Whether this room is password-protected or not.
     */
    password: boolean;

    /**
     * Maximum allowed number of players in this room.
     */
    maxPlayers: number;

    /**
     * Current number of players in this room.
     */
    players: number;
  };

  /**
   * A class that stores the complete summary of properties of a room. This instance is only received from the backend.
   */
  declare type RoomData = {

    /**
     * Id of this room. You have to use this value in `Room.join`.
     */
    id: string;

    /**
     * Details of this room.
     */
    data: RoomDataDetails;

    /**
     * The calculated distance of this room to a specific GeoLocation.
     * Use `Utils.calculateAllRoomDistances` to calculate this value automatically.
     */
    dist: number;
  };

  /**
   * These events can only be received by a host room.
   */
  declare interface HostOnlyCallbacks {

    /**
     * The room link was received from Haxball's backend server. Called some time after a room is created successfully. Also called when your room stops sending signal to Haxball's backend server, and starts it again after some time. This can happen if your connection gets interrupted or the room somehow becomes unstable due to bugs.
     * 
     * @param {string} link The room link that was just received.
     * @param {any} customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onRoomLink?: (link: string, customData?: object)=>object|undefined;

    /**
     * Called just after all bans have been cleared using `room.clearBans()`.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBansClear?: (customData?: object)=>object|undefined;

    /**
     * Called just after the ban of a player has been cleared using `room.clearBan(id)`.
     * 
     * @param id Id of the player whose ban has just been cleared.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBanClear?: (id: uint16, customData?: object)=>object|undefined;

    /**
     * Called just after the room's recaptcha mode was changed using `room.requireRecaptcha = on`.
     * 
     * @param on The new value; whether to request recaptcha or not while joining the room.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onRoomRecaptchaModeChange?: (on: boolean, customData?: object)=>object|undefined;

    /**
     * Called just a little after the room's token was changed using `room.token = value`.
     * 
     * @param token The new token of the room.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onRoomTokenChange?: (token: string, customData?: object)=>object|undefined;
  }

  /**
   * These events can only be triggered by the room's host.
   */
  declare interface HostTriggeredCallbacks {

    /**
     * Called just after an announcement was made by the room host.
     * 
     * @param msg The announcement message.
     * @param color The color of the announcement message. Range: -1 <= `color` < 16777216. 
     *  - The color value can be converted into a rgba string via API's `Utils.numberToColor` function.
     *  - The special value `-1` means `transparent` color.
     * @param style The style of the announcement message. Must be one of the following:
     *  - 0: use document's default font style.
     *  - 1: fontWeight = "bold".
     *  - 2: fontStyle = "italic".
     *  - 3: fontSize = "12px".
     *  - 4: fontWeight = "bold", fontSize = "12px".
     *  - 5: fontWeight = "italic", fontSize = "12px".
     * @param sound The sound of the announcement message. Must be one of the following: 
     *  - 0: no sound.
     *  - 1: chat sound.
     *  - 2: highlight sound.
     * @param customData the custom data that was returned from the previous callback.
     *
     * @returns void or a custom data to pass to the next callback.
     */
    onAnnouncement?: (msg: string, color: int, style: int, sound: int, customData?: object)=>object|undefined,
    
    /**
     * Called just after a player has changed his/her headless avatar.
     * 
     * @param id Id of the player who triggered this event.
     * @param value The new headless avatar value.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPlayerHeadlessAvatarChange?: (id: int, value: string, customData?: object)=>object|undefined,

    /**
     * Called just after the order of players have been changed.
     * 
     * The ids of players that were removed from the room's players list, reordered to match the order in `idList` and added back to the room's players list.
     * @param idList The ids of players that were removed from the room's players list, reordered to match the order in `idList` and added back to the room's players list.
     * @param moveToTop Whether to add the players to the top or bottom of the room's players list.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPlayersOrderChange?: (idList: int[], moveToTop: boolean, customData?: object)=>object|undefined,

    /**
     * Called just after a disc's properties have been modified.
     * 
     * @param id The id of player or disc whose disc properties have changed.
     * @param type The type of object. Must be one of the following:
      - 0: disc.
      - 1: player.
    * @param data1 Must consist of the following properties of the disc in the same order: `[x, y, xspeed, yspeed, xgravity, ygravity, radius, bCoeff, invMass, damping]`.
    * @param data2 Must consist of the following properties of the disc in the same order: `[color, cMask, cGroup]`.
    * @param customData the custom data that was returned from the previous callback.
    * 
    * @returns void or a custom data to pass to the next callback.
    */
    onSetDiscProperties?: (id: int, type: int, data1: number[], data2: int[], customData?: object)=>object|undefined,

    /**
     * Called just after the ping values for all players have been updated.
     * 
     * @param array The updated list of ping values for each player in the same order as the player list in the current room's RoomState object.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPingData?: (array: int[], customData?: object)=>object|undefined,

    /**
     * Called just after the room's properties have been changed.
     * 
     * @param props The properties that were changed. The current structure of this object is as follows: 
      ```ts
      props = {
        name: string | null,
        password: string | null,
        fakePassword: boolean | null,
        geo: GeoLocation | null,
        playerCount: int | null,
        maxPlayerCount: int | null
      }
      ```
      Note that only the changed keys will show up in `props`.
    * @param customData the custom data that was returned from the previous callback.

    * @returns void or a custom data to pass to the next callback.
    */
    onRoomPropertiesChange?: (props: object, customData?: object)=>object|undefined
  }

  /**
   * These events can only be triggered by a room client.
   */
  declare interface ClientTriggeredCallbacks {
    
    /**
     * 
     * Called just after the ping value of the current player has been calculated.
     * 
     * @param instantPing the instant ping value at that moment
     * @param averagePing the calculated average ping value in a period of time
     * @param maxPing the calculated maximum ping value in a period of time
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPingChange?: (instantPing: number, averagePing: number, maxPing: number, customData?: object)=>object|undefined
  }

  declare interface GameCallbacks {

    /**
     * Called just after the ball has been kicked.
     * 
     * @param playerId Id of the player who kicked the ball.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPlayerBallKick?: (playerId: uint16, customData?: object)=>object|undefined,

    /**
     * Called just after a goal has been scored.
     * 
     * @param teamId Id of the team who scored the goal.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onTeamGoal?: (teamId: int, customData?: object)=>object|undefined,

    /**
     * Called just after the game has ended.
     * 
     * @param winningTeamId Id of the team who won the game.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onGameEnd?: (winningTeamId: int, customData?: object)=>object|undefined,

    /**
     * Called just after a game tick has occurred. This will run a lot of times per second. Be careful not to make too many calculations here, otherwise the game might slow down.
     * 
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onGameTick?: (customData?: object)=>object|undefined,

    /**
     * Called just after a kick off event has occurred.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onKickOff?: (customData?: object)=>object|undefined,

    /**
     * Called just after the game has ended by timeout.
     * 
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onTimeIsUp?: (customData?: object)=>object|undefined,

    /**
     * Called just after the player positions have been reset. This event happens just after a new game has been started or a goal has been scored. The player positions are reset to their corresponding spawn points defined in the current room's Stadium object.
     * 
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPositionsReset?: (customData?: object)=>object|undefined,

    /**
     * Called just after a collision has happened between two discs.
     * 
     * @param discId1 Id of the first collided disc.
     * @param discPlayerId1 The player's id that the first disc belongs to. If the disc is not a player's disc, this value will be null.
     * @param discId2 Id of the second collided disc.
     * @param discPlayerId2 The player's id that the second disc belongs to. If the disc is not a player's disc, this value will be null.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onCollisionDiscVsDisc?: (discId1: int, discPlayerId1: int, discId2: int, discPlayerId2: int, customData?: object)=>object|undefined,

    /**
     * Called just after a collision has happened between a disc and a segment.
     * 
     * @param discId Id of the collided disc.
     * @param discPlayerId The player's id that the disc belongs to. If the disc is not a player's disc, this value will be null.
     * @param segmentId Id of the collided segment.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onCollisionDiscVsSegment?: (discId: int, discPlayerId: int, segmentId: int, customData?: object)=>object|undefined,

    /**
     * Called just after a collision has happened between a disc and a plane.
     * 
     * @param discId Id of the collided disc.
     * @param discPlayerId The player's id that the disc belongs to. If the disc is not a player's disc, this value will be null.
     * @param planeId Id of the collided plane.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onCollisionDiscVsPlane?: (discId: int, discPlayerId: int, planeId: int, customData?: object)=>object|undefined
  }

  declare interface LocalCallbacks {

    /**
     * Called just after the local extrapolation value has been changed.
     * 
     * @param value The new extrapolation value in milliseconds. Range: `-200 <= value <= 200`.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onExtrapolationChange?: (value: int, customData?: object)=>object|undefined,

    /**
     * Called just after the local ping handicap value has been changed.
     * 
     * @param value The new ping handicap value in milliseconds. Range: `0 <= value <= 300`.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onHandicapChange?: (value: int, customData?: object)=>object|undefined,

    /**
     * Called just after room recording has been started or stopped.
     * 
     * @param value 
     * - If `true`, recording has just been started,
     * - Else, the recording has just stopped and the recorded data is returned in `value` as an `ArrayBuffer`. You might want to write the contents to a version-3 replay file.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onRoomRecordingChange?: (value: true | ArrayBuffer, customData?: object)=>object|undefined
  }

  declare interface APICallbacks {

    /**
     * Called just after a plugin has been activated or deactivated.
     * 
     * @param plugin The plugin which was activated or deactivated. This property stores the current activation status of the plugin: `plugin.active`.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPluginActiveChange?: (plugin: Plugin, customData?: object)=>object|undefined,

    /**
     * Called just after the room's config object has been replaced by a new one.
     * 
     * @param oldRoomConfigObj The old RoomConfig object.
     * @param newRoomConfigObj The new RoomConfig object.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onConfigUpdate?: (oldRoomConfigObj: RoomConfig, newRoomConfigObj: RoomConfig, customData?: object)=>object|undefined,

    /**
     * Called just after the room's renderer object has been replaced by a new one.
     * 
     * @param oldRendererObj The old Renderer object.
     * @param newRendererObj The new Renderer object.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onRendererUpdate?: (oldRendererObj: Renderer, newRendererObj: Renderer, customData?: object)=>object|undefined,

    /**
     * Called just after an old plugin object has been replaced by a new one.
     * 
     * @param oldPluginObj The old Plugin object.
     * @param newPluginObj The new Plugin object.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPluginUpdate?: (oldPluginObj: Plugin, newPluginObj: Plugin, customData?: object)=>object|undefined,

    /**
     * Called just after an old library object has been replaced by a new one.
     * 
     * @param oldLibraryObj The old Library object.
     * @param newLibraryObj The new Library object.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onLibraryUpdate?: (oldLibraryObj: Library, newLibraryObj: Library, customData?: object)=>object|undefined,

    /**
     * Called just after the API's language has been changed.
     * 
     * @param abbr The new language's abbreviation value.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onLanguageChange?: (abbr: string, customData?: object)=>object|undefined,

    /**
     * Called just after the value of a variable has been changed.
     * 
     * @param addonObject The Addon object that the variable belongs to.
     * @param variableName The name of the variable whose value has been changeed.
     * @param oldValue The old value of the variable.
     * @param newValue The new value of the variable.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onVariableValueChange?: (addonObject: Addon, variableName: string, oldValue: any, newValue: any, customData?: object)=>object|undefined
  }

  declare type IndividuallyTriggeredCallbacks = GameCallbacks & LocalCallbacks & APICallbacks;

  declare interface CommonCallbacks {

    /**
     * Called just after a player's synchronization status has changed.
     * 
     * @param playerId Id of the player whose synchronization status has changed.
     * @param value The new synchronization status.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPlayerSyncChange?: (playerId: uint16, value: boolean, customData?: object)=>object|undefined,

    /**
     * Called just after an "auto" event has been triggered to automatically move at least one, at most two players from spectators to teams.
     * 
     * @param playerId1 Id of the first player affected by this event.
     * @param teamId1 Id of the team which the first player was moved into.
     * @param playerId2 Id of the second player affected by this event, or `null` if there was only one spectator when this event was triggered.
     * @param teamId2 Id of the team which the second player was moved into, or `null` if there was only one spectator when this event was triggered.
     * @param byId Id of the player who has triggered the event.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onAutoTeams?: (playerId1: uint16, teamId1: int, playerId2: uint16 | null, teamId2: int | null, byId: uint16, customData?: object)=>object|undefined,

    /**
     * Called just after the score limit has been changed.
     * 
     * @param value The new score limit value.
     * @param byId Id of the player who has triggered this event.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onScoreLimitChange?: (value: int, byId: uint16, customData?: object)=>object|undefined,

    /**
     * Called just after the time limit has been changed.
     * 
     * @param value The new time limit value.
     * @param byId Id of the player who has triggered this event.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onTimeLimitChange?: (value: int, byId: uint16, customData?: object)=>object|undefined,

    /**
     * Called just after a player's admin rights have been given/taken.
     * 
     * @param id Id of the player whose admin rights have been given/taken.
     * @param isAdmin The new admin rights status of the player whose id is `id`.
     * @param byId Id of the player who has triggered this event.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPlayerAdminChange?: (id: uint16, isAdmin: boolean, byId: uint16, customData?: object)=>object|undefined,

    /**
     * Called just after a player has changed his/her avatar.
     * 
     * @param id Id of the player who has changed his/her avatar.
     * @param value The new avatar value.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPlayerAvatarChange?: (id: uint16, value: string, customData?: object)=>object|undefined,

    /**
     * Called just after a player has been moved to a different team.
     * 
     * @param id Id of the player who has been moved to a different team.
     * @param teamId Id of the player's new team.
     * @param byId Id of the player who has triggered this event.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPlayerTeamChange?: (id: uint16, teamId: int, byId: uint16, customData?: object)=>object|undefined,

    /**
     * Called just after the room's current stadium has been changed.
     * 
     * @param stadium The room's new Stadium object.
     * @param byId Id of the player who has triggered this event.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onStadiumChange?: (stadium: Stadium, byId: uint16, customData?: object)=>object|undefined,

    /**
     * Called just after the room's teams have been locked/unlocked.
     * 
     * @param value The room's new teams lock value.
     * @param byId Id of the player who has triggered this event.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onTeamsLockChange?: (value: boolean, byId: uint16, customData?: object)=>object|undefined,

    /**
     * Called just after a player object has been created. This callback can be used to define custom properties inside all player objects.
     * 
     * @param playerObj The new Player object that has just been created.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPlayerObjectCreated?: (playerObj: Player, customData?: object)=>object|undefined,

    /**
     * Called just after a disc object has been assigned to a player object.
     * 
     * @param playerObj The new Player object that has just been assigned a disc object.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPlayerDiscCreated?: (playerObj: Player, customData?: object)=>object|undefined,

    /**
     * Called just after a disc object has been removed from a player object.
     * 
     * @param playerObj The Player object whose disc object has just been removed.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPlayerDiscDestroyed?: (playerObj: Player, customData?: object)=>object|undefined,

    /**
     * Called just after a player has joined the room.
     * 
     * @param playerObj The data representation of the player that has just joined the room.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPlayerJoin?: (playerObj: Player, customData?: object)=>object|undefined,

    /**
     * Called just after the game has been paused or resumed.
     * 
     * @param isPaused Whether the game has been paused or not.
     * @param byId Id of the player who has triggered this event.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onGamePauseChange?: (isPaused: boolean, byId: uint16, customData?: object)=>object|undefined,

    /**
     * Called just after a chat message has been received.
     * 
     * @param id Id of the player who has sent the chat message.
     * @param message The chat message.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPlayerChat?: (id: uint16, message: string, customData?: object)=>object|undefined,

    /**
     * Called just after a player's input has been changed.
     * 
     * @param id Id of the player whose input has been changed.
     * @param value The new input value of the player.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPlayerInputChange?: (id: uint16, value: int, customData?: object)=>object|undefined,

    /**
     * Called just after a player has activated or deactivated his/her chat indicator. This happens when a player focuses/loses focus on the chat input component in the website.
     * 
     * @param id Id of the player whose chat indicator has been activated/deactivated.
     * @param value Whether the chat indicator has been activated or not.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPlayerChatIndicatorChange?: (id: uint16, value: boolean, customData?: object)=>object|undefined,

    /**
     * Called just after a player has left the room.
     * 
     * @param playerObj The player who has left the room.
     * @param reason The reason of leaving the room. If `null`, the player has left by himself/herself.
     * @param isBanned Whether the player has been banned or not. If `reason` is `null`, this value is ignored.
     * @param byId Id of the player who has kicked/banned the player. If `reason` is `null`, this value is ignored.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onPlayerLeave?: (playerObj: Player, reason: string | null, isBanned: boolean, byId: uint16, customData?: object)=>object|undefined,

    /**
     * Called just after a team's colors have been changed.
     * 
     * @param teamId The team whose colors have been changed.
     * @param value The new team colors value.
     * @param byId Id of the player who has changed the team colors.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onTeamColorsChange?: (teamId: int, value: TeamColors, byId: uint16, customData?: object)=>object|undefined,

    /**
     * Called just after the room's kick rate limit has been changed.
     * 
     * @param min The new `min` part of kick rate limit.
     * @param rate The new `rate` part of kick rate limit.
     * @param burst The new `burst` part of kick rate limit.
     * @param byId Id of the player who has changed the kick rate limit.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onKickRateLimitChange?: (min: int, rate: int, burst: int, byId: uint16, customData?: object)=>object|undefined,

    /**
     * Called just after the game has been started.
     * 
     * @param byId Id of the player who has started the game.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onGameStart?: (byId: uint16, customData?: object)=>object|undefined,

    /**
     * Called just after the game has been stopped.
     * 
     * @param byId Id of the player who has stopped the game.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onGameStop?: (byId: uint16, customData?: object)=>object|undefined
  }

  /**
   * Beware that these callbacks do not exist in Renderer objects, but they do in all RoomConfig and Plugin objects.
   */
  declare interface ModifierCallbacks {

    /**
     * Called just before the player has joined the room. Using this callback, you may block all players or modify all players' name, flag and avatar properties just before they join the room.
     * 
     * @param playerId Id of the new player who is about to join the room.
     * @param name Name of the new player who is about to join the room.
     * @param flag Country code of the new player who is about to join the room.
     * @param avatar Avatar of the new player who is about to join the room.
     * @param conn Connection string of the new player who is about to join the room.
     * @param auth Auth string of the new player who is about to join the room.
     * 
     * @returns 
     *   - `null`: Blocks the player from joining the room.
     *   - `[modifiedName: string, modifiedFlag: string, modifiedAvatar: string]`: Modifies the name, flag and avatar values.
     */
    modifyPlayerData?: (playerId: uint16, name: string, flag: string, avatar: string, conn: string, auth: string, customData?: object)=>[modifiedName: string, modifiedFlag: string, modifiedAvatar: string],

    /**
     * If defined, runs for all players except host in a host room. Modifies the `ping` value of the player whose id is `playerId`. 
     * Host player's ping will not change using this callback. In order to change host player's ping, you need to modify `room.hostPing` value directly.
     * 
     * @param playerId Id of the current player.
     * @param ping Current ping value of the current player.
     * 
     * @returns The new ping value of the current player.
     */
    modifyPlayerPing?: (playerId: uint16, ping: int, customData?: object)=>number,

    /**
     * If defined, runs only for the current player in a client room and modifies its `ping` value.
     * 
     * @param ping Current ping value of the current player.
     * 
     * @returns The new ping value of the current player.
     */
    modifyClientPing?: (ping: int, customData?: object)=>number,

    /**
     * If defined, expects us to return the physics engine's new current `frameNo` value, which tells the physics engine that it is currently on a different frame than expected, which causes your player to look laggy to your opponents, especially on extrapolated clients.
     * 
     * @param frameNo Current frameNo value of the physics engine.
     * 
     * @returns The new frameNo value of the physics engine.
     */
    modifyFrameNo?: (frameNo: int, customData?: object)=>int,

    /**
     * If defined, runs for each message received from all clients in a host room, before they are processed and sent to all clients. This is the most important callback inside a host room; all permission logic should reside here. You are also allowed to freely modify the contents of all messages here.
     * 
     * @param type Type of the received message. We have to look it up in the global `OperationType` object to understand what type of message it actually is.
     * @param msg The original message object. We can directly modify all contents of this object here as we wish.
     * @param globalFrameNo The global frame no that host's physics engine is at, at the time that the message is received.
     * @param clientFrameNo The frame no that this client's physics engine is at, at the time that the message is received.
     * 
     * @returns 
     *   - `true`: accept event.
     *   - `false`: block message from being processed. 
     *   - `throw exception`: break the connection of the sender of this message.
     */
    onOperationReceived?: (type: OperationType, msg: HaxballEvent, globalFrameNo: int, clientFrameNo: int, customData?: object)=>boolean
  }

  declare interface CustomCallbacks {

    /**
     * Called just after a custom event has been triggered.
     * 
     * @param type Any integer value to hold the type of the custom event.
     * @param data Any JSON object to store the properties of the custom event. This object is converted to a string and sent/received by Haxball's original event mechanism.
     * @param byId Id of the player who has triggered this custom event.
     * @param customData Any custom data that might be returned from the previous addon's calback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onCustomEvent?: (type: uint32, data: object, byId: uint16, customData?: object)=>object|undefined

    /**
     * Called just after a binary custom event has been triggered.
     * 
     * @param type Any integer value to hold the type of the custom event.
     * @param data Any Uint8Array to store the properties of the custom event. This object is directly sent/received by Haxball's original event mechanism.
     * @param byId Id of the player who has triggered this custom event.
     * @param customData Any custom data that might be returned from the previous addon's calback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBinaryCustomEvent?: (type: uint32, data: Uint8Array, byId: uint16, customData?: object)=>object|undefined

    /**
     * Called just after an identity event has been triggered.
     * 
     * @param id Id of the player whose identity data is desired to be changed.
     * @param data The identity data that should be received from the backend. It can be any JSON object.
     * @param byId Id of the player who has triggered this custom event.
     * @param customData Any custom data that might be returned from the previous addon's calback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onIdentityEvent?: (id: uint16, data: object, byId: uint16, customData?: object)=>object|undefined
  }

  declare interface HostOnlyRoomConfigCallbacks {

    /**
     * The room link was received from Haxball's backend server. Called some time after a room is created successfully. Also called when your room stops sending signal to Haxball's backend server, and starts it again after some time. This can happen if your connection gets interrupted or the room somehow becomes unstable due to bugs.
     * 
     * @param link The room link that was just received.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeRoomLink?: (link: string)=>object|undefined,

    /**
     * The room link was received from Haxball's backend server. Called some time after a room is created successfully. Also called when your room stops sending signal to Haxball's backend server, and starts it again after some time. This can happen if your connection gets interrupted or the room somehow becomes unstable due to bugs.
     * 
     * @param link The room link that was just received.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterRoomLink?: (link: string, customData?: object)=>void,

    /**
     * Called just after all bans have been cleared using `room.clearBans()`.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeBansClear?: ()=>object|undefined,

    /**
     * Called just after all bans have been cleared using `room.clearBans()`.
     * 
     * @returns void.
     */
    onAfterBansClear?: (customData?: object)=>void,

    /**
     * Called just after the ban of a player has been cleared using `room.clearBan(id)`.
     * 
     * @param id Id of the player whose ban has just been cleared.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeBanClear?: (id: int)=>object|undefined;

    /**
     * Called just after the ban of a player has been cleared using `room.clearBan(id)`.
     * 
     * @param id Id of the player whose ban has just been cleared.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterBanClear?: (id: int, customData?: object)=>void;

    /**
     * Called just after the room's recaptcha mode was changed using `room.requireRecaptcha = value`.
     * 
     * @param on The new value; whether to request recaptcha or not while joining the room.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeRoomRecaptchaModeChange?: (on: boolean)=>object|undefined,

    /**
     * Called just after the room's recaptcha mode was changed using `room.requireRecaptcha = value`.
     * 
     * @param on The new value; whether to request recaptcha or not while joining the room.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterRoomRecaptchaModeChange?: (on: boolean, customData?: object)=>void

    /**
     * Called just a little after the room's token was changed using `room.token = value`.
     * 
     * @param token The new token of the room.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeRoomTokenChange?: (token: string)=>object|undefined;

    /**
     * Called just a little after the room's token was changed using `room.token = value`.
     * 
     * @param token The new token of the room.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterRoomTokenChange?: (token: string, customData?: object)=>void;
  }

  declare interface HostTriggeredRoomConfigCallbacks {

    /**
     * Called just after an announcement was made by the room host.
     * 
     * @param msg The announcement message.
     * @param color The color of the announcement message. Range: -1 <= `color` < 16777216. 
      - The color value can be converted into a rgba string via API's `Utils.numberToColor` function.
      - The special value `-1` means `transparent` color.
    * @param style The style of the announcement message. Must be one of the following:
      - 0: use document's default font style.
      - 1: fontWeight = "bold".
      - 2: fontStyle = "italic".
      - 3: fontSize = "12px".
      - 4: fontWeight = "bold", fontSize = "12px".
      - 5: fontWeight = "italic", fontSize = "12px".
    * @param sound The sound of the announcement message. Must be one of the following: 
      - 0: no sound.
      - 1: chat sound.
      - 2: highlight sound.
    * @param customData the custom data that was returned from the previous callback.

    * @returns void or a custom data to pass to the next callback.
    */
    onBeforeAnnouncement?: (msg: string, color: int, style: int, sound: int)=>object|undefined,

    /**
     * Called just after an announcement was made by the room host.
     * 
     * @param msg The announcement message.
     * @param color The color of the announcement message. Range: -1 <= `color` < 16777216. 
      - The color value can be converted into a rgba string via API's `Utils.numberToColor` function.
      - The special value `-1` means `transparent` color.
    * @param style The style of the announcement message. Must be one of the following:
      - 0: use document's default font style.
      - 1: fontWeight = "bold".
      - 2: fontStyle = "italic".
      - 3: fontSize = "12px".
      - 4: fontWeight = "bold", fontSize = "12px".
      - 5: fontWeight = "italic", fontSize = "12px".
    * @param sound The sound of the announcement message. Must be one of the following: 
      - 0: no sound.
      - 1: chat sound.
      - 2: highlight sound.
    * @param customData the custom data that was returned from the previous callback.

    * @returns void.
    */
    onAfterAnnouncement?: (msg: string, color: int, style: int, sound: int, customData?: object)=>void,
    
    /**
     * Called just after a player has changed his/her headless avatar.
     * 
     * @param id Id of the player who triggered this event.
     * @param value The new headless avatar value.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePlayerHeadlessAvatarChange?: (id: int, value: string)=>object|undefined,
    
    /**
     * Called just after a player has changed his/her headless avatar.
     * 
     * @param id Id of the player who triggered this event.
     * @param value The new headless avatar value.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterPlayerHeadlessAvatarChange?: (id: int, value: string, customData?: object)=>void,

    /**
     * Called just after the order of players have been changed.
     * 
     * The ids of players that were removed from the room's players list, reordered to match the order in `idList` and added back to the room's players list.
     * @param idList The ids of players that were removed from the room's players list, reordered to match the order in `idList` and added back to the room's players list.
     * @param moveToTop Whether to add the players to the top or bottom of the room's players list.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePlayersOrderChange?: (idList: int[], moveToTop: boolean)=>object|undefined,

    /**
     * Called just after the order of players have been changed.
     * 
     * The ids of players that were removed from the room's players list, reordered to match the order in `idList` and added back to the room's players list.
     * @param idList The ids of players that were removed from the room's players list, reordered to match the order in `idList` and added back to the room's players list.
     * @param moveToTop Whether to add the players to the top or bottom of the room's players list.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterPlayersOrderChange?: (idList: int[], moveToTop: boolean, customData?: object)=>void,

    /**
     * Called just after a disc's properties have been modified.
     * 
     * @param id The id of player or disc whose disc properties have changed.
     * @param type The type of object. Must be one of the following:
      - 0: disc.
      - 1: player.
    * @param data1 Must consist of the following properties of the disc in the same order: `[x, y, xspeed, yspeed, xgravity, ygravity, radius, bCoeff, invMass, damping]`.
    * @param data2 Must consist of the following properties of the disc in the same order: `[color, cMask, cGroup]`.
    * @param customData the custom data that was returned from the previous callback.
    * 
    * @returns void or a custom data to pass to the next callback.
    */
    onBeforeSetDiscProperties?: (id: int, type: int, data1: number[], data2: int[])=>object|undefined,

    /**
     * Called just after a disc's properties have been modified.
     * 
     * @param id The id of player or disc whose disc properties have changed.
     * @param type The type of object. Must be one of the following:
      - 0: disc.
      - 1: player.
    * @param data1 Must consist of the following properties of the disc in the same order: `[x, y, xspeed, yspeed, xgravity, ygravity, radius, bCoeff, invMass, damping]`.
    * @param data2 Must consist of the following properties of the disc in the same order: `[color, cMask, cGroup]`.
    * @param customData the custom data that was returned from the previous callback.
    * 
    * @returns void.
    */
    onAfterSetDiscProperties?: (id: int, type: int, data1: number[], data2: int[], customData?: object)=>void,

    /**
     * Called just after the ping values for all players have been updated.
     * 
     * @param array The updated list of ping values for each player in the same order as the player list in the current room's RoomState object.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePingData?: (array: int[])=>object|undefined,

    /**
     * Called just after the ping values for all players have been updated.
     * 
     * @param array The updated list of ping values for each player in the same order as the player list in the current room's RoomState object.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterPingData?: (array: int[], customData?: object)=>void,

    /**
     * Called just after the room's properties have been changed.
     * 
     * @param props The properties that were changed. The current structure of this object is as follows: 
      ```ts
      props = {
        name: string | null,
        password: string | null,
        fakePassword: boolean | null,
        geo: GeoLocation | null,
        playerCount: int | null,
        maxPlayerCount: int | null
      }
      ```
      Note that only the changed keys will show up in `props`.
    * @param customData the custom data that was returned from the previous callback.
    *
    * @returns void or a custom data to pass to the next callback.
    */
    onBeforeRoomPropertiesChange?: (props: object)=>object|undefined,
    
    /**
     * Called just after the room's properties have been changed.
     * 
     * @param props The properties that were changed. The current structure of this object is as follows: 
      ```ts
      props = {
        name: string | null,
        password: string | null,
        fakePassword: boolean | null,
        geo: GeoLocation | null,
        playerCount: int | null,
        maxPlayerCount: int | null
      }
      ```
      Note that only the changed keys will show up in `props`.
      * @param customData the custom data that was returned from the previous callback.
      *
      * @returns void.
      */
    onAfterRoomPropertiesChange?: (props: object, customData?: object)=>void
  }

  declare interface ClientTriggeredRoomConfigCallbacks {
    
    /**
     * 
     * Called just after the ping value of the current player has been calculated.
     * 
     * @param instantPing the instant ping value at that moment
     * @param averagePing the calculated average ping value in a period of time
     * @param maxPing the calculated maximum ping value in a period of time
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePingChange?: (instantPing: number, averagePing: number, maxPing: number)=>object|undefined
    
    /**
     * 
     * Called just after the ping value of the current player has been calculated.
     * 
     * @param instantPing the instant ping value at that moment
     * @param averagePing the calculated average ping value in a period of time
     * @param maxPing the calculated maximum ping value in a period of time
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterPingChange?: (instantPing: number, averagePing: number, maxPing: number, customData?: object)=>void
  }

  declare interface GameRoomConfigCallbacks {

    /**
     * Called just after the ball has been kicked.
     * 
     * @param playerId Id of the player who kicked the ball.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePlayerBallKick?: (playerId: uint16)=>object|undefined,

    /**
     * Called just after the ball has been kicked.
     * 
     * @param playerId Id of the player who kicked the ball.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterPlayerBallKick?: (playerId: uint16, customData?: object)=>void,

    /**
     * Called just after a goal has been scored.
     * 
     * @param teamId Id of the team who scored the goal.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeTeamGoal?: (teamId: int)=>object|undefined,

    /**
     * Called just after a goal has been scored.
     * 
     * @param teamId Id of the team who scored the goal.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterTeamGoal?: (teamId: int, customData?: object)=>void,

    /**
     * Called just after the game has ended.
     * 
     * @param winningTeamId Id of the team who won the game.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeGameEnd?: (winningTeamId: int)=>object|undefined,

    /**
     * Called just after the game has ended.
     * 
     * @param winningTeamId Id of the team who won the game.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterGameEnd?: (winningTeamId: int, customData?: object)=>void,

    /**
     * Called just after a game tick has occurred. This will run a lot of times per second. Be careful not to make too many calculations here, otherwise the game might slow down.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeGameTick?: ()=>object|undefined,

    /**
     * Called just after a game tick has occurred. This will run a lot of times per second. Be careful not to make too many calculations here, otherwise the game might slow down.
     * 
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterGameTick?: (customData?: object)=>void,

    /**
     * Called just after a kick off event has occurred.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeKickOff?: ()=>object|undefined,

    /**
     * Called just after a kick off event has occurred.
     * 
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterKickOff?: (customData?: object)=>void,

    /**
     * Called just after the game has ended by timeout.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeTimeIsUp?: ()=>object|undefined,

    /**
     * Called just after the game has ended by timeout.
     * 
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterTimeIsUp?: (customData?: object)=>void,

    /**
     * Called just after the player positions have been reset. This event happens just after a new game has been started or a goal has been scored. The player positions are reset to their corresponding spawn points defined in the current room's Stadium object.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePositionsReset?: ()=>object|undefined,

    /**
     * Called just after the player positions have been reset. This event happens just after a new game has been started or a goal has been scored. The player positions are reset to their corresponding spawn points defined in the current room's Stadium object.
     * 
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterPositionsReset?: (customData?: object)=>void,

    /**
     * Called just after a collision has happened between two discs.
     * 
     * @param discId1 Id of the first collided disc.
     * @param discPlayerId1 The player's id that the first disc belongs to. If the disc is not a player's disc, this value will be null.
     * @param discId2 Id of the second collided disc.
     * @param discPlayerId2 The player's id that the second disc belongs to. If the disc is not a player's disc, this value will be null.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeCollisionDiscVsDisc?: (discId1: int, discPlayerId1: uint16, discId2: int, discPlayerId2: uint16)=>object|undefined,

    /**
     * Called just after a collision has happened between two discs.
     * 
     * @param discId1 Id of the first collided disc.
     * @param discPlayerId1 The player's id that the first disc belongs to. If the disc is not a player's disc, this value will be null.
     * @param discId2 Id of the second collided disc.
     * @param discPlayerId2 The player's id that the second disc belongs to. If the disc is not a player's disc, this value will be null.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterCollisionDiscVsDisc?: (discId1: int, discPlayerId1: uint16, discId2: int, discPlayerId2: uint16, customData?: object)=>void,

    /**
     * Called just after a collision has happened between a disc and a segment.
     * 
     * @param discId Id of the collided disc.
     * @param discPlayerId The player's id that the disc belongs to. If the disc is not a player's disc, this value will be null.
     * @param segmentId Id of the collided segment.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeCollisionDiscVsSegment?: (discId: int, discPlayerId: uint16, segmentId: int)=>object|undefined,

    /**
     * Called just after a collision has happened between a disc and a segment.
     * 
     * @param discId Id of the collided disc.
     * @param discPlayerId The player's id that the disc belongs to. If the disc is not a player's disc, this value will be null.
     * @param segmentId Id of the collided segment.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterCollisionDiscVsSegment?: (discId: int, discPlayerId: uint16, segmentId: int, customData?: object)=>void,

    /**
     * Called just after a collision has happened between a disc and a plane.
     * 
     * @param discId Id of the collided disc.
     * @param discPlayerId The player's id that the disc belongs to. If the disc is not a player's disc, this value will be null.
     * @param planeId Id of the collided plane.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeCollisionDiscVsPlane?: (discId: int, discPlayerId: uint16, planeId: int)=>object|undefined,

    /**
     * Called just after a collision has happened between a disc and a plane.
     * 
     * @param discId Id of the collided disc.
     * @param discPlayerId The player's id that the disc belongs to. If the disc is not a player's disc, this value will be null.
     * @param planeId Id of the collided plane.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterCollisionDiscVsPlane?: (discId: int, discPlayerId: uint16, planeId: int, customData?: object)=>void
  }

  declare interface LocalRoomConfigCallbacks {

    /**
     * Called just after the local extrapolation value has been changed.
     * 
     * @param value The new extrapolation value in milliseconds. Range: `-200 <= value <= 200`.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeExtrapolationChange?: (value: int)=>object|undefined,

    /**
     * Called just after the local extrapolation value has been changed.
     * 
     * @param value The new extrapolation value in milliseconds. Range: `-200 <= value <= 200`.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterExtrapolationChange?: (value: int, customData?: object)=>void,

    /**
     * Called just after the local ping handicap value has been changed.
     * 
     * @param value The new ping handicap value in milliseconds. Range: `0 <= value <= 300`.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeHandicapChange?: (value: int)=>object|undefined,

    /**
     * Called just after the local ping handicap value has been changed.
     * 
     * @param value The new ping handicap value in milliseconds. Range: `0 <= value <= 300`.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterHandicapChange?: (value: int, customData?: object)=>void,

    /**
     * Called just after room recording has been started or stopped.
     * 
     * @param value 
     * - If `true`, recording has just been started,
     * - Else, the recording has just stopped and the recorded data is returned in `value` as an `ArrayBuffer`. You might want to write the contents to a version-3 replay file.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeRoomRecordingChange?: (value: true | ArrayBuffer)=>object|undefined,

    /**
     * Called just after room recording has been started or stopped.
     * 
     * @param value 
     * - If `true`, recording has just been started,
     * - Else, the recording has just stopped and the recorded data is returned in `value` as an `ArrayBuffer`. You might want to write the contents to a version-3 replay file.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterRoomRecordingChange?: (value: true | ArrayBuffer, customData?: object)=>void
  }

  declare interface APIRoomConfigCallbacks {

    /**
     * Called just after a plugin has been activated or deactivated.
     * 
     * @param plugin The plugin which was activated or deactivated. This property stores the current activation status of the plugin: `plugin.active`.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePluginActiveChange?: (plugin: Plugin)=>object|undefined,

    /**
     * Called just after a plugin has been activated or deactivated.
     * 
     * @param plugin The plugin which was activated or deactivated. This property stores the current activation status of the plugin: `plugin.active`.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterPluginActiveChange?: (plugin: Plugin, customData?: object)=>void,

    /**
     * Called just after the room's config object has been replaced by a new one.
     * 
     * @param oldRoomConfigObj The old RoomConfig object.
     * @param newRoomConfigObj The new RoomConfig object.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeConfigUpdate?: (oldRoomConfigObj: RoomConfig, newRoomConfigObj: RoomConfig)=>object|undefined,

    /**
     * Called just after the room's config object has been replaced by a new one.
     * 
     * @param oldRoomConfigObj The old RoomConfig object.
     * @param newRoomConfigObj The new RoomConfig object.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterConfigUpdate?: (oldRoomConfigObj: RoomConfig, newRoomConfigObj: RoomConfig, customData?: object)=>void,

    /**
     * Called just after the room's renderer object has been replaced by a new one.
     * 
     * @param oldRendererObj The old Renderer object.
     * @param newRendererObj The new Renderer object.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeRendererUpdate?: (oldRendererObj: Renderer, newRendererObj: Renderer)=>object|undefined,

    /**
     * Called just after the room's renderer object has been replaced by a new one.
     * 
     * @param oldRendererObj The old Renderer object.
     * @param newRendererObj The new Renderer object.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterRendererUpdate?: (oldRendererObj: Renderer, newRendererObj: Renderer, customData?: object)=>void,

    /**
     * Called just after an old plugin object has been replaced by a new one.
     * 
     * @param oldPluginObj The old Plugin object.
     * @param newPluginObj The new Plugin object.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePluginUpdate?: (oldPluginObj: Plugin, newPluginObj: Plugin)=>object|undefined,

    /**
     * Called just after an old plugin object has been replaced by a new one.
     * 
     * @param oldPluginObj The old Plugin object.
     * @param newPluginObj The new Plugin object.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterPluginUpdate?: (oldPluginObj: Plugin, newPluginObj: Plugin, customData?: object)=>void,

    /**
     * Called just after an old library object has been replaced by a new one.
     * 
     * @param oldLibraryObj The old Library object.
     * @param newLibraryObj The new Library object.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeLibraryUpdate?: (oldLibraryObj: Library, newLibraryObj: Library)=>object|undefined,

    /**
     * Called just after an old library object has been replaced by a new one.
     * 
     * @param oldLibraryObj The old Library object.
     * @param newLibraryObj The new Library object.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterLibraryUpdate?: (oldLibraryObj: Library, newLibraryObj: Library, customData?: object)=>void,

    /**
     * Called just after the API's language has been changed.
     * 
     * @param abbr The new language's abbreviation value.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeLanguageChange?: (abbr: string)=>object|undefined,

    /**
     * Called just after the API's language has been changed.
     * 
     * @param abbr The new language's abbreviation value.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterLanguageChange?: (abbr: string, customData?: object)=>void

    /**
     * Called just after the value of a variable has been changed.
     * 
     * @param addonObject The Addon object that the variable belongs to.
     * @param variableName The name of the variable whose value has been changeed.
     * @param oldValue The old value of the variable.
     * @param newValue The new value of the variable.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeVariableValueChange?: (addonObject: Addon, variableName: string, oldValue: any, newValue: any)=>object|undefined

    /**
     * Called just after the value of a variable has been changed.
     * 
     * @param addonObject The Addon object that the variable belongs to.
     * @param variableName The name of the variable whose value has been changeed.
     * @param oldValue The old value of the variable.
     * @param newValue The new value of the variable.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterVariableValueChange?: (addonObject: Addon, variableName: string, oldValue: any, newValue: any, customData?: object)=>void
  }

  declare type IndividuallyTriggeredRoomConfigCallbacks = GameRoomConfigCallbacks & LocalRoomConfigCallbacks & APIRoomConfigCallbacks;

  declare interface CommonRoomConfigCallbacks {

    /**
     * Called just after a player's synchronization status has changed.
     * 
     * @param playerId Id of the player whose synchronization status has changed.
     * @param value The new synchronization status.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePlayerSyncChange?: (playerId: uint16, value: boolean)=>object|undefined,

    /**
     * Called just after a player's synchronization status has changed.
     * 
     * @param playerId Id of the player whose synchronization status has changed.
     * @param value The new synchronization status.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterPlayerSyncChange?: (playerId: uint16, value: boolean, customData?: object)=>void,

    /**
     * Called just after an "auto" event has been triggered to automatically move at least one, at most two players from spectators to teams.
     * 
     * @param playerId1 Id of the first player affected by this event.
     * @param teamId1 Id of the team which the first player was moved into.
     * @param playerId2 Id of the second player affected by this event, or `null` if there was only one spectator when this event was triggered.
     * @param teamId2 Id of the team which the second player was moved into, or `null` if there was only one spectator when this event was triggered.
     * @param byId Id of the player who has triggered the event.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeAutoTeams?: (playerId1: uint16, teamId1: int, playerId2: uint16 | null, teamId2: int | null, byId: uint16)=>object|undefined,

    /**
     * Called just after an "auto" event has been triggered to automatically move at least one, at most two players from spectators to teams.
     * 
     * @param playerId1 Id of the first player affected by this event.
     * @param teamId1 Id of the team which the first player was moved into.
     * @param playerId2 Id of the second player affected by this event, or `null` if there was only one spectator when this event was triggered.
     * @param teamId2 Id of the team which the second player was moved into, or `null` if there was only one spectator when this event was triggered.
     * @param byId Id of the player who has triggered the event.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterAutoTeams?: (playerId1: uint16, teamId1: int, playerId2: uint16 | null, teamId2: int | null, byId: uint16, customData?: object)=>void,

    /**
     * Called just after the score limit has been changed.
     * 
     * @param value The new score limit value.
     * @param byId Id of the player who has triggered this event.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeScoreLimitChange?: (value: int, byId: uint16)=>object|undefined,

    /**
     * Called just after the score limit has been changed.
     * 
     * @param value The new score limit value.
     * @param byId Id of the player who has triggered this event.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterScoreLimitChange?: (value: int, byId: uint16, customData?: object)=>void,

    /**
     * Called just after the time limit has been changed.
     * 
     * @param value The new time limit value.
     * @param byId Id of the player who has triggered this event.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeTimeLimitChange?: (value: int, byId: uint16)=>object|undefined,

    /**
     * Called just after the time limit has been changed.
     * 
     * @param value The new time limit value.
     * @param byId Id of the player who has triggered this event.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterTimeLimitChange?: (value: int, byId: uint16, customData?: object)=>void,

    /**
     * Called just after a player's admin rights have been given/taken.
     * 
     * @param id Id of the player whose admin rights have been given/taken.
     * @param isAdmin The new admin rights status of the player whose id is `id`.
     * @param byId Id of the player who has triggered this event.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePlayerAdminChange?: (id: uint16, isAdmin: boolean, byId: uint16)=>object|undefined,

    /**
     * Called just after a player's admin rights have been given/taken.
     * 
     * @param id Id of the player whose admin rights have been given/taken.
     * @param isAdmin The new admin rights status of the player whose id is `id`.
     * @param byId Id of the player who has triggered this event.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterPlayerAdminChange?: (id: uint16, isAdmin: boolean, byId: uint16, customData?: object)=>void,

    /**
     * Called just after a player has changed his/her avatar.
     * 
     * @param id Id of the player who has changed his/her avatar.
     * @param value The new avatar value.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePlayerAvatarChange?: (id: uint16, value: string)=>object|undefined,

    /**
     * Called just after a player has changed his/her avatar.
     * 
     * @param id Id of the player who has changed his/her avatar.
     * @param value The new avatar value.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterPlayerAvatarChange?: (id: uint16, value: string, customData?: object)=>void,

    /**
     * Called just after a player has been moved to a different team.
     * 
     * @param id Id of the player who has been moved to a different team.
     * @param teamId Id of the player's new team.
     * @param byId Id of the player who has triggered this event.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePlayerTeamChange?: (id: uint16, teamId: int, byId: uint16)=>object|undefined,

    /**
     * Called just after a player has been moved to a different team.
     * 
     * @param id Id of the player who has been moved to a different team.
     * @param teamId Id of the player's new team.
     * @param byId Id of the player who has triggered this event.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterPlayerTeamChange?: (id: uint16, teamId: int, byId: uint16, customData?: object)=>void,

    /**
     * Called just after the room's current stadium has been changed.
     * 
     * @param stadium The room's new Stadium object.
     * @param byId Id of the player who has triggered this event.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeStadiumChange?: (stadium: Stadium, byId: uint16)=>object|undefined,

    /**
     * Called just after the room's current stadium has been changed.
     * 
     * @param stadium The room's new Stadium object.
     * @param byId Id of the player who has triggered this event.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterStadiumChange?: (stadium: Stadium, byId: uint16, customData?: object)=>void,

    /**
     * Called just after the room's teams have been locked/unlocked.
     * 
     * @param value The room's new teams lock value.
     * @param byId Id of the player who has triggered this event.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeTeamsLockChange?: (value: boolean, byId: int)=>object|undefined,

    /**
     * Called just after the room's teams have been locked/unlocked.
     * 
     * @param value The room's new teams lock value.
     * @param byId Id of the player who has triggered this event.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterTeamsLockChange?: (value: boolean, byId: uint16, customData?: object)=>void,

    /**
     * Called just after a player object has been created. This callback can be used to define custom properties inside all player objects.
     * 
     * @param playerObj The new Player object that has just been created.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePlayerObjectCreated?: (playerObj: Player)=>object|undefined,

    /**
     * Called just after a player object has been created. This callback can be used to define custom properties inside all player objects.
     * 
     * @param playerObj The new Player object that has just been created.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterPlayerObjectCreated?: (playerObj: Player, customData?: object)=>void,

    /**
     * Called just after a disc object has been assigned to a player object.
     * 
     * @param playerObj The new Player object that has just been assigned a disc object.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePlayerDiscCreated?: (playerObj: Player)=>object|undefined,

    /**
     * Called just after a disc object has been assigned to a player object.
     * 
     * @param playerObj The new Player object that has just been assigned a disc object.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onAfterPlayerDiscCreated?: (playerObj: Player, customData?: object)=>void,

    /**
     * Called just after a disc object has been removed from a player object.
     * 
     * @param playerObj The Player object whose disc object has just been removed.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePlayerDiscDestroyed?: (playerObj: Player)=>object|undefined,

    /**
     * Called just after a disc object has been removed from a player object.
     * 
     * @param playerObj The Player object whose disc object has just been removed.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onAfterPlayerDiscDestroyed?: (playerObj: Player, customData?: object)=>void,

    /**
     * Called just after a player has joined the room.
     * 
     * @param playerObj The data representation of the player that has just joined the room.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePlayerJoin?: (playerObj: Player)=>object|undefined,

    /**
     * Called just after a player has joined the room.
     * 
     * @param playerObj The data representation of the player that has just joined the room.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterPlayerJoin?: (playerObj: Player, customData?: object)=>void,

    /**
     * Called just after the game has been paused or resumed.
     * 
     * @param isPaused Whether the game has been paused or not.
     * @param byId Id of the player who has triggered this event.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeGamePauseChange?: (isPaused: boolean, byId: uint16)=>object|undefined,

    /**
     * Called just after the game has been paused or resumed.
     * 
     * @param isPaused Whether the game has been paused or not.
     * @param byId Id of the player who has triggered this event.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterGamePauseChange?: (isPaused: boolean, byId: uint16, customData?: object)=>void,

    /**
     * Called just after a chat message has been received.
     * 
     * @param id Id of the player who has sent the chat message.
     * @param message The chat message.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePlayerChat?: (id: uint16, message: string)=>object|undefined,

    /**
     * Called just after a chat message has been received.
     * 
     * @param id Id of the player who has sent the chat message.
     * @param message The chat message.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterPlayerChat?: (id: uint16, message: string, customData?: object)=>void,

    /**
     * Called just after a player's input has been changed.
     * 
     * @param id Id of the player whose input has been changed.
     * @param value The new input value of the player.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePlayerInputChange?: (id: uint16, value: int)=>object|undefined,

    /**
     * Called just after a player's input has been changed.
     * 
     * @param id Id of the player whose input has been changed.
     * @param value The new input value of the player.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterPlayerInputChange?: (id: uint16, value: int, customData?: object)=>void,

    /**
     * Called just after a player has activated or deactivated his/her chat indicator. This happens when a player focuses/loses focus on the chat input component in the website.
     * 
     * @param id Id of the player whose chat indicator has been activated/deactivated.
     * @param value Whether the chat indicator has been activated or not.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePlayerChatIndicatorChange?: (id: uint16, value: boolean)=>object|undefined,

    /**
     * Called just after a player has activated or deactivated his/her chat indicator. This happens when a player focuses/loses focus on the chat input component in the website.
     * 
     * @param id Id of the player whose chat indicator has been activated/deactivated.
     * @param value Whether the chat indicator has been activated or not.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterPlayerChatIndicatorChange?: (id: uint16, value: boolean, customData?: object)=>void,

    /**
     * Called just after a player has left the room.
     * 
     * @param playerObj The player who has left the room.
     * @param reason The reason of leaving the room. If `null`, the player has left by himself/herself.
     * @param isBanned Whether the player has been banned or not. If `reason` is `null`, this value is ignored.
     * @param byId Id of the player who has kicked/banned the player. If `reason` is `null`, this value is ignored.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforePlayerLeave?: (playerObj: Player, reason: string | null, isBanned: boolean, byId: uint16)=>object|undefined,

    /**
     * Called just after a player has left the room.
     * 
     * @param playerObj The player who has left the room.
     * @param reason The reason of leaving the room. If `null`, the player has left by himself/herself.
     * @param isBanned Whether the player has been banned or not. If `reason` is `null`, this value is ignored.
     * @param byId Id of the player who has kicked/banned the player. If `reason` is `null`, this value is ignored.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterPlayerLeave?: (playerObj: Player, reason: string | null, isBanned: boolean, byId: uint16, customData?: object)=>void,

    /**
     * Called just after a team's colors have been changed.
     * 
     * @param teamId The team whose colors have been changed.
     * @param value The new team colors value.
     * @param byId Id of the player who has changed the team colors.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeTeamColorsChange?: (teamId: int, value: TeamColors, byId: uint16)=>object|undefined,

    /**
     * Called just after a team's colors have been changed.
     * 
     * @param teamId The team whose colors have been changed.
     * @param value The new team colors value.
     * @param byId Id of the player who has changed the team colors.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterTeamColorsChange?: (teamId: int, value: TeamColors, byId: uint16, customData?: object)=>void,

    /**
     * Called just after the room's kick rate limit has been changed.
     * 
     * @param min The new `min` part of kick rate limit.
     * @param rate The new `rate` part of kick rate limit.
     * @param burst The new `burst` part of kick rate limit.
     * @param byId Id of the player who has changed the kick rate limit.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeKickRateLimitChange?: (min: int, rate: int, burst: int, byId: uint16)=>object|undefined,

    /**
     * Called just after the room's kick rate limit has been changed.
     * 
     * @param min The new `min` part of kick rate limit.
     * @param rate The new `rate` part of kick rate limit.
     * @param burst The new `burst` part of kick rate limit.
     * @param byId Id of the player who has changed the kick rate limit.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterKickRateLimitChange?: (min: int, rate: int, burst: int, byId: uint16, customData?: object)=>void,

    /**
     * Called just after the game has been started.
     * 
     * @param byId Id of the player who has started the game.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeGameStart?: (byId: uint16)=>object|undefined,

    /**
     * Called just after the game has been started.
     * 
     * @param byId Id of the player who has started the game.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterGameStart?: (byId: uint16, customData?: object)=>void,

    /**
     * Called just after the game has been stopped.
     * 
     * @param byId Id of the player who has stopped the game.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeGameStop?: (byId: uint16)=>object|undefined,

    /**
     * Called just after the game has been stopped.
     * 
     * @param byId Id of the player who has stopped the game.
     * @param customData the custom data that was returned from the previous callback.
     * 
     * @returns void.
     */
    onAfterGameStop?: (byId: uint16, customData?: object)=>void
  }

  declare interface ModifierRoomConfigCallbacks {

    /**
     * Called just before the player has joined the room. Using this callback, you may block all players or modify all players' name, flag and avatar properties just before they join the room.
     * 
     * @param playerId Id of the new player who is about to join the room.
     * @param name Name of the new player who is about to join the room.
     * @param flag Country code of the new player who is about to join the room.
     * @param avatar Avatar of the new player who is about to join the room.
     * @param conn Connection string of the new player who is about to join the room.
     * @param auth Auth string of the new player who is about to join the room.
     * 
     * @returns 
     *   - `null`: Blocks the player from joining the room.
     *   - `[modifiedName: string, modifiedFlag: string, modifiedAvatar: string]`: Modifies the name, flag and avatar values.
     */
    modifyPlayerDataBefore?: (playerId: uint16, name: string, flag: string, avatar: string, conn: string, auth: string)=>[modifiedName: string, modifiedFlag: string, modifiedAvatar: string],

    /**
     * Called just before the player has joined the room. Using this callback, you may block all players or modify all players' name, flag and avatar properties just before they join the room.
     * 
     * @param playerId Id of the new player who is about to join the room.
     * @param name Name of the new player who is about to join the room.
     * @param flag Country code of the new player who is about to join the room.
     * @param avatar Avatar of the new player who is about to join the room.
     * @param conn Connection string of the new player who is about to join the room.
     * @param auth Auth string of the new player who is about to join the room.
     * @param customData Any custom data that might be returned from the previous addon's calback.
     * 
     * @returns 
     *   - `null`: Blocks the player from joining the room.
     *   - `[modifiedName: string, modifiedFlag: string, modifiedAvatar: string]`: Modifies the name, flag and avatar values.
     */
    modifyPlayerDataAfter?: (playerId: uint16, name: string, flag: string, avatar: string, conn: string, auth: string, customData?: object)=>[modifiedName: string, modifiedFlag: string, modifiedAvatar: string],

    /**
     * If defined, runs for all players except host in a host room. Modifies the `ping` value of the player whose id is `playerId`. 
     * Host player's ping will not change using this callback. In order to change host player's ping, you need to modify `room.hostPing` value directly.
     * 
     * @param playerId Id of the current player.
     * @param ping Current ping value of the current player.
     * 
     * @returns The new ping value of the current player.
     */
    modifyPlayerPingBefore?: (playerId: uint16, ping: int)=>number,

    /**
     * If defined, runs for all players except host in a host room. Modifies the `ping` value of the player whose id is `playerId`. 
     * Host player's ping will not change using this callback. In order to change host player's ping, you need to modify `room.hostPing` value directly.
     * 
     * @param playerId Id of the current player.
     * @param ping Current ping value of the current player.
     * @param customData Any custom data that might be returned from the previous addon's calback.
     * 
     * @returns The new ping value of the current player.
     */
    modifyPlayerPingAfter?: (playerId: uint16, ping: int, customData?: object)=>number,

    /**
     * If defined, runs only for the current player in a client room and modifies its `ping` value.
     * 
     * @param ping Current ping value of the current player.
     * 
     * @returns The new ping value of the current player.
     */
    modifyClientPingBefore?: (ping: int)=>number,

    /**
     * If defined, runs only for the current player in a client room and modifies its `ping` value.
     * 
     * @param ping Current ping value of the current player.
     * @param customData Any custom data that might be returned from the previous addon's calback.
     * 
     * @returns The new ping value of the current player.
     */
    modifyClientPingAfter?: (ping: int, customData?: object)=>number,

    /**
     * If defined, expects us to return the physics engine's new current `frameNo` value, which tells the physics engine that it is currently on a different frame than expected, which causes your player to look laggy to your opponents, especially on extrapolated clients.
     * 
     * @param frameNo Current frameNo value of the physics engine.
     * 
     * @returns The new frameNo value of the physics engine.
     */
    modifyFrameNoBefore?: (frameNo: int)=>int,

    /**
     * If defined, expects us to return the physics engine's new current `frameNo` value, which tells the physics engine that it is currently on a different frame than expected, which causes your player to look laggy to your opponents, especially on extrapolated clients.
     * 
     * @param frameNo Current frameNo value of the physics engine.
     * @param customData Any custom data that might be returned from the previous addon's calback.
     * 
     * @returns The new frameNo value of the physics engine.
     */
    modifyFrameNoAfter?: (frameNo: int, customData?: object)=>int,

    /**
     * If defined, runs for each message received from all clients in a host room, before they are processed and sent to all clients. This is the most important callback inside a host room; all permission logic should reside here. You are also allowed to freely modify the contents of all messages here.
     * 
     * @param type Type of the received message. We have to look it up in the global `OperationType` object to understand what type of message it actually is.
     * @param msg The original message object. We can directly modify all contents of this object here as we wish.
     * @param globalFrameNo The global frame no that host's physics engine is at, at the time that the message is received.
     * @param clientFrameNo The frame no that this client's physics engine is at, at the time that the message is received.
     * 
     * @returns 
     *   - `true`: accept event.
     *   - `false`: block message from being processed. 
     *   - `throw exception`: break the connection of the sender of this message.
     */
    onBeforeOperationReceived?: (type: OperationType, msg: HaxballEvent, globalFrameNo: int, clientFrameNo: int)=>boolean,

    /**
     * If defined, runs for each message received from all clients in a host room, before they are processed and sent to all clients. This is the most important callback inside a host room; all permission logic should reside here. You are also allowed to freely modify the contents of all messages here.
     * 
     * @param type Type of the received message. We have to look it up in the global `OperationType` object to understand what type of message it actually is.
     * @param msg The original message object. We can directly modify all contents of this object here as we wish.
     * @param globalFrameNo The global frame no that host's physics engine is at, at the time that the message is received.
     * @param clientFrameNo The frame no that this client's physics engine is at, at the time that the message is received.
     * @param customData Any custom data that might be returned from the previous addon's calback.
     * 
     * @returns 
     *   - `true`: accept event.
     *   - `false`: block message from being processed. 
     *   - `throw exception`: break the connection of the sender of this message.
     */
    onAfterOperationReceived?: (type: OperationType, msg: HaxballEvent, globalFrameNo: int, clientFrameNo: int, customData?: object)=>boolean
  }

  declare interface CustomRoomConfigCallbacks {

    /**
     * Called just after a custom event has been triggered.
     * 
     * @param type Any integer value to hold the type of the custom event.
     * @param data Any JSON object to store the properties of the custom event. This object is converted to a string and sent/received by Haxball's original event mechanism.
     * @param byId Id of the player who has triggered this custom event.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeCustomEvent?: (type: int, data: object, byId: uint16)=>object|undefined,

    /**
     * Called just after a custom event has been triggered.
     * 
     * @param type Any integer value to hold the type of the custom event.
     * @param data Any JSON object to store the properties of the custom event. This object is converted to a string and sent/received by Haxball's original event mechanism.
     * @param byId Id of the player who has triggered this custom event.
     * @param customData Any custom data that might be returned from the previous addon's calback.
     * 
     * @returns void.
     */
    onAfterCustomEvent?: (type: int, data: object, byId: uint16, customData?: object)=>void

    /**
     * Called just after a binary custom event has been triggered.
     * 
     * @param type Any integer value to hold the type of the custom event.
     * @param data Any Uint8Array to store the properties of the custom event. This object is directly sent/received by Haxball's original event mechanism.
     * @param byId Id of the player who has triggered this custom event.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeBinaryCustomEvent?: (type: uint32, data: Uint8Array, byId: uint16)=>object|undefined

    /**
     * Called just after a binary custom event has been triggered.
     * 
     * @param type Any integer value to hold the type of the custom event.
     * @param data Any Uint8Array to store the properties of the custom event. This object is directly sent/received by Haxball's original event mechanism.
     * @param byId Id of the player who has triggered this custom event.
     * @param customData Any custom data that might be returned from the previous addon's calback.
     * 
     * @returns void.
     */
    onAfterBinaryCustomEvent?: (type: uint32, data: Uint8Array, byId: uint16, customData?: object)=>void

    /**
     * Called just after an identity event has been triggered.
     * 
     * @param id Id of the player whose identity data is desired to be changed.
     * @param data The identity data that should be received from the backend. It can be any JSON object.
     * @param byId Id of the player who has triggered this custom event.
     * 
     * @returns void or a custom data to pass to the next callback.
     */
    onBeforeIdentityEvent?: (id: uint16, data: object, byId: uint16)=>object|undefined

    /**
     * Called just after an identity event has been triggered.
     * 
     * @param id Id of the player whose identity data is desired to be changed.
     * @param data The identity data that should be received from the backend. It can be any JSON object.
     * @param byId Id of the player who has triggered this custom event.
     * @param customData Any custom data that might be returned from the previous addon's calback.
     * 
     * @returns void.
     */
    onAfterIdentityEvent?: (id: uint16, data: object, byId: uint16, customData?: object)=>void
  }

  declare interface RendererCallbacks {

    /**
     * This callback should always be defined, since this function holds the main purpose of the Renderer class. All rendering logic is supposed to reside inside this function. The default renderer code renders the given `extrapolatedRoomState` parameter using an outer canvas's Context2D object. The callback is used internally by the game engine inside `window.requestAnimationFrame` callback.
     * 
     * @param extrapolatedRoomState The extrapolated state of the room that is about to be rendered.
     * 
     * @returns void.
     */
    render?: (extrapolatedRoomState: RoomState)=>void
  }

  declare interface CommonlyUsedCallbacks extends HostTriggeredCallbacks, GameCallbacks, CommonCallbacks, RendererCallbacks {}
  declare interface AllPluginCallbacks extends HostOnlyCallbacks, HostTriggeredCallbacks, ClientTriggeredCallbacks, IndividuallyTriggeredCallbacks, CommonCallbacks, ModifierCallbacks, CustomCallbacks {}
  declare interface AllRendererCallbacks extends HostOnlyCallbacks, HostTriggeredCallbacks, ClientTriggeredCallbacks, IndividuallyTriggeredCallbacks, CommonCallbacks, CustomCallbacks, RendererCallbacks {}
  declare interface AllRoomConfigCallbacks extends HostOnlyRoomConfigCallbacks, HostTriggeredRoomConfigCallbacks, ClientTriggeredRoomConfigCallbacks, IndividuallyTriggeredRoomConfigCallbacks, CommonRoomConfigCallbacks, ModifierRoomConfigCallbacks, CustomRoomConfigCallbacks, AllPluginCallbacks {}

  /**
   * This object consists of functions regarding event callbacks. Here is a detailed documentation of the default event callbacks for this API: https://github.com/wxyz-abcd/node-haxball/wiki/uncategorized-commonEventCallbacks.
   */
  export interface Callback {}
  export namespace Callback {
    
    /**
     * Creates all custom callbacks about a new event called `eventName`. For example, this function might have to be used (and maybe overridden for usage of `metadata`) in a GUI application to define event callbacks related to gui events such as keyboard, mouse, touch, timer etc. The main event callback defined in all `Room` objects to trigger the new callbacks is `"_on" + eventName`.
     * 
     * @param name The name of the new event, which should start with a _capital_ letter.
     * @param metadata This value is currently not used anywhere; but just in case, the default keys for this object is as follows: 
     *   - `params: string[]`: Short explanations for each parameter of this event.
     * 
     * @returns void.
     */
    export function add(name: string, metadata: any): void;

    /**
     * Removes the callbacks created by `Callback.add`. Added for convenience. This function should not normally be needed.
     * 
     * @param name The name of the event to be removed.
     * 
     * @returns void.
     */
    export function remove(name: string): void;
  }

  /**
   * This object consists of several helper utility functions for developers.
   */
  export interface Utils {}
  export namespace Utils {

    /**
     * Generates a new `player_auth_key` along with its companion auth object(`auhObj`) to be used as parameters to the function `Room.join`. We should store the auth key and use it later if we want to be recognized in Haxball rooms. Any internal error will result in a _rejected_ promise.
     * 
     * @returns A new auth key and auth object.
     */
    export function generateAuth(): Promise<[string, Auth]>;

    /**
     * Recreates the auth object from the given `authKey`. The returned object is only to be used as parameter to the function `Room.join`. Bad inputs or any internal error will result in a _rejected_ promise.
     * 
     * @param authKey A simplified string that represents an auth object.
     * 
     * @returns The Auth object that was generated from the given `authKey`.
     */
    export function authFromKey(authKey: string): Promise<Auth>;

    /**
     * Connects to Haxball's backend server, retrieves the current room list and returns it.
     * 
     * @returns A promise that returns the current list of open rooms returned from the Haxball's backend server.
     */
    export function getRoomList(): Promise<RoomData[]>;

    /**
     * Calculates the distances to the given GeoLocation `geo` of all rooms in given `roomList` and stores them inside each room's `dist` property.
     * 
     * @param geo The location to calculate the distances to.
     * @param list The room list to update.
     * 
     * @returns void.
     */
    export function calculateAllRoomDistances(geo: GeoLocation, list: RoomData[]): void;

    /**
     * Returns the html color string (rgba representation) of the given `number`. This function is mostly intended to be used in renderers and map editors. Bad inputs will return a bad string output.
     * 
     * @param number A number in the range [0, 16777215].
     * 
     * @returns The rgba representation of the color that was generated from the given `number`.
     */
    export function numberToColor(number: int): string;

    /**
     * Returns the number representation of the given html color string. (rgba representation) This function is mostly intended to be used in renderers and map editors.
     *   - Bad inputs will return `undefined`.
     *   - Alpha value of the input color is not used. (The game engine currently assigns `255` to all alpha values by default.)
     * 
     * @param color The rgba representation of a color.
     * 
     * @returns An integer that represents the given `color`.
     */
    export function colorToNumber(color: string): int;

    /**
     * Returns the numeric representation of the given ip address. Returns null if 
     * the input string is ill-formatted.
     * 
     * @param ip The ip address to be converted.
     * 
     * @returns An integer for ipv4 string, a BigInt for ipv6 string.
     */
    export function ipToNumber(ip: string): NumericIPv4 | NumericIPv6 | null;

    /**
     * Returns the ip address string of a given numeric representation. Returns null if 
     * the input number is invalid.
     * 
     * @param ip The numeric representation of an ip address to be converted.
     * 
     * @returns A formatted ip string.
     */
    export function numberToIp(ip: NumericIPv4 | NumericIPv6): string | null;

    /**
     * Returns the numeric representation of the given auth string. Returns null if 
     * the length of the auth string is not 43.
     * 
     * @param auth The auth value to be converted.
     * 
     * @returns A BigInt.
     */
    export function authToNumber(auth: string): BigInt;

    /**
     * Returns the auth string for the numeric representation of it. Returns null if 
     * the input number is invalid.
     * 
     * @param auth The numeric representation of an auth string to be converted.
     * 
     * @returns An auth string.
     */
    export function numberToAuth(auth: BigInt): string;

    /**
     * Compares the bits of `value1` and `value2` at the exact positions that 
     * are `1` in the given `bitMask`.
     * 
     * @param value1 The first value to be compared.
     * @param value2 The second value to be compared.
     * @param bitMask The bit mask that represents which bits to compare.
     * 
     * @returns A boolean whose value is true if all bits that are compared are equal.
     */
    export function compareBits(value1: NumericIPv4, value2: NumericIPv4, bitMask: NumericIPv4): boolean;

    /**
     * Compares the bits of `value1` and `value2` at the exact positions that 
     * are `1` in the given `bitMask`.
     * 
     * @param value1 The first value to be compared.
     * @param value2 The second value to be compared.
     * @param bitMask The bit mask that represents which bits to compare.
     * 
     * @returns A boolean whose value is true if all bits that are compared are equal.
     */
    export function compareBits(value1: NumericIPv6, value2: NumericIPv6, bitMask: NumericIPv6): boolean;
  
    /**
     * Returns an integer key state value, only to be used with `Room.setKeyState`. 
     * 
     * @param dirX Desired x direction. One of \[`-1`:left, `0`:still, `1`:right\].
     * @param dirY Desired y direction. One of \[`-1`:up, `0`:still, `1`:down\].
     * @param kick Desired pressed state of the kick button.
     * 
     * @returns An integer in the range \[0, 31\].
     */
    export function keyState(dirX: Direction, dirY: Direction, kick: boolean): int;

    /**
     * Returns the explanation of the given key state.
     * 
     * @param state A key state value in the range \[0, 31\].
     * 
     * @returns An object that holds values for x, y directions and kick.
     */
    export function reverseKeyState(state: int): {dirX: Direction, dirY: Direction, kick: boolean};

    /**
     * Runs a `callback` function after `ticks` game ticks.
     * 
     * @param callback The function to run.
     * @param ticks Number of ticks to wait before running the callback function. Defaults to `1`.
     * 
     * @returns void.
     */
    export function runAfterGameTick(callback: ()=>void, ticks: int): void;

    /**
     * Connects to Haxball's backend server, retrieves your location based on IP address using backend's geolocation API and returns it. Might throw errors.
     * 
     * @returns A promise that returns a GeoLocation object that has your location data retrieved from the backend server.
     */
    export function getGeo(): Promise<GeoLocation>;

    /**
     * Parses the given string or json object as a `GeoLocation` object and returns it.
     * 
     * @param geoStr An (optionally stringified) object that may have the following keys:
     *   - `lat`: Latitude value.
     *   - `lon`: Longitude value.
     *   - `flag`: Country code.
     * 
     * @param fallback An object whose keys will be used as fallback if the first parameter does not have any of the requested key(s). It should have `lat`, `lon`, `flag` as well.
     * 
     * @param retNull Whether to return null if `geoStr` is `null`. Defaults to `true`.
     * 
     * @returns A `GeoLocation` object.
     */
    export function parseGeo(geoStr?: object|string, fallback?: object, retNull?: boolean): GeoLocation;

    /**
     * Returns the checksum for the given stadium.
     * 
     * @param stadium The stadium object whose checksum is to be calculated.
     * 
     * @returns The checksum string of the given `stadium`, or `null` for default stadiums.
     */
    export function stadiumChecksum(stadium: Stadium): string | null;

    /**
     * Parses a string(.hbs) as a Stadium object. 
     * 
     * @param textDataFromHbsFile The string representation of a `Stadium` object.
     * @param onError A callback that is called if any error occurs.
     * 
     * @returns The generated `Stadium` object, or `undefined` if an error occurs.
     */
    export function parseStadium(textDataFromHbsFile: string, onError?: ErrorCallback): Stadium;

    /**
     * Generate and return text content from a `stadium` object that can be directly written in a .hbs file.
     * 
     * @returns The string(.hbs) representation of the stadium object.
     */
    export function exportStadium(stadium: Stadium): string;

    /**
     * Returns the default stadium array.
     * 
     * @returns All of the default stadiums as an array.
     */
    export function getDefaultStadiums(): Stadium[];

    /**
     * Returns a new promise that executes the given `promise` until `msec` milliseconds have passed. If timeout is reached, the promise is rejected.
     * 
     * @param promise A Promise that has to be executed with a time limit
     * @param msec The time limit
     * 
     * @returns The new promise with time limit.
     */
    export function promiseWithTimeout(promise: Promise, msec: int32): Promise;

    /**
     * Trims a string to ensure that it cannot be longer than a given `length`.
     * 
     * @param str The string to be trimmed
     * @param length The maximum length
     * 
     * @returns The trimmed string.
     */
    export function trimStringIfLonger(str: string, length: int32): string;

    /**
     * Converts the `playerObject.conn` values to readable ip address string.
     * 
     * @param str The string to be converted
     * 
     * @returns The converted ip address string.
     */
    export function hexStrToNumber(str: string): string;

    /**
     * Converts a Uint8Array that was read from basro's backend into a readable ip address string.
     * 
     * @param data The data to be converted
     * 
     * @returns The recovered ip address string.
     */
    export function byteArrayToIp(data: Uint8Array): string;
  }

  declare type CreateRoomParams = {

    /**
     * Name of the room.
     */
    name: string;

    /**
     * A password string to protect the room. omit or `null` for no password.
     */
    password?: string;

    /**
     * In order to create a room, we have to solve a recaptcha challenge and write the resulting token into this key. The recaptcha token can be originally obtained from `https://www.haxball.com/headlesstoken`. However, this url will be different while using a custom backend server.
     */
    token: string;

    /**
     * Determines whether a player object will be created for the room host or not.
     */
    noPlayer?: boolean;

    /**
     * The geolocation value of the room about to be created.
     */
    geo: GeoLocation;

    /**
     * If set to an integer value, fixes the current player count to this specific value.
     */
    playerCount?: int;

    /**
     * The maximum allowed player count in the room.
     */
    maxPlayerCount: int;

    /**
     * If set to `true`, bypasses the player count checks, resulting in unlimited maximum player count. However, the default backend will not show the room in the room list if the player count > `30`.
     */
    unlimitedPlayerCount?: boolean;

    /**
     * If set to `true` or `false`, the room will set its password-protected status to your value. Passing `null` or omitting this key disables this behaviour.
     */
    fakePassword?: boolean;

    /**
     * Whether to show this room in the room list or not.
     */
    showInRoomList: boolean;

    /**
     * Called when a exception is thrown by one of the client connections. playerId is the id of the player that caused the exception. The player's connection will be closed just after this callback is executed.
     * 
     * @param error The thrown error.
     * @param playerId Id of the player that caused the error.
     * 
     * @returns void.
     */
    onError?: (error: Errors.HBError, playerId: uint16)=>void
  };

  declare type JoinRoomParams = {

    /**
     * The id of the room to join. For example, if the room link is `https://www.haxball.com/play?c=31IBNI3w4F0`, the id of this room is `31IBNI3w4F0`.
     */
    id: string;

    /**
     * A password value to join the room if the room is password-protected.
     */
    password?: string;

    /**
     * If the room is recaptcha-protected, you have to use a client token. Currently there is not any other clean way of generating this token for Haxball's original backend except using the NW.js token generator project, so you might want to look at it.
     */
    token?: string;

    /**
     * An auth object that has to be initialized by `Utils.generateAuth()` or `Utils.authFromKey()` before being used here.
     */
    authObj: Auth;
  };

  declare class HaxballClient{

    /**
     * An object that stores information about the current player preferences.
     */
    storage?: Storage;

    /**
     * If `true`, renderer and plugin mechanism will not work. Should only be used for optimal performance. You have to define `Room._onXXXXXX` callbacks by yourself.
     */
    noPluginMechanism?: boolean;

    /**
     * The `RoomConfig` object that contains all the main callbacks of this room. Default value is `null`. Note that the api will generate an empty config if you do not provide one. Look at https://github.com/wxyz-abcd/node-haxball/tree/main/examples/roomConfigs/method2 for example RoomConfigs to use here, or https://github.com/wxyz-abcd/node-haxball/blob/main/src/roomConfigTemplate_method2.js for a template RoomConfig that contains all callbacks.
     */
    config?: RoomConfig;

    /**
     * The `Renderer` object that will render the game. The object should be derived from the provided `Renderer` class. Default value is `null`. Look at https://github.com/wxyz-abcd/node-haxball/tree/main/examples/renderers for example Renderers to use here, or https://github.com/wxyz-abcd/node-haxball/blob/main/src/rendererTemplate.js for a template Renderer that contains all callbacks.
     */
    renderer?: Renderer;

    /**
     * An array of `Plugin` objects to be used. the objects should be derived from the provided `Plugin` class. Default value is `[]`. Look at https://github.com/wxyz-abcd/node-haxball/tree/main/examples/plugins for example Plugins to use here, or https://github.com/wxyz-abcd/node-haxball/blob/main/src/pluginTemplate.js for a template Plugin that contains all callbacks.
     */
    plugins?: Plugin[];

    /**
     * An array of `Library` objects to be used. the objects should be derived from the provided `Library` class. Default value is `[]`. Look at https://github.com/wxyz-abcd/node-haxball/tree/main/examples/libraries for example Library's to use here, or https://github.com/wxyz-abcd/node-haxball/blob/main/src/libraryTemplate.js for a template Library that contains all callbacks.
     */
    libraries?: Library[];

    /**
     * Haxball's version number. Other clients cannot join this room if their version number is different than this number. Default value is `9`.
     */
    version?: int;

    /**
     * When we kick the ball, it causes us to release kick button by default. This API changes it so that it causes a timeout that makes us automatically press kick button again. We may assign a negative value to disable this feature. Default value is `-1`.
     */
    kickTimeout?: int;

    /**
     * A custom proxy agent to use for the room's connection. This method does not work in browsers. Defaults to `null`.
     */
    proxyAgent?: ProxyAgentLike;

    /**
     * A token that represents a user data in a database of a custom proxy/backend server. If successful, room will create and emit an IdentityEvent for this player.
     */
    identityToken?: string;

    /**
     * Do not modify this value. This value is `null` until joinRoom or createRoom operation is successful. After that, a pointer to the created/joined room object is auto-assigned to this variable.
     */
    readonly room?: Room;

    /**
     * Called just after the `room` object is created, and before the initialization of the addons. This is where you can initialize/add your custom GUI functions to the room object to be used inside the addons.
     * 
     * @param room The room object that was just created.
     * 
     * @returns void.
     */
    preInit?: (room: Room)=>void;

    /**
     * Called when joining or creating a room was successful.
     * 
     * @param room The room that succeeded in being created/joined.
     * 
     * @returns void.
     */
    onSuccess?: (room: Room)=>void;

    /**
     * Called when Joining a room failed.
     * 
     * @param error The error that caused the failure.
     * 
     * @returns void.
     */
    onFailure?: (error: Errors.HBError)=>void;

    /**
     * Triggered while leaving the room.
     * 
     * @param msg The reason of leaving the room.
     * 
     * @returns void.
     */
    onLeave?: (msg: Errors.HBError)=>void;

    /**
     * Triggered when the connection's state changed.
     * 
     * @param state The new connection state.
     * @param sdp The session description value for webrtc connection. (only exists if `state` is `ConnectingToPeer` or `AwaitingState`.)
     * 
     * @returns void.
     */
    onConnectionStateChange?: (state: ConnectionState, sdp: string|undefined)=>void;
    
    /**
     * Triggered while starting to try the reverse connection method while joining a room.
     * 
     * @returns void.
     */
    onReverseConnection?: ()=>void;

    /**
     * Triggered when recaptcha is requested from the backend server while joining or creating a room.
     * 
     * @returns void.
     */
    onRequestRecaptcha?: ()=>void;

    /**
     * This function cancels the process of joining a room. Does nothing if not currently trying to join a room. 
     * 
     * @returns void.
     */
    cancel: ()=>void;

    /**
     * Should be used to send the recaptcha token after `onRequestRecaptcha` callback is called. Currently only working while creating a room. 
     * Workaround: In order to send the token to try and join a recaptcha-protected room, clean up old resources and use `Room.join` with the new token.
     * 
     * @param token The recaptcha token.
     * 
     * @returns void.
     */
    useRecaptchaToken: (token: string)=>void;
  }

  declare type RAF = (callback: (time: number) => void) => number;
  declare type CAF = (handle: number) => void;
  declare type ErrorCallback = (error: Errors.HBError) => void;

  declare interface SandboxOptions {

    /**
     * Id of the player to be controlled.
     */
    controlledPlayerId?: int;

    /**
     * Override function for `requestAnimationFrame`. Omit to use library's default `requestAnimationFrame`.
     */
    requestAnimationFrame?: RAF;

    /**
     * Override function for `cancelAnimationFrame`. Omit to use library's default `cancelAnimationFrame`.
     */
    cancelAnimationFrame?: CAF;

    /**
     * Any positive number that will be used as the fps limit. (Omitting means no limit)
     */
    fps_limit?: int;
  }

  declare interface SandboxRoomBase {

    /**
     * An object containing all information about the current room state.
     */
    readonly state: RoomState;

    /**
     * The original object that holds the game state information. Returns null if game is not active.
     */
    readonly gameState: GameState | null;

    /**
     * This is a read-only property that always returns 0. It is only added for compatibility with renderers. (And it is only used in the initialization code of renderers.)
     */
    readonly currentPlayerId: int;

    /**
     * The current speed of the simulation.
     */
    readonly speed: number;

    /**
     * Changes the speed of the simulation. 
     * 
     * @param coefficient The desired speed coefficient. Must be a real number >=0. Meaning of possible value ranges is as follows:
     *   - value = 0 : stop simulation.
     *   - 0 < value < 1 : slow-motion simulation.
     *   - value = 1 : normal speed simulation.
     *   - value > 1 : fast-motion simulation.
     * 
     * @returns void.
     */
    setSimulationSpeed(coefficient: number): void;

    /**
     * Runs the simulation `count` steps. Simulation should be stopped for this function to work as expected.
     * 
     * @param count Number of steps to run the simulation.
     * 
     * @returns void.
     */
    runSteps(count: int): void;

    /**
     * Returns a complete snapshot of the current room state.
     * 
     * @returns The snapshot copy of the current RoomState object.
     */
    takeSnapshot(): RoomState;

    /**
     * Generates a copy of the given RoomState and sets the current room state reference to the generated RoomState. 
     * 
     * @param newRoomState The RoomState to use. Should be created by `takeSnapshot()` first.
     * 
     * @returns void.
     */
    useSnapshot(newRoomState: RoomState): void;

    /**
     * Frees the resources that are used by this object.
     * 
     * @returns void.
     */
    destroy(): void;
  }

  declare interface StreamWatcherRoom extends SandboxRoomBase {

    /**
     * The current frame number of the room state that you are currently observing.
     */
    readonly currentFrameNo: int;

    /**
     * The original current frame number of the room where the game is actually being played.
     */
    readonly maxFrameNo: int;

    /**
     * A callback that reads the data stream for "interval" streaming mode.
     * 
     * @param reader The stream reader instance.
     */
    readStream(reader: Impl.Stream.F): void;

    /**
     * A callback that reads the data stream for "immediate" streaming mode.
     * 
     * @param reader The stream reader instance.
     */
    readImmediateStream(reader: Impl.Stream.F): void;
  }

  declare interface SandboxRoom extends SandboxRoomBase {

    /**
     * Applies an event to the current room state. For example; the event object may come from a `ReplayData` structure, 
     * or from a `onOperationReceived(type, msg, globalFrameNo, clientFrameNo, customData)` callback.
     * 
     * @param eventMsg The event message to apply.
     * 
     * @returns void.
     */
    executeEvent(eventMsg: HaxballEvent): void;

    /**
     * Adds a new player to the room.
     * 
     * @param id Id of the new player.
     * @param name Name of the new player.
     * @param flag Flag of the new player.
     * @param avatar Avatar of the new player.
     * @param conn Connection string of the new player.
     * @param auth Auth of the new player.
     * 
     * @returns void.
     */
    playerJoin(id: uint16, name: string, flag: string, avatar: string, conn: string, auth: string): void;

    /**
     * Removes a player from the room.
     * 
     * @param playerId Id of the player to be removed.
     * 
     * @returns void.
     */
    playerLeave(playerId: uint16): void;

    /**
     * Sets the current key state of a player.
     * 
     * @param input The desired key state of the player.
     * @param byId Id of the player whose key state is being set.
     * 
     * @returns void.
     */
    playerInput(input: int, byId: uint16): void;

    /**
     * Sends a chat message as a player.
     * 
     * @param msg The chat message to be sent.
     * @param byId Id of the player who sent this message.
     * 
     * @returns void.
     */
    playerChat(msg: string, byId: uint16): void;

    /**
     * Sets the current player's key state. (added for compatibility with normal rooms.)
     * 
     * @param state The desired key state.
     * 
     * @returns void.
     */
    setKeyState(state: int): void;

    /**
     * Sets the chat indicator status of a player.
     * 
     * @param value The desired chat indicator status.
     * @param byId Id of the player whose chat indicator status is being set.
     * 
     * @returns void.
     */
    setPlayerChatIndicator(value: int, byId: uint16): void;

    /**
     * Sets the avatar of a player.
     * 
     * @param value The desired avatar value.
     * @param byId Id of the player whose avatar is being set.
     * 
     * @returns void.
     */
    setPlayerAvatar(value: string, byId: uint16): void;

    /**
     * Sets the current stadium using a fake identity.
     * 
     * @param value The desired stadium value.
     * @param byId The fake id of the player who changed this stadium.
     * @param onError An error callback.
     * 
     * @returns void.
     */
    setCurrentStadium(value: Stadium, byId: uint16, onError: ErrorCallback): void;

    /**
     * Sends an announcement message to a player.
     * 
     * @param msg The contents of the announcement message.
     * @param color The color of the announcement message. Range: -1 <= `color` < 16777216. 
     *  - The color value can be converted into a rgba string via API's `Utils.numberToColor` function.
     *  - The special value `-1` means `transparent` color.
     * @param style The style of the announcement message. Must be one of the following:
     *  - 0: use document's default font style.
     *  - 1: fontWeight = "bold".
     *  - 2: fontStyle = "italic".
     *  - 3: fontSize = "12px".
     *  - 4: fontWeight = "bold", fontSize = "12px".
     *  - 5: fontWeight = "italic", fontSize = "12px".
     * @param sound The sound of the announcement message. Must be one of the following: 
     *  - 0: no sound.
     *  - 1: chat sound.
     *  - 2: highlight sound.
     * @param targetId Id of the player who will receive this announcement. If this value is `null`, the announcement is sent to everyone.
     * @param byId This value must always be 0.
     * 
     * @returns void.
     */
    sendAnnouncement(msg: string, color: int, style: int, sound: int, targetId: uint16, byId: uint16): void;

    /**
     * Starts the game using a fake identity.
     * 
     * @param byId Id of the player who started the game.
     * 
     * @returns void.
     */
    startGame(byId: uint16): void;

    /**
     * Stops the game using a fake identity.
     * 
     * @param byId Id of the player who stopped the game.
     * 
     * @returns void.
     */
    stopGame(byId: uint16): void;

    /**
     * Pauses/resumes the game using a fake identity.
     * 
     * @param value The desired pausedness value of the game.
     *   - `true`: Pauses the game, if it is not already paused.
     *   - `false`: Resumes the game, if it is not already resumed.
     * @param byId Id of the player who paused/resumed the game.
     * 
     * @returns void.
     */
    setGamePaused(value: boolean, byId: uint16): void;

    /**
     * Sets the game's score limit using a fake identity.
     * 
     * @param value The desired score limit of the game.
     * @param byId Id of the player who set the game's score limit.
     * 
     * @returns void.
     */
    setScoreLimit(value: int, byId: uint16): void;

    /**
     * Sets the game's time limit using a fake identity.
     * 
     * @param value The desired time limit of the game.
     * @param byId Id of the player who set the game's time limit.
     * 
     * @returns void.
     */
    setTimeLimit(value: int, byId: uint16): void;

    /**
     * Locks/unlocks the teams using a fake identity.
     * 
     * @param value The desired teams lock value of the game.
     * @param byId Id of the player who set the game's teams lock value.
     * 
     * @returns void.
     */
    setTeamsLock(value: int, byId: uint16): void;

    /**
     * Removes the last 2 players from spectators and adds them to opposite teams in order using a fake identity.
     * 
     * @param byId Id of the player who changed the teams of these players.
     * 
     * @returns void.
     */
    autoTeams(byId: uint16): void;

    /**
     * Moves a player to a team using a fake identity.
     * 
     * @param playerId Id of the player whose team is desired to be changed.
     * @param teamId Id of the desired team.
     * @param byId Id of the player who changed the team of this player.
     * 
     * @returns void.
     */
    setPlayerTeam(playerId: uint16, teamId: int, byId: uint16): void;

    /**
     * Sets the room's kick rate limit using a fake identity.
     * 
     * @param min The desired min value of kick rate limit.
     * @param rate The desired rate value of kick rate limit.
     * @param burst The desired burst value of kick rate limit.
     * @param byId Id of the player who set the kick rate limit of the room.
     * 
     * @returns void.
     */
    setKickRateLimit(min: int, rate: int, burst: int, byId: uint16): void;

    /**
     * Sets the colors of a team using a fake identity.
     * 
     * @param teamId Id of the team whose colors are desired to be changed.
     *   - `1`: red.
     *   - `2`: blue.
     * @param angle The angle of stripes. (in degrees)
     * @param colors Minimum 2, maximum 4 parseable(hex-rgb) color strings.
     * @param byId Id of the player who set the colors of the team.
     * 
     * @returns void.
     */
    setTeamColors(teamId: int, angle: int, colors: int[], byId: uint16): void;

    /**
     * Gives/takes away the admin status of a player using a fake identity.
     * 
     * @param playerId Id of the player whose admin status is being set.
     * @param value The desired admin status of the player.
     *   - `true`: Give admin rights to the player.
     *   - `false`: Take away admin rights from the player.
     * @param byId Id of the player who set the admin status of the player.
     * 
     * @returns void.
     */
    setPlayerAdmin(playerId: int, value: boolean, byId: uint16): void;

    /**
     * Kicks/bans a player using a fake identity.
     * 
     * @param playerId Id of the desired player to be kicked/banned.
     * @param reason Reason of kicking/banning.
     *   - If `null`, this event is interpreted as the player leaving by himself/herself.
     * @param ban Whether this is a banning event or not.
     * @param byId Id of the player who kicked/banned the player.
     * 
     * @returns void.
     */
    kickPlayer(playerId: uint16, reason: string, ban: boolean, byId: uint16): void;

    /**
     * Set the synchronization status of a player.
     * 
     * @param value The desired synchronization status.
     * @param byId Id of the player whose synchronization status is being set.
     * 
     * @returns void.
     */
    setPlayerSync(value: boolean, byId: uint16): void;

    /**
     * Sets the ping values of all players.
     * 
     * @param valueFunc The desired ping values for all players.
     * @param byId This value must always be 0.
     * 
     * @returns void.
     */
    sendPingData(valueFunc: int[], byId: uint16): void;

    /**
     * Sets the properties of a disc.
     * 
     * @param discId Id of the object whose properties are desired to be set.
     * @param type The type of this operation.
     *   - `0`: discId is actually the id of a disc.
     *   - `1`: discId is actually the id of a player.
     * @param data The desired properties to set. This will not change the omitted keys of the disc. `properties` has the following structure:
     *   - `x: number | null`: The desired x coordinate of the disc.
     *   - `y: number | null`: The desired y coordinate of the disc.
     *   - `xspeed: number | null`: The desired x component of the speed of the disc.
     *   - `yspeed: number | null`: The desired y component of the speed of the disc.
     *   - `xgravity: number | null`: The desired x component of the gravity of the disc.
     *   - `ygravity: number | null`: The desired y component of the gravity of the disc.
     *   - `radius: number | null`: The desired radius of the disc.
     *   - `bCoeff: number | null`: The desired bouncing coefficient of the disc.
     *   - `invMass: number | null`: The desired inverse mass of the disc.
     *   - `damping: number | null`: The desired damping of the disc.
     *   - `color: int | null`: The desired color of the disc.
     *   - `cMask: int | null`: The desired collision mask of the disc.
     *   - `cGroup: int | null`: The desired collision group of the disc.
     * @param byId This value must always be 0.
     * 
     * @returns void.
     */
    setDiscProperties(discId: uint16, type: int, data: any[], byId: uint16): void;

    /**
     * Triggers a fake custom event using a fake identity.
     * 
     * @param type The type of the custom event.
     * @param data The data of the custom event. (Any JSON object)
     * @param byId Id of the player who triggered this custom event.
     * 
     * @returns void.
     */
    sendCustomEvent(type: int, data: object, byId: uint16): void;

    /**
     * Triggers a fake binary custom event using a fake identity.
     * 
     * @param type The type of the custom event.
     * @param data Any custom binary data for this specific event.
     * @param byId Id of the player who triggered this custom binary event.
     * 
     * @returns void.
     */
    sendBinaryCustomEvent(type: uint32, data: Uint8Array, byId: uint16): void;

    /**
     * Triggers a fake identity event using a fake identity.
     * 
     * @param id Id of the player whose identity data is being changed.
     * @param data The new identity data. It can be any JSON object.
     * @param byId Id of the player who triggered this identity event.
     * 
     * @returns void.
     */
    setPlayerIdentity(id: uint16, data: object, byId: uint16): void;
  }

  declare interface SetRoomPropertiesParams {

    /**
     * The new name of the room. This will also update the room's 
     * name in the room list.
     */
    name?: string,

    /**
     * The new password of the room. If `null`, clears the password.
     * This will also update the room's password status in the room list.
     */
    password?: string | null,

    /**
     * The new GeoLocation of the room. This value will be shown in 
     * the room list.
     */
    geo?: GeoLocation,

    /**
     * The number of players in the room. This value will be shown in 
     * the room list, and be fixed, i.e. it will not change when new 
     * players join or leave the room. Set to `null` to disable this 
     * behavior.
     */
    playerCount?: int | null,

    /**
     * The new maximum number of players in the room. This value will
     * be shown in the room list.
     */
    maxPlayerCount?: int,

    /**
     * If set to a `boolean`, this will be sent as the room's current 
     * password status, and shown in the room list. `false` means your room 
     * in fact might have a password, but it shows in the room list like it 
     * does not have a password; and vice versa. Set to `null` to disable 
     * this behavior.
     */
    fakePassword?: boolean | null,

    /**
     * If set, disables the player count check while players are joining 
     * your room.
     */
    unlimitedPlayerCount?: boolean,

    /**
     * Changes whether to send room info to the room list backend server or not.
     */
    showInRoomList?: boolean
  }

  declare interface SetDiscPropertiesParams {

    /**
     * The new x coordinate of the disc's position.
     */
    x?: number,

    /**
     * The new y coordinate of the disc's position.
     */
    y?: number,

    /**
     * The new x component of the disc's speed.
     */
    xspeed?: number,

    /**
     * The new y component of the disc's speed.
     */
    yspeed?: number,

    /**
     * The new x component of the disc's gravity(acceleration).
     */
    xgravity?: number,

    /**
     * The new y component of the disc's gravity(acceleration).
     */
    ygravity?: number,

    /**
     * The new radius of the disc.
     */
    radius?: number,

    /**
     * The new bouncing coefficient of the disc.
     */
    bCoeff?: number,

    /**
     * The new 1/mass value of the disc.
     */
    invMass?: number,

    /**
     * The new damping value of the disc.
     */
    damping?: number,

    /**
     * The new color of the disc. Range: -1 <= `color` < 16777216. 
     *   - This value can be converted into a rgba string via API's `Utils.numberToColor` function.
     *   - The special value `-1` means `transparent` color.
     */
    color?: int,

    /**
     * The new collision mask value of the disc.
     */
    cMask?: int,

    /**
     * The new collision group value of the disc.
     */
    cGroup?: int,
  }

  declare type UnparsedColor = "transparent" | string | [r: int, g: int, b: int];
  declare type UnparsedTeam2 = "red" | "blue";
  declare type UnparsedTeam3 = "spec" | "red" | "blue";
  declare type UnparsedCollisionFlags = (keyof typeof CollisionFlags)[];

  declare interface CreateVertexParams{

    /**
     * The x component of the position of the new vertex.
     */
    x: number,
    
    /**
     * The y component of the position of the new vertex.
     */
    y: number, 
    
    /**
     * The bouncing coefficient of the new vertex.
     */
    bCoef?: number,
    
    /**
     * The collision mask of the new vertex.
     */
    cMask?: UnparsedCollisionFlags,
    
    /**
     * The collision group of the new vertex.
     */
    cGroup?: UnparsedCollisionFlags
  }

  declare interface CreateSegmentParams{

    /**
     * Index of the first vertex of the new segment.
     */
    v0: int,

    /**
     * Index of the second vertex of the new segment.
     */
    v1: int,

    /**
     * Color of the new segment.
     */
    color?: UnparsedColor,

    /**
     * Bias of the new segment.
     */
    bias?: number,

    /**
     * Curve of the new segment. (unit: angles)
     */
    curve?: number,

    /**
     * Curve of the new segment. (unit: radians) While modifying this, the engine does not update some values. Only use this if you know what you are doing.
     */
    curveF?: number,

    /**
     * Visibility of the new segment.
     */
    vis?: boolean,

    /**
     * Bouncing coefficient of the new segment.
     */
    bCoef?: number,

    /**
     * Collision mask of the new segment.
     */
    cMask?: UnparsedCollisionFlags,

    /**
     * Collision group of the new segment.
     */
    cGroup?: UnparsedCollisionFlags
  }

  declare interface CreateSegmentFromObjParams {

    /**
     * First vertex of the new segment.
     */
    v0: Vertex,

    /**
     * Second vertex of the new segment.
     */
    v1: Vertex,

    /**
     * Color of the new segment.
     */
    color?: UnparsedColor,

    /**
     * Bias of the new segment.
     */
    bias?: number,

    /**
     * Curve of the new segment. (unit: angles)
     */
    curve?: number,

    /**
     * Curve of the new segment. (unit: radians) While modifying this, the engine does not update some values. Only use this if you know what you are doing.
     */
    curveF?: number,

    /**
     * Visibility of the new segment.
     */
    vis?: boolean,

    /**
     * Bouncing coefficient of the new segment.
     */
    bCoef?: number,

    /**
     * Collision mask of the new segment.
     */
    cMask?: UnparsedCollisionFlags,

    /**
     * Collision group of the new segment.
     */
    cGroup?: UnparsedCollisionFlags
  }

  declare interface CreateGoalParams {

    /**
     * The starting point of the new goal object.
     */
    p0: [x: number, y: number],

    /**
     * The ending point of the new goal object.
     */
    p1: [x: number, y: number],

    /**
     * The team of the new goal object.
     */
    team: UnparsedTeam2
  }

  declare interface CreatePlaneParams {

    /**
     * The normal of the new plane. This value is normalized automatically.
     */
    normal: [x: number, y: number],

    /**
     * The distance of the new plane to the origin(0,0).
     */
    dist: number,

    /**
     * The bouncing coefficient of the new plane.
     */
    bCoef?: number,

    /**
     * The collision mask of the new plane.
     */
    cMask?: UnparsedCollisionFlags,

    /**
     * The collision group of the new plane.
     */
    cGroup?: UnparsedCollisionFlags
  }

  declare interface CreateDiscParams {

    /**
     * The position of the new disc.
     */
    pos: [x: number, y: number],

    /**
     * The radius of the new disc.
     */
    radius: number,

    /**
     * The speed of the new disc.
     */
    speed?: [x: number, y: number],

    /**
     * The gravity (acceleration) of the new disc.
     */
    gravity?: [x: number, y: number],

    /**
     * The inverse mass of the new disc.
     */
    invMass?: number,

    /**
     * The damping of the new disc.
     */
    damping?: number,

    /**
     * The color of the new disc.
     */
    color?: UnparsedColor,

    /**
     * The bouncing coefficient of the new disc.
     */
    bCoef?: number,

    /**
     * The collision mask of the new disc.
     */
    cMask?: UnparsedCollisionFlags,

    /**
     * The collision group of the new disc.
     */
    cGroup?: UnparsedCollisionFlags
  }

  declare interface CreateJointParams {

    /**
     * The first disc index of the new joint.
     */
    d0: int,

    /**
     * The second disc index of the new joint.
     */
    d1: int,

    /**
     * The color of the new joint.
     */
    color?: UnparsedColor,

    /**
     * The strengh of the new joint.
     */
    strength?: "rigid" | number,

    /**
     * The length of the new joint.
     */
    length?: number | [min: number, max: number]
  }

  declare interface CreateJointFromObjParams {

    /**
     * The first disc of the new joint.
     */
    d0: Disc,

    /**
     * The second disc of the new joint.
     */
    d1: Disc,

    /**
     * The color of the new joint.
     */
    color?: UnparsedColor,

    /**
     * The strength of the new joint.
     */
    strength?: "rigid" | number,

    /**
     * The length of the new joint.
     */
    length?: number | [min: number, max: number]
  }

  declare interface AddVertexParams {

    /**
     * The x component of the position of the new vertex.
     */
    x: number,

    /**
     * The y component of the position of the new vertex.
     */
    y: number, 

    /**
     * The bouncing coefficient of the new vertex.
     */
    bCoef?: number,

    /**
     * The collision mask of the new vertex.
     */
    cMask?: UnparsedCollisionFlags,

    /**
     * The collision group of the new vertex.
     */
    cGroup?: UnparsedCollisionFlags
  }

  declare interface AddSegmentParams {

    /**
     * Index of the first vertex of the new segment.
     */
    v0: int,

    /**
     * Index of the second vertex of the new segment.
     */
    v1: int,

    /**
     * Color of the new segment.
     */
    color?: UnparsedColor,

    /**
     * Bias of the new segment.
     */
    bias?: number,

    /**
     * Curve of the new segment. (unit: angles)
     */
    curve?: number,

    /**
     * Curve of the new segment. (unit: radians) While modifying this, the engine does not update some values. Only use this if you know what you are doing.
     */
    curveF?: number,

    /**
     * Visibility of the new segment.
     */
    vis?: boolean,

    /**
     * Bouncing coefficient of the new segment.
     */
    bCoef?: number,

    /**
     * Collision mask of the new segment.
     */
    cMask?: UnparsedCollisionFlags,

    /**
     * Collision group of the new segment.
     */
    cGroup?: UnparsedCollisionFlags
  }

  declare interface AddGoalParams {
    
    /**
     * The starting point of the new goal object.
     */
    p0: [x: number, y: number],

    /**
     * The ending point of the new goal object.
     */
    p1: [x: number, y: number],

    /**
     * The team of the new goal object.
     */
    team: UnparsedTeam2
  }

  declare interface AddPlaneParams {
    
    /**
     * The normal of the new plane. This value is normalized automatically.
     */
    normal: [x: number, y: number],

    /**
     * The distance of the new plane to the origin(0,0).
     */
    dist: number,

    /**
     * The bouncing coefficient of the new plane.
     */
    bCoef?: number,

    /**
     * The collision mask of the new plane.
     */
    cMask?: UnparsedCollisionFlags,

    /**
     * The collision group of the new plane.
     */
    cGroup?: UnparsedCollisionFlags
  }

  declare interface AddDiscParams {

    /**
     * The position of the new disc.
     */
    pos: [x: number, y: number],

    /**
     * The radius of the new disc.
     */
    radius: number,

    /**
     * The speed of the new disc.
     */
    speed?: [x: number, y: number],

    /**
     * The gravity (acceleration) of the new disc.
     */
    gravity?: [x: number, y: number],

    /**
     * The inverse mass of the new disc.
     */
    invMass?: number,

    /**
     * The damping of the new disc.
     */
    damping?: number,

    /**
     * The color of the new disc.
     */
    color?: UnparsedColor,

    /**
     * The bouncing coefficient of the new disc.
     */
    bCoef?: number,

    /**
     * The collision mask of the new disc.
     */
    cMask?: UnparsedCollisionFlags,

    /**
     * The collision group of the new disc.
     */
    cGroup?: UnparsedCollisionFlags
  }

  declare interface AddJointParams {

    /**
     * The first disc index of the new joint.
     */
    d0: int,

    /**
     * The second disc index of the new joint.
     */
    d1: int,

    /**
     * The color of the new joint.
     */
    color?: UnparsedColor,

    /**
     * The strengh of the new joint.
     */
    strength?: "rigid" | number,

    /**
     * The length of the new joint.
     */
    length?: number | [min: number, max: number]
  }

  declare interface AddSpawnPointParams {
    
    /**
     * The x coordinate of the new spawn point.
     */
    x: number,

    /**
     * The y coordinate of the new spawn point.
     */
    y: number,

    /**
     * The team of the new spawn point.
     */
    team: UnparsedTeam2
  }

  declare interface AddPlayerParams {

    /**
     * The id the new player. Already existing ids should not be used. 0 < `id` < 65535.
     */
    id: int,

    /**
     * The name of the new player.
     */
    name: string,

    /**
     * The avatar of the new player.
     */
    avatar: string,

    /**
     * The country code of the new player.
     */
    flag: string,

    /**
     * The team of the new player. If this is "spec", the keys after this are ignored. Otherwise, player is moved to the specified team, a player disc is automatically generated and the below values are applied to the new disc.
     */
    team: UnparsedTeam3,

    /**
     * The position of the new player. Team must not be "spec".
     */
    pos?: [x: number, y: number],

    /**
     * The speed of the new player. Team must not be "spec".
     */
    speed?: [x: number, y: number],

    /**
     * The gravity (acceleration) of the new player. Team must not be "spec".
     */
    gravity?: [x: number, y: number],

    /**
     * The radius of the new player. Team must not be "spec".
     */
    radius?: number,

    /**
     * The inverse mass of the new player. Team must not be "spec".
     */
    invMass?: number,

    /**
     * The damping of the new player. Team must not be "spec".
     */
    damping?: number,

    /**
     * The bouncing coefficient of the new player. Team must not be "spec".
     */
    bCoef?: number,

    /**
     * The collision mask of the new player. Team must not be "spec".
     */
    cMask?: UnparsedCollisionFlags,

    /**
     * The collision group of the new player. Team must not be "spec".
     */
    cGroup?: UnparsedCollisionFlags
  }

  declare interface UpdateVertexParams {

    /**
     * The new x coordinate of the vertex.
     */
    x?: number,

    /**
     * The new y coordinate of the vertex.
     */
    y?: number, 

    /**
     * The new bouncing coefficient of the vertex.
     */
    bCoef?: number,

    /**
     * The new collision mask of the vertex.
     */
    cMask?: UnparsedCollisionFlags,

    /**
     * The new collision group of the vertex.
     */
    cGroup?: UnparsedCollisionFlags
  }

  declare interface UpdateSegmentParams {

    /**
     * The new first vertex index of the segment.
     */
    v0?: int,

    /**
     * The new second vertex index of the segment.
     */
    v1?: int,

    /**
     * The new color of the segment.
     */
    color?: UnparsedColor,

    /**
     * The new bias of the segment.
     */
    bias?: number,

    /**
     * The new curve of the segment. (unit: degrees)
     */
    curve?: number,

    /**
     * The new curve of the segment. (unit: radians) While modifying this, the engine does not update some values. Only use this if you know what you are doing.
     */
    curveF?: number,

    /**
     * The new visibility of the segment.
     */
    vis?: boolean,

    /**
     * The new bouncing coefficient of the segment.
     */
    bCoef?: number,

    /**
     * The new collision mask of the segment.
     */
    cMask?: UnparsedCollisionFlags,

    /**
     * The new collision group of the segment.
     */
    cGroup?: UnparsedCollisionFlags
  }

  declare interface UpdateGoalParams {

    /**
     * The new first point of the goal.
     */
    p0?: [x: number, y: number],

    /**
     * The new second point of the goal.
     */
    p1?: [x: number, y: number],

    /**
     * The new team of the goal.
     */
    team?: UnparsedTeam2
  }

  declare interface UpdatePlaneParams {

    /**
     * The new normal of the plane. This value is normalized automatically.
     */
    normal?: [x: number, y: number],

    /**
     * The new distance of the plane to the origin. (0, 0)
     */
    dist?: number,

    /**
     * The new bouncing coefficient of the plane.
     */
    bCoef?: number,

    /**
     * The new collision mask of the plane.
     */
    cMask?: UnparsedCollisionFlags,

    /**
     * The new collision group of the plane.
     */
    cGroup?: UnparsedCollisionFlags
  }

  declare interface UpdateDiscParams {

    /**
     * The new position of the disc.
     */
    pos?: [x: number, y: number],

    /**
     * The new speed of the disc.
     */
    speed?: [x: number, y: number],

    /**
     * The new gravity (acceleration) of the disc.
     */
    gravity?: [x: number, y: number],

    /**
     * The new radius of the disc.
     */
    radius?: number,

    /**
     * The new inverse mass of the disc.
     */
    invMass?: number,

    /**
     * The new damping of the disc.
     */
    damping?: number,

    /**
     * The new color of the disc.
     */
    color?: UnparsedColor,

    /**
     * The new bouncing coefficient of the disc.
     */
    bCoef?: number,

    /**
     * The new collision mask of the disc.
     */
    cMask?: UnparsedCollisionFlags,

    /**
     * The new collision group of the disc.
     */
    cGroup?: UnparsedCollisionFlags
  }

  declare interface UpdateDiscObjParams {

    /**
     * The new position of the disc.
     */
    pos?: [x: number, y: number],

    /**
     * The new speed of the disc.
     */
    speed?: [x: number, y: number],

    /**
     * The new gravity (acceleration) of the disc.
     */
    gravity?: [x: number, y: number],

    /**
     * The new radius of the disc.
     */
    radius?: number,

    /**
     * The new inverse mass of the disc.
     */
    invMass?: number,

    /**
     * The new damping of the disc.
     */
    damping?: number,

    /**
     * The new color of the disc.
     */
    color?: UnparsedColor,

    /**
     * The new bouncing coefficient of the disc.
     */
    bCoef?: number,

    /**
     * The new collision mask of the disc.
     */
    cMask?: UnparsedCollisionFlags,

    /**
     * The new collision group of the disc.
     */
    cGroup?: UnparsedCollisionFlags
  }

  declare interface UpdateJointParams {

    /**
     * The new first disc index of the joint.
     */
    d0?: int,

    /**
     * The new second disc index of the joint.
     */
    d1?: int,

    /**
     * The new color of the joint.
     */
    color?: UnparsedColor,

    /**
     * The new strength of the joint.
     */
    strength?: "rigid" | number,

    /**
     * The new length of the joint.
     */
    length?: number | [min: number, max: number]
  }

  declare interface UpdateSpawnPointParams {

    /**
     * The new x coordinate of the spawn point.
     */
    x?: number,

    /**
     * The new y coordinate of the spawn point.
     */
    y?: number,

    /**
     * The new team of the spawn point.
     */
    team?: UnparsedTeam2
  }

  declare interface UpdatePlayerParams {

    /**
     * The new name of the player.
     */
    name?: string,

    /**
     * The new avatar of the player.
     */
    avatar?: string,

    /**
     * The new flag of the player.
     */
    flag?: string,

    /**
     * The new team of the player.
     */
    team?: UnparsedTeam3,

    /**
     * The new position of the player.
     */
    pos?: [x: number, y: number],

    /**
     * The new speed of the player.
     */
    speed?: [x: number, y: number],

    /**
     * The new gravity (acceleration) of the player.
     */
    gravity?: [x: number, y: number],

    /**
     * The new radius of the player.
     */
    radius?: number,

    /**
     * The new inverse mass of the player.
     */
    invMass?: number,

    /**
     * The new damping of the player.
     */
    damping?: number,

    /**
     * The new bouncing coefficient of the player.
     */
    bCoef?: number,

    /**
     * The new collision mask of the player.
     */
    cMask?: UnparsedCollisionFlags,

    /**
     * The new collision group of the player.
     */
    cGroup?: UnparsedCollisionFlags
  }

  declare interface UpdateStadiumPlayerPhysicsParams {

    /**
     * The new radius value of the player physics of the current stadium.
     */
    radius?: number,

    /**
     * The new gravity (acceleration) value of the player physics of the current stadium.
     */
    gravity?: [x: number, y: number],

    /**
     * The new inverse mass value of the player physics of the current stadium.
     */
    invMass?: number,

    /**
     * The new bouncing coefficient value of the player physics of the current stadium.
     */
    bCoef?: number,

    /**
     * The new collision group value of the player physics of the current stadium.
     */
    cGroup?: UnparsedCollisionFlags,

    /**
     * The new damping value of the player physics of the current stadium.
     */
    damping?: number,

    /**
     * The new kicking damping value of the player physics of the current stadium.
     */
    kickingDamping?: number,

    /**
     * The new acceleration value of the player physics of the current stadium.
     */
    acceleration?: number,

    /**
     * The new kickingAcceleration value of the player physics of the current stadium.
     */
    kickingAcceleration?: number,

    /**
     * The new kick strength value of the player physics of the current stadium.
     */
    kickStrength?: number,

    /**
     * The new kick back value of the player physics of the current stadium.
     */
    kickback?: number
  }

  declare interface UpdateStadiumBgParams {

    /**
     * The new background type of the current stadium. (`0`: "none", `1`: "grass", `2`: "hockey")
     */
    type?: 0 | 1 | 2,

    /**
     * The new background width of the current stadium.
     */
    width?: number,

    /**
     * The new background height of the current stadium.
     */
    height?: number,

    /**
     * The new kick off radius of the current stadium.
     */
    kickOffRadius?: number,

    /**
     * The new background corner radius of the current stadium.
     */
    cornerRadius?: number,

    /**
     * The new background color of the current stadium.
     */
    color?: UnparsedColor,

    /**
     * The new goal line distance of the current stadium.
     */
    goalLine?: number
  }

  declare interface UpdateStadiumGeneralParams {

    /**
     * The new name of the current stadium.
     */
    name?: string,

    /**
     * The new width of the current stadium.
     */
    width?: number,

    /**
     * The new height of the current stadium.
     */
    height?: number,

    /**
     * The new max view width of the current stadium.
     */
    maxViewWidth?: number,

    /**
     * The new camera follow value of the current stadium. (`0`: "", `1`: "player")
     */
    cameraFollow?: 0 | 1,

    /**
     * The new spawn distance value of the current stadium.
     */
    spawnDistance?: number,

    /**
     * The new kick off reset value of the current stadium. `true`: "full", `false`: "partial"
     */
    kickOffReset?: boolean,

    /**
     * The new can-be-stored value of the current stadium.
     */
    canBeStored?: boolean
  }

  declare interface SandboxModeFunctions {

    /**
     * Returns all current game objects in hbs/json format. Note that the values written here are the currently active values, not the static and stored ones.
     * 
     * @returns A json object that represents all objects in the current stadium.
     */
    exportStadium(): object;

    /**
     * Creates a vertex object in memory and returns it. 
     * 
     * @param data An object with the following structure:
     *   - `x: number`: The x component of the position of the new vertex.
     *   - `y: number`: The y component of the position of the new vertex.
     *   - `bCoef: number | null`: The bouncing coefficient of the new vertex.
     *   - `cMask: string[] | null`: The collision mask of the new vertex.
     *   - `cGroup: string[] | null`: The collision group of the new vertex.
     * 
     * @returns A Vertex object.
     */
    createVertex(data: CreateVertexParams): Vertex;

    /**
     * Creates a segment object in memory using vertex indices and returns it. The vertices must exist at the given indices in the `vertices` array of the current room.
     * 
     * @param data An object with the following structure:
     *   - `v0: int`: Index of the first vertex of the new segment.
     *   - `v1: int`: Index of the second vertex of the new segment.
     *   - `color: "transparent" | string | [r: int, g: int, b: int] | null`: Color of the new segment.
     *   - `bias: number | null`: Bias of the new segment.
     *   - `curve: number | null`: Curve of the new segment. (unit: angles)
     *   - `curveF: number | null`: Curve of the new segment. (unit: radians) While modifying this, the engine does not update some values. Only use this if you know what you are doing.
     *   - `vis: boolean | null`: Visibility of the new segment.
     *   - `bCoef: number | null`: Bouncing coefficient of the new segment.
     *   - `cMask: string[] | null`: Collision mask of the new segment.
     *   - `cGroup: string[] | null`: Collision group of the new segment.
     * 
     * @returns A Segment object.
     */
    createSegment(data: CreateSegmentParams): Segment;

    /**
     * Creates a segment object in memory using vertex objects and returns it. 
     * 
     * @param data An object with the following structure:
     *   - `v0: Vertex`: First vertex of the new segment.
     *   - `v1: Vertex`: Second vertex of the new segment.
     *   - `color: "transparent" | string | [r: int, g: int, b: int] | null`: Color of the new segment.
     *   - `bias: number | null`: Bias of the new segment.
     *   - `curve: number | null`: Curve of the new segment. (unit: angles)
     *   - `curveF: number | null`: Curve of the new segment. (unit: radians) While modifying this, the engine does not update some values. Only use this if you know what you are doing.
     *   - `vis: boolean | null`: Visibility of the new segment.
     *   - `bCoef: number | null`: Bouncing coefficient of the new segment.
     *   - `cMask: string[] | null`: Collision mask of the new segment.
     *   - `cGroup: string[] | null`: Collision group of the new segment.
     * 
     * @returns A Segment object.
     */
    createSegmentFromObj(data: CreateSegmentFromObjParams): Segment;

    /**
     * Creates a goal object in memory and returns it.
     * 
     * @param data An object with the following structure:
     *   - `p0: [x: number, y: number]`: The starting point of the new goal object.
     *   - `p1: [x: number, y: number]`: The ending point of the new goal object.
     *   - `team: "red" | "blue"`: The team of the new goal object.
     * 
     * @returns A Goal object.
     */
    createGoal(data: CreateGoalParams): Goal;
    
    /**
     * Creates a plane object in memory and returns it.
     * 
     * @param data An object with the following structure:
     *   - `normal: [x: number, y: number]`: The normal of the new plane. This value is normalized automatically.
     *   - `dist: number`: The distance of the new plane to the origin(0,0).
     *   - `bCoef: number | null`: The bouncing coefficient of the new plane.
     *   - `cMask: string[] | null`: The collision mask of the new plane.
     *   - `cGroup: string[] | null`: The collision group of the new plane.
     * 
     * @returns A Plane object.
     */
    createPlane(data: CreatePlaneParams): Plane;

    /**
     * Creates a disc object in memory and returns it.
     * 
     * @param data An object with the following structure:
     *   - `pos: [x: number, y: number]`: The position of the new disc.
     *   - `speed: [x: number, y: number] | null`: The speed of the new disc.
     *   - `gravity: [x: number, y: number] | null`: The gravity (acceleration) of the new disc.
     *   - `radius: number`: The radius of the new disc.
     *   - `invMass: number | null`: The inverse mass of the new disc.
     *   - `damping: number | null`: The damping of the new disc.
     *   - `color: "transparent" | string | [r: int, g: int, b: int] | null`: The color of the new disc.
     *   - `bCoef: number | null`: The bouncing coefficient of the new disc.
     *   - `cMask: string[] | null`: The collision mask of the new disc.
     *   - `cGroup: string[] | null`: The collision group of the new disc.
     * 
     * @returns A Disc object.
     */
    createDisc(data: CreateDiscParams): Disc;

    /**
     * Creates a joint object in memory using disc indices and returns it.
     * 
     * @param data An object with the following structure:
     *   - `d0: int`: The first disc index of the new joint.
     *   - `d1: int`: The second disc index of the new joint.
     *   - `color: "transparent" | string | [r: int, g: int, b: int] | null`: The color of the new joint.
     *   - `strength: "rigid" | number | null`: The strengh of the new joint.
     *   - `length: number | [min: number, max: number] | null`: The length of the new joint.
     * 
     * @returns A Joint object.
     */
    createJoint(data: CreateJointParams): Joint;

    /**
     * Creates a joint object in memory using disc objects and returns it.
     * 
     * @param data An object with the following structure:
     *   - `d0: Disc`: The first disc of the new joint.
     *   - `d1: Disc`: The second disc of the new joint.
     *   - `color: "transparent" | string | [r: int, g: int, b: int] | null`: The color of the new joint.
     *   - `strength: "rigid" | number | null`: The strength of the new joint.
     *   - `length: number | [min: number, max: number] | null`: The length of the new joint.
     * 
     * @returns A Joint object.
     */
    createJointFromObj(data: CreateJointFromObjParams): Joint;

    /**
     * Creates a vertex object and adds it to the current stadium.
     * 
     * @param data An object with the following structure:
     *   - `x: number`: The x component of the position of the new vertex.
     *   - `y: number`: The y component of the position of the new vertex.
     *   - `bCoef: number | null`: The bouncing coefficient of the new vertex.
     *   - `cMask: string[] | null`: The collision mask of the new vertex.
     *   - `cGroup: string[] | null`: The collision group of the new vertex.
     * 
     * @returns void.
     */
    addVertex(data: AddVertexParams): void;

    /**
     * Creates a segment object using vertex indices and adds it to the current stadium. The vertices must exist at the given indices in the `vertices` array of the current room.
     * 
     * @param data An object with the following structure:
     *   - `v0: int`: Index of the first vertex of the new segment.
     *   - `v1: int`: Index of the second vertex of the new segment.
     *   - `color: "transparent" | string | [r: int, g: int, b: int] | null`: Color of the new segment.
     *   - `bias: number | null`: Bias of the new segment.
     *   - `curve: number | null`: Curve of the new segment. (unit: angles)
     *   - `curveF: number | null`: Curve of the new segment. (unit: radians) While modifying this, the engine does not update some values. Only use this if you know what you are doing.
     *   - `vis: boolean | null`: Visibility of the new segment.
     *   - `bCoef: number | null`: Bouncing coefficient of the new segment.
     *   - `cMask: string[] | null`: Collision mask of the new segment.
     *   - `cGroup: string[] | null`: Collision group of the new segment.
     * 
     * @returns void.
     */
    addSegment(data: AddSegmentParams): void;

    /**
     * Creates a goal object and adds it to the current stadium.
     * 
     * @param data An object with the following structure:
     *   - `p0: [x: number, y: number]`: The starting point of the new goal object.
     *   - `p1: [x: number, y: number]`: The ending point of the new goal object.
     *   - `team: "red" | "blue"`: The team of the new goal object.
     * 
     * @returns void.
     */
    addGoal(data: AddGoalParams): void;

    /**
     * Creates a plane object and adds it to the current stadium.
     * 
     * @param data An object with the following structure:
     *   - `normal: [x: number, y: number]`: The normal of the new plane. This value is normalized automatically.
     *   - `dist: number`: The distance of the new plane to the origin(0,0).
     *   - `bCoef: number | null`: The bouncing coefficient of the new plane.
     *   - `cMask: string[] | null`: The collision mask of the new plane.
     *   - `cGroup: string[] | null`: The collision group of the new plane.
     * 
     * @returns void.
     */
    addPlane(data: AddPlaneParams): void;

    /**
     * Creates a disc object and adds it to the current stadium.
     * 
     * @param data An object with the following structure:
     *   - `pos: [x: number, y: number]`: The position of the new disc.
     *   - `speed: [x: number, y: number] | null`: The speed of the new disc.
     *   - `gravity: [x: number, y: number] | null`: The gravity (acceleration) of the new disc.
     *   - `radius: number`: The radius of the new disc.
     *   - `invMass: number | null`: The inverse mass of the new disc.
     *   - `damping: number | null`: The damping of the new disc.
     *   - `color: "transparent" | string | [r: int, g: int, b: int] | null`: The color of the new disc.
     *   - `bCoef: number | null`: The bouncing coefficient of the new disc.
     *   - `cMask: string[] | null`: The collision mask of the new disc.
     *   - `cGroup: string[] | null`: The collision group of the new disc.
     * 
     * @returns void.
     */
    addDisc(data: AddDiscParams): void;

    /**
     * Creates a joint object and adds it to the current stadium.
     * 
     * @param data An object with the following structure:
     *   - `d0: int`: The first disc index of the new joint.
     *   - `d1: int`: The second disc index of the new joint.
     *   - `color: "transparent" | string | [r: int, g: int, b: int] | null`: The color of the new joint.
     *   - `strength: "rigid" | number | null`: The strengh of the new joint.
     *   - `length: number | [min: number, max: number] | null`: The length of the new joint.
     * 
     * @returns void.
     */
    addJoint(data: AddJointParams): void;

    /**
     * Adds a spawn point with given coordinate to the given team in the current stadium.
     * 
     * @param data An object with the following structure:
     *   - `x: number`: The x coordinate of the new spawn point.
     *   - `y: number`: The y coordinate of the new spawn point.
     *   - `team: "red" | "blue"`: The team of the new spawn point.
     * 
     * @returns void.
     */
    addSpawnPoint(data: AddSpawnPointParams): void;

    /**
     * Adds a player with given properties to the current stadium.
     * 
     * @param data An object with the following structure:
     *   - `id: int`: The id the new player. Already existing ids should not be used. 0 < `id` < 65535.
     *   - `name: string`: The name of the new player.
     *   - `avatar: string`: The avatar of the new player.
     *   - `flag: string`: The country code of the new player.
     *   - `team: "spec" | "red" | "blue"`: The team of the new player. If this is "spec", the keys after this are ignored. Otherwise, player is moved to the specified team, a player disc is automatically generated and the below values are applied to the new disc.
     *   - `pos: [x: number, y: number] | null`: The position of the new player. Team must not be "spec".
     *   - `speed: [x: number, y: number] | null`: The speed of the new player. Team must not be "spec".
     *   - `gravity: [x: number, y: number] | null`: The gravity (acceleration) of the new player. Team must not be "spec".
     *   - `radius: number | null`: The radius of the new player. Team must not be "spec".
     *   - `invMass: number | null`: The inverse mass of the new player. Team must not be "spec".
     *   - `damping: number | null`: The damping of the new player. Team must not be "spec".
     *   - `bCoef: number | null`: The bouncing coefficient of the new player. Team must not be "spec".
     *   - `cMask: string[] | null`: The collision mask of the new player. Team must not be "spec".
     *   - `cGroup: string[] | null`: The collision group of the new player. Team must not be "spec".
     * 
     * @returns void.
     */
    addPlayer(data: AddPlayerParams): void;

    /**
     * Returns the indices of vertices that form a segment. 
     * 
     * @param obj The segment that contain the vertices whose indices we are trying to find.
     * 
     * @returns An array in this format: `[index1: int, index2: int]`. `index1` and `index2` are the indices of the 1st and 2nd vertices of the queried segment.
     */
    findVertexIndicesOfSegmentObj(obj: Segment): int[];

    /**
     * Returns the indices of vertices that form a segment. 
     * 
     * @param idx The index of the segment that contain the vertices whose indices we are trying to find.
     * 
     * @returns An array in this format: `[index1: int, index2: int]`. `index1` and `index2` are the indices of the 1st and 2nd vertices of the queried segment. Returns `null` if the segment does not exist.
     */
    findVertexIndicesOfSegment(idx: int): int[];

    /**
     * Updates the `idx`th vertex's only the given values.
     * 
     * @param idx Index of the vertex that is desired to be updated.
     * @param data An object with the following structure:
     *   - `x: number | null`: The new x coordinate of the vertex.
     *   - `y: number | null`: The new y coordinate of the vertex.
     *   - `bCoef: number | null`: The new bouncing coefficient of the vertex.
     *   - `cMask: string[] | null`: The new collision mask of the vertex.
     *   - `cGroup: string[] | null`: The new collision group of the vertex.
     * 
     * @returns void.
     */
    updateVertex(idx: int, data: UpdateVertexParams): void;

    /**
     * Updates the `idx`th segment's only the given values.
     * 
     * @param idx Index of the segment that is desired to be updated.
     * @param data An object with the following structure:
     *   - `v0: int | null`: The new first vertex index of the segment.
     *   - `v1: int | null`: The new second vertex index of the segment.
     *   - `color: "transparent" | string | [r: int, g: int, b: int] | null`: The new color of the segment.
     *   - `bias: number | null`: The new bias of the segment.
     *   - `curve: number | null`: The new curve of the segment. (unit: degrees)
     *   - `curveF: number | null`: The new curve of the segment. (unit: radians) While modifying this, the engine does not update some values. Only use this if you know what you are doing.
     *   - `vis: boolean | null`: The new visibility of the segment.
     *   - `bCoef: number | null`: The new bouncing coefficient of the segment.
     *   - `cMask: string[] | null`: The new collision mask of the segment.
     *   - `cGroup: string[] | null`: The new collision group of the segment.
     * 
     * @returns void.
     */
    updateSegment(idx: int, data: UpdateSegmentParams): void;

    /**
     * Updates the `idx`th goal's only the given values.
     * 
     * @param idx Index of the goal that is desired to be updated.
     * @param data An object with the following structure:
     *   - `p0: [x: number, y: number] | null`: The new first point of the goal.
     *   - `p1: [x: number, y: number] | null`: The new second point of the goal.
     *   - `team: "red" | "blue" | null`: The new team of the goal.
     * 
     * @returns void.
     */
    updateGoal(idx: int, data: UpdateGoalParams): void;

    /**
     * Updates the `idx`th plane's only the given values.
     * 
     * @param idx Index of the plane that is desired to be updated.
     * @param data An object with the following structure:
     *   - `normal: [x: number, y: number] | null`: The new normal of the plane. This value is normalized automatically.
     *   - `dist: number | null`: The new distance of the plane to the origin. (0, 0)
     *   - `bCoef: number | null`: The new bouncing coefficient of the plane.
     *   - `cMask: string[] | null`: The new collision mask of the plane.
     *   - `cGroup: string[] | null`: The new collision group of the plane.
     * 
     * @returns void.
     */
    updatePlane(idx: int, data: UpdatePlaneParams): void;

    /**
     * Updates the `idx`th disc's only the given values.
     * 
     * @param idx Index of the disc that is desired to be updated.
     * @param data An object with the following structure:
     *   - `pos: [x: number, y: number] | null`: The new position of the disc.
     *   - `speed: [x: number, y: number] | null`: The new speed of the disc.
     *   - `gravity: [x: number, y: number] | null`: The new gravity (acceleration) of the disc.
     *   - `radius: number | null`: The new radius of the disc.
     *   - `invMass: number | null`: The new inverse mass of the disc.
     *   - `damping: number | null`: The new damping of the disc.
     *   - `color: "transparent" | string | [r: int, g: int, b: int] | null`: The new color of the disc.
     *   - `bCoef: number | null`: The new bouncing coefficient of the disc.
     *   - `cMask: string[] | null`: The new collision mask of the disc.
     *   - `cGroup: string[] | null`: The new collision group of the disc.
     * 
     * @returns void.
     */
    updateDisc(idx: int, data: UpdateDiscParams): void;

    /**
     * Updates the given disc object(`discObj`)'s only the given values.
     * 
     * @param discObj The disc that is desired to be updated.
     * @param data An object with the following structure:
     *   - `pos: [x: number, y: number] | null`: The new position of the disc.
     *   - `speed: [x: number, y: number] | null`: The new speed of the disc.
     *   - `gravity: [x: number, y: number] | null`: The new gravity (acceleration) of the disc.
     *   - `radius: number | null`: The new radius of the disc.
     *   - `invMass: number | null`: The new inverse mass of the disc.
     *   - `damping: number | null`: The new damping of the disc.
     *   - `color: "transparent" | string | [r: int, g: int, b: int] | null`: The new color of the disc.
     *   - `bCoef: number | null`: The new bouncing coefficient of the disc.
     *   - `cMask: string[] | null`: The new collision mask of the disc.
     *   - `cGroup: string[] | null`: The new collision group of the disc.
     * 
     * @returns void.
     */
    updateDiscObj(discObj: Disc, data: UpdateDiscObjParams): void;

    /**
     * Updates the `idx`th joint's only the given values.
     * 
     * @param idx Index of the joint that is desired to be updated.
     * @param data An object with the following structure:
     *   - `d0: int | null`: The new first disc index of the joint.
     *   - `d1: int | null`: The new second disc index of the joint.
     *   - `color: "transparent" | string | [r: int, g: int, b: int] | null`: The new color of the joint.
     *   - `strength: "rigid" | number | null`: The new strength of the joint.
     *   - `length: number | [min: number, max: number] | null`: The new length of the joint.
     * 
     * @returns void.
     */
    updateJoint(idx: int, data: UpdateJointParams): void;

    /**
     * Updates the `idx`th spawn point in team(`team`) using only the given values.
     * 
     * @param idx Index of the spawn point that is desired to be updated.
     * @param team Current team of the spawn point that is desired to be updated.
     * @param data An object with the following structure:
     *   - `x: number | null`: The new x coordinate of the spawn point.
     *   - `y: number | null`: The new y coordinate of the spawn point.
     *   - `team: "red" | "blue" | null`: The new team of the spawn point.
     * 
     * @returns void.
     */
    updateSpawnPoint(idx: int, team: UnparsedTeam2, data: UpdateSpawnPointParams): void;

    /**
     * Updates the player(`playerId`)'s only the given values.
     * 
     * @param playerId Id of the player that is desired to be updated.
     * @param data An object with the following structure:
     *   - `name: string | null`: The new name of the player.
     *   - `avatar: string | null`: The new avatar of the player.
     *   - `flag: string | null`: The new flag of the player.
     *   - `team: "spec" | "red" | "blue" | null`: The new team of the player.
     *   - `pos: [x: number, y: number] | null`: The new position of the player.
     *   - `speed: [x: number, y: number] | null`: The new speed of the player.
     *   - `gravity: [x: number, y: number] | null`: The new gravity (acceleration) of the player.
     *   - `radius: number | null`: The new radius of the player.
     *   - `invMass: number | null`: The new inverse mass of the player.
     *   - `damping: number | null`: The new damping of the player.
     *   - `bCoef: number | null`: The new bouncing coefficient of the player.
     *   - `cMask: string[] | null`: The new collision mask of the player.
     *   - `cGroup: string[] | null`: The new collision group of the player.
     * 
     * @returns void.
     */
    updatePlayer(playerId: uint16, data: UpdatePlayerParams): void;

    /**
     * Removes a vertex from the current room.
     * 
     * @param idx Index of the vertex to remove.
     * 
     * @returns void.
     */
    removeVertex(idx: int): void;

    /**
     * Removes a segment from the current room.
     * 
     * @param idx Index of the segment to remove.
     * 
     * @returns void.
     */
    removeSegment(idx: int): void;

    /**
     * Removes a goal from the current room.
     * 
     * @param idx Index of the goal to remove.
     * 
     * @returns void.
     */
    removeGoal(idx: int): void;

    /**
     * Removes a plane from the current room.
     * 
     * @param idx Index of the plane to remove.
     * 
     * @returns void.
     */
    removePlane(idx: int): void;

    /**
     * Removes a disc from the current room.
     * 
     * @param idx Index of the disc to remove.
     * 
     * @returns void.
     */
    removeDisc(idx: int): void;

    /**
     * Removes a joint from the current room.
     * 
     * @param idx Index of the joint to remove.
     * 
     * @returns void.
     */
    removeJoint(idx: int): void;

    /**
     * Removes a spawn point from the current room.
     * 
     * @param idx Index of the spawn point to remove.
     * @param team The team that the spawn point belongs to.
     * 
     * @returns void.
     */
    removeSpawnPoint(idx: int, team: string): void;

    /**
     * Removes a player from the current room.
     * 
     * @param playerId Id of the player to remove.
     * 
     * @returns void.
     */
    removePlayer(playerId: uint16): void;

    /**
     * Updates the current stadium's only the given player physics values.
     * 
     * @param data An object with the following structure:
     *   - `radius: number | null`: The new radius value of the player physics of the current stadium.
     *   - `gravity: [x: number, y: number] | null`: The new gravity (acceleration) value of the player physics of the current stadium.
     *   - `invMass: number | null`: The new inverse mass value of the player physics of the current stadium.
     *   - `bCoef: number | null`: The new bouncing coefficient value of the player physics of the current stadium.
     *   - `cGroup: string[] | null`: The new collision group value of the player physics of the current stadium.
     *   - `damping: number | null`: The new damping value of the player physics of the current stadium.
     *   - `kickingDamping: number | null`: The new kicking damping value of the player physics of the current stadium.
     *   - `acceleration: number | null`: The new acceleration value of the player physics of the current stadium.
     *   - `kickingAcceleration: number | null`: The new kickingAcceleration value of the player physics of the current stadium.
     *   - `kickStrength: number | null`: The new kick strength value of the player physics of the current stadium.
     *   - `kickback: number | null`: The new kick back value of the player physics of the current stadium.
     * 
     * @returns void.
     */
    updateStadiumPlayerPhysics(data: UpdateStadiumPlayerPhysicsParams): void;

    /**
     * Updates the current stadium's only the given background values.
     * 
     * @param data An object with the following structure:
     *   - `type: 0 | 1 | 2 | null`: The new background type of the current stadium. (`0`: "none", `1`: "grass", `2`: "hockey")
     *   - `width: number | null`: The new background width of the current stadium.
     *   - `height: number | null`: The new background height of the current stadium.
     *   - `kickOffRadius: number | null`: The new kick off radius of the current stadium.
     *   - `cornerRadius: number | null`: The new background corner radius of the current stadium.
     *   - `color: "transparent" | string | [r: number, g: number, b: number] | null`: The new background color of the current stadium.
     *   - `goalLine: number | null`: The new goal line distance of the current stadium.
     * 
     * @returns void.
     */
    updateStadiumBg(data: UpdateStadiumBgParams): void;

    /**
     * Updates the current stadium's only the given general values.
     * 
     * @param data An object with the following structure:
     *   - `name: string | null`: The new name of the current stadium.
     *   - `width: number | null`: The new width of the current stadium.
     *   - `height: number | null`: The new height of the current stadium.
     *   - `maxViewWidth: number | null`: The new max view width of the current stadium.
     *   - `cameraFollow: 0 | 1 | null`: The new camera follow value of the current stadium. (`0`: "", `1`: "player")
     *   - `spawnDistance: number | null`: The new spawn distance value of the current stadium.
     *   - `kickOffReset: boolean | null`: The new kick off reset value of the current stadium. `true`: "full", `false`: "partial"
     *   - `canBeStored: boolean | null`: The new can-be-stored value of the current stadium.
     * 
     * @returns void.
     */
    updateStadiumGeneral(data: UpdateStadiumGeneralParams): void;
  }

  /**
   * These functions are intended to be used in host mode to create/control in-memory bot players that will run much more efficiently than standard networking bot players. They also work for normal player objects, and can be used to create some events belonging to a player that did not originate from that player. Most of these fake events also trigger an `onOperationReceived` call before being sent to clients.
   */
  declare interface FakeEventTriggers {

    /**
     * Triggers a fake join room event; which in turn creates a new in-memory player object. If there was a player before with this id, old resources are automatically reassigned to this new player object, and that player will wake up.
     * 
     * @param id Id of the player. 0 <= `id` <= 65535
     * @param name Name of the player. 
     * @param flag Country code of the player. 
     * @param avatar Avatar of the player. 
     * @param conn Connection string of the player. 
     * @param auth Auth string of the player. 
     * 
     * @returns void.
     */
    fakePlayerJoin(id: uint16, name: string, flag: string, avatar: string, conn: string, auth: string): void;

    /**
     * Triggers a fake leave room event. The player, although seemingly leaving the room, still watches the room, waiting for a new fake player join event. All parameters except `id` may be different in the new `fakePlayerJoin` call, which allows player's `name`, `flag`, `avatar`, `conn` and `auth` to change without the player entirely leaving the room.
     * 
     * - Returns the player's properties so that you may pass them to `fakePlayerJoin` at a later time to re-insert that player. 
     * 
     * @param id Id of the player leaving. `id`=0 will cause desync on clients. (Because there's a special check for this case in original clients.)
     * 
     * @returns An object that has the following strucure: `{ id: uint16, name: string, flag: string, avatar: string, conn: string, auth: string }`.
     */
    fakePlayerLeave(id: uint16): { id: uint16, name: string, flag: string, avatar: string, conn: string, auth: string };

    /**
     * Triggers a fake input(keys) event that apparently originated from the player whose id is `byId`.
     * 
     * @param input New input value of the player. 0<=`input`<=31.
     * @param byId Id of the player who will look like he/she sent this event.
     * 
     * @returns void.
     */
    fakeSendPlayerInput(input: int, byId: uint16): void;

    /**
     * Triggers a fake chat event that apparently originated from the player whose id is `byId`.
     * 
     * @param msg The chat message.
     * @param byId Id of the player who will look like he/she sent this event.
     * 
     * @returns void.
     */
    fakeSendPlayerChat(msg: string, byId: uint16): void;

    /**
     * Triggers a fake chat indicator change event that apparently originated from the player whose id is `byId`.
     * 
     * @param value The new chat indicator status of the player.
     * @param byId Id of the player who will look like he/she sent this event.
     * 
     * @returns void.
     */
    fakeSetPlayerChatIndicator(value: boolean, byId: uint16): void;

    /**
     * Triggers a fake avatar change event that apparently originated from the player whose id is `byId`.
     * 
     * @param value The new avatar of the player.
     * @param byId Id of the player who will look like he/she sent this event.
     * 
     * @returns void.
     */
    fakeSetPlayerAvatar(value: string, byId: uint16): void;

    /**
     * Triggers a fake admin status change event for the player whose id is `playerId` that apparently originated from the player whose id is `byId`.
     * 
     * @param playerId Id of the player who will have his/her admin rights changed.
     * @param value Whether the player is desired to have admin rights or not.
     * @param byId Id of the player who will look like he/she sent this event.
     * 
     * @returns void.
     */
    fakeSetPlayerAdmin(playerId: uint16, value: boolean, byId: uint16): void;

    /**
     * Triggers a fake player sync status change event that apparently originated from the player whose id is `byId`.
     * 
     * @param value The new synchronization status of the player.
     * @param byId Id of the player who will look like he/she sent this event.
     * 
     * @returns void.
     */
    fakeSetPlayerSync(value: boolean, byId: uint16): void;

    /**
     * Triggers a fake stadium change event that apparently originated from the player whose id is `byId`. The game must be stopped first.
     * 
     * @param value The new stadium of the current room.
     * @param byId Id of the player who will look like he/she sent this event.
     */
    fakeSetStadium(value: Stadium, byId: uint16): void;

    /**
     * Triggers a fake game start event that apparently originated from the player whose id is `byId`.
     * 
     * @param byId Id of the player who will look like he/she sent this event.
     * 
     * @returns void.
     */
    fakeStartGame(byId: uint16): void;

    /**
     * Triggers a fake game stop event that apparently originated from the player whose id is `byId`. The game must be started first.
     * 
     * @param byId Id of the player who will look like he/she sent this event.
     * 
     * @returns void.
     */
    fakeStopGame(byId: uint16): void;

    /**
     * Triggers a fake game pause/resume event that apparently originated from the player whose id is `byId`. The game must be started first.
     * 
     * @param value `value`=`true`: pause, `false`: resume.
     * @param byId Id of the player who will look like he/she sent this event.
     * 
     * @returns void.
     */
    fakeSetGamePaused(value: boolean, byId: uint16): void;

    /**
     * Triggers a fake score limit change event that apparently originated from the player whose id is `byId`.
     * 
     * @param value The new score limit of the current room. The game must be stopped first. 0 means unlimited. 0<=`value`<=99.
     * @param byId Id of the player who will look like he/she sent this event.
     * 
     * @returns void.
     */
    fakeSetScoreLimit(value: int, byId: uint16): void;

    /**
     * Triggers a fake time limit change event that apparently originated from the player whose id is `byId`.
     * 
     * @param value The new time limit of the current room. The game must be stopped first. 0 means unlimited. 0<=`value`<=99.
     * @param byId Id of the player who will look like he/she sent this event.
     * 
     * @returns void.
     */
    fakeSetTimeLimit(value: int, byId: uint16): void;

    /**
     * Triggers a fake teams lock change event that apparently originated from the player whose id is `byId`.
     * 
     * @param value The new teams lock value of the current room.
     * @param byId Id of the player who will look like he/she sent this event.
     * 
     * @returns void.
     */
    fakeSetTeamsLock(value: boolean, byId: uint16): void;

    /**
     * Triggers a fake auto teams event that apparently originated from the player whose id is `byId`.
     * 
     * @param byId Id of the player who will look like he/she sent this event.
     * 
     * @returns void.
     */
    fakeAutoTeams(byId: uint16): void;

    /**
     * Triggers a fake player team change event for the player whose id is `playerId` that apparently originated from the player whose id is `byId`.
     * 
     * @param playerId Id of the player whose team is being changed.
     * @param teamId Id of the desired team of the player. `0`: specetator, `1`: red, `2`: blue.
     * @param byId Id of the player who will look like he/she sent this event.
     * 
     * @returns void.
     */
    fakeSetPlayerTeam(playerId: uint16, teamId: int, byId: uint16): void;

    /**
     * Triggers a fake kick rate limit change event that apparently originated from `player(byId)`. 
     * 
     * @param min The new `min` part of kick rate limit. `min`>=0.
     * @param rate The new `rate` part of kick rate limit. `rate`>=0.
     * @param burst The new `burst` part of kick rate limit. `burst`>=0.
     * @param byId Id of the player who will look like he/she sent this event.
     * 
     * @returns void.
     */
    fakeSetKickRateLimit(min: int, rate: int, burst: int, byId: uint16): void;

    /**
     * Triggers a team color change event for the team whose id is `teamId` that apparently originated from the player whose id is `byId`. 
     * 
     * @param teamId Id of the team whose colors are desired to change.
     * @param angle The angle of stripes for the inner colors. Should be between `0` and `180`.
     * @param colors This array can contain minimum 1, maximum 4 integers; where 0 <= each integer <= 16777215. The first element is the text color and the rest are inner stripe colors.
     * @param byId Id of the player who will look like he/she sent this event.
     * 
     * @returns void.
     */
    fakeSetTeamColors(teamId: int, angle: int, colors: int[], byId: uint16): void;

    /**
     * Triggers a fake leave/kick/ban event for the player whose id is `playerId` that apparently originated from the player whose id is `byId`.
     * 
     * @param playerId Id of the player who will leave the room. (Or get kicked/banned from the room.)
     * @param reason The reason of kick/ban. If `null`, it is interpreted as he/she leaving by himself/herself, and the `ban` value is ignored in that case.
     * @param ban Whether the player is being banned or not.
     * @param byId Id of the player who will look like he/she sent this event.
     * 
     * @returns void.
     */
    fakeKickPlayer(playerId: uint16, reason: string | null, ban: boolean, byId: uint16): void;
  }

  declare interface StartStreamingParams {

    /**
     * Whether immediate streaming is active or not. If immediate mode is not active, streaming will fall back to interval mode.
     */
    immediate: boolean = true;

    /**
     * Called when a new visitor starts watching the stream.
     * 
     * @param count The number of clients that are currently watching the stream.
     * 
     * @returns void.
     */
    onClientCount: (count: int32)=>void;

    /**
     * Called when data is ready to be streamed. All streaming logic should be done inside this callback.
     * 
     * @param data The data to be streamed.
     * 
     * @returns void.
     */
    emitData: (data: Uint8Array)=>void;
  }

  declare interface StartStreamingReturnValue {

    /**
     * Called when the streaming is successfully started.
     * 
     * @returns void.
     */
    onSuccess: ()=>void;

    /**
     * Called when data is received from the streaming backend. 
     * 
     * @param data The data that has been received.
     * 
     * @returns void.
     */
    onDataReceived: (data: Uint8Array)=>void;

    /**
     * This callback should be called within an interval if the immediate mode is not active.
     * 
     * @returns void.
     */
    interval: ()=>void;
  }

  declare interface RoomBase {

    /**
     * `true` for a host room, `false` for a client room.
     */
    readonly isHost: boolean;

    /**
     * A reference to a HaxballClient object that was created and returned from the call to `Room.join` or `Room.create`. This object is used internally.
     */
    readonly client: HaxballClient;

    /**
     * Current player's id.
     */
    readonly currentPlayerId: int;

    /**
     * The current Player object.
     */
    readonly currentPlayer: Player;

    /**
     * The object that holds the whole room state.
     */
    readonly state: RoomState;

    /**
     * The object that holds the whole extrapolated room state. Returns null if no extrapolated data is available yet.
     */
    readonly stateExt: RoomState | null;

    /**
     * The object that holds the game state information. Returns null if game is not active.
     */
    readonly gameState: GameState | null;

    /**
     * The object that holds the extrapolated game state information. Returns null if game is not active or no extrapolated data is available yet.
     */
    readonly gameStateExt: GameState | null;

    /**
     * Session description value of the room's WebRTC connection. (only for client rooms)
     */
    readonly sdp: string;

    /**
     * Time between releasing and re-pressing the kick key. `kickTimeout` <= `0` means that this feature is disabled. (in milliseconds, defaults to `-1`)
     */
    readonly kickTimeout: int;
    
    /**
     * The current roomConfig object.
     */
    readonly config: RoomConfig;
    
    /**
     * The current renderer object.
     */
    readonly renderer: Renderer | null;

    /**
     * Array of all available plugins. This is used internally to restore the order of plugins while a plugin is being activated/deactivated.
     */
    readonly plugins: Plugin[];

    /**
     * Array of currently active plugins. This is used internally for callbacks.
     */
    readonly activePlugins: Plugin[];

    /**
     * All available plugins mapped as `pluginsMap[plugin.name] = plugin`, for meaningful communication between addons inside our custom addon codes.
     */
    readonly pluginsMap: object;

    /**
     * Array of all available libraries.
     */
    readonly libraries: Library[];

    /**
     * All available libraries mapped as `librariesMap[library.name] = library`, for meaningful communication between addons inside our custom addon codes.
     */
    readonly librariesMap: object;

    /**
     * The name of the room. read-only.
     */
    readonly name: string;

    /**
     * The url of the room. read-only.
     */
    readonly link: string;

    /**
     * The game's current time limit. read-only.
     */
    readonly timeLimit: int;

    /**
     * The game's current score limit. read-only.
     */
    readonly scoreLimit: int;

    /**
     * The stadium object of the room. read-only.
     */
    readonly stadium: Stadium;

    /**
     * The list of players in the room. read-only.
     */
    readonly players: Player[];

    /**
     * Red team's current score. `null` if game is not active. read-only.
     */
    readonly redScore: int | null;

    /**
     * Blue team's current score. `null` if game is not active. read-only.
     */
    readonly blueScore: int | null;

    /**
     * Elapsed time in current game. `null` if game is not active. read-only.
     */
    readonly timeElapsed: int | null;

    /**
     * The current frame number of the room. read-only.
     */
    readonly currentFrameNo: int;

    /**
     * The current list of banned players. read-only. host-only.
     */
    readonly banList: BanEntry[];

    /**
     * The current password of the room. read-only. host-only.
     */
    readonly password: string;

    /**
     * The current geolocation of the room. read-only. host-only.
     */
    readonly geo: {lat: number, lon: number, flag: number};

    /**
     * The current maximum number of players of the room. read-only. host-only.
     */
    readonly maxPlayerCount: int16;

    /**
     * The current fake password value of the room. read-only. host-only.
     */
    readonly fakePassword: boolean | null;

    /**
     * The current fixed player count value of the room. read-only. host-only.
     */
    readonly fixedPlayerCount: int16 | null;

    /**
     * Whether the room is currently being shown in the room list of 
     * the backend server or not. read-only. host-only.
     */
    readonly showInRoomList: boolean;

    /**
     * Whether the room's player count checking is disabled or not. read-only. host-only.
     */
    readonly unlimitedPlayerCount: boolean;

    /**
     * The current recaptcha token of the room. If changed, it will also refresh the room link. host-only.
     */
    token: string;

    /**
     * The current join-recaptcha status of the room. host-only.
     */
    requireRecaptcha: boolean;

    /**
     * Leaves the current room. Also releases the resources used by this object.
     * 
     * @returns void.
     */
    leave(): void;

    /**
     * Sets the room's `properties`.  Only room host can use this function.
     * 
     * @param properties An object that might have the following keys: (You might omit any key if you don't want to change its value.)
     *   - `name: string | null`: The desired name of the current room.
     *   - `password: string | null`: The desired password of the current room, or `null` to clear the password.
     *   - `geo: GeoLocation | null`: The desired geolocation of the current room.
     *   - `playerCount: int | null`: An integer value to fix the player count of the current room to that number, or `null` to return to normal behaviour. Original Haxball backend has the current restriction about this value: `0` <= `playerCount` <= `30`. If the room does not satisfy this, it is not shown in the room list.
     *   - `maxPlayerCount: int | null`: The maximum player count value of the current room. Original Haxball backend has the current restriction about this value: `0` <= `maxPlayerCount` <= `30`. If the room does not satisfy this, it is not shown in the room list.
     *   - `fakePassword: boolean | null`: If set to `true` or `false`, the room will set its password-protected status to your value. Passing `null` disables this behaviour.
     *   - `unlimitedPlayerCount: boolean`: If set to `true`, bypasses the player count checks, resulting in unlimited maximum player count. However, the default backend will not show the room in the room list if the player count > `30`.
     *   - `showInRoomList: boolean`: Whether to show this room in the room list or not.
     * 
     * @returns void.
     */
    setProperties(properties: SetRoomPropertiesParams): void;

    /**
     * Sets the kick rate limit of the current room. admins-only.
     * 
     * @param min The desired `min` value of kick rate limit. `0` <= `min` <= `255`.
     * @param rate The desired `rate` value of kick rate limit. `0` <= `rate` <= `255`.
     * @param burst The desired `burst` value of kick rate limit. `0` <= `burst` <= `100`.
     * 
     * @returns void.
     */
    setKickRateLimit(min: int, rate: int, burst: int): void;

    /**
     * Sets the current player's `handicap` value.
     * 
     * @param handicap The desired handicap value in msecs. `0` <= `handicap` <= `300`.
     * 
     * @returns void.
     */
    setHandicap(handicap: int): void;

    /**
     * Sets the current player's `extrapolation` value.
     * 
     * @param extrapolation The desired extrapolation value in msecs. -`200` <= `extrapolation` <= `200`.
     * 
     * @returns void.
     */
    setExtrapolation(extrapolation: int): void;

    /**
     * Bans a player from joining the room. host-only.
     * 
     * @param playerId Id of the player to ban.
     * 
     * @returns Id of the new ban entry if successful, otherwise null.
     */
    addPlayerBan(playerId: uint16): BanEntryId | null;

    /**
     * Bans all given ip(range)(s) from joining the room. host-only.
     * 
     * @param ips The ip(range)(s) to ban.
     * 
     * @returns An array that contains; for each ip (range) parameter in the 
     * given order, the id of the new ban entry if successful, otherwise null.
     */
    addIpBan(...ips: (string | IPv4Range | IPv6Range)[]): (BanEntryId | null)[];

    /**
     * Bans all given auth(s) from joining the room. host-only.
     * 
     * @param auths The auth(s) to ban.
     * 
     * @returns An array that contains; for each auth parameter in the 
     * given order, the id of the new ban entry if successful, otherwise null.
     */
    addAuthBan(...auths: string[]): (BanEntryId | null)[];

    /**
     * Removes the ban entry with the given id. host-only.
     * 
     * @param id Id of the ban entry to remove.
     * 
     * @returns True if the ban entry was removed, otherwise false.
     */
    removeBan(id: BanEntryId): boolean;

    /**
     * Clears all bans. host-only.
     * 
     * @returns void.
     */
    clearBans(): void;

    /**
     * Clears the ban of a player. host-only.
     * 
     * @param id Id of the player whose ban will be cleared.
     * 
     * @returns void.
     */
    clearBan(id: uint16): void;

    /**
     * Executes any event inside this room. host-only.
     * 
     * @param event The event to be executed.
     * @param byId Id of the player of whom this event will be executed by.
     * 
     * @returns void.
     */
    executeEvent(event: HaxballEvent, byId: uint16): void;

    /**
     * Clears the event queue. Can be useful when the game engine is stuck.
     * 
     * @returns void.
     */
    clearEvents(): void;

    /**
     * Sets the current player's client `avatar` value.
     * 
     * @param avatar The desired avatar value. `avatar.length` must be <= `2`.
     * 
     * @returns void.
     */
    setAvatar(avatar: string): void;

    /**
     * Sets the avatar to `value` for the player whose id is `id`. host-only.
     * 
     * @param id Id of the player whose avatar is being changed.
     * @param value The desired avatar value. `avatar.length` must be <= `2`.
     * @param headless If `true`, sets the headless avatar. Otherwise, sets the client avatar.
     * 
     * @returns void.
     */
    setPlayerAvatar(id: uint16, value: string, headless: boolean): void;

    /**
     * Sets the current player's chat indicator status.
     * 
     * @param active `true` activates the chat indicator, `false` deactivates it.
     * 
     * @returns void.
     */
    setChatIndicatorActive(active: boolean): void;

    /**
     * Sets the team colors for the team whose id is `teamId`. admins-only.
     * 
     * @param teamId Id of the team whose colors are desired to be changed. Can either be `1`(red) or `2`(blue).
     * @param angle The desired angle of stripes. Should be between `-180` and `180`.
     * @param colors Minimum 1, maximum 4 parseable(hex-rgb) color parameters. First parameter is the text color, and the others are stripe colors.
     * 
     * @returns void.
     */
    setTeamColors(teamId: int, angle: int, ...colors: string[]): void;

    /**
     * When a player joins the room, the engine is first checking whether the current player count>=room's maximum player count value. This function enables or disables this check. host-only.
     * 
     * @param on Whether the unlimited player count feature is desired to be active or not.
     * 
     * @returns void.
     */
    setUnlimitedPlayerCount(on: boolean): void;

    /**
     * Fakes Haxball's backend by directly modifying the password-protectedness of the room. host-only.
     * 
     * @param fakePwd If `fakePwd` is `true` or `false`, the room will set its password-protected status to the passed `fakePwd` value regardless of the room's actual `password` value. Passing `null` returns to default behaviour. host-only.
     * 
     * @returns void.
     */
    setFakePassword(fakePwd: boolean | null): void;

    /**
     * Sends a chat message.
     * 
     * @param msg The message that is desired to be sent. `msg.length` must be <= `140`.
     * @param targetId If `null`, the message is sent to everyone; otherwise, only the player whose id is `targetId` will receive this chat message. host-only.
     * 
     * @returns void.
     */
    sendChat(msg: string, targetId: uint16 | null): void;

    /**
     * Sends an announcement message. host-only.
     * 
     * @param msg The announcement message that is desired to be sent. `msg.length` must be <= `1000`.
     * @param targetId If `null`, the message is sent to everyone; otherwise, only the player whose id is `targetId` will receive this announcement.
     * @param color The desired color of the announcement. Range: `-1` <= `color` < `16777216`.
     *   - The color value can be converted into a rgba string via API's `Utils.numberToColor` function.
     *   - The special value `-1` means transparent.
     * @param style The desired font style of the announcement. Must be one of the following:
     *   - `0`: use document's default font style.
     *   - `1`: fontWeight = "bold".
     *   - `2`: fontStyle = "italic".
     *   - `3`: fontSize = "12px".
     *   - `4`: fontWeight = "bold", fontSize = "12px".
     *   - `5`: fontWeight = "italic", fontSize = "12px".
     * @param sound The desired sound of the announcement. Must be one of the following:
     *   - `0`: no sound.
     *   - `1`: chat sound.
     *   - `2`: highlight sound.
     * 
     * @returns void.
     */
    sendAnnouncement(msg: string, targetId: uint16 | null, color: int, style: int, sound: int): void;

    /**
     * Sets the properties of a disc. host-only.
     * 
     * @param discId Id of the disc whose properties are desired to be set.
     * @param properties The desired properties to set. This will not change the omitted keys of the disc. `properties` has the following structure:
     *   - `x: number | null`: The desired x coordinate of the disc.
     *   - `y: number | null`: The desired y coordinate of the disc.
     *   - `xspeed: number | null`: Desired x component of the speed of the disc.
     *   - `yspeed: number | null`: Desired y component of the speed of the disc.
     *   - `xgravity: number | null`: Desired x component of the gravity of the disc.
     *   - `ygravity: number | null`: Desired y component of the gravity of the disc.
     *   - `radius: number | null`: The desired radius of the disc.
     *   - `bCoeff: number | null`: The desired bouncing coefficient of the disc.
     *   - `invMass: number | null`: The desired inverse mass of the disc.
     *   - `damping: number | null`: The desired damping of the disc.
     *   - `color: int | null`: The desired color of the disc.
     *   - `cMask: int | null`: The desired collision mask of the disc.
     *   - `cGroup: int | null`: The desired collision group of the disc.
     * 
     * @returns void.
     */
    setDiscProperties(discId: int, properties: SetDiscPropertiesParams): void;

    /**
     * Sets the desired disc properties of any player. host-only.
     * 
     * @param playerId Id of the player whose disc properties are desired to be changed.
     * @param properties The desired properties to set. This will not change the omitted keys of the disc. `properties` has the following structure:
     *   - `x: number | null`: The desired x coordinate of the disc.
     *   - `y: number | null`: The desired y coordinate of the disc.
     *   - `xspeed: number | null`: Desired x component of the speed of the disc.
     *   - `yspeed: number | null`: Desired y component of the speed of the disc.
     *   - `xgravity: number | null`: Desired x component of the gravity of the disc.
     *   - `ygravity: number | null`: Desired y component of the gravity of the disc.
     *   - `radius: number | null`: The desired radius of the disc.
     *   - `bCoeff: number | null`: The desired bouncing coefficient of the disc.
     *   - `invMass: number | null`: The desired inverse mass of the disc.
     *   - `damping: number | null`: The desired damping of the disc.
     *   - `color: int | null`: The desired color of the disc.
     *   - `cMask: int | null`: The desired collision mask of the disc.
     *   - `cGroup: int | null`: The desired collision group of the disc.
     * 
     * @returns void.
     */
    setPlayerDiscProperties(playerId: uint16, properties: SetDiscPropertiesParams): void;

    /**
     * Removes all of the players whose ids exist in the array `playerIdList`, and adds them back in the given order to the top or bottom of the player list depending on the `moveToTop` value. host-only.
     * 
     * @param playerIdList The ids of players that are desired to be removed from the room's players list, reordered to match the order in idList and added back to the room's players list.
     * @param moveToTop Whether to add the players to the top or bottom of the room's players list.
     * 
     * @returns void.
     */
    reorderPlayers(playerIdList: uint16[], moveToTop: boolean): void;

    /**
     * Creates a `CustomEvent` event message with given `type` and `data` properties and sends it. The values `type` and `data` completely depend on your custom event's order and logic. Note that the message can only be received by the users of this modified client.
     * 
     * @param type The type of the custom event.
     * @param data Any custom data for this specific event. This is converted to a string via `JSON.stringify` while being serialized.
     * @param targetId If given, sends this event only to the player with this id if the player is using this modified client.
     * 
     * @returns void.
     */
    sendCustomEvent(type: uint32, data: object, targetId?: uint16): void;

    /**
     * Creates a `BinaryCustomEvent` event message with given `type` and `data` properties and sends it. The values `type` and `data` completely depend on your custom event's order and logic. Note that the message can only be received by the users of this modified client.
     * 
     * @param type The type of the binary custom event.
     * @param data Any custom binary data for this specific event.
     * @param targetId If given, sends this event only to the player with this id if the player is using this modified client.
     * 
     * @returns void.
     */
    sendBinaryCustomEvent(type: uint32, data: Uint8Array, targetId?: uint16): void;

    /**
     * Creates an `IdentityEvent` event message with given player `id` and `data` properties and sends it. This event sets `playerObject.identity` value to the given `data` object for all clients. Note that the message can only be received by the users of this modified client.
     * 
     * @param id Id of the player whose identity data is being changed.
     * @param data The new identity data. It can be any JSON object.
     * @param targetId If given, sends this event only to the player with this id if the player is using this modified client.
     * 
     * @returns void.
     */
    setPlayerIdentity(id: uint16, data: object, targetId?: uint16): void;
    
    /**
     * Returns the current player's key state value.
     * 
     * @returns An integer between `0` and `31` inclusive.
     */
    getKeyState(): int;

    /**
     * Sets the current player's key state value.
     * 
     * @param state The desired key state value. `0` <= `state` <= `31`.
     * 
     * @returns void.
     */
    setKeyState(state: int): void;

    /**
     * Starts the game. admin-only.
     * 
     * @returns void.
     */
    startGame(): void;

    /**
     * Stops the game. admin-only.
     * 
     * @returns void.
     */
    stopGame(): void;

    /**
     * Pauses or resumes the game. admin-only.
     * 
     * @returns void.
     */
    pauseGame(): void;

    /**
     * Returns `true` if game is paused.
     * 
     * @returns void.
     */
    isGamePaused(): boolean;

    /**
     * Removes the last two players from spectators and adds them to consecutive teams. The first is always added to red, the second is always blue. If there is only one player, it is added to a random team. admin-only.
     * 
     * @returns void.
     */
    autoTeams(): void;

    /**
     * Locks or unlocks the ability for non-admin players to change teams while the game is not active. admin-only.
     * 
     * @returns void.
     */
    lockTeams(): void;

    /**
     * Moves every player to the spectators team. admin-only.
     * 
     * @returns void.
     */
    resetTeams(): void;

    /**
     * Removes the last two players from the spectators team and adds them to consecutive teams. The first is added to a random team, the second is added to the rival of the first team, etc. If there is only one player, it is added to a random team. admin-only.
     * 
     * @returns void.
     */
    randTeams(): void;

    /**
     * Moves every player in a team to the spectators team. admin-only.
     * 
     * @param teamId Id of the team whose whose players will be moved to the spectators team.
     * 
     * @returns void.
     */
    resetTeam(teamId: int): void;

    /**
     * Sets the synchronization status of the current player.
     * 
     * @param value The desired synchronization status.
     * 
     * @returns void.
     */
    setSync(value: boolean): void;

    /**
     * Sets the current stadium to `stadium`. The game must be stopped first. admin-only.
     * 
     * @param stadium The desired stadium to be set as the room's current stadium.
     * @param onError The function to be called if an error occurs.
     * 
     * @returns void.
     */
    setCurrentStadium(stadium: Stadium, onError: ErrorCallback): void;

    /**
     * Sets the time limit of the room. The game must be stopped first. admin-only.
     * 
     * @param value The desired time limit. 0 <= `value` <= 99. `0` means unlimited.
     * 
     * @returns void.
     */
    setTimeLimit(value: int): void;

    /**
     * Sets the score limit of the room. The game must be stopped first. admin-only.
     * 
     * @param value The desired score limit. 0 <= `value` <= 99. `0` means unlimited.
     * 
     * @returns void.
     */
    setScoreLimit(value: int): void;

    /**
     * Moves the current player to the team whose id is `teamId`. This operation is blocked by default if the current player is not admin and (the game is active or teams are locked).
     * 
     * @param teamId Id of the team that is desired to join.
     * 
     * @returns void.
     */
    changeTeam(teamId: int): void;

    /**
     * Moves a player to a different team. admin-only.
     * 
     * @param playerId Id of the player to be moved to a different team.
     * @param teamId Id of the team to move the player to.
     * 
     * @returns void.
     */
    setPlayerTeam(playerId: uint16, teamId: int): void;

    /**
     * Give/take away admin rights to/from a player. admin-only.
     * 
     * @param playerId Id of the player who will have his/her admin rights changed.
     * @param isAdmin Whether the player is desired to have admin rights or not.
     * 
     * @returns void.
     */
    setPlayerAdmin(playerId: uint16, isAdmin: boolean): void;

    /**
     * Kicks or bans a player.
     * 
     * @param playerId Id of the player who is being kicked/banned.
     * @param reason The kick/ban reason. If `null`, it is interpreted as he/she leaving by himself/herself, and the `ban` value is ignored in that case.
     * @param isBanning If `true`, the player is being banned; otherwise, the player is being kicked.
     * 
     * @returns void.
     */
    kickPlayer(playerId: uint16, reason: string | null, isBanning: boolean): void;

    /**
     * Returns the Player object for the player whose id is `id`.
     * 
     * @param id Id of the player.
     * 
     * @returns A Player object.
     */
    getPlayer(id: uint16): Player;

    /**
     * Returns the ball disc.
     * 
     * @param extrapolated Defaults to `true`.
     *   - `true`: return the latest extrapolated version.
     *   - `false`: return the original version.
     * 
     * @returns A Disc object.
     */
    getBall(extrapolated?: boolean): Disc;

    /**
     * Returns the disc array of the current room.
     * 
     * @param extrapolated Defaults to `true`.
     *   - `true`: return the latest extrapolated version.
     *   - `false`: return the original version.
     * 
     * @returns An array that consists of Disc objects.
     */
    getDiscs(extrapolated?: boolean): Disc[];

    /**
     * Returns the disc whose id is `discId`.
     * 
     * @param discId Id of the disc to be returned.
     * @param extrapolated Defaults to `true`.
     *   - `true`: return the latest extrapolated version.
     *   - `false`: return the original version.
     * 
     * @returns A Disc object.
     */
    getDisc(discId: int, extrapolated?: boolean): Disc;

    /**
     * Returns the disc that belongs to the player whose id is `playerId`.
     * 
     * @param playerId Id of the player whose disc is to be returned.
     * @param extrapolated Defaults to `true`.
     *   - `true`: return the latest extrapolated version.
     *   - `false`: return the original version.
     * 
     * @returns A Disc object.
     */
    getPlayerDisc(playerId: uint16, extrapolated?: boolean): Disc;

    /**
     * Returns the disc that belongs to the player whose id is `playerId`. Faster than `getPlayerDisc`, but experimental. Use at your own risk.
     * 
     * @param playerId Id of the player whose disc is to be returned.
     * 
     * @returns A Disc object.
     */
    getPlayerDisc_exp(playerId: uint16): Disc;

    /**
     * Activate or deactivate the plugin whose name is `name`.
     * 
     * @param name Name of the plugin that is desired to be activated/deactivated.
     * @param active Whether to activate(active = `true`) the plugin or to deactivate(active = `false`) it.
     * 
     * @returns void.
     */
    setPluginActive(name: string, active: boolean): void;

    /**
     * Start recording replay. Recording should be stopped before calling this.
     * 
     * @returns `true` if succeeded, `false` otherwise.
     */
    startRecording(): boolean;

    /**
     * Stop recording replay. Recording should be started before calling this.
     * 
     * @returns The recorded `UInt8Array` replay data if succeeded, `null` otherwise.
     */
    stopRecording(): Uint8Array | null;

    /**
     * Start streaming the game. Streaming and recording should be stopped before calling this. (Currently, recording and streaming cannot be run simultaneously)
     * 
     * @param params The parameters required for the streaming to work.
     * 
     * @returns A StartStreamingReturnValue structure if succeeded, or `null` otherwise.
     */
    startStreaming(params: StartStreamingParams): StartStreamingReturnValue | null;

    /**
     * Stop streaming the game. Streaming should be started before calling this.
     * 
     * @returns void.
     */
    stopStreaming(): void;

    /**
     * Returns whether the replay recorder is active or not.
     * 
     * @returns `true` if replay recording is active; `false` otherwise.
     */
    isRecording(): boolean;

    /**
     * Sets the `RoomConfig` object that contains all the main callbacks of this room.
     * 
     * @param roomConfig The new `RoomConfig` instance to be replaced with the room's current one.
     * 
     * @returns void.
     */
    setConfig(roomConfig: RoomConfig): void;

    /**
     * Adds all callbacks in `roomConfig` into the room's current RoomConfig object. If there is a callback with the same name, a new callback is created that calls both of them. (The current callback is called first.)
     * 
     * @param roomConfig The `RoomConfig` object to be mixed with the current room's RoomConfig object.
     * 
     * @returns void.
     */
    mixConfig(roomConfig: RoomConfig): void;

    /**
     * Replaces the `Plugin` at the specified `pluginIndex` with the `newPluginObj` plugin. The old plugin is deactivated and finalized and the new plugin is initialized. If the old plugin was active before, the new plugin is also activated. The names of the plugins must be the same.
     * 
     * @param pluginIndex The index of the plugin that is about to be replaced with the new Plugin object.
     * @param newPluginObj The new Plugin object that will replace the old one.
     * 
     * @returns void.
     */
    updatePlugin(pluginIndex: int, newPluginObj: Plugin): void;

    /**
     * Sets the `Renderer` object that will render the game. If exists, the old renderer is finalized and the new renderer is initialized.
     * 
     * @param renderer The new Renderer object that will replace the old one.
     * 
     * @returns void.
     */
    setRenderer(renderer: Renderer): void;

    /**
     * Replaces the `Library` at the specified `libraryIndex` with the `newLibraryObj` library. The old library is finalized and the new library is initialized. The names of the libraries must be the same.
     * 
     * @param libraryIndex The index of the library that is about to be replaced with the new Library object.
     * @param newLibraryObj The new Library object that will replace the old one.
     * 
     * @returns void.
     */
    updateLibrary(libraryIndex: int, newLibraryObj: Library): void;

    /**
     * Returns a snapshot of the current room state. You can load this object directly into sandbox using its `useSnapshot(roomState)` function. Note that the values stored here are the currently active values, not the static and stored ones.
     * 
     * @returns The snapshot copy of the current room's state.
     */
    takeSnapshot(): RoomState;
  }

  /***
   * The class/object that currently hosts all room operations. Can only be instantiated by either `Room.join` or `Room.create`.
   */
  export interface Room extends RoomBase, AllRoomConfigCallbacks, SandboxModeFunctions, FakeEventTriggers {}
  export class Room implements RoomBase, AllRoomConfigCallbacks, SandboxModeFunctions, FakeEventTriggers {

    /**
     * Creates a room with given parameters.
     * 
     * @param createParams An object that might have the following keys:
     *   - `name: string`: Name of the room.
     *   - `password: string | null`: A password string to protect the room, or `null` for no password.
     *   - `token: string`: In order to create a room, we have to solve a recaptcha challenge and write the resulting token into this key. The recaptcha token can be originally obtained from `https://www.haxball.com/headlesstoken`. However, this url will be different while using a custom backend server.
     *   - `noPlayer: boolean`: Determines whether a player object will be created for the room host or not.
     *   - `geo: GeoLocation`: The geolocation value of the room about to be created.
     *   - `playerCount: int | null`: If set to an `int`, fixes the current player count to this specific value.
     *   - `maxPlayerCount: int`: The maximum allowed player count in the room.
     *   - `unlimitedPlayerCount: boolean`: If set to `true`, bypasses the player count checks, resulting in unlimited maximum player count. However, the default backend will not show the room in the room list if the player count > `30`.
     *   - `fakePassword: boolean | null`: If set to `true` or `false`, the room will set its password-protected status to your value. Passing `null` disables this behaviour.
     *   - `showInRoomList: boolean`: Whether to show this room in the room list or not.
     *   - `onError: Function(error: HBError, playerId: int)`: Called when a exception is thrown by one of the client connections. playerId is the id of the player that caused the exception. The player's connection will be closed just after this callback is executed.
     * @param commonParams A `HaxballClient`-like object.
     * 
     * @returns An instance of `HaxballClient`.
     */
    static create(createParams: CreateRoomParams, commonParams: HaxballClient): HaxballClient;

    /**
     * Tries to join a room using the given parameters.
     * 
     * @param joinParams An object that might have the following keys:
     *   - `id: string`: The id of the room to join. For example, if the room link is `https://www.haxball.com/play?c=31IBNI3w4F0`, the id of this room is `31IBNI3w4F0`.
     *   - `password: string | null`: A password value to join the room if the room is password-protected.
     *   - `token: string | null`: If the room is recaptcha-protected, you have to use a client token. Currently there is not any other clean way of generating this token for Haxball's original backend except using the NW.js token generator project, so you might want to look at it.
     *   - `authObj: Auth`: An auth object that has to be initialized by `Utils.generateAuth()` or `Utils.authFromKey()` before being used here.
     * @param commonParams A `HaxballClient`-like object.
     * 
     * @returns An instance of `HaxballClient`.
     */
    static join(joinParams: JoinRoomParams, commonParams: HaxballClient): HaxballClient;

    /**
     * Creates a sandbox room object.
     * 
     * @param callbacks An object that may have all callbacks defined in sections `2`, `3.1`, `4` and `6` of our event callbacks documentation. In addition, it is possible to use a render callback that has the same signature as defined in section `3` of our `Renderer` documentation.
     * @param options An object that might have the following keys:
     *   - `controlledPlayerId: int | null`: Id of the player to be controlled.
     *   - `requestAnimationFrame: ((callback: function, ...args: any[])=>number) | null`: Override function for `requestAnimationFrame`. Omit to use library's default `requestAnimationFrame`.
     *   - `cancelAnimationFrame: ((handle: number)=>void) | null`: Override function for `cancelAnimationFrame`. Omit to use library's default `cancelAnimationFrame`.
     *   - `fps_limit: int | null`: Any positive number that will be used as the fps limit. (`null` = no limit)
     * 
     * @returns An instance of the SandboxRoom structure.
     */
    static sandbox(callbacks: CommonlyUsedCallbacks & CustomCallbacks, options: SandboxOptions): SandboxRoom;

    /**
     * Creates a stream watcher room object.
     * 
     * @param initialStreamData The initial `Uint8Array` data that is received just after connecting to a streaming room.
     * @param callbacks An object that may have all callbacks defined in sections `2`, `3.1`, `4` and `6` of our event callbacks documentation. In addition, it is possible to use a render callback that has the same signature as defined in section `3` of our `Renderer` documentation.
     * @param options An object that might have the following keys:
     *   - `requestAnimationFrame: ((callback: function, ...args: any[])=>number) | null`: Override function for `requestAnimationFrame`. Omit to use library's default `requestAnimationFrame`.
     *   - `cancelAnimationFrame: ((handle: number)=>void) | null`: Override function for `cancelAnimationFrame`. Omit to use library's default `cancelAnimationFrame`.
     *   - `fps_limit: int | null`: Any positive number that will be used as the fps limit. (`null` = no limit)
     * 
     * @returns An instance of the StreamWatcherRoom structure.
     */
    static streamWatcher(initialStreamData: Uint8Array, callbacks: CommonlyUsedCallbacks & CustomCallbacks, options: SandboxOptions): StreamWatcherRoom;
  }

  /***
   * Contains static functions to create all kinds of event messages.
   */
  export interface EventFactory {}
  export namespace EventFactory {

    /**
     * Creates a HaxballEvent object that can be used to trigger events.
     * Returning event's various values might also be required to be set before it can be used,
     * depending on the value of `type` parameter.
     * 
     * @param type The type of the event.
     * 
     * @returns An instance of HaxballEvent, or undefined if the given type is not a recognized value.
     */
    export function create(type: OperationType): HaxballEvent|undefined;

    /**
     * Reads bytes from a stream to create a HaxballEvent object.
     * 
     * @param reader The stream reader to be used.
     * 
     * @returns An instance of HaxballEvent.
     */
    export function createFromStream(reader: Impl.Stream.F): HaxballEvent;

    /**
     * Creates a ConsistencyCheckEvent object that can be used to trigger a consistency check. 
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @param data The consistency data to check.
     * 
     * @returns An instance of ConsistencyCheckEvent.
     */
    export function checkConsistency(data: ArrayBuffer): ConsistencyCheckEvent;

    /**
     * Creates a SendAnnouncementEvent object that can be used to trigger a sendAnnouncement event.
     * Returning event's byId must be set to 0 before it can be used.
     * 
     * @param msg The contents of the announcement message.
     * @param color The color of the announcement message. Range: -1 <= `color` < 16777216. 
     *  - The color value can be converted into a rgba string via API's `Utils.numberToColor` function.
     *  - The special value `-1` means `transparent` color.
     * @param style The style of the announcement message. Must be one of the following:
     *  - 0: use document's default font style.
     *  - 1: fontWeight = "bold".
     *  - 2: fontStyle = "italic".
     *  - 3: fontSize = "12px".
     *  - 4: fontWeight = "bold", fontSize = "12px".
     *  - 5: fontWeight = "italic", fontSize = "12px".
     * @param sound The sound of the announcement message. Must be one of the following: 
     *  - 0: no sound.
     *  - 1: chat sound.
     *  - 2: highlight sound.
     * 
     * @returns An instance of SendAnnouncementEvent.
     */
    export function sendAnnouncement(msg: string, color: int32, style: uint8, sound: uint8): SendAnnouncementEvent;

    /**
     * Creates a SendChatIndicatorEvent object that can be used to trigger a sendChatIndicator event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @param active The desired chat indicator status. (0: passive, 1: active.)
     * 
     * @returns An instance of SendChatIndicatorEvent.
     */
    export function sendChatIndicator(active: uint8): SendChatIndicatorEvent;

    /**
     * Creates a SendInputEvent object that can be used to trigger a sendInput event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @param input The desired input value. ( 0 <= input < 32 )
     * 
     * @returns An instance of SendInputEvent.
     */
    export function sendInput(input: uint32): SendInputEvent;

    /**
     * Creates a SendChatEvent object that can be used to trigger a sendChat event.
     * Returning event's byId is also required to be set before it can be used. 
     * 
     * @param msg The chat message.
     * 
     * @returns An instance of SendChatEvent.
     */
    export function sendChat(msg: string): SendChatEvent;

    /**
     * Creates a JoinRoomEvent object that can be used to trigger a joinRoom event.
     * Returning event's byId must be set to 0 before it can be used.
     * 
     * @param id Id of the new player.
     * @param name Name of the new player.
     * @param flag Flag of the new player.
     * @param avatar Avatar of the new player.
     * @param conn Connection string of the new player.
     * @param auth Auth of the new player.
     * 
     * @returns An instance of JoinRoomEvent.
     */
    export function joinRoom(id: uint16, name: string, flag: string, avatar: string, conn: string, auth: string): JoinRoomEvent;

    /**
     * Creates a SetHeadlessAvatarEvent object that can be used to trigger a setHeadlessAvatar event.
     * Returning event's byId must be set to 0 before it can be used.
     * 
     * @param id Id of the player whose headless avatar is intended to be changed.
     * @param value The new headless avatar value.
     * 
     * @returns An instance of SetHeadlessAvatarEvent.
     */
    export function setHeadlessAvatar(id: uint16, avatar: string): SetHeadlessAvatarEvent;

    /**
     * Creates a KickBanPlayerEvent object that can be used to trigger a kickBanPlayer event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @param id Id of the desired player to be kicked/banned.
     * @param reason Reason of kicking/banning.
     *   - If `null`, this event is interpreted as the player leaving by himself/herself.
     * @param ban Whether this is a banning event or not.
     * 
     * @returns An instance of KickBanPlayerEvent.
     */
    export function kickBanPlayer(id: uint16, reason: string, ban: boolean): KickBanPlayerEvent;

    /**
     * Creates a ReorderPlayersEvent object that can be used to trigger a reorderPlayers event.
     * Returning event's byId must be set to 0 before it can be used.
     * 
     * @param playerIdList The ids of players that are desired to be removed from the room's players list, reordered to match the order in idList and added back to the room's players list.
     * @param moveToTop Whether to add the players to the top or bottom of the room's players list.
     * 
     * @returns An instance of ReorderPlayersEvent.
     */
    export function reorderPlayers(playerIdList: uint16[], moveToTop: boolean): ReorderPlayersEvent;

    /**
     * Creates a StartGameEvent object that can be used to trigger a startGame event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @returns An instance of StartGameEvent.
     */
    export function startGame(): StartGameEvent;

    /**
     * Creates a StopGameEvent object that can be used to trigger a stopGame event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @returns An instance of StopGameEvent.
     */
    export function stopGame(): StopGameEvent;

    /**
     * Creates a PauseResumeGameEvent object that can be used to trigger a pauseResumeGame event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @param paused Whether the game is desired to be paused or resumed.
     * 
     * @returns An instance of PauseResumeGameEvent.
     */
    export function pauseResumeGame(paused: boolean): PauseResumeGameEvent;

    /**
     * Creates a SetLimitEvent object that can be used to trigger a setScoreLimit event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @param value The desired score limit of the game.
     * 
     * @returns An instance of SetLimitEvent.
     */
    export function setScoreLimit(value: int): SetLimitEvent;

    /**
     * Creates a SetLimitEvent object that can be used to trigger a setTimeLimit event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @param value The desired time limit of the game.
     * 
     * @returns An instance of SetLimitEvent.
     */
    export function setTimeLimit(value: int): SetLimitEvent;

    /**
     * Creates a SetStadiumEvent object that can be used to trigger a setStadium event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @param stadium The desired stadium value.
     * 
     * @returns An instance of SetStadiumEvent.
     */
    export function setStadium(stadium: Stadium): SetStadiumEvent;

    /**
     * Creates a SetPlayerTeamEvent object that can be used to trigger a setPlayerTeam event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @param playerId Id of the player whose team is desired to be changed.
     * @param teamId Id of the desired team.
     * 
     * @returns An instance of SetPlayerTeamEvent.
     */
    export function setPlayerTeam(playerId: uint16, teamId: uint8): SetPlayerTeamEvent;

    /**
     * Creates a SetTeamsLockEvent object that can be used to trigger a setTeamsLock event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @param value The desired teams lock value of the game.
     * 
     * @returns An instance of SetTeamsLockEvent.
     */
    export function setTeamsLock(value: boolean): SetTeamsLockEvent;

    /**
     * Creates a SetPlayerAdminEvent object that can be used to trigger a setPlayerAdmin event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @param playerId Id of the player whose admin status is being set.
     * @param value The desired admin status of the player.
     * 
     * @returns An instance of SetPlayerAdminEvent.
     */
    export function setPlayerAdmin(playerId: uint16, value: boolean): SetPlayerAdminEvent;

    /**
     * Creates a AutoTeamsEvent object that can be used to trigger an autoTeams event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @returns An instance of AutoTeamsEvent.
     */
    export function autoTeams(): AutoTeamsEvent;

    /**
     * Creates a SetPlayerSyncEvent object that can be used to trigger a setPlayerSync event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @param value The desired synchronization status.
     * 
     * @returns An instance of SetPlayerSyncEvent.
     */
    export function setPlayerSync(value: boolean): SetPlayerSyncEvent;

    /**
     * Creates a PingEvent object that can be used to update the ping values of all player.
     * Returning event's byId must be set to 0 before it can be used.
     * 
     * @param values The desired ping values for all players.
     * 
     * @returns An instance of PingEvent.
     */
    export function ping(values: int32[]): PingEvent;

    /**
     * Creates a SetAvatarEvent object that can be used to trigger a setAvatar event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @param value The desired avatar value. `value.length` must be <= `2`.
      * 
     * @returns An instance of SetAvatarEvent.
    */
    export function setAvatar(value: string): SetAvatarEvent;

    /**
     * Creates a SetTeamColorsEvent object that can be used to trigger a setTeamColors event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @param teamId Id of the team whose colors are desired to be changed.
     *   - `1`: red.
     *   - `2`: blue.
     * @param colors An instance of `TeamColors` that defines the colors of a team.
     * 
     * @returns An instance of SetTeamColorsEvent.
     */
    export function setTeamColors(teamId: uint8, colors: TeamColors): SetTeamColorsEvent;

    /**
     * Creates a SetKickRateLimitEvent object that can be used to trigger a setKickRateLimit event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @param min The desired min value of kick rate limit.
     * @param rate The desired rate value of kick rate limit.
     * @param burst The desired burst value of kick rate limit.
     * 
     * @returns An instance of SetKickRateLimitEvent.
     */
    export function setKickRateLimit(min: int, rate: int, burst: int): SetKickRateLimitEvent;

    /**
     * Creates a SetDiscPropertiesEvent object that can be used to trigger a setDiscProperties event.
     * Returning event's byId must be set to 0 before it can be used.
     * 
     * @param id Id of the disc whose properties are desired to be changed.
     * @param data The desired properties to set. This will not change the omitted keys of the disc. `properties` has the following structure:
     *   - `x: number | null`: The desired x coordinate of the disc.
     *   - `y: number | null`: The desired y coordinate of the disc.
     *   - `xspeed: number | null`: The desired x component of the speed of the disc.
     *   - `yspeed: number | null`: The desired y component of the speed of the disc.
     *   - `xgravity: number | null`: The desired x component of the gravity of the disc.
     *   - `ygravity: number | null`: The desired y component of the gravity of the disc.
     *   - `radius: number | null`: The desired radius of the disc.
     *   - `bCoeff: number | null`: The desired bouncing coefficient of the disc.
     *   - `invMass: number | null`: The desired inverse mass of the disc.
     *   - `damping: number | null`: The desired damping of the disc.
     *   - `color: int | null`: The desired color of the disc.
     *   - `cMask: int | null`: The desired collision mask of the disc.
     *   - `cGroup: int | null`: The desired collision group of the disc.
     * 
     * @returns An instance of SetDiscPropertiesEvent.
     */
    export function setDiscProperties(id: uint16, data: object): SetDiscPropertiesEvent;

    /**
     * Creates a SetDiscPropertiesEvent object that can be used to trigger a setPlayerDiscProperties event.
     * Returning event's byId must be set to 0 before it can be used.
     * 
     * @param id Id of the player whose disc properties are desired to be changed.
     * @param data The desired properties to set. This will not change the omitted keys of the disc. `properties` has the following structure:
     *   - `x: number | null`: The desired x coordinate of the disc.
     *   - `y: number | null`: The desired y coordinate of the disc.
     *   - `xspeed: number | null`: The desired x component of the speed of the disc.
     *   - `yspeed: number | null`: The desired y component of the speed of the disc.
     *   - `xgravity: number | null`: The desired x component of the gravity of the disc.
     *   - `ygravity: number | null`: The desired y component of the gravity of the disc.
     *   - `radius: number | null`: The desired radius of the disc.
     *   - `bCoeff: number | null`: The desired bouncing coefficient of the disc.
     *   - `invMass: number | null`: The desired inverse mass of the disc.
     *   - `damping: number | null`: The desired damping of the disc.
     *   - `color: int | null`: The desired color of the disc.
     *   - `cMask: int | null`: The desired collision mask of the disc.
     *   - `cGroup: int | null`: The desired collision group of the disc.
     * 
     * @returns An instance of SetDiscPropertiesEvent.
     */
    export function setPlayerDiscProperties(id: uint16, data: object): SetDiscPropertiesEvent;

    /**
     * Creates a CustomEvent object that can be used to trigger a custom event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @param type The type of the custom event.
     * @param data The data of the custom event. (Any JSON object)
     * 
     * @returns An instance of CustomEvent.
     */
    export function customEvent(type: uint32, data: object): CustomEvent;

    /**
     * Creates a BinaryCustomEvent object that can be used to trigger a binary custom event.
     * Returning event's byId is also required to be set before it can be used.
     * 
     * @param type The type of the binary custom event.
     * @param data Any custom binary data for this specific event.
     * 
     * @returns An instance of BinaryCustomEvent.
     */
    export function binaryCustomEvent(type: uint32, data: Uint8Array): BinaryCustomEvent;

    /**
     * Creates an IdentityEvent object that can be used to trigger a identity event.
     * Returning event's byId must be set to 0 before it can be used.
     * 
     * @param id Id of the player whose identity data is desired to be changed.
     * @param data The identity data that should be received from the backend. It can be any JSON object.
     * 
     * @returns An instance of IdentityEvent.
     */
    export function setPlayerIdentity(id: uint16, data: object): IdentityEvent;
  }

  /**
   * This is a special structure that is returned from the function `Replay.read`.
   */
  class AsyncReplayReader{

    /**
     * An object containing all information about the current room state.
     */
    readonly state: RoomState;

    /**
     * An object containing the game state information. Returns null if game is not active.
     */
    readonly gameState: GameState | null;

    /**
     * This is a read-only property that always returns -1. It is only added for compatibility with renderers. (And it is only used in the initialization code of renderers.)
     */
    readonly currentPlayerId: int;

    /**
     * Returns the current speed coefficient of this replay reader object.
     * 
     * @returns The current speed coefficient of this replay reader object.
     */
    declare getSpeed: ()=>number;

    /**
     * Changes the speed coefficient of this replay reader object.
     * 
     * @param coefficient The desired speed coefficient. Must be a real number >=0. Meaning of possible value ranges is as follows:
     *   - value = 0 : stop replay.
     *   - 0 < value < 1 : slow-motion replay.
     *   - value = 1 : normal speed replay.
     *   - value > 1 : fast-motion replay.
     * 
     * @returns void.
     */
    declare setSpeed: (coefficient)=>void;

    /**
     * Returns the current time.
     * 
     * @returns The current time in milliseconds.
     */
    declare getTime: ()=>number;

    /**
     * Returns the current frame number.
     * 
     * @returns The current frame number.
     */
    declare getCurrentFrameNo: ()=>int;

    /**
     * Returns the length of replay content.
     * 
     * @returns The length of replay content in milliseconds.
     */
    declare length: ()=>number;

    /**
     * Plays the replay until the `destinationTime` or end of replay is reached. Note that it may take some time to reach the 
     * destination time(especially if you are trying to rewind time), because the game state data is generated on the fly and 
     * not stored in memory. (It would probably use huge amounts of RAM.)
     * 
     * @param destinationTime The desired time in milliseconds.
     * 
     * @returns void.
     */
    declare setTime: (destinationTime)=>void;

    /**
     * Plays the replay until the `destinationFrameNo` or end of replay is reached. Note that it may take some time to reach the 
     * destination frame number(especially if you are trying to rewind time), because the game state data is generated on the fly 
     * and not stored in memory. (It would probably use huge amounts of RAM.)
     * 
     * @param destinationFrameNo The desired frame number.
     * 
     * @returns void.
     */
    declare setCurrentFrameNo: (destinationFrameNo)=>void;

    /**
     * Releases the resources that are used by this object.
     * 
     * @returns void.
     */
    declare destroy: ()=>void;

    /**
     * Called when the destination time or frame number has been reached, which only happens some time after 
     * a call to `setTime(destinationTime)` or `setCurrentFrameNo(destinationFrameNo)`.
     * 
     * @returns void.
     */
    declare onDestinationTimeReached?: ()=>{};

    /**
     * Called when the end of replay data has been reached.
     * 
     * @returns void.
     */
    declare onEnd?: ()=>{};
  }

  declare type ReplayReadOptions = {

    /**
     * Override function for `requestAnimationFrame`. (`null` = use library's default `requestAnimationFrame`.)
     */
    requestAnimationFrame?: RAF;
    
    /**
     * Override function for `cancelAnimationFrame`. (`null` = use library's default `cancelAnimationFrame`.)
     */
    cancelAnimationFrame?: CAF;
    
    /**
     * Any positive number that will be used as the fps limit. (`null` = no limit)
     */
    fps_limit?: number;
  }

  /**
   * This object currently consists of only one function about replay data.
   */
  export interface Replay {}
  export namespace Replay {

    /**
     * Creates and returns a non-blocking replay reader object.
     * 
     * @throws Any internal Error will be thrown and should be caught using a try-catch block.
     * 
     * @param uint8Array Must be a Uint8Array containing the binary contents of a .hbr file. (Currently, only version 3 is supported.)
     * @param callbacks An object that may have all callbacks defined in sections `2`, `3.1` and `4` of our event callbacks documentation. In addition, it is possible to use a render callback that has the same signature as defined in section `3` of our `Renderer` documentation.
     * @param options An object that may contain the following keys:
     *   - `requestAnimationFrame`: Override function for `requestAnimationFrame`. (`null` = use library's default `requestAnimationFrame`.)
     *   - `cancelAnimationFrame`: Override function for `cancelAnimationFrame`. (`null` = use library's default `cancelAnimationFrame`.)
     *   - `fps_limit`: Any positive number that will be used as the fps limit. (`null` = no limit)
     * 
     * @returns An instance of the `ReplayReader` structure.
     */
    export function read(uint8Array: Uint8Array, callbacks: CommonlyUsedCallbacks, options: ReplayReadOptions): AsyncReplayReader;

    /**
     * The structure that holds all of the data inside a replay file.
     */
    export class ReplayData {

      /**
       * The initial `RoomState` of the replay, including all the information about the current stadium, game state, players, etc.
       */
      roomData: RoomState;

      /**
       * All events in this replay ordered by their respective `frameNo`.
       */
      events: (HaxballEvent | {frameNo: int})[];

      /**
       * All team goals in this replay ordered by their respective `frameNo`.
       */
      goalMarkers: {teamId: int, frameNo: int}[];

      /**
       * Total number of frames in this replay.
       */
      totalFrames: int;

      /**
       * Version number of the replay. Must currently be equal to `3`.
       */
      version: int;
    };

    /**
     * Reads all of the given binary replay data into a new `ReplayData` structure and returns it. 
     * 
     * @param uint8Array Must be a `Uint8Array` containing the binary contents of a .hbr file. (Currently, only version 3 is supported.)
     * 
     * @returns The new `ReplayData` structure that contains all of the information inside the binary replay data.
     */
    export function readAll(uint8Array: Uint8Array): ReplayData;

    /**
     * Trims the given `ReplayData` between given frame numbers `beginFrameNo` and `endFrameNo`, both of which can be omitted and are 
     * inclusive. If omitted, `beginFrameNo` defaults to `0` and `endFrameNo` defaults to `replayData.totalFrames-1`.
     * 
     * @param replayData The ReplayData structure that needs to be trimmed.
     * @param params An optional object that may contain `beginFrameNo` and `endFrameNo` integer keys.
     * 
     * @returns void.
     */
    export function trim(replayData: ReplayData, params?: { beginFrameNo?: int, endFrameNo?: int }): void;

    /**
     * Trims the given `ReplayData` between given frame numbers `beginFrameNo` and `endFrameNo`, both of which can be omitted and are 
     * inclusive. If omitted, `beginFrameNo` defaults to `0` and `endFrameNo` defaults to `replayData.totalFrames-1`.
     * 
     * @param replayData The ReplayData structure that needs to be trimmed.
     * @param params An optional object that may contain `beginFrameNo` and `endFrameNo` integer keys.
     * 
     * @returns A Promise that is resolved when the trimming job is finished.
     */
    export function trimAsync(replayData: ReplayData, params?: { beginFrameNo?: int, endFrameNo?: int }): Promise<void>;

    /**
     * Converts all information inside the given `ReplayData` structure into a `Uint8Array` and returns it. 
     * 
     * @param replayData Must be a `ReplayData` structure.
     * 
     * @returns The binary representation of the given `ReplayData` structure as a `Uint8Array` object.
     */
    export function writeAll(replayData: ReplayData): Uint8Array;
  }

  /**
   * This object only has static functions designed to query map features. Currently, the game should be active while using these functions.
   */
  export interface Query {}
  export namespace Query {

    /**
     * Finds the index of the first Vertex that is near enough to any given point.
     * 
     * @param roomState The state object to be queried. This object must come from inside a Room object. There are two ways of obtaining it:
     *   - Normal room state: `room.state`.
     *   - Extrapolated room state: `room.stateExt`.
     * @param p The point's coordinates. This is an object that should have the following keys:
     *   - `x: number`: The x coordinate.
     *   - `y: number`: The y coordinate.
     * The coordinates should be converted into Haxball's coordinate system before being used here. You can use `transformPixelCoordToMapCoord(x, y)` and `transformMapCoordToPixelCoord(x, y)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * @param threshold The maximum allowed distance to the point. The unit is not in pixels, but in Haxball's units. You can use `transformPixelDistanceToMapDistance(distance)` and `transformMapDistanceToPixelDistance(distance)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * 
     * @returns Index of the found Vertex, or `-1` if it is not found. 
     */
    export function getVertexIndexAtMapCoord(roomState: RoomState, p: Point, threshold: number): int;

    /**
     * Finds the first Vertex that is near enough to any given point.
     * 
     * @param roomState The state object to be queried. This object must come from inside a Room object. There are two ways of obtaining it:
     *   - Normal room state: `room.state`.
     *   - Extrapolated room state: `room.stateExt`.
     * @param p The point's coordinates. This is an object that should have the following keys:
     *   - `x: number`: The x coordinate.
     *   - `y: number`: The y coordinate.
     * The coordinates should be converted into Haxball's coordinate system before being used here. You can use `transformPixelCoordToMapCoord(x, y)` and `transformMapCoordToPixelCoord(x, y)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * @param threshold The maximum allowed distance to the point. The unit is not in pixels, but in Haxball's units. You can use `transformPixelDistanceToMapDistance(distance)` and `transformMapDistanceToPixelDistance(distance)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * 
     * @returns The found Vertex, or `undefined` if it is not found.
     */
    export function getVertexAtMapCoord(roomState: RoomState, p: Point, threshold: number): Vertex | null;

    /**
     * Finds the index of the first Segment that is near enough to any given point.
     * 
     * @param roomState The state object to be queried. This object must come from inside a Room object. There are two ways of obtaining it:
     *   - Normal room state: `room.state`.
     *   - Extrapolated room state: `room.stateExt`.
     * @param p The point's coordinates. This is an object that should have the following keys:
     *   - `x: number`: The x coordinate.
     *   - `y: number`: The y coordinate.
     * The coordinates should be converted into Haxball's coordinate system before being used here. You can use `transformPixelCoordToMapCoord(x, y)` and `transformMapCoordToPixelCoord(x, y)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * @param threshold The maximum allowed distance to the point. The unit is not in pixels, but in Haxball's units. You can use `transformPixelDistanceToMapDistance(distance)` and `transformMapDistanceToPixelDistance(distance)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * 
     * @returns Index of the found Segment, or `-1` if it is not found.
     */
    export function getSegmentIndexAtMapCoord(roomState: RoomState, p: Point, threshold: number): int;
    
    /**
     * Finds the first Segment that is near enough to any given point.
     * 
     * @param roomState The state object to be queried. This object must come from inside a Room object. There are two ways of obtaining it:
     *   - Normal room state: `room.state`.
     *   - Extrapolated room state: `room.stateExt`.
     * @param p The point's coordinates. This is an object that should have the following keys:
     *   - `x: number`: The x coordinate.
     *   - `y: number`: The y coordinate.
     * The coordinates should be converted into Haxball's coordinate system before being used here. You can use `transformPixelCoordToMapCoord(x, y)` and `transformMapCoordToPixelCoord(x, y)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * @param threshold The maximum allowed distance to the point. The unit is not in pixels, but in Haxball's units. You can use `transformPixelDistanceToMapDistance(distance)` and `transformMapDistanceToPixelDistance(distance)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * 
     * @returns The found Segment, or `-1` if it is not found.
     */
    export function getSegmentAtMapCoord(roomState: RoomState, p: Point, threshold: number): Segment | null;

    /**
     * Finds the first Goal that is near enough to any given point.
     * 
     * @param roomState The state object to be queried. This object must come from inside a Room object. There are two ways of obtaining it:
     *   - Normal room state: `room.state`.
     *   - Extrapolated room state: `room.stateExt`.
     * @param p The point's coordinates. This is an object that should have the following keys:
     *   - `x: number`: The x coordinate.
     *   - `y: number`: The y coordinate.
     * The coordinates should be converted into Haxball's coordinate system before being used here. You can use `transformPixelCoordToMapCoord(x, y)` and `transformMapCoordToPixelCoord(x, y)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * @param threshold The maximum allowed distance to the point. The unit is not in pixels, but in Haxball's units. You can use `transformPixelDistanceToMapDistance(distance)` and `transformMapDistanceToPixelDistance(distance)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * 
     * @returns The found Goal, or `undefined` if it is not found.
     */
    export function getGoalIndexAtMapCoord(roomState: RoomState, p: Point, threshold: number): int;

    /**
     * Finds the first Goal that is near enough to any given point.
     * 
     * @param roomState The state object to be queried. This object must come from inside a Room object. There are two ways of obtaining it:
     *   - Normal room state: `room.state`.
     *   - Extrapolated room state: `room.stateExt`.
     * @param p The point's coordinates. This is an object that should have the following keys:
     *   - `x: number`: The x coordinate.
     *   - `y: number`: The y coordinate.
     * The coordinates should be converted into Haxball's coordinate system before being used here. You can use `transformPixelCoordToMapCoord(x, y)` and `transformMapCoordToPixelCoord(x, y)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * @param threshold The maximum allowed distance to the point. The unit is not in pixels, but in Haxball's units. You can use `transformPixelDistanceToMapDistance(distance)` and `transformMapDistanceToPixelDistance(distance)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * 
     * @returns The found Goal, or `undefined` if it is not found.
     */
    export function getGoalAtMapCoord(roomState: RoomState, p: Point, threshold: number): Goal | null;

    /**
     * Finds the first Plane that is near enough to any given point.
     * 
     * @param roomState The state object to be queried. This object must come from inside a Room object. There are two ways of obtaining it:
     *   - Normal room state: `room.state`.
     *   - Extrapolated room state: `room.stateExt`.
     * @param p The point's coordinates. This is an object that should have the following keys:
     *   - `x: number`: The x coordinate.
     *   - `y: number`: The y coordinate.
     * The coordinates should be converted into Haxball's coordinate system before being used here. You can use `transformPixelCoordToMapCoord(x, y)` and `transformMapCoordToPixelCoord(x, y)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * @param threshold The maximum allowed distance to the point. The unit is not in pixels, but in Haxball's units. You can use `transformPixelDistanceToMapDistance(distance)` and `transformMapDistanceToPixelDistance(distance)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * 
     * @returns The found Plane, or `undefined` if it is not found.
     */
    export function getPlaneIndexAtMapCoord(roomState: RoomState, p: Point, threshold: number): int;

    /**
     * Finds the first Plane that is near enough to any given point.
     * 
     * @param roomState The state object to be queried. This object must come from inside a Room object. There are two ways of obtaining it:
     *   - Normal room state: `room.state`.
     *   - Extrapolated room state: `room.stateExt`.
     * @param p The point's coordinates. This is an object that should have the following keys:
     *   - `x: number`: The x coordinate.
     *   - `y: number`: The y coordinate.
     * The coordinates should be converted into Haxball's coordinate system before being used here. You can use `transformPixelCoordToMapCoord(x, y)` and `transformMapCoordToPixelCoord(x, y)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * @param threshold The maximum allowed distance to the point. The unit is not in pixels, but in Haxball's units. You can use `transformPixelDistanceToMapDistance(distance)` and `transformMapDistanceToPixelDistance(distance)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * 
     * @returns The found Plane, or `undefined` if it is not found.
     */
    export function getPlaneAtMapCoord(roomState: RoomState, p: Point, threshold: number): Plane | null;

    /**
     * Finds the first Joint that is near enough to any given point.
     * 
     * @param roomState The state object to be queried. This object must come from inside a Room object. There are two ways of obtaining it:
     *   - Normal room state: `room.state`.
     *   - Extrapolated room state: `room.stateExt`.
     * @param p The point's coordinates. This is an object that should have the following keys:
     *   - `x: number`: The x coordinate.
     *   - `y: number`: The y coordinate.
     * The coordinates should be converted into Haxball's coordinate system before being used here. You can use `transformPixelCoordToMapCoord(x, y)` and `transformMapCoordToPixelCoord(x, y)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * @param threshold The maximum allowed distance to the point. The unit is not in pixels, but in Haxball's units. You can use `transformPixelDistanceToMapDistance(distance)` and `transformMapDistanceToPixelDistance(distance)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * 
     * @returns The found Joint, or `undefined` if it is not found.
     */
    export function getJointIndexAtMapCoord(roomState: RoomState, p: Point, threshold: number): int;

    /**
     * Finds the first Joint that is near enough to any given point.
     * 
     * @param roomState The state object to be queried. This object must come from inside a Room object. There are two ways of obtaining it:
     *   - Normal room state: `room.state`.
     *   - Extrapolated room state: `room.stateExt`.
     * @param p The point's coordinates. This is an object that should have the following keys:
     *   - `x: number`: The x coordinate.
     *   - `y: number`: The y coordinate.
     * The coordinates should be converted into Haxball's coordinate system before being used here. You can use `transformPixelCoordToMapCoord(x, y)` and `transformMapCoordToPixelCoord(x, y)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * @param threshold The maximum allowed distance to the point. The unit is not in pixels, but in Haxball's units. You can use `transformPixelDistanceToMapDistance(distance)` and `transformMapDistanceToPixelDistance(distance)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * 
     * @returns The found Joint, or `undefined` if it is not found.
     */
    export function getJointAtMapCoord(roomState: RoomState, p: Point, threshold: number): Joint | null;

    /**
     * Finds the index of the first Disc that includes any given point.
     * 
     * @param roomState The state object to be queried. This object must come from inside a Room object. There are two ways of obtaining it:
     *   - Normal room state: `room.state`.
     *   - Extrapolated room state: `room.stateExt`.
     * @param p The point's coordinates. This is an object that should have the following keys:
     *   - `x: number`: The x coordinate.
     *   - `y: number`: The y coordinate.
     * The coordinates should be converted into Haxball's coordinate system before being used here. You can use `transformPixelCoordToMapCoord(x, y)` and `transformMapCoordToPixelCoord(x, y)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * 
     * @returns Index of the found Disc, or `-1` if it is not found.
     */
    export function getDiscIndexAtMapCoord(roomState: RoomState, p: Point): int;

    /**
     * Finds the first Disc that includes any given point.
     * 
     * @param roomState The state object to be queried. This object must come from inside a Room object. There are two ways of obtaining it:
     *   - Normal room state: `room.state`.
     *   - Extrapolated room state: `room.stateExt`.
     * @param p The point's coordinates. This is an object that should have the following keys:
     *   - `x: number`: The x coordinate.
     *   - `y: number`: The y coordinate.
     * The coordinates should be converted into Haxball's coordinate system before being used here. You can use `transformPixelCoordToMapCoord(x, y)` and `transformMapCoordToPixelCoord(x, y)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * 
     * @returns The found Disc, or `undefined` if it is not found.
     */
    export function getDiscAtMapCoord(roomState: RoomState, p: Point): Disc | null;

    /**
     * Finds the first spawn point that is near enough to any given point.
     * 
     * @param roomState The state object to be queried. This object must come from inside a Room object. There are two ways of obtaining it:
     *   - Normal room state: `room.state`.
     *   - Extrapolated room state: `room.stateExt`.
     * @param p The point's coordinates. This is an object that should have the following keys:
     *   - `x: number`: The x coordinate.
     *   - `y: number`: The y coordinate.
     * The coordinates should be converted into Haxball's coordinate system before being used here. You can use `transformPixelCoordToMapCoord(x, y)` and `transformMapCoordToPixelCoord(x, y)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * @param threshold The maximum allowed distance to the point. The unit is not in pixels, but in Haxball's units. You can use `transformPixelDistanceToMapDistance(distance)` and `transformMapDistanceToPixelDistance(distance)` functions defined in both DefaultRenderer and SandboxRenderer for transformations between Haxball's and browser's coordinate systems.
     * 
     * @returns The found spawn point's index and team id, or `[-1, -1]` if it is not found.
     */
    export function getSpawnPointIndexAtMapCoord(roomState: RoomState, p: Point, threshold: number): int;
  }

  declare interface Variable{

    /**
     * The name of this variable.
     */
    name: string;

    /**
     * The current value of this variable.
     */
    value: any;

    /**
     * Type of this variable. 
     */
    type?: VariableType;

    /**
     * A detailed description of this variable.
     */
    description?: string;

    /**
     * The possible range of this variable's value. Should only be applied to numbers(literally) and maybe strings(for min and max length of the string).
     */
    range?: {

      /**
       * The minimum value for this variable.
       */
      min?: number;

      /**
       * The maximum value for this variable.
       */
      max?: number;

      /**
       * The step increment/decrement for this variable. (for easy increment/decrement via a spinbox)
       */
      step?: number;
    };
  }

  declare interface Addon{

    /**
     * The room that this Addon is currently attached to.
     */
    readonly room: Room;

    /**
     * This function is called internally inside the constructor of all Addons by default. 
     * The function body is empty by default. This means that the `metadata` values are not 
     * stored in Addon objects by default, because they are not useful in a non-GUI 
     * node.js environment. If we want to make use of the `metadata`, we might override 
     * this behavior by overriding this method. Remember that this should be done _after_ 
     * initializing the API and _before_ initializing any Addons.
     * 
     * @param metadata An object that holds some metadata values. This value might depend 
     * on what you want to do with this API. The examples in the GitHub repo are intended 
     * to be shown in a web application GUI that can be accessed by anyone. Therefore, 
     * they use the following structure for this object:
     *   - `name: string`: Name of the RoomConfig that will be displayed on the GUI.
     *   - `version: number`: The current version number of this RoomConfig.
     *   - `author: string`: The author of this RoomConfig.
     *   - `description: string`: A detailed description of this RoomConfig.
     *   - `allowFlags: int`: This value defines whether it is possible to use this Addon 
     * while hosting or joining (or both) a room. Renderers do not use this key.
     * 
     * @returns void.
     */
    defineMetadata: (metadata?: any)=>void;

    /**
     * This function defines a variable inside the Addon object that can be changed 
     * from outside. If we want to make use of the metadata that we sent into this 
     * function, we can override this function. Only name and value fields are used
     * by the default implementation. The implementation also depends on the API's
     * global `config.noVariableValueChangeEvent` variable, since this function will
     * also fire an onVariableValueChange event whenever a variable's value changes
     * if this value is not `true`.
     * 
     * @param variable An object that might hold some metadata values along with the variable's 
     * name and value. This object might depend on what you want to do with this API. The examples 
     * in the GitHub repo are intended to be shown in a web application GUI that can be accessed by 
     * anyone. Therefore, this metadata structure has fields such as type, description and range.
     */
    defineVariable: (variable: Variable)=>any;

    /**
     * This function might be used to modify some GUI properties regarding a specific variable 
     * called `varName`. The function body is empty by default, since we do not have a GUI in a
     * non-GUI node.js environment. All other parameters after the first parameter should 
     * be structured as `{name: propName, value: propValue}`. Here, each property named `propName` 
     * is requested to set its new value to `propValue`. For example; in a GUI environment, 
     * `setVariableGUIProps("testVariable", {name: "visible", value: false})` could make the 
     * `testVariable` disappear from the GUI.
     * 
     * @param varName The name of the variable whose GUI properties are desired to be modified.
     * @param vals The property name/value pairs.
     * 
     * @returns void.
     */
    setVariableGUIProps: (varName: string, ...vals: ({name: string, value: any})[])=>void;

    /**
     * If defined, called while creating or joining a room, or during a call to `Room.updateLibrary`, `Room.updatePlugin`, `Room.setConfig` or `Room.setRenderer`. You should write all custom initialization logic inside this callback function.
     * 
     * @returns void.
     */
    initialize: ()=>void;

    /**
     * If defined, called while leaving a room, or during a call to `Room.updateLibrary`, `Room.updatePlugin`, `Room.setConfig` or `Room.setRenderer`. We should write all custom finalization logic inside this callback function.
     * 
     * @returns void.
     */
    finalize: ()=>void;
  }

  /**
   * This class defines a RoomConfig object to be used inside Haxball rooms. A RoomConfig is the backbone of all Haxball bots. Every room has an internal (and initially empty) RoomConfig object built inside.
   */
  export interface RoomConfig extends Addon, AllRoomConfigCallbacks {}
  export abstract class RoomConfig implements Addon, AllRoomConfigCallbacks {

    /**
     * Creates a new `RoomConfig` instance. 
     * 
     * @param metadata Any information that we would want to show/update inside a GUI application about this RoomConfig. This is not used by the API by default, but we can reprogram the RoomConfig's prototype to make use of this value if we want.
     * 
     * @returns void.
     */
    constructor(metadata?: any);
  }

  /**
   * This class defines a Plugin object to be used inside a Haxball room. A Plugin is a piece of code that can be activated/deactivated and, when activated, enchances the current capabilities of the software or does some specific/extra tasks while still being capable of the software's original functionalities.
   */
  export interface Plugin extends Addon, AllPluginCallbacks {}
  export abstract class Plugin implements Addon, AllPluginCallbacks {

    /**
     * Creates a new `Plugin` instance. 
     * 
     * @param name Name of the Plugin. Every Plugin should have a unique name, since they can be accessed directly by their names from inside a `Room` object. 
     * @param active Activation status of the Plugin. If this is `true`, the Plugin is automatically activated just after initialization, while a `Room` object is being created. 
     * @param metadata Any information that we would want to show/update inside a GUI application about this Plugin. This is not used by the API by default, but we can reprogram the Plugin's prototype to make use of this value if we want.
     * 
     * @returns void.
     */
    constructor(name: string, active?: boolean, metadata?: any);
  }

  /**
   * This class defines a Renderer object to be used inside a Haxball room. A Renderer is a piece of code that generates graphical representations for some objects in memory.
   */
  export interface Renderer extends Addon, AllRendererCallbacks {}
  export abstract class Renderer implements Addon, AllRendererCallbacks {

    /**
     * Creates a new `Renderer` instance. 
     * 
     * @param metadata Any information that we would want to show/update inside a GUI application about this Renderer. This is not used by the API by default, but we can reprogram the Renderer's prototype to make use of this value if we want.
     * 
     * @returns void.
     */
    constructor(metadata?: any);
  }

  /**
   * This class defines a Library object to be used inside a Haxball room. You may use the Library objects from inside other Addons.
   */
  export interface Library extends Addon {}
  export abstract class Library implements Addon {

    /**
     * Creates a new `Library` instance. 
     * 
     * @param name Name of the Library. Every Library should have a unique name, since they can be accessed directly by their names from inside a `Room` object. 
     * @param metadata Any information that we would want to show/update inside a GUI application about this Library. This is not used by the API by default, but we can reprogram the Library's prototype to make use of this value if we want.
     * 
     * @returns void.
     */
    constructor(name: string, metadata?: any);
  }

  export interface Language {}
  export class Language {

    /**
     * This is the global current language instance. You can change this value directly. Defaults to `null`.
     */
    static current: Language|null;

    /**
     * Converts a template string to a normal string using the given parameters in `arr`.
     * template string may include placeholders to represent the parameters. ("$1" for first
     * parameter, "$2" for second parameter, and so on.) template string may also include 
     * the ? operator for simple conditioning. You may look at the language files for examples.
     * 
     * @param s The template string to convert
     * @param arr Parameters to replace the placeholders in the template string.
     * 
     * @returns A finalized version of the template string that has all the placeholders 
     * replaced by the parameters, or `null` if something went wrong.
     */
    static resolveText(s: TemplateString, arr: any[]): (string|null);

    /**
     * This function is called internally inside the constructor of all Addons by default. 
     * The function body is empty by default. This means that the `metadata` values are not 
     * stored in Addon objects by default, because they are not useful in a non-GUI 
     * node.js environment. If we want to make use of the `metadata`, we might override 
     * this behavior by overriding this method. Remember that this should be done _after_ 
     * initializing the API and _before_ initializing any Addons.
     * 
     * @param metadata An object that holds some metadata values. This value might depend 
     * on what you want to do with this API. The examples in the GitHub repo are intended 
     * to be shown in a web application GUI that can be accessed by anyone. Therefore, 
     * they use the following structure for this object:
     *   - `name: string`: Name of the RoomConfig that will be displayed on the GUI.
     *   - `version: number`: The current version number of this RoomConfig.
     *   - `author: string`: The author of this RoomConfig.
     *   - `description: string`: A detailed description of this RoomConfig.
     *   - `allowFlags: int`: This value defines whether it is possible to use this Addon 
     * while hosting or joining (or both) a room. Renderers do not use this key.
     * 
     * @returns void.
     */
    defineMetadata: (metadata?: any)=>void;

    /**
     * The abbreviation of this Language.
     */
    abbr: string;

    /**
     * The main data object that has all of the Language data of this API.
     */
    api: {

      /**
       * The language data for the errors of this API. Must map all error codes to template strings.
       */
      errors: NumberToTemplateStringMap
    };

    /**
     * Creates a new `Language` instance. 
     * 
     * @param abbr Abbreviation of the new Language.
     * @param metadata Any information that we would want to show/update inside a GUI application about this Library. This is not used by the API by default, but we can reprogram the Library's prototype to make use of this value if we want.
     * 
     * @returns void.
     */
    constructor(abbr: string, metadata?: any);

  }

  export interface Errors {}
  export namespace Errors {
    export class HBError {

      /** 
       * The error code that has been thrown. 
       * */
      code: ErrorCodes;

      /** 
       * Parameters for the error. 
       * */
      params: object[];

      /** 
       * Returns the full description of the current error object in the API's current language. 
       * */
      toString(): string;

    }

    /**
     * Name-to-integer mapping that shortly describes the error codes used in `HBError` class.
     */
    export const ErrorCodes: TextToNumberMap;
    
  }

  /**
   * Implementation of Haxball's inner classes. Some important classes are exported through this object. The explanations will be cut short, vague and sometimes partially ambiguous here; and only some of the properties of classes will be explored due to the potentially harmful nature of explaining these in detail.
   */
  export interface Impl {}
  export namespace Impl {

    /**
     * Some important core classes used inside Haxball.
     */
    export interface Core {}
    export namespace Core {

      /**
       * The Point class that is used internally inside the game's physics engine.
       */
      export class Point {

        /**
         * The x coordinate of the point.
         */
        x: number;

        /**
         * The y coordinate of the point.
         */
        y: number;
      }

      /**
       * The class that defines the colors of a team.
       */
      export class TeamColors {

        /**
         * The angle of stripes rendered inside a player.
         */
        angle: number;
        
        /**
         * The numeric color of the avatar text rendered inside a player.
         */
        text: int;
        
        /**
         * The numeric colors of each stripe rendered inside a player.
         */
        inner: int[];
      }

      /**
       * The class that defines the properties of a team.
       */
      export namespace Team {

        /**
         * The static spectators team.
         */
        const spec: Team;

        /**
         * The static red team.
         */
        const red: Team;

        /**
         * The static blue team.
         */
        const blue: Team;

        /**
         * A static array to get all teams using their ids. Its definition is `Team.byId = [Team.spec, Team.red, Team.blue]`.
         */
        const byId: Team[];
      }

      export interface Team {

        /**
         * The rival of current Team object.
         */
        rival: Team;

        /**
         * The id of current Team object.
         */
        id: int;

        /**
         * The numeric color value of current Team object.
         */
        color: int;

        /**
         * The name of current Team object.
         */
        name: string;

        /**
         * Object that stores custom color values to render striped team colors.
         */
        colors: ka;
      }
    }

    /**
     * These classes are used to read/write data from/to replay files and/or network/WebRTC stream.
     */
    export interface Stream {}
    export namespace Stream {

      /**
       * StreamReader class
       */
      export class F{}

      /**
       * StreamWriter class
       */
      export class w{}
    }

    /**
     * Some utility classes. (All of them may not be necessarily useful but still, why not export them?)
     */
    export interface Utils {}
    export namespace Utils {

      /**
       * String operations 1
       */
      export const D: any;

      /**
       * String operations 2
       */
      export const J: any;

      /**
       * String operations 3
       */
      export const K: any;

      /**
       * Webserver api operations
       */
      export const M: any;

      /**
       * Haxball's original global error class
       */
      export const q: any;
    }
  }
}

/**
 * These are objects/functions that directly affect the core functionalities. You should usually pass "window" here, because most of these objects reside there.
 */
declare class WindowLike {

  /**
   * Function, used by Haxball. Browser's window object should have it. If you are on a custom environment such as NW.js or Electron, use window.setTimeout.bind(window).
   */
  setTimeout: (callback: function, ms?: number, ...args: any[])=>number;

  /**
   * Function, used by Haxball. Browser's window object should have it. If you are on a custom environment such as NW.js or Electron, use window.clearTimeout.bind(window).
   */
  clearTimeout: (handle: number)=>void;

  /**
   * Function, used by Haxball. Browser's window object should have it. If you are on a custom environment such as NW.js or Electron, use window.setInterval.bind(window).
   */
  setInterval: (callback: function, ms?: number, ...args: any[])=>number;

  /**
   * Function, used by Haxball. Browser's window object should have it. If you are on a custom environment such as NW.js or Electron, use window.clearInterval.bind(window).
   */
  clearInterval: (handle: number)=>void;

  /**
   * Function, used by Haxball. Browser's window object should have it. If you are on a custom environment such as NW.js or Electron, use window.requestAnimationFrame.bind(window).
   */
  requestAnimationFrame: (callback: function, ...args: any[])=>number;

  /**
   * Function, used by Haxball. Browser's window object should have it. If you are on a custom environment such as NW.js or Electron, use window.cancelAnimationFrame.bind(window).
   */
  cancelAnimationFrame: (handle: number)=>void;

  /**
   * Object, used by Haxball. Browser's window object should have it.
   */
  console: ConsoleLike;

  /**
   * Object, used by Haxball. Browser's window object should have it.
   */
  performance: PerformanceLike;

  /**
   * Object, used by Haxball. Browser's window object should have it.
   */
  crypto: CryptoLike;

  /**
   * Class, used by Haxball for communication. Browser's window object should have it.
   */
  RTCPeerConnection: RTCPeerConnectionLike;

  /**
   * Class, used by Haxball for communication. Browser's window object should have it.
   */
  RTCIceCandidate: RTCIceCandidateLike;

  /**
   * Class, used by Haxball for communication. Browser's window object should have it.
   */
  RTCSessionDescription: RTCSessionDescriptionLike;

  /**
   * Class, used by Haxball for communication. Browser's window object should have it.
   */
  WebSocket: WebSocketLike;

  /**
   * Class, used by Haxball for communication. Browser's window object should have it.
   */
  XMLHttpRequest: XMLHttpRequestLike;

  /**
   * External library object required by Haxball.
   */
  JSON5: JSON5Like;

  /**
   * External library object required by Haxball.
   */
  pako: PakoLike;
};

/**
 * Custom configuration for backend/proxy server.
 */
declare class LibConfig {

  /**
   * Custom backend configuration.
   */
  backend?: {

    /**
     * Backend's main domain url address. Defaults to: `www.haxball.com`.
     */
    hostname?: string,

    /**
     * Backend's url address for websocket connections. Defaults to: `p2p.haxball.com`.
     */
    hostnameWs?: string,

    /**
     * Determines whether the url is using secure protocol(`true`) or not(`false`). Defaults to: `true`.
     */
    secure?: boolean
  };

  /**
   * Proxy server configuration.
   */
  proxy?: {

    /**
     * Browsers' websocket libraries do not allow origin change for security reasons, so we need a proxy server to change the websocket request's origin for us. If `true`, we do not need a proxy server. (we can do that in NW.js, for example)
     */
    WebSocketChangeOriginAllowed?: boolean,

    /**
     * Proxy websocket url address to use when trying to create or join a room. should end with a `/`. Is appended `host` or `client` at the end while being used. Defaults to: `wss://p2p.haxball.com/` for host and `wss://p2p2.haxball.com/` for client.
     */
    WebSocketUrl?: string,

    /**
     * Proxy http url address to use when trying to create or join a room. should end with a `/`. Is appended `host` or `client` at the end while being used. Defaults to: `https://www.haxball.com/rs/`.
     */
    HttpUrl?: string
  };

  /**
   * Fix some important variable names or not. Defaults to: `true`.
   */
  fixNames?: boolean;

  /**
   * Haxball's expected version number. Defaults to: `9`.
   */
  version?: number;

  /**
   * If `true`, disables the mechanism that enables variable value change event which in turn improves performance while reaching a variable's value that was defined by any `Addon.defineVariable` function. (Variable will have a directly accessable, actual value; instead of a property that points to the actual variable.) Defaults to: `false`.
   */
  noVariableValueChangeEvent?: boolean;

  /**
   * A custom proxy agent to use for the room's connection. This method does not work in browsers. Defaults to `null`.
   */
  proxyAgent?: ProxyAgentLike;

  /**
   * If `true`, skips the WebRTC initialization. Needed to be able to use the API functions that are not related to networking in environments without WebRTC support. Defaults to: `false`.
   */
  noWebRTC?: boolean;

  /**
   * The url address of an external stun server that is required for the communication via WebRTC to work correctly. Defaults to: `stun:stun.l.google.com:19302`.
   */
  stunServer?: string;

  /**
   * A token that represents a user data in a database of a custom proxy/backend server.
   */
  identityToken?: string;
};

export = (object?: WindowLike, config?: LibConfig)=>MainReturnType;

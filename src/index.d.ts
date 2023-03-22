export enum OperationType {
  SetAvatar = 0,
  SetHeadlessAvatar = 1,
  SendChat = 2,
  SendChatIndicator = 3,
  SendAnnouncement = 4,
  SendInput = 5,
  SetStadium = 6,
  StartGame = 7,
  StopGame = 8,
  PauseResumeGame = 9,
  SetScoreLimit = 10,
  SetTimeLimit = 11,
  AutoTeams = 12,
  SetTeamsLock = 13,
  SetPlayerTeam = 14,
  SetKickRateLimit = 15,
  SetTeamColors = 16,
  SetPlayerAdmin = 17,
  KickBanPlayer = 18,
  SetPlayerSync = 19,
  Ping = 20,
  SetDiscProperties = 21,
  JoinRoom = 22,
  ReorderPlayers = 23,
  CustomEvent = 24
}

export enum VariableType {
  Boolean = 0,
  Integer = 1,
  Number = 2,
  String = 3,
  Color = 4,
  CollisionFlags = 5,
  Coordinate = 6,
  Team = 7,
  TeamWihSpec = 8,
  BgType = 9,
  CameraFollow = 10,
  KickOffReset = 11,
  Flag = 12
}

export enum ConnectionState {
  ConnectingToMaster = 0,
  ConnectingToPeer = 1,
  AwaitingState = 2,
  Active = 3,
  ConnectionFailed = 4
}

export enum AllowFlags {
  JoinRoom = 1,
  CreateRoom = 2
}

export enum CollisionFlags {
  ball = 0,
  red = 1,
  blue = 2,
  redKO = 3,
  blueKO = 4,
  wall = 5,
  kick = 6,
  score = 7,
  free1 = 8,
  free2 = 9,
  free3 = 10,
  free4 = 11,
  free5 = 12,
  free6 = 13,
  free7 = 14,
  free8 = 15,
  free9 = 16,
  free10 = 17,
  free11 = 18,
  free12 = 19,
  free13 = 20,
  free14 = 21,
  free15 = 22,
  free16 = 23,
  free17 = 24,
  free18 = 25,
  free19 = 26,
  free20 = 27,
  c0 = 28,
  c1 = 29,
  c2 = 30,
  c3 = 31
}

declare enum ErrorCodes {
  Empty = 0,
  ConnectionClosed = 1,
  GameStateTimeout = 2,
  RoomClosed = 3,
  RoomFull = 4,
  WrongPassword = 5,
  BannedBefore = 6,
  IncompatibleVersion = 7,
  FailedHost = 8,
  Unknown = 9,
  Cancelled = 10,
  FailedPeer = 11,
  KickedNow = 12,
  Failed = 13,
  MasterConnectionError = 14,
  StadiumParseError = 15,
  StadiumSyntaxError = 16,
  ObjectCastError = 17,
  TeamColorsReadError = 18,
  UTF8CharacterDecodeError = 19,
  ReadTooMuchError = 20,
  ReadWrongStringLengthError = 21,
  EncodeUTF8CharNegativeError = 22,
  EncodeUTF8CharTooLargeError = 23,
  CalculateLengthOfUTF8CharNegativeError = 24,
  CalculateLengthOfUTF8CharTooLargeError = 25,
  BufferResizeParameterTooSmallError = 26,
  BadColorError = 27,
  BadTeamError = 28,
  StadiumLimitsExceededError = 29,
  MissingActionConfigError = 30,
  UnregisteredActionError = 31,
  MissingImplementationError = 32,
  AnnouncementActionMessageTooLongError = 33,
  ChatActionMessageTooLongError = 34,
  KickBanReasonTooLongError = 35,
  ChangeTeamColorsInvalidTeamIdError = 36,
  MissingRecaptchaCallbackError = 37,
  ReplayFileVersionMismatchError = 38,
  ReplayFileReadError = 39,
  JoinRoomNullIdAuthError = 40,
  PlayerNameTooLongError = 41,
  PlayerCountryTooLongError = 42,
  PlayerAvatarTooLongError = 43,
  PlayerJoinBlockedByMPDError = 44,
  PlayerJoinBlockedByORError = 45,
  PluginNotFoundError = 46,
  PluginNameChangeNotAllowedError = 47,
  AuthFromKeyInvalidIdFormatError = 48,
  LanguageAlreadyExistsError = 49,
  CurrentLanguageRemovalError = 50,
  LanguageDoesNotExistError = 51
}

declare enum RendererTextIndices {
  timeIsUp1 = 0,
  timeIsUp2 = 1,
  redIsVictorious1 = 2, 
  redIsVictorious2 = 3,
  redScores1 = 4, 
  redScores2 = 5, 
  blueIsVictorious1 = 6, 
  blueIsVictorious2 = 7, 
  blueScores1 = 8, 
  blueScores2 = 9, 
  gamePaused1 = 10, 
  gamePaused2 = 11
}

declare type int = number;

export enum Direction {
  Backward = -1,
  Still = 0,
  Forward = 1
}

export enum CameraFollow {
  None = 0,
  Player = 1
}

export enum BackgroundType {
  None = 0,
  Grass = 1,
  Hockey = 2
}

export enum GamePlayState {
  BeforeKickOff = 0,
  Playing = 1,
  AfterGoal = 2,
  Ending = 3
}

declare type Auth = {};

declare type ClientConnection = {}; // new $b()

declare type Point = {
  x: number;
  y: number;
};

declare type Vertex = {
  id: int;
  cGroup: int;
  cMask: int;
  bCoef: number;
  pos: Point;
};

declare type Segment = {
  v0: Vertex,
  v1: Vertex,
  curveF: number,
  color: int
  vis: boolean,
  bias: number,
  bCoef: number,
  cMask: int,
  cGroup: int,
  normal: Point,
};

declare type Plane = {
  normal: Point
  dist: number,
  bCoef: int,
  cMask: int,
  cGroup: int,
};

declare type Goal = {
  p0: Point,
  p1: Point,
  team: Team
};

declare type Disc = {
  pos: Point,
  radius: number,
  speed: Point,
  gravity: Point,
  damping: number,
  invMass: number,
  bCoef: number,
  color: int,
  cMask: int,
  cGroup: int
};

declare type MovableDisc = {
  id: int,
  pos: Point,
  radius: number,
  speed: Point,
  gravity: Point,
  damping: number,
  invMass: number,
  bCoef: number,
  color: int,
  cMask: int,
  cGroup: int,
  playerId: int
};

declare type Joint = {
  d0: int,
  d1: int,
  minLength: number,
  maxLength: number,
  strength: number,
  color: int
};

declare type PlayerPhysics = {
  kickback: number,
  radius: number,
  cGroup: number,
  gravity: Point,
  bCoef: number,
  invMass: number,
  damping: number,
  acceleration: number,
  kickingAcceleration: number,
  kickingDamping: number,
  kickStrength: number
};

declare type Stadium = {
  vertices: Vertex[];
  segments: Segment[];
  planes: Plane[];
  goals: Goal[];
  discs: Disc[];
  joints: Joint[];
  redSpawnPoints: Point[];
  blueSpawnPoints: Point[];
  playerPhysics: PlayerPhysics;
  defaultStadiumId: number;
  maxViewWidth: number;
  cameraFollow: CameraFollow;
  canBeStored: boolean;
  fullKickOffReset: boolean;
  name: string;
  width: number;
  height: number;
  bgType: BackgroundType;
  bgColor: number;
  bgWidth: number;
  bgHeight: number;
  bgKickOffRadius: number;
  bgCornerRadius: number;
  spawnDistance: number;
  bgGoalLine: number;
};

declare type TeamColors = {
  angle: number;
  text: number;
  inner: number[];
};

declare type Team = {
  rival: Team;
  id: number;
  color: number;
  name: string;
  colors: TeamColors;
};

declare type GeoLocation = {
  lat: number;
  lon: number;
  flag: string;
};

declare type Player = {
  id: int;
  name: string;
  team: Team;
  flag: string;
  avatar: string;
  headlessAvatar: string;
  isAdmin: boolean;
  conn: string;
  auth: string;
  customClient: boolean;
  ping: int;
  input: int;
  isKicking: boolean;
  sync: boolean;
  disc: MovableDisc;
};

declare type PhysicsState = {
  discs: MovableDisc[];
  vertices: Vertex[];
  planes: Plane[];
  segments: Segment[];
  joints: Joint[];
};

declare type GameState = {
  pauseGameTickCounter: int;
  timeElapsed: number;
  blueScore: int;
  redScore: int;
  state: GamePlayState;
  goalTickCounter: int;
  physicsState: PhysicsState;
  timeLimit: int;
  scoreLimit: int;
  stadium: Stadium;
};

declare interface RoomStateBase {
  stadium: Stadium;
  kickRate_min: int;
  kickRate_rate: int;
  timeLimit: int;
  scoreLimit: int;
  teamsLocked: boolean;
  gameState: GameState;
  players: Player[];
  name: string;
  teamColors: TeamColors;
  copy: ()=>RoomState;
}

declare type RoomState = (RoomStateBase & SandboxModeFunctions);

declare type InnerRoomData = {
  version: number;
  name: string;
  flag: string;
  lat: number;
  lon: number;
  password: boolean;
  maxPlayers: number;
  players: number;
};

declare type RoomData = {
  id: string;
  data: InnerRoomData;
  dist: number;
};

declare interface HostOnlyCallbacks {
  onRoomLink?: (link: string)=>void,
  onBansClear?: ()=>void,
  onRoomRecaptchaModeChange?: (on: boolean)=>void
}

declare interface HostTriggeredCallbacks {
  onAnnouncement?: (msg: string, color: int, style: int, sound: int)=>void,
  onPlayerHeadlessAvatarChange?: (id: int, value: string)=>void,
  onPlayersOrderChange?: (idList: int[], moveToTop: boolean)=>void,
  onSetDiscProperties?: (id: int, type: int, data1: number[], data2: int[])=>void,
  onPingData?: (array: int[])=>void,
  onRoomPropertiesChange?: (props: object)=>void
}

declare interface GameCallbacks {
  onPlayerBallKick?: (playerId: int)=>void,
  onTeamGoal?: (teamId: int)=>void,
  onGameEnd?: (winningTeamId: int)=>void,
  onGameTick?: ()=>void,
  onKickOff?: ()=>void,
  onTimeIsUp?: ()=>void,
  onPositionsReset?: ()=>void,
  onLocalFrame?: (localFrameNo: int)=>void,
  onCollisionDiscVsDisc?: (discId1: int, discPlayerId1: int, discId2: int, discPlayerId2: int)=>void,
  onCollisionDiscVsSegment?: (discId: int, discPlayerId: int, segmentId: int)=>void,
  onCollisionDiscVsPlane?: (discId: int, discPlayerId: int, planeId: int)=>void
}

declare interface LocalCallbacks {
  onExtrapolationChange?: (value: int)=>void,
  onHandicapChange?: (value: int)=>void,
  onRoomRecordingChange?: (value: true | ArrayBuffer)=>void
}

declare interface APICallbacks {
  onPluginActiveChange?: (plugin: Plugin)=>void,
  onConfigUpdate?: (oldRoomConfigObj: RoomConfig, newRoomConfigObj: RoomConfig)=>void,
  onRendererUpdate?: (oldRendererObj: Renderer, newRendererObj: Renderer)=>void,
  onPluginUpdate?: (oldPluginObj: Plugin, newPluginObj: Plugin)=>void,
  onLanguageChange?: (abbr: string)=>void
}

declare type IndividuallyTriggeredCallbacks = GameCallbacks & LocalCallbacks & APICallbacks;

declare interface CommonCallbacks {
  onPlayerSyncChange?: (playerId: int, value: boolean)=>void,
  onAutoTeams?: (playerId1: int, teamId1: int, playerId2: int | null, teamId2: int | null, byId: int)=>void,
  onScoreLimitChange?: (value: int, byId: int)=>void,
  onTimeLimitChange?: (value: int, byId: int)=>void,
  onPlayerAdminChange?: (id: int, isAdmin: boolean, byId: int)=>void,
  onPlayerAvatarChange?: (id: int, value: string)=>void,
  onPlayerTeamChange?: (id: int, teamId: int, byId: int)=>void,
  onStadiumChange?: (stadium: Stadium, byId: int)=>void,
  onTeamsLockChange?: (value: boolean, byId: int)=>void,
  onPlayerObjectCreated?: (playerObj: Player)=>void,
  onPlayerJoin?: (playerObj: Player)=>void,
  onGamePauseChange?: (isPaused: boolean, byId: int)=>void,
  onPlayerChat?: (id: int, message: string)=>void,
  onPlayerInputChange?: (id: int, value: int)=>void,
  onPlayerChatIndicatorChange?: (id: int, value: boolean)=>void,
  onPlayerLeave?: (playerObj: Player, reason: string | null, isBanned: boolean, byId: int)=>void,
  onTeamColorsChange?: (teamId: int, value: TeamColors, byId: int)=>void,
  onKickRateLimitChange?: (min: int, rate: int, burst: int, byId: int)=>void,
  onGameStart?: (byId: int)=>void,
  onGameStop?: (byId: int)=>void
}

declare interface ModifierCallbacks {
  modifyPlayerData?: (playerId: int, name: string, flag: string, avatar: string, conn: string, auth: string)=>[modifiedName: string, modifiedFlag: string, modifiedAvatar: string],
  modifyPlayerPing?: (playerId: int, ping: int)=>number
  modifyClientPing?: (ping: int)=>number,
  modifyFrameNo?: (frameNo: int)=>int,
  onOperationReceived?: (type: int, msg: object, globalFrameNo: int, clientFrameNo: int)=>boolean
}

declare interface CustomCallbacks {
  onCustomEvent?: (type: int, data: object, byId: int)=>void,
}

declare interface HostOnlyRoomConfigCallbacks {
  onBeforeRoomLink?: (link: string)=>void,
  onAfterRoomLink?: (link: string)=>void,
  onBeforeBansClear?: ()=>void,
  onAfterBansClear?: ()=>void,
  onBeforeRoomRecaptchaModeChange?: (on: boolean)=>void,
  onAfterRoomRecaptchaModeChange?: (on: boolean)=>void
}

declare interface HostTriggeredRoomConfigCallbacks {
  onBeforeAnnouncement?: (msg: string, color: int, style: int, sound: int)=>void,
  onAfterAnnouncement?: (msg: string, color: int, style: int, sound: int)=>void,
  onBeforePlayerHeadlessAvatarChange?: (id: int, value: string)=>void,
  onAfterPlayerHeadlessAvatarChange?: (id: int, value: string)=>void,
  onBeforePlayersOrderChange?: (idList: int[], moveToTop: boolean)=>void,
  onAfterPlayersOrderChange?: (idList: int[], moveToTop: boolean)=>void,
  onBeforeSetDiscProperties?: (id: int, type: int, data1: number[], data2: int[])=>void,
  onAfterSetDiscProperties?: (id: int, type: int, data1: number[], data2: int[])=>void,
  onBeforePingData?: (array: int[])=>void,
  onAfterPingData?: (array: int[])=>void,
  onBeforeRoomPropertiesChange?: (props: object)=>void,
  onAfterRoomPropertiesChange?: (props: object)=>void
}

declare interface GameRoomConfigCallbacks {
  onBeforePlayerBallKick?: (playerId: int)=>void,
  onAfterPlayerBallKick?: (playerId: int)=>void,
  onBeforeTeamGoal?: (teamId: int)=>void,
  onAfterTeamGoal?: (teamId: int)=>void,
  onBeforeGameEnd?: (winningTeamId: int)=>void,
  onAfterGameEnd?: (winningTeamId: int)=>void,
  onBeforeGameTick?: ()=>void,
  onAfterGameTick?: ()=>void,
  onBeforeKickOff?: ()=>void,
  onAfterKickOff?: ()=>void,
  onBeforeTimeIsUp?: ()=>void,
  onAfterTimeIsUp?: ()=>void,
  onBeforePositionsReset?: ()=>void,
  onAfterPositionsReset?: ()=>void,
  onBeforeLocalFrame?: (localFrameNo: int)=>void,
  onAfterLocalFrame?: (localFrameNo: int)=>void,
  onBeforeCollisionDiscVsDisc?: (discId1: int, discPlayerId1: int, discId2: int, discPlayerId2: int)=>void,
  onAfterCollisionDiscVsDisc?: (discId1: int, discPlayerId1: int, discId2: int, discPlayerId2: int)=>void,
  onBeforeCollisionDiscVsSegment?: (discId: int, discPlayerId: int, segmentId: int)=>void,
  onAfterCollisionDiscVsSegment?: (discId: int, discPlayerId: int, segmentId: int)=>void,
  onBeforeCollisionDiscVsPlane?: (discId: int, discPlayerId: int, planeId: int)=>void,
  onAfterCollisionDiscVsPlane?: (discId: int, discPlayerId: int, planeId: int)=>void
}

declare interface LocalRoomConfigCallbacks {
  onBeforeExtrapolationChange?: (value: int)=>void,
  onAfterExtrapolationChange?: (value: int)=>void,
  onBeforeHandicapChange?: (value: int)=>void,
  onAfterHandicapChange?: (value: int)=>void,
  onBeforeRoomRecordingChange?: (value: true | ArrayBuffer)=>void,
  onAfterRoomRecordingChange?: (value: true | ArrayBuffer)=>void
}

declare interface APIRoomConfigCallbacks {
  onBeforePluginActiveChange?: (plugin: Plugin)=>void,
  onAfterPluginActiveChange?: (plugin: Plugin)=>void,
  onBeforeConfigUpdate?: (oldRoomConfigObj: RoomConfig, newRoomConfigObj: RoomConfig)=>void,
  onAfterConfigUpdate?: (oldRoomConfigObj: RoomConfig, newRoomConfigObj: RoomConfig)=>void,
  onBeforeRendererUpdate?: (oldRendererObj: Renderer, newRendererObj: Renderer)=>void,
  onAfterRendererUpdate?: (oldRendererObj: Renderer, newRendererObj: Renderer)=>void,
  onBeforePluginUpdate?: (oldPluginObj: Plugin, newPluginObj: Plugin)=>void,
  onAfterPluginUpdate?: (oldPluginObj: Plugin, newPluginObj: Plugin)=>void,
  onBeforeLanguageChange?: (abbr: string)=>void,
  onAfterLanguageChange?: (abbr: string)=>void
}

declare type IndividuallyTriggeredRoomConfigCallbacks = GameRoomConfigCallbacks & LocalRoomConfigCallbacks & APIRoomConfigCallbacks;

declare interface CommonRoomConfigCallbacks {
  onBeforePlayerSyncChange?: (playerId: int, value: boolean)=>void,
  onAfterPlayerSyncChange?: (playerId: int, value: boolean)=>void,
  onBeforeAutoTeams?: (playerId1: int, teamId1: int, playerId2: int | null, teamId2: int | null, byId: int)=>void,
  onAfterAutoTeams?: (playerId1: int, teamId1: int, playerId2: int | null, teamId2: int | null, byId: int)=>void,
  onBeforeScoreLimitChange?: (value: int, byId: int)=>void,
  onAfterScoreLimitChange?: (value: int, byId: int)=>void,
  onBeforeTimeLimitChange?: (value: int, byId: int)=>void,
  onAfterTimeLimitChange?: (value: int, byId: int)=>void,
  onBeforePlayerAdminChange?: (id: int, isAdmin: boolean, byId: int)=>void,
  onAfterPlayerAdminChange?: (id: int, isAdmin: boolean, byId: int)=>void,
  onBeforePlayerAvatarChange?: (id: int, value: string)=>void,
  onAfterPlayerAvatarChange?: (id: int, value: string)=>void,
  onBeforePlayerTeamChange?: (id: int, teamId: int, byId: int)=>void,
  onAfterPlayerTeamChange?: (id: int, teamId: int, byId: int)=>void,
  onBeforeStadiumChange?: (stadium: Stadium, byId: int)=>void,
  onAfterStadiumChange?: (stadium: Stadium, byId: int)=>void,
  onBeforeTeamsLockChange?: (value: boolean, byId: int)=>void,
  onAfterTeamsLockChange?: (value: boolean, byId: int)=>void,
  onBeforePlayerObjectCreated?: (playerObj: Player)=>void,
  onAfterPlayerObjectCreated?: (playerObj: Player)=>void,
  onBeforePlayerJoin?: (playerObj: Player)=>void,
  onAfterPlayerJoin?: (playerObj: Player)=>void,
  onBeforeGamePauseChange?: (isPaused: boolean, byId: int)=>void,
  onAfterGamePauseChange?: (isPaused: boolean, byId: int)=>void,
  onBeforePlayerChat?: (id: int, message: string)=>void,
  onAfterPlayerChat?: (id: int, message: string)=>void,
  onBeforePlayerInputChange?: (id: int, value: int)=>void,
  onAfterPlayerInputChange?: (id: int, value: int)=>void,
  onBeforePlayerChatIndicatorChange?: (id: int, value: boolean)=>void,
  onAfterPlayerChatIndicatorChange?: (id: int, value: boolean)=>void,
  onBeforePlayerLeave?: (playerObj: Player, reason: string | null, isBanned: boolean, byId: int)=>void,
  onAfterPlayerLeave?: (playerObj: Player, reason: string | null, isBanned: boolean, byId: int)=>void,
  onBeforeTeamColorsChange?: (teamId: int, value: TeamColors, byId: int)=>void,
  onAfterTeamColorsChange?: (teamId: int, value: TeamColors, byId: int)=>void,
  onBeforeKickRateLimitChange?: (min: int, rate: int, burst: int, byId: int)=>void,
  onAfterKickRateLimitChange?: (min: int, rate: int, burst: int, byId: int)=>void,
  onBeforeGameStart?: (byId: int)=>void,
  onAfterGameStart?: (byId: int)=>void,
  onBeforeGameStop?: (byId: int)=>void,
  onAfterGameStop?: (byId: int)=>void
}

declare interface ModifierRoomConfigCallbacks {
  modifyPlayerDataBefore?: (playerId: int, name: string, flag: string, avatar: string, conn: string, auth: string)=>[modifiedName: string, modifiedFlag: string, modifiedAvatar: string],
  modifyPlayerDataAfter?: (playerId: int, name: string, flag: string, avatar: string, conn: string, auth: string)=>[modifiedName: string, modifiedFlag: string, modifiedAvatar: string],
  modifyPlayerPingBefore?: (playerId: int, ping: int)=>number
  modifyPlayerPingAfter?: (playerId: int, ping: int)=>number
  modifyClientPingBefore?: (ping: int)=>number,
  modifyClientPingAfter?: (ping: int)=>number,
  modifyFrameNoBefore?: (frameNo: int)=>int,
  modifyFrameNoAfter?: (frameNo: int)=>int,
  onBeforeOperationReceived?: (type: int, msg: object, globalFrameNo: int, clientFrameNo: int)=>boolean,
  onAfterOperationReceived?: (type: int, msg: object, globalFrameNo: int, clientFrameNo: int)=>boolean
}

declare interface CustomRoomConfigCallbacks {
  onBeforeCustomEvent?: (type: int, data: object, byId: int)=>void,
  onAfterCustomEvent?: (type: int, data: object, byId: int)=>void,
}

declare interface RendererCallbacks {
  render?: (extrapolatedRoomState: RoomState)=>void
}

declare type CommonlyUsedCallbacks = HostTriggeredCallbacks & GameCallbacks & CommonCallbacks & RendererCallbacks;
declare type AllPluginCallbacks = HostOnlyCallbacks & HostTriggeredCallbacks & IndividuallyTriggeredCallbacks & CommonCallbacks & ModifierCallbacks & CustomCallbacks;
declare type AllRendererCallbacks = HostOnlyCallbacks & HostTriggeredCallbacks & IndividuallyTriggeredCallbacks & CommonCallbacks & CustomCallbacks & RendererCallbacks;
declare type AllRoomConfigCallbacks = HostOnlyRoomConfigCallbacks & HostTriggeredRoomConfigCallbacks & IndividuallyTriggeredRoomConfigCallbacks & CommonRoomConfigCallbacks & ModifierRoomConfigCallbacks & CustomRoomConfigCallbacks & AllPluginCallbacks;

export interface Callback {}
export namespace Callback {
  export function add(name: string, metadata: any): void;
  export function remove(name: string): void;
}

export interface Utils {}
export namespace Utils {
  export function generateAuth(): Promise<[string, Auth]>;
  export function authFromKey(authKey: string): Promise<Auth>;
  export function getRoomList(): Promise<RoomData[]>;
  export function numberToColor(number: int): string;
  export function colorToNumber(color: string): int;
  export function keyState(dirX: Direction, dirY: Direction, kick: boolean): void;
  export function getGeo(): Promise<GeoLocation>;
  export function geoFromJSON(json: object): GeoLocation;
  export function geoFromString(jsonStr: string): GeoLocation;
  export function stadiumChecksum(stadium: Stadium): string | null;
  export function parseStadium(textDataFromHbsFile: string, onError?: ErrorCallback): Stadium;
  export function exportStadium(stadium: Stadium): void;
  export function getDefaultStadiums(): Stadium[];
}

declare type CreateRoomParams = {
  name: string;
  password?: string;
  token: string;
  noPlayer?: boolean;
  geo: GeoLocation;
  playerCount?: int;
  maxPlayerCount: int;
  unlimitedPlayerCount?: boolean;
  fakePassword?: boolean;
  showInRoomList: boolean;
  onError?: (error: Errors.HBError, clientConnectionObj: ClientConnection)=>void
};

declare type JoinRoomParams = {
  id: string;
  password: string | null;
  token: string | null;
  authObj: Auth;
};

declare interface HaxballClient{
  storage?: Storage;
  noPluginMechanism?: boolean;
  useDefaultChatCommandMechanism?: boolean;
  config?: RoomConfig;
  renderer?: Renderer;
  plugins?: Plugin[];
  version?: int;
  kickTimeout?: int;
  room?: Room; // this is auto-assigned later.
  onSuccess?: (room: Room)=>void;
  onFailure?: (error: Errors.HBError)=>void;
  onLeave?: (msg: Errors.HBError)=>void;
  onConnectionStateChange?: (state: ConnectionState)=>void;
  onReverseConnection?: ()=>void;
  onRequestRecaptcha?: ()=>void;
  cancel: ()=>void;
  useRecaptchaToken: (token: string)=>void;
}

declare type RAF = (callback: (time: number) => void) => number;
declare type CAF = (handle: number) => void;
declare type ErrorCallback = (error: Errors.HBError) => void;

declare interface SandboxOptions {
  controlledPlayerId?: int;
  requestAnimationFrame?: RAF;
  cancelAnimationFrame?: CAF;
  fps_limit?: int;
}

declare interface SandboxRoom {
  readonly state: RoomState;
  readonly gameState: GameState | null;
  readonly currentPlayerId: int;
  setSimulationSpeed(coefficient: number): void;
  runSteps(count: int): void;
  takeSnapshot(): RoomState;
  useSnapshot(newRoomState: RoomState): void;
  playerJoin(id: int, name: string, flag: string, avatar: string, conn: string, auth: string): void;
  playerLeave(playerId: int): void;
  playerInput(input: int, byId: int): void;
  playerChat(msg: string, byId: int): void;
  setKeyState(state: int): void;
  setPlayerChatIndicator(value: int, byId: int): void;
  setPlayerAvatar(value: string, byId: int): void;
  setCurrentStadium(value: Stadium, byId: int, onError: ErrorCallback): void;
  sendAnnouncement(msg: string, color: int, style: int, sound: int, targetId: int, byId: int): void;
  startGame(byId: int): void;
  stopGame(byId: int): void;
  setGamePaused(value: boolean, byId: int): void;
  setScoreLimit(value: int, byId: int): void;
  setTimeLimit(value: int, byId: int): void;
  setTeamsLock(value: int, byId: int): void;
  autoTeams(byId: int): void;
  setPlayerTeam(playerId: int, teamId: int, byId: int): void;
  setKickRateLimit(min: int, rate: int, burst: int, byId: int): void;
  setTeamColors(teamId: int, angle: int, colors: int[], byId: int): void;
  setPlayerAdmin(playerId: int, value: boolean, byId: int): void;
  kickPlayer(playerId: int, reason: string, ban: boolean, byId: int): void;
  setPlayerSync(value: boolean, byId: int): void;
  sendPingData(valueFunc: int[], byId: int): void;
  setDiscProperties(discId: int, type: int, data: any[], byId: int): void;
  sendCustomEvent(type: int, data: object, byId: int): void;
  destroy(): void;
}

declare interface SetRoomPropertiesParams {
  name?: string,
  password?: string | null,
  geo?: GeoLocation,
  playerCount?: int | null,
  maxPlayerCount?: int,
  fakePassword?: boolean | null
}

declare interface SetDiscPropertiesParams {
  x?: number,
  y?: number,
  xspeed?: number,
  yspeed?: number,
  xgravity?: number,
  ygravity?: number,
  radius?: number,
  bCoeff?: number,
  invMass?: number,
  damping?: number,
  color?: int,
  cMask?: int,
  cGroup?: int,
}

declare type UnparsedColor = "transparent" | string | [r: int, g: int, b: int];
declare type UnparsedTeam2 = "red" | "blue";
declare type UnparsedTeam3 = "spec" | "red" | "blue";
declare type UnparsedCollisionFlags = (keyof typeof CollisionFlags)[];

declare interface CreateVertexParams{
  x: number,
  y: number, 
  bCoef?: number,
  cMask?: UnparsedCollisionFlags,
  cGroup?: UnparsedCollisionFlags
}

declare interface CreateSegmentParams{
  v0: int,
  v1: int,
  color?: UnparsedColor,
  bias?: number,
  curve?: number,
  curveF?: number,
  vis?: boolean,
  bCoef?: number,
  cMask?: UnparsedCollisionFlags,
  cGroup?: UnparsedCollisionFlags
}

declare interface CreateSegmentFromObjParams {
  v0: Vertex,
  v1: Vertex,
  color?: UnparsedColor,
  bias?: number,
  curve?: number,
  curveF?: number,
  vis?: boolean,
  bCoef?: number,
  cMask?: UnparsedCollisionFlags,
  cGroup?: UnparsedCollisionFlags
}

declare interface CreateGoalParams {
  p0: [x: number, y: number],
  p1: [x: number, y: number],
  team: UnparsedTeam2
}

declare interface CreatePlaneParams {
  normal: [x: number, y: number],
  dist: number,
  bCoef?: number,
  cMask?: UnparsedCollisionFlags,
  cGroup?: UnparsedCollisionFlags
}

declare interface CreateDiscParams {
  pos: [x: number, y: number],
  radius: number,
  speed?: [x: number, y: number],
  gravity?: [x: number, y: number],
  invMass?: number,
  damping?: number,
  color?: UnparsedColor,
  bCoef?: number,
  cMask?: UnparsedCollisionFlags,
  cGroup?: UnparsedCollisionFlags
}

declare interface CreateJointParams {
  d0: int,
  d1: int,
  color?: UnparsedColor,
  strength?: "rigid" | number,
  length?: number | [min: number, max: number]
}

declare interface CreateJointFromObjParams {
  d0: Disc,
  d1: Disc,
  color?: UnparsedColor,
  strength?: "rigid" | number,
  length?: number | [min: number, max: number]
}

declare interface AddVertexParams {
  x: number,
  y: number, 
  bCoef?: number,
  cMask?: UnparsedCollisionFlags,
  cGroup?: UnparsedCollisionFlags
}

declare interface AddSegmentParams {
  v0: int,
  v1: int,
  color?: UnparsedColor,
  bias?: number,
  curve?: number,
  curveF?: number,
  vis?: boolean,
  bCoef?: number,
  cMask?: UnparsedCollisionFlags,
  cGroup?: UnparsedCollisionFlags
}

declare interface AddGoalParams {
  p0: [x: number, y: number],
  p1: [x: number, y: number],
  team: UnparsedTeam2
}

declare interface AddPlaneParams {
  normal: [x: number, y: number],
  dist: number,
  bCoef?: number,
  cMask?: UnparsedCollisionFlags,
  cGroup?: UnparsedCollisionFlags
}

declare interface AddDiscParams {
  pos: [x: number, y: number],
  radius: number,
  speed?: [x: number, y: number],
  gravity?: [x: number, y: number],
  invMass?: number,
  damping?: number,
  color?: UnparsedColor,
  bCoef?: number,
  cMask?: UnparsedCollisionFlags,
  cGroup?: UnparsedCollisionFlags
}

declare interface AddJointParams {
  d0: int,
  d1: int,
  color?: UnparsedColor,
  strength?: "rigid" | number,
  length?: number | [min: number, max: number]
}

declare interface AddSpawnPointParams {
  x: number,
  y: number,
  team: UnparsedTeam2
}

declare interface AddPlayerParams {
  id: int,
  name: string,
  avatar: string,
  flag: string,
  team: UnparsedTeam3,
  pos?: [x: number, y: number],
  speed?: [x: number, y: number],
  gravity?: [x: number, y: number],
  radius?: number,
  invMass?: number,
  damping?: number,
  bCoef?: number,
  cMask?: UnparsedCollisionFlags,
  cGroup?: UnparsedCollisionFlags
}

declare interface UpdateVertexParams {
  x?: number,
  y?: number, 
  bCoef?: number,
  cMask?: UnparsedCollisionFlags,
  cGroup?: UnparsedCollisionFlags
}

declare interface UpdateSegmentParams {
  v0?: int,
  v1?: int,
  color?: UnparsedColor,
  bias?: number,
  curve?: number,
  curveF?: number,
  vis?: boolean,
  bCoef?: number,
  cMask?: UnparsedCollisionFlags,
  cGroup?: UnparsedCollisionFlags
}

declare interface UpdateGoalParams {
  p0?: [x: number, y: number],
  p1?: [x: number, y: number],
  team?: UnparsedTeam2
}

declare interface UpdatePlaneParams {
  normal?: [x: number, y: number],
  dist?: number,
  bCoef?: number,
  cMask?: UnparsedCollisionFlags,
  cGroup?: UnparsedCollisionFlags
}

declare interface UpdateDiscParams {
  pos?: [x: number, y: number],
  speed?: [x: number, y: number],
  gravity?: [x: number, y: number],
  radius?: number,
  invMass?: number,
  damping?: number,
  color?: UnparsedColor,
  bCoef?: number,
  cMask?: UnparsedCollisionFlags,
  cGroup?: UnparsedCollisionFlags
}

declare interface UpdateDiscObjParams {
  pos?: [x: number, y: number],
  speed?: [x: number, y: number],
  gravity?: [x: number, y: number],
  radius?: number,
  invMass?: number,
  damping?: number,
  color?: UnparsedColor,
  bCoef?: number,
  cMask?: UnparsedCollisionFlags,
  cGroup?: UnparsedCollisionFlags
}

declare interface UpdateJointParams {
  d0?: int,
  d1?: int,
  color?: UnparsedColor,
  strength?: "rigid" | number,
  length?: number | [min: number, max: number]
}

declare interface UpdateSpawnPointParams {
  x?: number,
  y?: number,
  team?: UnparsedTeam2
}

declare interface UpdatePlayerParams {
  name?: string,
  avatar?: string,
  flag?: string,
  team?: UnparsedTeam3,
  pos?: [x: number, y: number],
  speed?: [x: number, y: number],
  gravity?: [x: number, y: number],
  radius?: number,
  invMass?: number,
  damping?: number,
  bCoef?: number,
  cMask?: UnparsedCollisionFlags,
  cGroup?: UnparsedCollisionFlags
}

declare interface UpdateStadiumPlayerPhysicsParams {
  radius?: number,
  gravity?: [x: number, y: number],
  invMass?: number,
  bCoef?: number,
  cGroup?: UnparsedCollisionFlags,
  damping?: number,
  kickingDamping?: number,
  acceleration?: number,
  kickingAcceleration?: number,
  kickStrength?: number,
  kickback?: number
}

declare interface UpdateStadiumBgParams {
  type?: 0 | 1 | 2,
  width?: number,
  height?: number,
  kickOffRadius?: number,
  cornerRadius?: number,
  color?: UnparsedColor,
  goalLine?: number
}

declare interface UpdateStadiumGeneralParams {
  name?: string,
  width?: number,
  height?: number,
  maxViewWidth?: number,
  cameraFollow?: 0 | 1,
  spawnDistance?: number,
  kickOffReset?: boolean,
  canBeStored?: boolean
}

declare interface SandboxModeFunctions {
  exportStadium(): object;
  createVertex(data: CreateVertexParams): Vertex;
  createSegment(data: CreateSegmentParams): Segment;
  createSegmentFromObj(data: CreateSegmentFromObjParams): Segment;
  createGoal(data: CreateGoalParams): Goal;
  createPlane(data: CreatePlaneParams): Plane;
  createDisc(data: CreateDiscParams): Disc;
  createJoint(data: CreateJointParams): Joint;
  createJointFromObj(data: CreateJointFromObjParams): Joint;
  addVertex(data: AddVertexParams): void;
  addSegment(data: AddSegmentParams): void;
  addGoal(data: AddGoalParams): void;
  addPlane(data: AddPlaneParams): void;
  addDisc(data: AddDiscParams): void;
  addJoint(data: AddJointParams): void;
  addSpawnPoint(data: AddSpawnPointParams): void;
  addPlayer(data: AddPlayerParams): void;
  findVertexIndicesOfSegmentObj(obj: Segment): int[];
  findVertexIndicesOfSegment(idx: int): int[];
  updateVertex(idx: int, data: UpdateVertexParams): void;
  updateSegment(idx: int, data: UpdateSegmentParams): void;
  updateGoal(idx: int, data: UpdateGoalParams): void;
  updatePlane(idx: int, data: UpdatePlaneParams): void;
  updateDisc(idx: int, data: UpdateDiscParams): void;
  updateDiscObj(discObj: Disc, data: UpdateDiscObjParams): void;
  updateJoint(idx: int, data: UpdateJointParams): void;
  updateSpawnPoint(idx: int, team: UnparsedTeam2, data: UpdateSpawnPointParams): void;
  updatePlayer(playerId: int, data: UpdatePlayerParams): void;
  removeVertex(idx: int): void;
  removeSegment(idx: int): void;
  removeGoal(idx: int): void;
  removePlane(idx: int): void;
  removeDisc(idx: int): void;
  removeJoint(idx: int): void;
  removeSpawnPoint(idx: int, team: string): void;
  removePlayer(playerId: int): void;
  updateStadiumPlayerPhysics(data: UpdateStadiumPlayerPhysicsParams): void;
  updateStadiumBg(data: UpdateStadiumBgParams): void;
  updateStadiumGeneral(data: UpdateStadiumGeneralParams): void;
}

declare interface FakeEventTriggers {
  fakePlayerJoin(id: int, name: string, flag: string, avatar: string, conn: string, auth: string): void;
  fakePlayerLeave(id: int): { id: int, name: string, flag: string, avatar: string, conn: string, auth: string };
  fakeSendPlayerChat(msg: string, byId: int): void;
  fakeSetPlayerChatIndicator(value: boolean, byId: int): void;
  fakeSetPlayerAvatar(value: string, byId: int): void;
  fakeSetPlayerAdmin(playerId: int, value: boolean, byId: int): void;
  fakeSetPlayerSync(value: boolean, byId: int): void;
  fakeSetStadium(value: Stadium, byId: int): void;
  fakeStartGame(byId: int): void;
  fakeStopGame(byId: int): void;
  fakeSetGamePaused(value: boolean, byId: int): void;
  fakeSetScoreLimit(value: int, byId: int): void;
  fakeSetTimeLimit(value: int, byId: int): void;
  fakeSetTeamsLock(value: boolean, byId: int): void;
  fakeAutoTeams(byId: int): void;
  fakeSetPlayerTeam(playerId: int, teamId: int, byId: int): void;
  fakeSetKickRateLimit(min: int, rate: int, burst: int, byId: int): void;
  fakeSetTeamColors(teamId: int, angle: int, colors: int[], byId: int): void;
  fakeKickPlayer(playerId: int, reason: string | null, ban: boolean, byId: int): void;
}

declare interface RoomBase {
  readonly isHost: boolean;
  readonly client: HaxballClient;
  readonly currentPlayerId: int;
  readonly currentPlayer: Player;
  readonly state: RoomState;
  readonly stateExt: RoomState | null;
  readonly gameState: GameState | null;
  readonly gameStateExt: GameState | null;
  readonly sdp: string;
  readonly kickTimeout: int;
  readonly renderer: Renderer;
  readonly plugins: Plugin[];
  readonly activePlugins: Plugin[];
  readonly pluginsMap: object;
  readonly name: string;
  readonly link: string;
  readonly timeLimit: int;
  readonly scoreLimit: int;
  readonly stadium: Stadium;
  readonly players: Player[];
  readonly redScore: int | null;
  readonly blueScore: int | null;
  readonly timeElapsed: int | null;
  leave(): void;
  setProperties(properties: SetRoomPropertiesParams): void;
  setRecaptcha(on: boolean): void;
  setKickRateLimit(min: int, rate: int, burst: int): void;
  setHandicap(handicap: int): void;
  setExtrapolation(extrapolation: int): void;
  clearBans(): void;
  setAvatar(avatar: string): void;
  setPlayerAvatar(id: int, value: string, headless: boolean): void;
  setChatIndicatorActive(active: boolean): void;
  setTeamColors(teamId: int, angle: int, ...colors: string[]): void;
  setUnlimitedPlayerCount(on: boolean): void;
  setFakePassword(fakePwd: boolean | null): void;
  sendChat(msg: string, targetId: int | null): void;
  sendAnnouncement(msg: string, targetId: int | null, color: int, style: int, sound: int): void;
  setDiscProperties(discId: int, properties: SetDiscPropertiesParams): void;
  setPlayerDiscProperties(playerId: int, properties: SetDiscPropertiesParams): void;
  reorderPlayers(playerIdList: int[], moveToTop: boolean): void;
  sendCustomEvent(type: int, data: object): void;
  getKeyState(): int;
  setKeyState(state: int): void;
  startGame(): void;
  stopGame(): void;
  pauseGame(): void;
  isGamePaused(): boolean;
  autoTeams(): void;
  lockTeams(): void;
  resetTeams(): void;
  randTeams(): void;
  resetTeam(teamId: int): void;
  setSync(value: boolean): void;
  setCurrentStadium(stadium: Stadium, onError: ErrorCallback): void;
  setTimeLimit(value: int): void;
  setScoreLimit(value: int): void;
  changeTeam(teamId: int): void;
  setPlayerTeam(playerId: int, teamId: int): void;
  setPlayerAdmin(playerId: int, isAdmin: boolean): void;
  kickPlayer(playerId: int, reason: string | null, isBanning: boolean): void;
  getPlayer(id: int): Player;
  getBall(extrapolated?: boolean): Disc;
  getDiscs(extrapolated?: boolean): Disc[];
  getDisc(discId: int, extrapolated?: boolean): Disc;
  getPlayerDisc(playerId: int, extrapolated?: boolean): Disc;
  getPlayerDisc_exp(playerId: int): Disc;
  setPluginActive(name: string, active: boolean): void;
  startRecording(): boolean;
  stopRecording(): Uint8Array | null;
  isRecording(): boolean
  setConfig(roomConfig: RoomConfig): void;
  mixConfig(roomConfig: RoomConfig): void;
  updatePlugin(pluginIndex: int, newPluginObj: Plugin): void;
  setRenderer(renderer: Renderer): void;
  takeSnapshot(): RoomState;
}

export type Room = (RoomBase & SandboxModeFunctions & FakeEventTriggers);
export namespace Room {
  export function create(createParams: CreateRoomParams, commonParams: HaxballClient): HaxballClient;
  export function join(joinParams: JoinRoomParams, commonParams: HaxballClient): HaxballClient;
  export function sandbox(callbacks: CommonlyUsedCallbacks & CustomCallbacks, options: SandboxOptions): SandboxRoom;
}

declare class AsyncReplayReader {
  readonly state: RoomState;
  readonly gameState: GameState | null;
  readonly currentPlayerId: int;
  getSpeed: ()=>number;
  setSpeed: (coefficient)=>void; // fastmo: coefficient>1, normal: coefficient=1, slowmo: 0<coefficient<1, stop: coefficient=0
  getTime: ()=>number; // get current time in msecs.
  length: ()=>number; // get the total length of replay data in msecs.
  setTime: (destinationTime)=>void; // jump to destinationTime in msecs.
  destroy: ()=>void;
  onDestinationTimeReached: ()=>{};
  onEnd: ()=>{};
}

declare type ReplayReadOptions = {
  requestAnimationFrame?: RAF;
  cancelAnimationFrame?: CAF;
  fps_limit?: number;
}

export interface Replay {}
export namespace Replay {
  export function read(uint8Array: Uint8Array, callbacks: CommonlyUsedCallbacks, options: ReplayReadOptions): AsyncReplayReader;
}

export interface Query {}
export namespace Query {
  export function getVertexIndexAtMapCoord(roomState: RoomState, p: Point, threshold: number): int;
  export function getVertexAtMapCoord(roomState: RoomState, p: Point, threshold: number): Vertex | null;
  export function getSegmentIndexAtMapCoord(roomState: RoomState, p: Point, threshold: number): int;
  export function getSegmentAtMapCoord(roomState: RoomState, p: Point, threshold: number): Segment | null;
  export function getGoalIndexAtMapCoord(roomState: RoomState, p: Point, threshold: number): int;
  export function getGoalAtMapCoord(roomState: RoomState, p: Point, threshold: number): Goal | null;
  export function getPlaneIndexAtMapCoord(roomState: RoomState, p: Point, threshold: number): int;
  export function getPlaneAtMapCoord(roomState: RoomState, p: Point, threshold: number): Plane | null;
  export function getJointIndexAtMapCoord(roomState: RoomState, p: Point, threshold: number): int;
  export function getJointAtMapCoord(roomState: RoomState, p: Point, threshold: number): Joint | null;
  export function getDiscIndexAtMapCoord(roomState: RoomState, p: Point): int;
  export function getDiscAtMapCoord(roomState: RoomState, p: Point): Disc | null;
  export function getSpawnPointIndexAtMapCoord(roomState: RoomState, p: Point, threshold: number): int;
}

declare interface Variable{
  value: any
}

declare abstract class Addon{
  public defineMetadata(metadata?: any);
  public defineVariable(variable?: Variable);
  abstract initialize(room: Room): void;
  abstract finalize(): void;
}

export interface RoomConfig extends AllRoomConfigCallbacks {}
export abstract class RoomConfig extends Addon implements AllRoomConfigCallbacks{
  constructor(metadata?: any);
}

export interface Plugin extends AllPluginCallbacks {}
export abstract class Plugin extends Addon implements AllPluginCallbacks {
  constructor(name: string, active?: boolean, metadata?: any);
}

export interface Renderer extends AllRendererCallbacks {}
export abstract class Renderer extends Addon implements AllRendererCallbacks{
  constructor(metadata?: any);
}

declare type TextMap = {
  [x: number]: string;
}

declare type TextFuncMap = {
  [x: number]: (...args: any[]) => string;
}

export interface Language {}
export namespace Language {
  export function add(abbr: string, errorsTextMap: TextFuncMap, connectionStateTextMap: TextMap, rendererTextMap: TextMap): void; // TODO: TextMap
  export function remove(abbr: string): void;
}

export interface Errors {}
export namespace Errors {
  export class HBError {
    errorCode: ErrorCodes; //The error code that has been thrown.
    params: object[] // Parameters for the error
    toString(): string; // Returns the full description of the current error object using current language
  }
  export const ErrorCodes: any;
}

export interface Impl {}
export namespace Impl {
  export interface Core {}
  export namespace Core {
    export const H: any;
    export const ka: any;
    export const p: any;
    export const T: any;
  }
  export interface Stream {}
  export namespace Stream {
    export const F: any;
    export const w: any;
  }
  export interface Utils {}
  export namespace Utils {
    export const U: any;
    export const D: any;
    export const J: any;
    export const K: any;
    export const r: any;
    export const M: any;
    export const n: any;
    export const va: any;
    export const q: any;
  }
}

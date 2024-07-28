function abcHaxballAPI(window, config){
  var { 
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    console,
    requestAnimationFrame,
    cancelAnimationFrame,
    crypto,
    WebSocket,
    XMLHttpRequest,
    performance,
    JSON5,
    pako
  } = window;  

  var RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;
  var RTCIceCandidate = window.webkitRTCIceCandidate || window.mozRTCIceCandidate || window.RTCIceCandidate;
  var RTCSessionDescription = window.webkitRTCSessionDescription || window.mozRTCSessionDescription || window.RTCSessionDescription;

  (!config) && (config = {});
  (!config.backend) && (config.backend = {});
  (!config.backend.hostname) && (config.backend.hostname = "www.haxball.com");
  (!config.backend.hostnameWs) && (config.backend.hostnameWs = "p2p.haxball.com");
  (config.backend.secure==null) && (config.backend.secure = true);
  (config.fixNames==null) && (config.fixNames = true);
  (config.stunServer==null) && (config.stunServer = "stun:stun.l.google.com:19302");
  
  const defaultVersion = config.version || 9;
  const backendUrl = (config.backend.secure?"wss":"ws")+"://"+config.backend.hostnameWs+"/"; // n.Vr
  const httpUrl = config.proxy?.HttpUrl || ((config.backend.secure?"https":"http")+"://"+config.backend.hostname+"/rs/"); // n.Ee
  const stunServers = [{ urls: config.stunServer }]; // n.Vf

  const ConnectionState = {
    ConnectingToMaster: 0,
    ConnectingToPeer: 1,
    AwaitingState: 2,
    Active: 3,
    ConnectionFailed: 4
  };

  const OperationType = {
    SetAvatar: 0,
    SetHeadlessAvatar: 1,
    SendChat: 2,
    SendChatIndicator: 3,
    SendAnnouncement: 4,
    SendInput: 5,
    SetStadium: 6,
    StartGame: 7,
    StopGame: 8,
    PauseResumeGame: 9,
    SetScoreLimit: 10,
    SetTimeLimit: 11,
    AutoTeams: 12,
    SetTeamsLock: 13,
    SetPlayerTeam: 14,
    SetKickRateLimit: 15,
    SetTeamColors: 16,
    SetPlayerAdmin: 17,
    KickBanPlayer: 18,
    SetPlayerSync: 19,
    Ping: 20,
    SetDiscProperties: 21,
    JoinRoom: 22,
    ReorderPlayers: 23,
    CheckConsistency: 24,
    CustomEvent: 25,
    BinaryCustomEvent: 26,
    SetPlayerIdentity: 27
  };

  const CollisionFlags = {
    ball: 0,
    red: 1,
    blue: 2,
    redKO: 3,
    blueKO: 4,
    wall: 5,
    kick: 6,
    score: 7,
    free1: 8,
    free2: 9,
    free3: 10,
    free4: 11,
    free5: 12,
    free6: 13,
    free7: 14,
    free8: 15,
    free9: 16,
    free10: 17,
    free11: 18,
    free12: 19,
    free13: 20,
    free14: 21,
    free15: 22,
    free16: 23,
    free17: 24,
    free18: 25,
    free19: 26,
    free20: 27,
    c0: 28,
    c1: 29,
    c2: 30,
    c3: 31
  };

  const Direction = {
    Backward: -1,
    Still: 0,
    Forward: 1
  };
  
  const CameraFollow = {
    None: 0,
    Player: 1
  };
  
  const BackgroundType = {
    None: 0,
    Grass: 1,
    Hockey: 2
  };
  
  const GamePlayState = {
    BeforeKickOff: 0,
    Playing: 1,
    AfterGoal: 2,
    Ending: 3
  };

  const PlayerPositionInGame = {
    None: 0,
    GK: 1, // Goalkeeper
    SW: 2, // Sweeper
    WBL: 3, // Wing Back Left
    DL: 4, // Defender Left
    DC: 5, // Defender Centre
    DR: 6, // Defender Right
    WBR: 7, // Wing Back Right
    DML: 8, // Defensive Midfielder Left
    DMC: 9, // Defensive Midfielder Centre
    DMR: 10, // Defensive Midfielder Right
    ML: 11, // Midfielder Left
    MC: 12, // Midfielder Centre
    MR: 13, // Midfielder Right
    AML: 14, // Attacking Midfielder Left
    AMC: 15, // Attacking Midfielder Centre
    AMR: 16, // Attacking Midfielder Right
    FL: 17, // Left Forward
    FC: 18, // Centre Forward
    FR: 19, // Right Forward
    ST: 20, // Striker
  };
  
  const VariableType = {
    Void: 0,
    Boolean: 1,
    Integer: 2,
    Number: 3,
    String: 4,
    Color: 5,
    CollisionFlags: 6,
    Coordinate: 7,
    Team: 8,
    TeamWithSpec: 9,
    BgType: 10,
    CameraFollow: 11,
    KickOffReset: 12,
    Flag: 13,
    File: 14,
    PlayerId: 15,
    Keys: 16,
    Progress: 17,
    PlayerPositionInGame: 18
  };

  const ErrorCodes = {
    Empty: 0,
    ConnectionClosed: 1,
    GameStateTimeout: 2,
    RoomClosed: 3,
    RoomFull: 4,
    WrongPassword: 5,
    BannedBefore: 6,
    IncompatibleVersion: 7,
    FailedHost: 8,
    Unknown: 9,
    Cancelled: 10,
    FailedPeer: 11,
    KickedNow: 12,
    Failed: 13,
    MasterConnectionError: 14,
    StadiumParseError: 15,
    StadiumParseSyntaxError: 16,
    StadiumParseUnknownError: 17,
    ObjectCastError: 18,
    TeamColorsReadError: 19,
    UTF8CharacterDecodeError: 20,
    ReadTooMuchError: 21,
    ReadWrongStringLengthError: 22,
    EncodeUTF8CharNegativeError: 23,
    EncodeUTF8CharTooLargeError: 24,
    CalculateLengthOfUTF8CharNegativeError: 25,
    CalculateLengthOfUTF8CharTooLargeError: 26,
    BufferResizeParameterTooSmallError: 27,
    BadColorError: 28,
    BadTeamError: 29,
    StadiumLimitsExceededError: 30,
    MissingActionConfigError: 31,
    UnregisteredActionError: 32,
    MissingImplementationError: 33,
    AnnouncementActionMessageTooLongError: 34,
    ChatActionMessageTooLongError: 35,
    KickBanReasonTooLongError: 36,
    ChangeTeamColorsInvalidTeamIdError: 37,
    MissingRecaptchaCallbackError: 38,
    ReplayFileVersionMismatchError: 39,
    ReplayFileReadError: 40,
    JoinRoomNullIdAuthError: 41,
    PlayerNameTooLongError: 42,
    PlayerCountryTooLongError: 43,
    PlayerAvatarTooLongError: 44,
    PlayerJoinBlockedByMPDError: 45,
    PlayerJoinBlockedByORError: 46,
    PluginNotFoundError: 47,
    PluginNameChangeNotAllowedError: 48,
    LibraryNotFoundError: 49,
    LibraryNameChangeNotAllowedError: 50,
    AuthFromKeyInvalidIdFormatError: 51,
    //LanguageAlreadyExistsError: 52,
    //CurrentLanguageRemovalError: 53,
    //LanguageDoesNotExistError: 54,
    BadActorError: 55,
    AuthBannedError: 56,
    NoProxyIdentityProblem: 57,
    NoProxyIdentitySolution: 58
  };

  var currentLanguage = null, allRooms = []; // all current room objects have to be stored in this array so that they can receive the language changed signal directly from API.

  function removeRoomFromList(room){
    if (!room)
      return;
    var idx = allRooms.indexOf(room);
    if (idx<0)
      return;
    allRooms.splice(idx, 1);
  }

  Object.defineProperty(Language, "current", {
    get: function(){
      return currentLanguage;
    },
    set: function(langObj){
      currentLanguage = langObj;
      allRooms.forEach((room)=>{
        room._onLanguageChange?.(langObj?.abbr);
      });
    }
  });

  var gls = (id, params)=>Language.resolveText(currentLanguage?.api?.errors?.[id], params||[]);
  var clpip = (s)=>(console.warn(gls(ErrorCodes.NoProxyIdentityProblem)||"NoProxyIdentityProblem"), s = gls(ErrorCodes.NoProxyIdentitySolution), s && console.warn(s))

  function vvt(a, b) { // r.G -> validateValueType(value, type)
    var c = null != b;
    if (c){
      switch (b) {
        case Array:
          c = a instanceof Array;
          break;
        case Boolean:
          c = "boolean" == typeof a;
          break;
        case Number:
          c = "number" == typeof a;
          break;
        case Integer:
          c = ("number" == typeof a) && ((a | 0) === a);
          break;
        case String:
          c = "string" == typeof a;
          break;
        default:
          c = false;
      }
      if (c)
        return a;
    }
    throw new q(createError(ErrorCodes.ObjectCastError, JSON.stringify(a), JSON.stringify(b))); // "Cannot cast " + a + " to " + b
  };
  
  function HBError(){
    this.code = ErrorCodes.Empty;
    this.params = null;
  }

  HBError.prototype = {
    toString: function(){
      return gls(this.code, this.params);
    }
  };

  function createError(code, ...params){
    var e = new HBError();
    e.code = code;
    e.params = params;
    return e;
  }

  if (!config.noWebRTC)
    (()=>{
      //mc.ts (init webrtc) contents:
      var b = new RTCPeerConnection({ iceServers: [] });
      try {
        b.createAnswer()["catch"](function () {
          b.close(); // otherwise causing memory leak in some cases.
        });
      } catch (e) {
        var a = a.RTCPeerConnection.prototype,
          c = a.createOffer,
          d = a.createAnswer;
        a.createOffer = function (a) {
          var b = this;
          return new Promise(function (d, e) {
            c.call(b, d, e, a);
          });
        };
        a.createAnswer = function (a) {
          var b = this;
          return new Promise(function (c, e) {
            d.call(b, c, e, a);
          });
        };
      }
    })();




  // -- start of global Haxball classes --





  //var rc = 0;
  String.fromCodePoint || (String.fromCodePoint = (a) => (a<65536) ? String.fromCharCode(a) : (String.fromCharCode((a>>10)+55232)+String.fromCharCode((a&1023)+56320)));
  String.prototype.f = String;
  String.b = !0;
  Array.b = !0;
  Date.prototype.f = Date;
  Date.b = "Date";
  ArrayBuffer.prototype.slice || (ArrayBuffer.prototype.slice = function (a, b) {
    var c = new Uint8Array(this, a, null == b ? null : b - a), d = new Uint8Array(c.byteLength);
    d.set(c);
    return d.buffer;
  });
  var Integer = {};
  function Bb(a) {
    this.xp = a;
  }
  Bb.b = !0;
  Bb.prototype = { f: Bb };
  function Kb(a) {
    this.Id = a
  }
  Kb.b = !0;
  Kb.prototype = {
    f: Kb
  };
  function q(a) {
    this.Ta = a;
    Error.captureStackTrace && Error.captureStackTrace(this, q);
  }
  q.prototype = Error.prototype;
  Object.defineProperty(q.prototype, "message", {
    get: function () {
      return String(this.Ta);
    },
  });
  var pWT = (promise, msec) => new Promise((c, d)=>{ // promiseWithTimeout
    var e = setTimeout(()=>{
      d("Timed out");
    }, msec);
    promise.then((a)=>{
      clearTimeout(e);
      c(a);
    }, (a)=>{
      clearTimeout(e);
      d(a);
    });
  });
  var cH = (a) => (a.reduce((x,y)=>{x+=y;x+=x<<10;x^=x>>>6;return x;},0)|0); // calculateHash
  var tSil = (a, b) => (a.length <= b ? a : D.substr(a, 0, b)); // U.Qc (trimStringIfLonger)
  var hStn = (b) => { for (var a = "", l = 0; l < b.length; ) a += J.Wg(b.charAt(l++), b.charAt(l++));return a; }; // U.Ur (hexStrToNumber)
  var bAti = (a) => { for (var b = "", c = 0, d = a.byteLength; c < d; ) b += String.fromCharCode(a[c++]);return b; }; // U.Zr (byteArrayToIp)
  var yazc = 0; // ya.zc (current frame index?)
  function C(a, b) {
    var c = Object.create(a),
      d;
    for (d in b) c[d] = b[d];
    b.toString !== Object.prototype.toString && (c.toString = b.toString);
    return c;
  }
  function D() {}
  function J() {}
  function K() {}
  function M() {}
  function Fb() {
    this.Id = 0;
    this.w = "";
    this.ub = "";
    this.Ec = 0;
    this.Gc = 0;
    this.Ib = false;
    this.Xe = 0;
    this.I = 0;
  }
  function Wb() {
    this.vd = null;
    this.$ = "";
    this.Le = Infinity;
  }
  function F(a, b) {
    null == b && (b = !1);
    this.o = a;
    this.Sa = b;
    this.a = 0;
  }
  function w(a, b) {
    null == b && (b = !1);
    this.o = a;
    this.Sa = b;
    this.a = 0;
  }
  function T() {
    this.ub = "";
    this.Ec = this.Gc = 0;
  }
  function H(a, b) {
    this.x = a;
    this.y = b;
  }
  function ka() {
    this.hd = 0;
    this.ed = 16777215;
    this.fb = [];
  }
  function p(a, b, c, d, k) {
    this.$ = a;
    this.R = b;
    this.Ch = c;
    this.cp = d;
    this.v = k;
  }
  function Eb() {
    this.Se = 0;
    this.Z = 15;
    this.v = 0;
    this.oa = new H(0, 0);
    this.aa = this.m = 0.5;
    this.Ca = 0.96;
    this.Ce = 0.1;
    this.Te = 0.07;
    this.Ue = 0.96;
    this.Re = 5;
  }
  function h() {
    this.J = [];
    this.U = [];
    this.qa = [];
    this.tc = [];
    this.F = [];
    this.pb = [];
    this.Dd = [];
    this.md = [];
    this.ge = new Eb();
    this.Bh = 255;
    this.Ge = this.Ye = 0;
    this.Lf = !0;
    this.pf = !1;
    this.w = "";
    this.$b = 0;
    this.qc = 0;
    this.ld = 0;
    this.jd = 0;
    this.Td = 0;
    this.Sd = 0;
    this.kd = 0;
    this.Uc = 0;
    this.kc = 0;
    this.Fe = 0;
  }
  function ea() {
    this.zc = -1;
    this.an = null;
    this.ea = p.Ia;
    this.H = null;
    this.yc = this.Sc = 0;
    this.Wb = !1;
    this.ob = this.V = 0;
    this.w = "Player";
    this.Ug = this.yb = 0;
    this.Kd = null;
    this.Ld = !1;
    this.Xb = this.Jd = null;
    this.Jb = 0;
    this.cb = !1;
    this.conn = null; // player conn
    this.auth = null; // player auth
    this.customClient = false; // is player using our client?
    this.identity = null;
  }

  var PhysicsEngine = (()=>{
    function DotObject() { // B
      //this.ud = 0;
      this.v = 32;
      this.h = 63;
      this.m = 1;
      this.a = new H(0, 0);
    }
    /*
    DotObject.b = !0;
    DotObject.prototype = {
      ga: function (a) {
        var b = this.a;
        a.s(b.x);
        a.s(b.y);
        a.s(this.m);
        a.O(this.h);
        a.O(this.v);
      },
      ja: function (a) {
        var b = this.a;
        b.x = a.u();
        b.y = a.u();
        this.m = a.u();
        this.h = a.M();
        this.v = a.M();
      },
      f: DotObject,
    };
    */
    
    function FiniteLinearObject() { // E
      this.Hg = this.Ig = this.wa = null;
      this.Yj = 0;
      this.ca = this.W = this.Xd = null;
      this.Cc = 0;
      this.m = 1;
      this.h = 63;
      this.v = 32;
      this.vb = 1 / 0;
      //this.Za = !0;
      //this.R = 0;
    }

    //FiniteLinearObject.b = !0;
    const mn = 0.17435839227423353, ln = 5.934119456780721, dtR = 0.017453292519943295;
    FiniteLinearObject.prototype = {
      /*
      ga: function (a) {
        var b = 0,
          c = a.a;
        a.l(0);
        a.l(this.W.ud);
        a.l(this.ca.ud);
        0 != this.Cc && ((b = 1), a.s(this.Cc));
        this.vb != 1 / 0 && ((b |= 2), a.s(this.vb));
        0 != this.R && ((b |= 4), a.O(this.R));
        this.Za && (b |= 8);
        a.o.setUint8(c, b);
        a.s(this.m);
        a.O(this.h);
        a.O(this.v);
      },
      ja: function (a, b) {
        var c = a.B();
        this.W = b[a.B()];
        this.ca = b[a.B()];
        this.Cc = 0 != (c & 1) ? a.u() : 0;
        this.vb = 0 != (c & 2) ? a.u() : 1 / 0;
        this.R = 0 != (c & 4) ? a.M() : 0;
        this.Za = 0 != (c & 8);
        this.m = a.u();
        this.h = a.M();
        this.v = a.M();
      },
      */
      Oc: function (a) {
        a *= dtR;
        if (0 > a) {
          a = -a;
          var b = this.W;
          this.W = this.ca;
          this.ca = b;
          this.Cc = -this.Cc;
        }
        a > mn && a < ln && (this.vb = 1 / Math.tan(a / 2));
      },
      Co: function () {
        return 0 != 0 * this.vb ? 0 : 114.59155902616465 * Math.atan(1 / this.vb);
      },
      he: function () {
        if (0 == 0 * this.vb) {
          var a = this.ca.a,
            b = this.W.a,
            c = 0.5 * (a.x - b.x),
            a = 0.5 * (a.y - b.y),
            b = this.W.a,
            d = this.vb;
          this.Xd = new H(b.x + c + -a * d, b.y + a + c * d);
          a = this.W.a;
          b = this.Xd;
          c = a.x - b.x;
          a = a.y - b.y;
          this.Yj = Math.sqrt(c * c + a * a);
          c = this.W.a;
          a = this.Xd;
          this.Hg = new H(-(c.y - a.y), c.x - a.x);
          c = this.Xd;
          a = this.ca.a;
          this.Ig = new H(-(c.y - a.y), c.x - a.x);
          0 >= this.vb &&
            ((a = c = this.Hg),
            (c.x = -a.x),
            (c.y = -a.y),
            (a = c = this.Ig),
            (c.x = -a.x),
            (c.y = -a.y));
        } else
          (a = this.W.a),
            (b = this.ca.a),
            (c = a.x - b.x),
            (a = -(a.y - b.y)),
            (b = Math.sqrt(a * a + c * c)),
            (this.wa = new H(a / b, c / b));
      },
      //f: FiniteLinearObject,
    };
  
    function InfiniteLinearObject() { // L
      this.v = 32;
      this.h = 63;
      this.m = 1;
      this.Ua = 0;
      this.wa = new H(0, 0);
    }
    /*
    InfiniteLinearObject.b = !0;
    InfiniteLinearObject.prototype = {
      ga: function (a) {
        var b = this.wa;
        a.s(b.x);
        a.s(b.y);
        a.s(this.Ua);
        a.s(this.m);
        a.O(this.h);
        a.O(this.v);
      },
      ja: function (a) {
        var b = this.wa;
        b.x = a.u();
        b.y = a.u();
        this.Ua = a.u();
        this.m = a.u();
        this.h = a.M();
        this.v = a.M();
      },
      f: InfiniteLinearObject,
    };
    */

    function FiniteLinearSensor() { // sb
      //this.qe = p.Ia;
      this.ca = new H(0, 0);
      this.W = new H(0, 0);
    }
    FiniteLinearSensor.prototype = {
      C: function (a, b) { // oldDiscPos, newDiscPos
        var f = this.W,
          g = this.ca,
          k = b.x - a.x,
          l = b.y - a.y;
        return (0 < -(f.y - a.y) * k + (f.x - a.x) * l) != (0 < -(g.y - a.y) * k + (g.x - a.x) * l) && (
          (k = g.x - f.x), 
          (g = g.y - f.y),
          (-(a.y - f.y) * k + (a.x - f.x) * g > 0) != (-(b.y - f.y) * k + (b.x - f.x) * g > 0)
        );
      }
    };
    /*
    FiniteLinearSensor.b = !0;
    FiniteLinearSensor.prototype = {
      ga: function (a) {
        var b = this.W;
        a.s(b.x);
        a.s(b.y);
        b = this.ca;
        a.s(b.x);
        a.s(b.y);
        a.l(this.qe.$);
      },
      ja: function (a) {
        var b = this.W;
        b.x = a.u();
        b.y = a.u();
        b = this.ca;
        b.x = a.u();
        b.y = a.u();
        a = a.lf();
        this.qe = 1 == a ? p.fa : 2 == a ? p.xa : p.Ia;
      },
      f: FiniteLinearSensor,
    };
    */
    function CircularObject() { // ua
      this.h = this.v = 63;
      this.R = 16777215;
      this.Ca = 0.99;
      this.aa = 1;
      this.m = 0.5;
      this.Z = 10;
      this.oa = new H(0, 0);
      this.D = new H(0, 0);
      this.a = new H(0, 0);
    }
    /*
    CircularObject.b = !0;
    CircularObject.prototype = {
      ga: function (a) {
        var b = this.a;
        a.s(b.x);
        a.s(b.y);
        b = this.D;
        a.s(b.x);
        a.s(b.y);
        b = this.oa;
        a.s(b.x);
        a.s(b.y);
        a.s(this.Z);
        a.s(this.m);
        a.s(this.aa);
        a.s(this.Ca);
        a.tb(this.R);
        a.O(this.h);
        a.O(this.v);
      },
      ja: function (a) {
        var b = this.a;
        b.x = a.u();
        b.y = a.u();
        b = this.D;
        b.x = a.u();
        b.y = a.u();
        b = this.oa;
        b.x = a.u();
        b.y = a.u();
        this.Z = a.u();
        this.m = a.u();
        this.aa = a.u();
        this.Ca = a.u();
        this.R = a.hb();
        this.h = a.M();
        this.v = a.M();
      },
      rp: function () {
        var a = new ca();
        this.Bk(a);
        return a;
      },
      Bk: function (a) {
        var b = a.a,
          c = this.a;
        b.x = c.x;
        b.y = c.y;
        b = a.D;
        c = this.D;
        b.x = c.x;
        b.y = c.y;
        b = a.oa;
        c = this.oa;
        b.x = c.x;
        b.y = c.y;
        a.Z = this.Z;
        a.m = this.m;
        a.aa = this.aa;
        a.Ca = this.Ca;
        a.R = this.R;
        a.h = this.h;
        a.v = this.v;
      },
      f: CircularObject,
    };
    */
    function DistanceConstraint() { // nb
      this.R = 0;
      this.ne = 1 / 0;
      this.Hb = this.ec = 100;
      this.Yd = this.Zd = 0;
    }
    /*
    DistanceConstraint.b = !0;
    */
    DistanceConstraint.prototype = {
      /*
      ga: function (a) {
        a.l(this.Yd);
        a.l(this.Zd);
        a.s(this.Hb);
        a.s(this.ec);
        a.s(this.ne);
        a.O(this.R);
      },
      ja: function (a) {
        this.Yd = a.B();
        this.Zd = a.B();
        this.Hb = a.u();
        this.ec = a.u();
        this.ne = a.u();
        this.R = a.M();
      },
      */
      C: function (a) {
        var b = a[this.Yd];
        a = a[this.Zd];
        if (null != b && null != a) {
          var c = b.a,
            d = a.a,
            e = c.x - d.x,
            c = c.y - d.y,
            f = Math.sqrt(e * e + c * c);
          if (!(0 >= f)) {
            e /= f;
            c /= f;
            d = b.aa / (b.aa + a.aa);
            d != d && (d = 0.5);
            var g, k;
            if (this.Hb >= this.ec) (g = this.Hb), (k = 0);
            else if (f <= this.Hb) (g = this.Hb), (k = 1);
            else if (f >= this.ec) (g = this.ec), (k = -1);
            else return;
            f = g - f;
            if (0 == 0 * this.ne)
              (d = this.ne * f * 0.5),
                (e *= d),
                (c *= d),
                (k = d = b.D),
                (b = b.aa),
                (d.x = k.x + e * b),
                (d.y = k.y + c * b),
                (d = b = a.D),
                (a = a.aa),
                (b.x = d.x + -e * a),
                (b.y = d.y + -c * a);
            else {
              g = f * d;
              var l = b.a,
                h = b.a;
              l.x = h.x + e * g * 0.5;
              l.y = h.y + c * g * 0.5;
              h = l = a.a;
              f -= g;
              l.x = h.x - e * f * 0.5;
              l.y = h.y - c * f * 0.5;
              f = b.D;
              g = a.D;
              f = e * (f.x - g.x) + c * (f.y - g.y);
              0 >= f * k &&
                ((d *= f),
                (b = k = b.D),
                (k.x = b.x - e * d),
                (k.y = b.y - c * d),
                (a = b = a.D),
                (d = f - d),
                (b.x = a.x + e * d),
                (b.y = a.y + c * d));
            }
          }
        }
      },
      //f: DistanceConstraint,
    };

    function MoveableCircularObject() { // ca
      //this.playerId = null; // playerId
      //this.hc = -1;
      //this.gc = null;
      //this.jl = 0;
      CircularObject.apply(this);
      /*
      this.h = this.v = 63;
      this.R = 16777215;
      this.Ca = 0.99;
      this.aa = 1;
      this.m = 0.5;
      this.Z = 10;
      this.oa = new H(0, 0);
      this.D = new H(0, 0);
      this.a = new H(0, 0);
      */
    }
    /*
    MoveableCircularObject.b = !0;
    MoveableCircularObject.qd = function (a, b) {
      a.Z = b.Z;
      a.m = b.m;
      a.aa = b.aa;
      a.Ca = b.Ca;
      a.R = b.R;
      a.h = b.h;
      a.v = b.v;
      var c = a.a,
        d = b.a;
      c.x = d.x;
      c.y = d.y;
      c = a.D;
      d = b.D;
      c.x = d.x;
      c.y = d.y;
      c = a.oa;
      d = b.oa;
      c.x = d.x;
      c.y = d.y;
    };
    */
    MoveableCircularObject.prototype = {
      /*
      ga: function (a) {
        var b = this.a;
        a.s(b.x);
        a.s(b.y);
        b = this.D;
        a.s(b.x);
        a.s(b.y);
        b = this.oa;
        a.s(b.x);
        a.s(b.y);
        a.s(this.Z);
        a.s(this.m);
        a.s(this.aa);
        a.s(this.Ca);
        a.tb(this.R);
        a.O(this.h);
        a.O(this.v);
      },
      ja: function (a) {
        var b = this.a;
        b.x = a.u();
        b.y = a.u();
        b = this.D;
        b.x = a.u();
        b.y = a.u();
        b = this.oa;
        b.x = a.u();
        b.y = a.u();
        this.Z = a.u();
        this.m = a.u();
        this.aa = a.u();
        this.Ca = a.u();
        this.R = a.hb();
        this.h = a.M();
        this.v = a.M();
      },
      */
      Pn: function (id1, id2, a, pObj) {
        var b = this.a,
          c = a.a,
          d = b.x - c.x,
          b = b.y - c.y,
          e = a.Z + this.Z,
          f = d * d + b * b;
        if (0 < f && f <= e * e) {
          var oldA = a; // oldA
          var f = Math.sqrt(f),
            d = d / f,
            b = b / f,
            c = this.aa / (this.aa + a.aa),
            e = e - f,
            f = e * c,
            g = this.a,
            k = this.a;
          g.x = k.x + d * f;
          g.y = k.y + b * f;
          k = g = a.a;
          e -= f;
          g.x = k.x - d * e;
          g.y = k.y - b * e;
          e = this.D;
          f = a.D;
          e = d * (e.x - f.x) + b * (e.y - f.y);
          0 > e &&
            ((e *= this.m * a.m + 1),
            (c *= e),
            (g = f = this.D),
            (f.x = g.x - d * c),
            (f.y = g.y - b * c),
            (a = f = a.D),
            (c = e - c),
            (f.x = a.x + d * c),
            (f.y = a.y + b * c),
            (pObj._CDD_ && pObj._CDD_(id1, this.playerId, id2, oldA.playerId))); // (FIX)
        }
      },
      Qn: function (a, id1, id2, pObj) {
        var b, c, d;
        if (0 != 0 * a.vb) {
          b = a.W.a;
          var e = a.ca.a;
          c = e.x - b.x;
          var f = e.y - b.y,
            g = this.a;
          d = g.x - e.x;
          e = g.y - e.y;
          g = this.a;
          if (0 >= (g.x - b.x) * c + (g.y - b.y) * f || 0 <= d * c + e * f)
            return;
          c = a.wa;
          b = c.x;
          c = c.y;
          d = b * d + c * e;
        } else {
          c = a.Xd;
          d = this.a;
          b = d.x - c.x;
          c = d.y - c.y;
          d = a.Hg;
          e = a.Ig;
          if ((0 < d.x * b + d.y * c && 0 < e.x * b + e.y * c) == 0 >= a.vb)
            return;
          e = Math.sqrt(b * b + c * c);
          if (0 == e) return;
          d = e - a.Yj;
          b /= e;
          c /= e;
        }
        e = a.Cc;
        if (0 == e) 0 > d && ((d = -d), (b = -b), (c = -c));
        else if ((0 > e && ((e = -e), (d = -d), (b = -b), (c = -c)), d < -e))
          return;
        d >= this.Z ||
          ((d = this.Z - d),
          (f = e = this.a),
          (e.x = f.x + b * d),
          (e.y = f.y + c * d),
          (d = this.D),
          (d = b * d.x + c * d.y),
          0 > d &&
            ((d *= this.m * a.m + 1),
            (e = a = this.D),
            (a.x = e.x - b * d),
            (a.y = e.y - c * d),
            (pObj._CDS_ && pObj._CDS_(id1, this.playerId, id2-1)))); // discId, discPlayerId, segmentId (FIX)
      },
      addVelocity: function(xc, yc){ // xc: dist_x/dist, yc: dist_y/dist
        var h = this.D;
        h.x += xc;
        h.y += yc;
      },
      applyForce: function(force, xc, yc){ // xc: dist_x/dist, yc: dist_y/dist
        var h = this.D, l = this.aa;
        h.x += force * xc * l;
        h.y += force * yc * l;
      },
      isMoving: function(){
        var h = this.D;
        return h.x * h.x + h.y * h.y > 0;
      }
      /*
      sc: function () {
        var a = yazc,
          b = this.gc;
        this.hc != a &&
          (null == b && (this.gc = b = new MoveableCircularObject()), (this.hc = a), MoveableCircularObject.qd(b, this));
        return b;
      },
      f: MoveableCircularObject,
      */
    };

    function World() { // Fa
      //this.hc = -1;
      //this.gc = null;
      this.F = [];
      this.J = [];
      this.qa = [];
      this.U = [];
      this.pb = [];
      this.tc = [];
    }
    /*
    World.b = !0;
    World.qd = function (a, b) {
      if (null == b.F) a.F = null;
      else {
        null == a.F && (a.F = []);
        for (var c = a.F, d = b.F, e = d.length; c.length > e; ) c.pop();
        for (var e = 0, f = d.length; e < f; ) {
          var g = e++;
          c[g] = d[g].sc();
        }
      }
      a.J = b.J;
      a.U = b.U;
      a.qa = b.qa;
      a.pb = b.pb;
    };
    */
    World.prototype = {
      /*
      ga: function (a) {
        a.l(this.F.length);
        for (var b = 0, c = this.F.length; b < c; ) {
          var d = b++,
            e = this.F[d];
          e.jl = d;
          e.ga(a);
        }
      },
      ja: function (a) {
        this.F = [];
        for (var b = a.B(), c = 0; c < b; ) {
          ++c;
          var d = new MoveableCircularObject();
          d.ja(a);
          this.F.push(d);
        }
      },
      */
      C: function (a, pObj) {
        for (var b = 0, c = this.F; b < c.length; ) {
          var d = c[b];
          ++b;
          var e = d.a,
            f = d.a,
            g = d.D;
          e.x = f.x + g.x * a;
          e.y = f.y + g.y * a;
          f = e = d.D;
          g = d.oa;
          d = d.Ca;
          e.x = (f.x + g.x) * d;
          e.y = (f.y + g.y) * d;
        }
        a = 0;
        for (b = this.F.length; a < b; ) {
          d = a++;
          var id = d;
          c = this.F[d];
          d += 1;
          for (e = this.F.length; d < e; )
            (f = this.F[d++]), 0 != (f.h & c.v) && 0 != (f.v & c.h) && c.Pn(id, d-1, f, pObj);
          if (0 != c.aa) {
            d = 0;
            for (e = this.qa; d < e.length; )
              if (((f = e[d]), ++d, 0 != (f.h & c.v) && 0 != (f.v & c.h))) {
                var g = f.wa,
                  k = c.a,
                  g = f.Ua - (g.x * k.x + g.y * k.y) + c.Z;
                if (0 < g) {
                  var l = (k = c.a),
                    h = f.wa;
                  k.x = l.x + h.x * g;
                  k.y = l.y + h.y * g;
                  g = c.D;
                  k = f.wa;
                  g = g.x * k.x + g.y * k.y;
                  0 > g &&
                    ((g *= c.m * f.m + 1),
                    (l = k = c.D),
                    (f = f.wa),
                    (k.x = l.x - f.x * g),
                    (k.y = l.y - f.y * g),
                    (pObj._CDP_ && pObj._CDP_(id, c.playerId, d-1))); // discId, discPlayerId, planeId
                }
              }
            d = 0;
            for (e = this.U; d < e.length; )
              (f = e[d]), ++d, 0 != (f.h & c.v) && 0 != (f.v & c.h) && c.Qn(f, id, d, pObj);
            d = 0;
            for (e = this.J; d < e.length; )
              if (
                ((f = e[d]),
                ++d,
                0 != (f.h & c.v) &&
                  0 != (f.v & c.h) &&
                  ((k = c.a),
                  (l = f.a),
                  (g = k.x - l.x),
                  (k = k.y - l.y),
                  (l = g * g + k * k),
                  0 < l && l <= c.Z * c.Z))
              ) {
                var l = Math.sqrt(l),
                  g = g / l,
                  k = k / l,
                  l = c.Z - l,
                  m = (h = c.a);
                h.x = m.x + g * l;
                h.y = m.y + k * l;
                l = c.D;
                l = g * l.x + k * l.y;
                0 > l &&
                  ((l *= c.m * f.m + 1),
                  (h = f = c.D),
                  (f.x = h.x - g * l),
                  (f.y = h.y - k * l));
              }
          }
        }
        for (a = 0; 2 > a; )
          for (++a, b = 0, c = this.pb; b < c.length; ) c[b++].C(this.F);
      },

      aMCO: function (obj) { // addMoveableCircularObject
        this.F.push(obj);
      },

      rMCO: function (obj) { // removeMoveableCircularObject
        D.remove(this.F, obj);
      },

      /*
      sc: function () {
        var a = yazc,
          b = this.gc;
        this.hc != a &&
          (null == b && (this.gc = b = new World()), (this.hc = a), World.qd(b, this));
        return b;
      },
      */
      /*
      addVertex: function(a){ // data: { x: number, y: number, bCoef: number, cMask: array of string, cGroup: array of string }
        var b = new DotObject();
        b.a.x = a.x;
        b.a.y = a.y;
        var c = a.bCoef; null != c && (b.m = c);
        c = a.cMask; null != c && (b.h = c);
        a = a.cGroup; null != a && (b.v = a);
        this.J.push(b);
        return b;
      },
  
      addSegment: function(data) { // data: { vertex0: Vertex, vertex1: Vertex, v0: number (if vertex0 is not provided), v1: number (if vertex1 is not provided), color: ("transparent" || string || [r: number, g: number, b: number]), bias: number, (curve: number || curveF: number), vis: boolean, bCoef: number, cMask: array of string, cGroup: array of string }
        var c = new FiniteLinearObject();
        c.W = data.vertex0 || this.J[data.v0];
        c.ca = data.vertex1 || this.J[data.v1];
        var d = data.bias,
          e = data.bCoef,
          f = data.curve,
          g = data.curveF,
          k = data.vis,
          l = data.cMask,
          t = data.cGroup,
          m = data.color;
        null != d && (c.Cc = d);
        null != e && (c.m = e);
        null != g ? (c.vb = g) : null != f && c.Oc(f);
        null != k && (c.Za = k);
        null != l && (c.h = l);
        null != t && (c.v = t);
        null != m && (c.R = m);
        c.he();
        this.U.push(c);
        return c;
      },
  
      addGoal: function(data) { // data: { p0: [x: number, y: number], p1: [x: number, y: number], team: Team }
        var b = new FiniteLinearSensor(),
          c = data.p0,
          d = data.p1,
          e = b.W;
        e.x = c[0];
        e.y = c[1];
        c = b.ca;
        c.x = d[0];
        c.y = d[1];
        b.qe = data.team;
        this.tc.push(b);
        return b;
      },
  
      addPlane: function(data) { // data: { normal: [x: number, y: number], dist: number, bCoef: number, cMask: array of string, cGroup: array of string }
        var b = new InfiniteLinearObject(),
          c = data.normal,
          d = c[0],
          c = c[1],
          e = b.wa,
          f = Math.sqrt(d * d + c * c);
        e.x = d / f;
        e.y = c / f;
        b.Ua = data.dist;
        d = data.bCoef;
        c = data.cMask;
        data = data.cGroup;
        null != d && (b.m = d);
        null != c && (b.h = c);
        null != data && (b.v = data);
        this.qa.push(b);
        return b;
      },
  
      addDisc: function(data) { // data: { pos: [x: number, y: number], speed: [x: number, y: number], gravity: [x: number, y: number], radius: number, invMass: number, damping: number, color: ("transparent" || string || [r: number, g: number, b: number]), bCoef: number, cMask: array of string, cGroup: array of string }
        var disc = new MoveableCircularObject();
        var c = data.pos,
          d = data.speed,
          e = data.gravity,
          f = data.radius,
          g = data.bCoef,
          k = data.invMass,
          l = data.damping,
          t = data.color,
          m = data.cMask,
          n = data.cGroup, p;
        null != c && ((p = disc.a), (p.x = c[0]), (p.y = c[1]));
        null != d && ((c = disc.D), (c.x = d[0]), (c.y = d[1]));
        null != e && ((d = disc.oa), (d.x = e[0]), (d.y = e[1]));
        null != f && (disc.Z = f);
        null != g && (disc.m = g);
        null != k && (disc.aa = k);
        null != l && (disc.Ca = l);
        null != t && (disc.R = t);
        null != m && (disc.h = m);
        null != n && (disc.v = n);
        this.F.push(disc);
        return disc;
      },
  
      addJoint: function(data) { // data: { d0: number, d1: number, color: ("transparent" || string || [r: number, g: number, b: number]), strength: "rigid" || number, length: null || number || [min: number, max: number] }
        var c = new DistanceConstraint(),
          d = vvt(data.d0, Integer),
          e = vvt(data.d1, Integer),
          f = data.color,
          g = data.strength,
          k = data.length;
        if (d >= this.F.length || 0 > d) throw new q(null);
        if (e >= this.F.length || 0 > e) throw new q(null);
        c.Yd = d;
        c.Zd = e;
        null == k
          ? ((d = this.F[d]),
            (k = this.F[e]),
            null == d || null == k
              ? (c.ec = c.Hb = 100)
              : ((e = d.pos),
                (k = k.pos),
                (d = e.x - k.x),
                (e = e.y - k.y),
                (c.ec = c.Hb = Math.sqrt(d * d + e * e))))
          : k instanceof Array
          ? ((c.Hb = k[0]), (c.ec = k[1]))
          : (c.ec = c.Hb = k);
        c.ne = null == g || "rigid" == g ? 1 / 0 : g;
        null != f && (c.R = f);
        this.pb.push(c);
        return c;
      },
      */
      //f: World,
    };
    return {
      World,
      DotObject,
      FiniteLinearObject,
      InfiniteLinearObject,
      FiniteLinearSensor,
      CircularObject,
      DistanceConstraint,
      MoveableCircularObject
    };
  })();

  var { Fa, B, E, L, sb, ua, nb, ca } = (function extendPhysicsEngine(){

    // B

    function B() {
      this.ud = 0;
      PhysicsEngine.DotObject.apply(this);
    };
    B.b = !0;
    B.prototype = C(PhysicsEngine.DotObject.prototype, {
      ga: function (a) {
        var b = this.a;
        a.s(b.x);
        a.s(b.y);
        a.s(this.m);
        a.O(this.h);
        a.O(this.v);
      },
      ja: function (a) {
        var b = this.a;
        b.x = a.u();
        b.y = a.u();
        this.m = a.u();
        this.h = a.M();
        this.v = a.M();
      },
      f: B,
    });

    // E

    function E() {
      PhysicsEngine.FiniteLinearObject.apply(this);
      this.Za = true;
      this.R = 0;
    }
    E.b = !0;
    E.prototype = C(PhysicsEngine.FiniteLinearObject.prototype, {
      ga: function (a) {
        var b = 0,
          c = a.a;
        a.l(0);
        a.l(this.W.ud);
        a.l(this.ca.ud);
        0 != this.Cc && ((b = 1), a.s(this.Cc));
        this.vb != 1 / 0 && ((b |= 2), a.s(this.vb));
        0 != this.R && ((b |= 4), a.O(this.R));
        this.Za && (b |= 8);
        a.o.setUint8(c, b);
        a.s(this.m);
        a.O(this.h);
        a.O(this.v);
      },
      ja: function (a, b) {
        var c = a.B();
        this.W = b[a.B()];
        this.ca = b[a.B()];
        this.Cc = 0 != (c & 1) ? a.u() : 0;
        this.vb = 0 != (c & 2) ? a.u() : 1 / 0;
        this.R = 0 != (c & 4) ? a.M() : 0;
        this.Za = 0 != (c & 8);
        this.m = a.u();
        this.h = a.M();
        this.v = a.M();
      },
      f: E,
    });

    // L
    
    function L() {
      PhysicsEngine.InfiniteLinearObject.apply(this);
    }
    L.b = !0;
    L.prototype = C(PhysicsEngine.InfiniteLinearObject.prototype, {
      ga: function (a) {
        var b = this.wa;
        a.s(b.x);
        a.s(b.y);
        a.s(this.Ua);
        a.s(this.m);
        a.O(this.h);
        a.O(this.v);
      },
      ja: function (a) {
        var b = this.wa;
        b.x = a.u();
        b.y = a.u();
        this.Ua = a.u();
        this.m = a.u();
        this.h = a.M();
        this.v = a.M();
      },
      f: L,
    });

    // sb

    function sb() {
      this.qe = p.Ia;
      PhysicsEngine.FiniteLinearSensor.apply(this);
    }
    sb.b = !0;
    sb.prototype = C(PhysicsEngine.FiniteLinearSensor.prototype, {
      ga: function (a) {
        var b = this.W;
        a.s(b.x);
        a.s(b.y);
        b = this.ca;
        a.s(b.x);
        a.s(b.y);
        a.l(this.qe.$);
      },
      ja: function (a) {
        var b = this.W;
        b.x = a.u();
        b.y = a.u();
        b = this.ca;
        b.x = a.u();
        b.y = a.u();
        a = a.lf();
        this.qe = 1 == a ? p.fa : 2 == a ? p.xa : p.Ia;
      },
      f: sb,
    });

    // ua
    
    function ua() {
      // this.R = 16777215;
      PhysicsEngine.CircularObject.apply(this);
    }
    ua.b = !0;
    ua.prototype = C(PhysicsEngine.CircularObject.prototype, {
      ga: function (a) {
        var b = this.a;
        a.s(b.x);
        a.s(b.y);
        b = this.D;
        a.s(b.x);
        a.s(b.y);
        b = this.oa;
        a.s(b.x);
        a.s(b.y);
        a.s(this.Z);
        a.s(this.m);
        a.s(this.aa);
        a.s(this.Ca);
        a.tb(this.R);
        a.O(this.h);
        a.O(this.v);
      },
      ja: function (a) {
        var b = this.a;
        b.x = a.u();
        b.y = a.u();
        b = this.D;
        b.x = a.u();
        b.y = a.u();
        b = this.oa;
        b.x = a.u();
        b.y = a.u();
        this.Z = a.u();
        this.m = a.u();
        this.aa = a.u();
        this.Ca = a.u();
        this.R = a.hb();
        this.h = a.M();
        this.v = a.M();
      },
      rp: function () {
        var a = new ca();
        this.Bk(a);
        return a;
      },
      Bk: function (a) {
        var b = a.a,
          c = this.a;
        b.x = c.x;
        b.y = c.y;
        b = a.D;
        c = this.D;
        b.x = c.x;
        b.y = c.y;
        b = a.oa;
        c = this.oa;
        b.x = c.x;
        b.y = c.y;
        a.Z = this.Z;
        a.m = this.m;
        a.aa = this.aa;
        a.Ca = this.Ca;
        a.R = this.R;
        a.h = this.h;
        a.v = this.v;
      },
      f: ua,
    });

    // nb
    
    function nb() {
      // this.R = 0;
      PhysicsEngine.DistanceConstraint.apply(this);
    }
    nb.b = !0;
    nb.prototype = C(PhysicsEngine.DistanceConstraint.prototype, {
      ga: function (a) {
        a.l(this.Yd);
        a.l(this.Zd);
        a.s(this.Hb);
        a.s(this.ec);
        a.s(this.ne);
        a.O(this.R);
      },
      ja: function (a) {
        this.Yd = a.B();
        this.Zd = a.B();
        this.Hb = a.u();
        this.ec = a.u();
        this.ne = a.u();
        this.R = a.M();
      },
      f: nb,
    });

    // ca
    
    function ca() {
      this.playerId = null;
      this.hc = -1;
      this.gc = null;
      this.jl = 0;
      // this.R = 16777215;
      PhysicsEngine.MoveableCircularObject.apply(this);
    }
    ca.b = !0;
    ca.qd = function (a, b) {
      a.Z = b.Z;
      a.m = b.m;
      a.aa = b.aa;
      a.Ca = b.Ca;
      a.R = b.R;
      a.h = b.h;
      a.v = b.v;
      var c = a.a,
        d = b.a;
      c.x = d.x;
      c.y = d.y;
      c = a.D;
      d = b.D;
      c.x = d.x;
      c.y = d.y;
      c = a.oa;
      d = b.oa;
      c.x = d.x;
      c.y = d.y;
    };
    ca.prototype = C(PhysicsEngine.MoveableCircularObject.prototype, {
      ga: function (a) {
        var b = this.a;
        a.s(b.x);
        a.s(b.y);
        b = this.D;
        a.s(b.x);
        a.s(b.y);
        b = this.oa;
        a.s(b.x);
        a.s(b.y);
        a.s(this.Z);
        a.s(this.m);
        a.s(this.aa);
        a.s(this.Ca);
        a.tb(this.R);
        a.O(this.h);
        a.O(this.v);
      },
      ja: function (a) {
        var b = this.a;
        b.x = a.u();
        b.y = a.u();
        b = this.D;
        b.x = a.u();
        b.y = a.u();
        b = this.oa;
        b.x = a.u();
        b.y = a.u();
        this.Z = a.u();
        this.m = a.u();
        this.aa = a.u();
        this.Ca = a.u();
        this.R = a.hb();
        this.h = a.M();
        this.v = a.M();
      },
      sc: function () {
        var a = yazc,
          b = this.gc;
        this.hc != a &&
          (null == b && (this.gc = b = new ca()), (this.hc = a), ca.qd(b, this));
        return b;
      },
      f: ca,
    });

    function Fa() {
      this.hc = -1;
      this.gc = null;
      PhysicsEngine.World.apply(this);
    }
    Fa.b = !0;
    Fa.dmc = 1/Math.sqrt(2); // diagonal movement coefficient, Math.SQRT1_2 is causing desync because noob basro did not use it...
    Fa.qd = function (a, b) {
      if (null == b.F) a.F = null;
      else {
        null == a.F && (a.F = []);
        for (var c = a.F, d = b.F, e = d.length; c.length > e; ) c.pop();
        for (var e = 0, f = d.length; e < f; ) {
          var g = e++;
          c[g] = d[g].sc();
        }
      }
      a.J = b.J;
      a.U = b.U;
      a.qa = b.qa;
      a.pb = b.pb;
    };
    Fa.prototype = C(PhysicsEngine.World.prototype, {
      ga: function (a) {
        a.l(this.F.length);
        for (var b = 0, c = this.F.length; b < c; ) {
          var d = b++,
            e = this.F[d];
          e.jl = d;
          e.ga(a);
        }
      },
      ja: function (a) {
        this.F = [];
        for (var b = a.B(), c = 0; c < b; ) {
          ++c;
          var d = new ca();
          d.ja(a);
          this.F.push(d);
        }
      },
      sc: function () {
        var a = yazc,
          b = this.gc;
        this.hc != a &&
          (null == b && (this.gc = b = new Fa()), (this.hc = a), Fa.qd(b, this));
        return b;
      },
      kB: function (pDisc, bDisc, pp) { // kickBall()
        var t = bDisc.a, h = pDisc.a, m = t.x - h.x, t = t.y - h.y, h = Math.sqrt(m * m + t * t);
        if (h - bDisc.Z - pDisc.Z >= 4)
          return false;
        var f = m / h, // dist_x/dist
          m = t / h; // dist_y/dist
        bDisc.applyForce(pp.Re, f, m); // kickStrength
        pDisc.applyForce(-pp.Se, f, m); // kickback
        return true;
      },
      mP: function (pObj, pp) { // movePlayer(playerObj, playerPhysics)
        var f = pObj.ob;
        // pObj.Wb = (f&16)>0; (this was assigned before coming here.)
        var g = ((f&8)>0)-((f&4)>0), g0 = g==0;
        var k = ((f&2)>0)-((f&1)>0), k0 = k==0;
        if (!g0 && !k0){
          g *= Fa.dmc;
          k *= Fa.dmc;
        }
        f = pObj.Wb;
        if (!g0 || !k0){
          k0 = f ? pp.Te : pp.Ce;
          pObj.H.addVelocity(g*k0, k*k0);
        }
        pObj.H.Ca = f ? pp.Ue : pp.Ca;
      },
      rP: function (pObj, cb) { // removePlayer(playerObj, callback)
        if (!pObj.H)
          return;
        this.rMCO(pObj.H);
        cb?.(pObj);
        pObj.H = null;
      },
      aP: function (pObj, stadium, cb1, cb2) { // addPlayer(playerObj)
        this.rP(pObj, cb2);
        pObj.ob = 0;
        var b = new ca();
        b.playerId = pObj.V;
        pObj.H = b;
        this.aMCO(b);
        cb1?.(pObj);
        var c = stadium.ge;
        b.R = 0;
        b.Z = c.Z;
        b.aa = c.aa;
        b.Ca = c.Ca;
        b.m = c.m;
        b.h = 39;
        b.v = pObj.ea.v | c.v;
        var d = pObj.ea == p.fa ? stadium.Dd : stadium.md;
        0 == d.length ? ((b.a.x = pObj.ea.Ch * stadium.$b), (b.a.y = 0)) : ((cb1 = b.a), (d = d[d.length - 1]), (cb1.x = d.x), (cb1.y = d.y));
        d = b.D;
        d.x = 0;
        d.y = 0;
        b = b.oa;
        c = c.oa;
        b.x = c.x;
        b.y = c.y;
      },
      /*
      addVertex: function(a){ // data: { x: number, y: number, bCoef: number, cMask: array of string, cGroup: array of string }
        var b = new B();
        b.a.x = a.x;
        b.a.y = a.y;
        var c = a.bCoef; null != c && (b.m = c);
        c = a.cMask; null != c && (b.h = c);
        a = a.cGroup; null != a && (b.v = a);
        this.J.push(b);
        return b;
      },
  
      addSegment: function(data) { // data: { vertex0: Vertex, vertex1: Vertex, v0: number (if vertex0 is not provided), v1: number (if vertex1 is not provided), color: ("transparent" || string || [r: number, g: number, b: number]), bias: number, (curve: number || curveF: number), vis: boolean, bCoef: number, cMask: array of string, cGroup: array of string }
        var c = new E();
        c.W = data.vertex0 || this.J[data.v0];
        c.ca = data.vertex1 || this.J[data.v1];
        var d = data.bias,
          e = data.bCoef,
          f = data.curve,
          g = data.curveF,
          k = data.vis,
          l = data.cMask,
          t = data.cGroup,
          m = data.color;
        null != d && (c.Cc = d);
        null != e && (c.m = e);
        null != g ? (c.vb = g) : null != f && c.Oc(f);
        null != k && (c.Za = k);
        null != l && (c.h = l);
        null != t && (c.v = t);
        null != m && (c.R = m);
        c.he();
        this.U.push(c);
        return c;
      },
  
      addGoal: function(data) { // data: { p0: [x: number, y: number], p1: [x: number, y: number], team: Team }
        var b = new sb(),
          c = data.p0,
          d = data.p1,
          e = b.W;
        e.x = c[0];
        e.y = c[1];
        c = b.ca;
        c.x = d[0];
        c.y = d[1];
        b.qe = data.team;
        this.tc.push(b);
        return b;
      },
  
      addPlane: function(data) { // data: { normal: [x: number, y: number], dist: number, bCoef: number, cMask: array of string, cGroup: array of string }
        var b = new L(),
          c = data.normal,
          d = c[0],
          c = c[1],
          e = b.wa,
          f = Math.sqrt(d * d + c * c);
        e.x = d / f;
        e.y = c / f;
        b.Ua = data.dist;
        d = data.bCoef;
        c = data.cMask;
        data = data.cGroup;
        null != d && (b.m = d);
        null != c && (b.h = c);
        null != data && (b.v = data);
        this.qa.push(b);
        return b;
      },
  
      addDisc: function(data) { // data: { pos: [x: number, y: number], speed: [x: number, y: number], gravity: [x: number, y: number], radius: number, invMass: number, damping: number, color: ("transparent" || string || [r: number, g: number, b: number]), bCoef: number, cMask: array of string, cGroup: array of string }
        var disc = new ua();
        var c = data.pos,
          d = data.speed,
          e = data.gravity,
          f = data.radius,
          g = data.bCoef,
          k = data.invMass,
          l = data.damping,
          t = data.color,
          m = data.cMask,
          n = data.cGroup;
        if (null != c) {
          var p = disc.a;
          p.x = c[0];
          p.y = c[1];
        }
        null != d && ((c = disc.D), (c.x = d[0]), (c.y = d[1]));
        null != e && ((d = disc.oa), (d.x = e[0]), (d.y = e[1]));
        null != f && (disc.Z = f);
        null != g && (disc.m = g);
        null != k && (disc.aa = k);
        null != l && (disc.Ca = l);
        null != t && (disc.R = t);
        null != m && (disc.h = m);
        null != n && (disc.v = n);
        disc = disc.rp(); // convert to movable disc.
        this.F.push(disc);
        return disc;
      },
  
      addJoint: function(data) { // data: { d0: number, d1: number, color: ("transparent" || string || [r: number, g: number, b: number]), strength: "rigid" || number, length: null || number || [min: number, max: number] }
        var c = new nb(),
          d = vvt(data.d0, Integer),
          e = vvt(data.d1, Integer),
          f = data.color,
          g = data.strength,
          k = data.length;
        if (d >= this.F.length || 0 > d) throw new q(null);
        if (e >= this.F.length || 0 > e) throw new q(null);
        c.Yd = d;
        c.Zd = e;
        null == k
          ? ((d = this.F[d]),
            (k = this.F[e]),
            null == d || null == k
              ? (c.ec = c.Hb = 100)
              : ((e = d.pos),
                (k = k.pos),
                (d = e.x - k.x),
                (e = e.y - k.y),
                (c.ec = c.Hb = Math.sqrt(d * d + e * e))))
          : k instanceof Array
          ? ((c.Hb = k[0]), (c.ec = k[1]))
          : (c.ec = c.Hb = k);
        c.ne = null == g || "rigid" == g ? 1 / 0 : g;
        null != f && (c.R = f);
        this.pb.push(c);
        return c;
      },
      */
      f: Fa,
    });
  
    Fa.fromStadium = (stadium) => {
      var fa = new Fa();
      fa.J = stadium.J;
      fa.U = stadium.U;
      fa.tc = stadium.tc;
      fa.qa = stadium.qa;
      fa.pb = stadium.pb;
      stadium.F.forEach((f)=>{
        var disc = new ca();
        disc.a.x = f.a.x;
        disc.a.y = f.a.y;
        disc.D.x = f.D.x;
        disc.D.y = f.D.y;
        disc.oa.x = f.oa.x;
        disc.oa.y = f.oa.y;
        disc.Z = f.Z;
        disc.m = f.m;
        disc.aa = f.aa;
        disc.Ca = f.Ca;
        disc.R = f.R;
        disc.h = f.h;
        disc.v = f.v;
        fa.F.push(disc);
        return disc;
      });
      return fa;
    };

    return {B, E, L, sb, ua, nb, ca, Fa};
  })();
/*
  var { 
    World: Fa, 
    DotObject: B, 
    FiniteLinearObject: E,
    InfiniteLinearObject: L,
    FiniteLinearSensor: sb,
    CircularObject: ua,
    DistanceConstraint: nb,
    MoveableCircularObject: ca
  } = PhysicsEngine;
*/
  function O() {
    this.hc = -1;
    this.gc = null;
    this.Pb = this.Kb = this.Hc = this.Oa = 0;
    this.ae = p.fa;
    this.vc = this.Bb = 0;
    this.ta = new Fa();
    this.Da = 0;
    this.ib = 5;
    this.S = null;
    this.Ma = null;
  }
  function fa() {
    this.hc = -1;
    this.gc = null;
    this.S = null;
    this.yd = 2;
    this.Zc = 0;
    this.ce = 1;
    this.ib = this.Da = 3;
    this.Pc = !1;
    this.K = null;
    this.I = [];
    this.jc = "";
    this.S = h.Kh()[0];
    this.kb = [null, new ka(), new ka()];
    this.kb[1].fb.push(p.fa.R);
    this.kb[2].fb.push(p.xa.R);
    if (config.fixNames)
      this.getPlayer = this.na;
  }

  //////////////////////////////////////////////////////////

  ka.b = !0;
  ka.prototype = {
    ga: function (a) {
      a.l(this.hd);
      a.O(this.ed);
      a.l(this.fb.length);
      for (var b = 0, c = this.fb; b < c.length; ) a.O(c[b++]);
    },
    ja: function (a) {
      this.hd = a.B();
      this.ed = a.M();
      var b = a.B();
      if (3 < b) throw new q(createError(ErrorCodes.TeamColorsReadError)); // "too many"
      this.fb = [];
      for (var c = 0; c < b; ) ++c, this.fb.push(a.M());
    },
    copy: function(){
      var a = new ka();
      a.hd = this.hd;
      a.ed = this.ed;
      a.fb = this.fb.slice();
      return a;
    },
    f: ka,
  };

  p.b = !0;
  p.prototype = { f: p };
  p.spec = p.Ia = new p(0, 16777215, 0, -1, 0);
  p.red = p.fa = new p(1, 15035990, -1, 8, 2);
  p.blue = p.xa = new p(2, 5671397, 1, 16, 4);
  p.byId = [
    p.Ia,
    p.fa,
    p.xa
  ];

  H.b = !0;
  H.prototype = { f: H };

  T.b = !0;
  T.Hh = function (a) {
    return T.Rf(JSON.parse(a));
  };
  T.Rf = function (a) {
    var b = new T();
    b.Ec = a.lat;
    b.Gc = a.lon;
    b.ub = a.code.toLowerCase();
    return b;
  };
  T.Fo = () => M.tk(httpUrl + "api/geo").then(T.Rf);
  T.prototype = {
    se: function () {
      return JSON.stringify({ lat: this.Ec, lon: this.Gc, code: this.ub });
    },
    f: T,
  };

  Eb.b = !0;
  Eb.prototype = {
    ga: function (a) {
      a.s(this.m);
      a.s(this.aa);
      a.s(this.Ca);
      a.s(this.Ce);
      a.s(this.Te);
      a.s(this.Ue);
      a.s(this.Re);
      var b = this.oa;
      a.s(b.x);
      a.s(b.y);
      a.O(this.v);
      a.s(this.Z);
      a.s(this.Se);
    },
    ja: function (a) {
      this.m = a.u();
      this.aa = a.u();
      this.Ca = a.u();
      this.Ce = a.u();
      this.Te = a.u();
      this.Ue = a.u();
      this.Re = a.u();
      var b = this.oa;
      b.x = a.u();
      b.y = a.u();
      this.v = a.M();
      this.Z = a.u();
      this.Se = a.u();
    },
    f: Eb,
  };

  ea.b = !0;
  ea.$r = function (a, b) {
    a.cb = b.cb;
    a.Jb = b.Jb;
    a.Xb = b.Xb;
    a.Jd = b.Jd;
    a.Ld = b.Ld;
    a.Kd = b.Kd;
    a.Ug = b.Ug;
    a.yb = b.yb;
    a.w = b.w;
    a.ob = b.ob;
    a.V = b.V;
    a.Wb = b.Wb;
    a.yc = b.yc;
    a.Sc = b.Sc;
    a.H = null == b.H ? null : b.H.sc();
    if (a.H)
      a.H.playerId = a.V;
    a.ea = b.ea;
  };
  ea.prototype = {
    ua: function (a) {
      a.l(this.cb ? 1 : 0);
      a.O(this.Jb);
      a.Db(this.Xb);
      a.Db(this.Jd);
      a.l(this.Ld ? 1 : 0);
      a.Db(this.Kd);
      a.O(this.Ug);
      a.Db(this.w);
      a.O(this.ob);
      a.lb(this.V);
      a.l(this.Wb ? 1 : 0);
      a.Xi(this.yc);
      a.l(this.Sc);
      a.l(this.ea.$);
      a.Xi(null == this.H ? -1 : this.H.jl);
    },
    va: function (a, b) {
      this.cb = 0 != a.B();
      this.Jb = a.M();
      this.Xb = a.zb();
      this.Jd = a.zb();
      this.Ld = 0 != a.B();
      this.Kd = a.zb();
      this.Ug = a.M();
      this.w = a.zb();
      this.ob = a.M();
      this.V = a.Ab();
      this.Wb = 0 != a.B();
      this.yc = a.ni();
      this.Sc = a.B();
      var c = a.lf();
      this.ea = 1 == c ? p.fa : 2 == c ? p.xa : p.Ia;
      c = a.ni();
      this.H = 0 > c ? null : b[c];
      if (this.H)
        this.H.playerId = this.V;   // c = discId -> disc[discId].playerId = playerId
    },
    hs: function () {
      var a = yazc,
        b = this.an;
      this.zc != a &&
        (null == b && (this.an = b = new ea()), (this.zc = a), ea.$r(b, this));
      return b;
    },
    f: ea,
  };

  K.b = !0;
  K.parseInt = function (a) {
    a = parseInt(
      a,
      !a || "0" != a[0] || ("x" != a[1] && "X" != a[1]) ? 10 : 16
    );
    return isNaN(a) ? null : a;
  };

  F.b = !0;
  F.jo = function (a, b) {
    var c = a.getUint8(b),
      d,
      e,
      f,
      g,
      k,
      l = b;
    if (0 == (c & 128)) ++b;
    else if (192 == (c & 224))
      (d = a.getUint8(b + 1)), (c = ((c & 31) << 6) | (d & 63)), (b += 2);
    else if (224 == (c & 240))
      (d = a.getUint8(b + 1)),
        (e = a.getUint8(b + 2)),
        (c = ((c & 15) << 12) | ((d & 63) << 6) | (e & 63)),
        (b += 3);
    else if (240 == (c & 248))
      (d = a.getUint8(b + 1)),
        (e = a.getUint8(b + 2)),
        (f = a.getUint8(b + 3)),
        (c = ((c & 7) << 18) | ((d & 63) << 12) | ((e & 63) << 6) | (f & 63)),
        (b += 4);
    else if (248 == (c & 252))
      (d = a.getUint8(b + 1)),
        (e = a.getUint8(b + 2)),
        (f = a.getUint8(b + 3)),
        (g = a.getUint8(b + 4)),
        (c =
          ((c & 3) << 24) |
          ((d & 63) << 18) |
          ((e & 63) << 12) |
          ((f & 63) << 6) |
          (g & 63)),
        (b += 5);
    else if (252 == (c & 254))
      (d = a.getUint8(b + 1)),
        (e = a.getUint8(b + 2)),
        (f = a.getUint8(b + 3)),
        (g = a.getUint8(b + 4)),
        (k = a.getUint8(b + 5)),
        (c =
          ((c & 1) << 30) |
          ((d & 63) << 24) |
          ((e & 63) << 18) |
          ((f & 63) << 12) |
          ((g & 63) << 6) |
          (k & 63)),
        (b += 6);
    else
      throw new q(createError(ErrorCodes.UTF8CharacterDecodeError, b, c)); // "Cannot decode UTF8 character at offset " + b + ": charCode (" + c + ") is invalid"
    return { char: c, length: b - l };
  };
  F.prototype = {
    sb: function (a) {
      null == a && (a = this.o.byteLength - this.a);
      if (this.a + a > this.o.byteLength) throw new q(createError(ErrorCodes.ReadTooMuchError)); // "Read too much"
      var b = new Uint8Array(this.o.buffer, this.o.byteOffset + this.a, a);
      this.a += a;
      return b;
    },
    Cl: function (a) {
      var b = this.sb(a);
      a = new ArrayBuffer(a);
      new Uint8Array(a).set(b);
      return a;
    },
    lf: function () {
      return this.o.getInt8(this.a++);
    },
    B: function () {
      return this.o.getUint8(this.a++);
    },
    ni: function () {
      var a = this.o.getInt16(this.a, this.Sa);
      this.a += 2;
      return a;
    },
    Ob: function () {
      var a = this.o.getUint16(this.a, this.Sa);
      this.a += 2;
      return a;
    },
    M: function () {
      var a = this.o.getInt32(this.a, this.Sa);
      this.a += 4;
      return a;
    },
    hb: function () {
      var a = this.o.getUint32(this.a, this.Sa);
      this.a += 4;
      return a;
    },
    mi: function () {
      var a = this.o.getFloat32(this.a, this.Sa);
      this.a += 4;
      return a;
    },
    u: function () {
      var a = this.o.getFloat64(this.a, this.Sa);
      this.a += 8;
      return a;
    },
    Ab: function () {
      for (
        var a = this.a, b = 0, c, d = 0;
        (c = this.o.getUint8(a + b)),
          5 > b && (d |= ((c & 127) << (7 * b)) >>> 0),
          ++b,
          0 != (c & 128);

      );
      this.a += b;
      return d | 0;
    },
    ie: function (a) {
      var b = this.a,
        c,
        d = "";
      for (a = b + a; b < a; )
        (c = F.jo(this.o, b)),
          (b += c.length),
          (d += String.fromCodePoint(c["char"]));
      if (b != a)
        throw new q(createError(ErrorCodes.ReadWrongStringLengthError, (b - a))); // "Actual string length differs from the specified: " + (b - a) +" bytes"
      this.a = b;
      return d;
    },
    zb: function () {
      var a = this.Ab();
      return 0 >= a ? null : this.ie(a - 1);
    },
    ic: function () {
      return this.ie(this.Ab());
    },
    El: function () {
      return this.ie(this.B());
    },
    wg: function () {
      var a = this.ic();
      return JSON.parse(a);
    },
    f: F,
  };

  w.b = !0;
  w.ha = function (a, b) {
    null == b && (b = !1);
    null == a && (a = 16);
    return new w(new DataView(new ArrayBuffer(a)), b);
  };
  w.uo = function (a, b, c) {
    var d = c;
    if (0 > a)
      throw new q(createError(ErrorCodes.EncodeUTF8CharNegativeError, a)); // "Cannot encode UTF8 character: charCode (" + a + ") is negative"
    if (128 > a) b.setUint8(c, a & 127), ++c;
    else if (2048 > a)
      b.setUint8(c, ((a >> 6) & 31) | 192),
        b.setUint8(c + 1, (a & 63) | 128),
        (c += 2);
    else if (65536 > a)
      b.setUint8(c, ((a >> 12) & 15) | 224),
        b.setUint8(c + 1, ((a >> 6) & 63) | 128),
        b.setUint8(c + 2, (a & 63) | 128),
        (c += 3);
    else if (2097152 > a)
      b.setUint8(c, ((a >> 18) & 7) | 240),
        b.setUint8(c + 1, ((a >> 12) & 63) | 128),
        b.setUint8(c + 2, ((a >> 6) & 63) | 128),
        b.setUint8(c + 3, (a & 63) | 128),
        (c += 4);
    else if (67108864 > a)
      b.setUint8(c, ((a >> 24) & 3) | 248),
        b.setUint8(c + 1, ((a >> 18) & 63) | 128),
        b.setUint8(c + 2, ((a >> 12) & 63) | 128),
        b.setUint8(c + 3, ((a >> 6) & 63) | 128),
        b.setUint8(c + 4, (a & 63) | 128),
        (c += 5);
    else if (-2147483648 > a)
      b.setUint8(c, ((a >> 30) & 1) | 252),
        b.setUint8(c + 1, ((a >> 24) & 63) | 128),
        b.setUint8(c + 2, ((a >> 18) & 63) | 128),
        b.setUint8(c + 3, ((a >> 12) & 63) | 128),
        b.setUint8(c + 4, ((a >> 6) & 63) | 128),
        b.setUint8(c + 5, (a & 63) | 128),
        (c += 6);
    else
      throw new q(createError(ErrorCodes.EncodeUTF8CharTooLargeError, a)); // "Cannot encode UTF8 character: charCode (" + a + ") is too large (>= 0x80000000)"
    return c - d;
  };
  w.En = function (a) {
    if (0 > a)
      throw new q(createError(ErrorCodes.CalculateLengthOfUTF8CharNegativeError, a)); // "Cannot calculate length of UTF8 character: charCode (" + a + ") is negative"
    if (128 > a) return 1;
    if (2048 > a) return 2;
    if (65536 > a) return 3;
    if (2097152 > a) return 4;
    if (67108864 > a) return 5;
    if (-2147483648 > a) return 6;
    throw new q(createError(ErrorCodes.CalculateLengthOfUTF8CharTooLargeError, a)); // "Cannot calculate length of UTF8 character: charCode (" + a + ") is too large (>= 0x80000000)"
  };
  w.Kf = function (a) {
    for (var b = 0, c = a.length, d = 0; d < c; ) b += w.En(D.bj(a, d++));
    return b;
  };
  w.Fn = function (a) {
    a >>>= 0;
    return 128 > a
      ? 1
      : 16384 > a
      ? 2
      : 2097152 > a
      ? 3
      : 268435456 > a
      ? 4
      : 5;
  };
  w.prototype = {
    Kg: function () {
      var a = new ArrayBuffer(this.a),
        b = new Uint8Array(this.o.buffer, this.o.byteOffset, this.a);
      new Uint8Array(a).set(b);
      return a;
    },
    Sb: function () {
      return new Uint8Array(this.o.buffer, this.o.byteOffset, this.a);
    },
    Hd: function () {
      return new DataView(this.o.buffer, this.o.byteOffset, this.a);
    },
    Gr: function () {
      return new F(this.Hd(), this.Sa);
    },
    rc: function (a) {
      this.o.byteLength < a &&
        this.Yq(2 * this.o.byteLength >= a ? 2 * this.o.byteLength : a);
    },
    Yq: function (a) {
      if (1 > a) throw new q(createError(ErrorCodes.BufferResizeParameterTooSmallError)); // "Can't resize buffer to a capacity lower than 1"
      if (this.o.byteLength < a) {
        var b = new Uint8Array(this.o.buffer);
        a = new ArrayBuffer(a);
        new Uint8Array(a).set(b);
        this.o = new DataView(a);
      }
    },
    l: function (a) {
      var b = this.a++;
      this.rc(this.a);
      this.o.setUint8(b, a);
    },
    Xi: function (a) {
      var b = this.a;
      this.a += 2;
      this.rc(this.a);
      this.o.setInt16(b, a, this.Sa);
    },
    Ub: function (a) {
      var b = this.a;
      this.a += 2;
      this.rc(this.a);
      this.o.setUint16(b, a, this.Sa);
    },
    O: function (a) {
      var b = this.a;
      this.a += 4;
      this.rc(this.a);
      this.o.setInt32(b, a, this.Sa);
    },
    tb: function (a) {
      var b = this.a;
      this.a += 4;
      this.rc(this.a);
      this.o.setUint32(b, a, this.Sa);
    },
    Wi: function (a) {
      var b = this.a;
      this.a += 4;
      this.rc(this.a);
      this.o.setFloat32(b, a, this.Sa);
    },
    s: function (a) {
      var b = this.a;
      this.a += 8;
      this.rc(this.a);
      this.o.setFloat64(b, a, this.Sa);
    },
    Vb: function (a) {
      var b = this.a;
      this.a += a.byteLength;
      this.rc(this.a);
      new Uint8Array(this.o.buffer, this.o.byteOffset, this.o.byteLength).set(
        a,
        b
      );
    },
    Mg: function (a) {
      this.Vb(new Uint8Array(a));
    },
    mc: function (a) {
      this.lb(w.Kf(a));
      this.Og(a);
    },
    Db: function (a) {
      null == a ? this.lb(0) : (this.lb(w.Kf(a) + 1), this.Og(a));
    },
    Im: function (a) {
      var b = w.Kf(a);
      if (255 < b) throw new q(null);
      this.l(b);
      this.Og(a);
    },
    Ng: function (a) {
      this.mc(JSON.stringify(a));
    },
    Og: function (a) {
      var b = this.a;
      this.rc(b + w.Kf(a));
      for (var c = a.length, d = 0; d < c; ) b += w.uo(D.bj(a, d++), this.o, b);
      this.a = b;
    },
    lb: function (a) {
      var b = this.a;
      a >>>= 0;
      this.rc(b + w.Fn(a));
      this.o.setUint8(b, a | 128);
      128 <= a
        ? (this.o.setUint8(b + 1, (a >> 7) | 128),
          16384 <= a
            ? (this.o.setUint8(b + 2, (a >> 14) | 128),
              2097152 <= a
                ? (this.o.setUint8(b + 3, (a >> 21) | 128),
                  268435456 <= a
                    ? (this.o.setUint8(b + 4, (a >> 28) & 127), (a = 5))
                    : (this.o.setUint8(b + 3, this.o.getUint8(b + 3) & 127),
                      (a = 4)))
                : (this.o.setUint8(b + 2, this.o.getUint8(b + 2) & 127),
                  (a = 3)))
            : (this.o.setUint8(b + 1, this.o.getUint8(b + 1) & 127), (a = 2)))
        : (this.o.setUint8(b, this.o.getUint8(b) & 127), (a = 1));
      this.a += a;
    },
    f: w,
  };

  D.b = !0;
  D.bj = function (a, b) {
    var c = a.charCodeAt(b);
    if (c == c) return c;
  };
  D.substr = function (a, b, c) {
    if (null == c) c = a.length;
    else if (0 > c)
      if (0 == b) c = a.length + c;
      else return "";
    return a.substr(b, c);
  };
  D.remove = function (a, b) {
    var c = a.indexOf(b);
    if (-1 == c) return !1;
    a.splice(c, 1);
    return !0;
  };

  J.b = !0;
  J.startsWith = function (a, b) {
    return a.length >= b.length ? D.substr(a, 0, b.length) == b : !1;
  };
  J.ls = function (a, b) {
    var c = D.bj(a, b);
    return 8 < c && 14 > c ? !0 : 32 == c;
  };
  J.Gs = function (a) {
    for (var b = a.length, c = 0; c < b && J.ls(a, b - c - 1); ) ++c;
    return 0 < c ? D.substr(a, 0, b - c) : a;
  };
  J.replace = function (a, b, c) {
    return a.split(b).join(c);
  };
  J.Vg = function (a, b) {
    for (
      var c = "";
      (c = "0123456789ABCDEF".charAt(a & 15) + c), (a >>>= 4), 0 < a;

    );
    if (null != b) for (; c.length < b; ) c = "0" + c;
    return c;
  };
  J.Wg = function (a, b) {
    const t = "0123456789ABCDEF";
  	return String.fromCharCode((t.indexOf(a)<<4)|(t.indexOf(b)));
  };

  Fb.b = !0;
  Fb.prototype = {
    Pj: function () {
      this.w = tSil(this.w, 40);
      this.ub = tSil(this.ub, 3);
    },
    ga: function (a) {
      this.Pj();
      a.Sa = !0;
      a.Ub(this.Id);
      a.Im(this.w);
      a.Im(this.ub);
      a.Wi(this.Ec);
      a.Wi(this.Gc);
      a.l(this.Ib ? 1 : 0);
      a.l(this.Xe);
      a.l(this.I);
      a.Sa = !1;
    },
    ja: function (a) {
      a.Sa = !0;
      this.Id = a.Ob();
      this.w = a.El();
      this.ub = a.El();
      this.Ec = a.mi();
      this.Gc = a.mi();
      this.Ib = 0 != a.B();
      this.Xe = a.B();
      this.I = a.B();
      a.Sa = !1;
      //if (30 < this.I || 30 < this.Xe) throw new q(null);
      this.Pj();
    },
    f: Fb,
  };

  Wb.b = !0;
  Wb.prototype = { f: Wb };

  M.b = !0;
  M.vj = "application/x-www-form-urlencoded";
  M.Pl = function (a, b, c, d, e) {
    return new Promise(function (f, g) {
      var k = new XMLHttpRequest();
      //if (config.nodeProxy)
      //  k.proxy = config.nodeProxy.host+":"+config.nodeProxy.port;
      k.open(b, a);
      k.responseType = c;
      k.onload = function () {
        200 <= k.status && 300 > k.status
          ? null != k.response
            ? f(k.response)
            : g(null)
          : g("status: " + k.status);
      };
      k.onerror = function (a) {
        g(a);
      };
      null != e && k.setRequestHeader("Content-type", e);
      k.send(d);
    });
  };
  M.L = function (a, b) {
    return M.Pl(a, "GET", b, null);
  };
  M.tk = function (a) {
    return M.L(a, "json").then(function (a) {
      var b = a.error;
      if (null != b) throw new q(b);
      return a.data;
    });
  };
  M.mq = function (a, b, c) {
    return M.Pl(a, "POST", "json", b, c);
  };
  M.zl = function (a, b, c) {
    return M.mq(a, b, c).then(function (a) {
      var b = a.error;
      if (null != b) throw new q(b);
      return a.data;
    });
  };

  h.b = !0;
  h.Fr = w.ha(1024);
  h.ja = function (a) {
    var b = a.B();
    return 255 == b ? ((b = new h()), b.Kr(a), b) : h.Kh()[b];
  };
  h.Kh = function () {
    if (null == h.wb) {
      h.wb = [];
      var a = new h();
      a.ad("Classic", 420, 200, 370, 170, 64, 75);
      h.wb.push(a);
      a = new h();
      a.ad("Easy", 420, 200, 370, 170, 90, 75);
      h.wb.push(a);
      a = new h();
      a.ad("Small", 420, 200, 320, 130, 55, 70);
      h.wb.push(a);
      a = new h();
      a.ad("Big", 600, 270, 550, 240, 80, 80);
      h.wb.push(a);
      a = new h();
      a.ad("Rounded", 420, 200, 370, 170, 64, 75, 75);
      h.wb.push(a);
      a = new h();
      a.Qk("Hockey", 420, 204, 398, 182, 68, 120, 75, 100);
      h.wb.push(a);
      a = new h();
      a.Qk("Big Hockey", 600, 270, 550, 240, 90, 160, 75, 150);
      h.wb.push(a);
      a = new h();
      a.ad("Big Easy", 600, 270, 550, 240, 95, 80);
      h.wb.push(a);
      a = new h();
      a.ad("Big Rounded", 600, 270, 550, 240, 80, 75, 100);
      h.wb.push(a);
      a = new h();
      a.ad("Huge", 750, 350, 700, 320, 100, 80);
      h.wb.push(a);
      for (var a = 0, b = h.wb.length; a < b; ) {
        var c = a++;
        h.wb[c].Bh = c;
      }
    }
    return h.wb;
  };
  h.wn = function (a, b) {
    var c = b[a.trait];
    if (!c)
      return;
    for (var d = 0, e = Object.keys(c); d < e.length; d++) {
      var f = e[d];
      if (a[f]==null)
        a[f] = c[f];
    }
  };
  h.Dn = function (a) {
    if (63 == a) return ["all"];
    var b = [];
    0 != (a & 2) && b.push("red");
    0 != (a & 4) && b.push("blue");
    0 != (a & 1) && b.push("ball");
    0 != (a & 8) && b.push("redKO");
    0 != (a & 16) && b.push("blueKO");
    0 != (a & 32) && b.push("wall");
    0 != (a & 64) && b.push("kick");
    0 != (a & 128) && b.push("score");
    0 != (a & 268435456) && b.push("c0");
    0 != (a & 536870912) && b.push("c1");
    0 != (a & 1073741824) && b.push("c2");
    0 != (a & -2147483648) && b.push("c3");
    return b;
  };
  h.Fc = function (a) {
    a = vvt(a, Array);
    for (var b = 0, c = 0; c < a.length; )
      switch (a[c++]) {
        case "all":
          b |= 63;
          break;
        case "ball":
          b |= 1;
          break;
        case "blue":
          b |= 4;
          break;
        case "blueKO":
          b |= 16;
          break;
        case "c0":
          b |= 268435456;
          break;
        case "c1":
          b |= 536870912;
          break;
        case "c2":
          b |= 1073741824;
          break;
        case "c3":
          b |= -2147483648;
          break;
        case "kick":
          b |= 64;
          break;
        case "red":
          b |= 2;
          break;
        case "redKO":
          b |= 8;
          break;
        case "score":
          b |= 128;
          break;
        case "wall":
          b |= 32;
      }
    return b;
  };
  h.Jc = function (a, b, c, d) {
    c != d && (a[b] = h.Dn(c));
  };
  h.qg = function (a, b, c) {
    b != c && (a.color = h.Rn(b));
  };
  h.Rn = function (a) {
    a |= 0;
    return 0 > a ? "transparent" : J.Vg(a);
  };
  h.$f = function (a) {
    if ("transparent" == a) return -1;
    if ("string" == typeof a) return K.parseInt("0x" + a);
    if (a instanceof Array)
      return ((a[0] | 0) << 16) + ((a[1] | 0) << 8) + (a[2] | 0);
    throw new q(createError(ErrorCodes.BadColorError)); // "Bad color"
  };
  h.Tr = function (a) {
    var b = { x: a.a.x, y: a.a.y };
    h.ka(b, "bCoef", a.m, 1);
    h.Jc(b, "cMask", a.h, 63);
    h.Jc(b, "cGroup", a.v, 32);
    return b;
  };
  h.np = function (a) {
    var b = new B();
    b.a.x = vvt(a.x, Number);
    b.a.y = vvt(a.y, Number);
    var c = a.bCoef;
    null != c && (b.m = vvt(c, Number));
    c = a.cMask;
    null != c && (b.h = h.Fc(c));
    a = a.cGroup;
    null != a && (b.v = h.Fc(a));
    return b;
  };
  h._np_ = function (a) {
    var b = new B();
    b.a.x = vvt(a.x, Number);
    b.a.y = vvt(a.y, Number);
    var c = a.bCoef;
    null != c && (b.m = vvt(c, Number));
    c = a.cMask;
    null != c && (b.h = vvt(c, Integer));
    a = a.cGroup;
    null != a && (b.v = vvt(a, Integer));
    return b;
  };
  h.fr = function (a, b) {
    var c = { v0: a.W.ud, v1: a.ca.ud };
    h.ka(c, "bias", a.Cc, b.Cc);
    h.ka(c, "bCoef", a.m, b.m);
    var d = a.Co();
    h.ka(c, "curve", d, 0);
    0 != d && (c.curveF = a.vb);
    h.ka(c, "vis", a.Za, b.Za);
    h.Jc(c, "cMask", a.h, b.h);
    h.Jc(c, "cGroup", a.v, b.v);
    h.qg(c, a.R, b.R);
    return c;
  };
  h._fr_ = function (roomState, a, b) {
    var [v0, v1] = roomState.findVertexIndicesOfSegmentObj(a);
    var c = { v0, v1 };
    h.ka(c, "bias", a.Cc, b.Cc);
    h.ka(c, "bCoef", a.m, b.m);
    var d = a.Co();
    h.ka(c, "curve", d, 0);
    0 != d && (c.curveF = a.vb);
    h.ka(c, "vis", a.Za, b.Za);
    h.Jc(c, "cMask", a.h, b.h);
    h.Jc(c, "cGroup", a.v, b.v);
    h.qg(c, a.R, b.R);
    return c;
  };
  h.mp = function (a, b) {
    var c = new E(),
      d = vvt(a.v1, Integer);
    c.W = b[vvt(a.v0, Integer)];
    c.ca = b[d];
    var d = a.bias,
      e = a.bCoef,
      f = a.curve,
      g = a.curveF,
      k = a.vis,
      l = a.cMask,
      t = a.cGroup,
      m = a.color;
    null != d && (c.Cc = vvt(d, Number));
    null != e && (c.m = vvt(e, Number));
    null != g ? (c.vb = vvt(g, Number)) : null != f && c.Oc(vvt(f, Number));
    null != k && (c.Za = vvt(k, Boolean));
    null != l && (c.h = h.Fc(l));
    null != t && (c.v = h.Fc(t));
    null != m && (c.R = h.$f(m));
    return c;
  };
  h._mp_ = function (a, b) {
    var c = new E(),
      d = vvt(a.v1, Integer);
    c.W = b[vvt(a.v0, Integer)];
    c.ca = b[d];
    var d = a.bias,
      e = a.bCoef,
      f = a.curve,
      g = a.curveF,
      k = a.vis,
      l = a.cMask,
      t = a.cGroup,
      m = a.color;
    null != d && (c.Cc = vvt(d, Number));
    null != e && (c.m = vvt(e, Number));
    null != g ? (c.vb = vvt(g, Number)) : null != f && c.Oc(vvt(f, Number));
    null != k && (c.Za = vvt(k, Boolean));
    null != l && (c.h = vvt(l, Integer));
    null != t && (c.v = vvt(t, Integer));
    null != m && (c.R = vvt(m, Integer));
    return c;
  };
  h.__mp__ = function (a, b) {
    var c = new E(),
      d = a.v1;
    c.W = a.v0;
    c.ca = d;
    var d = a.bias,
      e = a.bCoef,
      f = a.curve,
      g = a.curveF,
      k = a.vis,
      l = a.cMask,
      t = a.cGroup,
      m = a.color;
    null != d && (c.Cc = vvt(d, Number));
    null != e && (c.m = vvt(e, Number));
    null != g ? (c.vb = vvt(g, Number)) : null != f && c.Oc(vvt(f, Number));
    null != k && (c.Za = vvt(k, Boolean));
    null != l && (c.h = vvt(l, Integer));
    null != t && (c.v = vvt(t, Integer));
    null != m && (c.R = vvt(m, Integer));
    return c;
  };
  h.ap = function (a) {
    var b = { d0: a.Yd, d1: a.Zd, length: a.Hb >= a.ec ? a.Hb : [a.Hb, a.ec] };
    h.qg(b, a.R, 0);
    h.ka(b, "strength", a.ne, 1 / 0);
    return b;
  };
  h.jp = function (a, b) {
    var c = new nb(),
      d = vvt(a.d0, Integer),
      e = vvt(a.d1, Integer),
      f = a.color,
      g = a.strength,
      k = a.length;
    if (d >= b.length || 0 > d) throw new q(null);
    if (e >= b.length || 0 > e) throw new q(null);
    c.Yd = d;
    c.Zd = e;
    null == k
      ? ((d = b[d]),
        (k = b[e]),
        null == d || null == k
          ? (c.ec = c.Hb = 100)
          : ((e = d.a),
            (k = k.a),
            (d = e.x - k.x),
            (e = e.y - k.y),
            (c.ec = c.Hb = Math.sqrt(d * d + e * e))))
      : k instanceof Array
      ? ((c.Hb = vvt(k[0], Number)), (c.ec = vvt(k[1], Number)))
      : (c.ec = c.Hb = vvt(k, Number));
    c.ne = null == g || "rigid" == g ? 1 / 0 : vvt(g, Number);
    null != f && (c.R = h.$f(f));
    return c;
  };
  h._jp_ = function (a, b) {
    var c = new nb(),
      d = vvt(a.d0, Integer),
      e = vvt(a.d1, Integer),
      f = a.color,
      g = a.strength,
      k = a.length;
    if (d >= b.length || 0 > d) throw new q(null);
    if (e >= b.length || 0 > e) throw new q(null);
    c.Yd = d;
    c.Zd = e;
    null == k
      ? ((d = b[d]),
        (k = b[e]),
        null == d || null == k
          ? (c.ec = c.Hb = 100)
          : ((e = d.a),
            (k = k.a),
            (d = e.x - k.x),
            (e = e.y - k.y),
            (c.ec = c.Hb = Math.sqrt(d * d + e * e))))
      : k instanceof Array
      ? ((c.Hb = vvt(k[0], Number)), (c.ec = vvt(k[1], Number)))
      : (c.ec = c.Hb = vvt(k, Number));
    c.ne = null == g || "rigid" == g ? 1 / 0 : vvt(g, Number);
    null != f && (c.R = vvt(f, Integer));
    return c;
  };
  h.__jp__ = function (a, b) {
    var c = new nb(),
      d = a.d0,
      e = a.d1,
      f = a.color,
      g = a.strength,
      k = a.length;
    c.d0Obj = d;
    c.d1Obj = e;
    null == k
      ? ((k = e),
        null == d || null == k
          ? (c.ec = c.Hb = 100)
          : ((e = d.a),
            (k = k.a),
            (d = e.x - k.x),
            (e = e.y - k.y),
            (c.ec = c.Hb = Math.sqrt(d * d + e * e))))
      : k instanceof Array
      ? ((c.Hb = vvt(k[0], Number)), (c.ec = vvt(k[1], Number)))
      : (c.ec = c.Hb = vvt(k, Number));
    c.ne = null == g || "rigid" == g ? 1 / 0 : vvt(g, Number);
    null != f && (c.R = vvt(f, Integer));
    return c;
  };
  h.gq = function (a) {
    var b = { normal: [a.wa.x, a.wa.y], dist: a.Ua };
    h.ka(b, "bCoef", a.m, 1);
    h.Jc(b, "cMask", a.h, 63);
    h.Jc(b, "cGroup", a.v, 32);
    return b;
  };
  h.kp = function (a) {
    var b = new L(),
      c = vvt(a.normal, Array),
      d = vvt(c[0], Number),
      c = vvt(c[1], Number),
      e = b.wa,
      f = Math.sqrt(d * d + c * c);
    e.x = d / f;
    e.y = c / f;
    b.Ua = vvt(a.dist, Number);
    d = a.bCoef;
    c = a.cMask;
    a = a.cGroup;
    null != d && (b.m = vvt(d, Number));
    null != c && (b.h = h.Fc(c));
    null != a && (b.v = h.Fc(a));
    return b;
  };
  h._kp_ = function (a) {
    var b = new L(),
      c = vvt(a.normal, Array),
      d = vvt(c[0], Number),
      c = vvt(c[1], Number),
      e = b.wa,
      f = Math.sqrt(d * d + c * c);
    e.x = d / f;
    e.y = c / f;
    b.Ua = vvt(a.dist, Number);
    d = a.bCoef;
    c = a.cMask;
    a = a.cGroup;
    null != d && (b.m = vvt(d, Number));
    null != c && (b.h = vvt(c, Integer));
    null != a && (b.v = vvt(a, Integer));
    return b;
  };
  h.Jo = function (a) {
    return {
      p0: [a.W.x, a.W.y],
      p1: [a.ca.x, a.ca.y],
      team: a.qe == p.fa ? "red" : "blue",
    };
  };
  h.ip = function (a) {
    var b = new sb(),
      c = vvt(a.p0, Array),
      d = vvt(a.p1, Array),
      e = b.W;
    e.x = c[0];
    e.y = c[1];
    c = b.ca;
    c.x = d[0];
    c.y = d[1];
    switch (a.team) {
      case "blue":
        a = p.xa;
        break;
      case "red":
        a = p.fa;
        break;
      default:
        throw new q(createError(ErrorCodes.BadTeamError)); // "Bad team value"
    }
    b.qe = a;
    return b;
  };
  h.jq = function (a) {
    var b = {};
    h.ka(b, "bCoef", a.m, 0.5);
    h.ka(b, "invMass", a.aa, 0.5);
    h.ka(b, "damping", a.Ca, 0.96);
    h.ka(b, "acceleration", a.Ce, 0.1);
    h.ka(b, "kickingAcceleration", a.Te, 0.07);
    h.ka(b, "kickingDamping", a.Ue, 0.96);
    h.ka(b, "kickStrength", a.Re, 5);
    h.Jc(b, "cGroup", a.v, 0);
    if (0 != a.oa.x || 0 != a.oa.y) b.gravity = [a.oa.x, a.oa.y];
    h.ka(b, "radius", a.Z, 15);
    h.ka(b, "kickback", a.Se, 0);
    return b;
  };
  h.lp = function (a) {
    var b = new Eb(),
      c = a.bCoef,
      d = a.invMass,
      e = a.damping,
      f = a.acceleration,
      g = a.kickingAcceleration,
      k = a.kickingDamping,
      l = a.kickStrength,
      t = a.gravity,
      m = a.cGroup,
      n = a.radius;
    a = a.kickback;
    null != c && (b.m = vvt(c, Number));
    null != d && (b.aa = vvt(d, Number));
    null != e && (b.Ca = vvt(e, Number));
    null != f && (b.Ce = vvt(f, Number));
    null != g && (b.Te = vvt(g, Number));
    null != k && (b.Ue = vvt(k, Number));
    null != l && (b.Re = vvt(l, Number));
    null != t &&
      ((c = b.oa), (d = vvt(t[1], Number)), (c.x = vvt(t[0], Number)), (c.y = d));
    null != m && (b.v = h.Fc(m));
    null != n && (b.Z = vvt(n, Number));
    null != a && (b.Se = vvt(a, Number));
    return b;
  };
  h.mo = function (a, b) {
    var c = {};
    if (a.a.x != b.a.x || a.a.y != b.a.y) c.pos = [a.a.x, a.a.y];
    if (a.D.x != b.D.x || a.D.y != b.D.y) c.speed = [a.D.x, a.D.y];
    if (a.oa.x != b.oa.x || a.oa.y != b.oa.y) c.gravity = [a.oa.x, a.oa.y];
    h.ka(c, "radius", a.Z, b.Z);
    h.ka(c, "bCoef", a.m, b.m);
    h.ka(c, "invMass", a.aa, b.aa);
    h.ka(c, "damping", a.Ca, b.Ca);
    h.qg(c, a.R, b.R);
    h.Jc(c, "cMask", a.h, b.h);
    h.Jc(c, "cGroup", a.v, b.v);
    return c;
  };
  h.Mk = function (a, b) {
    var c = a.pos,
      d = a.speed,
      e = a.gravity,
      f = a.radius,
      g = a.bCoef,
      k = a.invMass,
      l = a.damping,
      t = a.color,
      m = a.cMask,
      n = a.cGroup;
    if (null != c) {
      var p = b.a;
      p.x = c[0];
      p.y = c[1];
    }
    null != d && ((c = b.D), (c.x = d[0]), (c.y = d[1]));
    null != e && ((d = b.oa), (d.x = e[0]), (d.y = e[1]));
    null != f && (b.Z = vvt(f, Number));
    null != g && (b.m = vvt(g, Number));
    null != k && (b.aa = vvt(k, Number));
    null != l && (b.Ca = vvt(l, Number));
    null != t && (b.R = h.$f(t));
    null != m && (b.h = h.Fc(m));
    null != n && (b.v = h.Fc(n));
    return b;
  };
  h._Mk_ = function (a, b) {
    var c = a.pos,
      d = a.speed,
      e = a.gravity,
      f = a.radius,
      g = a.bCoef,
      k = a.invMass,
      l = a.damping,
      t = a.color,
      m = a.cMask,
      n = a.cGroup;
    if (null != c) {
      var p = b.a;
      p.x = c[0];
      p.y = c[1];
    }
    null != d && ((c = b.D), (c.x = d[0]), (c.y = d[1]));
    null != e && ((d = b.oa), (d.x = e[0]), (d.y = e[1]));
    null != f && (b.Z = vvt(f, Number));
    null != g && (b.m = vvt(g, Number));
    null != k && (b.aa = vvt(k, Number));
    null != l && (b.Ca = vvt(l, Number));
    null != t && (b.R = vvt(t, Integer));
    null != m && (b.h = vvt(m, Integer));
    null != n && (b.v = vvt(n, Integer));
    return b;
  };
  h.ka = function (a, b, c, d) {
    c != d && (a[b] = c);
  };
  h.prototype = {
    dg: function () {
      var a = new ua();
      a.R = 16777215;
      a.h = 63;
      a.v = 193;
      a.Z = 10;
      a.Ca = 0.99;
      a.aa = 1;
      a.m = 0.5;
      return a;
    },
    ga: function (a) {
      a.l(this.Bh);
      if (!this.Pe()) {
        a.Db(this.w);
        a.O(this.ld);
        a.s(this.Td);
        a.s(this.Sd);
        a.s(this.kd);
        a.s(this.Uc);
        a.s(this.Fe);
        a.O(this.jd);
        a.s(this.$b);
        a.s(this.qc);
        a.s(this.kc);
        this.ge.ga(a);
        a.Ub(this.Ye);
        a.l(this.Ge);
        a.l(this.Lf ? 1 : 0);
        a.l(this.pf ? 1 : 0);
        a.l(this.J.length);
        for (var b = 0, c = this.J.length; b < c; ) {
          var d = b++,
            e = this.J[d];
          e.ud = d;
          e.ga(a);
        }
        a.l(this.U.length);
        b = 0;
        for (c = this.U; b < c.length; ) c[b++].ga(a);
        a.l(this.qa.length);
        b = 0;
        for (c = this.qa; b < c.length; ) c[b++].ga(a);
        a.l(this.tc.length);
        b = 0;
        for (c = this.tc; b < c.length; ) c[b++].ga(a);
        a.l(this.F.length);
        b = 0;
        for (c = this.F; b < c.length; ) c[b++].ga(a);
        a.l(this.pb.length);
        b = 0;
        for (c = this.pb; b < c.length; ) c[b++].ga(a);
        a.l(this.Dd.length);
        b = 0;
        for (c = this.Dd; b < c.length; ) (d = c[b]), ++b, a.s(d.x), a.s(d.y);
        a.l(this.md.length);
        b = 0;
        for (c = this.md; b < c.length; ) (d = c[b]), ++b, a.s(d.x), a.s(d.y);
      }
    },
    Kr: function (a) {
      function b() {
        for (var b = [], c = a.B(), d = 0; d < c; ) {
          ++d;
          var e = new H(0, 0);
          e.x = a.u();
          e.y = a.u();
          b.push(e);
        }
        return b;
      }
      this.w = a.zb();
      this.ld = a.M();
      this.Td = a.u();
      this.Sd = a.u();
      this.kd = a.u();
      this.Uc = a.u();
      this.Fe = a.u();
      this.jd = a.M();
      this.$b = a.u();
      this.qc = a.u();
      this.kc = a.u();
      this.ge.ja(a);
      this.Ye = a.Ob();
      this.Ge = a.B();
      this.Lf = 0 != a.B();
      this.pf = 0 != a.B();
      this.J = [];
      for (var c = a.B(), d = 0; d < c; ) {
        var e = new B();
        e.ja(a);
        e.ud = d++;
        this.J.push(e);
      }
      this.U = [];
      c = a.B();
      for (d = 0; d < c; ) ++d, (e = new E()), e.ja(a, this.J), this.U.push(e);
      this.qa = [];
      c = a.B();
      for (d = 0; d < c; ) ++d, (e = new L()), e.ja(a), this.qa.push(e);
      this.tc = [];
      c = a.B();
      for (d = 0; d < c; ) ++d, (e = new sb()), e.ja(a), this.tc.push(e);
      this.F = [];
      c = a.B();
      for (d = 0; d < c; ) ++d, (e = new ua()), e.ja(a), this.F.push(e);
      this.pb = [];
      c = a.B();
      for (d = 0; d < c; ) ++d, (e = new nb()), e.ja(a), this.pb.push(e);
      this.Dd = b();
      this.md = b();
      this.he();
    },
    he: function () {
      for (var a = 0, b = this.U; a < b.length; ) b[a++].he();
    },
    Pe: function () {
      return 255 != this.Bh;
    },
    be: function (a, b, c) {
      a = a[b];
      return null != a ? vvt(a, Number) : c;
    },
    op: function (a, b, c) {
      a = a[b];
      return null != a ? vvt(a, Boolean) : c;
    },
    se: function () {
      return JSON.stringify(this.Hr());
    },
    Hr: function () {
      //if (!this.Lf) throw new q(0); // disabled storeable map check
      for (var a = {}, b = 0, c = [], d = 0, e = this.J; d < e.length; ) {
        var f = e[d];
        ++d;
        f.ud = b++;
        c.push(h.Tr(f));
      }
      d = new E();
      b = [];
      e = 0;
      for (f = this.U; e < f.length; ) b.push(h.fr(f[e++], d));
      d = [];
      e = 0;
      for (f = this.qa; e < f.length; ) d.push(h.gq(f[e++]));
      for (var e = [], f = 0, g = this.tc; f < g.length; ) e.push(h.Jo(g[f++]));
      for (
        var f = h.jq(this.ge), k = new ua(), g = [], l = 0, t = this.F;
        l < t.length;

      )
        g.push(h.mo(t[l++], k));
      k = [];
      l = 0;
      for (t = this.pb; l < t.length; ) k.push(h.ap(t[l++]));
      for (var l = [], t = 0, m = this.Dd; t < m.length; ) {
        var n = m[t];
        ++t;
        l.push([n.x, n.y]);
      }
      t = [];
      m = 0;
      for (n = this.md; m < n.length; ) {
        var p = n[m];
        ++m;
        t.push([p.x, p.y]);
      }
      c = {
        name: this.w,
        width: this.$b,
        height: this.qc,
        bg: a,
        vertexes: c,
        segments: b,
        planes: d,
        goals: e,
        discs: g,
        playerPhysics: f,
        ballPhysics: "disc0",
      };
      h.ka(c, "maxViewWidth", this.Ye, 0);
      h.ka(c, "cameraFollow", 1 == this.Ge ? "player" : "", "");
      h.ka(c, "spawnDistance", this.kc, 200);
      0 != k.length && (c.joints = k);
      0 != l.length && (c.redSpawnPoints = l);
      0 != t.length && (c.blueSpawnPoints = t);
      h.ka(c, "kickOffReset", this.pf ? "full" : "partial", "partial");
      switch (this.ld) {
        case 1:
          b = "grass";
          break;
        case 2:
          b = "hockey";
          break;
        default:
          b = "none";
      }
      h.ka(a, "type", b, "none");
      h.ka(a, "width", this.Td, 0);
      h.ka(a, "height", this.Sd, 0);
      h.ka(a, "kickOffRadius", this.kd, 0);
      h.ka(a, "cornerRadius", this.Uc, 0);
      h.qg(a, this.jd, 7441498);
      h.ka(a, "goalLine", this.Fe, 0);
      return c;
    },
    Lk: function (a) {
      function b(a) {
        var b = vvt(a[0], Number);
        a = vvt(a[1], Number);
        return new H(b, a);
      }
      function c(a, b, c, d) {
        null == d && (d = !1);
        var f = e[b];
        if (!d || null != f)
          if (((d = vvt(f, Array)), null != d))
            for (f = 0; f < d.length; ) {
              var k = d[f];
              ++f;
              try {
                h.wn(k, g), a.push(c(k));
              } catch (wc) {
                throw new q(new Bb(createError(ErrorCodes.StadiumParseError, b, a.length))); // 'Error in "' + b + '" index: ' + a.length
              }
            }
      }
      var d = this,
        e = JSON5.parse(a);
      this.J = [];
      this.U = [];
      this.qa = [];
      this.tc = [];
      this.F = [];
      this.pb = [];
      this.w = vvt(e.name, String);
      this.$b = vvt(e.width, Number);
      this.qc = vvt(e.height, Number);
      this.Ye = this.be(e, "maxViewWidth", 0) | 0;
      "player" == e.cameraFollow && (this.Ge = 1);
      this.kc = 200;
      a = e.spawnDistance;
      null != a && (this.kc = vvt(a, Number));
      a = e.bg;
      var f;
      switch (a.type) {
        case "grass":
          f = 1;
          break;
        case "hockey":
          f = 2;
          break;
        default:
          f = 0;
      }
      this.ld = f;
      this.Td = this.be(a, "width", 0);
      this.Sd = this.be(a, "height", 0);
      this.kd = this.be(a, "kickOffRadius", 0);
      this.Uc = this.be(a, "cornerRadius", 0);
      this.jd = 7441498;
      null != a.color && (this.jd = h.$f(a.color));
      this.Fe = this.be(a, "goalLine", 0);
      this.Lf = this.op(e, "canBeStored", !0);
      this.pf = "full" == e.kickOffReset;
      var g = e.traits || {};
      a = e.ballPhysics;
      "disc0" != a &&
        (null != a
          ? ((a = h.Mk(a, this.dg())), (a.v |= 192), this.F.push(a))
          : this.F.push(this.dg()));
      c(this.J, "vertexes", h.np);
      c(this.U, "segments", function (a) {
        return h.mp(a, d.J);
      });
      c(this.tc, "goals", h.ip);
      c(this.F, "discs", function (a) {
        return h.Mk(a, new ua());
      });
      c(this.qa, "planes", h.kp);
      c(
        this.pb,
        "joints",
        function (a) {
          return h.jp(a, d.F);
        },
        !0
      );
      c(this.Dd, "redSpawnPoints", b, !0);
      c(this.md, "blueSpawnPoints", b, !0);
      a = e.playerPhysics;
      null != a && (this.ge = h.lp(a));
      if (
        255 < this.J.length ||
        255 < this.U.length ||
        255 < this.qa.length ||
        255 < this.tc.length ||
        1 > this.F.length ||
        255 < this.F.length
      )
        throw new q(createError(ErrorCodes.StadiumLimitsExceededError)); // "Error"
      this.he();
    },
    Sj: function () {
      var a = h.Fr;
      a.a = 0;
      this.ga(a);
      return cH(a.Sb())
    },
    ad: function (a, b, c, d, e, f, g, k) {
      null == k && (k = 0);
      this.w = a;
      this.F.push(this.dg());
      this.$b = b;
      this.qc = c;
      this.ld = 1;
      this.jd = 7441498;
      this.Td = d;
      this.Sd = e;
      this.kd = g;
      this.Uc = k;
      this.kc = 0.75 * d;
      400 < this.kc && (this.kc = 400);
      a = new L();
      var l = a.wa;
      l.x = 0;
      l.y = 1;
      a.Ua = -c;
      a.m = 0;
      this.qa.push(a);
      a = new L();
      l = a.wa;
      l.x = 0;
      l.y = -1;
      a.Ua = -c;
      a.m = 0;
      this.qa.push(a);
      a = new L();
      l = a.wa;
      l.x = 1;
      l.y = 0;
      a.Ua = -b;
      a.m = 0;
      this.qa.push(a);
      a = new L();
      l = a.wa;
      l.x = -1;
      l.y = 0;
      a.Ua = -b;
      a.m = 0;
      this.qa.push(a);
      this.eg(d, 1, f, 13421823, p.xa);
      this.eg(-d, -1, f, 16764108, p.fa);
      this.Rk(g, c);
      b = new L();
      c = b.wa;
      c.x = 0;
      c.y = 1;
      b.Ua = -e;
      b.h = 1;
      this.qa.push(b);
      b = new L();
      c = b.wa;
      c.x = 0;
      c.y = -1;
      b.Ua = -e;
      b.h = 1;
      this.qa.push(b);
      b = new B();
      c = b.a;
      c.x = -d;
      c.y = -e;
      b.h = 0;
      c = new B();
      g = c.a;
      g.x = d;
      g.y = -e;
      c.h = 0;
      g = new B();
      a = g.a;
      a.x = d;
      a.y = -f;
      g.h = 0;
      a = new B();
      l = a.a;
      l.x = d;
      l.y = f;
      a.h = 0;
      var l = new B(),
        h = l.a;
      h.x = d;
      h.y = e;
      l.h = 0;
      var h = new B(),
        m = h.a;
      m.x = -d;
      m.y = e;
      h.h = 0;
      var m = new B(),
        n = m.a;
      n.x = -d;
      n.y = f;
      m.h = 0;
      var n = new B(),
        q = n.a;
      q.x = -d;
      q.y = -f;
      n.h = 0;
      f = new E();
      f.W = c;
      f.ca = g;
      f.h = 1;
      f.Za = !1;
      q = new E();
      q.W = a;
      q.ca = l;
      q.h = 1;
      q.Za = !1;
      var r = new E();
      r.W = h;
      r.ca = m;
      r.h = 1;
      r.Za = !1;
      var u = new E();
      u.W = n;
      u.ca = b;
      u.h = 1;
      u.Za = !1;
      this.J.push(b);
      this.J.push(c);
      this.J.push(g);
      this.J.push(a);
      this.J.push(l);
      this.J.push(h);
      this.J.push(m);
      this.J.push(n);
      this.U.push(f);
      this.U.push(q);
      this.U.push(r);
      this.U.push(u);
      this.Pk(d, e, k);
      this.he();
    },
    Qk: function (a, b, c, d, e, f, g, k, l) {
      this.w = a;
      this.F.push(this.dg());
      this.$b = b;
      this.qc = c;
      this.ld = 2;
      this.Td = d;
      this.Sd = e;
      this.kd = k;
      this.Uc = l;
      this.Fe = g;
      this.kc = 0.75 * (d - g);
      400 < this.kc && (this.kc = 400);
      a = new L();
      var h = a.wa;
      h.x = 0;
      h.y = 1;
      a.Ua = -c;
      a.m = 0;
      this.qa.push(a);
      a = new L();
      h = a.wa;
      h.x = 0;
      h.y = -1;
      a.Ua = -c;
      a.m = 0;
      this.qa.push(a);
      a = new L();
      h = a.wa;
      h.x = 1;
      h.y = 0;
      a.Ua = -b;
      a.m = 0;
      this.qa.push(a);
      a = new L();
      h = a.wa;
      h.x = -1;
      h.y = 0;
      a.Ua = -b;
      a.m = 0;
      this.qa.push(a);
      this.eg(d - g, 1, f, 13421823, p.xa, 63);
      this.eg(-d + g, -1, f, 16764108, p.fa, 63);
      this.Rk(k, c);
      b = new L();
      c = b.wa;
      c.x = 0;
      c.y = 1;
      b.Ua = -e;
      b.h = 1;
      this.qa.push(b);
      b = new L();
      c = b.wa;
      c.x = 0;
      c.y = -1;
      b.Ua = -e;
      b.h = 1;
      this.qa.push(b);
      b = new L();
      c = b.wa;
      c.x = 1;
      c.y = 0;
      b.Ua = -d;
      b.h = 1;
      this.qa.push(b);
      b = new L();
      c = b.wa;
      c.x = -1;
      c.y = 0;
      b.Ua = -d;
      b.h = 1;
      this.qa.push(b);
      this.Pk(d, e, l);
      this.he();
    },
    eg: function (a, b, c, d, e, f, g) {
      null == g && (g = 32);
      null == f && (f = 1);
      var k = new B(),
        l = k.a;
      l.x = a + 8 * b;
      l.y = -c;
      var l = new B(),
        h = l.a;
      h.x = a + 8 * b;
      h.y = c;
      var m = new B(),
        h = m.a;
      h.x = k.a.x + 22 * b;
      h.y = k.a.y + 22;
      var n = new B(),
        h = n.a;
      h.x = l.a.x + 22 * b;
      h.y = l.a.y - 22;
      h = new E();
      h.W = k;
      h.ca = m;
      h.Oc(90 * b);
      var p = new E();
      p.W = n;
      p.ca = m;
      var q = new E();
      q.W = n;
      q.ca = l;
      q.Oc(90 * b);
      b = this.J.length;
      this.J.push(k);
      this.J.push(l);
      this.J.push(m);
      this.J.push(n);
      k = b;
      for (b = this.J.length; k < b; )
        (l = k++), (this.J[l].h = f), (this.J[l].v = g), (this.J[l].m = 0.1);
      b = this.U.length;
      this.U.push(h);
      this.U.push(p);
      this.U.push(q);
      k = b;
      for (b = this.U.length; k < b; )
        (l = k++), (this.U[l].h = f), (this.U[l].v = g), (this.U[l].m = 0.1);
      f = new ua();
      g = f.a;
      g.x = a;
      g.y = -c;
      f.aa = 0;
      f.Z = 8;
      f.R = d;
      this.F.push(f);
      f = new ua();
      g = f.a;
      g.x = a;
      g.y = c;
      f.aa = 0;
      f.Z = 8;
      f.R = d;
      this.F.push(f);
      d = new sb();
      f = d.W;
      f.x = a;
      f.y = -c;
      f = d.ca;
      f.x = a;
      f.y = c;
      d.qe = e;
      this.tc.push(d);
    },
    Rk: function (a, b) {
      var c = new B(),
        d = c.a;
      d.x = 0;
      d.y = -b;
      c.m = 0.1;
      c.v = 24;
      c.h = 6;
      var d = new B(),
        e = d.a;
      e.x = 0;
      e.y = -a;
      d.m = 0.1;
      d.v = 24;
      d.h = 6;
      var e = new B(),
        f = e.a;
      f.x = 0;
      f.y = a;
      e.m = 0.1;
      e.v = 24;
      e.h = 6;
      var f = new B(),
        g = f.a;
      g.x = 0;
      g.y = b;
      f.m = 0.1;
      f.v = 24;
      f.h = 6;
      g = new E();
      g.W = c;
      g.ca = d;
      g.v = 24;
      g.h = 6;
      g.Za = !1;
      g.m = 0.1;
      var k = new E();
      k.W = e;
      k.ca = f;
      k.v = 24;
      k.h = 6;
      k.Za = !1;
      k.m = 0.1;
      var l = new E();
      l.W = d;
      l.ca = e;
      l.v = 8;
      l.h = 6;
      l.Za = !1;
      l.Oc(180);
      l.m = 0.1;
      var h = new E();
      h.W = e;
      h.ca = d;
      h.v = 16;
      h.h = 6;
      h.Za = !1;
      h.Oc(180);
      h.m = 0.1;
      this.J.push(c);
      this.J.push(d);
      this.J.push(e);
      this.J.push(f);
      this.U.push(g);
      this.U.push(k);
      this.U.push(l);
      this.U.push(h);
    },
    Pk: function (a, b, c) {
      if (!(0 >= c)) {
        var d = new B(),
          e = d.a;
        e.x = -a + c;
        e.y = -b;
        d.h = 0;
        var e = new B(),
          f = e.a;
        f.x = -a;
        f.y = -b + c;
        e.h = 0;
        var f = new B(),
          g = f.a;
        g.x = -a + c;
        g.y = b;
        f.h = 0;
        var g = new B(),
          k = g.a;
        k.x = -a;
        k.y = b - c;
        g.h = 0;
        var k = new B(),
          l = k.a;
        l.x = a - c;
        l.y = b;
        k.h = 0;
        var l = new B(),
          h = l.a;
        h.x = a;
        h.y = b - c;
        l.h = 0;
        var h = new B(),
          m = h.a;
        m.x = a - c;
        m.y = -b;
        h.h = 0;
        var m = new B(),
          n = m.a;
        n.x = a;
        n.y = -b + c;
        m.h = 0;
        a = new E();
        a.W = d;
        a.ca = e;
        a.h = 1;
        a.Za = !1;
        a.m = 1;
        a.Oc(-90);
        b = new E();
        b.W = f;
        b.ca = g;
        b.h = 1;
        b.Za = !1;
        b.m = 1;
        b.Oc(90);
        c = new E();
        c.W = k;
        c.ca = l;
        c.h = 1;
        c.Za = !1;
        c.m = 1;
        c.Oc(-90);
        n = new E();
        n.W = h;
        n.ca = m;
        n.h = 1;
        n.Za = !1;
        n.m = 1;
        n.Oc(90);
        this.J.push(d);
        this.J.push(e);
        this.J.push(f);
        this.J.push(g);
        this.J.push(k);
        this.J.push(l);
        this.J.push(h);
        this.J.push(m);
        this.U.push(a);
        this.U.push(b);
        this.U.push(c);
        this.U.push(n);
      }
    },
    copy: function(){
      var a = new h(), b = this;
      a.Bh = b.Bh;
      a.w = b.w;
      a.ld = b.ld;
      a.Td = b.Td;
      a.Sd = b.Sd;
      a.kd = b.kd;
      a.Uc = b.Uc;
      a.Fe = b.Fe;
      a.jd = b.jd;
      a.$b = b.$b;
      a.qc = b.qc;
      a.kc = b.kc;
      var o1 = a.ge, o2 = b.ge;
      o1.m = o2.m;
      o1.aa = o2.aa;
      o1.Ca = o2.Ca;
      o1.Ce = o2.Ce;
      o1.Te = o2.Te;
      o1.Ue = o2.Ue;
      o1.Re = o2.Re;
      o1.oa.x = o2.oa.x;
      o1.oa.y = o2.oa.y;
      o1.v = o2.v;
      o1.Z = o2.Z;
      o1.Se = o2.Se;
      a.Ye = b.Ye;
      a.Ge = b.Ge;
      a.Lf = b.Lf;
      a.pf = b.pf;
      a.J = b.J.map((o2, idx)=>{ // o1.ja(o2);
        var o1 = new B();
        o1.a.x = o2.a.x;
        o1.a.y = o2.a.y;
        o1.m = o2.m;
        o1.h = o2.h;
        o1.v = o2.v;
        o1.ud = idx;
        return o1;
      });
      a.U = b.U.map((o2)=>{ // o1.ja(o2);
        var o1 = new E();
        var p0 = o2.W, p1 = o2.ca, v0 = -1, v1 = -1;
        b.J.forEach((x, idx)=>{
          if (x==p0)
            v0 = idx;
          else if (x==p1)
            v1 = idx;
        });
        o1.W = a.J[v0];
        o1.ca = a.J[v1];
        o1.Cc = o2.Cc;
        o1.vb = o2.vb;
        o1.R = o2.R;
        o1.Za = o2.Za;
        o1.m = o2.m;
        o1.h = o2.h;
        o1.v = o2.v;
        return o1;
      });
      a.qa = b.qa.map((o2)=>{ // o1.ja(o2);
        var o1 = new L();
        o1.wa.x = o2.wa.x;
        o1.wa.y = o2.wa.y;
        o1.Ua = o2.Ua;
        o1.m = o2.m;
        o1.h = o2.h;
        o1.v = o2.v;
        return o1;
      });
      a.tc = b.tc.map((o2)=>{ // o1.ja(o2);
        var o1 = new sb();
        o1.W.x = o2.W.x;
        o1.W.y = o2.W.y;
        o1.ca.x = o2.ca.x;
        o1.ca.y = o2.ca.y;
        o1.qe = o2.qe;
        return o1;
      });
      a.F = b.F.map((o2)=>{ // o1.ja(o2);
        var o1 = new ua();
        o1.a.x = o2.a.x;
        o1.a.y = o2.a.y;
        o1.D.x = o2.D.x;
        o1.D.y = o2.D.y;
        o1.oa.x = o2.oa.x;
        o1.oa.y = o2.oa.y;
        o1.Z = o2.Z;
        o1.m = o2.m;
        o1.aa = o2.aa;
        o1.Ca = o2.Ca;
        o1.R = o2.R;
        o1.h = o2.h;
        o1.v = o2.v;
        return o1;
      });
      a.pb = b.pb.map((o2)=>{ // o1.ja(o2);
        var o1 = new nb();
        o1.Yd = o2.Yd;
        o1.Zd = o2.Zd;
        o1.Hb = o2.Hb;
        o1.ec = o2.ec;
        o1.ne = o2.ne;
        o1.R = o2.R;
        return o1;
      });
      a.Dd = b.Dd.map((o)=>(new H(o.x, o.y)));
      a.md = b.md.map((o)=>(new H(o.x, o.y)));
      a.he();
      return a;
    },
    f: h,
  };

  O.b = !0;
  O.Yk = (function () {
    for (var a = [], b = 0; 256 > b; ) ++b, a.push(new H(0, 0));
    return a;
  })(this);
  O.dk = (function () {
    for (var a = [], b = 0; 256 > b; ) ++b, a.push(0);
    return a;
  })(this);
  O.qd = function (a, b) {
    a.Ma = b.Ma.sc();
    a.ib = b.ib;
    a.Da = b.Da;
    a.ta = b.ta.sc();
    a.vc = b.vc;
    a.Bb = b.Bb;
    a.Pb = b.Pb;
    a.Kb = b.Kb;
    a.Hc = b.Hc;
    a.Oa = b.Oa;
    a.S = b.S;
    a.ae = b.ae;
  };
  O.prototype = {
    Wo: function (a) {
      this.Ma = a;
      this.ib = a.ib;
      this.Da = a.Da;
      this.S = a.S;
      this.ta = Fa.fromStadium(a.S);
      /*
      this.ta.J = this.S.J;
      this.ta.qa = this.S.qa;
      this.ta.U = this.S.U;
      this.ta.pb = this.S.pb;
      a = 0;
      for (var b = this.S.F; a < b.length; ) this.ta.F.push(b[a++].rp());
      */
      this.Gk();
    },
    /*
    Ck: function (a) {
      if (a.ea == p.Ia) ((a.H && this.Ma._PDD_?.(a)), a.H = null);
      else {
        a.ob = 0;
        var b = a.H;
        null == b && ((b = new ca()), (b.playerId = a.V), (a.H = b), this.ta.F.push(b), (this.Ma._PDC_?.(a))); // assign playerId to disc
        var c = this.S.ge;
        b.R = 0;
        b.Z = c.Z;
        b.aa = c.aa;
        b.Ca = c.Ca;
        b.m = c.m;
        b.h = 39;
        b.v = a.ea.v | c.v;
        var d = a.ea == p.fa ? this.S.Dd : this.S.md;
        0 == d.length
          ? ((b.a.x = a.ea.Ch * this.S.$b), (b.a.y = 0))
          : ((a = b.a), (d = d[d.length - 1]), (a.x = d.x), (a.y = d.y));
        d = b.D;
        d.x = 0;
        d.y = 0;
        b = b.oa;
        c = c.oa;
        b.x = c.x;
        b.y = c.y;
      }
    },
    */
    Ck: function (a) {
      if (a.ea == p.Ia) 
        this.ta.rP(a, this.Ma._PDD_);
      else
        this.ta.aP(a, this.S, this.Ma._PDC_, this.Ma._PDD_);
    },
    Kn: function (a, b) {
      for (var c = 0, d = this.S.tc; c < d.length; c++) {
        var e = d[c];
        if (e.C(a, b))
          return e.qe;
      }
      return p.Ia;
    },
    C: function (a) {
      if (0 < this.Oa) 120 > this.Oa && this.Oa--;
      else {
        this.Ma.Os?.();
        for (var b = this.Ma.I, c = 0; c < b.length; c++) {
          var d = b[c];
          if (d.H != null) {
            0 == (d.ob & 16) && (d.Wb = !1);
            var e = this.S.ge;
            0 < d.Sc && d.Sc--;
            d.yc < this.Ma.ce && d.yc++;
            if (d.Wb && 0 >= d.Sc && 0 <= d.yc) {
              for (var f = false, g = 0, k = this.ta.F; g < k.length; ) {
                var l = k[g];
                ++g;
                if (0 != (l.v & 64) && l != d.H)//{
                  if (this.ta.kB(d.H, l, e))
                    f = true;
                  /*
                  var t = l.a,
                    h = d.H.a,
                    m = t.x - h.x,
                    t = t.y - h.y,
                    h = Math.sqrt(m * m + t * t);
                  if (4 > h - l.Z - d.H.Z) {
                    var f = m / h,
                      m = t / h,
                      t = e.Re,
                      n = (h = l.D),
                      l = l.aa;
                    h.x = n.x + f * t * l;
                    h.y = n.y + m * t * l;
                    n = d.H;
                    l = -e.Se;
                    h = t = n.D;
                    n = n.aa;
                    t.x = h.x + f * l * n;
                    t.y = h.y + m * l * n;
                    f = !0;
                  }
                  */
                //}
              }
              f &&
                (null != this.Ma.ji && this.Ma.ji(d),
                (d.Wb = !1),
                (d.Sc = this.Ma.yd),
                (d.yc -= this.Ma.Zc));
            }
            this.ta.mP(d, e);
            /*
            f = d.ob;
            k = g = 0;
            0 != (f & 1) && --k;
            0 != (f & 2) && ++k;
            0 != (f & 4) && --g;
            0 != (f & 8) && ++g;
            0 != g &&
              0 != k &&
              ((f = Math.sqrt(g * g + k * k)), (g /= f), (k /= f));
            f = d.H.D;
            l = d.Wb ? e.Te : e.Ce;
            f.x += g * l;
            f.y += k * l;
            d.H.Ca = d.Wb ? e.Ue : e.Ca;
            */
          }
        }
        c = 0;
        d = this.ta.F;
        e = 0;
        for (g = d.length; e < g; )
          (f = e++),
            (k = d[f]),
            0 != (k.v & 128) &&
              ((O.dk[c] = f),
              (f = O.Yk[c]),
              (k = k.a),
              (f.x = k.x),
              (f.y = k.y),
              ++c);
        this.ta.C(a, this.Ma);
        switch(this.Bb){
          case 0:{
            for (a = 0; a < b.length; )
              (c = b[a]), ++a, null != c.H && (c.H.h = 39 | this.ae.cp);
            //b = this.ta.F[0].D;
            if (this.ta.F[0].isMoving()/*b.x * b.x + b.y * b.y > 0*/){
              this.Bb = 1;
              null != this.Ma._KO_ && this.Ma._KO_();
            }
            break;
          }
          case 1:{
            this.Hc += 0.016666666666666666;
            for (a = 0; a < b.length; )
              (d = b[a]), ++a, null != d.H && (d.H.h = 39);
            d = p.Ia;
            b = this.ta.F;
            for (
              a = 0;
              a < c &&
              ((d = a++), (d = this.Kn(b[O.dk[d]].a, O.Yk[d])), d == p.Ia);
            );
            d != p.Ia
              ? (this.Bb = 2,
                this.vc = 150,
                this.ae = d,
                d == p.fa ? this.Kb++ : this.Pb++,
                null != this.Ma.Ni && this.Ma.Ni(d == p.fa ? p.xa : p.fa),
                null != this.Ma.Ol && this.Ma.Ol(d.$))
              : 0 < this.Da &&
                this.Hc >= 60 * this.Da &&
                this.Pb != this.Kb &&
                (null != this.Ma.Pi && this.Ma.Pi(), this.um());
            break;
          }
          case 2:{
            this.vc--,
            0 >= this.vc &&
              (0 < this.ib && (this.Pb >= this.ib || this.Kb >= this.ib) ||
              0 < this.Da && this.Hc >= 60 * this.Da && this.Pb != this.Kb
                ? this.um()
                : (this.Gk(), null != this.Ma.lq && this.Ma.lq()));
            break;
          }
          case 3:{
            this.vc--;
            if (this.vc<=0){
              b = this.Ma;
              if (b.K != null){
                b.K = null;
                a = 0;
                for (c = b.I; a < c.length; )
                  (d = c[a]), ++a, (d.H && this.Ma._PDD_?.(d)), (d.H = null), (d.Jb = 0);
                null != b.vf && b.vf(null);
              }
            }
            break;
          }
        }
        /*
        if (0 == this.Bb) {
          for (a = 0; a < b.length; )
            (c = b[a]), ++a, null != c.H && (c.H.h = 39 | this.ae.cp);
          b = this.ta.F[0].D;
          if (b.x * b.x + b.y * b.y > 0){
            this.Bb = 1;
            null != this.Ma._KO_ && this.Ma._KO_();
          }
        } 
        else if (1 == this.Bb) {
          this.Hc += 0.016666666666666666;
          for (a = 0; a < b.length; )
            (d = b[a]), ++a, null != d.H && (d.H.h = 39);
          d = p.Ia;
          b = this.ta.F;
          for (
            a = 0;
            a < c &&
            ((d = a++), (d = this.Kn(b[O.dk[d]].a, O.Yk[d])), d == p.Ia);
          );
          d != p.Ia
            ? (this.Bb = 2,
              this.vc = 150,
              this.ae = d,
              d == p.fa ? this.Kb++ : this.Pb++,
              null != this.Ma.Ni && this.Ma.Ni(d == p.fa ? p.xa : p.fa),
              null != this.Ma.Ol && this.Ma.Ol(d.$))
            : 0 < this.Da &&
              this.Hc >= 60 * this.Da &&
              this.Pb != this.Kb &&
              (null != this.Ma.Pi && this.Ma.Pi(), this.um());
        } else if (2 == this.Bb)
          this.vc--,
            0 >= this.vc &&
              (0 < this.ib && (this.Pb >= this.ib || this.Kb >= this.ib) ||
              0 < this.Da && this.Hc >= 60 * this.Da && this.Pb != this.Kb
                ? this.um()
                : (this.Gk(), null != this.Ma.lq && this.Ma.lq()));
        else if (
          3 == this.Bb &&
          (this.vc--, 0 >= this.vc && ((b = this.Ma), null != b.K))
        ) {
          b.K = null;
          a = 0;
          for (c = b.I; a < c.length; )
            (d = c[a]), ++a, (d.H && this.Ma._PDD_?.(d)), (d.H = null), (d.Jb = 0);
          null != b.vf && b.vf(null);
        }
        */
      }
    },
    um: function () {
      this.vc = 300;
      this.Bb = 3;
      null != this.Ma.Oi && this.Ma.Oi(this.Pb > this.Kb ? p.fa : p.xa);
    },
    Gk: function () {
      var a = this.Ma.I;
      this.Bb = 0;
      for (
        var b = this.S.F, c = this.ta.F, d = 0, e = this.S.pf ? b.length : 1;
        d < e;

      ) {
        var f = d++;
        b[f].Bk(c[f]);
      }
      b = [0, 0, 0];
      for (c = 0; c < a.length; )
        if (((d = a[c]), ++c, this.Ck(d), (e = d.ea), e != p.Ia)) {
          var f = d.H.a,
            g = this.S,
            k = b[e.$],
            l = e == p.fa ? g.Dd : g.md;
          0 == l.length
            ? ((l = (k + 1) >> 1),
              0 == (k & 1) && (l = -l),
              (g = g.kc * e.Ch),
              (k = 55 * l))
            : (k >= l.length && (k = l.length - 1),
              (k = l[k]),
              (g = k.x),
              (k = k.y));
          f.x = g;
          f.y = k;
          b[e.$]++;
          d.Jb = b[e.$];
        }
    },
    ga: function (a) {
      this.ta.ga(a);
      a.O(this.vc);
      a.O(this.Bb);
      a.O(this.Pb);
      a.O(this.Kb);
      a.s(this.Hc);
      a.O(this.Oa);
      a.l(this.ae.$);
    },
    ja: function (a, b) {
      this.ta.ja(a);
      this.vc = a.M();
      this.Bb = a.M();
      this.Pb = a.M();
      this.Kb = a.M();
      this.Hc = a.u();
      this.Oa = a.M();
      var c = a.lf();
      this.ae = 1 == c ? p.fa : 2 == c ? p.xa : p.Ia;
      this.Ma = b;
      this.ib = b.ib;
      this.Da = b.Da;
      this.S = b.S;
      this.ta.J = this.S.J;
      this.ta.U = this.S.U;
      this.ta.qa = this.S.qa;
      this.ta.pb = this.S.pb;
    },
    sc: function () {
      var a = yazc,
        b = this.gc;
      this.hc != a &&
        (null == b && (this.gc = b = new O()), (this.hc = a), O.qd(b, this));
      return b;
    },
    copy: function(fa){
      var a = new O();
      a.ta.F = this.ta.F.map((o2)=>{
        var o1 = new ca();
        o1.a.x = o2.a.x;
        o1.a.y = o2.a.y;
        o1.D.x = o2.D.x;
        o1.D.y = o2.D.y;
        o1.oa.x = o2.oa.x;
        o1.oa.y = o2.oa.y;
        o1.Z = o2.Z;
        o1.m = o2.m;
        o1.aa = o2.aa;
        o1.Ca = o2.Ca;
        o1.R = o2.R;
        o1.h = o2.h;
        o1.v = o2.v;
        o1.playerId = o2.playerId;
        return o1;
      });
      a.vc = this.vc;
      a.Bb = this.Bb;
      a.Pb = this.Pb;
      a.Kb = this.Kb;
      a.Hc = this.Hc;
      a.Oa = this.Oa;
      a.ae = this.ae;
      a.Ma = fa || this.Ma;
      a.ib = a.Ma.ib;
      a.Da = a.Ma.Da;
      a.S = a.Ma.S;
      a.ta.J = a.S.J;
      a.ta.U = a.S.U;
      a.ta.qa = a.S.qa;
      a.ta.pb = a.S.pb;
      return a;
    },
    f: O,
  };

  fa.b = !0;
  fa.qd = function (a, b) {
    a.jc = b.jc;
    if (null == b.I) a.I = null;
    else {
      null == a.I && (a.I = []);
      for (var c = a.I, d = b.I, e = d.length; c.length > e; ) c.pop();
      for (var e = 0, f = d.length; e < f; ) {
        var g = e++;
        c[g] = d[g].hs();
      }
    }
    a.K = null == b.K ? null : b.K.sc();
    a.Pc = b.Pc;
    a.ib = b.ib;
    a.Da = b.Da;
    a.ce = b.ce;
    a.Zc = b.Zc;
    a.yd = b.yd;
    a.S = b.S;
    a.kb = b.kb;
  };
  fa.prototype = {
    yr: function (a) {
      if (null == this.K) {
        this.K = new O();
        for (var b = 0, c = this.I; b < c.length; ) {
          var d = c[b];
          ++b;
          d.H = null;
          d.Jb = 0;
        }
        this.K.Wo(this);
        null != this.Ki && this.Ki(a);
      }
    },
    Mf: function (a, b, c) {
      if (b.ea==c)
        return;
      b.ea = c;
      D.remove(this.I, b);
      this.I.push(b);
      if (!this.K)
        return;
      //null != b.H && (D.remove(this.K.ta.F, b.H), (this._PDD_?.(b)), (b.H = null));
      this.K.ta.rP(b, this._PDD_);
      this.K.Ck(b);
      for (var d = 0, e = !1; !e; ) {
        ++d;
        for (var e = !0, f = 0, g = this.I; f < g.length; ) {
          var k = g[f];
          ++f;
          if (k != b && k.ea == b.ea && k.Jb == d) {
            e = !1;
            break;
          }
        }
      }
      b.Jb = d;
    },
    na: function (a) {
      for (var b = 0, c = this.I; b < c.length; ) {
        var d = c[b];
        ++b;
        if (d.V == a) return d;
      }
      return null;
    },
    C: function (a) {
      null != this.K && this.K.C(a);
    },
    ga: function (a) {
      a.Db(this.jc);
      a.l(this.Pc ? 1 : 0);
      a.O(this.ib);
      a.O(this.Da);
      a.Xi(this.ce);
      a.l(this.Zc);
      a.l(this.yd);
      this.S.ga(a);
      a.l(null != this.K ? 1 : 0);
      null != this.K && this.K.ga(a);
      a.l(this.I.length);
      for (var b = 0, c = this.I; b < c.length; ) c[b++].ua(a);
      this.kb[1].ga(a);
      this.kb[2].ga(a);
    },
    ja: function (a) {
      this.jc = a.zb();
      this.Pc = 0 != a.B();
      this.ib = a.M();
      this.Da = a.M();
      this.ce = a.ni();
      this.Zc = a.B();
      this.yd = a.B();
      this.S = h.ja(a);
      var b = 0 != a.B();
      this.K = null;
      b && ((this.K = new O()), this.K.ja(a, this));

      for (
        var b = null == this.K ? null : this.K.ta.F, c = a.B(), d = this.I;
        d.length > c;

      )
        d.pop();
      for (d = 0; d < c; ) {
        var e = new ea();
        e.va(a, b);
        this.I[d++] = e;
      }
      this.kb[1].ja(a);
      this.kb[2].ja(a);
    },
    uk: function () {
      var a = 0,
        b = w.ha();
      this.ga(b);
      for (b = b.Gr(); 4 <= b.o.byteLength - b.a; ) a ^= b.M();
      return a;
    },
    Ao: function () {
      var a = w.ha(4);
      a.O(this.uk());
      return a.Kg();
    },
    Sn: function (a) {
      a = new F(new DataView(a)).M();
      this.ko?.(this.uk() != a);
    },
    km: function (a) {
      this.Ol = a;
    },
    Lb: function (a) {
      if (0 == a) return !0;
      a = this.na(a);
      return null != a && a.cb ? !0 : !1;
    },
    mr: function (a, b, c, d) {
      this.yd = 0 > b ? 0 : 255 < b ? 255 : b;
      this.Zc = 0 > c ? 0 : 255 < c ? 255 : c;
      d = 0 > d ? 0 : 100 < d ? 100 : d;
      this.ce = this.Zc * d;
      this.Hk?.(a, this.yd, this.Zc, d);
    },
    sc: function () {
      var a = yazc,
        b = this.gc;
      this.hc != a &&
        (null == b && (this.gc = b = new fa()), (this.hc = a), fa.qd(b, this));
      return b;
    },
    copy: function () {
      var b = new fa();
      b.jc = this.jc;
      b.Pc = this.Pc;
      b.ib = this.ib;
      b.Da = this.Da;
      b.ce = this.ce;
      b.Zc = this.Zc;
      b.yd = this.yd;
      b.S = this.S?.copy();
      b.K = this.K?.copy(b);
      b.I = [];
      this.I.forEach((p, i)=>{
        var q = new ea();
        q.cb = p.cb;
        q.Jb = p.Jb;
        q.Xb = p.Xb;
        q.Jd = p.Jd;
        q.Ld = p.Ld;
        q.Kd = p.Kd;
        q.Ug = p.Ug;
        q.w = p.w;
        q.ob = p.ob;
        q.V = p.V;
        q.Wb = p.Wb;
        q.yc = p.yc;
        q.Sc = p.Sc;
        q.ea = p.ea;
        q.auth = p.auth;
        q.conn = p.conn;
        q.customClient = p.customClient;
        if (b.K && p.H){
          var id = p.H.playerId, idx = b.K.ta.F.findIndex(x=>x.playerId==id);
          if (idx>-1)
            q.H = b.K.ta.F[idx];
        }
        b.I[i] = q;
      });
      this.kb.forEach((a, i)=>{
        b.kb[i] = a?.copy();
      });
      return b;
    },
    exportStadium: function(){
      if (!this.K)
        return;
      var { S, ta } = this.K, d = new E(), k = new ua(), bgObj = {};
      var rsp = S.Dd.map((a)=>([a.x, a.y])), bsp = S.md.map((a)=>([a.x, a.y])), j = ta.pb.map(h.ap);
      h.ka(bgObj, "type", ((S.ld==1) ? "grass" : ((S.ld==2) ? "hockey" : "none")), "none");
      h.ka(bgObj, "width", S.Td, 0);
      h.ka(bgObj, "height", S.Sd, 0);
      h.ka(bgObj, "kickOffRadius", S.kd, 0);
      h.ka(bgObj, "cornerRadius", S.Uc, 0);
      h.qg(bgObj, S.jd, 7441498);
      (S.ld==2) && h.ka(bgObj, "goalLine", S.Fe, 0);
      var exp = {
        "name": S.w,
        "width": S.$b,
        "height": S.qc,
        "vertexes": ta.J.map((x, i)=>{var y = h.Tr(x);y.ud=i;return y;}),
        "segments": ta.U.map((x)=>{return h._fr_(this, x, d);}),
        "planes": ta.qa.map(h.gq),
        "goals": S.tc.map(h.Jo),
        "discs": ta.F.map((x)=>{return h.mo(x, k);}),
        "bg": bgObj,
        "playerPhysics": h.jq(S.ge),
        "ballPhysics": "disc0"
      };
      h.ka(exp, "maxViewWidth", S.Ye, 0);
      h.ka(exp, "cameraFollow", 1 == S.Ge ? "player" : "", "");
      h.ka(exp, "spawnDistance", S.kc, 200);
      (j.length>0) && (exp["joints"] = ta.pb.map(h.ap));
      (rsp.length>0) && (exp["redSpawnPoints"] = rsp);
      (bsp.length>0) && (exp["blueSpawnPoints"] = bsp);
      h.ka(exp, "kickOffReset", S.pf ? "full" : "partial", "partial");
      (!S.Lf) && (exp["canBeStored"] = false);
      return exp;
    },
    f: fa,


    // ------------------ Custom functions section ------------------
    // CAUTION: These functions should NOT be used in the original 
    // Haxball client, otherwise they will cause desynchronization.
    // Example usage can be found in the implementation of sandbox mode.

    createVertex: function(data) { // data: { x: number, y: number, bCoef: number, cMask: array of string, cGroup: array of string }
      return h._np_(data);
    },

    createSegment: function(data) { // data: { v0: number, v1: number, color: ("transparent" || string || [r: number, g: number, b: number]), bias: number, (curve: number || curveF: number), vis: boolean, bCoef: number, cMask: array of string, cGroup: array of string }
      var segment = h._mp_(data, this.K.ta.J);
      segment.he();
      return segment;
    },

    createSegmentFromObj: function(data) { // data: { v0: vertexObj, v1: vertexObj, color: ("transparent" || string || [r: number, g: number, b: number]), bias: number, (curve: number || curveF: number), vis: boolean, bCoef: number, cMask: array of string, cGroup: array of string }
      var segment = h.__mp__(data, this.K.ta.J);
      segment.he();
      return segment;
    },

    createGoal: function(data) { // data: { p0: [x: number, y: number], p1: [x: number, y: number], team: ("red" || "blue") }
      return h.ip(data);
    },

    createPlane: function(data) { // data: { normal: [x: number, y: number], dist: number, bCoef: number, cMask: array of string, cGroup: array of string }
      return h._kp_(data);
    },

    createDisc: function(data) { // data: { pos: [x: number, y: number], speed: [x: number, y: number], gravity: [x: number, y: number], radius: number, invMass: number, damping: number, color: ("transparent" || string || [r: number, g: number, b: number]), bCoef: number, cMask: array of string, cGroup: array of string }
      return h._Mk_(data, new ua()).rp();
    },

    createJoint: function(data) { // data: { d0: number, d1: number, color: ("transparent" || string || [r: number, g: number, b: number]), strength: "rigid" || number, length: null || number || [min: number, max: number] }
      return h._jp_(data, this.K.ta.F);
    },

    createJointFromObj: function(data) { // data: { d0: discObj, d1: discObj, color: ("transparent" || string || [r: number, g: number, b: number]), strength: "rigid" || number, length: null || number || [min: number, max: number] }
      return h.__jp__(data, this.K.ta.F);
    },

    addVertex: function(data) { // data: { x: number, y: number, bCoef: number, cMask: array of string, cGroup: array of string }
      this.K.ta.J.push(this.createVertex(data));
    },

    addSegment: function(data) { // data: { v0: number, v1: number, color: ("transparent" || string || [r: number, g: number, b: number]), bias: number, (curve: number || curveF: number), vis: boolean, bCoef: number, cMask: array of string, cGroup: array of string }
      this.K.ta.U.push(this.createSegment(data));
    },

    addGoal: function(data) { // data: { p0: [x: number, y: number], p1: [x: number, y: number], team: ("red" || "blue") }
      this.K.S.tc.push(this.createGoal(data));
    },

    addPlane: function(data) { // data: { normal: [x: number, y: number], dist: number, bCoef: number, cMask: array of string, cGroup: array of string }
      this.K.ta.qa.push(this.createPlane(data));
    },

    addDisc: function(data) { // data: { pos: [x: number, y: number], speed: [x: number, y: number], gravity: [x: number, y: number], radius: number, invMass: number, damping: number, color: ("transparent" || string || [r: number, g: number, b: number]), bCoef: number, cMask: array of string, cGroup: array of string }
      var disc = this.createDisc(data);
      //find the index to add this disc (it should be right before player discs start)
      var idx = this.K.ta.F.findIndex((x)=>x.playerId!=null);
      if (idx<0)
        idx = this.K.ta.F.length;
      // add the disc at that index
      this.K.ta.F.splice(idx, 0, disc);
      // shift the disc indices by 1 in all joints of all discs that come after the added disc
      var joints = this.K.ta.pb;
      for (var idx2=this.K.ta.F.length-2;idx2>=idx;idx2--){
        joints.forEach((joint)=>{
          if (joint.Yd==idx2)
            joint.Yd++;
          if (joint.Zd==idx2)
            joint.Zd++;
        });
      }
    },

    addJoint: function(data) { // data: { d0: number, d1: number, color: ("transparent" || string || [r: number, g: number, b: number]), strength: "rigid" || number, length: null || number || [min: number, max: number] }
      this.K.ta.pb.push(this.createJoint(data));
    },

    addSpawnPoint: function(data) { // data: { x: number, y: number, team: ("red" || "blue") }
      var arr;
      if (data.team=="red")
        arr = this.K.S.Dd;
      else if (data.team=="blue")
        arr = this.K.S.md;
      if (!arr)
        return;
      arr.push(new H(data.x, data.y));
    },

    addPlayer: function(data) { // data: { pos: [x: number, y: number], speed: [x: number, y: number], gravity: [x: number, y: number], radius: number, invMass: number, damping: number, bCoef: number, cMask: array of string, cGroup: array of string, id: integer, name: string, avatar: string, flag: string, team: ("spec" || "red" || "blue") }
      var { team, /* pos, radius, speed, gravity, invMass, damping, bCoef, cMask, cGroup, */ id, name, avatar, flag } = data;
      var teamObj = (team=="spec") ? p.Ia : (((team=="red") ? p.fa : ((team=="blue") ? p.xa : null)));
      if (!teamObj)
        return;
      var b = oa.la(id, name, flag, avatar, "fakeConn", "fakeAuth");
      b.P = 0;
      b.apply(this);
      if (team=="spec")
        return;
      b = S.la(id, teamObj);
      b.P = 0;
      b.apply(this);
      this.updateDiscObj(this.na(id).H, data);
    },

    findVertexIndicesOfSegmentObj: function(segment){
      var p0 = segment.W, p1 = segment.ca, v0 = -1, v1 = -1;
      this.K.ta.J.forEach((x, idx)=>{
        if (x==p0)
          v0 = idx;
        else if (x==p1)
          v1 = idx;
      });
      return [v0, v1];
    },

    findVertexIndicesOfSegment: function(segmentIndex){
      return this.findVertexIndicesOfSegmentObj(this.K.ta.U[segmentIndex]);
    },

    updateVertex: function(idx, data) { // data: { x: number, y: number, bCoef: number, cMask: array of string, cGroup: array of string }
      var vertex = this.K.ta.J[idx];
      if (!vertex)
        return;
      var v = h._np_(data);
      if (data.hasOwnProperty("x"))
        vertex.a.x = v.a.x;
      if (data.hasOwnProperty("y"))
        vertex.a.y = v.a.y;
      if (data.hasOwnProperty("bCoef"))
        vertex.m = v.m;
      if (data.hasOwnProperty("cMask"))
        vertex.h = v.h;
      if (data.hasOwnProperty("cGroup"))
        vertex.v = v.v;
      // update all segments that use this vertex
      this.K.ta.U.forEach((segment)=>{
        if (segment.ca==vertex || segment.W==vertex)
          segment.he();
      });
    },

    updateSegment: function(idx, data) { // data: { v0: number, v1: number, color: ("transparent" || string || [r: number, g: number, b: number]), bias: number, (curve: number || curveF: number), vis: boolean, bCoef: number, cMask: array of string, cGroup: array of string }
      var segment = this.K.ta.U[idx];
      if (!segment)
        return;
      var s = h._mp_(data, this.K.ta.J); // using "curve" causes s.Oc() which changes s.W, s.ca, s.Cc and s.vb.
      if (data.hasOwnProperty("v0") || data.hasOwnProperty("curve"))
        segment.W = s.W;
      if (data.hasOwnProperty("v1") || data.hasOwnProperty("curve"))
        segment.ca = s.ca;
      if (data.hasOwnProperty("bias") || data.hasOwnProperty("curve"))
        segment.Cc = s.Cc;
      if (data.hasOwnProperty("curveF") || data.hasOwnProperty("curve"))
        segment.vb = s.vb;
      if (data.hasOwnProperty("vis"))
        segment.Za = s.Za;
      if (data.hasOwnProperty("color"))
        segment.R = s.R;
      if (data.hasOwnProperty("bCoef"))
        segment.m = s.m;
      if (data.hasOwnProperty("cMask"))
        segment.h = s.h;
      if (data.hasOwnProperty("cGroup"))
        segment.v = s.v;
      segment.he();
    },

    updateGoal: function(idx, data) { // data: { p0: [x: number, y: number], p1: [x: number, y: number], team: ("red" || "blue") }
      var goal = this.K.S.tc[idx];
      if (!goal)
        return;
      var g = h.ip(data);
      if (data.hasOwnProperty("p0"))
        goal.W = g.W;
      if (data.hasOwnProperty("p1"))
        goal.ca = g.ca;
      if (data.hasOwnProperty("team"))
        goal.qe = g.qe;
    },

    updatePlane: function(idx, data) { // data: { normal: [x: number, y: number], dist: number, bCoef: number, cMask: array of string, cGroup: array of string }
      var plane = this.K.ta.qa[idx];
      if (!plane)
        return;
      var p = h._kp_(data);
      if (data.hasOwnProperty("normal"))
        plane.wa = p.wa;
      if (data.hasOwnProperty("dist"))
        plane.Ua = p.Ua;
      if (data.hasOwnProperty("bCoef"))
        plane.m = p.m;
      if (data.hasOwnProperty("cMask"))
        plane.h = p.h;
      if (data.hasOwnProperty("cGroup"))
        plane.v = p.v;
    },

    updateDisc: function(idx, data) { // data: { pos: [x: number, y: number], speed: [x: number, y: number], gravity: [x: number, y: number], radius: number, invMass: number, damping: number, color: ("transparent" || string || [r: number, g: number, b: number]), bCoef: number, cMask: array of string, cGroup: array of string }
      this.updateDiscObj(this.K.ta.F[idx], data);
    },

    updateDiscObj: function(disc, data) { // data: { pos: [x: number, y: number], speed: [x: number, y: number], gravity: [x: number, y: number], radius: number, invMass: number, damping: number, color: ("transparent" || string || [r: number, g: number, b: number]), bCoef: number, cMask: array of string, cGroup: array of string }
      if (!disc)
        return;
      var d = h._Mk_(data, new ua());
      if (data.hasOwnProperty("pos"))
        disc.a = d.a;
      if (data.hasOwnProperty("speed"))
        disc.D = d.D;
      if (data.hasOwnProperty("gravity"))
        disc.oa = d.oa;
      if (data.hasOwnProperty("radius"))
        disc.Z = d.Z;
      if (data.hasOwnProperty("invMass"))
        disc.aa = d.aa;
      if (data.hasOwnProperty("damping"))
        disc.Ca = d.Ca;
      if (data.hasOwnProperty("color"))
        disc.R = d.R;
      if (data.hasOwnProperty("bCoef"))
        disc.m = d.m;
      if (data.hasOwnProperty("cMask"))
        disc.h = d.h;
      if (data.hasOwnProperty("cGroup"))
        disc.v = d.v;
    },

    updateJoint: function(idx, data) { // data: { d0: number, d1: number, color: ("transparent" || string || [r: number, g: number, b: number]), strength: "rigid" || number, length: null || number || [min: number, max: number] }
      var joint = this.K.ta.pb[idx];
      if (!joint)
        return;
      var j = h._jp_(data, this.K.ta.F);
      if (data.hasOwnProperty("d0"))
        joint.Yd = j.Yd;
      if (data.hasOwnProperty("d1"))
        joint.Zd = j.Zd;
      if (data.hasOwnProperty("color"))
        joint.R = j.R;
      if (data.hasOwnProperty("strength"))
        joint.ne = j.ne;
      if (data.hasOwnProperty("length")){
        joint.ec = j.ec;
        joint.Hb = j.Hb;
      }
    },

    updateSpawnPoint: function(idx, team, data) { // data: { x: number, y: number, team: ("red" || "blue") }
      var arr1, arr2;
      if (team=="red")
        arr1 = this.K.S.Dd;
      else if (team=="blue")
        arr1 = this.K.S.md;
      if (data.team=="red")
        arr2 = this.K.S.Dd;
      else if (data.team=="blue")
        arr2 = this.K.S.md;
      if (!arr1 || !arr2)
        return;
      var obj;
      if (arr1==arr2)
        obj = arr1[idx];
      else
        obj = arr1.splice(idx, 1)[0];
      if (!obj)
        return;
      if (data.hasOwnProperty("x"))
        obj.x = data.x;
      if (data.hasOwnProperty("y"))
        obj.y = data.y;
      if (arr1!=arr2)
        arr2.push(obj);
    },

    updatePlayer: function(playerId, data) { // data: { pos: [x: number, y: number], speed: [x: number, y: number], gravity: [x: number, y: number], radius: number, invMass: number, damping: number, bCoef: number, cMask: array of string, cGroup: array of string, name: string, avatar: string, flag: string, team: ("spec" || "red" || "blue") }
      var playerObj = this.na(playerId);
      if (!playerObj)
        return;
      var teamObj = null;
      if (data.hasOwnProperty("team"))
        teamObj = (data.team=="spec") ? p.Ia : (((data.team=="red") ? p.fa : ((data.team=="blue") ? p.xa : null)));
      if (data.hasOwnProperty("name"))
        playerObj.w = data.name;
      if (data.hasOwnProperty("flag"))
        playerObj.Kd = data.flag;
      if (data.hasOwnProperty("avatar"))
        playerObj.Xb = data.avatar;
      if (teamObj!=null){
        var b = S.la(playerId, teamObj);
        b.P = 0;
        b.apply(this);
      }
      if (playerObj.H!=null)
        this.updateDiscObj(playerObj.H, data);
    },

    removeVertex: function(idx) {
      // remove the vertex
      var vertex = this.K.ta.J.splice(idx, 1)[0];
      if (!vertex)
        return;
      // find all segment indices that use this vertex
      var segments = this.K.ta.U, indices = [];
      segments.forEach((segment, idx)=>{
        if (segment.ca==vertex || segment.W==vertex)
          indices.unshift(idx); // adds in reverse order
      });
      // remove all segments that use this vertex
      indices.forEach((idx)=>segments.splice(idx, 1));
    },

    removeSegment: function(idx) {
      this.K.ta.U.splice(idx, 1);
    },

    removeGoal: function(idx) {
      this.K.S.tc.splice(idx, 1);
    },

    removePlane: function(idx) {
      this.K.ta.qa.splice(idx, 1);
    },

    removeDisc: function(idx) {
      // remove the disc
      this.K.ta.F.splice(idx, 1);
      // find all joint indices that use this disc
      var joints = this.K.ta.pb, indices = [];
      joints.forEach((joint, idx2)=>{
        if (joint.Yd==idx || joint.Zd==idx)
          indices.unshift(idx2); // adds in reverse order
      });
      // remove all joints that use this disc
      indices.forEach((idx2)=>joints.splice(idx2, 1));
      // shift the disc indices by 1 in all joints of all discs that come after the removed disc
      for (var idx2=idx+1;idx2<=this.K.ta.F.length;idx2++){
        joints.forEach((joint)=>{
          if (joint.Yd==idx2)
            joint.Yd--;
          if (joint.Zd==idx2)
            joint.Zd--;
        });
      }
    },

    removeJoint: function(idx) {
      this.K.ta.pb.splice(idx, 1);
    },

    removeSpawnPoint: function(idx, team) {
      var arr;
      if (team=="red")
        arr = this.K.S.Dd;
      else if (team=="blue")
        arr = this.K.S.md;
      if (!arr)
        return;
      arr.splice(idx, 1);
    },

    removePlayer: function(playerId) {
      var b = Y.la(playerId, null, true);
      b.P = 0;
      b.apply(this);
    },

    updateStadiumPlayerPhysics: function(data) { // data: { radius: number, gravity: [x: number, y: number], invMass: number, bCoef: number, cGroup: array of string, damping: number, kickingDamping: number, acceleration: number, kickingAcceleration: number, kickStrength: number, kickback: number }
      var obj = this.K?.S.ge;
      if (!obj)
        return;
      var d = h._Mk_(data, new ua());
      if (data.hasOwnProperty("radius"))
        obj.Z = d.Z;
      if (data.hasOwnProperty("gravity"))
        obj.oa = d.oa;
      if (data.hasOwnProperty("invMass"))
        obj.aa = d.aa;
      if (data.hasOwnProperty("bCoef"))
        obj.m = d.m;
      if (data.hasOwnProperty("cGroup"))
        obj.v = d.v;
      if (data.hasOwnProperty("damping"))
        obj.Ca = d.Ca;
      if (data.hasOwnProperty("kickingDamping"))
        obj.Ua = vvt(data.kickingDamping, Number);
      if (data.hasOwnProperty("acceleration"))
        obj.Ce = vvt(data.acceleration, Number);
      if (data.hasOwnProperty("kickingAcceleration"))
        obj.Te = vvt(data.kickingAcceleration, Number);
      if (data.hasOwnProperty("kickStrength"))
        obj.Re = vvt(data.kickStrength, Number);
      if (data.hasOwnProperty("kickback"))
        obj.Se = vvt(data.kickback, Number);
    },

    updateStadiumBg: function(data) { // data: { type: 0("none") || 1("grass") || 2("hockey"), width: number, height: number, kickOffRadius: number, cornerRadius: number, color: ("transparent" || string || [r: number, g: number, b: number]), goalLine: number }
      var obj = this.K?.S;
      if (!obj)
        return;
      if (data.hasOwnProperty("type"))
        obj.ld = vvt(data.type, Integer);
      if (data.hasOwnProperty("width"))
        obj.Td = vvt(data.width, Number);
      if (data.hasOwnProperty("height"))
        obj.Sd = vvt(data.height, Number);
      if (data.hasOwnProperty("kickOffRadius"))
        obj.kd = vvt(data.kickOffRadius, Number);
      if (data.hasOwnProperty("cornerRadius"))
        obj.Uc = vvt(data.cornerRadius, Number);
      if (data.hasOwnProperty("color"))
        obj.jd = vvt(data.color, Integer);
      if (data.hasOwnProperty("goalLine"))
        obj.Fe = vvt(data.goalLine, Number);
    },

    updateStadiumGeneral: function(data) { // data: { name: string, width: number, height: number, maxViewWidth: number, cameraFollow: 0("") || 1("player"), spawnDistance: number, kickOffReset: true("full") || false("partial"), canBeStored: boolean }
      var obj = this.K?.S;
      if (!obj)
        return;
      if (data.hasOwnProperty("name"))
        obj.w = vvt(data.name, String);
      if (data.hasOwnProperty("width"))
        obj.$b = vvt(data.width, Number);
      if (data.hasOwnProperty("height"))
        obj.qc = vvt(data.height, Number);
      if (data.hasOwnProperty("maxViewWidth"))
        obj.Ye = vvt(data.maxViewWidth, Number);
      if (data.hasOwnProperty("cameraFollow"))
        obj.Ge = vvt(data.cameraFollow, Integer);
      if (data.hasOwnProperty("spawnDistance"))
        obj.kc = vvt(data.spawnDistance, Number);
      if (data.hasOwnProperty("kickOffReset"))
        obj.pf = vvt(data.kickOffReset, Boolean);
      if (data.hasOwnProperty("canBeStored"))
        obj.Lf = vvt(data.canBeStored, Boolean);
    },

    runSteps: function(count){
      this.C(count);
    }
  };

  ///////////////////////////////////////////////////////////////

  function m() {
    this.da = 0;
  }
  m.b = !0;
  m.Qm = new Map();
  m.Qz = new Map();
  m.yf = 0;
  m.Fa = function (a) {
    null == a.Aa && (a.Aa = !0);
    null == a.Ba && (a.Ba = !0);
    return a;
  };
  m.Ha = function (a) {
    a.on = m.yf;
    if (null == a.za) throw new q(createError(ErrorCodes.MissingActionConfigError)); // "Class doesn't have a config"
    a.prototype.zf = a.za;
    m.Qm.set(m.yf, a);
    m.Qz.set(a.prototype.eventType, a);
    m.yf++;
  };
  m.lj = function (a, b) { // serialize(pack) event message
    var c = a?.f?.on;
    if (null == c) throw new q(createError(ErrorCodes.UnregisteredActionError)); // "Tried to pack unregistered action"
    b.l(c);
    a.ua(b);
  };
  m.fh = function (a, replayMode) {
    var b = Object.create(m.Qm.get(a.B()).prototype);
    b.da = 0;
    b.mb = 0;
    b.va(a, replayMode);
    return b;
  };
  m.prototype = {
    $m: function () {
      return !0;
    },
    apply: function () {
      throw new q(createError(ErrorCodes.MissingImplementationError)); // "missing implementation"
    },
    va: function () {
      throw new q(createError(ErrorCodes.MissingImplementationError)); // "missing implementation"
    },
    ua: function () {
      throw new q(createError(ErrorCodes.MissingImplementationError)); // "missing implementation"
    },
    copy: function () {
      throw new q(createError(ErrorCodes.MissingImplementationError)); // "missing implementation"
    },
    f: m,
  };
  Object.defineProperty(m.prototype, "eventType", {
    get(){
      return null;
    }
  });

  function mCopy(n, m){
    n.da = m.da;
    n.mb = m.mb;
    n.P = m.P;
    n._TP = m._TP;
    return n;
  }

  function Ua() {
    this.da = 0;
    this.Rg = null;
  }
  Ua.b = !0;
  Ua.ma = m;
  Ua.la = function (a) {
    var b = new Ua();
    b.Rg = a;
    return b;
  };
  Ua.prototype = C(m.prototype, {
    apply: function (a) {
      a.Sn(this.Rg);
    },
    ua: function (a) {
      a.lb(this.Rg.byteLength);
      a.Mg(this.Rg);
    },
    va: function (a) {
      this.Rg = a.Cl(a.Ab());
    },
    copy: function () {
      var dst = null;
      if (this.Rg){
        dst = new ArrayBuffer(this.Rg.byteLength);
        new Uint8Array(dst).set(new Uint8Array(this.Rg));
      }
      return mCopy(Ua.la(dst), this);
    },
    f: Ua,
  });
  Object.defineProperty(Ua.prototype, "eventType", {
    get(){
      return OperationType.CheckConsistency;
    }
  });

  function ta() {
    this.da = 0;
    this.Yg = false;
    this.P = 0;
  }
  ta.b = !0;
  ta.la = function (a) {
    var b = new ta();
    b.Yg = a;
    return b;
  };
  ta.ma = m;
  ta.prototype = C(m.prototype, {
    apply: function (a) {
      var b = a.na(this.P);
      null != b && this.Yg != b.Ld && ((b.Ld = this.Yg), a.sl?.(b));
    },
    ua: function (a) {
      a.l(this.Yg ? 1 : 0);
    },
    va: function (a) {
      this.Yg = 0 != a.B();
    },
    copy: function () {
      return mCopy(ta.la(this.Yg), this);
    },
    f: ta,
  });
  Object.defineProperty(ta.prototype, "eventType", {
    get(){
      return OperationType.SetPlayerSync;
    }
  });

  function rb() {
    this.da = 0;
    this.Tc = "";
    this.color = 0;
    this.style = 0;
    this.fn = 0;
    this.P = 0;
    this._TP = null;
  }
  rb.b = !0;
  rb.la = function (a, b, c, d) {
    var x = new rb();
    x.Tc = a;
    x.color = b;
    x.style = c;
    x.fn = d;
    return x;
  };
  rb.ma = m;
  rb.prototype = C(m.prototype, {
    apply: function (a) {
      0 == this.P && a.Vl?.(this.Tc, this.color, this.style, this.fn);
    },
    ua: function (a) {
      a.mc(tSil(this.Tc, 1e3));
      a.O(this.color);
      a.l(this.style);
      a.l(this.fn);
    },
    va: function (a) {
      this.Tc = a.ic();
      if (1e3 < this.Tc.length) throw new q(createError(ErrorCodes.AnnouncementActionMessageTooLongError)); // "message too long"
      this.color = a.M();
      this.style = a.B();
      this.fn = a.B();
    },
    copy: function () {
      return mCopy(rb.la(this.Tc, this.color, this.style, this.fn), this);
    },
    f: rb,
  });
  Object.defineProperty(rb.prototype, "eventType", {
    get(){
      return OperationType.SendAnnouncement;
    }
  });
  
  function Qa() {
    this.da = 0;
    this.P = 0;
  }
  Qa.b = !0;
  Qa.ma = m;
  Qa.la = function () {
    return new Qa();
  };
  Qa.prototype = C(m.prototype, {
    apply: function (a) {
      if (a.Lb(this.P, 1)) {
        for (
          var b = a.na(this.P), c = a.I, d = [], e = 0, f = 0, g = 0;
          g < c.length;

        ) {
          var k = c[g];
          ++g;
          k.ea == p.Ia && d.push(k);
          k.ea == p.fa ? ++e : k.ea == p.xa && ++f;
        }
        c = d.length;
        var t;
        0 != c &&
          (f == e
            ? 2 > c || (a.Mf(b, d[0], p.fa), a.Mf(b, d[1], p.xa), (a._AT_ && a._AT_(d[0].V, p.fa.$, d[1].V, p.xa.$, this.P)))
            : (t = f > e ? p.fa : p.xa, a.Mf(b, d[0], t), (a._AT_ && a._AT_(d[0].V, t.$, null, null, this.P))));
      }
    },
    ua: function () {},
    va: function () {},
    copy: function () {
      return mCopy(Qa.la(), this);
    },
    f: Qa,
  });
  Object.defineProperty(Qa.prototype, "eventType", {
    get(){
      return OperationType.AutoTeams;
    }
  });

  function da() {
    this.da = 0;
    this.rj = 0;
    this.newValue = 0;
    this.P = 0;
  }
  da.b = !0;
  da.la = function (a, b) {
    var c = new da();
    c.rj = a;
    c.newValue = b;
    return c;
  };
  da.ma = m;
  da.prototype = C(m.prototype, {
    apply: function (a) {
      if (a.Lb(this.P, 2) && null == a.K){
        switch (this.rj) {
          case 0:
            var b = this.newValue;
            a.ib = 0 > b ? 0 : 99 < b ? 99 : b;
            (a._SLC_ && a._SLC_(this.newValue, this.P));
            break;
          case 1:
            (b = this.newValue), (a.Da = 0 > b ? 0 : 99 < b ? 99 : b), (a._TLC_ && a._TLC_(this.newValue, this.P));
        }
      }
    },
    ua: function (a) {
      a.O(this.rj);
      a.O(this.newValue);
    },
    va: function (a) {
      this.rj = a.M();
      this.newValue = a.M();
    },
    copy: function () {
      return mCopy(da.la(this.rj, this.newValue), this);
    },
    f: da,
  });
  Object.defineProperty(da.prototype, "eventType", {
    get(){
      return (this.rj==0) ? OperationType.SetScoreLimit : OperationType.SetTimeLimit;
    }
  });
  
  function sa() {
    this.da = 0;
    this.Md = 0;
    this.Xg = 0;
    this.P = 0;
  }
  sa.b = !0;
  sa.la = function (a, b) {
    var c = new sa();
    c.Md = a;
    c.Xg = b;
    return c;
  };
  sa.ma = m;
  sa.prototype = C(m.prototype, {
    apply: function (a) {
      if (a.Lb(this.P, 4)) {
        var b = a.na(this.P),
          c = a.na(this.Md);
        null != c &&
          0 != c.V &&
          c.cb != this.Xg &&
          ((c.cb = this.Xg), (null != a.ii && a.ii(b, c)));
      }
    },
    ua: function (a) {
      a.O(this.Md);
      a.l(this.Xg ? 1 : 0);
    },
    va: function (a) {
      this.Md = a.M();
      this.Xg = 0 != a.B();
    },
    copy: function () {
      return mCopy(sa.la(this.Md, this.Xg), this);
    },
    f: sa,
  });
  Object.defineProperty(sa.prototype, "eventType", {
    get(){
      return OperationType.SetPlayerAdmin;
    }
  });
  
  function ra() {
    this.da = 0;
    this.Zb = null;
    this.P = 0;
  }
  ra.b = !0;
  ra.la = function (a) {
    var b = new ra();
    b.Zb = a;
    return b;
  };
  ra.ma = m;
  ra.prototype = C(m.prototype, {
    apply: function (a) {
      var b = a.na(this.P);
      null != b && (b.Xb = this.Zb, (a._PAC_ && a._PAC_(this.P, this.Zb)));
    },
    ua: function (a) {
      a.Db(this.Zb);
    },
    va: function (a) {
      this.Zb = a.zb();
      null != this.Zb && (this.Zb = tSil(this.Zb, 2));
    },
    copy: function () {
      return mCopy(ra.la(this.Zb), this);
    },
    f: ra,
  });
  Object.defineProperty(ra.prototype, "eventType", {
    get(){
      return OperationType.SetAvatar;
    }
  });
  
  function S() {
    this.da = 0;
    this.Md = 0;
    this.jj = null;
    this.P = 0;
  }
  S.b = !0;
  S.la = function (a, b) {
    var c = new S();
    c.Md = a;
    c.jj = b;
    return c;
  };
  S.ma = m;
  S.prototype = C(m.prototype, {
    apply: function (a) {
      var b = a.na(this.Md);
      if (null != b) {
        var c = a.na(this.P),
          d = a.Lb(this.P, 1);
        (d = d || b == c && !a.Pc && null == a.K) && (b.ea != this.jj) && (a.Mf(c, b, this.jj),
        a._PTC_ && a._PTC_(this.Md, this.jj.$, this.P)); // id, teamId, byId
      }
    },
    ua: function (a) {
      a.O(this.Md);
      a.l(this.jj.$);
    },
    va: function (a) {
      this.Md = a.M();
      a = a.lf();
      this.jj = 1 == a ? p.fa : 2 == a ? p.xa : p.Ia;
    },
    copy: function () {
      return mCopy(S.la(this.Md, this.jj), this);
    },
    f: S,
  });
  Object.defineProperty(S.prototype, "eventType", {
    get(){
      return OperationType.SetPlayerTeam;
    }
  });

  function qa() {
    this.da = 0;
    this.Pd = null;
    this.P = 0;
  }
  qa.b = !0;
  qa.la = function (a) {
    var b = new qa();
    b.Pd = a;
    return b;
  };
  qa.ma = m;
  qa.prototype = C(m.prototype, {
    apply: function (a) {
      if (a.Lb(this.P, 8)) {
        var b = a.na(this.P);
        null == a.K && ((a.S = this.Pd), (null != a.Ii && a.Ii(b, this.Pd)));
      }
    },
    ua: function (a) {
      var b = w.ha();
      this.Pd.ga(b);
      b = pako.deflateRaw(b.Sb());
      a.Ub(b.byteLength);
      a.Vb(b);
    },
    va: function (a) {
      a = pako.inflateRaw(a.sb(a.Ob()));
      this.Pd = h.ja(new F(new DataView(a.buffer, a.byteOffset, a.byteLength)));
    },
    copy: function () {
      return mCopy(qa.la(this.Pd?.copy()), this);
    },
    f: qa,
  });
  Object.defineProperty(qa.prototype, "eventType", {
    get(){
      return OperationType.SetStadium;
    }
  });
    
  function Pa() {
    this.da = 0;
    this.ea = null;
    this.Sg = null;
    this.P = 0;
  }
  Pa.b = !0;
  Pa.ma = m;
  Pa.la = function (a, b) {
    var c = new Pa();
    c.ea = a;
    c.Sg = b;
    return c;
  };
  Pa.prototype = C(m.prototype, {
    apply: function (a) {
      a.Lb(this.P, 2) && this.ea != p.Ia && (a.kb[this.ea.$] = this.Sg, (a._TCC_ && a._TCC_(this.ea.$, this.Sg, this.P)));
    },
    ua: function (a) {
      a.l(this.ea.$);
      this.Sg.ga(a);
    },
    va: function (a) {
      var b = a.lf();
      this.ea = 1 == b ? p.fa : 2 == b ? p.xa : p.Ia;
      this.Sg = new ka();
      this.Sg.ja(a);
    },
    copy: function () {
      return mCopy(Pa.la(this.ea, this.Sg?.copy()), this);
    },
    f: Pa,
  });
  Object.defineProperty(Pa.prototype, "eventType", {
    get(){
      return OperationType.SetTeamColors;
    }
  });

  function pa() {
    this.da = 0;
    this.newValue = 0;
    this.P = 0;
  }
  pa.b = !0;
  pa.la = function (a) {
    var b = new pa();
    b.newValue = a;
    return b;
  };
  pa.ma = m;
  pa.prototype = C(m.prototype, {
    apply: function (a) {
      a.Lb(this.P, 2) && (a.Pc = this.newValue, (a._TLC2_ && a._TLC2_(this.newValue, this.P)));
    },
    ua: function (a) {
      a.l(this.newValue ? 1 : 0);
    },
    va: function (a) {
      this.newValue = 0 != a.B();
    },
    copy: function () {
      return mCopy(pa.la(this.newValue), this);
    },
    f: pa,
  });
  Object.defineProperty(pa.prototype, "eventType", {
    get(){
      return OperationType.SetTeamsLock;
    }
  });

  function oa() {
    this.da = 0;
    this.V = 0;
    this.name = "";
    this.cj = "";
    this.Xb = "";
    this.conn = "";
    this.auth = "";
    this.P = 0;
  }
  oa.b = !0;
  oa.la = function (a, b, c, d, conn, auth) { // store player conn and auth
    var e = new oa();
    e.V = a;
    e.name = b;
    e.cj = c;
    e.Xb = d;
    e.conn = conn;
    e.auth = auth;
    return e;
  };
  oa.ma = m;
  oa.prototype = C(m.prototype, {
    apply: function (a, haxball) {
      if (0 == this.P) {
        var b = new ea();
        b.V = this.V;
        b.w = this.name;
        b.Kd = this.cj;
        b.Xb = this.Xb;
        b.conn = this.conn;
        b.auth = this.auth; // store auth
        a.I.push(b);
        a.tl?.(b);
        haxball?.room?._onPlayerObjectCreated?.(b);
      }
    },
    ua: function (a) {
      a.O(this.V);
      a.Db(this.name);
      a.Db(this.cj);
      a.Db(this.Xb);
    },
    va: function (a) {
      this.V = a.M();
      this.name = a.zb();
      this.cj = a.zb();
      this.Xb = a.zb();
    },
    copy: function () {
      return mCopy(oa.la(this.V, this.name, this.cj, this.Xb, this.conn, this.auth), this);
    },
    f: oa,
  });
  Object.defineProperty(oa.prototype, "eventType", {
    get(){
      return OperationType.JoinRoom;
    }
  });
  
  function qb() {
    this.da = 0;
    this.Zb = "";
    this.ze = 0;
    this.P = 0;
  }
  qb.la = function(a, b) {
    var c = new qb();
    c.Zb = null != b ? tSil(b, 2) : null;
    c.ze = a;
    return c;
  };
  qb.b = !0;
  qb.ma = m;
  qb.prototype = C(m.prototype, {
    apply: function (a) {
      a = a.na(this.ze);
      null != a && 0 == this.P && (a.Jd = this.Zb, (a._PHAC_ && a._PHAC_(this.ze, this.Zb)));
    },
    ua: function (a) {
      a.Db(this.Zb);
      a.O(this.ze);
    },
    va: function (a) {
      this.Zb = a.zb();
      this.ze = a.M();
      null != this.Zb && (this.Zb = tSil(this.Zb, 2));
    },
    copy: function () {
      return mCopy(qb.la(this.ze, this.Zb), this);
    },
    f: qb,
  });
  Object.defineProperty(qb.prototype, "eventType", {
    get(){
      return OperationType.SetHeadlessAvatar;
    }
  });
  
  function Oa() {
    this.da = 0;
    this.Bf = false;
    this.P = 0;
  }
  Oa.b = !0;
  Oa.ma = m;
  Oa.la = function(a) {
    var b = new Oa();
    b.Bf = a;
    return b;
  };
  Oa.prototype = C(m.prototype, {
    apply: function (a) {
      var b = a.K;
      if (null != b && a.Lb(this.P, 16)) {
        var c = a.na(this.P),
          d = 120 == b.Oa,
          e = 0 < b.Oa;
        this.Bf ? (b.Oa = 120) : 120 == b.Oa && (b.Oa = 119);
        (this.Bf!=d) && a.ml?.(c, this.Bf, e);
      }
    },
    ua: function (a) {
      a.l(this.Bf ? 1 : 0);
    },
    va: function (a) {
      this.Bf = 0 != a.B();
    },
    copy: function () {
      return mCopy(Oa.la(this.Bf), this);
    },
    f: Oa,
  });
  Object.defineProperty(Oa.prototype, "eventType", {
    get(){
      return OperationType.PauseResumeGame;
    }
  });
  
  function Na() {
    this.da = 0;
    this.Tc = "";
    this.P = 0;
    this._TP = null;
  }
  Na.b = !0;
  Na.ma = m;
  Na.la = function(a) {
    var b = new Na();
    b.Tc = a;
    return b;
  };
  Na.prototype = C(m.prototype, {
    $m: function (a) {
      if (null != a.hq) {
        var b = a.na(this.P);
        return null == b ? !1 : a.hq(b, this.Tc);
      }
      return !0;
    },
    apply: function (a) {
      var b = a.na(this.P);
      (b!=null) && a.rl?.(b, this.Tc);
    },
    ua: function (a) {
      a.mc(tSil(this.Tc, 140));
    },
    va: function (a) {
      this.Tc = a.ic();
      if (140 < this.Tc.length) throw new q(createError(ErrorCodes.ChatActionMessageTooLongError)); // "message too long"
    },
    copy: function () {
      return mCopy(Na.la(this.Tc), this);
    },
    f: Na,
  });
  Object.defineProperty(Na.prototype, "eventType", {
    get(){
      return OperationType.SendChat;
    }
  });
  
  function Ga() {
    this.da = 0;
    this.input = 0;
    this.P = 0;
  }
  Ga.b = !0;
  Ga.ma = m;
  Ga.la = function(a) {
    var b = new Ga();
    b.input = a;
    return b;
  };
  Ga.prototype = C(m.prototype, {
    apply: function (a) {
      var b = a.na(this.P);
      if (null != b) {
        var c = this.input;
        0 == (b.ob & 16) && 0 != (c & 16) && (b.Wb = !0);
        b.ob = c;
        null != a.iq && a.iq(b);
      }
    },
    ua: function (a) {
      a.tb(this.input);
    },
    va: function (a) {
      this.input = a.hb();
    },
    copy: function () {
      return mCopy(Ga.la(this.input), this);
    },
    f: Ga,
  });
  Object.defineProperty(Ga.prototype, "eventType", {
    get(){
      return OperationType.SendInput;
    }
  });
  
  function na() {
    this.da = 0;
    this.sj = 0;
    this.id = null;
    this.mode = null;
    this.P = 0;
  }
  na.b = !0;
  na.la = function (a, id, mode) {
    var b = new na();
    b.sj = a;
    b.id = id;
    b.mode = mode;
    return b;
  };
  na.ma = m;
  na.prototype = C(m.prototype, {
    apply: function (a) {
      var b = a.na(this.P);
      if (null != b){
        if (this.id != null){
          a._CCI_ && a._CCI_(b, this.id, this.mode);
          return;
        }
        a.wl?.(b, this.sj);
      }
    },
    ua: function (a) {
      a.l(this.sj);
      if (this.id!=null && this.mode!=null){
        a.O(this.id);
        a.l(this.mode);
      }
    },
    va: function (a, replayMode) {
      this.sj = a.B();
      if (!replayMode){
        try{
          this.id = a.M();
          this.mode = a.B();
        }catch(ex){}
      }
    },
    copy: function () {
      return mCopy(na.la(this.sj, this.id, this.mode), this);
    },
    f: na,
  });
  Object.defineProperty(na.prototype, "eventType", {
    get(){
      return OperationType.SendChatIndicator;
    }
  });
  
  function CustomEvent() {
    this.da = 0;
    this.type = 0;
    this.data = null;
    this.P = 0;
  }
  CustomEvent.la = function(type, data){
    var msg = new CustomEvent();
    msg.type = type;
    msg.data = data;
    return msg;
  }
  CustomEvent.b = true;
  CustomEvent.ma = m;
  CustomEvent.prototype = C(m.prototype, {
    apply: function (a) {
      var b = a.na(this.P);
      null != b && a._CE_ && a._CE_(this.type, this.data, this.P);
    },
    ua: function (a) {
      a.tb(this.type);
      a.mc(JSON.stringify(this.data));
    },
    va: function (a) {
      this.type = a.hb();
      this.data = JSON.parse(a.ic());
    },
    copy: function () {
      return mCopy(CustomEvent.la(this.type, JSON.parse(JSON.stringify(this.data))), this);
    },
    f: CustomEvent,
  });
  Object.defineProperty(CustomEvent.prototype, "eventType", {
    get(){
      return OperationType.CustomEvent;
    }
  });
  
  function BinaryCustomEvent() {
    this.da = 0;
    this.type = 0;
    this.data = null;
    this.P = 0;
  }
  BinaryCustomEvent.la = function(type, data){
    var msg = new BinaryCustomEvent();
    msg.type = type;
    msg.data = data;
    return msg;
  }
  BinaryCustomEvent.b = true;
  BinaryCustomEvent.ma = m;
  BinaryCustomEvent.prototype = C(m.prototype, {
    apply: function (a) {
      var b = a.na(this.P);
      null != b && a._BCE_ && a._BCE_(this.type, this.data, this.P);
    },
    ua: function (a) {
      var b = w.ha();
      b.tb(this.type);
      b.Vb(this.data);
      b = pako.deflateRaw(b.Sb());
      a.tb(b.byteLength);
      a.Vb(b);
    },
    va: function (a) {
      a = pako.inflateRaw(a.sb(a.hb()));
      var b = new F(new DataView(a.buffer, a.byteOffset, a.byteLength));
      this.type = b.hb();
      this.data = b.sb();
    },
    copy: function () {
      var a = new Uint8Array();
      a.set(this.data);
      return mCopy(BinaryCustomEvent.la(this.type, a), this);
    },
    f: BinaryCustomEvent,
  });
  Object.defineProperty(BinaryCustomEvent.prototype, "eventType", {
    get(){
      return OperationType.BinaryCustomEvent;
    }
  });
  
  function IdentityEvent() {
    this.da = 0;
    this.id = 0;
    this.data = null;
    this.P = 0;
  }
  IdentityEvent.la = function(id, data){
    var msg = new IdentityEvent();
    msg.id = id;
    msg.data = data;
    return msg;
  }
  IdentityEvent.b = true;
  IdentityEvent.ma = m;
  IdentityEvent.prototype = C(m.prototype, {
    apply: function (a) {
      if (0 != this.P)
        return;
      b = a.na(this.id);
      null != b && a._IE_ && (
        b.identity = this.data,
        a._IE_(this.id, this.data, this.P)
      );
    },
    ua: function (a) {
      a.tb(this.id);
      a.mc(JSON.stringify(this.data));
    },
    va: function (a) {
      this.id = a.hb();
      this.data = JSON.parse(a.ic());
    },
    copy: function () {
      return mCopy(IdentityEvent.la(this.id, JSON.parse(JSON.stringify(this.data))), this);
    },
    f: IdentityEvent,
  });
  Object.defineProperty(IdentityEvent.prototype, "eventType", {
    get(){
      return OperationType.SetPlayerIdentity;
    }
  });

  function Y() {
    this.da = 0;
    this.V = 0;
    this.fd = null;
    this.Qg = false;
    this.P = 0;
  }
  Y.b = !0;
  Y.la = function (a, b, c) {
    var d = new Y();
    d.V = a;
    d.fd = b;
    d.Qg = c;
    return d;
  };
  Y.ma = m;
  Y.prototype = C(m.prototype, {
    apply: function (a) {
      if (0 != this.V && a.Lb(this.P, 128)) {
        var b = a.na(this.V);
        if (null != b) {
          var c = a.na(this.P);
          D.remove(a.I, b);
          null != a.K && D.remove(a.K.ta.F, b.H);
          a.ul?.(b, this.fd, this.Qg, c);
        }
      }
    },
    ua: function (a) {
      null != this.fd && (this.fd = tSil(this.fd, 100));
      a.O(this.V);
      a.Db(this.fd);
      a.l(this.Qg ? 1 : 0);
    },
    va: function (a) {
      this.V = a.M();
      this.fd = a.zb();
      this.Qg = 0 != a.B();
      if (null != this.fd && 100 < this.fd.length)
        throw new q(createError(ErrorCodes.KickBanReasonTooLongError)); // "string too long"
    },
    copy: function () {
      return mCopy(Y.la(this.V, this.fd, this.Qg), this);
    },
    f: Y,
  });
  Object.defineProperty(Y.prototype, "eventType", {
    get(){
      return OperationType.KickBanPlayer;
    }
  });

  function pb() {
    this.da = 0;
    this.Zg = null;
    this.Zm = true;
    this.P = 0;
  }
  pb.la = function(a, b) {
    for (var c = new pb, d = new Set, e = 0; e < a.length; )
      d.add(a[e++]);
    a = [];
    for (var e = 0, d = d.values(), f = d.next(); !f.done; ) {
      var h = f.value, f = d.next();
      a.push(h);
      ++e;
      if (e>=40)
        break;
    }
    c.Zg = a;
    c.Zm = b;
    return c;
  }
  pb.b = !0;
  pb.ma = m;
  pb.prototype = C(m.prototype, {
    apply: function (a) {
      if (0 == this.P) {
        for (var b = new Map(), c = 0, d = a.I; c < d.length; ) {
          var e = d[c];
          ++c;
          b.set(e.V, e);
        }
        c = [];
        d = 0;
        for (e = this.Zg; d < e.length; ) {
          var f = e[d];
          ++d;
          var g = b.get(f);
          null != g && (b["delete"](f), c.push(g));
        }
        d = [];
        b = b.values();
        for (e = b.next(); !e.done; ) (f = e.value), (e = b.next()), d.push(f);
        a.I = this.Zm ? c.concat(d) : d.concat(c);
        (a._RP_ && a._RP_(this.Zg, this.Zm)); // playerIdList, moveToTop
      }
    },
    ua: function (a) {
      a.l(this.Zm ? 1 : 0);
      a.l(this.Zg.length);
      for (var b = 0, c = this.Zg; b < c.length; ) a.O(c[b++]);
    },
    va: function (a) {
      this.Zm = 0 != a.B();
      var b = a.B();
      this.Zg = [];
      for (var c = 0; c < b; ) ++c, this.Zg.push(a.M());
    },
    copy: function () {
      var a = new pb();
      a.Zm = this.Zm;
      var d = this.Zg;
      a.Zg = [];
      for (var b = d.length, c = 0; c < b; c++) a.Zg.push(d[c]);
      return mCopy(a, this);
    },
    f: pb,
  });
  Object.defineProperty(pb.prototype, "eventType", {
    get(){
      return OperationType.ReorderPlayers;
    }
  });
  
  function ob() {
    this.da = 0;
    this.ze = 0;
    this.Sm = false;
    this.Ka = null;
    this.Rc = null;
    this.P = 0;
  }
  ob.b = !0;
  ob.la = function(a, b, c) {
    var d = new ob;
    d.ze = a;
    d.Sm = b;
    d.Ka = [c.x, c.y, c.xspeed, c.yspeed, c.xgravity, c.ygravity, c.radius, c.bCoeff, c.invMass, c.damping];
    d.Rc = [c.color, c.cMask, c.cGroup];
    a = 0;
    for (b = d.Ka.length; a < b; ) {
      c = a++;
      var e = d.Ka[c];
      null != e && (ob._Gf_[0] = e,
      d.Ka[c] = ob._Gf_[0])
    }
    a = 0;
    for (b = d.Rc.length; a < b; )
      c = a++,
      e = d.Rc[c],
      null != e && (ob._Jf_[0] = e,
      d.Rc[c] = ob._Jf_[0]);
    return d
  }
  ob.ma = m;
  ob.prototype = C(m.prototype, {
    apply: function (a) {
      if (0 == this.P) {
        var b = a.K, c = a;
        if (null != b) {
          if (this.Sm) {
            a = a.na(this.ze);
            if (null == a) return;
            a = a.H;
          } else a = b.ta.F[this.ze];
          null != a &&
            (null != this.Ka[0] && (a.a.x = this.Ka[0]),
            null != this.Ka[1] && (a.a.y = this.Ka[1]),
            null != this.Ka[2] && (a.D.x = this.Ka[2]),
            null != this.Ka[3] && (a.D.y = this.Ka[3]),
            null != this.Ka[4] && (a.oa.x = this.Ka[4]),
            null != this.Ka[5] && (a.oa.y = this.Ka[5]),
            null != this.Ka[6] && (a.Z = this.Ka[6]),
            null != this.Ka[7] && (a.m = this.Ka[7]),
            null != this.Ka[8] && (a.aa = this.Ka[8]),
            null != this.Ka[9] && (a.Ca = this.Ka[9]),
            null != this.Rc[0] && (a.R = this.Rc[0]),
            null != this.Rc[1] && (a.h = this.Rc[1]),
            null != this.Rc[2] && (a.v = this.Rc[2]),
            (c._SDP_ && c._SDP_(this.ze, this.Sm, this.Ka, this.Rc))); // id, type, data1, data2
        }
      }
    },
    ua: function (a) {
      a.O(this.ze);
      a.l(this.Sm ? 1 : 0);
      var b = a.a;
      a.Ub(0);
      for (var c = 0, d = 1, e = 0, f = this.Ka; e < f.length; ) {
        var g = f[e];
        ++e;
        null != g && ((c |= d), a.Wi(g));
        d <<= 1;
      }
      e = 0;
      for (f = this.Rc; e < f.length; )
        (g = f[e]), ++e, null != g && ((c |= d), a.O(g)), (d <<= 1);
      d = a.a;
      a.a = b;
      a.Ub(c);
      a.a = d;
    },
    va: function (a) {
      this.ze = a.M();
      this.Sm = 0 != a.B();
      var b = a.Ob();
      this.Ka = [];
      for (var c = 0; 10 > c; ) {
        var d = c++;
        this.Ka[d] = null;
        0 != (b & 1) && (this.Ka[d] = a.mi());
        b >>>= 1;
      }
      this.Rc = [];
      for (c = 0; 3 > c; )
        (d = c++),
          (this.Rc[d] = null),
          0 != (b & 1) && (this.Rc[d] = a.M()),
          (b >>>= 1);
    },
    copy: function () {
      var a = new ob();
      a.ze = this.ze;
      a.Sm = this.Sm;
      var d = this.Ka;
      a.Ka = [];
      for (var b = d.length, c = 0; c < b; c++) a.Ka.push(d[c]);
      d = this.Rc;
      a.Rc = [];
      for (var b = d.length, c = 0; c < b; c++) a.Rc.push(d[c]);
      return mCopy(a, this);
    },
    f: ob,
  });
  Object.defineProperty(ob.prototype, "eventType", {
    get(){
      return OperationType.SetDiscProperties;
    }
  });
  
  function Ma() {
    this.da = 0;
    this.P = 0;
  }
  Ma.b = !0;
  Ma.ma = m;
  Ma.la = function () {
    return new Ma();
  };
  Ma.prototype = C(m.prototype, {
    apply: function (a) {
      a.Lb(this.P, 32) && a.yr(a.na(this.P), 0);
    },
    ua: function () {},
    va: function () {},
    copy: function () {
      return mCopy(Ma.la(), this);
    },
    f: Ma,
  });
  Object.defineProperty(Ma.prototype, "eventType", {
    get(){
      return OperationType.StartGame;
    }
  });
  
  function ma() {
    this.da = 0;
    this.min = 0;
    this.nj = 0;
    this.aj = 0;
    this.P = 0;
  }
  ma.b = !0;
  ma.la = function (a, b, c) {
    var d = new ma();
    d.min = a;
    d.nj = b;
    d.aj = c;
    return d;
  };
  ma.ma = m;
  ma.prototype = C(m.prototype, {
    apply: function (a) {
      a.Lb(this.P, 2) && a.mr(a.na(this.P), this.min, this.nj, this.aj);
    },
    ua: function (a) {
      a.O(this.min);
      a.O(this.nj);
      a.O(this.aj);
    },
    va: function (a) {
      this.min = a.M();
      this.nj = a.M();
      this.aj = a.M();
    },
    copy: function () {
      return mCopy(ma.la(this.min, this.nj, this.aj), this);
    },
    f: ma,
  });
  Object.defineProperty(ma.prototype, "eventType", {
    get(){
      return OperationType.SetKickRateLimit;
    }
  });

  function la() {
    this.da = 0;
    this.we = null;
    this.P = 0;
  }
  la.ma = m;
  la.prototype = C(m.prototype, {
    apply: function (a) {
      if (0 == this.P) {
        var e = a;
        a = a.I;
        for (var b = 0, c = a.length; b < c; ) {
          var d = b++;
          if (d >= this.we.length) break;
          a[d].yb = this.we[d];
        }
        e._PD_ && e._PD_(this.we); // ping array
      }
    },
    ua: function (a) {
      a.lb(this.we.length);
      for (var b = 0, c = this.we; b < c.length; ) a.lb(c[b++]);
    },
    va: function (a) {
      this.we = [];
      for (var b = a.Ab(), c = 0; c < b; ) ++c, this.we.push(a.Ab());
    },
    copy: function () {
      var a = new la(), d = this.we;
      a.we = [];
      for (var b = d.length, c = 0; c < b; c++) a.we.push(d[c]);
      return mCopy(a, this);
    },
    f: la,
  });
  la.b = !0;
  la.la = function (a) {
    for (var b = new la(), c = a.T.I, d = [], e = 0; e < c.length; ) {
      var f = a.Ie.get(c[e++].V);
      d.push(null == f ? (a.T._HP_ && a.T._HP_()) : f.yb);
    }
    b.we = d;
    return b;
  };
  Object.defineProperty(la.prototype, "eventType", {
    get(){
      return OperationType.Ping;
    }
  });
  
  function La() {
    this.da = 0;
    this.P = 0;
  }
  La.b = !0;
  La.ma = m;
  La.la = function () {
    return new La();
  };
  La.prototype = C(m.prototype, {
    apply: function (a) {
      if (a.Lb(this.P, 32)) {
        var b = a.na(this.P);
        if (null != a.K) {
          a.K = null;
          for (var c = 0, d = a.I; c < d.length; ) {
            var e = d[c];
            ++c;
            e.H && a._PDD_?.(e);
            e.H = null;
            e.Jb = 0;
          }
          a._RI_ && a._RI_();
          null != a.vf && a.vf(b);
        }
      }
    },
    ua: function () {},
    va: function () {},
    copy: function () {
      return mCopy(La.la(), this);
    },
    f: La,
  });
  Object.defineProperty(La.prototype, "eventType", {
    get(){
      return OperationType.StopGame;
    }
  });

  Ua.za = m.Fa({ Ba: !1, Aa: !1 });
  ta.za = m.Fa({ Ba: !1, Aa: !1 });
  rb.za = m.Fa({ Ba: !1, Aa: !1, oj: { $i: 10, uj: 900 } });
  Qa.za = m.Fa({ Ba: !1, Aa: !1 });
  da.za = m.Fa({ Ba: !1, Aa: !1 });
  sa.za = m.Fa({ Ba: !1, Aa: !1 });
  ra.za = m.Fa({ Ba: !1, Aa: !1 });
  S.za = m.Fa({ Ba: !1, Aa: !1 });
  qa.za = m.Fa({ Ba: !1, Aa: !1, oj: { $i: 10, uj: 2e3 } });
  Pa.za = m.Fa({ Ba: !1, Aa: !1 });
  pa.za = m.Fa({ Ba: !1, Aa: !1 });
  oa.za = m.Fa({ Ba: !1, Aa: !1 });
  qb.za = m.Fa({ Ba: !1, Aa: !1 });
  Oa.za = m.Fa({});
  Na.za = m.Fa({ Ba: !1, Aa: !1, oj: { $i: 10, uj: 900 } });
  Ga.za = m.Fa({});
  na.za = m.Fa({ Ba: !1, Aa: !1 });
  Y.za = m.Fa({ Ba: !1, Aa: !1 });
  pb.za = m.Fa({ Ba: !1, Aa: !1 });
  ob.za = m.Fa({ Ba: !1, Aa: !1 });
  ob._Gf_ = new Float32Array(1);
  ob._Jf_ = new Int32Array(1);
  ma.za = m.Fa({ Ba: !1, Aa: !1 });
  Ma.za = m.Fa({ Ba: !1, Aa: !1 });
  La.za = m.Fa({ Ba: !1, Aa: !1 });
  la.za = m.Fa({ Ba: !1, Aa: !1 });
  CustomEvent.za = m.Fa({ Ba: !1, Aa: !1 });
  BinaryCustomEvent.za = m.Fa({ Ba: !1, Aa: !1 });
  IdentityEvent.za = m.Fa({ Ba: !1, Aa: !1 });

  m.Ha(rb);
  m.Ha(na);
  m.Ha(Ua);
  m.Ha(Ga);
  m.Ha(Na);
  m.Ha(oa);
  m.Ha(Y);
  m.Ha(Ma);
  m.Ha(La);
  m.Ha(Oa);
  m.Ha(da);
  m.Ha(qa);
  m.Ha(S);
  m.Ha(pa);
  m.Ha(sa);
  m.Ha(Qa);
  m.Ha(ta);
  m.Ha(la);
  m.Ha(ra);
  m.Ha(Pa);
  m.Ha(pb);
  m.Ha(ma);
  m.Ha(qb);
  m.Ha(ob);
  m.Ha(CustomEvent);
  m.Ha(BinaryCustomEvent);
  m.Ha(IdentityEvent);

  function ub(a, b) {
    this.ya = a;
    this.ba = b;
  }
  ub.__cq__ = function (teamId, angle, ...colors) {
    var c = new ka(), d = p.byId[teamId];
    if (!d)
      throw new q(createError(ErrorCodes.ChangeTeamColorsInvalidTeamIdError)); // "Invalid team id"
    c.fb = [d.R];
    var b = Pa.la(d, c);
    var l = colors.length;
    if (l < 1)
      return b;
    if (l > 4)
      l = 4;
    c.hd = ((256 * K.parseInt(angle)) / 360) | 0;
    c.ed = K.parseInt("0x" + colors[0]);
    if (1 < l) {
      c.fb = [];
      for (var i = 1, e = l; i < e; )
        c.fb.push(K.parseInt("0x" + colors[i++]));
    }
    return b;
  };
  
  function Zb() {}
  Zb.b = !0;
  Zb.Km = [
    { name: "ro", reliable: !0, kj: !0 },
    { name: "ru", reliable: !0, kj: !1 },
    { name: "uu", reliable: !1, kj: !1 },
  ];
  function Ia() {
    this.list = [];
  }
  Ia.b = !0;
  Ia.ss = function (a, b, c) {
    if (0 == a.length) for (a = 0; a < b.length; ) c.push(b[a++]);
    else if (0 == b.length) for (b = 0; b < a.length; ) c.push(a[b++]);
    else
      for (var d = 0, e = a.length, f = 0, g = b.length; ; ) {
        var k = a[d],
          l = b[f];
        if (k.mb <= l.mb) {
          if ((c.push(k), ++d, d >= e)) {
            for (; f < g; ) c.push(b[f++]);
            break;
          }
        } else if ((c.push(l), ++f, f >= g)) {
          for (; d < e; ) c.push(a[d++]);
          break;
        }
      }
  };
  Ia.prototype = {
    Rm: function (a) {
      for (
        var b = 0, c = a.mb, d = a.da, e = 0, f = this.list;
        e < f.length;

      ) {
        var g = f[e];
        ++e;
        var k = g.mb;
        if (k > c) break;
        if (k == c) {
          g = g.da;
          if (g > d) break;
          g == d && ++d;
        }
        ++b;
      }
      a.da = d;
      this.list.splice(b, 0, a);
    },
    Cs: function (a) {
      for (var b = 0, c = 0, d = this.list; c < d.length && !(d[c++].mb >= a); )
        ++b;
      this.list.splice(0, b);
    },
    as: function (a, b) {
      for (var c = this.list; 0 < c.length; ) c.pop();
      Ia.ss(a.list, b.list, this.list);
    },
    Ds: function (a) {
      for (var b = 0, c = this.list, d = 0, e = c.length; d < e; ) {
        var f = c[d++];
        f.ue != a && ((c[b] = f), ++b);
      }
      for (; c.length > b; ) c.pop();
    },
    bs: function (a) {
      for (var b = 0, c = 0, d = this.list; c < d.length && !(d[c++].mb >= a); )
        ++b;
      return b;
    },
    f: Ia,
  };

  function Mb(a) {
    this.rs = a;
    this.$a = [];
  }
  Mb.b = !0;
  Mb.prototype = {
    add: function (a) {
      for (var b = this.$a.length, c = 0, d = (this.Qd = 0); d < b; ) {
        var e = d++,
          f = this.$a[e];
        f.index++;
        f.weight *= 0.97;
        this.$a[c].index < f.index && (c = e);
        this.Qd += f.weight;
      }
      b >= this.rs
        ? ((b = this.$a[c]), (this.Qd -= b.weight), this.$a.splice(c, 1))
        : (b = {});
      b.value = a;
      b.weight = 1;
      b.index = 0;
      this.Qd += b.weight;
      for (a = 0; a < this.$a.length && this.$a[a].value <= b.value; ) ++a;
      this.$a.splice(a, 0, b);
    },
    $g: function (a) {
      if (0 == this.$a.length) return 0;
      if (1 == this.$a.length) return this.$a[0].value;
      a *= this.Qd;
      for (
        var b = this.$a[0].weight, c = 0;
        c < this.$a.length - 1 && !(b >= a);
  
      )
        ++c, (b += this.$a[c].weight);
      return this.$a[c].value;
    },
    max: function () {
      return 0 == this.$a.length ? 0 : this.$a[this.$a.length - 1].value;
    },
    f: Mb,
  };
  
  function yb(a) {
    this.Y = 0; // frame no
    this.T = a;
  }
  yb.b = !0;
  yb.prototype = { f: yb };
  
  function V(a) {
    this.Ri = new Ia();
    this.te = 0; // total number of received messages
    this.cc = 0; // immediate number of received messages per frame
    this.le = new Ia();
    this.uc = this.bc = this.rd = 0;
    this.Ac = 0.06;
    this.mh = 16.666666666666668;
    this.Ff = 120;
    yb.call(this, a);
  }
  
  V.b = !0;
  V.ma = yb;
  V.prototype = C(yb.prototype, {
    ra: function () {
      throw new q(createError(ErrorCodes.MissingImplementationError)); // "missing implementation"
    },
    Sf: function () {
      throw new q(createError(ErrorCodes.MissingImplementationError)); // "missing implementation"
    },
    C: function () {
      throw new q(createError(ErrorCodes.MissingImplementationError)); // "missing implementation"
    },
    zj: function (a) {
      for (var b = this.le.list, c = 0, d = b.length, e = 0; e < a; ) {
        for (++e; c < d; ) {
          var f = b[c];
          if (f.mb != this.Y) break;
          f.apply(this.T);
          null != this.fc && this.fc(f);
          this.cc++;
          ++c;
        }
        this.T.C(1);
        this.te += this.cc;
        this.cc = 0;
        this.Y++;
      }
      for (; c < d; ) {
        a = b[c];
        if (a.mb != this.Y || a.da != this.cc) break;
        a.apply(this.T);
        null != this.fc && this.fc(a);
        this.cc++;
        ++c;
      }
      b.splice(0, c);
    },
    Cg: function (a) {
      a.mb == this.Y && a.da <= this.cc
        ? ((a.da = this.cc++), a.apply(this.T, this.haxball), null != this.fc && this.fc(a))
        : this.le.Rm(a);
    },
    wk: function (a, b) {
      if (0 >= a) return this.T;
      a > this.Ff && (a = this.Ff);
      yazc++;
      var c = this.T.sc(/*this.haxball*/), d;
      null != b ? (this.Ri.as(this.le, b), (d = this.Ri)) : (d = this.le);
      d = d.list;
      for (
        var e = 0, f = d.length, g = this.Y, k = a | 0, l = g + k;
        g <= l;
  
      ) {
        for (; e < f; ) {
          var t = d[e];
          if (t.mb > g) break;
          t.zf.Ba && t.apply(c);
          ++e;
        }
        c.C(g != l ? 1 : a - k);
        ++g;
      }
      for (d = this.Ri.list; 0 < d.length; ) d.pop();
      return c;
    },
    kr: function (a) {
      //300 < a && (a = 300);
      //0 > a && (a = 0);
      this.bc = (this.Ac * a) | 0;
      this.T._HC_ && this.T._HC_(a);
    },
    gm: function (a) {
      this.rd = this.Ac * a;
      this.T._EC_ && this.T._EC_(a);
    },
    f: V,
  });
  
  function tb(a, b) {
    this.Nj = a;
    this.Si = b;
    this.oc = a;
    this.Ve = performance.now();
  }
  tb.b = !0;
  tb.prototype = {
    Cm: function (a) {
      null == a && (a = 1);
      this.C();
      return a <= this.oc ? ((this.oc -= a), !0) : !1;
    },
    Cr: function (a) {
      this.C();
      a -= this.oc;
      return 0 >= a ? 0 : this.Ve + a * this.Si - performance.now();
    },
    Zn: function (a, b) {
      var c = this.Cr(a);
      this.oc -= a;
      setTimeout(b, c | 0);
    },
    C: function () {
      var a = performance.now(),
        b = Math.floor((a - this.Ve) / this.Si);
      this.Ve += b * this.Si;
      this.oc += b;
      this.oc >= this.Nj && ((this.oc = this.Nj), (this.Ve = a));
    },
    f: tb,
  };
  function Va(a, b, c) {
    this.gd = this.re = null;
    this.oe = [];
    this.ak = 0;
    this.hl = !1;
    this.Uf = [];
    this.Vc = [];
    var d = this;
    this.Ra = new RTCPeerConnection({ iceServers: b }, Va.Yn);
    this.Sh = new Promise(function (a) {
      d.Vo = a;
    });
    this.Ra.onicecandidate = function (a) {
      null == a.candidate
        ? d.Vo(d.Uf)
        : ((a = a.candidate),
          null != a.candidate &&
            "" != a.candidate &&
            (null != d.jg && d.jg(a), d.Uf.push(a)));
    };
    for (b = 0; b < c.length; ) this.co(c[b++]);
    this.$ = a;
  }
  Va.b = !0;
  Va.Yn = { mandatory: { OfferToReceiveAudio: !1, OfferToReceiveVideo: !1 } };
  Va.prototype = {
    Mi: function (a) {
      null == a && (a = 1e4);
      clearTimeout(this.re);
      this.re = setTimeout(this.To.bind(this), a);
    },
    bo: function (a, b) {
      var c = this;
      this.ck(
        this.Ra.setRemoteDescription(a).then(function () {
          return c.Ra.createAnswer();
        }),
        b,
        500
      );
    },
    eo: function () {
      this.ck(this.Ra.createOffer(), [], 1e3);
    },
    ck: function (a, b, c) {
      var d = this;
      a.then(function (a) {
        return d.Ra.setLocalDescription(a).then(function () {
          return a;
        });
      })
        .then(function (a) {
          function e() {
            return a;
          }
          for (var g = 0; g < b.length; ) d.yj(b[g++]);
          return pWT(d.Sh, c).then(e, e);
        })
        .then(function (a) {
          d.di(a); // d.di is not a function???
        })
        ["catch"](function (ex) {
          console.log(ex);
          d.Tf();
        });
    },
    co: function (a) {
      var b = this,
        c = { id: this.Vc.length, negotiated: !0, ordered: a.kj };
      a.reliable || (c.maxRetransmits = 0);
      a = this.Ra.createDataChannel(a.name, c);
      a.binaryType = "arraybuffer";
      a.onopen = function () {
        for (var a = 0, c = b.Vc; a < c.length; )
          if ("open" != c[a++].readyState) return;
        null != b.zd && b.zd();
      };
      a.onclose = function () {
        b.Tf();
      };
      a.onmessage = function () {
        b.Tf();
      };
      this.Vc.push(a);
    },
    yj: function (a) {
      var b = this;
      setTimeout(function () {
        return b.Ra.addIceCandidate(a);
      }, this.ak);
    },
    To: function () {
      this.Tf();
    },
    Tf: function () {
      null != this.bd && this.bd();
      this.ia();
    },
    ia: function () {
      this.Tj();
      this.Ra.close();
    },
    Tj: function () {
      clearTimeout(this.re);
      this.di = this.zd = this.jg = this.bd = null;
      this.Ra.onicecandidate = null;
      this.Ra.ondatachannel = null;
      this.Ra.onsignalingstatechange = null;
      this.Ra.oniceconnectionstatechange = null;
      for (var a = 0, b = this.Vc; a < b.length; ) {
        var c = b[a];
        ++a;
        c.onopen = null;
        c.onclose = null;
        c.onmessage = null;
      }
    },
    f: Va,
  };
  
  function Nb(a) {
    this.Eq = 1e4;
    this.wd = !0;
    var b = this;
    a.Tj();
    this.Ra = a.Ra;
    this.Vc = a.Vc;
    this.oe = a.oe;
    this.gd = a.gd;
    this.ym = performance.now();
    var c = null,
      c = function () {
        var a = b.Eq - b.Br();
        0 >= a
          ? b.ia()
          : (clearTimeout(b.Am),
            (a = setTimeout(c, a + 1e3)),
            (b.Am = a));
      };
    c();
    this.Ra.oniceconnectionstatechange = function () {
      var a = b.Ra.iceConnectionState;
      ("closed" != a && "failed" != a) || b.ia();
    };
    a = 0;
    for (var d = this.Vc; a < d.length; ) {
      var e = d[a];
      ++a;
      e.onmessage = function (a) {
        b.wd &&
          ((b.ym = performance.now()), null != b.lg && b.lg(a.data));
      };
      e.onclose = function () {
        b.ia();
      };
    }
  }
  Nb.b = !0;
  Nb.prototype = {
    Br: function () {
      return performance.now() - this.ym;
    },
    Rb: function (a, b) {
      if (this.wd) {
        var c = this.Vc[a];
        if ("open" == c.readyState) {
          var d = b.Kg();
          try {
            c.send(d);
          } catch (e) {
            console.log(e instanceof q ? e.Ta : e);
          }
        }
      }
    },
    ia: function () {
      clearTimeout(this.Am);
      this.wd &&
        ((this.wd = !1), this.Ra.close(), null != this.cf && this.cf());
    },
    f: Nb,
  };

  // constant error generators...
  function specialError(code){
    switch(code){
      case 4001:
        return createError(ErrorCodes.RoomClosed); // "The room was closed."
      case 4100:
        return createError(ErrorCodes.RoomFull); // "The room is full."
      case 4101:
        return createError(ErrorCodes.WrongPassword); // "Wrong password."
      case 4102:
        return createError(ErrorCodes.BannedBefore); // "You are banned from this room."
      case 4103:
        return createError(ErrorCodes.IncompatibleVersion); // "Incompatible game version."
    }
    return createError(ErrorCodes.ConnectionClosed, code); // "Connection closed (" + a + ")"
  }
  var Ob = {
    Error: ()=>([createError(ErrorCodes.MasterConnectionError), createError(ErrorCodes.MasterConnectionError)]),
    jh: ()=>([createError(ErrorCodes.FailedHost), createError(ErrorCodes.Failed)]),
    hh: ()=>([createError(ErrorCodes.Cancelled), createError(ErrorCodes.Empty)]),
    lh: (code)=>([specialError(code)])
  };

  function wb(a, b, c, d, e, f, proxyAgent, identityToken) {
    this.rh = this.yh = !1;
    this.proxyAgent = proxyAgent;
    this.identityToken = identityToken;
    if (!config.proxy && identityToken){
      clpip();
      identityToken = null;
    }
    var g = this;
    this.pa = new Va(0, b, d);
    this.pa.bd = function () {
      g.Oe(Ob.jh());
    };
    this.pa.zd = function () {
      null != g.zd && g.zd(new Nb(g.pa));
      g.pa = null;
      g.Uj();
    };
    this.pa.di = function (b) {
      g.jr = b;
      config.proxy?.WebSocketUrl && (a = config.proxy.WebSocketUrl);
      (!a.endsWith("client")) && (((!a.endsWith("/")) && (a += "/")), a += "client");
      var protocols = identityToken ? [identityToken] : [];
      if (g.proxyAgent || config.proxy?.WebSocketChangeOriginAllowed){ // custom environment
        var propsObj = {};
        if (g.proxyAgent)
          propsObj.agent = g.proxyAgent;
        if (config.proxy.WebSocketChangeOriginAllowed)
          propsObj.headers = {
            Origin: (config.backend.secure?"https":"http")+"://"+config.backend.hostname
          };
        g.X = new WebSocket(a + "?id=" + c + (null == f ? "" : "&token=" + f), protocols, propsObj);
      }
      else // browser
        g.X = new WebSocket(a + "?id=" + c + (null == f ? "" : "&token=" + f), protocols);
      g.X.binaryType = "arraybuffer";
      g.X.onclose = function (a) {
        g.yh || g.Oe(Ob.lh(a.code));
      };
      g.X.onerror = function () {
        g.yh || g.Oe(Ob.Error());
      };
      g.X.onmessage = g.Ph.bind(g);
      g.X.onopen = function () {
        null != g.gl && g.gl();
        g.pa.Mi();
        g.Bi(g.jr, g.pa.Uf, e);
        g.pa.jg = g.yi.bind(g);
        g.pa.Sh.then(function () {
          g.Nc(0, null);
        });
      };
    };
    this.pa.eo();
  }
  wb.b = !0;
  wb.prototype = {
    Gn: function () {
      this.Oe(Ob.hh());
    },
    Uj: function () {
      try{
        null != this.X &&
          ((this.X.onclose = null),
          (this.X.onmessage = null),
          (this.X.onerror = null),
          (this.X.onopen = null),
          this.X.close(),
          (this.X = null));
      }catch(ex){}
      null != this.pa && (this.pa.ia(), (this.pa = null));
    },
    Oe: function (a) {
      null != this.bd && this.bd(a);
      this.Uj();
    },
    Ph: function (a) {
      a = new F(new DataView(a.data));
      var b = a.B();
      0 < a.o.byteLength - a.a &&
        (a = new F(new DataView(pako.inflateRaw(a.sb()).buffer), !1));
      switch (b) {
        case 1:
          for (var b = a.ic(), c = a.wg(), d = [], e = 0; e < c.length; )
            d.push(new RTCIceCandidate(c[e++]));
          this.Oh(b, d, a);
          break;
        case 4:
          this.Nh(new RTCIceCandidate(a.wg()));
      }
    },
    Oh: function (a, b) {
      var c = this;
      this.pa.Mi(this.rh ? 1e4 : 4e3);
      this.yh = !0;
      null != this.Zk && this.Zk();
      this.pa.Ra.setRemoteDescription(
        new RTCSessionDescription({ sdp: a, type: "answer" }),
        function () {
          for (var a = 0; a < b.length; ) c.pa.Ra.addIceCandidate(b[a++]);
        },
        function () {
          c.Oe(Ob.Error());
        }
      );
    },
    Nh: function (a) {
      this.pa.Ra.addIceCandidate(a);
    },
    Nc: function (a, b) {
      if (null != this.X) {
        var c = w.ha(32, !1);
        c.l(a);
        null != b && c.Vb(pako.deflateRaw(b.Sb()));
        this.X.send(c.Hd());
      }
    },
    Bi: function (a, b, c) {
      var d = w.ha(32, !1);
      d.l(this.rh ? 1 : 0);
      d.mc(a.sdp);
      d.Ng(b);
      null != c && d.Vb(c.Sb());
      this.Nc(1, d);
    },
    yi: function (a) {
      var b = w.ha(32, !1);
      b.Ng(a);
      this.Nc(4, b);
    },
    f: wb,
  };
  
  function xa(haxball, a, b) {
    this.haxball = haxball;
    this.Di = [];
    this.pi = [];
    this.ug = new Ia();
    this.Ap = 1;
    this.pd = this.zm = 0;
    this.Qi = new Mb(50);
    this.sg = new Mb(50);
    this.nn = 1e3;
    this.ek = createError(ErrorCodes.Empty); // "";
    var c = this;
    V.call(this, b.state);
    this.Uh = b.Ms;
    this.Je = b.ds;
    var d = null,
      d = function (e) {
        c.tf(0);
        var f = w.ha();
        f.Ub(b.version);
        f.Db(b.password);
        c.pc = new wb(b.ij, b.iceServers, a, Zb.Km, f, b.gn, c.haxball.proxyAgent || config.proxyAgent, c.haxball.identityToken || config.identityToken);
        c.pc.rh = e;
        c.pc.zd = function (a) {
          c.pc = null;
          c.pa = a;
          a.lg = function (a) {
            a = new F(new DataView(a));
            c.uq(a);
          };
          a.cf = function () {
            3 != c.pd && c.df?.(createError(ErrorCodes.ConnectionClosed)); // "Connection closed"
            c.ia();
          };
          a = setTimeout(function () {
            c.df?.(createError(ErrorCodes.GameStateTimeout)); // "Game state timeout"
            c.ia();
          }, 1e4);
          c.re = a;
          c.tf(2, c.pa.Ra.remoteDescription.sdp);
        };
        c.pc.gl = function () {
          c.tf(1, c.pc.jr.sdp);
        };
        var g = !1;
        c.pc.Zk = function () {
          return (g = !0);
        };
        c.pc.bd = function (a) {
          if (!e && 1 == c.pd && g) c.Sp?.(), d(!0);
          else {
            c.df?.(a[0]);
            c.ia(a[1] || a[0]);
          }
        };
      };
    d(null != b.cn && b.cn);
  }
  xa.b = !0;
  xa.ma = V;
  xa.prototype = C(V.prototype, {
    ia: function (a) {
      null != this.pc && ((this.pc.bd = null), this.pc.Gn(), (this.pc = null));
      clearTimeout(this.re);
      null != this.pa && ((this.pa.cf = null), this.pa.ia(), (this.pa = null));
      this.ek = null == a ? createError(ErrorCodes.ConnectionClosed) : a; // "Connection closed"
      this.tf(4);
      this.haxball._onRoomLeave?.(this.ek);
    },
    tf: function (a, b) {
      this.pd != a && ((this.pd = a), this.haxball._onConnectionStateChange?.(a, b), null != this.Ad && this.Ad(a));
    },
    wd: function () {
      return 3 == this.pd;
    },
    C: function () {
      this.wd() && performance.now() - this.zm > this.nn && this.zi();
      this.Xc = performance.now() * this.Ac + this.Qi.$g(0.5) - this.Y;
      this.Oj();
    },
    Sf: function () {
      return this.wd()
        ? (0 > this.bc && (this.bc = 0),
          this.wk(
            performance.now() * this.Ac +
              this.Qi.$g(0.5) -
              this.Y +
              this.bc +
              this.rd,
            this.ug
          ))
        : this.T;
    },
    Oj: function () {
      0 > this.Xc && (this.Xc = 0);
      this.Xc > this.Ff && (this.Xc = this.Ff);
    },
    uq: function (a) {
      switch (a.B()) {
        case 0:
          this.rq(a);
          break;
        case 1:
          this.qq(a);
          break;
        case 2:
          this.nq(a);
          break;
        case 3:
          this.wq(a);
          break;
        case 4:
          this.tq(a);
          break;
        case 5:
          this.pq(a);
          break;
        case 6:
          this.vq(a);
      }
    },
    rq: function (a) {
      var b = this;
      a = a.sb(a.Ab());
      var c = Promise.resolve(null);
      null != this.Je && (c = this.Je.wr(a));
      c["catch"](function () {
        return null;
      }).then(function (a) {
        b.ir(a);
      });
    },
    qq: function (a) {
      a = pako.inflateRaw(a.sb());
      a = new F(new DataView(a.buffer, a.byteOffset, a.byteLength));
      this.uc = a.Ob();
      this.Y = a.hb();
      this.te = a.hb();
      this.cc = a.Ab();
      this.Xc = 10;
      for (this.T.ja(a); 0 < a.o.byteLength - a.a; ) this.Cg(this.Gm(a));
      clearTimeout(this.re);
      this.tf(3);
    },
    ir: function (a) {
      var b = w.ha();
      b.l(0);
      null != a ? (b.lb(a.byteLength), b.Vb(a)) : b.lb(0);
      b.lb(this.Uh.byteLength);
      b.Mg(this.Uh);
      this.Rb(b);
      this.Uh = null;
    },
    Rb: function (a, b) {
      null == b && (b = 0);
      this.pa.Rb(b, a);
    },
    Gm: function (a) {
      var b = a.hb(),
        c = a.Ab(),
        d = a.Ob(),
        e = a.hb();
      a = m.fh(a);
      a.P = d;
      a.ue = e;
      a.mb = b;
      a.da = c;
      return a;
    },
    nq: function (a) {
      a = this.Gm(a);
      this.Cg(a);
      a.P == this.uc && this.ug.Ds(a.ue);
      this.Bl();
    },
    vq: function (a) {
      a = m.fh(a);
      a.P = 0;
      a.ue = 0;
      a.apply(this.T);
      null != this.fc && this.fc(a);
    },
    wq: function (a) {
      var b = a.hb();
      a = a.hb();
      this.pi.push({ frame: b, yf: a });
      this.Bl();
    },
    Bl: function () {
      if (3 == this.pd) {
        for (var a = 0, b = this.pi; a < b.length; ) {
          var c = b[a];
          ++a;
          c.frame <= this.Y ||
            (c.yf == this.te + this.cc + this.le.bs(c.frame) &&
              this.vn(c.frame - this.Y));
        }
        for (var a = 0, b = this.pi, c = 0, d = b.length; c < d; ) {
          var e = b[c++];
          e.frame > this.Y && ((b[a] = e), ++a);
        }
        for (; b.length > a; ) b.pop();
        this.ug.Cs(this.Y);
      }
    },
    pq: function (a) {
      var b = 0 != a.B(),
        c = a.ic(),
        d = "";
      0 < a.o.byteLength - a.a && (d = a.ic());
      this.ia(createError(ErrorCodes.KickedNow, c, b, d)); // "You were banned" : "You were kicked" ...
    },
    tq: function (a) {
      var b = a.u();
      a = a.u();
      var c = performance.now() - a;
      this.Qi.add(b - a * this.Ac);
      this.sg.add(c);
      for (var d = (b = 0), e = this.Di; d < e.length; ) {
        var f = e[d];
        ++d;
        if (f > a) break;
        this.dl?.((f<a)?-1:c);
        ++b;
      }
      this.Di.splice(0, b);
    },
    zi: function () {
      var a = performance.now();
      this.zm = a;
      this.Di.push(a);
      var b = this.sg.$g(0.5) | 0, c = w.ha(), q = this.haxball.room?._modifyClientPing;
      q && (b = q(b));
      c.l(2);
      c.s(a);
      c.lb(b);
      this.Rb(c, 2);
    },
    vn: function (a) {
      this.zj(a);
      this.Xc -= a;
      this.Oj();
    },
    ra: function (a) {
      if (3 == this.pd) {
        var b = this.Ap++,
          c = 0;
        0 > this.bc && (this.bc = 0);
        a.zf.Aa && (c = this.Y + (this.Xc | 0) + this.bc);
        var d = w.ha(), q = this.haxball.room?._modifyFrameNo;
        d.l(1);
        q && (c = q(c));
        d.tb(c);
        d.tb(b);
        m.lj(a, d);
        this.Rb(d);
        a.zf.Ba && ((a.ue = b), (a.P = this.uc), (a.mb = c), this.ug.Rm(a));
      }
    },
    f: xa,
  });
  
  const BanEntryType = {
    Player: 0,
    IP: 1,
    Auth: 2
  };

  function BanList(objLb){
    function IPBanEntry(){
      this.ipv6 = false;
      this.value = null;
      this.mask = null;
    }
    IPBanEntry.create = function(value, mask){
      if (value==null)
        return;
      const entry = new IPBanEntry(), cn = value.__proto__.constructor.name;
      entry.ipv6 = (cn=="BigInt");
      entry.value = value;
      entry.mask = (cn!=mask?.__proto__.constructor.name) ? (entry.ipv6 ? 340282366920938463463374607431768211455n : -1) : mask;
      return entry;
    };
    var list = [], n = 1, authSet = new Set(), ipEntries = [];
    this.addPlayer = (playerObj)=>{
      var e = objLb.Ie.get(playerObj?.V)?.pa;
      if (!e || list.findIndex((x)=>x.type==BanEntryType.Player && x.value.pId==playerObj.V)>-1)
        return;
      var ips = [];
      if (e.gd)
        ips.push(hStn(e.gd));
      e.oe.forEach((ip)=>{
        if (!ips.includes(ip))
          ips.push(ip);
      });
      ips.forEach((ip)=>{
        var num = ipToNumber(ip);
        if (!num)
          return;
        ipEntries.push(IPBanEntry.create(num));
      });
      authSet.add(playerObj.auth);
      list.push({
        id: n,
        type: BanEntryType.Player,
        value: {
          pId: playerObj.V,
          pName: playerObj.w,
          ips: ips,
          auth: playerObj.auth
        }
      });
      return n++;
    };
    this.addIp = (...eList)=>{
      return eList.map((e)=>{
        var t = typeof e;
        if (t=="string")
          e = {
            ip: e
          };
        else if (t!="object")
          return;
        var n1 = ipToNumber(e.ip);
        if (n1==null)
          return;
        const ipv6 = n1.__proto__.constructor.name=="BigInt";
        var n2 = ipToNumber(e.mask);
        if (n1.__proto__.constructor.name!=n2?.__proto__.constructor.name){
          n2 = ipv6 ? 340282366920938463463374607431768211455n : -1;
          e.mask = numberToIp(n2);
        }
        for (var i=0;i<list.length;i++){
          const x = list[i];
          if (x.type==BanEntryType.IP && n1==ipToNumber(x.value.ip) && n2==ipToNumber(x.value.mask))
            return;
        }
        ipEntries.push(IPBanEntry.create(n1, n2));
        list.push({
          id: n,
          type: BanEntryType.IP,
          value: e
        });
        return n++;
      });
    };
    this.addAuth = (...eList)=>{
      return eList.map((e)=>{
        if (authSet.has(e))
          return;
        list.push({
          id: n,
          type: BanEntryType.Auth,
          value: e
        });
        authSet.add(e);
        return n++;
      });
    };
    this.checkIp = (ip)=>{
      const num = ipToNumber(ip);
      if (num==null)
        return false;
      const ipv6 = num.__proto__.constructor.name=="BigInt";
      for (var i=0;i<ipEntries.length;i++){
        const x = ipEntries[i];
        if (ipv6==x.ipv6 && compareBits(num, x.value, x.mask))
          return true;
      }
      return false;
    };
    this.checkAuth = (auth)=>{
      return authSet.has(auth);
    };
    const removeIp = (ip, mask)=>{
      const n1 = ipToNumber(ip);
      if (n1==null)
        return;
      const ipv6 = n1.__proto__.constructor.name=="BigInt";
      var n2 = ipToNumber(mask);
      if (n2==null)
        n2 = ipv6 ? 340282366920938463463374607431768211455n : -1;
      const isDefaultMask = (n2==(ipv6 ? 340282366920938463463374607431768211455n : -1));
      var idx = [];
      for (var i=0;i<ipEntries.length;i++){
        const x = ipEntries[i];
        if (ipv6==x.ipv6 && n1==x.value && n2==x.mask)
          idx.push(i);
      }
      while(idx.length>0)
        ipEntries.splice(idx.pop(), 1);
      idx.length = 0;
      list.forEach((x, i)=>{
        if (isDefaultMask && x.type==BanEntryType.Player && x.value.ips.findIndex((ip)=>ipToNumber(ip)==n1)>-1){
          x.type = BanEntryType.Auth;
          x.value = x.value.auth;
        }
        else if (x.type==BanEntryType.IP && n1==ipToNumber(x.value.ip) && n2==ipToNumber(x.value.mask))
          idx.push(i);
      });
      while(idx.length>0)
        list.splice(idx.pop(), 1);
    };
    const removeAuth = (auth)=>{
      authSet.delete(auth);
      var idx = [], ips = [];
      list.forEach((x, i)=>{
        if (x.type==BanEntryType.Player && auth==x.value.auth){
          ips.splice(ips.length, 0, ...x.value.ips);
          idx.push(i);
        }
        else if (x.type==BanEntryType.Auth && auth==x.value)
          idx.push(i);
      });
      while(idx.length>0)
        list.splice(idx.pop(), 1);
      this.addIp(...ips);
    };
    this.remove = (id)=>{
      var idx = list.findIndex((x)=>x.id==id);
      if (idx<0)
        return false;
      var {type, value} = list.splice(idx, 1)[0];
      switch(type){
        case BanEntryType.Player:
          value.ips.forEach((ip)=>{removeIp(ip);});
          removeAuth(value.auth);
          break;
        case BanEntryType.IP:
          removeIp(value.ip, value.mask);
          break;
        case BanEntryType.Auth:
          removeAuth(value);
          break;
      }
      return true;
    };
    this.removePlayer = (playerId)=>{
      var idx = list.findIndex((x)=>(x.type==0 && x.value?.pId==playerId));
      if (idx<0)
        return false;
      var {value} = list.splice(idx, 1)[0];
      value.ips.forEach((ip)=>{removeIp(ip);});
      removeAuth(value.auth);
      return true;
    };
    this.clear = ()=>{
      authSet.clear();
      ipEntries.length = 0;
      list.length = 0;
    };
    this.getList = ()=>{
      return JSON.parse(JSON.stringify(list));
    };
  }

  function Sa(haxball, a, b, c, d) {
    this.haxball = haxball;
    this.Ag = this.nf = this.dm = !1;
    this.Mc = null;
    this.$ = "";
    this.$q = 5e4;
    this.Zq = 1e4;
    this.od = new Map();
    this.xr = a;
    this.Vf = b;
    this.In = c;
    this.Dg = d;
    null == this.Dg && (this.Dg = "");
    this.Ji();
  }
  Sa.b = !0;
  Sa.vk = function (a) {
    try {
      var a = a.candidate.split(" "); // port: parseInt(a[5])
      if (a[6]!="typ") throw new q(null);
      if (a[7]=="srflx") return a[4];
    } catch (c) {}
    return null;
  };
  Sa.prototype = {
    ia: function () {
      clearTimeout(this.Ul);
      clearTimeout(this.ke);
      this.ke = null;
      clearInterval(this.ol);
      if (null != this.X) {
        try{
          this.X.onmessage = null;
          this.X.onerror = null;
          this.X.onclose = null;
          this.X.onopen = null;
          this.X.close();
          this.X = null;
        }catch(ex){}
      }
      this.qk();
    },
    Fi: function (a) {
      var b = this;
      if (null != this.Mc || null != a) {
        if (
          null != this.Mc &&
          null != a &&
          this.Mc.byteLength == a.byteLength
        ) {
          for (
            var c = new Uint8Array(this.Mc),
              d = new Uint8Array(a),
              e = !1,
              f = 0,
              g = this.Mc.byteLength;
            f < g;
  
          ) {
            var k = f++;
            if (c[k] != d[k]) {
              e = !0;
              break;
            }
          }
          if (!e) return;
        }
        this.Mc = a.slice(0);
        this.Ag = !0;
        null != this.X &&
          1 == this.X.readyState &&
          null == this.ke &&
          (this.Ai(),
          (this.ke = setTimeout(function () {
            b.ke = null;
            1 == b.X.readyState && b.Ag && b.Ai();
          }, 1e4)));
      }
    },
    Ei: function (a) {
      function b() {
        null != c.X && 1 == c.X.readyState && c.nf != c.dm && c.cm();
        c.Ql = null;
      }
      var c = this;
      this.nf = a;
      null == this.Ql && (b(), (this.Ql = setTimeout(b, 1e3)));
    },
    Ji: function (a) {
      function b(a) {
        a = a.sitekey/*, c = this*/;
        if (null == a) throw new q(null);
        d.haxball.useRecaptchaToken = (a)=>{//c.
          d.haxball.useRecaptchaToken = null;//c.
          d.Ji(a);
        };
        if (!d.haxball.onRequestRecaptcha)//c.
          throw createError(ErrorCodes.MissingRecaptchaCallbackError); // "Recaptcha requested. Either set onRequestRecaptcha or set a working token while creating/joining a room."
        d.haxball.onRequestRecaptcha(a);//c.
        /*
        null != d.ef &&
          d.ef(a, function (a) {
            d.Ji(a);
          });
        */
      }
      function c(a) {
        var b = a.url;
        if (null == b) throw new q(null);
        a = a.token;
        if (null == a) throw new q(null);
        config.proxy?.WebSocketUrl && (b = config.proxy?.WebSocketUrl);
        (!b.endsWith("host")) && (((!b.endsWith("/")) && (b += "/")), b += "host");
        var tkn = d.haxball.identityToken || config.identityToken;
        if (!config.proxy && tkn){
          clpip();
          tkn = null;
        }
        var protocols = tkn ? [tkn] : [];
        if (d.haxball.proxyAgent || config.proxyAgent || config.proxy?.WebSocketChangeOriginAllowed){ // custom environment
          var propsObj = {};
          if (d.haxball.proxyAgent || config.proxyAgent)
            propsObj.agent = d.haxball.proxyAgent || config.proxyAgent;
          if (config.proxy.WebSocketChangeOriginAllowed)
            propsObj.headers = {
              Origin: (config.backend.secure?"https":"http")+"://"+config.backend.hostname
            };
          d.X = new WebSocket(b + "?token=" + a, protocols, propsObj);
        }
        else // browser
          d.X = new WebSocket(b + "?token=" + a, protocols);
        d.X.binaryType = "arraybuffer";
        d.X.onopen = function () {
          d.So();
        };
        d.X.onclose = function (a) {
          d.Mh(4001 != a.code);
        };
        d.X.onerror = function () {
          d.Mh(!0);
        };
        d.X.onmessage = d.Ph.bind(d);
      }
      //null == a && (a = "");
      var d = this;
      M.zl(this.xr, "token=" + (a || this.Dg) + "&rcr="/* + a*/, M.vj)
        .then(function (a) {
          switch (a.action) {
            case "connect":
              d.haxball.useRecaptchaToken = null;
              c(a);
              break;
            case "recaptcha":
              b(a);
          }
        })
        ["catch"](function (ex) {
          console.log(ex instanceof q ? ex.Ta : ex);
          d.haxball.useRecaptchaToken = null;
          //if (typeof ex=="string" && ex.startsWith("status:")) // TODO: catch proxy server errors properly.
            //d.ia();
          //else
          d.Mh(!0);
        });
    },
    So: function () {
      var a = this;
      null != this.Mc && this.Ai();
      0 != this.nf && this.cm();
      this.ol = setInterval(function () {
        a.zi();
      }, 4e4);
    },
    Ph: function (a) {
      a = new F(new DataView(a.data), !1);
      switch (a.B()) {
        case 1:
          this.Oh(a);
          break;
        case 4:
          this.Nh(a);
          break;
        case 5:
          this.No(a);
          break;
        case 6:
          this.Qo(a);
          break;
        case 111:
          this.Zo(a);
          break;
      }
    },
    Zo: function(a, b) {
      setTimeout(()=>{
        try {
          this.haxball.room?.setPlayerIdentity?.(a.hb(), a.wg());
        } catch (t) {
          b && this.sf(b, 4111);
        }
      }, 3000);
    },
    Oh: function (a) {
      var b = a.hb(),
        c = bAti(a.sb(a.B())),
        d,
        e,
        f;
      try {
        a = new F(new DataView(pako.inflateRaw(a.sb()).buffer), !1);
        d = 0 != a.B();
        e = a.ic();
        for (var g = a.wg(), k = [], l = 0; l < g.length; )
          k.push(new RTCIceCandidate(g[l++]));
        f = k;
      } catch (t) {
        this.sf(b, 0);
        return;
      }
      this.Ro(b, c, e, f, a, d);
    },
    Ro: function (a, b, c, d, e, f) {
      var g = this;
      if (16 <= this.od.size) this.sf(a, 4104);
      else if (this.banList.checkIp(b)) this.sf(a, 4102);
      else {
        for (var k = [], l = 0; l < d.length; ) {
          var t = Sa.vk(d[l++]);
          if (null != t) {
            if (this.banList.checkIp(t)) {
              this.sf(a, 4102);
              return;
            }
            k.push(t);
          }
        }
        if (
          null != this.Vj &&
          ((l = new F(e.o)), (l.a = e.a), (e = this.Vj(l)), e!=null)
        ) {
          this.sf(a, e);
          return;
        }
        var h = new Va(a, this.Vf, this.In);
        f && (h.ak = 2500);
        h.oe = k;
        h.gd = "";
        for (l=0;l<b.length;l++) h.gd += J.Vg(b.charCodeAt(l));
        this.od.set(a, h);
        h.bd = function () {
          g.Nc(0, h, null);
          g.od["delete"](h.$);
        };
        h.zd = function () {
          g.od["delete"](h.$);
          g.Nc(0, h, null);
          null != g.bl && g.bl(new Nb(h));
        };
        h.di = function (a) {
          g.Bi(h, a, h.Uf, null);
          h.Sh.then(function () {
            g.Nc(0, h, null);
          });
          h.jg = function (a) {
            g.yi(h, a);
          };
        };
        h.Mi();
        h.bo(new RTCSessionDescription({ sdp: c, type: "offer" }), d);
      }
    },
    Nh: function (a) {
      var b = a.hb(),
        c;
      try {
        (a = new F(new DataView(pako.inflateRaw(a.sb()).buffer), !1)),
          (c = new RTCIceCandidate(a.wg()));
      } catch (d) {
        return;
      }
      this.Mo(b, c);
    },
    Mo: function (a, b) {
      var c = this.od.get(a);
      if (null != c) {
        var d = Sa.vk(b);
        if (null != d && (c.oe.push(d), this.banList.checkIp(d))) return;
        c.yj(b);
      }
    },
    No: function (a) {
      this.$ = a.ie(a.B());
      null != this.kg && this.kg(this.$);
    },
    Qo: function (a) {
      this.Dg = a.ie(a.o.byteLength - a.a);
    },
    Nc: function (a, b, c) {
      if (!b.hl) {
        0 == a && (b.hl = !0);
        b = b.$;
        var d = w.ha(32, !1);
        d.l(a);
        d.tb(b);
        null != c && d.Vb(pako.deflateRaw(c.Sb()));
        this.X.send(d.Hd());
      }
    },
    sf: function (a, b) {
      var c = w.ha(16, !1);
      c.l(0);
      c.tb(a);
      c.Ub(b);
      this.X.send(c.Hd());
    },
    zi: function () {
      var a = w.ha(1, !1);
      a.l(8);
      this.X.send(a.Hd());
    },
    Ai: function () {
      this.Ag = !1;
      var a = w.ha(256, !1);
      a.l(7);
      null != this.Mc && a.Mg(this.Mc);
      this.X.send(a.Hd());
    },
    cm: function () {
      var a = w.ha(2, !1);
      a.l(this.haxball.version);
      a.l(this.nf ? 1 : 0);
      this.X.send(a.Hd());
      this.dm = this.nf;
      this.haxball.room._onRoomRecaptchaModeChange?.(this.nf);
    },
    Bi: function (a, b, c, d) {
      var e = w.ha(32, !1);
      e.mc(b.sdp);
      e.Ng(c);
      null != d && e.Vb(d.Sb());
      this.Nc(1, a, e);
    },
    yi: function (a, b) {
      var c = w.ha(32, !1);
      c.Ng(b);
      this.Nc(4, a, c);
    },
    qk: function () {
      for (var a = this.od.values(), b = a.next(); !b.done; ) {
        var c = b.value,
          b = a.next();
        c.ia();
      }
      this.od.clear();
    },
    Mh: function (a) {
      var b = this;
      this.qk();
      clearTimeout(this.ke);
      this.ke = null;
      this.Ag = !1;
      clearInterval(this.ol);
      clearTimeout(this.Ul);
      a &&
        (this.Ul = setTimeout(function () {
          b.Ji();
        }, (this.Zq + Math.random() * this.$q) | 0));
    },
    f: Sa,
  };

  function I() {}
  I.qh = { name: "ECDSA", namedCurve: "P-256" };
  I.mm = { name: "ECDSA", hash: { name: "SHA-256" } };
  I.b = !0;
  I.yo = function () {
    try {
      return crypto.subtle
        .generateKey(I.qh, !0, ["sign", "verify"])
        .then(function (a) {
          var b = a.privateKey;
          return crypto.subtle.exportKey("jwk", b).then(function (a) {
            var c = a.y,
              e = a.d,
              f = new I();
            f.Yi = a.x;
            f.Zi = c;
            f.Zj = e;
            f.Al = b;
            return f;
          });
        });
    } catch (a) {
      return Promise.reject(a instanceof q ? a.Ta : a);
    }
  };
  I.xo = function (a) {
    a = a.split(".");
    if (4 != a.length || "idkey" != a[0])
      return Promise.reject(createError(ErrorCodes.AuthFromKeyInvalidIdFormatError)); // "Invalid id format"
    var b = a[1],
      c = a[2],
      d = a[3];
    return I.Xr(b, c, d).then(function (a) {
      var e = new I();
      e.Yi = b;
      e.Zi = c;
      e.Zj = d;
      e.Al = a;
      return e;
    });
  };
  I.Rr = function (a, b) {
    try {
      var c = new F(new DataView(a.buffer, a.byteOffset, a.byteLength), !1);
      c.B();
      var d = c.sb(c.Ob()),
        e = c.sb(),
        f = new F(new DataView(d.buffer, d.byteOffset, d.byteLength), !1),
        g = f.ic(), // public key 1
        k = f.ic(), // public key 2
        l = f.sb();
      if (l.byteLength != b.byteLength) return Promise.reject(null);
      for (var c = 0, t = l.byteLength; c < t; ) {
        var h = c++;
        if (l[h] != b[h]) return Promise.reject(null);
      }
      return I.Wr(g, k)
        .then(function (a) {
          return crypto.subtle.verify(I.mm, a, e, d);
        })
        .then(function (a) {
          if (!a) throw new q(null);
          return g;
        });
    } catch (jc) {
      return Promise.reject(jc instanceof q ? jc.Ta : jc);
    }
  };
  I.Xr = function (a, b, c) {
    try {
      return crypto.subtle.importKey(
        "jwk",
        {
          crv: "P-256",
          ext: !0,
          key_ops: ["sign"],
          kty: "EC",
          d: c,
          x: a,
          y: b,
        },
        I.qh,
        !0,
        ["sign"]
      );
    } catch (d) {
      return Promise.reject(d instanceof q ? d.Ta : d);
    }
  };
  I.Wr = function (a, b) {
    try {
      return crypto.subtle.importKey(
        "jwk",
        { crv: "P-256", ext: !0, key_ops: ["verify"], kty: "EC", x: a, y: b },
        I.qh,
        !0,
        ["verify"]
      );
    } catch (c) {
      return Promise.reject(c instanceof q ? c.Ta : c);
    }
  };
  I.prototype = {
    Ir: function () {
      return "idkey." + this.Yi + "." + this.Zi + "." + this.Zj;
    },
    wr: function (a) {
      try {
        var b = w.ha(1024);
        b.l(1);
        var c = b.a;
        b.Ub(0);
        var d = b.a;
        b.mc(this.Yi);
        b.mc(this.Zi);
        b.Vb(a);
        var e = b.a - d;
        b.o.setUint16(c, e, b.Sa);
        var f = new Uint8Array(b.o.buffer, b.o.byteOffset + d, e);
        return crypto.subtle.sign(I.mm, this.Al, f).then(function (a) {
          b.Mg(a);
          return b.Sb();
        });
      } catch (g) {
        return Promise.reject(g instanceof q ? g.Ta : g);
      }
    },
    f: I,
  };
    
  function $b(a) {
    this.xj = new Map();
    this.Ho = new tb(100, 16);
    this.yg = !1;
    this.yb = 0;
    this.pa = a;
    a = w.ha(8);
    a.s(Math.random());
    this.He = a.Sb();
  }
  $b.b = !0;
  $b.prototype = {
    Rb: function (a, b) {
      null == b && (b = 0);
      this.pa.Rb(b, a);
    },
    f: $b,
  };
  
  function Lb(haxball, a) {
    this.haxball = haxball;
    this.Ib = null;
    this.fg = 32;
    this.Ie = new Map();
    this.ac = [];
    this.wi = 4;
    this.Mn = 600; // quantization step value (frame count)
    var b = this;
    V.call(this, a.state);
    this.tp = a.ij;
    this.Sr = a.version;
    this.up = 1;
    this.Jk = 0; // Quantized frame no
    this.uc = 0;
    this.upc = false;
    this.Ks = true;
    this.cpc = null;
    this.fPwd = null;
    this.Li = performance.now();
    this.Ic = new Sa(haxball, this.tp, a.iceServers, Zb.Km, a.gn);
    this.Ic.banList = new BanList(this);
    this.Ic.Vj = this.Oo.bind(this);
    this.Ic.bl = function (a) {
      b.Lp(a);
    };
    this.Ic.kg = function (a) {
      b.kg?.(a);
    };
  }
  Lb.b = !0;
  Lb.ma = V;
  Lb.prototype = C(V.prototype, { // TODO: fix __internalData sometime.
    ia: function () {
      this.Ic.ia();
      for (var a = 0, b = this.ac; a < b.length; ) {
        var c = b[a++].pa;
        c.cf = null;
        c.lg = null;
        c.ia();
      }
    },
    to: function (a, b, c, d) {
      var e = this.Ie.get(a.V);
      if (null != e) {
        if (d)
          this.Ic.banList.addPlayer(a);
        a = w.ha();
        a.l(5);
        a.l(d ? 1 : 0);
        a.mc(b);
        null == c && (c = "");
        a.mc(c);
        e.Rb(a);
        e.pa.ia();
      }
    },
    Ud: function () {
      if (this.Ic.banList.clear())
        this.haxball.room._onBansClear?.();
    },
    td: function(a) {
      if (this.Ic.banList.removePlayer(a))
        this.haxball.room._onBanClear?.(a);
    },
    xd1: function(playerObject) {
      return this.Ic.banList.addPlayer(playerObject);
    },
    xd2: function(...values) {
      return this.Ic.banList.addIp(...values);
    },
    xd3: function(...values) {
      return this.Ic.banList.addAuth(...values);
    },
    xd4: function(id) {
      return this.Ic.banList.remove(id);
    },
    Fi: function (a) {
      this.Ic.Fi(a);
    },
    Ei: function (a) {
      this.Ic.Ei(a);
    },
    ra: function (a) {
      //a.P = 0; // removing this line may have caused some bugs. thorough testing required.
      var b = this.Y + this.wi + this.bc;
      a.zf.Aa || (b = this.Y);
      a.mb = b;
      this.Cg(a);
      this.Ci();
      0 < this.ac.length && this.Eg(this.Zh(a), 1);
    },
    /*
    // backup, just in case. the current code will probably break whenever we try to trigger 
    // a physical event like setting a disc's properties within any custom event handler.
    // Cg(a) or a.apply(this.T) might be called directly outside all if's, but the checking 
    // of the number of connected clients (this.ac.length) seemingly prevents it.
    ra_custom: function (a, senderId, onlyCustom) {
      a.P = senderId;
      var b;
      0 < this.ac.length && ( 
        onlyCustom ? (
          a.apply(this.T),
          this.Eg_custom(a, 1)
        ) : (
          b = this.Y + this.wi + this.bc,
          a.zf.Aa || (b = this.Y),
          a.mb = b,
          this.Cg(a),
          this.Ci(),
          this.Eg(this.Zh(a), 1)
        )
      );
    },
    */
    ra_custom: function (a, senderId, onlyCustom) { // custom events will only be sent to custom clients.
      a.P = senderId;
      var b; // a.apply(this.T) may be here, out of condition.
      onlyCustom ? (
        a.apply(this.T), // risky move
        this.Eg_custom(a, 1)
      ) : (
        (0 < this.ac.length) && (
          b = this.Y + this.wi + this.bc,
          a.zf.Aa || (b = this.Y),
          a.mb = b,
          this.Cg(a),
          this.Ci(),
          this.Eg(this.Zh(a), 1)
        )
      );
    },
    _mf_: function(a, b, x) { // private messaging.
      if (b==0){
        a.apply(this.T);
        return;
      }
      var c = this.Ie.get(b);
      if (null != c) {
        (!x) && (a.P = 0); // clients might be able to send the message too.
        var d = w.ha();
        d.l(6);
        m.lj(a, d);
        c.Rb(d, 0);
      }
    },
    C: function () {
      var a = (((performance.now() - this.Li) * this.Ac) | 0) - this.Y;
      (a > 0) && this.zj(a);
      (this.Y - this.Kk >= 7) && this.Ci();
      (this.Y - this.Jk >= this.Mn) && (this.Ci(), this.gr());
    },
    Sf: function () {
      (this.bc < 0) && (this.bc = 0);
      return this.wk((performance.now() - this.Li) * this.Ac - this.Y + this.wi + this.bc + this.rd);
    },
    Oo: function (b) {
      if (!this.upc && this.ac.length >= this.fg) return 4100;
      try {
        if (b.Ob() != this.Sr) throw new q(null);
      } catch (d) {
        return 4103;
      }
      try {
        var c = b.zb();
        if (null != this.Ib && c != this.Ib) throw new q(null);
      } catch (d) {
        return 4101;
      }
    },
    Lp: function (a) {
      var b = this;
      if (!this.upc && this.ac.length >= this.fg) a.ia();
      else {
        var c = new $b(a);
        this.ac.push(c);
        a.lg = function (a) {
          a = new F(new DataView(a));
          b.oq(a, c);
        };
        a.cf = function () {
          D.remove(b.ac, c);
          b.Ie["delete"](c.$);
          b.Ip?.(c.$);
        };
        a = w.ha(1 + c.He.byteLength);
        a.l(0);
        a.lb(c.He.byteLength);
        a.Vb(c.He);
        c.Rb(a);
      }
    },
    Zh: function (a) {
      var b = w.ha();
      b.l(2);
      this.il(a, b);
      return b;
    },
    il: function (a, b) {
      b.tb(a.mb);
      b.lb(a.da);
      b.Ub(a.P);
      b.tb(a.ue);
      m.lj(a, b);
    },
    Ci: function () {
      if (!(0 >= this.Y - this.Kk) && 0 != this.ac.length) {
        var a = w.ha();
        a.l(3);
        a.tb(this.Y);
        a.tb(this.te);
        this.Eg(a, 2);
        this.Kk = this.Y; // Kk is the last frame no that network messages were sent to the clients. No clients means Kk does not get updated.
      }
    },
    Eg: function (a, b) {
      null == b && (b = 0);
      for (var c = 0, d = this.ac; c < d.length; ) {
        var e = d[c];
        ++c;
        e.yg && e.Rb(a, b);
      }
    },
    Eg_custom: function (a, b) {
      null == b && (b = 0);
      var f = w.ha();
      f.l(6);
      m.lj(a, f);
      for (var c = 0, d = this.ac; c < d.length; ) {
        var e = d[c];
        ++c;
        e.yg && this.haxball.__internalData.customClientIds.has(e.$) && e.Rb(f, 0);
      }
    },
    hr: function (a) { // sends an info packet regarding current room status to a client player at the initialization stage
      var b = w.ha();
      b.l(1);
      var c = w.ha();
      c.Ub(a.$);
      c.tb(this.Y);
      c.tb(this.te);
      c.lb(this.cc);
      this.T.ga(c);
      for (var d = this.le.list, e = 0, f = d.length; e < f; )
        this.il(d[e++], c);
      b.Vb(pako.deflateRaw(c.Sb()));
      a.Rb(b);
    },
    _hr: function (a) { // sends an info packet regarding current room status to a client player at the initialization stage
      a.tb(this.Y);
      a.tb(this.te);
      a.lb(this.cc);
      this.T.ga(a);
      var that = this;
      this.le.list.forEach((b)=>{
        that.il(b, a);
      });
    },
    _r: function (a) {
      setTimeout(()=>{
        this.T.I.forEach((x)=>{
          x.identity && this.haxball.room?.setPlayerIdentity(x.V, x.identity, a.$);
        });
      }, 3000);
    },
    gr: function () {
      this.Jk = this.Y;
      if (this.ac.length != 0) {
        var a = Ua.la(this.T.Ao());
        a.mb = this.Y;
        a.da = this.cc++;
        a.P = 0;
        this.Eg(this.Zh(a));
      }
    },
    yq: function (a, b) {
      var c = this,
        d = a.sb(a.Ab()),
        e = a.sb(a.Ab()),
        f = b.He;
      b.He = null;
      I.Rr(d, f)
        ["catch"](function () {
          return null;
        })
        .then(function (a) {
          try {
            if (c.Ic.banList.checkAuth(a)){
              //c.Ic.sf(c.up, 4102);
              throw new q(createError(ErrorCodes.AuthBannedError, a));
            }
            if (-1 != c.ac.indexOf(b)) {
              b.Ns = a;
              var d = c.up++;
              b.$ = d;
              c.Ie.set(d, b);
              c.Hp?.(d, new F(new DataView(e.buffer, e.byteOffset, e.byteLength), !1), b.pa.gd, a);
              b.yg = !0;
              c.hr(b);
              c._r(b);
            }
          } catch (l) {
            c.xk(b, l instanceof q ? l.Ta : l);
          }
        });
    },
    oq: function (a, b) {
      this.C();
      try {
        if (!b.Ho.Cm()) throw new q(1);
        var c = a.B();
        if (b.yg)
          switch (c) {
            case 1:
              this.zq(a, b);
              break;
            case 2:
              this.sq(a, b);
              break;
            default:
              throw new q(0);
          }
        else if (0 == c) this.yq(a, b);
        else throw new q(0);
        if (0 < a.o.byteLength - a.a) throw new q(2);
      } catch (d) {
        this.xk(b, d instanceof q ? d.Ta : d);
      }
    },
    xk: function (a, b) {
      this.haxball.onHostError?.(b, a.$);
      //console.log(b);
      this.Ie["delete"](a.$);
      D.remove(this.ac, a);
      a.yg && null != this.$k && this.$k(a.$);
      a.pa.ia();
    },
    sq: function (a, b) {
      var c = a.u(), q = this.haxball.room._modifyPlayerPing;
      q && (b.yb = q(b.$, a.Ab()));
      var d = w.ha();
      d.l(4);
      d.s((performance.now() - this.Li) * this.Ac + this.wi);
      d.s(c);
      b.Rb(d, 2);
    },
    zq: function (a, b) {
      var c = a.hb(), // c is the frameNo received from client. Should check if it is consistent.
        d = a.hb(),
        e = m.fh(a),
        f = e.zf.oj;
      if (null != f) {
        var g = b.xj.get(f);
        null == g && ((g = new tb(f.$i, f.uj)), b.xj.set(f, g));
        if (!g.Cm()) throw new q(3);
      }
      e.P = b.$;
      f = this.Y;
      g = this.Y + 120;
      e.ue = d;
      e.mb = c < f ? f : c > g ? g : c;
      if (e.__proto__.f==qa && e.Pd.F.length==0)
        return;
      else if (!this.haxball.__internalData.onOperationReceived(e, this.Y, c))
        return;
      if (e.__proto__.f==CustomEvent || e.__proto__.f==BinaryCustomEvent || e.__proto__.f==IdentityEvent){
        this.haxball.__internalData.roomObj?.ya.ra_custom(e, e.P, true);
        return;
      }
      e.$m(this.T) && (this.Cg(e), this.Eg(this.Zh(e), 1));
    },
    f: Lb,
  });
  
  function Ra(haxball) {
    this.$d = this.Yf = 0;
    this.internalData = haxball.__internalData;
  }
  Ra.b = !0;
  Ra.prototype = {
    C: function () {
      var a = this.internalData.keyState;//this.$d
      if (null != this.ng && a != this.Yf) {
        this.Yf = a;
        this.ng(Ga.la(a));
      }
    },
    al: function () {
      if (null != this.ng && 0 != this.Yf) {
        this.Yf = this.$d = 0;
        this.ng(Ga.la(0));
      }
    },
    f: Ra,
  };
  
  function ba(haxball, a) { // to fix: haxball, __internalData
    this.haxball = haxball;
    this.Nf = null;
    this.Ik = false;
    this.$c = performance.now();
    this.Ed = null;
    this.De = 0;
    this.Jn = new tb(3, 1e3);
    this.ob = new Ra(haxball);
    this.Bg = "Waiting for link";
    this.am = false;
    var b = this;
    this.Of = new ub(a, function (a) {});
    this.ya = a;
    
    // a.T.xxx: these functions run only once; 
    // see in function zj: this.T.C(1); 
    // all other engine updates run K.C(x), and not T.C(x).
    
    a.T.iq = (b)=>{
      haxball.room._onPlayerInputChange?.(b.V, b.ob);
    };
    a.T.tl = (b)=>{
      haxball.room._onPlayerJoin?.(b); // V=id, w=name, Kd=flag, Xb=avatar, conn, auth
    };
    a.T.ji = (d)=>{
      haxball.room._onPlayerBallKick?.(d?.V);
    };
    a.T.Ni = (team)=>{
      haxball.room._onTeamGoal?.(team?.$);
    };
    a.T.Oi = (team)=>{
      haxball.room._onGameEnd?.(team.$); // winningTeamId
    };
    a.T.ml = (c, Bf, e)=>{
      (!e) && haxball.room._onGamePauseChange?.(Bf, c?.V); // paused, byId
    };
    a.T.Ki = function(a){
      haxball.room._onGameStart?.(a?.V); // byId
    }
    a.T.Os = ()=>{
      haxball.room._onGameTick?.();
    };
    a.T._KO_ = ()=>{
      haxball.room._onKickOff?.();
    };
    a.T._CDD_ = (a, b, c, d)=>{
      haxball.room._onCollisionDiscVsDisc?.(a, b, c, d); // discId1, discPlayerId1, discId2, discPlayerId2
    };
    a.T._CDP_ = (a, b, c)=>{
      haxball.room._onCollisionDiscVsPlane?.(a, b, c); // discId, discPlayerId, planeId
    };
    a.T._CDS_ = (a, b, c)=>{
      haxball.room._onCollisionDiscVsSegment?.(a, b, c); // discId, discPlayerId, segmentId
    };
    a.T._AT_ = (a, b, c, d, e) => {
      haxball.room._onAutoTeams?.(a, b, c, d, e);
    };
    a.T._TLC_ = (a, b) => {
      haxball.room._onTimeLimitChange?.(a, b);
    };
    a.T._SLC_ = (a, b) => {
      haxball.room._onScoreLimitChange?.(a, b);
    };
    a.T._PDC_ = (a)=>{
      haxball.room._onPlayerDiscCreated?.(a);
    };
    a.T._PDD_ = (a)=>{
      haxball.room._onPlayerDiscDestroyed?.(a);
    };
    a.T._PAC_ = (a, b) => {
      haxball.room._onPlayerAvatarChange?.(a, b);
    };
    a.T._PHAC_ = (a, b) => {
      haxball.room._onPlayerHeadlessAvatarChange?.(a, b);
    };
    a.T._RP_ = (a, b) => {
      haxball.room._onPlayersOrderChange?.(a, b);
    };
    a.T._PTC_ = (a, b, c) => {
      haxball.room._onPlayerTeamChange?.(a, b, c);
    };
    a.T._TCC_ = (a, b, c) => {
      haxball.room._onTeamColorsChange?.(a, b, c);
    };
    a.T._TLC2_ = (a, b) => {
      haxball.room._onTeamsLockChange?.(a, b);
    };
    a.T._CCI_ = (x, y, z) => {
      if (haxball.__internalData.isHost){
        if (z==1){
          x.customClient = true;
          haxball.__internalData.customClientIds.add(x.V);
        }
      }
      else if (z==0){
        x.customClient = true;
        haxball.__internalData.customClientIds.add(x.V);
        x = a.T.na(y);
        if (x)
          x.customClient = true;
        haxball.__internalData.customClientIds.add(y);
        a.ra(na.la(1, y, 1), 0, true);
      }
    };
    a.T._CE_ = (a, b, c)=>{
      haxball.room._onCustomEvent?.(a, b, c); // type, data, byUser
    };
    a.T._BCE_ = (a, b, c)=>{
      haxball.room._onBinaryCustomEvent?.(a, b, c); // type, data, byUser
    };
    a.T._IE_ = (a, b, c)=>{
      haxball.room._onIdentityEvent?.(a, b, c); // id, data, byUser
    };
    a.T._SDP_ = (a, b, c, d)=>{
      haxball.room._onSetDiscProperties?.(a, b, c, d); // id, type, data1, data2
    };
    a.T._PD_ = (a)=>{
      haxball.room._onPingData?.(a); // ping array
    };
    a.T._HP_ = ()=>(haxball?.room?.hostPing || 0);
    a.T._RI_ = ()=>{
      b.ob.al();
    };
    a.T._HC_ = (a)=>{
      haxball.room._onHandicapChange?.(a);
    };
    a.T._EC_ = (a)=>{ // FIX ME: extrapolation change events will not be triggered at the exact time that we joined a room.
      haxball.room?._onExtrapolationChange?.(a);
    };
    a.T.Pi = ()=>{ 
      haxball.room._onTimeIsUp?.();
    };
    a.T.lq = ()=>{
      haxball.room._onPositionsReset?.();
    };
    a.T.ko = function (c) { // set sync
      b.am != c && ((b.am = c), (c = ta.la(c)), (haxball.__internalData.execOperationReceivedOnHost(c)!=false && a.ra(c)));
    };
    a.T.rl = function(b, Tc){
      haxball.room._onPlayerChat?.(b.V, Tc); // id, message
    };
    a.T.Vl = function(msg, color, style, sound){
      haxball.room._onAnnouncement?.(msg, color, style, sound); // msg, color, style, sound
    };
    a.T.vf = function(b){
      haxball.room._onGameStop?.(b?.V);  //byId
    };
    a.T.Ii = function(a, e){
      haxball.room._onStadiumChange?.(e, a?.V); // map, byId
    };
    a.T.sl = function(b){
      haxball.room._onPlayerSyncChange?.(b?.V, b?.Ld);// id, sync
    };
    a.T.ii = function(b, c){
      haxball.room._onPlayerAdminChange?.(c?.V, c?.cb, b?.V)// id, isAdmin, byId
    };
    a.T.Hk = function(a, b, c, d){
      haxball.room._onKickRateLimitChange?.(b, c, d, a?.V); // min, rate, burst, byId
    };
    a.T.ul = function (d, e, f, g) {
      d.H && (haxball.room._onPlayerDiscDestroyed?.(d));
      b.Op?.(d.V);
      (e!=null) && b.Np?.(d, e, null != g ? g.w : null, f);
      haxball.room._onPlayerLeave?.(d, e, f, g?.V); // playerObj, reason, isBanned, byId
      haxball.__internalData.customClientIds.delete(d.V);
    };
    a.T.wl = function(a, b){
      haxball.room._onPlayerChatIndicatorChange?.(a?.V, !b); // id, value
    };

    this.ob.ng = function (b) {
      haxball.__internalData.execOperationReceivedOnHost(b)!=false && a.ra(b);
    };
    this.aq = function (b) {
      b = da.la(1, b);
      haxball.__internalData.execOperationReceivedOnHost(b)!=false && a.ra(b);
    };
    this.Tp = function (b) {
      b = da.la(0, b);
      haxball.__internalData.execOperationReceivedOnHost(b)!=false && a.ra(b);
    };
    this.og = function (b) {
      b = qa.la(b);
      haxball.__internalData.execOperationReceivedOnHost(b)!=false && a.ra(b);
    };
    this.Yp = function () {
      var msg = Ma.la();
      haxball.__internalData.execOperationReceivedOnHost(msg)!=false && a.ra(msg);
    };
    this.Zp = function () {
      var msg = La.la();
      haxball.__internalData.execOperationReceivedOnHost(msg)!=false && a.ra(msg);
    };
    this.Mp = function () {
      b.Bm();
    };
    this.mg = function (b, c) {
      var d = S.la(b, c);
      haxball.__internalData.execOperationReceivedOnHost(d)!=false && a.ra(d);
    };
    this.ee = this.Wq.bind(this);
    this.Dp = function () {
      var msg = Qa.la();
      haxball.__internalData.execOperationReceivedOnHost(msg)!=false && a.ra(msg);
    };
    this.Pp = function () {
      ba.Bq(haxball, a);
    };
    this.$p = function (b) {
      b = pa.la(b);
      haxball.__internalData.execOperationReceivedOnHost(b)!=false && a.ra(b);
    };
    this._Qp_ = function (start) {
      if (start){
        if (null != b.Ed)
          return false;
        b.zr();
        haxball.room._onRoomRecordingChange?.(true);
        return true;
      }
      else {
        if (null == b.Ed)
          return null;
        var a = b.Ed.stop();
        b.Ed = null;
        haxball.room._onRoomRecordingChange?.(a);
        return a;
      }
    };
    this.bbf = this.bf.bind(this);
    this.De = requestAnimationFrame(this.bbf);
    this.Qr = setInterval(function () {
      a.C();
    }, 50);
    var c = haxball.__internalData.storage.extrapolation,
      c = -200 > c ? -200 : 200 < c ? 200 : c;
    if (0 != c) {
      var d = haxball.__internalData.storage.extrapolation;
      a.gm(d);
    }
  }
  ba.b = !0;
  ba.Bq = function (haxball, a) {
    for (var b = a.T.I, c = [], d = 0, e = 0, f = 0; f < b.length; ) {
      var g = b[f];
      ++f;
      g.ea == p.Ia && c.push(g.V);
      g.ea == p.fa ? ++d : g.ea == p.xa && ++e;
    }
    f = c.length;
    var msg;
    0 != f &&
      ((b = function () {
        return c.splice((Math.random() * c.length) | 0, 1)[0];
      }),
      ((f == 1) ? (
        msg = S.la(b(), Math.random()<0.5?p.fa:p.xa), (haxball.__internalData.execOperationReceivedOnHost(msg)!=false && a.ra(msg))
      ) : (
        (e == d)
          ? (msg = S.la(b(), p.fa), (haxball.__internalData.execOperationReceivedOnHost(msg)!=false && a.ra(msg)), msg = S.la(b(), p.xa), (haxball.__internalData.execOperationReceivedOnHost(msg)!=false && a.ra(msg)))
          : ((d = e > d ? p.fa : p.xa), msg = S.la(b(), d), (haxball.__internalData.execOperationReceivedOnHost(msg)!=false && a.ra(msg)))
      )));
  };
  ba.prototype = {
    zr: function () {
      this.Ed = new ac(this.ya, 3);
    },
    ia: function () {
      cancelAnimationFrame(this.De);
      clearInterval(this.Qr);
      clearTimeout(this.Nf);
    },
    Wq: function (a) {
      for (var b = [], c = 0, d = this.ya.T.I; c < d.length; ) {
        var e = d[c];
        ++c;
        e.ea == a && b.push(S.la(e.V, p.Ia));
      }
      for (a = 0; a < b.length; ) {
        var msg = b[a++];
        this.haxball.__internalData.execOperationReceivedOnHost(msg)!=false && this.ya.ra(msg);
      }
    },
    bf: function () {
      this.De = requestAnimationFrame(this.bbf);
      this.ob.C();
      this.ya.C();
      this.Kc();
    },
    Kc: function () {
      var a = performance.now();
      if (this.haxball.__internalData.storage.fps_limit == 1 && a - this.$c < 28.333333333333336)
        return;
      this.$c = a;
      this.haxball.__internalData.extrapolatedRoomState = this.ya.Sf();
      this.haxball.__internalData.renderer?.render(this.haxball.__internalData.extrapolatedRoomState);
    },
    bm: function (a) {
      var msg;
      a != this.Ik && (
        msg = na.la(a ? 0 : 1),
        (this.haxball.__internalData.execOperationReceivedOnHost(msg)!=false && (
          this.ya.ra(msg), 
          (this.Ik = a)
        ))
      );
    },
    Bm: function () {
      if (null != this.ya.T.K) {
        var a = Oa.la(120 != this.ya.T.K.Oa);
        this.haxball.__internalData.execOperationReceivedOnHost(a)!=false && this.ya.ra(a);
      }
    },
    f: ba,
  };
  
  function roomLink(a, b) { // u.$h
    return (config.backend.secure?"https":"http")+"://"+config.backend.hostname+"/play?c=" + a + (b ? "&p=1" : "");
  };

  // replay section :

  function ac(a, b) {
    this.Xm = 0;
    this.version = 1;
    this.ah = 0;
    this.Nd = w.ha(1e3);
    this.Df = w.ha(16384);
    var c = this;
    this.version = b;
    var d = (this.ah = a.Y);
    this.hj = a;
    a.T.ga(this.Df);
    a.fc = function (b) {
      var e = a.Y;
      c.Df.lb(e - d);
      d = e;
      c.Df.Ub(b.P);
      m.lj(b, c.Df);
    };
    this.Nd.Ub(0);
    var e = this.ah;
    a.T.km(function (b) {
      var d = a.Y;
      c.Nd.lb(d - e);
      c.Nd.l(b);
      c.Xm++;
      e = d;
    });
  }
  ac.b = !0;
  ac.prototype = {
    stop: function () {
      this.hj.fc = null;
      this.hj.T.km(null);
      this.Nd.o.setUint16(0, this.Xm, this.Nd.Sa);
      this.Nd.Vb(this.Df.Sb());
      var a = pako.deflateRaw(this.Nd.Sb()),
        b = w.ha(a.byteLength + 32);
      b.Og("HBR2");
      b.tb(this.version);
      b.tb(this.hj.Y - this.ah);
      b.Vb(a);
      return b.Sb();
    },
    f: ac,
  };
  
  function Jb(a, b, c, callbacks) {
    this.Vk = [];
    this.pl = 0;
    this.Fd = -1;// destination time
    this.hg = this.Qb = this.Wh = this.sk = 0;
    V.call(this, b);
    a = new F(new DataView(a.buffer), !1);
    if (1212305970 != a.hb()) throw new q('');
    b = a.hb();
    if (c != b) throw new q(new Kb(b));
    this.mf = a.hb();
    c = pako.inflateRaw(a.sb());
    this.Lc = new F(new DataView(c.buffer, c.byteOffset, c.byteLength));
    this.Cq(this.Lc);
    c = this.Lc.sb();
    this.Lc = new F(new DataView(c.buffer, c.byteOffset, c.byteLength), !1);
    this.ui();
    this.Wh = performance.now();
    this.uc = - 1;
    this.callbacks = callbacks;
    this.parentVb = null;
    this.obj = null;
  }
  Jb.b = !0;
  Jb.ma = V;
  Jb.prototype = C(V.prototype, {
    Cq: function (a) {
      for (var b = a.Ob(), c = 0, d = 0; d < b; ) {
        ++d;
        var c = c + a.Ab(),
        e = a.B();
        this.Vk.push({
          mj: c / this.mf,
          kind: e
        })
      }
    },
    Dl: function () {
      var a = this.Lc;
      if (0 < a.o.byteLength - a.a){
        a = this.Lc.Ab();
        this.hg += a;
        a = this.Lc.Ob();
        this.gg = m.fh(this.Lc, true);
        this.gg.P = a;
      } 
      else 
        this.gg = null;
    },
    Go: function () {
      return this.Y / this.mf
    },
    ra: function () {
    },
    Sf: function () {
      this.C();
      yazc++;
      var a = this.T.sc();
      a.C(this.sk);
      return a
    },
    C: function () {
      var a = performance.now(),
      b = a - this.Wh;
      this.Wh = a;
      var reachedFd = false, reachedEnd = false;
      if (this.Fd >= 0){
        this.Qb += 10000;
        if (this.Qb > this.Fd){
          this.Qb = this.Fd;
          this.Fd = - 1;
          reachedFd = true;
        }
      }
      else
        this.Qb += b * this.pl;
      a = this.mf * this.mh;
      if (this.Qb > a){
        this.Qb = a;
        reachedEnd = true;
      }
      b = this.Qb * this.Ac;
      a = b | 0;
      for (this.sk = b - a; this.Y < a; ) {
        while (null != this.gg && this.hg == this.Y){
          b = this.gg;
          b.apply(this.T);
          null != this.fc && this.fc(b);
          this.Dl();
        }
        this.Y++;
        this.T.C(1)
      }
      if (reachedFd){
        this.parentVb.assignCallbacks();
        this.obj?.onDestinationTimeReached && this.obj.onDestinationTimeReached();
      }
      if (reachedEnd){
        this.pl = 0;
        this.parentVb.clearCallbacks();
        this.obj?.onEnd && this.obj.onEnd();
      }
    },
    er: function (a) {
      this.parentVb.clearCallbacks();
      this.Fd = a;
      a < this.Qb && this.ui()
    },
    ui: function () {
      this.hg = 0;
      this.Qb = this.Y = this.Lc.a = 0;
      this.T.ja(this.Lc);
      this.Dl();
    },
    f: Jb
  });

  function Vb(ya, callbacks, options) {
    var $c = performance.now();
    var De = 0;
    var raf = options?.requestAnimationFrame || requestAnimationFrame;
    var caf = options?.cancelAnimationFrame || cancelAnimationFrame;
    var fps_limit = options?.fps_limit;
    var render = callbacks?.render;

    var Kc = render && function () {
      var a = performance.now();
      null != fps_limit && fps_limit > a - $c || (
        $c = a, 
        0 < ya.Fd || render(ya.Sf())
      )
    };
    var bf = function () {
      De = raf(bf);
      ya.C();
      render && Kc();
    };
    De = raf(bf);
    this.clearCallbacks = function () {
      ya.T.iq = null;
      ya.T.tl = null;
      ya.T.ji = null;
      ya.T.Ni = null;
      ya.T.Oi = null;
      ya.T.ml = null;
      ya.T.Ki = null;
      ya.T.Os = null;
      ya.T._KO_ = null;
      ya.T._CDD_ = null;
      ya.T._CDP_ = null;
      ya.T._CDS_ = null;
      ya.T._AT_ = null;
      ya.T._TLC_ = null;
      ya.T._SLC_ = null;
      ya.T._PAC_ = null;
      ya.T._PDC_ = null;
      ya.T._PDD_ = null;
      ya.T._PHAC_ = null;
      ya.T._RP_ = null;
      ya.T._PTC_ = null;
      ya.T._TCC_ = null;
      ya.T._TLC2_ = null;
      ya.T._CE_ = null;
      ya.T._BCE_ = null;
      ya.T._IE_ = null;
      ya.T._SDP_ = null;
      ya.T._PD_ = null;
      ya.T._HC_ = null;
      ya.T._EC_ = null;
      ya.T.Pi = null;
      ya.T.lq = null;
      ya.T.rl = null;
      ya.T.Vl = null;
      ya.T.vf = null;
      ya.T.Ii = null;
      ya.T.sl = null;
      ya.T.ii = null;
      ya.T.Hk = null;
      ya.T.ul = null;
      ya.T.wl = null;
    };

    this.assignCallbacks = function(){
      if (ya.T.iq!=null)
        return;
      ya.T.iq = (b)=>{
        callbacks.onPlayerInputChange?.(b.V, b.ob);
      };
      ya.T.tl = (b)=>{
        callbacks.onPlayerJoin?.(b); // V=id, w=name, Kd=flag, Xb=avatar, conn, auth
      };
      ya.T.ji = (d)=>{
        callbacks.onPlayerBallKick?.(d?.V);
      };
      ya.T.Ni = (team)=>{
        callbacks.onTeamGoal?.(team?.$);
      };
      ya.T.Oi = (team)=>{
        callbacks.onGameEnd?.(team.$); // winningTeamId
      };
      ya.T.ml = (c, Bf, e)=>{
        (!e) && callbacks.onGamePauseChange?.(Bf, c?.V) // paused, byId
      };
      ya.T.Ki = function(a){
        callbacks.onGameStart?.(a?.V); // byId
      }
      ya.T.Os = ()=>{
        callbacks.onGameTick?.();
      };
      ya.T._KO_ = ()=>{
        callbacks.onKickOff?.();
      };
      ya.T._CDD_ = (a, b, c, d)=>{
        callbacks.onCollisionDiscVsDisc?.(a, b, c, d); // discId1, discPlayerId1, discId2, discPlayerId2
      };
      ya.T._CDP_ = (a, b, c)=>{
        callbacks.onCollisionDiscVsPlane?.(a, b, c); // discId, discPlayerId, planeId
      };
      ya.T._CDS_ = (a, b, c)=>{
        callbacks.onCollisionDiscVsSegment?.(a, b, c); // discId, discPlayerId, segmentId
      };
      ya.T._AT_ = (a, b, c, d, e) => {
        callbacks.onAutoTeams?.(a, b, c, d, e);
      };
      ya.T._TLC_ = (a, b) => {
        callbacks.onTimeLimitChange?.(a, b);
      };
      ya.T._SLC_ = (a, b) => {
        callbacks.onScoreLimitChange?.(a, b);
      };
      ya.T._PDC_ = (a)=>{
        callbacks.onPlayerDiscCreated?.(a);
      };
      ya.T._PDD_ = (a)=>{
        callbacks.onPlayerDiscDestroyed?.(a);
      };
      ya.T._PAC_ = (a, b) => {
        callbacks.onPlayerAvatarChange?.(a, b);
      };
      ya.T._PHAC_ = (a, b) => {
        callbacks.onPlayerHeadlessAvatarChange?.(a, b);
      };
      ya.T._RP_ = (a, b) => {
        callbacks.onPlayersOrderChange?.(a, b);
      };
      ya.T._PTC_ = (a, b, c) => {
        callbacks.onPlayerTeamChange?.(a, b, c);
      };
      ya.T._TCC_ = (a, b, c) => {
        callbacks.onTeamColorsChange?.(a, b, c);
      };
      ya.T._TLC2_ = (a, b) => {
        callbacks.onTeamsLockChange?.(a, b);
      };
      ya.T._CE_ = (a, b, c)=>{
        callbacks.onCustomEvent?.(a, b, c); // type, data, byUser
      };
      ya.T._BCE_ = (a, b, c)=>{
        callbacks.onBinaryCustomEvent?.(a, b, c); // type, data, byUser
      };
      ya.T._IE_ = (a, b, c)=>{
        callbacks.onIdentityEvent?.(a, b, c); // id, data, byUser
      };
      ya.T._SDP_ = (a, b, c, d)=>{
        callbacks.onSetDiscProperties?.(a, b, c, d); // id, type, data1, data2
      };
      ya.T._PD_ = (a)=>{
        callbacks.onPingData?.(a); // ping array
      };
      ya.T._HC_ = (a)=>{
        callbacks.onHandicapChange?.(a);
      };
      ya.T._EC_ = (a)=>{
        callbacks.onExtrapolationChange?.(a);
      };
      ya.T.Pi = ()=>{
        callbacks.onTimeIsUp?.();
      };
      ya.T.lq = ()=>{
        callbacks.onPositionsReset?.();
      };
      ya.T.rl = function(b, Tc){
        callbacks.onPlayerChat?.(b.V, Tc); // id, message
      };
      ya.T.Vl = function(msg, color, style, sound){
        callbacks.onAnnouncement?.(msg, color, style, sound); // msg, color, style, sound
      };
      ya.T.vf = function(b){
        callbacks.onGameStop?.(b?.V);  //byId
      };
      ya.T.Ii = function(a, e){
        callbacks.onStadiumChange?.(e, a?.V); // map, byId
      };
      ya.T.sl = function(b){
        callbacks.onPlayerSyncChange?.(b?.V, b?.Ld);// id, sync
      };
      ya.T.ii = function(b, c){
        callbacks.onPlayerAdminChange?.(c?.V, c?.cb, b?.V)// id, isAdmin, byId
      };
      ya.T.Hk = function(a, b, c, d){
        callbacks.onKickRateLimitChange?.(b, c, d, a?.V); // min, rate, burst, byId
      };
      ya.T.ul = function (d, e, f, g) {
        d.H && (callbacks.onPlayerDiscDestroyed?.(d));
        callbacks.onPlayerLeave?.(d, e, f, g?.V); // playerObj, reason, isBanned, byId
      };
      ya.T.wl = function(a, b){
        callbacks.onPlayerChatIndicatorChange?.(a?.V, !b); // id, value
      };
    };

    this.ia = function () {
      caf(De);
      this.clearCallbacks();
    };

    this.ui = ()=>{
      ya.ui();
    };
  }

  // sandbox mode section:

  function SandboxRoom(roomState) {
    V.call(this, roomState);
    this.events = [];
    this.speed = 1;
    this.Li = performance.now();
    this.frozen = false;
  }
  SandboxRoom.prototype = C(V.prototype, {
    ra: function () {},
    Sf: function () {
      return this.T;
    },
    C: function () {
      var arr = this.events;
      this.events = [];
      var a = (((performance.now() - this.Li) * this.Ac * this.speed) | 0) - this.Y;
      for (var i=0;i<a;i++){
        this.Y+=1;
        if (!this.frozen){
          this.T.C(1);
          // events should normally run inside this loop,
          // but since we are not dealing with network and
          // synchronization, we can do whatever we want here.
        }
      }
      arr.forEach((event)=>{
        event.apply(this.T);
      });
    },
    receiveEvent: function(event){
      this.events.push(event);
    },
    setSpeed: function(speedCoeff){
      if (speedCoeff<0)
        return;
      if (speedCoeff==0){
        this.frozen = true;
        return;
      }
      this.Y = (this.Y * speedCoeff / this.speed) | 0;
      this.speed = speedCoeff;
      this.frozen = false;
    },
    runSteps: function(count){
      if (!this.frozen)
        return;
      this.T.C(count);
    }
  });

  function Sandbox(ya, callbacks, options) {
    var $c = performance.now();
    var De = 0;
    var raf = options?.requestAnimationFrame || requestAnimationFrame;
    var caf = options?.cancelAnimationFrame || cancelAnimationFrame;
    var fps_limit = options?.fps_limit;
    var render = callbacks?.render;
    var Kc = render && function () {
      var a = performance.now();
      null != fps_limit && fps_limit > a - $c || (
        $c = a, 
        render(ya.Sf())
      )
    };
    var bf = function () {
      De = raf(bf);
      ya.C();
      render && Kc();
    };
    function initialize(){
      De = raf(bf);
      ya.T.iq = (b)=>{
        callbacks.onPlayerInputChange?.(b.V, b.ob);
      };
      ya.T.tl = (b)=>{ // +
        callbacks.onPlayerJoin?.(b); // V=id, w=name, Kd=flag, Xb=avatar, conn, auth
      };
      ya.T.ji = (d)=>{ // +
        callbacks.onPlayerBallKick?.(d?.V);
      };
      ya.T.Ni = (team)=>{ // +
        callbacks.onTeamGoal?.(team?.$);
      };
      ya.T.Oi = (team)=>{ // +
        callbacks.onGameEnd?.(team.$); // winningTeamId
      };
      ya.T.ml = (c, Bf, e)=>{ // +
        (!e) && callbacks.onGamePauseChange?.(Bf, c?.V) // paused, byId
      };
      ya.T.Ki = function(a){ // +
        callbacks.onGameStart?.(a?.V); // byId
      }
      ya.T.Os = ()=>{
        callbacks.onGameTick?.();
      };
      ya.T._KO_ = ()=>{
        callbacks.onKickOff?.();
      };
      ya.T._CDD_ = (a, b, c, d)=>{
        callbacks.onCollisionDiscVsDisc?.(a, b, c, d); // discId1, discPlayerId1, discId2, discPlayerId2
      };
      ya.T._CDP_ = (a, b, c)=>{
        callbacks.onCollisionDiscVsPlane?.(a, b, c); // discId, discPlayerId, planeId
      };
      ya.T._CDS_ = (a, b, c)=>{
        callbacks.onCollisionDiscVsSegment?.(a, b, c); // discId, discPlayerId, segmentId
      };
      ya.T._AT_ = (a, b, c, d, e) => {
        callbacks.onAutoTeams?.(a, b, c, d, e);
      };
      ya.T._TLC_ = (a, b) => {
        callbacks.onTimeLimitChange?.(a, b);
      };
      ya.T._SLC_ = (a, b) => {
        callbacks.onScoreLimitChange?.(a, b);
      };
      ya.T._PDC_ = (a)=>{
        callbacks.onPlayerDiscCreated?.(a);
      };
      ya.T._PDD_ = (a)=>{
        callbacks.onPlayerDiscDestroyed?.(a);
      };
      ya.T._PAC_ = (a, b) => {
        callbacks.onPlayerAvatarChange?.(a, b);
      };
      ya.T._PHAC_ = (a, b) => {
        callbacks.onPlayerHeadlessAvatarChange?.(a, b);
      };
      ya.T._RP_ = (a, b) => {
        callbacks.onPlayersOrderChange?.(a, b);
      };
      ya.T._PTC_ = (a, b, c) => { // + (xl)
        callbacks.onPlayerTeamChange?.(a, b, c);
      };
      ya.T._TCC_ = (a, b, c) => {
        callbacks.onTeamColorsChange?.(a, b, c);
      };
      ya.T._TLC2_ = (a, b) => {
        callbacks.onTeamsLockChange?.(a, b);
      };
      ya.T._CE_ = (a, b, c)=>{
        callbacks.onCustomEvent?.(a, b, c); // type, data, byUser
      };
      ya.T._BCE_ = (a, b, c)=>{
        callbacks.onBinaryCustomEvent?.(a, b, c); // type, data, byUser
      };
      ya.T._IE_ = (a, b, c)=>{
        callbacks.onIdentityEvent?.(a, b, c); // id, data, byUser
      };
      ya.T._SDP_ = (a, b, c, d)=>{
        callbacks.onSetDiscProperties?.(a, b, c, d); // id, type, data1, data2
      };
      ya.T._PD_ = (a)=>{
        callbacks.onPingData?.(a); // ping array
      };
      ya.T._HC_ = (a)=>{
        callbacks.onHandicapChange?.(a);
      };
      ya.T._EC_ = (a)=>{
        callbacks.onExtrapolationChange?.(a);
      };
      ya.T.Pi = ()=>{ // +
        callbacks.onTimeIsUp?.();
      };
      ya.T.lq = ()=>{
        callbacks.onPositionsReset?.();
      };
      ya.T.rl = function(b, Tc){ // +
        callbacks.onPlayerChat?.(b.V, Tc); // id, message
      };
      ya.T.Vl = function(msg, color, style, sound){ // +
        callbacks.onAnnouncement?.(msg, color, style, sound); // msg, color, style, sound
      };
      ya.T.vf = function(b){ // +
        callbacks.onGameStop?.(b?.V);  //byId
      };
      ya.T.Ii = function(a, e){ // +
        callbacks.onStadiumChange?.(e, a?.V); // map, byId
      };
      ya.T.sl = function(b){ // +
        callbacks.onPlayerSyncChange?.(b?.V, b?.Ld);// id, sync
      };
      ya.T.ii = function(b, c){ // +
        callbacks.onPlayerAdminChange?.(c?.V, c?.cb, b?.V)// id, isAdmin, byId
      };
      ya.T.Hk = function(a, b, c, d){ // +
        callbacks.onKickRateLimitChange?.(b, c, d, a?.V); // min, rate, burst, byId
      };
      ya.T.ul = function (d, e, f, g) { // +
        d.H && (callbacks.onPlayerDiscDestroyed?.(d));
        callbacks.onPlayerLeave?.(d, e, f, g?.V); // playerObj, reason, isBanned, byId
      };
      ya.T.wl = function(a, b){ // +
        callbacks.onPlayerChatIndicatorChange?.(a?.V, !b); // id, value
      };
    };
    function finalize(){
      caf(De);
      ya.T.iq = null;
      ya.T.tl = null;
      ya.T.ji = null;
      ya.T.Ni = null;
      ya.T.Oi = null;
      ya.T.ml = null;
      ya.T.Ki = null;
      ya.T.Os = null;
      ya.T._KO_ = null;
      ya.T._CDD_ = null;
      ya.T._CDP_ = null;
      ya.T._CDS_ = null;
      ya.T._AT_ = null;
      ya.T._TLC_ = null;
      ya.T._SLC_ = null;
      ya.T._PAC_ = null;
      ya.T._PDC_ = null;
      ya.T._PDD_ = null;
      ya.T._PHAC_ = null;
      ya.T._RP_ = null;
      ya.T._PTC_ = null;
      ya.T._TCC_ = null;
      ya.T._TLC2_ = null;
      ya.T._CE_ = null;
      ya.T._BCE_ = null;
      ya.T._IE_ = null;
      ya.T._SDP_ = null;
      ya.T._PD_ = null;
      ya.T._HC_ = null;
      ya.T._EC_ = null;
      ya.T.Pi = null;
      ya.T.lq = null;
      ya.T.rl = null;
      ya.T.Vl = null;
      ya.T.vf = null;
      ya.T.Ii = null;
      ya.T.sl = null;
      ya.T.ii = null;
      ya.T.Hk = null;
      ya.T.ul = null;
      ya.T.wl = null;
    }

    initialize();

    this.ia = function () {
      finalize();
    };

    this.setRoomStateObj = function(roomState){
      finalize();
      ya.T = roomState;
      initialize();
    };
  }

  function createSandbox(callbacks, options){
    var roomState = new fa(), room = new SandboxRoom(roomState), sandbox = new Sandbox(room, callbacks, options), obj;
    obj = {
      state: roomState,
      takeSnapshot: function(){
        return roomState.copy();
      },
      useSnapshot: function(newRoomState){
        var state = newRoomState.copy();
        sandbox.setRoomStateObj(state);
        roomState = state;
        obj.state = state;
      },
      playerJoin: function(id, name, flag, avatar, conn, auth){
        var b = oa.la(id, name, flag, avatar, conn, auth);
        b.P = 0;
        room.receiveEvent(b);
      },
      playerLeave: function(playerId){
        var playerObj = room.T.na(playerId);
        if (!playerObj)
          return;
        var b = Y.la(playerId, null, true);
        b.P = 0;
        room.receiveEvent(b);
      },
      playerInput: function(input, byId){
        var b = Ga.la(input);
        b.P = byId;
        room.receiveEvent(b);
      },
      playerChat: function(msg, byId){
        var b = Na.la(msg);
        b.P = byId;
        room.receiveEvent(b);
      },
      setKeyState: function(keyState){
        obj.playerInput(keyState, options?.controlledPlayerId || 0);
      },
      setPlayerChatIndicator: function(value, byId){
        var b = na.la(value);
        b.P = byId;
        room.receiveEvent(b);
      },
      setPlayerAvatar: function(headless, value, byId){
        if (headless){
          var msg = qb.la(byId, value);
          msg.P = 0;
        }
        else{
          var b = ra.la(value);
          b.P = byId;
        }
        room.receiveEvent(b);
      },
      setCurrentStadium: function(value, byId, onError){
        try {
          var b = qa.la(value);
          b.P = byId;
          room.receiveEvent(b);
        } catch (k) {
          b = k instanceof q ? k.Ta : k,
          b instanceof SyntaxError ? onError(createError(ErrorCodes.StadiumParseSyntaxError, b.lineNumber)) :  // "SyntaxError in line: " + b.lineNumber
          b instanceof Bb ? onError(b.xp) : onError(createError(ErrorCodes.StadiumParseUnknownError, b)); // "Error loading stadium file."
        }
      },
      sendAnnouncement: function(msg, color=-1, style=0, sound=1, targetId, byId){
        var b = rb.la(msg, color, style, sound);
        b.P = byId;
        room.receiveEvent(b);
      },
      startGame: function(byId){
        var b = Ma.la();
        b.P = byId;
        room.receiveEvent(b);
      },
      stopGame: function(byId){
        var b = La.la();
        b.P = byId;
        room.receiveEvent(b);
      },
      setGamePaused: function(value, byId){
        var b = Oa.la(value);
        b.P = byId;
        room.receiveEvent(b);
      },
      setScoreLimit: function(value, byId){
        var b = da.la(0, value);
        b.P = byId;
        room.receiveEvent(b);
      },
      setTimeLimit: function(value, byId){
        var b = da.la(1, value);
        b.P = byId;
        room.receiveEvent(b);
      },
      setTeamsLock: function(value, byId){
        var b = pa.la(value);
        b.P = byId;
        room.receiveEvent(b);
      },
      autoTeams: function(byId){
        var b = Qa.la();
        b.P = byId;
        room.receiveEvent(b);
      },
      setPlayerTeam: function(playerId, teamId, byId){
        var team = p.byId[teamId];
        if (!team)
          return;
        var b = S.la(playerId, team);
        b.P = byId;
        room.receiveEvent(b);
      },
      setKickRateLimit: function(min, rate, burst, byId){
        var b = ma.la(min, rate, burst);
        b.P = byId;
        room.receiveEvent(b);
      },
      setTeamColors: function(teamId, angle, colors, byId){
        var b = ub.__cq__(teamId, angle, ...colors);
        b.P = byId;
        room.receiveEvent(b);
      },
      setPlayerAdmin: function(playerId, value, byId){
        var b = sa.la(playerId, value);
        b.P = byId;
        room.receiveEvent(b);
      },
      kickPlayer: function(playerId, reason, ban, byId){
        var b = Y.la(playerId, reason, ban);
        b.P = byId;
        room.receiveEvent(b);
      },
      setPlayerSync: function(value, byId){
        var b = ta.la(value);
        b.P = byId;
        room.receiveEvent(b);
      }, 
      sendPingData: function(valueFunc, byId){
        var b = new la(), d = [];
        for (var e=0; e<room.T.I.length; e++)
          d.push(valueFunc(room.T.I[e]));
        b.we = d;
        b.P = byId;
        room.receiveEvent(b);
      },
      setDiscProperties: function(discId, type, data, byId){
        var b = ob.la(discId, type, data);
        b.P = byId;
        room.receiveEvent(b);
      },
      sendCustomEvent: function(type, data, byId){
        var b = CustomEvent.la(type, data);
        b.P = byId;
        room.receiveEvent(b);
      },
      sendBinaryCustomEvent: function(type, data, byId){
        var b = BinaryCustomEvent.la(type, data);
        b.P = byId;
        room.receiveEvent(b);
      },
      setPlayerIdentity: function(id, data, byId){
        var b = IdentityEvent.la(id, data);
        b.P = byId;
        room.receiveEvent(b);
      },
      executeEvent: function(eventObj){
        room.receiveEvent(eventObj);
      },
      setSimulationSpeed: function(speedCoeff){
        room.setSpeed(speedCoeff);
      },
      runSteps: function(count){
        room.runSteps(count);
      },
      destroy: sandbox.ia
    };
    Object.defineProperty(obj, "gameState", {
      get(){
        return obj.state.K;
      }
    });
    Object.defineProperty(obj, "currentPlayerId", {
      get(){
        return 0;
      }
    });
    return obj;
  }
  




  // -- end of global Haxball classes --





  function readReplay(uint8Array, callbacks, options){
    var b, jb, roomState = new fa;
    try {
      jb = new Jb(uint8Array, roomState, 3, callbacks);
      b = new Vb(jb, callbacks, options);
      jb.parentVb = b;
    } catch (e) {
      var c = e instanceof q ? e.Ta : e;
      if (c instanceof Kb)
        throw createError(ErrorCodes.ReplayFileVersionMismatchError); // "The replay data is of a different version"
      else
        throw createError(ErrorCodes.ReplayFileReadError); // "Couldn't load replay data."
    }
    var obj = {
      state: roomState,
      getSpeed: ()=>{
        return jb.pl;
      },
      setSpeed: (coefficient)=>{ // fastmo: coefficient>1, normal: coefficient=1, slowmo: 0<coefficient<1, stop: coefficient=0
        b.assignCallbacks();
        jb.pl = coefficient;
      },
      getTime: ()=>{ // get current time in msecs.
        return jb.Qb;
      },
      length: ()=>{ // get the total length of replay data in msecs.
        return jb.mh * jb.mf;
      },
      setTime: (destinationTime)=>{ // jump to destinationTime in msecs.
        jb.er(destinationTime);
        //c.Wf || (c.Wf = !0, c.Vp(), c.el())
      },
      getCurrentFrameNo: ()=>{
        return jb.Y;
      },
      setCurrentFrameNo: (destinationFrameNo)=>{
        jb.er(jb.mh * destinationFrameNo);
      },
      destroy: ()=>{
        b.ia();
      }
    };
    Object.defineProperty(obj, "gameState", {
      get(){
        return obj.state.K;
      }
    });
    Object.defineProperty(obj, "currentPlayerId", {
      get(){
        return jb.uc;
      }
    });
    jb.obj = obj;
    return obj;
  }

  function ReplayData(){
    this.roomData = new fa();
    this.events = [];
    this.goalMarkers = [];
    this.totalFrames = 0;
    this.version = 3;
  }

  function readAllReplay(uint8Array){
    var data = new ReplayData();
    var hg = 0;
    var a = new F(new DataView(uint8Array.buffer), !1);
    if (1212305970 != a.hb()) throw new q('');
    var b = a.hb();
    if (3 != b) throw new q(new Kb(b)); // version
    data.totalFrames = a.hb();
    var c = pako.inflateRaw(a.sb());
    var Lc = new F(new DataView(c.buffer, c.byteOffset, c.byteLength));
    var gg = null;
    for (var b = Lc.Ob(), c = 0, i = 0; i < b; i++) {
      c += Lc.Ab();
      data.goalMarkers.push({
        frameNo: c,
        teamId: Lc.B()
      });
    }
    c = Lc.sb();
    Lc = new F(new DataView(c.buffer, c.byteOffset, c.byteLength), !1);
    data.roomData.ja(Lc);
    while(Lc.a < Lc.o.byteLength){
      b = Lc.Ab();
      hg += b;
      b = Lc.Ob();
      gg = m.fh(Lc, true);
      gg.P = b;
      gg.frameNo = hg;
      data.events.push(gg);
    }
    return data;
  }

  function trimReplaySync(replayData, prms){
    if (!replayData)
      return;
    var { roomData, events, totalFrames } = replayData;
    var beginFrameNo = prms?.beginFrameNo || 0;
    if (beginFrameNo<0)
      beginFrameNo = 0;
    var endFrameNo = prms?.endFrameNo || (totalFrames-1);
    if (endFrameNo>=totalFrames)
      endFrameNo = totalFrames-1;
    if (endFrameNo<beginFrameNo)
      return;
    var i = 0, j = 0, event = events[0];
    while(j<beginFrameNo){
      while(j==event?.frameNo){
        event.apply(roomData);
        event = events[++i];
      }
      j++;
      roomData.C(1);
    }
    events = events.filter((evt)=>(evt.frameNo>=beginFrameNo && evt.frameNo<=endFrameNo));
    events.forEach((evt)=>{
      evt.frameNo-=beginFrameNo;
    });
    replayData.events = events;
    replayData.goalMarkers = replayData.goalMarkers.filter((x)=>x.frameNo>=beginFrameNo && x.frameNo<=endFrameNo);
    replayData.goalMarkers.forEach((marker)=>{
      marker.frameNo-=beginFrameNo;
    });
    replayData.totalFrames = endFrameNo-beginFrameNo+1;
  }

  function trimReplayAsync(replayData, prms){
    if (!replayData)
      return Promise.resolve();
    var { roomData, events, totalFrames } = replayData;
    var beginFrameNo = prms?.beginFrameNo || 0;
    if (beginFrameNo<0)
      beginFrameNo = 0;
    var endFrameNo = prms?.endFrameNo || (totalFrames-1);
    if (endFrameNo>=totalFrames)
      endFrameNo = totalFrames-1;
    if (endFrameNo<beginFrameNo)
      return Promise.resolve();
    var i = 0, j = 0, event = events[0];
    return new Promise((resolve, reject)=>{
      var interval;
      interval = setInterval(()=>{
        if (j>=beginFrameNo){
          clearInterval(interval);
          events = events.filter((evt)=>(evt.frameNo>=beginFrameNo && evt.frameNo<=endFrameNo));
          events.forEach((evt)=>{
            evt.frameNo-=beginFrameNo;
          });
          replayData.events = events;
          replayData.goalMarkers = replayData.goalMarkers.filter((x)=>x.frameNo>=beginFrameNo && x.frameNo<=endFrameNo);
          replayData.goalMarkers.forEach((marker)=>{
            marker.frameNo-=beginFrameNo;
          });
          replayData.totalFrames = endFrameNo-beginFrameNo+1;
          resolve();
          return;
        }
        while(j==event?.frameNo){
          event.apply(roomData);
          event = events[++i];
        }
        j++;
        roomData.C(1);
      }, 0);
    });
  }

  function writeAllReplay(replayData){
    var Df = w.ha(16384);
    var d = 0;
    replayData.roomData.ga(Df);
    replayData.events.forEach((b)=>{
      var e = b.frameNo;
      if (e<d)
        return;
      Df.lb(e - d);
      d = e;
      Df.Ub(b.P);
      m.lj(b, Df);
    });
    var Nd = w.ha(1000);
    Nd.Ub(replayData.goalMarkers.length);
    var lastTick = 0;
    replayData.goalMarkers.forEach((marker)=>{
      Nd.lb(marker.frameNo-lastTick);
      Nd.l(marker.teamId);
      lastTick = marker.frameNo;
    });
    Nd.Vb(Df.Sb());
    var a = pako.deflateRaw(Nd.Sb()), b = w.ha(a.byteLength + 32);
    b.Og("HBR2");
    b.tb(replayData.version);
    b.tb(replayData.totalFrames);
    b.Vb(a);
    return b.Sb();
  }

  function fixStorage(options){
    var storage = options?.storage;
    (!storage) && (storage = options.storage = {});
    storage.setValue = (key, value)=>{
      storage[key] = value;
      storage["onValueSet"]?.(key, value);
    };
    var newVal = storage.crappy_router||false;
    if (newVal!=storage.crappy_router)
      storage.setValue("crappy_router", newVal);
    newVal = storage.extrapolation||0;
    if (newVal!=storage.extrapolation)
      storage.setValue("extrapolation", newVal);
    newVal = storage.fps_limit||0;
    if (newVal!=storage.fps_limit)
      storage.setValue("fps_limit", newVal);
    newVal = storage.player_name||"abc";
    if (newVal!=storage.player_name)
      storage.setValue("player_name", newVal);
    newVal = storage.avatar||null;
    if (newVal!=storage.avatar)
      storage.setValue("avatar", newVal);
    if (!storage.geo)
      storage.setValue("geo", {
        "lat": 40,
        "lon": 40,
        "flag": "tr"
      });
    else{
      var oldVal = storage.geo;
      newVal = {
        lat: oldVal.lat || 40,
        lon: oldVal.lon || 40,
        flag: oldVal.flag || "tr"
      };
      if (oldVal.lat!=newVal.lat || oldVal.lon!=newVal.lon || oldVal.flag!=newVal.flag)
        storage.setValue("geo", newVal);
    }
  }

  function createInternalData(haxball){
    var internalData = haxball.__internalData = {
      customClientIds: new Set(), // store for all client ids that are using our modified client.
      roomObj: null,
      extrapolatedRoomState: null,
      roomState: null,
      roomJoinerObj: null,
      isHost: false,
      createRoom: null,
      dummyPromise: Promise.resolve(),
      keyState: 0,
      renderer: haxball.renderer,
      storage: haxball.storage,
      pluginMechanismActive: !haxball.noPluginMechanism,
      onOperationReceived: function(msg, globalFrameNo, clientFrameNo) {
        var oR = haxball.room._onOperationReceived;
        if (!oR)
          return true;
        var c = msg.eventType;
        if (c==null)
          return true;
        return oR(c, msg, globalFrameNo, clientFrameNo);
      },
      execOperationReceivedOnHost: function(msg, targetId, fakeId) {
        if (!internalData.isHost)
          return;
        msg.P = fakeId || 0;
        msg._TP = targetId; // this can not be modified
        return internalData.onOperationReceived(msg, internalData.roomObj?.ya.Y, null);
      }
    };
    haxball.__internalData = internalData;
    return internalData;
  }

  function joinRoom(roomParams, haxballParams) { 
    var {id, password, token, authObj} = roomParams;
    if (!id || !authObj)
      throw createError(ErrorCodes.JoinRoomNullIdAuthError); // "id and authObj cannot be null. (inside 1st parameter)"
    var haxball = Object.assign({}, haxballParams);
    haxball.libraries = haxball.libraries || [];
    haxball.config = haxball.config || {};
    fixStorage(haxball);
    (password == "") && (password = null);
    (haxball.version == null) && (haxball.version = defaultVersion);
    var internalData = createInternalData(haxball);
    var fLeaveRoom = function(x){
      console.log("internal event: LeaveRoom", x.toString());
      removeRoomFromList(haxball.room);
      haxball._onConnectionStateChange = null;
      fLeaveRoom = null;
      haxball.plugins && (haxball.plugins.forEach((p)=>{
        p.finalize?.();
        p.room = null;
      }));
      if (haxball.renderer){
        haxball.renderer.finalize?.();
        haxball.renderer.room = null;
      }
      haxball.config.finalize?.();
      haxball.config.room = null;
      haxball.libraries.forEach((l)=>{
        l.finalize?.();
        l.room = null;
      });
      haxball._onRoomLeave = null;
      internalData.roomObj = null;
      internalData.roomState = null;
      internalData.extrapolatedRoomState = null;
      internalData = null;
      haxball.room = null;
      haxball.onLeave?.(x);
    };
    var fJoinRoomSucceeded = function(){
      console.log("internal event: JoinRoomSucceeded");
      //haxball._onRoomLeave = null;
      haxball._onConnectionStateChange = null;
      fJoinRoomSucceeded = null;
      haxball.room = new Room(haxball.preInit, internalData, haxball.libraries, haxball.config, haxball.plugins);
      allRooms.push(haxball.room);
      haxball.room.client = haxball;
      haxball.room.kickTimeout = haxball.kickTimeout || -1;
      //haxball.emit("roomJoin", haxball.room);
      haxball.onSuccess?.(haxball.room);
      var poc = haxball.room?._onPlayerObjectCreated;
      if (poc)
        internalData.roomObj?.ya.T.I.forEach(poc);
      var pdc = haxball.room?._onPlayerDiscCreated;
      if (pdc)
        internalData.roomObj?.ya.T.I.filter((x)=>(x.H!=null)).forEach(pdc);
    };
    haxball._onConnectionStateChange = function(state, param){
      console.log("internal event: ConnectionStateChange");
      haxball.onConnectionStateChange?.(state, param);
      if (state==4){
        //haxball._onRoomLeave = null;
        haxball._onConnectionStateChange = null;
        fJoinRoomSucceeded = null;
        haxball.room = null;
      }
    };
    haxball._onRoomLeave = fLeaveRoom;
    try {
      var d = haxball.storage.crappy_router,//u.Bo(),
        e = new fa(),
        f = w.ha();
      f.mc(haxball.storage.player_name);//n_A.fe.L()
      f.mc(haxball.storage.geo.flag);//n_A.Lh().ub
      f.Db(haxball.storage.avatar);//n_A.sh.L()
      var g = stunServers,
        k = backendUrl,
        l = f.Kg(),
        t = new xa(haxball, id, {
          iceServers: g,
          ij: k,
          state: e,
          version: haxball.version,
          Ms: l,
          password: password,
          cn: d,
          gn: token,
          ds: authObj
        });
      console.log("Connecting to master...");
      
      haxball.cancel = function(){
        t.Ad = null;
        t.df = null;
        t.ia();
      };
      var m = function (a) {
        removeRoomFromList(haxball.room);
        haxball.cancel = null;
        haxball.onFailure?.(a);
      };
      var r = function () {
        haxball.cancel = null;
        var b = new ba(haxball, t);
        b.Bg = roomLink(id, false);
        t.dl = function (a) {
          haxball.room._onPingChange?.(a, t.sg.$g(0.5), t.sg.max());
        };
        b.de = function () {
          t.Ad = null;
          t.ia();
          b.ia();
          //haxball.emit("roomLeave");
        };
        t.Ad = function () {
          t.Ad = null;
          b.ia();
          /*var a = null == b.Ed ? null : */b.Ed?.stop();
          m(t.ek/*, a*/);
        };
        internalData.isHost = false;
        internalData.roomObj = b;
        internalData.roomState = e;
        fJoinRoomSucceeded?.();
      };
      t.df = function (c) {
        t.df = null;
        t.Ad = null;
        switch (c.nb) {
          case 1:
            m(createError(ErrorCodes.FailedHost)); // "Failed to connect to room host. If this problem persists please see the troubleshooting guide: https://github.com/haxball/haxball-issues/wiki/Connection-Issues"
            break;
          case 2:
            switch (c.reason) {
              case 4004:{ // recaptcha required
                // Quitting the room causes RecaptchaToken signal to become obsolate.
                //var fR = (c)=>{
                  //haxball.off("RecaptchaToken", fR);
                  //u.Pf(id, password, c); // Also, u.Pf now returns Promise, so what to do with the return value?
                //};
                //haxball.once("RecaptchaToken", fR);
                haxball.onRequestRecaptcha?.();
                m(c); // <----- added for now to quit and rejoin room (to avoid some memory leaks & other problems.)
                //u.no(a, function (c) {
                  //u.Pf(a, password, c);
                //});
                break;
              }
              case 4101: // password required
                //null == password ? 
                  //u.Dh(a) 
                //:
                  m(c); // send "connection closed" for now. (maybe a PasswordRequired signal?)
                break;
              default:
                m(c);
            }
            break;
          default:
            m(c);
        }
      };
      t.Ad = function (a) {
        switch (a) {
          case 1:
            console.log("Connecting to peer...");
            break;
          case 2:
            console.log("Awaiting state...");
            break;
          case 3:
            r();
        }
      };
      t.Sp = function () {
        console.log("Trying reverse connection...");
        haxball.onReverseConnection?.();
      };
    } catch (ic) {
      console.log(ic instanceof q ? ic.Ta : ic);
      removeRoomFromList(haxball.room);
      haxball.cancel = null;
      haxball.onFailure?.(createError(ErrorCodes.Unknown, ic instanceof q ? ic.Ta : ic)/*ic*//* instanceof q ? ic.Ta : ic*/);
      //console.log(ic instanceof q ? ic.Ta : ic),
        //(c = new P("Unexpected Error", "", [])),
        //(c.Vd.innerHTML =
          //"An error ocurred while attempting to join the room.<br><br>This might be caused by a browser extension, try disabling all extensions and refreshing the site.<br><br>The error has been printed to the inspector console."),
        //x.La(c.g);
    }
    return haxball;
  };

  function createRoom(roomParams, haxballParams){
    var haxball = Object.assign({}, haxballParams);
    haxball.config = haxball.config || {};
    haxball.libraries = haxball.libraries || [];
    fixStorage(haxball);
    haxball.onHostError = roomParams.onError;
    (haxball.version == null) && (haxball.version = defaultVersion);
    var internalData = createInternalData(haxball);
    var fLeaveRoom = function(){
      console.log("internal event: LeaveRoom");
      removeRoomFromList(haxball.room);
      fLeaveRoom = null;
      fCreateRoomSucceeded = null;
      haxball.plugins && (haxball.plugins.forEach((p)=>{
        p.finalize?.();
        p.room = null;
      }));
      if (haxball.renderer){
        haxball.renderer.finalize?.();
        haxball.renderer.room = null;
      }
      haxball.config.finalize?.();
      haxball.config.room = null;
      haxball.libraries.forEach((l)=>{
        l.finalize?.();
        l.room = null;
      });
      fLeaveRoom = null;
      internalData.roomObj = null;
      internalData.roomState = null;
      internalData.extrapolatedRoomState = null;
      internalData = null;
      haxball.room = null;
      haxball.onLeave?.();
    };
    var fCreateRoomSucceeded = function(){
      console.log("internal event: CreateRoomSucceeded");
      //fLeaveRoom = null;
      fCreateRoomSucceeded = null;
      haxball.room = new Room(haxball.preInit, internalData, haxball.libraries, haxball.config, haxball.plugins);
      allRooms.push(haxball.room);
      haxball.room.client = haxball;
      haxball.room.kickTimeout = haxball.kickTimeout || -1;
      haxball.room.hostPing = 0;
      haxball.onSuccess?.(haxball.room);
      var poc = haxball.room._onPlayerObjectCreated;
      if (poc)
        internalData.roomObj?.ya.T.I.forEach(poc);
    };
    var { storage } = haxball;
    function c() { // update & synchronize room data with haxball main server via websocket.
      if (l.Ks) {
        var a = new Fb();
        a.Id = haxball.version;
        a.w = g.jc;
        a.I = (l.cpc!=null) ? l.cpc : g.I.length;
        a.Xe = l.fg + 1;
        a.ub = l.geo.ub;
        a.Ib = (l.fPwd==null) ? (null != l.Ib) : l.fPwd;
        a.Ec = l.geo.Ec;
        a.Gc = l.geo.Gc;
        var c = w.ha(16);
        a.ga(c);
        a = c.Kg();
        l.Fi(a);
      }
    }
    function parseGeo(geo){
      var geoData = storage.geo;//n_A.geo;
      return T.Rf({
        lat: (geo && geo.lat) || geoData.lat,
        lon: (geo && geo.lon) || geoData.lon,
        code: (geo && geo.flag) ? geo.flag : geoData.flag,
      });
    }
    var e = null, g = new fa();
    g.jc = roomParams.name;
    var l = new Lb(haxball, {
      iceServers: stunServers,
      ij: httpUrl + "api/host",
      state: g,
      version: haxball.version,
      gn: roomParams.token
    });
    l.geo = parseGeo(roomParams.geo); // n_A.Lh(),
    var k;
    if (!roomParams.noPlayer){
      k = new ea();
      k.w = storage.player_name; // n_A.fe.L();
      k.cb = true;
      k.Kd = l.geo.ub;
      k.Xb = storage.avatar; // n_A.sh.L();
      k.customClient = true; // host is of course using the modified client :)
      g.I.push(k);
    }
    l.upc = !!roomParams.unlimitedPlayerCount;
    l.Ks = !!roomParams.showInRoomList;
    l.cpc = roomParams.playerCount;
    l.fPwd = (roomParams.fakePassword==null) ? null : (!!roomParams.fakePassword);
    l.fg = (roomParams.maxPlayerCount|0) - 1;
    l.Ib = (roomParams.password=="") ? null : roomParams.password;
    c();
    var t = new ba(haxball, l);
    var m = setInterval(function () {
      var a = la.la(l);
      internalData.execOperationReceivedOnHost(a)!=false && l.ra(a);
    }, 3e3);
    l.$k = function (a) {
      null != g.na(a) && ((a = Y.la(a, createError(ErrorCodes.BadActorError).toString(), !1)), (internalData.execOperationReceivedOnHost(a)!=false && l.ra(a))); // "Bad actor"
    };
    l.Hp = function (a, b, conn, auth) { // receive conn & auth data
      var d = b.ic();
      if (25 < d.length) throw new q(createError(ErrorCodes.PlayerNameTooLongError, conn, auth, d)); // "name too long"
      var e = b.ic();
      if (3 < e.length) throw new q(createError(ErrorCodes.PlayerCountryTooLongError, conn, auth, d, e)); // "country too long"
      var f = b.zb();
      if (null != f && 2 < f.length) throw new q(createError(ErrorCodes.PlayerAvatarTooLongError, conn, auth, d, e, f)); // "avatar too long"
      var mP = haxball.room._modifyPlayerData;
      if (mP){
        var newPlayerData = mP(a, d, e, f, conn, auth);
        if (!newPlayerData)
          throw new q(createError(ErrorCodes.PlayerJoinBlockedByMPDError, conn, auth, d, e, f)); // "Player join not allowed: " + d + " " + e + " " + f + " " + conn + " " + auth
        [d, e, f] = newPlayerData;
      }
      d = oa.la(a, d, e, f, conn, auth);
      if (internalData.execOperationReceivedOnHost(d)==false)
        throw new q(createError(ErrorCodes.PlayerJoinBlockedByORError, d)); // "Player join event blocked by OperationReceived: " + d
      l.ra(d);
      c();
      internalData.dummyPromise.then(()=>{ // send this initial message only to this client once to see whether this player is using our modified client.
        internalData.roomObj?.ya._mf_(na.la(0, a, 0), a, true);
      });
    };
    l.Ip = function (a) {
      null != g.na(a) && ((a = Y.la(a, null, !1)), (internalData.execOperationReceivedOnHost(a)!=false && l.ra(a))); // should we allow Player leave event to be blocked by OperationReceived ???
    };
    l.kg = function (a) {
      e = a;
      t.Bg = roomLink(a, null != l.Ib);
      haxball.room._onRoomLink?.(t.Bg);
    };
    t.Np = function (a, b, c, d) {
      l.to(a, b, c, d);
    };
    t.Op = function () {
      c();
    };
    t.de = function () {
      l.ia();
      t.ia();
      clearInterval(m);
      fLeaveRoom();
    };
    haxball.cancel = t.de;
    t.Of.Fg = function (a) {
      l.Ib = a;
      c();
      null != e && (t.Bg = roomLink(e, null != l.Ib));
      haxball.room._onRoomPropertiesChange?.({password: a});
    };
    t.Of.Ud = l.Ud.bind(l);
    t.Of.td = l.td.bind(l);
    t.Of.xd1 = l.xd1.bind(l);
    t.Of.xd2 = l.xd2.bind(l);
    t.Of.xd3 = l.xd3.bind(l);
    t.Of.xd4 = l.xd4.bind(l);
    t.Of.__srp__ = function (a) {
      if (!a)
        return;
      var props = {};
      if (a.hasOwnProperty("name"))
        props.name = g.jc = a.name || "";
      if (a.hasOwnProperty("password"))
        props.password = l.Ib = a.password;
      if (a.hasOwnProperty("fakePassword"))
        props.fakePassword = l.fPwd = a.fakePassword;
      if (a.hasOwnProperty("geo")){
        props.geo = a.geo;
        var f = parseGeo(a.geo);
        if (k)
          k.Kd = f.ub;
      }
      if (a.hasOwnProperty("unlimitedPlayerCount"))
        props.unlimitedPlayerCount = l.upc = !!a.unlimitedPlayerCount;
      if (a.hasOwnProperty("showInRoomList"))
        props.showInRoomList = l.Ks = !!a.showInRoomList;
      if (a.hasOwnProperty("playerCount"))
        props.playerCount = l.cpc = a.playerCount;
      if (a.hasOwnProperty("maxPlayerCount"))
        props.maxPlayerCount = l.fg = (a.maxPlayerCount==null) ? null : (a.maxPlayerCount - 1);
      c();
      if (a.hasOwnProperty("password"))
        null != e && (t.Bg = roomLink(e, null != l.Ib));
      haxball.room._onRoomPropertiesChange?.(props);
    };
    t.Of.__supc__ = function (a) {
      l.upc = a;
    };
    t.Of.__sfp__ = function (a) {
      l.fPwd = a;
      c();
    };
    internalData.isHost = true;
    internalData.roomObj = t;
    internalData.roomState = g;
    fCreateRoomSucceeded();
    return haxball;
  }

  function generateAuth(){ // returns Promise([authKey, authObj])
    try {
      return I.yo().then((a)=>{
        return [a.Ir(), a];
      });
    } catch (a) {
      return Promise.reject(a);
    }
  }

  function authFromKey(key){ // returns Promise(authObj)
    try {
      return I.xo(key);
    } catch (a) {
      return Promise.reject(a);
    }
  }

  function numberToColor(number){ // lc
    return "rgba("+[(number&16711680)>>>16, (number&65280)>>>8, number&255].join()+",255)";
  }

  function colorToNumber(color){
    var arr = color.match(/rgba?[ \t]*\([ \t]*(\d+),[ \t]*(\d+),[ \t]*(\d+)[ \t]*\)/);
    if (arr.length<4)
      return;
    var r = parseInt(arr[1]), g = parseInt(arr[2]), b = parseInt(arr[3]);
    if (r>255 || g>255 || b>255)
      return;
    return (r<<16)|(g<<8)|b;
  }

  function ipToNumber(ip){
    if (ip?.includes(".")){
      var x = ip.split(".");
      if (x.length>4)
        return;
      while (x.length<4)
        x.splice(0,0,"");
      return x.reduce((old,x,i)=>{if (old==null) return; var t=parseInt(x.length>0?x:"0"); if (isNaN(t) || t<0 || t>255) return null; old|=t<<(24-i*8); return old;}, 0);
    }
    if (ip?.includes(":")){
      var x = ip.split(":");
      var idx = ip.indexOf("::");
      if (idx!=ip.lastIndexOf("::"))
        return;
      if (idx>=0){
        var l = x.length;
        if (l>9)
          return;
        idx = x.findIndex((y)=>(y.length==0));
        if (idx==0 || (idx==l-2 && x[l-1].length==0)){
          x.splice(idx,1);
          l--;
        }
        x[idx] = "0";
        for (var i=0;i<8-l;i++)
          x.splice(idx+1,0,"0");
      }
      if (x.length!=8)
        return;
      return x.reduce((old,x,i)=>{if (old==null) return; var t=parseInt(x,16); if (isNaN(t) || t<0 || t>65535) return; old|=BigInt(t)<<(112n-BigInt(i)*16n); return old;}, 0n);
    }
  }

  function numberToIp(number){
    var c = number?.__proto__.constructor.name;
    if (c=="BigInt"){
      var s=[], bseq={i:-1, l:0}, cseq={i:-1, l:0};
      for (var i=0;i<8;i++){
        var val=number&65535n;
        if (val==0){
          if (cseq.l==0)
            cseq.i=7-i;
          cseq.l++;
          if (cseq.l>bseq.l){
            bseq.l=cseq.l;
            bseq.i=cseq.i;
          }
        }
        else
          cseq.l=0;
        s.splice(0,0,val.toString(16));
        number>>=16n;
      }
      if (bseq.l>0){
        var i = bseq.i-bseq.l+1;
        s.splice(i, bseq.l-1);
        s[i]="";
      }
      var tmp = s.join(":");
      if (tmp.length==0)
        tmp="::";
      else if (tmp.charAt(tmp.length-1)==":")
        tmp+=":";
      else if (tmp.charAt(0)==":")
        tmp=":"+tmp;
      return tmp;
    }
    else if (c=="Number"){
      var s=[];
      for (var i=0;i<4;i++){
        s.splice(0,0,""+(number&255));
        number>>=8;
      }
      return s.join(".");
    }
  }

  function authToNumber(auth){
    if (auth.length!=43)
      return;
    var x = 0n;
    for (var i=0,j=252;i<43;i++,j-=6){
      var c = auth.charCodeAt(i);
      if (c==45) c=0;
      else if (c==95) c=63;
      else if (c>=48 && c<=57) c-=47;
      else if (c>=65 && c<=90) c-=54;
      else if (c>=97 && c<=122) c-=60;
      else return;
      x|=(BigInt(c)<<BigInt(j));
    }
    return x;
  }

  function numberToAuth(number){
    var c = number?.__proto__.constructor.name;
    if (c!="BigInt")
      return;
    var auth = "";
    for (var i=0;i<43;i++){
      var c = Number(number&63n);
      if (c==0) c=45;
      else if (c==63) c=95;
      else if (c>=1 && c<=10) c+=47;
      else if (c>=11 && c<=36) c+=54;
      else if (c>=37 && c<=62) c+=60;
      else return;
      auth=String.fromCharCode(c)+auth;
      number>>=6n;
    }
    return auth;
  }

  function compareBits(value1,value2,bitMask){
    return !((value1^value2)&bitMask);
  }
  
  function stadiumChecksum(stadium) { // returns null for original maps, checksum value for custom maps
    return stadium.Pe() ? null : J.Vg(stadium.Sj(), 8);
  }

  function keyState(dirX, dirY, kick){ // dirX = oneof[-1:left, 0:still, 1:right], dirY = oneof[-1:up, 0:still, 1:down], kick = true/false
    return (kick?16:0) | (dirX>0?8:(dirX<0?4:0)) | (dirY>0?2:(dirY<0?1:0));
  }

  function reverseKeyState(state){
    return {
      dirX: ((state&8)>0)-((state&4)>0),
      dirY: ((state&2)>0)-((state&1)>0),
      kick: (state&16)>0
    };
  }

  var getRoomList = () => M.L(httpUrl + "api/list", "arraybuffer").then((a)=>{
    a = new F(new DataView(a), !1);
    a.B();
    var b = [];
    while (a.o.byteLength - a.a != 0) {
      var c = a.ie(a.Ob()), d = a.Cl(a.Ob());
      try {
        var e = new Fb();
        e.ja(new F(new DataView(d), !1));
        var f = new Wb();
        f.vd = e;
        f.$ = c;
        b.push(f);
      } catch (g) {}
    }
    return b;
  });

  function calculateAllRoomDistances(geo, roomList) {
    const dtR = Math.PI/180;
    for (var c = geo.Ec, d = geo.Gc, e = 0; e < roomList.length; e++) {
      var f = roomList[e];
      var {Ec, Gc} = f.vd;
      var c1 = Math.cos(dtR*(Ec-c)), c2 = Math.cos(dtR*(Ec+c));
      f.Le = 6378 * Math.acos((c1-c2+(c1+c2)*Math.cos(dtR*(Gc-d)))/2);
      isFinite(f.Le) || (f.Le = 22e3);
    }
  }

  function getGeo() {
    return T.Fo();
  }

  function geoFromJSON(json) {
    return T.Rf(json);
  }

  function geoFromString(string) {
    return T.Hh(string);
  }

  function getDefaultStadiums(){
    return h.Kh();
  }

  function parseStadium(textDataFromHbsFile, onError){
    try {
      var stadium = new h();
      stadium.Lk(textDataFromHbsFile);
      return stadium;
    } catch (k) {
      b = k instanceof q ? k.Ta : k,
      b instanceof SyntaxError ? onError(createError(ErrorCodes.StadiumParseSyntaxError, b.lineNumber)) :  // "SyntaxError in line: " + b.lineNumber
      b instanceof Bb ? onError(b.xp) : onError(createError(ErrorCodes.StadiumParseUnknownError, b)); // "Error loading stadium file."
    }
  }

  function exportStadium(stadium){
    return stadium.se();
  }

  function getVertexIndexAtMapCoord(roomState, {x, y}, threshold){
    return roomState.K?.ta.J.findIndex((vertex)=>{
      var deltaX = vertex.a.x-x, deltaY = vertex.a.y-y;
      return (deltaX*deltaX+deltaY*deltaY<=threshold*threshold);
    });
  }

  function getSegmentIndexAtMapCoord(roomState, {x, y}, threshold){
    return roomState.K?.ta.U.findIndex((segment)=>{
      var d;
      if (0*segment.vb==0){
        var dx = x-segment.Xd.x, dy = y-segment.Xd.y;
        if ((segment.Hg.x*dx+segment.Hg.y*dy>0 && segment.Ig.x*dx+segment.Ig.y*dy>0)==(segment.vb<=0))
          return false;
        d = Math.sqrt(dx*dx+dy*dy)-segment.Yj;
      }
      else{
        var p0 = segment.W.a, p1 = segment.ca.a, dx = p1.x-p0.x, dy = p1.y-p0.y, _dx = x-p1.x, _dy = y-p1.y;
        if ((x-p0.x)*dx+(y-p0.y)*dy<=0 || _dx*dx+_dy*dy>=0)
          return false;
        d = segment.wa.x*_dx+segment.wa.y*_dy;
      }
      return Math.abs(d)<threshold;
    });
  }

  function getGoalIndexAtMapCoord(roomState, {x, y}, threshold){
    return roomState.S.tc.findIndex((goal)=>{
      var p0 = goal.W, p1 = goal.ca, dx = p1.x-p0.x, dy = p1.y-p0.y, _dx = x-p1.x, _dy = y-p1.y;
      if ((x-p0.x)*dx+(y-p0.y)*dy<=0 || _dx*dx+_dy*dy>=0)
        return false;
      var d = Math.sqrt(dy*dy+dx*dx);
      return (Math.abs(_dx*dy/d-_dy*dx/d)<threshold);
    });
  }

  function getPlaneIndexAtMapCoord(roomState, {x, y}, threshold){
    return roomState.K?.ta.qa.findIndex((plane)=>{
      return (Math.abs(plane.Ua-(plane.wa.x*x+plane.wa.y*y))<threshold);
    });
  }

  function getJointIndexAtMapCoord(roomState, {x, y}, threshold){
    var mapObjects = roomState.K?.ta;
    if (!mapObjects)
      return -1;
    var discs = mapObjects.F;
    return mapObjects.pb.findIndex((joint)=>{
      var disc1 = discs[joint.Zd]; // a
      if (!disc1)
        return false;
      var disc2 = discs[joint.Yd]; // b
      if (!disc2)
        return false;
      var p0 = disc1.a, p1 = disc2.a, dx = p1.x-p0.x, dy = p1.y-p0.y, _dx = x-p1.x, _dy = y-p1.y;
      if ((x-p0.x)*dx+(y-p0.y)*dy<=0 || _dx*dx+_dy*dy>=0)
        return false;
      var d = Math.sqrt(dy*dy+dx*dx);
      return (Math.abs(_dx*dy/d-_dy*dx/d)<threshold);
    });
  }

  function getDiscIndexAtMapCoord(roomState, {x, y}){
    return roomState.K?.ta.F.findIndex((disc)=>{
      var deltaX = disc.a.x-x, deltaY = disc.a.y-y;
      return (deltaX*deltaX+deltaY*deltaY<=disc.Z*disc.Z);
    });
  }

  function getSpawnPointIndexAtMapCoord(roomState, {x, y}, threshold){
    if (!threshold)
      threshold = roomState.K?.S.ge.Z;
    var sqrThreshold = threshold*threshold;
    var idx = roomState.K?.S.Dd.findIndex((p)=>{
      var deltaX = p.x-x, deltaY = p.y-y;
      return (deltaX*deltaX+deltaY*deltaY<=sqrThreshold);
    });
    if (idx>=0)
      return [idx, 1];
    idx = roomState.K?.S.md.findIndex((p)=>{
      var deltaX = p.x-x, deltaY = p.y-y;
      return (deltaX*deltaX+deltaY*deltaY<=sqrThreshold);
    });
    if (idx>=0)
      return [idx, 2];
    return [-1, -1];
  }

  function getVertexAtMapCoord(roomState, p, threshold){
    return roomState.K?.ta.J[getVertexIndexAtMapCoord(roomState, p, threshold)];
  }

  function getSegmentAtMapCoord(roomState, p, threshold){
    return roomState.K?.ta.U[getSegmentIndexAtMapCoord(roomState, p, threshold)];
  }

  function getGoalAtMapCoord(roomState, p, threshold){
    return roomState.S.tc[getGoalIndexAtMapCoord(roomState, p, threshold)];
  }

  function getPlaneAtMapCoord(roomState, p, threshold){
    return roomState.K?.ta.qa[getPlaneIndexAtMapCoord(roomState, p, threshold)];
  }

  function getJointAtMapCoord(roomState, p, threshold){
    return roomState.K?.ta.pb[getJointIndexAtMapCoord(roomState, p, threshold)];
  }

  function getDiscAtMapCoord(roomState, p){
    return roomState.K?.ta.F[getDiscIndexAtMapCoord(roomState, p)];
  }

  var eventCallbacks = [];

  function Room(preInit, internalData, libraries, config, plugins){
    var renderer = internalData.renderer, cfg = config;
    Object.defineProperty(this, "config", {
      get(){
        return cfg;
      }
    });
    Object.defineProperty(this, "sdp", { // usage: require("sdp-transform").parse(sdp);
      get(){
        return internalData.isHost ? null : internalData.roomObj?.ya.pa.Ra.remoteDescription.sdp;
      }
    });
    Object.defineProperty(this, "isHost", {
      get(){
        return internalData.isHost;
      }
    });
    Object.defineProperty(this, "currentPlayerId", {
      get(){
        return internalData.roomObj?.ya.uc;
      }
    });
    Object.defineProperty(this, "currentPlayer", {
      get(){
        var id = internalData.roomObj?.ya.uc;
        return internalData.roomObj?.ya.T.I.filter((x)=>(x.V==id))[0];
      }
    });
    Object.defineProperty(this, "state", {
      get(){
        return internalData.roomObj?.ya?.T;
      }
    });
    Object.defineProperty(this, "stateExt", {
      get(){
        return internalData.extrapolatedRoomState;
      }
    });
    Object.defineProperty(this, "gameState", {
      get(){
        return internalData.roomState?.K;
      }
    });
    Object.defineProperty(this, "gameStateExt", {
      get(){
        return internalData.extrapolatedRoomState?.K;
      }
    });
    Object.defineProperty(this, "currentFrameNo", {
      get(){
        return internalData.roomObj?.ya?.Y;
      }
    });
    Object.defineProperty(this, "banList", {
      get(){
        return internalData.roomObj?.ya?.Ic?.banList?.getList();
      }
    });
    Object.defineProperty(this, "token", {
      get(){
        return internalData.roomObj?.ya?.Ic?.Dg;
      },
      set(value){
        var v = internalData.roomObj?.ya?.Ic;
        if (!v)
          return;
        v.Dg = value;
        v.Mh();
        internalData.roomObj.Bg = "";
        v.Ul = setTimeout(()=>{
          v.Ji();
          this._onRoomTokenChange?.(v.Dg);
        }, 2*v.Zq);
      }
    });
    Object.defineProperty(this, "requireRecaptcha", {
      get(){
        return internalData.roomObj?.ya?.Ic?.dm;
      },
      set(value){
        internalData.roomObj?.ya?.Ic?.Ei(value);
      }
    });
    Object.defineProperty(this, "name", {
      get: function () {
        return internalData.roomObj?.ya?.T.jc;
      }
    });
    Object.defineProperty(this, "password", {
      get: function () {
        return internalData.roomObj?.ya?.Ib;
      }
    });
    Object.defineProperty(this, "geo", {
      get: function () {
        return internalData.roomObj?.ya?.geo;
      }
    });
    Object.defineProperty(this, "maxPlayerCount", {
      get: function () {
        var x = internalData.roomObj?.ya?.fg;
        return (x==null) ? null : (x+1);
      }
    });
    Object.defineProperty(this, "fakePassword", {
      get: function () {
        return internalData.roomObj?.ya?.fPwd;
      }
    });
    Object.defineProperty(this, "fixedPlayerCount", {
      get: function () {
        return internalData.roomObj?.ya?.cpc;
      }
    });
    Object.defineProperty(this, "showInRoomList", {
      get: function () {
        return internalData.roomObj?.ya?.Ks;
      }
    });
    Object.defineProperty(this, "unlimitedPlayerCount", {
      get: function () {
        return internalData.roomObj?.ya?.upc;
      }
    });
    Object.defineProperty(this, "link", {
      get: function () {
        return internalData.roomObj?.Bg;
      }
    });
    Object.defineProperty(this, "timeLimit", {
      get: function () {
        return internalData.roomObj?.ya.T.Da;
      }
    });
    Object.defineProperty(this, "scoreLimit", {
      get: function () {
        return internalData.roomObj?.ya.T.ib;
      }
    });
    Object.defineProperty(this, "redScore", {
      get: function () {
        return (internalData.extrapolatedRoomState?.K || internalData.roomState?.K)?.Pb;
      }
    });
    Object.defineProperty(this, "blueScore", {
      get: function () {
        return (internalData.extrapolatedRoomState?.K || internalData.roomState?.K)?.Kb;
      }
    });
    Object.defineProperty(this, "timeElapsed", {
      get: function () {
        return (internalData.extrapolatedRoomState?.K || internalData.roomState?.K)?.Hc;
      }
    });
    Object.defineProperty(this, "stadium", {
      get: function () {
        return internalData.roomObj?.ya.T.S;
      }
    });
    Object.defineProperty(this, "players", {
      get: function () {
        return internalData.roomObj?.ya.T.I;
      }
    });

    this.kickTimeout = -1;
    this.libraries = libraries || [];
    this.librariesMap = this.libraries.reduce((acc, x)=>{
      acc[x.name] = x;
      return acc;
    }, {});
    this.renderer = renderer;
    if (internalData.pluginMechanismActive){
      this.plugins = plugins || [];
      this.pluginsMap = this.plugins.reduce((acc, x)=>{
        acc[x.name] = x;
        return acc;
      }, {});
      this.activePlugins = this.plugins.filter((p)=>p.active);

      function addInOrder(a, b, x){ // a is an array, b is the same array with some elements removed, x is one of the removed elements. objective is to always add the same element back in the same index.
        var i=0, j=0;
        while(i<a.length && j<b.length){
          while (i<a.length && j<b.length && a[i]==b[j] && a[i]!=x){
            i++;
            j++;
          }
          if (a[i]==x)
            break;
          while (i<a.length && j<b.length && a[i]!=b[j] && a[i]!=x){
            i++;
          }
          if (a[i]==x)
            break;
        }
        if (b[j]!=x)
          b.splice(j, 0, x);
      }

      var that = this;

      this.setConfig = function(newCfg){
        var oldCfg = cfg;
        oldCfg.finalize?.();
        oldCfg.room = null;
        newCfg = newCfg || {};
        newCfg.room = that;
        newCfg.initialize?.();
        that.client.config = newCfg;
        cfg = newCfg;
        that._onConfigUpdate?.(oldCfg, newCfg);
      };

      this.mixConfig = function(newCfg){
        Object.keys(newCfg).forEach((key)=>{
          var f2 = newCfg[key];
          if (typeof f2=="function"){
            var f1 = cfg[key];
            if (!f1)
              cfg[key] = f2;
            else if (typeof f1=="function"){
              cfg[key] = function(...args){
                f1(...args);
                f2(...args);
              };
            }
          }
        });
      };

      this.setRenderer = function(newRenderer){
        if (renderer){
          renderer.finalize?.();
          renderer.room = null;
        }
        if (newRenderer){
          newRenderer.room = that;
          newRenderer.initialize?.();
        }
        var oldRenderer = renderer;
        that.renderer = newRenderer;
        that.client.renderer = newRenderer;
        internalData.renderer = newRenderer;
        renderer = newRenderer;
        that._onRendererUpdate?.(oldRenderer, newRenderer);
      };

      this.setPluginActive = function(name, active){
        var p = that.plugins.filter((x)=>x.name==name)[0];
        if (!p || p.active==active)
          return;
        if (!active){
          var idx = that.activePlugins.findIndex((x)=>x.name==name);
          if (idx<0)
            return;
          p.active = active;
          that._onPluginActiveChange?.(p);
          that.activePlugins.splice(idx, 1);
        }
        else{
          var idx = that.activePlugins.findIndex((x)=>x.name==name);
          if (idx>=0)
            return;
          //that.activePlugins.splice(oIdx, 0, p); // might change the order of plugins, therefore we have to implement addInOrder.
          addInOrder(that.plugins, that.activePlugins, p); // insert plugin to its old index. 
          p.active = active;
          that._onPluginActiveChange?.(p);
        }
      };

      function defineCfgProperty(name){
        Object.defineProperty(that, name, {
          get(){
            return cfg[name];
          },
          set(value){
            cfg[name] = value;
          }
        });
      }

      function defineCfgModifierCallback(name){
        defineCfgProperty(name + "Before");
        defineCfgProperty(name);
        defineCfgProperty(name + "After");
      }

      this._modifyPlayerData = function(playerId, name, flag, avatar, conn, auth){
        var a = [name, flag, avatar], customData;
        cfg.modifyPlayerDataBefore && ([a, customData] = cfg.modifyPlayerDataBefore(playerId, a[0], a[1], a[2], conn, auth));
        if (customData!==false){
          that.activePlugins.forEach((p)=>{
            p.modifyPlayerData && a && (a = p.modifyPlayerData(playerId, a[0], a[1], a[2], conn, auth, customData));
          });
          cfg.modifyPlayerData && a && (a = cfg.modifyPlayerData(playerId, a[0], a[1], a[2], conn, auth, customData));
          cfg.modifyPlayerDataAfter && a && (a = cfg.modifyPlayerDataAfter(playerId, a[0], a[1], a[2], conn, auth, customData));
        }
        return a;
      };
      defineCfgModifierCallback("modifyPlayerData");

      this._modifyPlayerPing = function(playerId, ping){
        var customData;
        cfg.modifyPlayerPingBefore && ([ping, customData] = cfg.modifyPlayerPingBefore(playerId, ping));
        if (customData!==false){
          that.activePlugins.forEach((p)=>{
            p.modifyPlayerPing && (ping = p.modifyPlayerPing(playerId, ping, customData));
          });
          cfg.modifyPlayerPing && (ping = cfg.modifyPlayerPing(playerId, ping, customData));
          cfg.modifyPlayerPingAfter && (ping = cfg.modifyPlayerPingAfter(playerId, ping, customData));
        }
        return ping;
      };
      defineCfgModifierCallback("modifyPlayerPing");

      this._modifyClientPing = function(ping){
        var customData;
        cfg.modifyClientPingBefore && ([ping, customData] = cfg.modifyClientPingBefore(ping));
        if (customData!==false){
          that.activePlugins.forEach((p)=>{
            p.modifyClientPing && (ping = p.modifyClientPing(ping, customData));
          });
          cfg.modifyClientPing && (ping = cfg.modifyClientPing(ping, customData));
          cfg.modifyClientPingAfter && (ping = cfg.modifyClientPingAfter(ping, customData));
        }
        return ping;
      };
      defineCfgModifierCallback("modifyClientPing");

      this._modifyFrameNo = function(frameNo){
        var customData;
        cfg.modifyFrameNoBefore && ([frameNo, customData] = cfg.modifyFrameNoBefore(frameNo));
        if (customData!==false){
          that.activePlugins.forEach((p)=>{
            p.modifyFrameNo && (frameNo = p.modifyFrameNo(frameNo, customData));
          });
          cfg.modifyFrameNo && (frameNo = cfg.modifyFrameNo(frameNo, customData));
          cfg.modifyFrameNoAfter && (frameNo = cfg.modifyFrameNoAfter(frameNo, customData));
        }
        return frameNo;
      };
      defineCfgModifierCallback("modifyFrameNo");

      this._onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo){
        var customData = cfg.onBeforeOperationReceived && cfg.onBeforeOperationReceived(type, msg, globalFrameNo, clientFrameNo), b = (customData!==false);
        that.activePlugins.forEach((p)=>{
          if (b && p.onOperationReceived && !p.onOperationReceived(type, msg, globalFrameNo, clientFrameNo, customData))
            b = false;
        });
        if (b && cfg.onOperationReceived && !cfg.onOperationReceived(type, msg, globalFrameNo, clientFrameNo, customData))
          b = false;
        if (b && cfg.onAfterOperationReceived && !cfg.onAfterOperationReceived(type, msg, globalFrameNo, clientFrameNo, customData))
          b = false;
        return b;
      };
      defineCfgProperty("onBeforeOperationReceived");
      defineCfgProperty("onOperationReceived");
      defineCfgProperty("onAfterOperationReceived");

      // metadata is not used or stored, it's just for general information about the event. 
      // we should not use the original variable names inside metadata as string, otherwise they will not be minified.
      var createEventCallback = function(eventName, metadata){
        that["_on" + eventName] = function(...params){
          var f = cfg["onBefore" + eventName], customData = f && f(...params);
          if (customData!==false){
            that.activePlugins.forEach((p)=>{
              f = p["on" + eventName], (f && f(...params, customData));
            });
            f = cfg["on" + eventName], (f && f(...params, customData));
            f = renderer && renderer["on" + eventName], (f && f(...params, customData));
            f = cfg["onAfter" + eventName], (f && f(...params, customData));
          }
        };
        defineCfgProperty("onBefore" + eventName);
        defineCfgProperty("on" + eventName);
        defineCfgProperty("onAfter" + eventName);
      };

      eventCallbacks.forEach(({name, metadata})=>{
        createEventCallback(name, metadata);
      });
    }

    this.setProperties = function(properties) { // { name, password, geo: { lat, lon, flag }, playerCount, maxPlayerCount, fakePassword }
      if (!internalData.isHost)
        return;
      internalData.roomObj?.Of.__srp__(properties);
    };

    this.setKickRateLimit = function(min, rate, burst) {
      var msg = ma.la(min, rate, burst);
      internalData.execOperationReceivedOnHost(msg)!=false && internalData.roomObj?.ya.ra(msg);
    };

    this.executeEvent = function(msg, byId) {
      internalData.execOperationReceivedOnHost(msg, undefined, byId)!=false && internalData.roomObj?.ya?.ra(msg);
    };
    
    this.clearEvents = function() {
      var x = internalData.roomObj?.ya?.le;
      if (!x)
        return;
      x.list.length = 0;
    };

    this.sendCustomEvent = function(type, data, targetId) {
      var x = internalData.roomObj?.ya;
      if (!x?.T || (targetId!=null && !x.T.na(targetId)?.customClient))
        return;
      var msg = CustomEvent.la(type, data);
      internalData.execOperationReceivedOnHost(msg, targetId)!=false && (
        (this.isHost ? 
          null != targetId ? internalData.dummyPromise.then(function() {
            x._mf_(msg, targetId);
          }) : x.ra_custom(msg, 0, true) 
        :
          (x.T.na(0)?.customClient && x.ra(msg))
        )
      );
    };

    this.sendBinaryCustomEvent = function(type, data, targetId) {
      var x = internalData.roomObj?.ya;
      if (!x?.T || (targetId!=null && !x.T.na(targetId)?.customClient))
        return;
      var msg = BinaryCustomEvent.la(type, data);
      internalData.execOperationReceivedOnHost(msg, targetId)!=false && (
        (this.isHost ? 
          null != targetId ? internalData.dummyPromise.then(function() {
            x._mf_(msg, targetId);
          }) : x.ra_custom(msg, 0, true) 
        :
          (x.T.na(0)?.customClient && x.ra(msg))
        )
      );
    };

    this.setPlayerIdentity = function(id, data, targetId) {
      var x = internalData.roomObj?.ya;
      if (!x?.T || (targetId!=null && !x.T.na(targetId)?.customClient))
        return;
      var msg = IdentityEvent.la(id, data);
      internalData.execOperationReceivedOnHost(msg, targetId)!=false && (
        (this.isHost ? 
          null != targetId ? internalData.dummyPromise.then(function() {
            x._mf_(msg, targetId);
          }) : x.ra_custom(msg, 0, true) 
        :
          (x.T.na(0)?.customClient && x.ra(msg))
        )
      );
    };

    this.setHandicap = function(handicap) {
      internalData.roomObj?.ya.kr(handicap);
    };

    this.setExtrapolation = function(extrapolation) {
      that.client.__internalData.storage.setValue("extrapolation", extrapolation);
      internalData.roomObj?.ya.gm(extrapolation);
    };
    
    this.clearBan = function(playerId) {
      if (!internalData.isHost)
        return;
      internalData.roomObj?.ya.td(playerId);
    };
    
    this.clearBans = function() {
      if (!internalData.isHost)
        return;
      internalData.roomObj?.ya.Ud();
    };
    
    this.addPlayerBan = function(playerId) {
      if (!internalData.isHost)
        return;
      var playerObj = internalData.roomObj?.ya.T.I.filter((x)=>x.V==playerId)[0];
      if (!playerObj)
        return;
      return internalData.roomObj?.ya.xd1(playerObj);
    };
    
    this.addIpBan = function(...values) {
      if (!internalData.isHost)
        return;
      return internalData.roomObj?.ya.xd2(...values);
    };
    
    this.addAuthBan = function(...values) {
      if (!internalData.isHost)
        return;
      return internalData.roomObj?.ya.xd3(...values);
    };
    
    this.removeBan = function(banId) {
      if (!internalData.isHost)
        return;
      return internalData.roomObj?.ya.xd4(banId);
    };

    this.setAvatar = function(avatar) {
      null != avatar && (avatar = avatar.substr(0, 2));
      that.client.__internalData.storage.setValue("avatar", avatar);
      var msg = ra.la(avatar);
      internalData.execOperationReceivedOnHost(msg)!=false && internalData.roomObj?.ya.ra(msg);
    };

    this.setPlayerAvatar = function(id, value, headless){ // host-only
      if ((!internalData.isHost) && (headless || id!=internalData.roomObj.ya.uc))
        return;
      var msg = headless ? qb.la(id, value) : ra.la(value);
      internalData.execOperationReceivedOnHost(msg, undefined, headless?0:id)!=false && internalData.roomObj?.ya.ra(msg);
    };

    this.reorderPlayers = function(playerIdList, moveToTop){ // host-only
      var msg = pb.la(playerIdList, moveToTop);
      internalData.execOperationReceivedOnHost(msg)!=false && internalData.roomObj?.ya.ra(msg);
    };

    this.setChatIndicatorActive = function(active) {
      var msg = na.la(active ? 0 : 1);
      internalData.execOperationReceivedOnHost(msg)!=false && internalData.roomObj?.ya.ra(msg);
    };

    this.setTeamColors = function(teamId, angle, ...colors) { // teamId: one of (1=red, 2=blue), colors: maximum 4 parseable color parameters 
      var msg = ub.__cq__(teamId, angle, ...colors);
      internalData.execOperationReceivedOnHost(msg)!=false && internalData.roomObj?.ya.ra(msg);
    };

    this.setUnlimitedPlayerCount = function(on){ // boolean
      internalData.roomObj?.Of.__supc__(on);
    };

    this.setFakePassword = function(on){ // boolean
      internalData.roomObj?.Of.__sfp__(on);
    };

    var sendIndividualChat = function(msg, targetId) {
      var x = internalData.roomObj?.ya;
      if (!x)
        return;
      var d = Na.la(msg);
      (internalData.execOperationReceivedOnHost(d, targetId)!=false) && (
        null != targetId ? internalData.dummyPromise.then(function() {
          x._mf_(d, targetId);
        }) : x.ra(d)
      );
    };

    this.sendChat = function(msg, targetId){  // can only use targetId in host mode.
      if (internalData.isHost)
        sendIndividualChat(msg, targetId);
      else{
        var x = internalData.roomObj?.ya;
        if (!x)
          return;
        var c = Na.la(msg);
        internalData.execOperationReceivedOnHost(c)!=false && x.ra(c);
      }
    };

    this.sendChatIndicator = function(active){
      internalData.roomObj?.bm(active);
    };

    this.sendAnnouncement = function(msg, targetId, color, style, sound) { // host-only function
      if (!internalData.isHost)
        return;
      var x = internalData.roomObj?.ya;
      if (!x)
        return;
      style = {
        bold: 1,
        italic: 2,
        small: 3,
        "small-bold": 4,
        "small-italic": 5
      }[style];
      null == style && (style = 0);
      null == color && (color = -1);
      null == sound && (sound = 1);
      var h = rb.la(msg, color, style, sound);
      (internalData.execOperationReceivedOnHost(h, targetId)!=false) && (
        null != targetId ? internalData.dummyPromise.then(function() {
          x._mf_(h, targetId);
        }) : x.ra(h)
      )
    };

    this.setDiscProperties = function(discId, properties) { // host-only function
      if (!internalData.isHost)
        return;
      var x = internalData.roomObj?.ya;
      if (!x)
        return;
      var msg = ob.la(discId, !1, properties);
      internalData.execOperationReceivedOnHost(msg)!=false && x.ra(msg);
    };

    this.setPlayerDiscProperties = function(playerId, properties) { // host-only function
      if (!internalData.isHost)
        return;
      var x = internalData.roomObj?.ya;
      if (!x)
        return;
      var msg = ob.la(playerId, !0, properties);
      internalData.execOperationReceivedOnHost(msg)!=false && x.ra(msg);
    };

    this.getKeyState = function(){
      return internalData.keyState;
    };

    this.setKeyState = function(state){
      if (that.kickTimeout<0)
        internalData.keyState = state;
      else if ((state&16) > 0 && (internalData.keyState&16) > 0 && !that.currentPlayer?.Wb){
        internalData.keyState = state&-17;
        setTimeout(()=>{
          internalData.keyState = state;
        }, that.kickTimeout);
      }
      else
        internalData.keyState = state;
    };

    this.startGame = function(){
      internalData.roomObj?.Yp();
    };

    this.stopGame = function(){
      internalData.roomObj?.Zp();
    };

    this.pauseGame = function(){
      internalData.roomObj?.Mp();
    };

    this.autoTeams = function(){
      internalData.roomObj?.Dp();
    };

    this.lockTeams = function(){
      internalData.roomObj?.$p(!(internalData.roomState?.Pc));
    };

    this.isGamePaused = function(){
      return (120 == internalData.roomState?.K?.Oa);
    };

    this.resetTeams = function(){
      var r = internalData.roomObj;
      if (!r?.ya || !r.ya.T.I.filter((x)=>(x.V==r.ya.uc))[0]?.cb) // !! FIX ME: missing noPlayer check.
        return;
      p.byId.forEach((x,i)=>(i>0 && r.ee(x)))
    };

    this.startRecording = function(){ // return true(success)/false(failure - already recording)
      return internalData.roomObj?._Qp_(true);
    };

    this.stopRecording = function(){ // return Uint8Array(success)/null(failure - recording not started)
      return internalData.roomObj?._Qp_(false);
    };

    this.isRecording = function(){
      return (internalData.roomObj?.Ed != null);
    };

    this.randTeams = function(){
      internalData.roomObj?.Pp();
    };

    this.setSync = function(value){ // host-only
      internalData.roomObj?.ya?.T.ko(value);
    };

    this.leave = function(){
      internalData.roomObj?.de();
    };

    this.setCurrentStadium = function(stadium, onError){
      try {
        internalData.roomObj?.og(stadium);
      } catch (k) {
        b = k instanceof q ? k.Ta : k,
        b instanceof SyntaxError ? onError(createError(ErrorCodes.StadiumParseSyntaxError, b.lineNumber)) :  // "SyntaxError in line: " + b.lineNumber
        b instanceof Bb ? onError(b.xp) : onError(createError(ErrorCodes.StadiumParseUnknownError, b)); // "Error loading stadium file."
      }
    };

    this.setTimeLimit = function(value){
      internalData.roomObj?.aq(value);
    };

    this.setScoreLimit = function(value){
      internalData.roomObj?.Tp(value);
    };

    this.changeTeam = function(teamId){
      var t = p.byId[teamId];
      if (!t)
        return;
      internalData.roomObj?.mg(internalData.roomObj?.ya.uc, t);
    };

    this.resetTeam = function(teamId){
      var t = p.byId[teamId], r = internalData.roomObj;
      if (!t || !r?.ya || !r.ya.T.I.filter((x)=>(x.V==r.ya.uc))[0]?.cb) // !! FIX ME: missing noPlayer check.
        return;
      internalData.roomObj?.ee(t);
    };

    this.setPlayerTeam = function(playerId, teamId){
      var t = p.byId[teamId];
      if (!t)
        return;
      internalData.roomObj?.mg(playerId, t);
    };

    this.setPlayerAdmin = function(playerId, isAdmin){
      var msg = sa.la(playerId, isAdmin);
      internalData.execOperationReceivedOnHost(msg)!=false && internalData.roomObj?.ya?.ra(msg);
    };

    this.kickPlayer = function(playerId, reason, isBanning){
      var msg = Y.la(playerId, reason || "", isBanning);
      internalData.execOperationReceivedOnHost(msg)!=false && internalData.roomObj?.ya?.ra(msg);
    };



    
    // all fake functions here are host-only:

    this.fakePlayerJoin = function(id, name, flag, avatar, conn, auth){ // id is uint16. to avoid desync, use 0<=id<=65535 and follow basro's all other limitations. 
      var msg = oa.la(id, name, flag, avatar, conn, auth);
      internalData.execOperationReceivedOnHost(msg)!=false && internalData.roomObj?.ya?.ra(msg);
    };

    this.fakePlayerLeave = function(playerId){ // playerId=0 -> desync.
      var playerObj = internalData.roomObj?.ya.T.na(playerId);
      if (!playerObj)
        return;
      var msg = Y.la(playerId, null, true);
      internalData.execOperationReceivedOnHost(msg)!=false && internalData.roomObj?.ya?.ra(msg);
      return { // return the old data in case you want to use it to reconstruct the original player object.
        id: playerObj.V, 
        name: playerObj.w, 
        flag: playerObj.Kd, 
        avatar: playerObj.Xb, 
        conn: playerObj.conn, 
        auth: playerObj.auth
      };
    };

    function fakeSend(id, msg){
      internalData.execOperationReceivedOnHost(msg, undefined, id)!=false && internalData.roomObj?.ya?.ra(msg);
    }

    this.fakeSendPlayerInput = function(input, byId){
      fakeSend(byId, Ga.la(input));
    };

    this.fakeSendPlayerChat = function(msg,/* targetId,*/ byId){
      fakeSend(byId, Na.la(msg));
      /*
      // below code is not working due to basro not sending byId here and then using it on the client side.
      var x = internalData.roomObj?.ya;
      if (!x)
        return;
      var d = Na.la(msg);
      (internalData.execOperationReceivedOnHost(d, targetId, byId)!=false) && (
        null != targetId ? internalData.dummyPromise.then(function() {
          x._mf_(d, targetId);
        }) : x.ra(d)
      );
      */
    };

    this.fakeSetPlayerChatIndicator = function(value, byId){
      fakeSend(byId, na.la(value ? 0 : 1));
    };

    this.fakeSetPlayerAvatar = function(value, byId){
      fakeSend(byId, ra.la(value));
    };

    this.fakeSetStadium = function(value, byId){ // only works if game is stopped
      fakeSend(byId, qa.la(value));
    };
    /*
    this.fakeSendAnnouncement = function(msg, color=-1, style=0, sound=1, targetId, byId){ // host-only, so it does not work.
      fakeSend(byId, rb.la(msg, color, style, sound));
    };
    */
    this.fakeStartGame = function(byId){
      fakeSend(byId, Ma.la());
    };

    this.fakeStopGame = function(byId){
      fakeSend(byId, La.la());
    };

    this.fakeSetGamePaused = function(value, byId){
      fakeSend(byId, Oa.la(value));
    };

    this.fakeSetScoreLimit = function(value, byId){
      fakeSend(byId, da.la(0, value));
    };

    this.fakeSetTimeLimit = function(value, byId){
      fakeSend(byId, da.la(1, value));
    };

    this.fakeSetTeamsLock = function(value, byId){
      fakeSend(byId, pa.la(value));
    };

    this.fakeAutoTeams = function(byId){
      fakeSend(byId, Qa.la());
    };

    this.fakeSetPlayerTeam = function(playerId, teamId, byId){
      var team = p.byId[teamId];
      if (!team)
        return;
      fakeSend(byId, S.la(playerId, team));
    };

    this.fakeSetKickRateLimit = function(min, rate, burst, byId){
      fakeSend(byId, ma.la(min, rate, burst));
    };

    this.fakeSetTeamColors = function(teamId, angle, colors, byId){
      fakeSend(byId, ub.__cq__(teamId, angle, ...colors));
    };

    this.fakeSetPlayerAdmin = function(playerId, value, byId){
      fakeSend(byId, sa.la(playerId, value));
    };

    this.fakeKickPlayer = function(playerId, reason, ban, byId){
      fakeSend(byId, Y.la(playerId, reason, ban));
    };

    this.fakeSetPlayerSync = function(value, byId){
      fakeSend(byId, ta.la(value));
    };
    /*
    this.fakeSendPingData = function(valueFunc, byId){ // host-only, so it does not work.
      for (var b = new la(), c = internalData.roomObj?.ya?.T?.I, d = [], e = 0; e < c.length; )
        d.push(valueFunc(c[e++]));
      b.we = d;
      fakeSend(byId, b);
    };

    this.fakeSetDiscProperties = function(discId, type, data, byId){ // host-only, so it does not work.
      fakeSend(byId, ob.la(discId, type, data));
    };
    */

    this.getPlayer = function(id){
      return internalData.roomObj?.ya.T.I.filter((x)=>x.V==id)[0];
    };

    this.getBall = function(extrapolated = true){
      var p = extrapolated ? internalData.extrapolatedRoomState?.K : internalData.roomState?.K;
      return p?.ta.F[0];
    };

    this.getDiscs = function(extrapolated = true){
      var p = extrapolated ? internalData.extrapolatedRoomState?.K : internalData.roomState?.K;
      return p?.ta.F;
    };

    this.getDisc = function(discId, extrapolated = true){
      var p = extrapolated ? internalData.extrapolatedRoomState?.K : internalData.roomState?.K;
      return p?.ta.F[discId];
    };

    this.getPlayerDisc = function(playerId, extrapolated = true){
      var p = extrapolated ? internalData.extrapolatedRoomState?.K : internalData.roomState?.K;
      var a1 = p?.ta.F, a2 = internalData.roomObj?.ya?.T?.S.F;
      if (!a1 || !a2)
        return;
      for (var i=a2.length;i<a1.length;i++)
        if (a1[i].playerId==playerId)
          return a1[i];
    };

    this.getPlayerDisc_exp = function(playerId){
      return internalData.roomObj?.ya?.T?.I.filter((x)=>x.V==playerId)[0]?.H;
    };


    // -------------------------------------------
    // sandbox mode functions:
    // -------------------------------------------

    this.takeSnapshot = function(){
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.copy();
    };

    this.exportStadium = function(){
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.exportStadium();
    };

    this.createVertex = function(data) { // data: { x: number, y: number, bCoef: number, cMask: array of string, cGroup: array of string }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.createVertex(data);
    };

    this.createSegment = function(data) { // data: { v0: number, v1: number, color: ("transparent" || string || [r: number, g: number, b: number]), bias: number, (curve: number || curveF: number), vis: boolean, bCoef: number, cMask: array of string, cGroup: array of string }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.createSegment(data);
    };

    this.createSegmentFromObj = function(data) { // data: { v0: vertexObj, v1: vertexObj, color: ("transparent" || string || [r: number, g: number, b: number]), bias: number, (curve: number || curveF: number), vis: boolean, bCoef: number, cMask: array of string, cGroup: array of string }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.createSegmentFromObj(data);
    };

    this.createGoal = function(data) { // data: { p0: [x: number, y: number], p1: [x: number, y: number], team: ("red" || "blue") }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.createGoal(data);
    };

    this.createPlane = function(data) { // data: { normal: [x: number, y: number], dist: number, bCoef: number, cMask: array of string, cGroup: array of string }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.createPlane(data);
    };

    this.createDisc = function(data) { // data: { pos: [x: number, y: number], speed: [x: number, y: number], gravity: [x: number, y: number], radius: number, invMass: number, damping: number, color: ("transparent" || string || [r: number, g: number, b: number]), bCoef: number, cMask: array of string, cGroup: array of string }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.createDisc(data);
    };

    this.createJoint = function(data) { // data: { d0: number, d1: number, color: ("transparent" || string || [r: number, g: number, b: number]), strength: "rigid" || number, length: null || number || [min: number, max: number] }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.createJoint(data);
    };

    this.createJointFromObj = function(data) { // data: { d0: discObj, d1: discObj, color: ("transparent" || string || [r: number, g: number, b: number]), strength: "rigid" || number, length: null || number || [min: number, max: number] }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.createJointFromObj(data);
    };

    this.addVertex = function(data) { // data: { x: number, y: number, bCoef: number, cMask: array of string, cGroup: array of string }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.addVertex(data);
    };

    this.addSegment = function(data) { // data: { v0: number, v1: number, color: ("transparent" || string || [r: number, g: number, b: number]), bias: number, (curve: number || curveF: number), vis: boolean, bCoef: number, cMask: array of string, cGroup: array of string }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.addSegment(data);
    };

    this.addGoal = function(data) { // data: { p0: [x: number, y: number], p1: [x: number, y: number], team: ("red" || "blue") }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.addGoal(data);
    };

    this.addPlane = function(data) { // data: { normal: [x: number, y: number], dist: number, bCoef: number, cMask: array of string, cGroup: array of string }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.addPlane(data);
    };

    this.addDisc = function(data) { // data: { pos: [x: number, y: number], speed: [x: number, y: number], gravity: [x: number, y: number], radius: number, invMass: number, damping: number, color: ("transparent" || string || [r: number, g: number, b: number]), bCoef: number, cMask: array of string, cGroup: array of string }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.addDisc(data);
    };

    this.addJoint = function(data) { // data: { d0: number, d1: number, color: ("transparent" || string || [r: number, g: number, b: number]), strength: "rigid" || number, length: null || number || [min: number, max: number] }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.addJoint(data);
    };

    this.addSpawnPoint = function(data) { // data: { x: number, y: number, team: ("red" || "blue") }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.addSpawnPoint(data);
    };

    this.addPlayer = function(data) { // data: { pos: [x: number, y: number], speed: [x: number, y: number], gravity: [x: number, y: number], radius: number, invMass: number, damping: number, bCoef: number, cMask: array of string, cGroup: array of string, id: integer, name: string, avatar: string, flag: string, team: ("spec" || "red" || "blue") }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.addPlayer(data);
    };

    this.findVertexIndicesOfSegmentObj = function(segmentObj){
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.findVertexIndicesOfSegmentObj(segmentObj);
    };

    this.findVertexIndicesOfSegment = function(segmentIndex){
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.findVertexIndicesOfSegment(segmentIndex);
    };

    this.updateVertex = function(idx, data) { // data: { x: number, y: number, bCoef: number, cMask: array of string, cGroup: array of string }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.updateVertex(idx, data);
    };

    this.updateSegment = function(idx, data) { // data: { v0: number, v1: number, color: ("transparent" || string || [r: number, g: number, b: number]), bias: number, (curve: number || curveF: number), vis: boolean, bCoef: number, cMask: array of string, cGroup: array of string }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.updateSegment(idx, data);
    };

    this.updateGoal = function(idx, data) { // data: { p0: [x: number, y: number], p1: [x: number, y: number], team: ("red" || "blue") }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.updateGoal(idx, data);
    };

    this.updatePlane = function(idx, data) { // data: { normal: [x: number, y: number], dist: number, bCoef: number, cMask: array of string, cGroup: array of string }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.updatePlane(idx, data);
    };

    this.updateDisc = function(idx, data) { // data: { pos: [x: number, y: number], speed: [x: number, y: number], gravity: [x: number, y: number], radius: number, invMass: number, damping: number, color: ("transparent" || string || [r: number, g: number, b: number]), bCoef: number, cMask: array of string, cGroup: array of string }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.updateDisc(idx, data);
    };

    this.updateDiscObj = function(discObj, data) { // data: { pos: [x: number, y: number], speed: [x: number, y: number], gravity: [x: number, y: number], radius: number, invMass: number, damping: number, color: ("transparent" || string || [r: number, g: number, b: number]), bCoef: number, cMask: array of string, cGroup: array of string }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.updateDiscObj(discObj, data);
    };

    this.updateJoint = function(idx, data) { // data: { d0: number, d1: number, color: ("transparent" || string || [r: number, g: number, b: number]), strength: "rigid" || number, length: null || number || [min: number, max: number] }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.updateJoint(idx, data);
    };

    this.updateSpawnPoint = function(idx, team, data) { // data: { x: number, y: number, team: ("red" || "blue") }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.updateSpawnPoint(idx, team, data);
    };

    this.updatePlayer = function(playerId, data) { // data: { pos: [x: number, y: number], speed: [x: number, y: number], gravity: [x: number, y: number], radius: number, invMass: number, damping: number, bCoef: number, cMask: array of string, cGroup: array of string, name: string, avatar: string, flag: string, team: ("spec" || "red" || "blue") }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.updatePlayer(playerId, data);
    };

    this.removeVertex = function(idx) {
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.removeVertex(idx);
    };

    this.removeSegment = function(idx) {
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.removeSegment(idx);
    };

    this.removeGoal = function(idx) {
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.removeGoal(idx);
    };

    this.removePlane = function(idx) {
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.removePlane(idx);
    };

    this.removeDisc = function(idx) {
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.removeDisc(idx);
    };

    this.removeJoint = function(idx) {
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.removeJoint(idx);
    };

    this.removeSpawnPoint = function(idx, team) {
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.removeSpawnPoint(idx, team);
    };

    this.removePlayer = function(playerId) {
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.removePlayer(playerId);
    };

    this.updateStadiumPlayerPhysics = function(data) { // data: { radius: number, gravity: [x: number, y: number], invMass: number, bCoef: number, cGroup: array of string, damping: number, kickingDamping: number, acceleration: number, kickingAcceleration: number, kickStrength: number, kickback: number }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.updateStadiumPlayerPhysics(data);
    };

    this.updateStadiumBg = function(data) { // data: { type: 0("none") || 1("grass") || 2("hockey"), width: number, height: number, kickOffRadius: number, cornerRadius: number, color: ("transparent" || string || [r: number, g: number, b: number]), goalLine: number }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.updateStadiumBg(data);
    };

    this.updateStadiumGeneral = function(data) { // data: { name: string, width: number, height: number, maxViewWidth: number, cameraFollow: 0("") || 1("player"), spawnDistance: number, kickOffReset: true("full") || false("partial"), canBeStored: boolean }
      var o = internalData.roomObj?.ya?.T;
      if (!o)
        return;
      return o.updateStadiumGeneral(data);
    };

    // -------------------------------------------

    this.updatePlugin = function(pluginIndex, newPluginObj){
      var oldPluginObj = that.plugins[pluginIndex];
      if (!oldPluginObj)
        throw createError(ErrorCodes.PluginNotFoundError, pluginIndex); // "Plugin not found at index " + pluginIndex
      var {name, active} = oldPluginObj;
      if (name != newPluginObj.name) // plugin name should not change, otherwise some bugs are possible.
        throw createError(ErrorCodes.PluginNameChangeNotAllowedError); // "Plugin name should not change"
      if (active)
        that.setPluginActive(name, false);
      oldPluginObj.finalize?.();
      oldPluginObj.room = null;
      that.plugins[pluginIndex] = newPluginObj;
      that.pluginsMap[name] = newPluginObj;
      newPluginObj.room = that;
      newPluginObj.initialize?.();
      that._onPluginUpdate?.(oldPluginObj, newPluginObj);
      if (active){
        newPluginObj.active = false; // to force-trigger plugin activation event
        that.setPluginActive(name, true);
      }
    };

    this.updateLibrary = function(libraryIndex, newLibraryObj){
      var oldLibraryObj = that.libraries[libraryIndex];
      if (!oldLibraryObj)
        throw createError(ErrorCodes.LibraryNotFoundError, libraryIndex); // "Library not found at index " + libraryIndex
      var {name} = oldLibraryObj;
      if (name != newLibraryObj.name) // library name should not change, otherwise some bugs are possible.
        throw createError(ErrorCodes.LibraryNameChangeNotAllowedError); // "Library name should not change"
      oldLibraryObj.finalize?.();
      oldLibraryObj.room = null;
      that.libraries[libraryIndex] = newLibraryObj;
      that.librariesMap[name] = newLibraryObj;
      newLibraryObj.room = that;
      newLibraryObj.initialize?.();
      that._onLibraryUpdate?.(oldLibraryObj, newLibraryObj);
    };

    preInit?.(this);

    if (internalData.pluginMechanismActive){
      this.libraries.forEach((l)=>{
        l.room = that;
        l.initialize?.();
      });
      
      cfg.room = that;
      cfg.initialize?.();
      if (renderer){
        renderer.room = that;
        renderer.initialize?.();
      }

      this.plugins.forEach((p)=>{
        p.room = that;
        p.initialize?.();
      });

      this.activePlugins.forEach((p)=>{
        that._onPluginActiveChange?.(p);
      });
    }

    this.startStreaming = ({immediate=true, onClientCount, emitData})=>{ // needs some optimization... hopefully later...
      var a = internalData.roomObj?.ya;
      if (!internalData.isHost || that.isRecording() || !a || a.fc)
        return;

      var Df = new Map(), Dfc = w.ha(16384), nc = 0;/*, sd = {}*/
      /*
      function preInsertValues(value, value2, buffer){
        var newData = new Uint8Array(buffer.byteLength + 5);
        var dv = new DataView(newData.buffer, newData.byteOffset, newData.byteLength);
        dv.setUint8(0, value);
        dv.setUint32(1, value2);
        newData.set(buffer, 5);
        return newData;
      }
      function getInitialStreamingData(clientId){
        if (!internalData.roomObj || !internalData.isHost)
          return;
        var c = w.ha();
        c.l(1);
        c.Ub(clientId);
        var d = w.ha();
        internalData.roomObj.ya._hr(d);
        c.Vb(pako.deflateRaw(d.Sb()));
        return c.Sb();
      }
      function createSocket(url){
        sd.socket = new WebSocket(url);
        sd.socket.onmessage = ({data})=>{
          data = new DataView(data.buffer, data.byteOffset, data.byteLength);
          var t = data.getUint8(0);
          var d = data.getUint16(1);
          switch(t){
            case 0:
              nc = d;
              console.log("set number of clients = "+nc);
              break;
            case 1:
              sd.socket.send(that.getInitialStreamingData(d));
              break;
          }
        };
      }
      that.streamingData = sd;
      createSocket(streamUrl);
      sd.setStreamUrl = (url)=>{
        try{
          sd.socket?.close();
        }catch(x){}
        createSocket(url);
      };
      sd.setCollectTimeMs = (time)=>{
        clearInterval(sd.interval);
        sd.interval = setInterval(fInt, time);
      };
      sd.interval = setInterval(fInt, collectTimeMs);
      */
      return {
        onSuccess: ()=>{
          a.fc = function (b) {
             // we need to find a better way to synchronize the frame no without sending the current frame no inside each message, and even that is not what we are currently doing.
            if (immediate){
              Dfc.l(2);
              Dfc.tb(a.Y);
              Dfc.Ub(b.P);
              m.lj(b, Dfc);
              emitData?.(Dfc.Sb());
              Dfc.a = 0;
              return;
            }
            var v = Df.get(a.Y);
            if (!v){
              v = [];
              Df.set(a.Y, v);
            }
            v.push(b);
            /*
            Df.tb(a.Y);
            Df.Ub(b.P);
            m.lj(b, Df);
            */
          };
        },
        onDataReceived: (data)=>{
          data = new DataView(data.buffer, data.byteOffset, data.byteLength);
          var t = data.getUint8(0);
          var d = data.getUint16(1);
          switch(t){
            case 0:{
              nc = d;
              onClientCount?.(d);
              break;
            }
            case 1:{
              t = w.ha();
              t.l(1);
              t.Ub(d);
              d = w.ha();
              internalData.roomObj.ya._hr(d);
              t.Vb(pako.deflateRaw(d.Sb()));
              emitData?.(t.Sb());
              break;
            }
          }
        },
        interval: ()=>{
          var k = Df.keys(), n = k.next(), YY = a.Y;
          while(!n.done){
            var Y = n.value, b = Df.get(Y);
            Dfc.Ub(YY-Y);
            Dfc.Ub(b.length);
            b.forEach((c)=>{
              Dfc.Ub(c.P);
              m.lj(c, Dfc);
            });
            n = k.next();
          }
          Df.clear();
          var v = Dfc.Sb();
          Dfc.a = 0;
          if (nc==0)
            return;
          /*
          try{
            sd.socket.send(preInsertValues(0, YY, pako.deflateRaw(v)));
          }catch(x){}
          */
          v = pako.deflateRaw(v);
          var newData = new Uint8Array(v.byteLength + 5);
          var dv = new DataView(newData.buffer, newData.byteOffset, newData.byteLength);
          dv.setUint8(0, 0);
          dv.setUint32(1, YY);
          newData.set(v, 5);
          emitData?.(newData);
        }
      };
    };

    this.stopStreaming = ()=>{
      var a = internalData.roomObj?.ya;
      if (!internalData.isHost || that.isRecording() || !a?.fc/* || !that.streamingData*/)
        return;
      a.fc = null;
      /*
      clearInterval(that.streamingData.interval);
      try{
        that.streamingData.socket?.close();
      }catch(x){}
      that.streamingData.socket = sd = that.streamingData = that.streamingData.interval = null;
      */
      Df = Dfc = null;
    };
  }

  // streamWatcher mode section:

  function StreamWatcherRoom(roomState) {
    V.call(this, roomState);
    this.speed = 1;
    this.Li = 0;
    this.Y0 = 0;
    this.frozen = false;
    this.oldEvents = [];
    this.newEvents = [];
    this.maxFrameNo = 0;
    //this.xyz = null;
  }
  StreamWatcherRoom.prototype = C(V.prototype, {
    ra: function () {},
    Sf: function () {
      return this.T;
    },
    C: function () {
      /*
      var targetFrameNo = Math.min((((performance.now()-this.Li)*this.Ac)|0)+this.Y0, this.maxFrameNo)-1;
      if (this.xyz==null && this.newEvents[0]!=null){
        this.xyz = this.Y-this.newEvents[0].mb;
        //this.oldEvents.forEach((x)=>x.mb+=this.xyz);
        //this.newEvents.forEach((x)=>x.mb+=this.xyz);
      }
      //targetFrameNo -= this.xyz|0;
      if (this.Y>=targetFrameNo)
        return;
      //console.log(this.Y, targetFrameNo, this.newEvents.length);
      */
      var targetFrameNo = this.maxFrameNo;
      if (this.Y>=targetFrameNo)
        return;
      do{
        var i = 0, e = this.newEvents[0];
        /*
        //console.log("test", this.Y, e?.mb);
        if (!e || this.Y>e.mb+this.xyz)
          break;
        //console.log("test2");
        while(e?.mb+this.xyz==this.Y){
        */
        if (!e || this.Y>e.mb)
          break;
        while(e?.mb==this.Y){
          e.apply(this.T);
          this.oldEvents.push(e);
          e = this.newEvents[++i];
        }
        this.T.C(1);
        this.Y++;
        this.newEvents.splice(0, i);
      } while (this.Y<targetFrameNo);
      /*
      var targetFrameNo = (((performance.now() - this.Li) * this.Ac) | 0) + this.Y0;
      if (targetFrameNo>this.maxFrameNo)
        targetFrameNo = this.maxFrameNo;
      var a = targetFrameNo - this.Y;
      if (a<=0)
        return;
      //console.log(targetFrameNo, this.maxFrameNo, this.Y, a);
      var b=this.newEvents, c=0, d=b.length;
      console.log(b[0]?.mb, this.Y);
      for (var e=0; e<a; e++) {
        while (c<d){
          var f = b[c++];
          if (f.mb!=this.Y)
            break;
          f.apply(this.T);
          this.oldEvents.push(f);
        }
        this.T.C(1);
        this.Y++;
      }
      b.splice(0, c);
      */
      /*
      var i = 0;
      do{
        var e = this.newEvents[0];
        if (!e || this.Y>e.mb)
          break;
        while(e?.mb==this.Y){
          e.apply(this.T);
          this.oldEvents.push(e);
          e = this.newEvents[++i];
        }
        this.T.C(1);
        this.Y++;
      } while (this.Y<this.maxFrameNo);
      this.newEvents.splice(0, i);
      */
      /*
      var T = this.T, nE = this.newEvents, i = nE.findIndex((x)=>x.mb==Y);
      if (i>-1){
        var e = nE[i], k = i, j = 0, oE = this.oldEvents;
        while(Y==e?.mb){
          e.apply(T);
          oE.push(e);
          e = nE[++i];
          ++j;
        }
        nE.splice(k, j);
      }
      T.C(1);
      this.Y++;
      */
    },
    setSpeed: function(speedCoeff){
      if (speedCoeff<0)
        return;
      if (speedCoeff==0){
        this.frozen = true;
        return;
      }
      this.Y = (this.Y * speedCoeff / this.speed) | 0;
      this.speed = speedCoeff;
      this.frozen = false;
    },
    runSteps: function(count){
      if (!this.frozen)
        return;
      this.T.C(count);
    }
  });

  function createStreamWatcher(a, callbacks={}, options){
    var roomState = new fa(), room = new StreamWatcherRoom(roomState), sandbox = new Sandbox(room, callbacks, options), obj;
    function Gm(a){
      var b = a.hb(),
        c = a.Ab(),
        d = a.Ob(),
        e = a.hb();
      a = m.fh(a);
      a.P = d;
      a.ue = e;
      a.mb = b;
      a.da = c;
      return a;
    }
    function Cg(a) {
      if (a.mb == room.Y && a.da <= room.cc){
        a.da = room.cc++;
        room.receiveEvent(a);
      }
      else
        room.le.Rm(a);
    }
    a = new F(new DataView(a.buffer, a.byteOffset, a.byteLength));
    room.uc = 0;
    room.Li = performance.now();
    room.Y0 = room.Y = a.hb();
    room.te = a.hb();
    room.cc = a.Ab();
    roomState.ja(a);
    while (a.a<a.o.byteLength)
      Cg(Gm(a));
    a = null;
    obj = {
      state: roomState,
      readStream: (reader)=>{
        room.maxFrameNo = reader.hb();
        if (reader.o.byteLength==reader.o.byteOffset+reader.a)
          return;
        var d = pako.inflateRaw(new Uint8Array(reader.o.buffer, reader.a)), l, P, event, f, i;
        reader = new F(new DataView(d.buffer, d.byteOffset, d.byteLength));
        while(reader.a<d.byteLength){
          f = room.maxFrameNo - reader.Ob();
          l = reader.Ob();
          for (i=0;i<l;i++){
            P = reader.Ob();
            event = m.fh(reader, true);
            event.P = P;
            event.mb = f;
            room.newEvents.push(event);
          }
        }
      },
      readImmediateStream: (reader)=>{
        var f = room.maxFrameNo = reader.hb();
        var P = reader.Ob();
        var event = m.fh(reader, true);
        event.P = P;
        event.mb = f;
        room.newEvents.push(event);
      },
      takeSnapshot: function(){
        return roomState.copy();
      },
      useSnapshot: function(newRoomState){
        var state = newRoomState.copy();
        sandbox.setRoomStateObj(state);
        roomState = state;
        obj.state = state;
      },
      setSimulationSpeed: function(speedCoeff){
        room.setSpeed(speedCoeff);
      },
      runSteps: function(count){
        room.runSteps(count);
      },
      destroy: sandbox.ia
    };
    Object.defineProperty(obj, "gameState", {
      get(){
        return obj.state.K;
      }
    });
    Object.defineProperty(obj, "currentPlayerId", {
      get(){
        return 0;
      }
    });
    Object.defineProperty(obj, "currentFrameNo", {
      get(){
        return room.Y;
      }
    });
    Object.defineProperty(obj, "maxFrameNo", {
      get(){
        return room.maxFrameNo;
      }
    });
    return obj;
  };

  function runAfterGameTick(callback, ticks=1){
    if (ticks<=0){
      callback();
      return;
    }
    Promise.resolve().then(()=>{
      runAfterGameTick(callback, ticks-1);
    });
  }

  function Language(abbr, metadata=null){
    this.abbr = abbr;
    this.api = {errors: {}};
    this.defineMetadata(metadata);
  }

  // This function should be overridden when writing a GUI application using this API, before using this Language class.
  Language.prototype.defineMetadata = function(x){};//x={name, version, author, description}

  Language.resolveText = function(s, arr){
    if (!s)
      return;
    var r1 = /\$([\d]+)\?\("([^"]*)":"([^"]*)"\)/gm, r2 = /\$([\d]+)/gm;
    var x, s2="", i=0;
    while((x=r1.exec(s))!=null){
      s2+=s.substring(i,x.index)+(arr[x[1]-1]?x[2]:x[3]);
      i=x.index+x[0].length;
    }
    s2+=s.substring(i);
    s="";
    i=0;
    while((x=r2.exec(s2))!=null){
      s+=s2.substring(i,x.index)+arr[x[1]-1];
      i=x.index+x[0].length;
    }
    s+=s2.substring(i);
    return s;
  };

  function Library(name, metadata=null){
    this.name = name;
    this.defineMetadata(metadata);
  }

  // These functions should be overridden when writing a GUI application using this API, before using this Library class.
  Library.prototype.defineMetadata = function(x){};//x={version, author, description}
  Library.prototype.defineVariable = function(x){//x={name, type, value, range, description}
    var { name, value } = x, that = this;
    if (config.noVariableValueChangeEvent)
      that[name] = value;
    else
      Object.defineProperty(that, name, {
        get: ()=>{
          return value;
        },
        set: (newValue)=>{
          var oldValue = value;
          if (newValue==oldValue)
            return;
          value = newValue;
          that.room?._onVariableValueChange(that, name, oldValue, value);
        }
      });
  };
  Library.prototype.setVariableGUIProps = function(varName, ...vals){}; // vals=[{name: propName, value: propValue}, ...], example: {name: "visible", value: false}

  function RoomConfig(metadata=null){
    this.defineMetadata(metadata);
  }

  // These functions should be overridden when writing a GUI application using this API, before using this RoomConfig class.
  RoomConfig.prototype.defineMetadata = function(x){};//x={name, version, author, description, allowFlags}
  RoomConfig.prototype.defineVariable = function(x){//x={name, type, value, range, description}
    var { name, value } = x, that = this;
    if (config.noVariableValueChangeEvent)
      that[name] = value;
    else
      Object.defineProperty(that, name, {
        get: ()=>{
          return value;
        },
        set: (newValue)=>{
          var oldValue = value;
          if (newValue==oldValue)
            return;
          value = newValue;
          that.room?._onVariableValueChange(that, name, oldValue, value);
        }
      });
  };
  RoomConfig.prototype.setVariableGUIProps = function(varName, ...vals){}; // vals=[{name: propName, value: propValue}, ...], example: {name: "visible", value: false}

  function Renderer(metadata=null){
    this.defineMetadata(metadata);
  }

  // These functions should be overridden when writing a GUI application using this API, before using this Renderer class.
  Renderer.prototype.defineMetadata = function(x){};//x={name, version, author, description}
  Renderer.prototype.defineVariable = function(x){//x={name, type, value, range, description}
    var { name, value } = x, that = this;
    if (config.noVariableValueChangeEvent)
      that[name] = value;
    else
      Object.defineProperty(that, name, {
        get: ()=>{
          return value;
        },
        set: (newValue)=>{
          var oldValue = value;
          if (newValue==oldValue)
            return;
          value = newValue;
          that.room?._onVariableValueChange(that, name, oldValue, value);
        }
      });
  };
  Renderer.prototype.setVariableGUIProps = function(varName, ...vals){}; // vals=[{name: propName, value: propValue}, ...], example: {name: "visible", value: false}

  function Plugin(name, active=false, metadata=null){ // name is important, we activate/deactivate plugins by their names. if active=true, plugin is activated just after initialization.
    this.name = name;
    this.defineMetadata(metadata);
    this.defineVariable({
      name: "active",
      description: "Whether this plugin is active or not.", 
      type: VariableType.Boolean,
      value: active
    });
  }

  // These functions should be overridden when writing a GUI application using this API, before using this Plugin class.
  Plugin.prototype.defineMetadata = function(x){};//x={version, author, description, allowFlags}
  Plugin.prototype.defineVariable = function(x){//x={name, type, value, range, description}
    var { name, value } = x, that = this;
    if (config.noVariableValueChangeEvent)
      that[name] = value;
    else
      Object.defineProperty(that, name, {
        get: ()=>{
          return value;
        },
        set: (newValue)=>{
          var oldValue = value;
          if (newValue==oldValue)
            return;
          value = newValue;
          that.room?._onVariableValueChange(that, name, oldValue, value);
        }
      });
  };
  Plugin.prototype.setVariableGUIProps = function(varName, ...vals){}; // vals=[{name: propName, value: propValue}, ...], example: {name: "visible", value: false}

  const AllowFlags = {
    JoinRoom: 1,
    CreateRoom: 2
  };

  function createEventCallback(name, metadata){
    eventCallbacks.push({ name });
  }

  function destroyEventCallback(name){
    var idx = eventCallbacks.findIndex((x)=>x.name==name);
    if (idx<0)
      return;
    eventCallbacks.splice(idx, 1);
  }

  createEventCallback("PlayerObjectCreated", { params: ["player object"] });
  createEventCallback("PlayerDiscCreated", { params: ["player object"] });
  createEventCallback("PlayerDiscDestroyed", { params: ["player object"] });
  createEventCallback("RoomLink", { params: ["room link"] });
  createEventCallback("PlayerBallKick", { params: ["id of the player that triggered this event"] });
  createEventCallback("TeamGoal", { params: ["team id"] });
  createEventCallback("GameEnd", { params: ["team id that won the game"] });
  createEventCallback("GameTick", { params: [] });
  createEventCallback("PlayerSyncChange", { params: ["player id", "new sync value"] });
  createEventCallback("Announcement", { params: ["announcement message", "announcement color in #rrggbb format", "announcement style (a small number)", "announcement sound type (a small number)"] });
  createEventCallback("KickOff", { params: [] });
  createEventCallback("AutoTeams", { params: ["1st player id", "1st team id", "2nd player id (or null)", "2nd team id (or null)", "id of the player that triggered this event"] });
  createEventCallback("ScoreLimitChange", { params: ["new score limit value", "id of the player that triggered this event"] });
  createEventCallback("TimeLimitChange", { params: ["new time limit value", "id of the player that triggered this event"] });
  createEventCallback("PlayerAdminChange", { params: ["id of the player whose admin status has changed", "new admin status value of the player", "id of the player that triggered this event"] });
  createEventCallback("PlayerAvatarChange", { params: ["id of the player that triggered this event", "new avatar value of the player"] });
  createEventCallback("PlayerHeadlessAvatarChange", { params: ["id of the player that triggered this event", "new avatar value of the player"] });
  createEventCallback("PlayersOrderChange", { params: ["player id list with desired order", "whether to add the players to the top(or bottom) of the list"] });
  createEventCallback("PlayerTeamChange", { params: ["id of the player whose team is changed", "id of the new team of the player", "id of the player that triggered this event"] });
  createEventCallback("StadiumChange", { params: ["new stadium object that is being applied to the room", "id of the player that triggered this event"] });
  createEventCallback("TeamColorsChange", { params: ["id of the team whose colors are being changed", "new team colors", "id of the player that triggered this event"] });
  createEventCallback("TeamsLockChange", { params: ["new teams lock value", "id of the player that triggered this event"] });
  createEventCallback("PlayerJoin", { params: ["original object for the player that has just joined the room"] });
  createEventCallback("GamePauseChange", { params: ["new paused status of the room", "id of the player that triggered this event"] });
  createEventCallback("PlayerChat", { params: ["id of the player that triggered this event", "chat message that was sent"] });
  createEventCallback("PlayerInputChange", { params: ["id of the player that triggered this event", "new input value of the player"] });
  createEventCallback("PlayerChatIndicatorChange", { params: ["id of the player that triggered this event", "new chat indicator value of the player"] });
  createEventCallback("PlayerLeave", { params: ["original object for the player that has just left the room", "reason for leaving the room", "whether the player was banned or not", "id of the player that triggered this event"] });
  createEventCallback("SetDiscProperties", { params: ["id of the disc or the player that just had its properties changed", "whether the changed object is a disc or a player", "data array 1", "data array 2"] });
  createEventCallback("KickRateLimitChange", { params: ["new min value of kick rate limit", "new rate value of kick rate limit", "new burst value of kick rate limit", "id of the player that triggered this event"] });
  createEventCallback("GameStart", { params: ["id of the player that triggered this event"] });
  createEventCallback("GameStop", { params: ["id of the player that triggered this event"] });
  createEventCallback("PingData", { params: ["all ping values of the current room as an array"] });
  createEventCallback("PingChange", { params: ["instant ping value of the current player", "averange ping value of the current player", "max ping value of the current player"] });
  createEventCallback("CollisionDiscVsDisc", { params: ["id of the collided 1st disc", "player id(if exists) of the collided 1st disc", "id of the collided 2nd disc", "player id(if exists) of the collided 2nd disc"] });
  createEventCallback("CollisionDiscVsSegment", { params: ["id of the collided disc", "player id(if exists) of the collided disc", "id of the collided segment"] });
  createEventCallback("CollisionDiscVsPlane", { params: ["id of the collided disc", "player id(if exists) of the collided disc", "id of the collided plane"] });
  createEventCallback("TimeIsUp", { params: [] });
  createEventCallback("PositionsReset", { params: [] });
  createEventCallback("BansClear", { params: [] });
  createEventCallback("BanClear", { params: ["id of the player whose ban is cleared"] });
  createEventCallback("ExtrapolationChange", { params: ["new extrapolation value"] });
  createEventCallback("HandicapChange", { params: ["new handicap value"] });
  createEventCallback("RoomRecaptchaModeChange", { params: ["new recaptcha mode value"] });
  createEventCallback("RoomTokenChange", { params: ["new token value"] });
  createEventCallback("RoomRecordingChange", { params: ["new value indicating whether the game is being recorded"] });
  createEventCallback("RoomPropertiesChange", { params: ["new room properties"] });
  createEventCallback("CustomEvent", { params: ["custom event type", "custom event data", "id of the player that triggered this event"] });
  createEventCallback("BinaryCustomEvent", { params: ["custom event type", "custom event data", "id of the player that triggered this event"] });
  createEventCallback("IdentityEvent", { params: ["id of the player who has just been identified", "user data", "id of the player that triggered this event"] });
  createEventCallback("PluginActiveChange", { params: ["the plugin object that has its active property changed"] });
  createEventCallback("ConfigUpdate", { params: ["old roomConfig object", "new roomConfig object"] });
  createEventCallback("RendererUpdate", { params: ["old renderer object", "new renderer object"] });
  createEventCallback("PluginUpdate", { params: ["old plugin object", "new plugin object"] });
  createEventCallback("LibraryUpdate", { params: ["old library object", "new library object"] });
  createEventCallback("LanguageChange", { params: ["new language abbreviation"] });
  if (!config.noVariableValueChangeEvent)
    createEventCallback("VariableValueChange", { params: ["addon object", "variable name", "old value", "new value"] });

  if (config.fixNames){
    function _fixNames(classObj, nameArray){
      var originalNames = Object.keys(new classObj());
      nameArray.forEach((x, idx)=>{
        if (!x)
          return;
        var name = originalNames[idx];
        Object.defineProperty(classObj.prototype, x, {
          get: function () {
            return this[name];
          },
          set: function(v) {
            this[name] = v;
          }
        });
      });
    }
    _fixNames(ea, [null, "ext", "team", "disc", "kickRateMinTickCounter", "kickRateMaxTickCounter", "isKicking", "id", "input", "name", "ping", null, "flag", "sync", "headlessAvatar", "avatar", "avatarNumber", "isAdmin", null, null, null]);
    _fixNames(p, ["id", "color", "defenseDir", "cMask", "cGroup"]);
    _fixNames(ka, ["angle", "text", "inner"]);
    _fixNames(T, ["flag", "lon", "lat"]);
    _fixNames(B, ["id", "cGroup", "cMask", "bCoef", "pos"]);
    _fixNames(E, ["normal", null, null, null, "center", "v0", "v1", "bias", "bCoef", "cMask", "cGroup", "curveF", "vis", "color"]);
    _fixNames(L, ["cGroup", "cMask", "bCoef", "dist", "normal"]);
    _fixNames(sb, ["team", "p1", "p0"]);
    _fixNames(ua, ["cGroup", "cMask", "color", "damping", "invMass", "bCoef", "radius", "gravity", "speed", "pos"]);
    _fixNames(nb, ["color", "strength", "maxLength", "minLength", "d1", "d0"]);
    _fixNames(ca, [null, null, "ext", null, "cGroup", "cMask", "color", "damping", "invMass", "bCoef", "radius", "gravity", "speed", "pos"]);
    _fixNames(Fa, [null, "ext", "discs", "vertices", "planes", "segments", "joints", "goals"]);
    _fixNames(Eb, ["kickback", "radius", "cGroup", "gravity", "bCoef", "invMass", "damping", "acceleration", "kickingAcceleration", "kickingDamping", "kickStrength"]);
    _fixNames(h, ["vertices", "segments", "planes", "goals", "discs", "joints", "redSpawnPoints", "blueSpawnPoints", "playerPhysics", "defaultStadiumId", "maxViewWidth", "cameraFollow", "canBeStored", "fullKickOffReset", "name", "width", "height", "bgType", "bgColor", "bgWidth", "bgHeight", "bgKickOffRadius", "bgCornerRadius", "spawnDistance", "bgGoalLine"]);
    _fixNames(O, [null, "ext", "pauseGameTickCounter", "timeElapsed", "blueScore", "redScore", null, "state", "goalTickCounter", "physicsState", "timeLimit", "scoreLimit", "stadium", null]);
    _fixNames(fa, [null, "ext", "stadium", "kickRate_min", "kickRate_rate", null, "timeLimit", "scoreLimit", "teamsLocked", "gameState", "players", "name", "teamColors"]);
    _fixNames(Ua, [null, "data"]);
    _fixNames(rb, [null, "msg", null, null, "sound", "byId", "targetId"]);
    _fixNames(na, [null, "value", null, null, "byId"]);
    _fixNames(Ga, [null, null, "byId"]);
    _fixNames(Na, [null, "text", "byId", "targetId"]);
    _fixNames(oa, [null, "id", null, "flag", "avatar", null, null, "byId"]);
    _fixNames(qb, [null, "avatar", "playerId", "byId"]);
    _fixNames(Y, [null, "id", "reason", "ban", "byId"]);
    _fixNames(pb, [null, "playerIdList", "moveToTop", "byId"]);
    _fixNames(Ma, [null, "byId"]);
    _fixNames(La, [null, "byId"]);
    _fixNames(Oa, [null, "paused", "byId"]);
    _fixNames(da, [null, "type", null, "byId"]);
    _fixNames(qa, [null, "stadium", "byId"]);
    _fixNames(S, [null, "playerId", "team", "byId"]);
    _fixNames(pa, [null, null, "byId"]);
    _fixNames(sa, [null, "playerId", "value", "byId"]);
    _fixNames(Qa, [null, "byId"]);
    _fixNames(ta, [null, "value", "byId"]);
    _fixNames(la, [null, "values", "byId"]);
    _fixNames(ra, [null, "value", "byId"]);
    _fixNames(Pa, [null, "team", "colors", "byId"]);
    _fixNames(ma, [null, null, "rate", "burst", "byId"]);
    _fixNames(ob, [null, "id", "type", "data1", "data2", "byId"]);
    _fixNames(CustomEvent, [null, null, null, "byId"]);
    _fixNames(BinaryCustomEvent, [null, null, null, "byId"]);
    _fixNames(IdentityEvent, [null, null, null, "byId"]);
    _fixNames(Wb, ["data", "id", "dist"]);
    _fixNames(Fb, ["version", "name", "flag", "lat", "lon", "password", "maxPlayers", "players"]);
    Object.defineProperty(h.prototype, "isCustom", {
      get: function(){
        return !this.Pe();
      }
    });
  }

  return {
    OperationType,
    VariableType,
    ConnectionState,
    AllowFlags,
    Direction, 
    CollisionFlags,
    CameraFollow, 
    BackgroundType, 
    GamePlayState,
    BanEntryType,
    PlayerPositionInGame,
    Callback: {
      add: createEventCallback,
      remove: destroyEventCallback
    },
    Utils: {
      generateAuth, 
      authFromKey,
      getRoomList, 
      calculateAllRoomDistances,
      numberToColor,
      colorToNumber,
      ipToNumber,
      numberToIp,
      authToNumber,
      numberToAuth,
      compareBits,
      keyState,
      reverseKeyState,
      runAfterGameTick,
      getGeo,
      geoFromJSON,
      geoFromString,
      stadiumChecksum,
      parseStadium,
      exportStadium,
      getDefaultStadiums,
      promiseWithTimeout: pWT,
      trimStringIfLonger: tSil,
      hexStrToNumber: hStn,
      byteArrayToIp: bAti
    },
    EventFactory: {
      create: (type) => {
        var t = m.Qz.get(type);
        if (!t)
          return;
        var b = Object.create(t.prototype);
        b.da = 0;
        if (type==OperationType.SetScoreLimit)
          b.rj = 0;
        else if (type==OperationType.SetTimeLimit)
          b.rj = 1;
        return b;
      },
      createFromStream: (reader) => m.fh(reader, true),
      checkConsistency: (data)=>{
        return Ua.la(data);
      },
      sendAnnouncement: (msg, color=-1, style=0, sound=1)=>{
        return rb.la(msg, color, style, sound);
      },
      sendChatIndicator: (active)=>{
        return na.la(active ? 0 : 1);
      },
      sendInput: (input)=>{
        return Ga.la(input);
      },
      sendChat: (msg)=>{
        return Na.la(msg);
      },
      joinRoom: (id, name, flag, avatar, conn, auth)=>{
        return oa.la(id, name, flag, avatar, conn, auth);
      },
      setHeadlessAvatar: (id, avatar)=>{
        return qb.la(id, avatar);
      },
      kickBanPlayer: (id, reason, ban)=>{
        return Y.la(id, reason, ban);
      },
      reorderPlayers: (playerIdList, moveToTop)=>{
        return pb.la(playerIdList, moveToTop);
      },
      startGame: ()=>{
        return Ma.la();
      },
      stopGame: ()=>{
        return La.la();
      },
      pauseResumeGame: (paused)=>{
        return Oa.la(paused);
      },
      setScoreLimit: (value)=>{
        return da.la(0, value);
      },
      setTimeLimit: (value)=>{
        return da.la(1, value);
      },
      setStadium: (stadium)=>{
        return qa.la(stadium);
      },
      setPlayerTeam: (playerId, teamId)=>{
        var team = p.byId[teamId];
        if (!team)
          return;
        return S.la(playerId, team);
      },
      setTeamsLock: (value)=>{
        return pa.la(value);
      },
      setPlayerAdmin: (playerId, value)=>{
        return sa.la(playerId, value);
      },
      autoTeams: ()=>{
        return Qa.la();
      },
      setPlayerSync: (value)=>{
        return ta.la(value);
      },
      ping: (values)=>{
        return la.la(values);
      },
      setAvatar: (value)=>{
        return ra.la(value);
      },
      setTeamColors: (teamId, colors)=>{
        var team = p.byId[teamId];
        if (!team)
          return;
        return Pa.la(team, colors);
      },
      setKickRateLimit: (min, rate, burst)=>{
        return ma.la(min, rate, burst);
      },
      setDiscProperties: (id, data)=>{
        return ob.la(id, false, data);
      },
      setPlayerDiscProperties: (id, data)=>{
        return ob.la(id, true, data);
      },
      customEvent: (type, data)=>{
        return CustomEvent.la(type, data);
      },
      binaryCustomEvent: (type, data)=>{
        return BinaryCustomEvent.la(type, data);
      },
      setPlayerIdentity: (id, data)=>{
        return IdentityEvent.la(id, data);
      }
    },
    Room: {
      join: joinRoom,
      create: createRoom,
      sandbox: createSandbox,
      streamWatcher: createStreamWatcher,
    },
    Replay: {
      ReplayData: ReplayData,
      read: readReplay,
      readAll: readAllReplay,
      writeAll: writeAllReplay,
      trim: trimReplaySync,
      trimAsync: trimReplayAsync
      //Recorder: ac
    },
    Query: {
      getVertexIndexAtMapCoord: getVertexIndexAtMapCoord,
      getVertexAtMapCoord: getVertexAtMapCoord,
      getSegmentIndexAtMapCoord: getSegmentIndexAtMapCoord,
      getSegmentAtMapCoord: getSegmentAtMapCoord,
      getGoalIndexAtMapCoord: getGoalIndexAtMapCoord,
      getGoalAtMapCoord: getGoalAtMapCoord,
      getPlaneIndexAtMapCoord: getPlaneIndexAtMapCoord,
      getPlaneAtMapCoord: getPlaneAtMapCoord,
      getJointIndexAtMapCoord: getJointIndexAtMapCoord,
      getJointAtMapCoord: getJointAtMapCoord,
      getDiscIndexAtMapCoord: getDiscIndexAtMapCoord,
      getDiscAtMapCoord: getDiscAtMapCoord,
      getSpawnPointIndexAtMapCoord: getSpawnPointIndexAtMapCoord
    },
    Library,
    RoomConfig,
    Plugin,
    Renderer,
    Language,
    Errors: {
      HBError,
      ErrorCodes
    },
    Impl: {
      Core: {
        H, // Point
        ka, // TeamColors
        p, // Team
        T, // GeoLocation
      },
      Stream: {
        F, // StreamReader
        w, // StreamWriter
      },
      Utils: {
        D, // string operations 1
        J, // string operations 2
        K, // string operations 3
        M, // api operations
        q, // global error class
      }
    }
  };
}

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports)
    exports = module.exports = abcHaxballAPI;
  exports.abcHaxballAPI = abcHaxballAPI;
} else if (typeof root !== 'undefined')
  root['abcHaxballAPI'] = abcHaxballAPI;
else
  window['abcHaxballAPI'] = abcHaxballAPI;

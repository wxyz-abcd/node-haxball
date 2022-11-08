const { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } = require("@koush/wrtc");
const { Crypto } = require("@peculiar/webcrypto");
const { inherits } = require("util");
const { EventEmitter } = require("events");
const WebSocket = require("ws");
const XMLHttpRequest = require("xhr2");
const perfHooks = require("perf_hooks");
const JSON5 = require("json5");
const pako = require("pako");

const ConnectionState = {
  0: "Connecting to master",
  1: "Connecting to peer",
  2: "Awaiting state",
  3: "Active",
  4: "Connection Failed",
};

const OperationType = {
  SetAvatar: 1,
  SendChat: 2,
  SendChatIndicator: 3,
  SendInput: 4,
  SetStadium: 5,
  StartGame: 6,
  StopGame: 7,
  PauseResumeGame: 8,
  SetScoreLimit: 9,
  SetTimeLimit: 10,
  SetTeamsLock: 11,
  SetPlayerTeam: 12,
  SetKickRateLimit: 13,
  SetTeamColors: 14,
  SetPlayerAdmin: 15,
  KickBanPlayer: 16,
  SetSync: 17
};

var crypto = new Crypto();

function HaxballEvent(type, fName, nameMapping, extraCondition){
  this.type = type;
  this.fName = fName;
  this.nameMapping = nameMapping;
  this.extraCondition = extraCondition;

  var that = this;
  this.getValue = function(x, y){
    return x[that.nameMapping[y]];
  }
  this.setValue = function(x, y, z){
    x[that.nameMapping[y]] = z;
  }
}

var allEventsCommon = { byPlayerId: "P" };

/*

CURRENTLY MISSING EVENTS:

Ua // ????
pb // ???? !!!NEVER USED!!! DELETE ? 
qb // ???? !!!NEVER USED!!! DELETE ? 

*/

var allEvents = [
  new HaxballEvent(OperationType.SetAvatar, "ra", {value: "zb", ...allEventsCommon}),
  new HaxballEvent(OperationType.SendChat, "Na", {text: "Tc", targetId: "_TP", ...allEventsCommon}), // targetId can not be modified
  new HaxballEvent(OperationType.SendChatIndicator, "na", {value: "sj", ...allEventsCommon}),
  new HaxballEvent(OperationType.SendAnnouncement, "rb", {msg: "Tc", color: "color", style: "style", sound: "fn", targetId: "_TP", ...allEventsCommon}), // targetId can not be modified
  new HaxballEvent(OperationType.SendInput, "Ga", {input: "input", ...allEventsCommon}),
  new HaxballEvent(OperationType.SetStadium, "qa", {stadium: "Pd", ...allEventsCommon}),
  new HaxballEvent(OperationType.StartGame, "Ma", {...allEventsCommon}),
  new HaxballEvent(OperationType.StopGame, "La", {...allEventsCommon}),
  new HaxballEvent(OperationType.PauseResumeGame, "Oa", {paused: "Bf", ...allEventsCommon}),
  new HaxballEvent(OperationType.SetScoreLimit, "da", {value: "newValue", ...allEventsCommon}, ["rj", 0]),
  new HaxballEvent(OperationType.SetTimeLimit, "da", {value: "newValue", ...allEventsCommon}, ["rj", 1]),
  new HaxballEvent(OperationType.SetTeamsLock, "pa", {value: "newValue", ...allEventsCommon}),
  new HaxballEvent(OperationType.AutoTeams, "Qa", {...allEventsCommon}),
  new HaxballEvent(OperationType.SetPlayerTeam, "S", {team: "jj", ...allEventsCommon}),
  new HaxballEvent(OperationType.SetKickRateLimit, "ma", {min: "min", rate: "nj", burst: "aj", ...allEventsCommon}),
  new HaxballEvent(OperationType.SetTeamColors, "Pa", {colors: "ea", ...allEventsCommon}),
  new HaxballEvent(OperationType.SetPlayerAdmin, "sa", {playerId: "Md", value: "Xg", ...allEventsCommon}),
  new HaxballEvent(OperationType.KickBanPlayer, "Y", {playerId: "V", reason: "fd", ban: "Og", ...allEventsCommon}),
  new HaxballEvent(OperationType.SetPlayerSync, "ta", {value: "Yg", ...allEventsCommon}),
  new HaxballEvent(OperationType.Ping, "la", {values: "we", ...allEventsCommon}),
  new HaxballEvent(OperationType.SetDiscProperties, "ob", {id: "ze", type: "Sm", data1: "Ka", data2: "Rc", ...allEventsCommon}), // type(0: disc -> id: discId, 1: player -> id: playerId), data1: [x, y, xspeed, yspeed, xgravity, ygravity, radius, bCoeff, invMass, damping], data2: [color, cMask, cGroup]
  //new HaxballEvent(OperationType.JoinRoom, "oa", {id: "V", name: "name", flag: "cj", avatar: "Xb", conn: "conn", auth: "auth", ...allEventsCommon}),

].reduce((acc, x)=>{
  if (acc[x.fName])
    acc[x.fName].push(x);
  else
    acc[x.fName] = [x];
  return acc;
}, {});

function recognizeEvent(obj){
  return allEvents[obj.__proto__.f.name]?.filter((x)=>(!x.extraCondition || obj[x.extraCondition[0]]==x.extraCondition[1]))[0];
}

function Haxball(options){
  EventEmitter.call(this);
  this.room = null;
  
  class ILocalStorage {
    constructor() {
      this.storage = {};
    }
    
    getItem(key) {
      return this.storage[key];
    };

    setItem(key, value) {
      //console.log(key, value)
      return this.storage[key] = value;
    };

    removeItem(key) {
      return delete this.storage[key];
    };
  }

  var window = {
    crypto: crypto,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    performance: perfHooks.performance,
    console: console,
    location: {
      origin: "https://www.haxball.com"
    },
    requestAnimationFrame: (callback) => setTimeout(callback, 0),
    cancelAnimationFrame: clearTimeout,
    localStorage: new ILocalStorage()
  };
  
  var haxball = this;

  if (options){
    for (const [key, value] of Object.entries(options))
      window.localStorage.setItem(key, value);
  }
  
  var internalData = {
    roomObj: null,
    extrapolatedRoomPhysicsObj: null,
    roomPhysicsObj: null,
    roomListGetterObj: null,
    roomJoinerObj: null,
    isHost: false,
    chatObj: null,
    discPropertiesObj: null,
    kickRateLimitObj: null,
    teamColorsObj: null,
    announcementObj: null,
    adminChangerObj: null,
    chatIndicatorObj: null,
    avatarChangerObj: null,
    createRoom: null,
    kickerObj: null,
    mapObj: null,
    parserObj: null,
    StadiumSyntaxError: null,
    StadiumCustomError: null,
    teams: null,
    generalStorageObj: null,
    ObjectConverter: null,
    authObj: null,
    dummyPromise: Promise.resolve(),
    keyState: 0,
    onOperationReceived: function(msg) {
      /*
      var op = {
        type: null,
        msg: msg
      };
      */
      var c = recognizeEvent(msg);
      if (!c)
        return true;
      
      /*
      var c = OperationConstants[msg.__proto__.f.name], oo = c?.filter((x)=>(x[1]==null) || msg[x[1][0]]==x[1][1])[0];
      if (!oo)
        return true;
      */
      /*
      //parse test:
      Object.assign(op, {
        type: oo[0],
        parsed: Object.keys(oo[2]).reduce((acc, e)=>{
          var t = oo[2][e], f = t[1];
          return Object.assign(acc, {
            [t[0]]: (f?f(msg[e]):msg[e])
          });
        }, {})
      });
      */

      return haxball.room._onOperationReceived(c/*oo[0]*/, msg);
    },
    execOperationReceivedOnHost: function(msg, targetId) {
      if (!internalData.isHost)
        return;
      msg.P = 0;
      msg._TP = targetId; // this can not be modified
      internalData.onOperationReceived(msg);
    }
  };

  this.getRoomList = function(){
    return internalData.roomListGetterObj.get();
  };

  this.setStorageValue = function(key, value){ // key must be one of ['show_indicators','player_name','fps_limit','player_auth_key','sound_chat','show_avatars','geo','geo_override','sound_crowd','sound_highlight','sound_main','extrapolation','avatar','resolution_scale','view_mode','player_keys','team_colors']
    internalData.generalStorageObj[Object.keys(internalData.generalStorageObj).filter((x)=>internalData.generalStorageObj[x].w==key)[0]]?.Xa(value);
  };

  this.createRoom = function(obj){ // name, password, maxPlayerCount, showInRoomList, token, geo, playerCount, unlimitPlayerCount, fakePassword, plugins
    return new Promise((resolve, reject)=>{
      if (haxball.room != null || !obj){
        reject();
        return;
      }
      var fLeaveRoom = function(){
        console.log("internal event: LeaveRoom");
        //haxball.off("roomLeave", fLeaveRoom);
        //haxball.off("createRoomSucceeded", fCreateRoomSucceeded);
        internalData.isHost = false;
        internalData.roomObj = null;
        internalData.roomPhysicsObj = null;
        internalData.extrapolatedRoomPhysicsObj = null;
        haxball.room = null;
      };
      var fCreateRoomSucceeded = function(){
        console.log("internal event: CreateRoomSucceeded");
        //haxball.off("roomLeave", fLeaveRoom);
        //haxball.off("createRoomSucceeded", fCreateRoomSucceeded);
        haxball.room = new Room(internalData, obj.plugins);
        haxball.room.kickTimeout = obj.kickTimeout || 20;
        haxball.room.hostPing = 0;
        haxball.emit("roomJoin", haxball.room);
        resolve(haxball.room);
      };
      haxball.once("roomLeave", fLeaveRoom);
      haxball.once("createRoomSucceeded", fCreateRoomSucceeded);
      //internalData.roomJoinerObj.xb(); // open room list screen
      internalData.createRoom({
        name: obj.name,
        password: (obj.password == "") ? null : obj.password,
        qs: obj.maxPlayerCount.toString(),
        Ks: !obj.showInRoomList,
        t: obj.token,
        geo: obj.geo,
        cpc: obj.playerCount,
        upc: obj.unlimitedPlayerCount,
        fPwd: obj.fakePassword
      });
    });
  }

  this.joinRoom = function(obj){
    return new Promise((resolve, reject)=>{
      if (haxball.room != null || !obj){
        reject();
        return;
      }
      var fLeaveRoom = function(){
        console.log("internal event: LeaveRoom");
        //haxball.off("roomLeave", fLeaveRoom);
        haxball.off("connectionStateChange", fConnectionStateChange);
        //haxball.off("joinRoomSucceeded", fJoinRoomSucceeded);
        obj.plugins && (obj.plugins.forEach((p)=>{
          p.finalize && p.finalize();
        }));
        internalData.isHost = false;
        internalData.roomObj = null;
        internalData.roomPhysicsObj = null;
        internalData.extrapolatedRoomPhysicsObj = null;
        haxball.room = null;
      };
      var fJoinRoomSucceeded = function(){
        console.log("internal event: JoinRoomSucceeded");
        //haxball.off("roomLeave", fLeaveRoom);
        haxball.off("connectionStateChange", fConnectionStateChange);
        //haxball.off("joinRoomSucceeded", fJoinRoomSucceeded);
        haxball.room = new Room(internalData, obj.plugins);
        haxball.room.kickTimeout = obj.kickTimeout || 20;
        haxball.emit("roomJoin", haxball.room);
        resolve(haxball.room);
      };
      var fConnectionStateChange = function(state){
        console.log("internal event: ConnectionStateChange");
        if (state==4){
          //haxball.off("roomLeave", fLeaveRoom);
          haxball.off("connectionStateChange", fConnectionStateChange);
          haxball.off("joinRoomSucceeded", fJoinRoomSucceeded);
          haxball.room = null;
          reject();
        }
      };
      haxball.once("roomLeave", fLeaveRoom);
      haxball.once("joinRoomSucceeded", fJoinRoomSucceeded);
      haxball.on("connectionStateChange", fConnectionStateChange);
      internalData.roomJoinerObj.Pf(obj.id, (obj.password == "") ? null : obj.password, obj.token);
    });
  };

  this.leaveRoom = function(){
    haxball.room && haxball.room.leave();
  };
  
  (function (qc) {
    function hc() {}
    function r() {}
    function q(a) {
      this.Ta = a;
      Error.captureStackTrace && Error.captureStackTrace(this, q);
    }
    internalData.StadiumSyntaxError = q;
    /*
    function Wa(a) {
      this.g = v.Ga(Wa.N);
      v.Ea(this.g).get("features").textContent = a.join(", ");
    }
    function Xa() {
      //this.nl = new Qb();
      this.g = v.Ga(Xa.N);
      var a = v.Ea(this.g);
      this.rg = a.get("ping");
      this.wp = a.get("max-ping");
      this.wo = a.get("fps");
      //v.xe(a.get("graph"), this.nl.g);
    }
    function P(a, b, c) {
      var d = this;
      this.g = v.Ga(P.N);
      var e = v.Ea(this.g);
      e.get("ok");
      e.get("cancel");
      this.Vd = e.get("content");
      for (
        var f = e.get("title"), e = e.get("buttons"), g = 0, k = 0;
        k < c.length;
  
      ) {
        var l = c[k++],
          t = window.document.createElement("button");
        t.textContent = l;
        t.onclick = (function (a) {
          return function () {
            y.i(d.Va, a[0]);
          };
        })([g++]);
        e.appendChild(t);
      }
      this.Vd.textContent = b;
      f.textContent = a;
    }
    function aa(a) {
      function b(a) {
        var b = window.document.createElement("div");
        b.className = "inputrow";
        var c = window.document.createElement("div");
        c.textContent = a;
        b.appendChild(c);
        for (var c = p.Eo(a), d = 0; d < c.length; ) {
          var e = [c[d]];
          ++d;
          var f = [window.document.createElement("div")],
            g = e[0];
          J.startsWith(e[0], "Key") && (g = D.substr(e[0], 3, null));
          f[0].textContent = g;
          b.appendChild(f[0]);
          g = window.document.createElement("i");
          g.className = "icon-cancel";
          g.onclick = (function (a, b) {
            return function () {
              p.Jq(b[0]);
              n.A.tg.Xa(p);
              a[0].remove();
            };
          })(f, e);
          f[0].appendChild(g);
        }
        c = window.document.createElement("i");
        c.className = "icon-plus";
        b.appendChild(c);
        c.onclick = function () {
          q.classList.toggle("show", !0);
          q.focus();
          q.onkeydown = function (b) {
            q.classList.toggle("show", !1);
            b.stopPropagation();
            b = b.code;
            null == p.L(b) && (p.Pa(b, a), n.A.tg.Xa(p), r());
          };
        };
        return b;
      }
      function c(a, b, c) {
        a = l.get(a);
        if (null == c) a.hidden = !0;
        else {
          a.innerHTML = b + ": <div class='flagico'></div> <span></span>";
          b = a.querySelector(".flagico");
          a = a.querySelector("span");
          try {
            b.classList.add("f-" + c.ub);
          } catch (vc) {}
          a.textContent = c.ub.toUpperCase();
        }
      }
      function d(a, b, c, d) {
        var e = l.get(a);
        e.selectedIndex = d(b.L());
        e.onchange = function () {
          var a = c(e.selectedIndex);
          b.Xa(a);
        };
      }
      function e(a, b, c) {
        function d(a) {
          e.classList.toggle("icon-ok", a);
          e.classList.toggle("icon-cancel", !a);
        }
        a = l.get(a);
        a.classList.add("toggle");
        var e = window.document.createElement("i");
        e.classList.add("icon-ok");
        a.insertBefore(e, a.firstChild);
        a.onclick = function () {
          var a = !b.L();
          b.Xa(a);
          d(a);
          null != c && c(a);
        };
        d(b.L());
      }
      function f(a) {
        var b = { Jm: l.get(a + "btn"), bh: l.get(a + "sec") };
        t.push(b);
        b.Jm.onclick = function () {
          g(b);
        };
      }
      function g(a) {
        for (var b = 0, c = 0; c < t.length; ) {
          var d = t[c];
          ++c;
          var e = d == a;
          e && (aa.$l = b);
          d.bh.classList.toggle("selected", e);
          d.Jm.classList.toggle("selected", e);
          ++b;
        }
      }
      null == a && (a = !1);
      var k = this;
      this.g = v.Ga(aa.N);
      var l = v.Ea(this.g);
      this.nd = l.get("close");
      var t = [];
      f("sound");
      f("video");
      f("misc");
      f("input");
      g(t[aa.$l]);
      e("tsound-main", n.A.pm, function (a) {
        //n.Na.im(a ? 1 : 0);
      });
      e("tsound-chat", n.A.Hi);
      e("tsound-highlight", n.A.om);
      e("tsound-crowd", n.A.nm);
      d(
        "viewmode",
        n.A.Tb,
        function (a) {
          return a - 1;
        },
        function (a) {
          return a + 1;
        }
      );
      d(
        "fps",
        n.A.Fh,
        function (a) {
          return a;
        },
        function (a) {
          return a;
        }
      );
      var h = [1, 0.75, 0.5, 0.25];
      d(
        "resscale",
        n.A.Sl,
        function (a) {
          return h[a];
        },
        function (a) {
          for (var b = 0, c = h.length - 1; b < c && !(h[b] <= a); ) ++b;
          return b;
        }
      );
      e("tvideo-teamcol", n.A.xm);
      e("tvideo-showindicators", n.A.Ak);
      e("tvideo-showavatars", n.A.lm);
      var m = null,
        m = function () {
          var b = n.A.Ne.L();
          c("loc", "Detected location", n.A.Me.L());
          c("loc-ovr", "Location override", b);
          var d = l.get("loc-ovr-btn");
          d.disabled = !a;
          null == b
            ? ((d.textContent = "Override location"),
              (d.onclick = function () {
                A.i(k.Ep);
              }))
            : ((d.textContent = "Remove override"),
              (d.onclick = function () {
                n.A.Ne.Xa(null);
                m();
              }));
        };
      m();
      var p = n.A.tg.L(),
        q = l.get("presskey"),
        r,
        u = l.get("inputsec");
      r = function () {
        v.Cf(u);
        var a = b("Up");
        u.appendChild(a);
        a = b("Down");
        u.appendChild(a);
        a = b("Left");
        u.appendChild(a);
        a = b("Right");
        u.appendChild(a);
        a = b("Kick");
        u.appendChild(a);
      };
      r();
      this.nd.onclick = function () {
        A.i(k.qb);
      };
    }
    function Ya(a) {
      this.fk = !1;
      this.qm = new za(p.Ia);
      this.Lj = new za(p.xa);
      this.Hl = new za(p.fa);
      var b = this;
      this.g = v.Ga(Ya.N);
      var c = v.Ea(this.g);
      this.jc = c.get("room-name");
      this.tm = c.get("start-btn");
      this.vm = c.get("stop-btn");
      this.gi = c.get("pause-btn");
      this.xn = c.get("auto-btn");
      this.Nk = c.get("lock-btn");
      this.Rl = c.get("reset-all-btn");
      this.Fl = c.get("rec-btn");
      var d = c.get("link-btn"),
        e = c.get("leave-btn"),
        f = c.get("rand-btn");
      this.wf = c.get("time-limit-sel");
      this.qf = c.get("score-limit-sel");
      this.rm = c.get("stadium-name");
      this.sm = c.get("stadium-pick");
      this.sm.onclick = function () {
        A.i(b.Xp);
      };
      this.Th(c.get("red-list"), this.Hl, p.fa, a);
      this.Th(c.get("blue-list"), this.Lj, p.xa, a);
      this.Th(c.get("spec-list"), this.qm, p.Ia, a);
      this.Uk(this.wf, this.Tk(15));
      this.Uk(this.qf, this.Tk(15));
      this.wf.onchange = function () {
        y.i(b.aq, b.wf.selectedIndex);
      };
      this.qf.onchange = function () {
        y.i(b.Tp, b.qf.selectedIndex);
      };
      this.tm.onclick = function () {
        A.i(b.Yp);
      };
      this.vm.onclick = function () {
        A.i(b.Zp);
      };
      this.gi.onclick = function () {
        A.i(b.Mp);
      };
      this.xn.onclick = function () {
        A.i(b.Dp);
      };
      this.Nk.onclick = function () {
        y.i(b.$p, !b.Xh);
      };
      this.Rl.onclick = function () {
        null != b.ee && (b.ee(p.xa), b.ee(p.fa));
      };
      this.Fl.onclick = function () {
        A.i(b.Qp);
      };
      d.onclick = function () {
        A.i(b.Wp);
      };
      e.onclick = function () {
        A.i(b.de);
      };
      f.onclick = function () {
        A.i(b.Pp);
      };
      this.Bj(!1);
      this.Cj(!1);
    }
    function Za() {
      var a = this;
      this.g = v.Ga(Za.N);
      var b = v.Ea(this.g);
      this.Cb = b.get("input");
      this.af = b.get("ok");
      b.get("cancel").onclick = function () {
        null != a.Va && a.Va(null);
      };
      this.Cb.maxLength = 30;
      this.Cb.oninput = function () {
        a.C();
      };
      this.Cb.onkeydown = function (b) {
        13 == b.keyCode && a.Dc() && null != a.Va && a.Va(a.Cb.value);
      };
      this.af.onclick = function () {
        a.Dc() && null != a.Va && a.Va(a.Cb.value);
      };
      this.C();
    }
    function $a(a) {
      this.Xk = a.get("notice");
      this.$n = a.get("notice-contents");
      this.nd = a.get("notice-close");
      this.Il();
    }
    function Aa(a) {
      function b(a) {
        function b() {
          e.className = f.Ta ? "icon-ok" : "icon-cancel";
        }
        a = d.get(a);
        var e = a.querySelector("i"),
          f = { Ta: !0 };
        b();
        a.onclick = function () {
          f.Ta = !f.Ta;
          b();
          c.bn(c.dj);
        };
        return f;
      }
      this.dj = [];
      var c = this;
      this.gs = a;
      this.Ja = v.Ga(Aa.tj);
      var d = v.Ea(this.Ja),
        e = new $a(d);
      this.pj = d.get("refresh");
      this.Tm = d.get("join");
      a = d.get("create");
      this.cs = d.get("count");
      a.onclick = function () {
        A.i(c.ws);
      };
      d.get("changenick").onclick = function () {
        A.i(c.vs);
      };
      d.get("settings").onclick = function () {
        A.i(c.ys);
      };
      var f = d.get("replayfile");
      f.onchange = function () {
        var a = f.files;
        if (!(1 > a.length)) {
          var a = a.item(0),
            b = new FileReader();
          b.onload = function () {
            y.i(c.xs, b.result);
          };
          b.readAsArrayBuffer(a);
        }
      };
      this.fs = b("fil-full");
      this.zs = b("fil-pass");
      this.ns = d.get("listscroll");
      this.Bs = Ba.cg(this.ns);
      this.gj = d.get("list");
      this.pj.onclick = function () {
        e.Il();
        c.Om();
      };
      this.Tm.onclick = function () {
        null != c.Od && y.i(c.Ym, c.Od.Fs);
      };
      this.Om();
    }
    function ab(a) {
      this.Ja = v.Ga(ab.tj, "tbody");
      var b = v.Ea(this.Ja),
        c = b.get("name"),
        d = b.get("players"),
        e = b.get("distance"),
        f = b.get("pass"),
        b = b.get("flag");
      this.Fs = a;
      var g = a.vd;
      c.textContent = g.w;
      d.textContent = "" + g.I + "/" + g.Xe;
      f.textContent = g.Ib ? "Yes" : "No";
      e.textContent = "" + (a.Le | 0) + "km";
      try {
        b.classList.add("f-" + g.ub.toLowerCase());
      } catch (k) {}
      9 > a.vd.Id && this.Ja.classList.add("old");
    }
    function bb() {
      this.gk = null;
      var a = this;
      this.g = v.Ga(bb.N);
      var b = v.Ea(this.g);
      this.Zf = b.get("link");
      var c = b.get("copy"),
        b = b.get("close");
      this.Zf.onfocus = function () {
        a.Zf.select();
      };
      c.onclick = function () {
        a.Zf.select();
        return window.document.execCommand("Copy");
      };
      b.onclick = function () {
        A.i(a.qb);
      };
    }
    function ha(a) {
      function b() {
        var b = g[f];
        a.pl = e ? b : 0;
        d.get("spd").textContent = b + "x";
      }
      this.Wf = !1;
      var c = this;
      this.g = v.Ga(ha.N);
      var d = v.Ea(this.g);
      this.ti = a;
      d.get("reset").onclick = function () {
        a.ui();
        c.el();
      };
      var e = !0,
        f = 2,
        g = [0.5, 0.75, 1, 2, 3];
      b();
      var k = d.get("playicon");
      k.classList.add("icon-pause");
      d.get("play").onclick = function () {
        e = !e;
        var a = k.classList;
        a.toggle("icon-play", !e);
        a.toggle("icon-pause", e);
        b();
      };
      d.get("spdup").onclick = function () {
        f += 1;
        var a = g.length - 1;
        f > a && (f = a);
        b();
      };
      d.get("spddn").onclick = function () {
        --f;
        0 > f && (f = 0);
        b();
      };
      this.Er = d.get("time");
      var l = d.get("timebar");
      this.Aq = d.get("progbar");
      for (var t = d.get("timetooltip"), h = 0, m = a.Vk; h < m.length; ) {
        var n = m[h];
        ++h;
        var p = window.document.createElement("div");
        p.className = "marker";
        p.classList.add("k" + n.kind);
        p.style.left = 100 * n.mj + "%";
        l.appendChild(p);
      }
      l.onclick = function (b) {
        a.er(((b.pageX - l.offsetLeft) / l.clientWidth) * a.mh * a.mf);
        c.Wf || ((c.Wf = !0), c.Vp(), c.el());
      };
      l.onmousemove = function (b) {
        b = (b.pageX - l.offsetLeft) / l.clientWidth;
        t.textContent = ha.Wk(a.mf * a.mh * b);
        return (t.style.left = "calc(" + 100 * b + "% - 30px)");
      };
      this.fp = d.get("leave");
      this.fp.onclick = function () {
        A.i(c.de);
      };
    }
    function Q(a) {
      var b = this,
        c = new P("Only humans", "", []);
      this.g = c.g;
      c.Vd.style.minHeight = "78px";
      Ja.gp().then(function (d) {
        null == Q.xg &&
          ((Q.xg = window.document.createElement("div")),
          c.Vd.appendChild(Q.xg),
          (Q.Dq = d.render(Q.xg, {
            sitekey: a,
            callback: function (a) {
              y.i(Q.Gl, a);
            },
            theme: "dark",
          })));
        d.reset(Q.Dq);
        Q.Gl = function (a) {
          window.setTimeout(function () {
            y.i(b.Va, a);
          }, 1e3);
          Q.Gl = null;
        };
        c.Vd.appendChild(Q.xg);
      });
    }
    function za(a) {
      this.xd = new Map();
      var b = this;
      this.g = v.Ga(za.N);
      this.g.className += " " + a.io;
      var c = v.Ea(this.g);
      this.ab = c.get("list");
      this.Vh = c.get("join-btn");
      this.vi = c.get("reset-btn");
      a == p.Ia && this.vi.remove();
      this.Vh.textContent = "" + a.w;
      this.g.ondragover = this.g.Qs = function (a) {
        -1 != a.dataTransfer.types.indexOf("player") && a.preventDefault();
      };
      this.g.ondrop = function (c) {
        c.preventDefault();
        c = c.dataTransfer.getData("player");
        null != c && ((c = K.parseInt(c)), null != c && ia.i(b.mg, c, a));
      };
      this.Vh.onclick = function () {
        y.i(b.Kp, a);
      };
      this.vi.onclick = function () {
        y.i(b.ee, a);
      };
    }
    function cb(a) {
      var b = this;
      this.w = a.w;
      this.yb = a.yb;
      this.$ = a.V;
      this.g = v.Ga(cb.N);
      var c = v.Ea(this.g);
      this.Ze = c.get("name");
      this.rg = c.get("ping");
      try {
        c.get("flag").classList.add("f-" + a.Kd);
      } catch (d) {}
      this.Ze.textContent = this.w;
      this.rg.textContent = "" + this.yb;
      this.g.ondragstart = function (a) {
        a.dataTransfer.setData("player", K.ye(b.$));
      };
      //this.g.oncontextmenu = function (a) {
        //a.preventDefault();
        //y.i(b.ff, b.$);
      //};
      this.em(a.cb);
    }
    function db(a, b) {
      var c = this;
      this.g = v.Ga(db.N);
      var d = v.Ea(this.g);
      this.Ze = d.get("name");
      this.Hf = d.get("admin");
      this.Qe = d.get("kick");
      this.nd = d.get("close");
      this.Hf.onclick = function () {
        ia.i(c.Cp, c.Nb, !c.ql);
      };
      this.Qe.onclick = function () {
        y.i(c.ei, c.Nb);
      };
      this.nd.onclick = function () {
        A.i(c.qb);
      };
      this.Nb = a.V;
      this.Ej(a.w);
      this.Dj(a.cb);
      this.Hf.disabled = !b || 0 == this.Nb;
      this.Qe.disabled = !b || 0 == this.Nb;
    }
    function Qb() {
      this.Ah = 0;
      this.vp = 400;
      this.yk = 64;
      this.Vi = 32;
      this.sa = window.document.createElement("canvas");
      this.Qf = window.document.createElement("canvas");
      this.g = window.document.createElement("div");
      this.Qf.width = this.sa.width = this.Vi;
      this.Qf.height = this.sa.height = this.yk;
      this.Eh = this.Qf.getContext("2d", null);
      this.c = this.sa.getContext("2d", null);
      this.c.fillStyle = "green";
      for (var a = [], b = 0, c = this.Vi; b < c; ) ++b, a.push(0);
      this.fq = a;
      this.g.appendChild(this.Qf);
      this.g.className = "graph";
    }
    function eb() {
      this.jb = null;
      var a = this;
      this.g = v.Ga(eb.N);
      var b = v.Ea(this.g);
      b.get("cancel").onclick = function () {
        A.i(a.ci);
      };
      this.hi = b.get("pick");
      this.bk = b.get("delete");
      this.rk = b.get("export");
      var c = b.get("list"),
        d = b.get("file");
      this.Lg();
      this.hi.onclick = function () {
        null != a.jb &&
          a.jb.Pd().then(function (b) {
            y.i(a.og, b);
          });
      };
      this.bk.onclick = function () {
        if (null != a.jb) {
          var b = a.jb.Lm;
          null != b && (a.jb.Ja.remove(), (a.jb = null), b(), a.Lg());
        }
      };
      this.rk.onclick = function () {
        null != a.jb &&
          a.jb.Pd().then(function (a) {
            Ca.br(a.se(), a.w + ".hbs");
          });
      };
      this.ki(c);
      this.vg = Ba.cg(c);
      window.setTimeout(function () {
        a.vg.update();
      }, 0);
      d.onchange = function () {
        var b = d.files;
        if (!(1 > b.length)) {
          var b = b.item(0),
            c = new FileReader();
          c.onload = function () {
            try {
              var b = new h();
              b.Lk(c.result);
              y.i(a.og, b);
            } catch (k) {
              (b = k instanceof q ? k.Ta : k),
                b instanceof SyntaxError
                  ? y.i(a.fi, "SyntaxError in line: " + K.ye(b.lineNumber))
                  : b instanceof Bb
                  ? y.i(a.fi, b.xp)
                  : y.i(a.fi, "Error loading stadium file.");
            }
          };
          c.readAsText(b);
        }
      };
    }
    function fb() {
      var a = this;
      this.g = v.Ga(fb.N);
      var b = v.Ea(this.g);
      b.get("cancel").onclick = function () {
        y.i(a.qb, !1);
      };
      b.get("leave").onclick = function () {
        y.i(a.qb, !0);
      };
    }
    function gb(a) {
      var b = this;
      this.g = v.Ga(gb.N);
      var c = v.Ea(this.g);
      this.Ze = c.get("title");
      this.oi = c.get("reason");
      this.yn = c.get("ban-btn");
      this.An = c.get("ban-text");
      this.Qe = c.get("kick");
      this.nd = c.get("close");
      this.yn.onclick = function () {
        b.Aj(!b.Jj);
      };
      this.nd.onclick = function () {
        A.i(b.qb);
      };
      this.Qe.onclick = function () {
        Cb.i(b.ei, b.Nb, b.oi.value, b.Jj);
      };
      this.oi.onkeydown = function (a) {
        return a.stopPropagation();
      };
      this.oi.maxLength = 100;
      this.Nb = a.V;
      this.Ze.textContent = "Kick " + a.w;
      this.Aj(!1);
    }
    */
    function ja(a) {
      /*
      this.Fb = new hb();
      this.Gd = !1;
      this.pe = new Xa();
      this.Qa = new Da();
      var b = this;
      this.Wa = new Ya(a);
      this.Fb.Nb = a;
      this.g = v.Ga(ja.N);
      a = v.Ea(this.g);
      this.Jh = a.get("gameplay-section");
      this.hf = a.get("popups");
      this.hf.style.display = "none";
      v.xe(a.get("chatbox"), this.Qa.g);
      v.xe(a.get("stats"), this.pe.g);
      this.bi = a.get("menu");
      this.bi.onclick = function () {
        b.me(!b.Gd);
        b.bi.blur();
      };
      a.get("settings").onclick = function () {
        var a = new aa();
        a.qb = function () {
          b.bb(null);
        };
        b.bb(a.g);
      };
      this.Jh.appendChild(this.Fb.g);
      this.Wa.de = function () {
        var a = new fb();
        a.qb = function (a) {
          b.bb(null);
          a && A.i(b.de);
        };
        b.bb(a.g);
      };
      this.Wa.Xp = function () {
        var a = new eb();
        a.ci = function () {
          b.bb(null);
        };
        a.og = function (a) {
          y.i(b.og, a);
          b.bb(null);
        };
        a.fi = function (a) {
          a = new P("Error loading stadium", a, ["Ok"]);
          a.Va = function () {
            b.bb(null);
          };
          b.bb(a.g);
        };
        b.bb(a.g);
      };
      */
    }
    /*
    function Rb() {
      this.Da = 0;
      this.hk = this.ik = !1;
      this.Ke = 0;
      this.g = window.document.createElement("div");
      this.g.className = "game-timer-view";
      this.g.appendChild((this.bq = this.Wd("OVERTIME!", "overtime")));
      this.g.appendChild((this.zp = this.Wd("0", "digit")));
      this.g.appendChild((this.yp = this.Wd("0", "digit")));
      this.g.appendChild(this.Wd(":", null));
      this.g.appendChild((this.dr = this.Wd("0", "digit")));
      this.g.appendChild((this.cr = this.Wd("0", "digit")));
    }
    function hb() {
      this.Nb = -1;
      //this.Eb = new N();
      //this.xc = new Rb();
      this.g = v.Ga(hb.N);
      var a = v.Ea(this.g);
      this.Pb = new Db(a.get("red-score"), 0);
      this.Kb = new Db(a.get("blue-score"), 0);
      //v.xe(a.get("timer"), this.xc.g);
      //v.xe(a.get("canvas"), this.Eb.sa);
    }
    function Ka(a, b) {
      var c = this;
      this.g = v.Ga(Ka.N);
      var d = v.Ea(this.g);
      this.Bp = d.get("ok");
      this.Bp.onclick = function () {
        A.i(c.Va);
      };
      this.Nl = d.get("replay");
      var e = null != b;
      this.Nl.hidden = !e;
      e &&
        (this.Nl.onclick = function () {
          ba.Yl(b);
        });
      d.get("reason").textContent = a;
    }
    function ib(a) {
      var b = this;
      this.g = v.Ga(ib.N);
      var c = v.Ea(this.g);
      this.vh = c.get("cancel");
      this.Wj = c.get("create");
      this.$e = c.get("name");
      this.kl = c.get("pass");
      this.ai = c.get("max-pl");
      this.Em = c.get("unlisted");
      this.$e.maxLength = 40;
      this.$e.value = a;
      this.$e.oninput = function () {
        b.C();
      };
      this.kl.maxLength = 30;
      this.Em.onclick = function () {
        b.Fj(!b.Fm);
      };
      this.vh.onclick = function () {
        A.i(b.ci);
      };
      this.Wj.onclick = function () {
        if (b.Dc()) {
          var a = b.kl.value;
          "" == a && (a = null);
          y.i(b.Jp, {
            name: b.$e.value,
            password: a,
            qs: b.ai.selectedIndex + 2,
            Ks: b.Fm,
          });
        }
      };
      for (a = 2; 21 > a; )
        (c = window.document.createElement("option")),
          (c.textContent = "" + a++),
          this.ai.appendChild(c);
      this.ai.selectedIndex = 10;
      this.Fj(!1);
      this.C();
    }
    */
    internalData.createRoom = /*this.Jp = */function (b) {
      var a = n.A.fe.L(); // inserted here to get current nick
      var cpc = b.cpc, fPwd = b.fPwd;
      function c() { // update & synchronize room data with haxball main server via websocket.
        if (!b.Ks) {
          var a = new Fb();
          a.Id = 9;
          a.w = g.jc;
          a.I = (cpc!=null) ? cpc : g.I.length;
          a.Xe = l.fg + 1;
          a.ub = f.ub;
          a.Ib = (fPwd==null) ? (null != l.Ib) : fPwd;
          a.Ec = f.Ec;
          a.Gc = f.Gc;
          var c = w.ha(16);
          a.ga(c);
          a = c.Kg();
          l.Fi(a);
        }
      }
      //x.La(new P("Creating room", "Connecting...", []).g);
      var e = null,
        f = null, // n.A.Lh(),
        g = new fa();
      function parseGeo(geo){
        var geoData = n.A.Lh();
        return T.Rf({
          lat: (geo && geo.lat) || geoData.Ec,
          lon: (geo && geo.lon) || geoData.Gc,
          code: (geo && geo.flag) ? geo.flag : geoData.ub,
        });
      }
      var f = parseGeo(b.geo);
      g.jc = b.name;
      var k = new ea();
      k.w = a;
      k.cb = !0;
      k.Kd = f.ub;
      k.Xb = n.A.sh.L();
      g.I.push(k);
      var l = new Lb({
        iceServers: n.Vf,
        ij: n.Ee + "api/host",
        state: g,
        version: 9,
        gn: b.t // token
      });
      l.upc = b.upc;
      l.fg = b.qs - 1;
      l.Ib = b.password;
      c();
      var t = new ba(l),
        h = !1;
      l.ef = function (a, b) {
        throw new q("Recaptcha not implemented yet.");
        /*
        u.kk(a, function (a) {
          b(a);
          x.La(t.j.g);
          return (h = !0);
        });
        */
      };
      var m = window.setInterval(function () {
        var a = la.la(l);
        l.ra(a);
        internalData.execOperationReceivedOnHost(a);
      }, 3e3);
      l.$k = function (a) {
        null != g.na(a) && ((a = Y.la(a, "Bad actor", !1)), l.ra(a), internalData.execOperationReceivedOnHost(a));
      };
      l.Hp = function (a, b, conn, auth) { // receive conn & auth data
        var d = b.ic();
        if (25 < d.length) throw new q("name too long");
        var e = b.ic();
        if (3 < e.length) throw new q("country too long");
        var f = b.zb();
        if (null != f && 2 < f.length) throw new q("avatar too long");
        var newPlayerData = haxball.room._modifyPlayerData(a, d, e, f, conn, auth);
        if (!newPlayerData)
          throw "Player join not allowed: " + d + " " + e + " " + f + " " + conn + " " + auth;
        [d, e, f] = newPlayerData;
        d = oa.la(a, d, e, f, conn, auth);
        l.ra(d);
        internalData.execOperationReceivedOnHost(d);
        c();
      };
      l.Ip = function (a) {
        null != g.na(a) && ((a = Y.la(a, null, !1)), l.ra(a), internalData.execOperationReceivedOnHost(a));
      };
      l.kg = function (a) {
        e = a;
        t.Bg = u.$h(a, null != l.Ib);
        //h || ((h = !0), x.La(t.j.g));
        haxball.room._onRoomLink(t.Bg);
      };
      t.Ih.Np = function (a, b, c, d) {
        l.to(a, b, c, d);
      };
      t.Ih.Op = function () {
        c();
      };
      t.j.de = function () {
        l.ia();
        t.ia();
        //u.xb();
        window.clearInterval(m);
        if (internalData.isHost)
          haxball.emit("roomLeave");
      };
      t.Of.Fg = function (a) {
        l.Ib = a;
        c();
        null != e && (t.Bg = u.$h(e, null != l.Ib));
        haxball.room._onRoomPropertiesChange({password: a});
      };
      t.Of.jm = function (a) {
        l.Ei(a);
      };
      t.Of.Ud = G(l, l.Ud);
      t.Of.__srp__ = function (a) {
        if (!a)
          return;
        var props = {};
        if (a.hasOwnProperty("name"))
          props.name = g.jc = a.name || "";
        if (a.hasOwnProperty("password"))
          props.password = l.Ib = a.password;
        if (a.hasOwnProperty("fakePassword"))
          props.fakePassword = fPwd = a.fakePassword;
        if (a.hasOwnProperty("geo")){
          props.geo = a.geo;
          f = parseGeo(a.geo);
          k.Kd = f.ub;
        }
        if (a.hasOwnProperty("playerCount"))
          props.playerCount = cpc = a.playerCount;
        if (a.hasOwnProperty("maxPlayerCount"))
          props.maxPlayerCount = l.fg = (a.maxPlayerCount==null) ? null : (a.maxPlayerCount - 1);
        c();
        if (a.hasOwnProperty("password"))
          null != e && (t.Bg = u.$h(e, null != l.Ib));
        haxball.room._onRoomPropertiesChange(props);
      };
      t.Of.__supc__ = function (a) {
        l.upc = a;
      };
      t.Of.__sfp__ = function (a) {
        fPwd = a;
        c();
      };
      
      internalData.isHost = true;
      internalData.roomObj = t;
      internalData.roomPhysicsObj = g;
      haxball.emit("createRoomSucceeded");
    };
    /*
    function jb() {
      this.g = v.Ga(jb.N);
      var a = v.Ea(this.g);
      this.dc = a.get("log");
      this.vh = a.get("cancel");
    }
    function kb(a) {
      function b() {
        c.Dc() && null != c.cl && c.cl(c.Cb.value);
      }
      var c = this;
      this.g = v.Ga(kb.N);
      var d = v.Ea(this.g);
      this.Cb = d.get("input");
      this.af = d.get("ok");
      this.Cb.maxLength = 25;
      this.Cb.value = a;
      this.Cb.oninput = function () {
        c.C();
      };
      this.Cb.onkeydown = function (a) {
        13 == a.keyCode && b();
      };
      setTimeout(() => {
        b();
      }, 1000);
      this.C();
    }
    function lb(a, b) {
      this.Hj = [];
      this.Iq = /[#@][^\s@#]*$/;
      this.Mb = a;
      this.Rp = b;
      a.hidden = !0;
    }
    function Da() {
      function a() {
        null != b.fl && "" != b.gb.value && b.fl(b.gb.value);
        b.gb.value = "";
        b.gb.blur();
      }
      var b = this;
      this.g = v.Ga(Da.N);
      var c = v.Ea(this.g);
      this.dc = c.get("log");
      this.vg = Ba.cg(this.dc);
      this.gb = c.get("input");
      this.gb.maxLength = 140;
      c.get("send").onclick = a;
      this.Bc = new lb(c.get("autocompletebox"), function (a, c) {
        b.gb.value = a;
        b.gb.setSelectionRange(c, c);
      });
      this.gb.onkeydown = function (c) {
        switch (c.keyCode) {
          case 9:
            b.Bc.Mb.hidden || (b.Bc.qo(), c.preventDefault());
            break;
          case 13:
            a();
            break;
          case 27:
            b.Bc.Mb.hidden ? ((b.gb.value = ""), b.gb.blur()) : b.Bc.Qh();
            break;
          case 38:
            b.Bc.Qj(-1);
            break;
          case 40:
            b.Bc.Qj(1);
        }
        c.stopPropagation();
      };
      this.gb.onfocus = function () {
        null != b.ig && b.ig(!0);
      };
      this.gb.onblur = function () {
        null != b.ig && b.ig(!1);
        b.Bc.Qh();
      };
      this.gb.oninput = function () {
        b.Bc.Hn(b.gb.value, b.gb.selectionStart);
      };
    }
    function mb() {
      this.rf = null;
      var a = this;
      this.g = v.Ga(mb.N);
      var b = v.Ea(this.g);
      b.get("cancel").onclick = function () {
        A.i(a.qb);
      };
      this.wh = b.get("change");
      this.wh.disabled = !0;
      this.wh.onclick = function () {
        null != a.rf && a.Zl(a.rf.index);
      };
      b = b.get("list");
      this.ki(b);
      var c = Ba.cg(b);
      window.setTimeout(function () {
        c.update();
      }, 0);
    }
    function Ea() {
      this.Xf = !1;
      this.w = "";
      this.uh = 0;
      this.Jf = "";
      this.kb = new ka();
      //var a = window.document.createElement("canvas");
      //a.width = 64;
      //a.height = 64;
      //this.rb = a.getContext("2d", null);
      //this.Ij = this.rb.createPattern(this.rb.canvas, "no-repeat");
      //this.fo();
    }
    function Sb() {
      this.xc = 0;
      this.ab = [];
      this.Ar = new R(["Time is", "Up!"], 16777215);
      this.Gq = new R(["Red is", "Victorious!"], 15035990);
      this.Fq = new R(["Red", "Scores!"], 15035990);
      this.Cn = new R(["Blue is", "Victorious!"], 625603);
      this.Bn = new R(["Blue", "Scores!"], 625603);
      this.eq = new R(["Game", "Paused"], 16777215);
    }
    function R(a, b) {
      for (var c = [], d = 0; d < a.length; ) c.push(this.sp(a[d++], b));
      this.We = c;
    }
    function N() {
      this.$c = window.performance.now();
      this.Jg = new Map();
      this.dd = new Map();
      this.zg = 1;
      this.xf = 35;
      this.jf = 0;
      this.kf = 1.5;
      this.Ya = new H(0, 0);
      this.Dk = !1;
      this.td = new Sb();
      this.sa = window.document.createElement("canvas");
      this.sa.mozOpaque = !0;
      this.c = this.sa.getContext("2d", { alpha: !1 });
      this.Lo = this.c.createPattern(n.Ko, null);
      this.Wn = this.c.createPattern(n.Vn, null);
      this.Un = this.c.createPattern(n.Tn, null);
    }
    */
    function B() {
      this.ud = 0;
      this.v = 32;
      this.h = 63;
      this.m = 1;
      this.a = new H(0, 0);
    }
    function E() {
      this.Hg = this.Ig = this.wa = null;
      this.Yj = 0;
      this.ca = this.W = this.Xd = null;
      this.Cc = 0;
      this.m = 1;
      this.h = 63;
      this.v = 32;
      this.vb = 1 / 0;
      this.Za = !0;
      this.R = 0;
    }
    function L() {
      this.v = 32;
      this.h = 63;
      this.m = 1;
      this.Ua = 0;
      this.wa = new H(0, 0);
    }
    function Fa() {
      this.hc = -1;
      this.gc = null;
      this.F = [];
    }
    function nb() {
      this.R = 0;
      this.ne = 1 / 0;
      this.Hb = this.ec = 100;
      this.Yd = this.Zd = 0;
    }
    function ca() {
      this.playerId = null; // playerId
      this.hc = -1;
      this.gc = null;
      this.jl = 0;
      this.h = this.v = 63;
      this.Mj = 0;
      this.R = 16777215;
      this.Ca = 0.99;
      this.aa = 1;
      this.m = 0.5;
      this.Z = 10;
      this.oa = new H(0, 0);
      this.D = new H(0, 0);
      this.a = new H(0, 0);
    }
    function la() {
      this.da = 0;
    }
    function La() {
      this.da = 0;
    }
    function Ma() {
      this.da = 0;
    }
    function ma() {
      this.da = 0;
    }
    function ob() {
      this.da = 0;
    }
    function pb() {
      this.da = 0;
    }
    function Y() {
      this.Qg = !1;
      this.da = 0;
    }
    function kc() {}
    function na() {
      this.da = 0;
    }
    function Ga() {
      this.da = 0;
    }
    function Na() {
      this.da = 0;
    }
    function Oa() {
      this.da = 0;
    }
    function qb() {
      this.da = 0;
    }
    function oa() {
      this.da = 0;
    }
    function pa() {
      this.da = 0;
    }
    function Pa() {
      this.da = 0;
    }
    function qa() {
      this.da = 0;
    }
    function S() {
      this.da = 0;
    }
    function ra() {
      this.da = 0;
    }
    function sa() {
      this.da = 0;
    }
    function da() {
      this.da = 0;
    }
    function Qa() {
      this.da = 0;
    }
    function rb() {
      this.da = 0;
    }
    function ta() {
      this.da = 0;
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
    }
    function fa() {
      this.hc = -1;
      this.S = this.gc = null;
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
    }
    function p(a, b, c, d, e, f, g, k) {
      this.pg = null;
      this.$ = a;
      this.R = b;
      this.Ch = c;
      this.cp = d;
      this.w = e;
      this.io = f;
      this.v = k;
      this.wm = new ka();
      this.wm.fb.push(b);
    }
    function ka() {
      this.ed = 16777215;
      this.fb = [];
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
    }
    internalData.ObjectConverter = h;
    function Bb(a) {
      this.xp = a;
    }
    internalData.StadiumCustomError = Bb;
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
    function sb() {
      this.qe = p.Ia;
      this.ca = new H(0, 0);
      this.W = new H(0, 0);
    }
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
    }
    function ua() {
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
    function Tb(a, b) {
      this.gh = null;
      this.Js = 0.025;
      this.ve = this.dh = this.Ef = 0;
      this.Tg = b.createGain();
      this.Tg.gain.value = 0;
      var c = b.createBufferSource();
      c.buffer = a;
      c.connect(this.Tg);
      c.loop = !0;
      c.start();
    }
    /*
    function Ub(a) {
      function b(b) {
        return new Promise(function (d, f) {
          var e = a.file(b).asArrayBuffer();
          c.c.decodeAudioData(e).then((mock) => {
            d(mock);
          });
          //return c.c.decodeAudioData(e, d, f);
        });
      }
      var c = this;
      this.c = new AudioContext();
      this.ag = this.c.createGain();
      this.im(n.A.pm.L() ? 1 : 0);
      this.ag.connect(this.c.destination);
      this.ro = Promise.all([
        b("sounds/chat.ogg").then(function (a) {
          return (c.Rj = a);
        }),
        b("sounds/highlight.wav").then(function (a) {
          return (c.zk = a);
        }),
        b("sounds/kick.ogg").then(function (a) {
          return (c.bp = a);
        }),
        b("sounds/goal.ogg").then(function (a) {
          return (c.Io = a);
        }),
        b("sounds/join.ogg").then(function (a) {
          return (c.$o = a);
        }),
        b("sounds/leave.ogg").then(function (a) {
          return (c.ep = a);
        }),
        b("sounds/crowd.ogg").then(function (a) {
          c.ho = a;
          c.Xj = new Tb(c.ho, c.c);
          c.Xj.connect(c.ag);
        }),
      ]).catch(console.log);
    }
    */
    function Z() {}
    function va() {}
    internalData.roomListGetterObj = va;
    function Fb() {}
    /*
    function Vb(a) {
      this.$c = window.performance.now();
      //this.sd = 0;
      this.De = 0;
      var b = this;
      this.ya = a;
      this.j = new ja(a.uc);
      var c = new Gb(this.j);
      c.ri(a.T);
      window.document.addEventListener("keydown", G(this, this.Bd));
      window.document.addEventListener("keyup", G(this, this.Cd));
      window.requestAnimationFrame(G(this, this.bf));

      this.Gh = window.setInterval(function () {
        b.j.pe.hm(b.sd);
        b.sd = 0;
      }, 1e3);

      this.uf(n.A.Tb.L());
      this.j.g.classList.add("replayer");
      this.je = new ha(a);
      this.je.Vp = function () {
        c.Lr(a.T);
      };
      this.je.Up = function () {
        b.j.me(null == a.T.K);
        c.ri(a.T);
      };
      this.je.el = function () {
        b.j.Fb.Eb.Xq();
      };
      this.j.g.appendChild(this.je.g);
    }
    */
    function x() {}
    function u() {}
    internalData.roomJoinerObj = u;
    function Wb() {}
    function n() {}
    function W() {
      this.Yc = new Map();
    }
    function wa(a, b, c, d) {
      this.w = a;
      this.Ur = d;
      this.Yh = b;
      d = null;
      null != b && (d = b.getItem(a));
      this.Hm = c(d);
    }
    function Xb() {}
    function Yb() {
      function a(a) {
        return new wa(
          a,
          e,
          function (a) {
            if (null == a) return null;
            try {
              return T.Hh(a);
            } catch (k) {
              return null;
            }
          },
          function (a) {
            if (null == a) return null;
            try {
              return a.se();
            } catch (k) {
              return null;
            }
          }
        );
      }
      function b(a) {
        return new wa(
          a,
          e,
          function (a) {
            return null != a ? "0" != a : !0;
          },
          function (a) {
            return a ? "1" : "0";
          }
        );
      }
      function c(a, b) {
        return new wa(
          a,
          e,
          function (a) {
            var c = b;
            try {
              null != a && (c = K.parseInt(a));
            } catch (t) {}
            return c;
          },
          function (a) {
            return "" + a;
          }
        );
      }
      function d(a, b, c) {
        return new wa(
          a,
          e,
          function (a) {
            return null == a ? b : U.Qc(a, c);
          },
          function (a) {
            return a;
          }
        );
      }
      var e = Xb.Pm();
      this.fe = d("player_name", "", 25);
      this.Tb = c("view_mode", -1);
      this.Fh = c("fps_limit", 0);
      this.sh = d("avatar", null, 2);
      d("rctoken", null, 1024);
      this.xm = b("team_colors");
      this.Ak = b("show_indicators");
      this.pm = b("sound_main");
      this.Hi = b("sound_chat");
      this.om = b("sound_highlight");
      this.nm = b("sound_crowd");
      this.Gj = d("player_auth_key", null, 1024);
      this.rd = c("extrapolation", 0);
      this.Sl = (function (a, b) {
        return new wa(
          a,
          e,
          function (a) {
            var c = b;
            try {
              null != a && (c = parseFloat(a));
            } catch (t) {}
            return c;
          },
          function (a) {
            return "" + a;
          }
        );
      })("resolution_scale", 1);
      this.lm = b("show_avatars");
      this.Me = a("geo");
      this.Ne = a("geo_override");
      this.tg = (function () {
        return new wa(
          "player_keys",
          e,
          function (a) {
            if (null == a) return W.$j();
            try {
              return W.Hh(a);
            } catch (g) {
              return W.$j();
            }
          },
          function (a) {
            try {
              return a.se();
            } catch (g) {
              return null;
            }
          }
        );
      })();
    }
    function T() {
      this.ub = "";
      this.Ec = this.Gc = 0;
    }
    function Ra() {
      this.$d = this.Yf = 0;
      //window.document.addEventListener("focusout", G(this, this.al));
    }
    function Gb(a, b) {
      this.Rh = null;
      this.j = a;
      null != b && (this.Rh = "@" + J.replace(b, " ", "_"));
    }
    function ba(a) {
      this.Nf = null;
      this.Ik = this.zh = !1;
      this.$c = window.performance.now();
      this.Ed = null;
      this.De = 0;
      this.Jn = new tb(3, 1e3);
      this.ob = new Ra();
      this.Bg = "Waiting for link";
      this.xi = this.am = !1;
      //this.sd = 0;
      var b = this;
      this.Of = new ub(a, function (a) {
        //b.j.Qa.Gb(a);
      });
      this.ya = a;
      a.T.ko = function (c) {
        b.am != c && ((b.am = c), (c = ta.la(c)), a.ra(c), internalData.execOperationReceivedOnHost(c));
      };
      this.j = new ja(a.uc);
      this.Ih = new Gb(this.j, a.T.na(a.uc).w);
      this.Ih.ri(a.T);
      /*
      this.j.Qa.fl = G(this, this.Gp);
      this.j.Qa.ig = G(this, this.Fp);
      window.document.addEventListener("keydown", G(this, this.Bd));
      window.document.addEventListener("keyup", G(this, this.Cd));
      window.onbeforeunload = function () {
        return "Are you sure you want to leave the room?";
      };
      this.ob.ng = function (b) {
        a.ra(b);
        internalData.execOperationReceivedOnHost(b);
      };
      this.j.Wa.aq = function (b) {
        b = da.la(1, b);
        a.ra(b);
        internalData.execOperationReceivedOnHost(b);
      };
      this.j.Wa.Tp = function (b) {
        b = da.la(0, b);
        a.ra(b);
        internalData.execOperationReceivedOnHost(b);
      };
      this.j.og = function (b) {
        b = qa.la(b);
        a.ra(b);
        internalData.execOperationReceivedOnHost(b);
      };
      this.j.Wa.Yp = function () {
        var msg = new Ma();
        a.ra(msg);
        internalData.execOperationReceivedOnHost(msg);
      };
      this.j.Wa.Zp = function () {
        var msg = new La();
        a.ra(msg);
        internalData.execOperationReceivedOnHost(msg);
      };
      this.j.Wa.Mp = function () {
        b.Bm();
      };
      this.j.Wa.mg = function (b, c) {
        var d = S.la(b, c);
        a.ra(d);
        internalData.execOperationReceivedOnHost(d);
      };
      this.j.Wa.ee = this.Wq.bind(this); // G(this, this.Wq);
      this.j.Wa.Dp = function () {
        var msg = new Qa();
        a.ra(msg);
        internalData.execOperationReceivedOnHost(msg);
      };
      this.j.Wa.Pp = function () {
        ba.Bq(a);
      };
      this.j.Wa.$p = function (b) {
        b = pa.la(b);
        a.ra(b);
        internalData.execOperationReceivedOnHost(b);
      };
      this.j.Wa.ff = function (c) {
        var d = a.T.na(c);
        if (null != d) {
          var e = new db(d, b.xi);
          e.qb = function () {
            b.j.bb(null);
          };
          e.Cp = function (b, c) {
            var d = sa.la(b, c);
            a.ra(d);
          };
          e.ei = function () {
            b.vr(d);
          };
          b.j.bb(e.g, function () {
            e.C(a.T, b.xi);
          });
        }
      };
      this.j.Wa.Wp = function () {
        var a = new bb();
        a.qb = function () {
          b.j.bb(null);
        };
        b.j.bb(a.g, function () {
          a.nr(b.Bg);
        });
      };
      this.j.Wa.Qp = function () {
        if (null == b.Ed) b.zr();
        else {
          var a = b.Ed.stop();
          b.Ed = null;
          ba.Yl(a);
        }
        b.j.Wa.rr(null != b.Ed);
      };
      this.j.Wa._Qp_ = function (start) {
        if (start){
          if (null != b.Ed)
            return false;
          b.zr();
          return true;
        }
        else {
          if (null == b.Ed)
            return null;
          var a = b.Ed.stop();
          b.Ed = null;
          return a;
        }
      };
      */
      this.ob.ng = function (b) {
        a.ra(b);
        internalData.execOperationReceivedOnHost(b);
      };
      this.j.aq = function (b) {
        b = da.la(1, b);
        a.ra(b);
        internalData.execOperationReceivedOnHost(b);
      };
      this.j.Tp = function (b) {
        b = da.la(0, b);
        a.ra(b);
        internalData.execOperationReceivedOnHost(b);
      };
      this.j.og = function (b) {
        b = qa.la(b);
        a.ra(b);
        internalData.execOperationReceivedOnHost(b);
      };
      this.j.Yp = function () {
        var msg = new Ma();
        a.ra(msg);
        internalData.execOperationReceivedOnHost(msg);
      };
      this.j.Zp = function () {
        var msg = new La();
        a.ra(msg);
        internalData.execOperationReceivedOnHost(msg);
      };
      this.j.Mp = function () {
        b.Bm();
      };
      this.j.mg = function (b, c) {
        var d = S.la(b, c);
        a.ra(d);
        internalData.execOperationReceivedOnHost(d);
      };
      this.j.ee = this.Wq.bind(this); // G(this, this.Wq);
      this.j.Dp = function () {
        var msg = new Qa();
        a.ra(msg);
        internalData.execOperationReceivedOnHost(msg);
      };
      this.j.Pp = function () {
        ba.Bq(a);
      };
      this.j.$p = function (b) {
        b = pa.la(b);
        a.ra(b);
        internalData.execOperationReceivedOnHost(b);
      };
      this.j._Qp_ = function (start) {
        if (start){
          if (null != b.Ed)
            return false;
          b.zr();
          return true;
        }
        else {
          if (null == b.Ed)
            return null;
          var a = b.Ed.stop();
          b.Ed = null;
          return a;
        }
      };
      window.requestAnimationFrame(G(this, this.bf));
      /*
      this.Gh = window.setInterval(function () {
        b.j.pe.hm(b.sd);
        b.sd = 0;
      }, 1e3);
      */
      this.Qr = window.setInterval(function () {
        a.C();
      }, 50);
      //this.uf();
      var c = n.A.rd.L(),
        c = -200 > c ? -200 : 200 < c ? 200 : c;
      if (0 != c) {
        var d = n.A.rd.L();
        a.gm(d);
        //this.j.Qa.Gb("Extrapolation set to " + c + " msec");
      }
    }
    function Ha() {}
    function ub(a, b) {
      this.ya = a;
      this.ba = b;
    }
    //function Hb() {}
    function tb(a, b) {
      this.Nj = a;
      this.Si = b;
      this.oc = a;
      this.Ve = window.performance.now();
    }
    function vb() {}
    function Cb() {}
    function ia() {}
    function y() {}
    function A() {}
    function M() {}
    function H(a, b) {
      this.x = a;
      this.y = b;
    }
    function Ib(a) {
      this.Yb = a.slice();
    }
    /*
    function Jb(a, b, c) {
      this.Vk = [];
      this.pl = 5;
      this.Fd = -1;
      this.hg = this.Qb = this.Wh = this.sk = 0;
      V.call(this, b);
      a = new F(new DataView(a.buffer), !1);
      if (1212305970 != a.hb()) throw new q("");
      b = a.hb();
      if (c != b) throw new q(new Kb(b));
      this.mf = a.hb();
      c = pako.inflateRaw(a.sb());
      this.Lc = new F(new DataView(c.buffer, c.byteOffset, c.byteLength));
      this.Cq(this.Lc);
      c = this.Lc.sb();
      this.Lc = new F(new DataView(c.buffer, c.byteOffset, c.byteLength), !1);
      this.ui();
      this.Wh = window.performance.now();
      this.uc = -1;
    }
    */
    function Kb(a) {
      this.Id = a;
    }
    function Zb() {}
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
    function Lb(a) {
      this.Kj = new Map();
      this.Ib = null;
      this.fg = 32;
      this.Ie = new Map();
      this.ac = [];
      this.wi = 4;
      this.Mn = 600;
      var b = this;
      V.call(this, a.state);
      this.tp = a.ij;
      this.Sr = a.version;
      this.up = 1;
      this.Jk = this.uc = 0;
      this.upc = false;
      this.Li = window.performance.now();
      this.Ic = new Sa(this.tp, a.iceServers, Zb.Km, a.gn);
      this.Ic.Vj = G(this, this.Oo);
      this.Ic.bl = function (a) {
        b.Lp(a);
      };
      this.Ic.kg = function (a) {
        y.i(b.kg, a);
      };
      this.Ic.ef = function (a, d) {
        null != b.ef && b.ef(a, d);
      };
    }
    function xa(a, b) {
      this.Di = [];
      this.pi = [];
      this.ug = new Ia();
      this.Ap = 1;
      this.pd = this.zm = 0;
      this.Qi = new Mb(50);
      this.sg = new Mb(50);
      this.nn = 1e3;
      this.ek = "";
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
          c.pc = new wb(b.ij, b.iceServers, a, Zb.Km, f, b.gn);
          c.pc.rh = e;
          c.pc.zd = function (a) {
            c.pc = null;
            c.pa = a;
            a.lg = function (a) {
              a = new F(new DataView(a));
              c.uq(a);
            };
            a.cf = function () {
              3 != c.pd && y.i(c.df, xb.ih("Connection closed"));
              c.ia();
            };
            a = window.setTimeout(function () {
              y.i(c.df, xb.ih("Game state timeout"));
              c.ia();
            }, 1e4);
            c.re = a;
            c.tf(2);
          };
          c.pc.gl = function () {
            c.tf(1);
          };
          var g = !1;
          c.pc.Zk = function () {
            return (g = !0);
          };
          c.pc.bd = function (a) {
            if (!e && 1 == c.pd && g) A.i(c.Sp), d(!0);
            else {
              var b = wb.Do(a);
              switch (a.nb) {
                case 0:
                  a = xb.jh;
                  break;
                case 1:
                  a = xb.lh(a.code);
                  break;
                case 2:
                  a = xb.hh;
                  break;
                default:
                  a = xb.ih(b);
              }
              y.i(c.df, a);
              c.ia(b);
            }
          };
        };
      d(null != b.cn && b.cn);
    }
    function V(a) {
      this.Ri = new Ia();
      this.te = this.cc = 0;
      this.le = new Ia();
      this.uc = this.bc = this.rd = 0;
      this.Ac = 0.06;
      this.mh = 16.666666666666668;
      this.Ff = 120;
      yb.call(this, a);
    }
    function ya() {}
    function Ta() {}
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
    function bc() {}
    function Mb(a) {
      this.rs = a;
      this.$a = [];
    }
    function cc() {}
    function Ua() {
      this.da = 0;
    }
    function yb(a) {
      this.Y = 0;
      this.T = a;
    }
    function Ia() {
      this.list = [];
    }
    function m() {
      this.da = 0;
    }
    function lc() {}
    function zb() {}
    function v() {}
    /*
    function Db(a, b) {
      this.Ja = a;
      this.value = b;
      a.textContent = "" + b;
    }
    function Ca() {}
    */
    function mc() {}
    function Ba() {}
    //function Ja() {}
    function I() {}
    function w(a, b) {
      null == b && (b = !1);
      this.o = a;
      this.Sa = b;
      this.a = 0;
    }
    function F(a, b) {
      null == b && (b = !1);
      this.o = a;
      this.Sa = b;
      this.a = 0;
    }
    function Nb(a) {
      this.gd = null;
      this.Eq = 1e4;
      this.wd = !0;
      var b = this;
      a.Tj();
      this.Ra = a.Ra;
      this.Vc = a.Vc;
      this.oe = a.oe;
      this.gd = a.gd;
      this.ym = window.performance.now();
      var c = null,
        c = function () {
          var a = b.Eq - b.Br();
          0 >= a
            ? b.ia()
            : (window.clearTimeout(b.Am),
              (a = window.setTimeout(c, a + 1e3)),
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
            ((b.ym = window.performance.now()), null != b.lg && b.lg(a.data));
        };
        e.onclose = function () {
          b.ia();
        };
      }
    }
    function nc() {}
    function Sa(a, b, c, d) {
      this.th = new Set();
      this.If = new Set();
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
    function wb(a, b, c, d, e, f) {
      this.rh = this.yh = !1;
      var g = this;
      this.pa = new Va(0, b, d);
      this.pa.bd = function () {
        g.Oe(Ob.jh);
      };
      this.pa.zd = function () {
        null != g.zd && g.zd(new Nb(g.pa));
        g.pa = null;
        g.Uj();
      };
      this.pa.di = function (b) {
        g.jr = b;
        g.X = new WebSocket(a + "client?id=" + c + (null == f ? "" : "&token=" + f),{
          headers: {
            Origin: "https://www.haxball.com",
          }
        });
        g.X.binaryType = "arraybuffer";
        g.X.onclose = function (a) {
          g.yh || g.Oe(Ob.lh(a.code));
        };
        g.X.onerror = function () {
          g.yh || g.Oe(Ob.Error);
        };
        g.X.onmessage = G(g, g.Ph);
        g.X.onopen = function () {
          null != g.gl && g.gl();
          g.pa.Mi();
          g.Bi(g.jr, g.pa.Uf, e);
          g.pa.jg = G(g, g.yi);
          g.pa.Sh.then(function () {
            g.Nc(0, null);
          });
        };
      };
      this.pa.eo();
    }
    function dc() {
      this.hash = 0;
    }
    function U() {}
    function J() {}
    function K() {}
    function ec() {}
    function D() {}
    /*
    function fc(a, b) {
      this.r = new RegExp(a, b.split("u").join(""));
    }
    */
    function ga() {
      return r.Be(this, "");
    }
    function C(a, b) {
      var c = Object.create(a),
        d;
      for (d in b) c[d] = b[d];
      b.toString !== Object.prototype.toString && (c.toString = b.toString);
      return c;
    }
    function G(a, b) {
      if (null == b) return null;
      null == b.oh && (b.oh = rc++);
      var c;
      null == a.ej ? (a.ej = {}) : (c = a.ej[b.oh]);
      null == c && ((c = b.bind(a)), (a.ej[b.oh] = c));
      return c;
    }
    var Ab = Ab || {},
      X;
    /*
    fc.b = !0;
    fc.prototype = {
      match: function (a) {
        this.r.global && (this.r.lastIndex = 0);
        this.r.nc = this.r.exec(a);
        this.r.bh = a;
        return null != this.r.nc;
      },
      Wm: function (a) {
        if (null != this.r.nc && 0 <= a && a < this.r.nc.length)
          return this.r.nc[a];
        throw new q("EReg::matched");
      },
      ps: function () {
        if (null == this.r.nc) throw new q("No string matched");
        return { mj: this.r.nc.index, ms: this.r.nc[0].length };
      },
      os: function (a, b, c) {
        null == c && (c = -1);
        if (this.r.global) {
          this.r.lastIndex = b;
          this.r.nc = this.r.exec(0 > c ? a : D.substr(a, 0, b + c));
          if ((b = null != this.r.nc)) this.r.bh = a;
          return b;
        }
        if ((c = this.match(0 > c ? D.substr(a, b, null) : D.substr(a, b, c))))
          (this.r.bh = a), (this.r.nc.index += b);
        return c;
      },
      f: fc,
    };
    */
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
    Math.b = !0;
    ec.b = !0;
    ec.Mm = function (a) {
      var b = [];
      if (null != a) {
        var c = Object.prototype.hasOwnProperty,
          d;
        for (d in a)
          "__id__" != d && "hx__closures__" != d && c.call(a, d) && b.push(d);
      }
      return b;
    };
    K.b = !0;
    K.ye = function (a) {
      return r.Be(a, "");
    };
    K.parseInt = function (a) {
      a = parseInt(
        a,
        !a || "0" != a[0] || ("x" != a[1] && "X" != a[1]) ? 10 : 16
      );
      return isNaN(a) ? null : a;
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
    J.Af = function (a) {
      var b,
        c = "";
      for (b = 2 - a.length; c.length < b; ) c += "0";
      return c + (null == a ? "null" : "" + a);
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
    U.b = !0;
    U.Qc = function (a, b) {
      return a.length <= b ? a : D.substr(a, 0, b);
    };
    U.Zr = function (a) { // calculating hash for conn
      for (var b = "", c = 0, d = a.byteLength; c < d; ) b += J.Vg(a[c++], 2);
      return b;
    };
    dc.b = !0;
    dc.prototype = {
      Yr: function (a) {
        for (var b = 0, c = a.length; b < c; )
          (this.hash += a[b++]),
            (this.hash += this.hash << 10),
            (this.hash ^= this.hash >>> 6);
      },
      f: dc,
    };
    var Ob = (Ab["bas.basnet.FailReason"] = {
      Gf: !0,
      nh: ["PeerFailed", "Rejected", "Cancelled", "Error"],
      jh: { nb: 0, eb: "bas.basnet.FailReason", toString: ga },
      lh:
        ((X = function (a) {
          return { nb: 1, code: a, eb: "bas.basnet.FailReason", toString: ga };
        }),
        (X.Ae = ["code"]),
        X),
      hh: { nb: 2, eb: "bas.basnet.FailReason", toString: ga },
      Error: { nb: 3, eb: "bas.basnet.FailReason", toString: ga },
    });
    wb.b = !0;
    wb.Do = function (a) {
      switch (a.nb) {
        case 0:
          return "Failed";
        case 1:
          return pc.description(a.code);
        case 2:
          return "";
        case 3:
          return "Master connection error";
      }
    };
    wb.prototype = {
      Gn: function () {
        this.Oe(Ob.hh);
      },
      Uj: function () {
        null != this.X &&
          ((this.X.onclose = null),
          (this.X.onmessage = null),
          (this.X.onerror = null),
          (this.X.onopen = null),
          this.X.close(),
          (this.X = null));
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
            c.Oe(Ob.Error);
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
    Va.b = !0;
    Va.prototype = {
      Mi: function (a) {
        null == a && (a = 1e4);
        window.clearTimeout(this.re);
        this.re = window.setTimeout(G(this, this.To), a);
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
            return lc.Dr(d.Sh, c).then(e, e);
          })
          .then(function (a) {
            d.di(a);
          })
          ["catch"](function () {
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
        window.setTimeout(function () {
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
        window.clearTimeout(this.re);
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
    var gc = (Ab["bas.basnet.ConnectionRequestResponse"] = {
      Gf: !0,
      nh: ["Accept", "Reject"],
      hn: { nb: 0, eb: "bas.basnet.ConnectionRequestResponse", toString: ga },
      kh:
        ((X = function (a) {
          return {
            nb: 1,
            reason: a,
            eb: "bas.basnet.ConnectionRequestResponse",
            toString: ga,
          };
        }),
        (X.Ae = ["reason"]),
        X),
    });
    Sa.b = !0;
    Sa.vk = function (a) {
      try {
        var b = nc.gf(a.candidate);
        if ("srflx" == b.Jr) return b.Xo;
      } catch (c) {}
      return null;
    };
    Sa.prototype = {
      ia: function () {
        window.clearTimeout(this.Ul);
        window.clearTimeout(this.ke);
        this.ke = null;
        window.clearInterval(this.ol);
        this.X.onmessage = null;
        this.X.onerror = null;
        this.X.onclose = null;
        this.X.onopen = null;
        this.X.close();
        this.X = null;
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
            (this.ke = window.setTimeout(function () {
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
        null == this.Ql && (b(), (this.Ql = window.setTimeout(b, 1e3)));
      },
      Ji: function (a) {
        function b(a) {
          a = a.sitekey;
          if (null == a) throw new q(null);
          null != d.ef &&
            d.ef(a, function (a) {
              d.Ji(a);
            });
        }
        function c(a) {
          var b = a.url;
          if (null == b) throw new q(null);
          a = a.token;
          if (null == a) throw new q(null);
          d.X = new WebSocket(b + "?token=" + a, {
            headers: {
              Origin: "https://www.haxball.com",
            }
          });
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
          d.X.onmessage = G(d, d.Ph);
        }
        null == a && (a = "");
        var d = this;
        M.zl(this.xr, "token=" + this.Dg + "&rcr=" + a, M.vj)
          .then(function (a) {
            switch (a.action) {
              case "connect":
                c(a);
                break;
              case "recaptcha":
                b(a);
            }
          })
          ["catch"](function () {
            d.Mh(!0);
          });
      },
      So: function () {
        var a = this;
        null != this.Mc && this.Ai();
        0 != this.nf && this.cm();
        this.ol = window.setInterval(function () {
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
        }
      },
      Oh: function (a) {
        var b = a.hb(),
          c = U.Zr(a.sb(a.B())),
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
        else if (this.th.has(b)) this.sf(a, 4102);
        else {
          for (var k = [], l = 0; l < d.length; ) {
            var t = Sa.vk(d[l++]);
            if (null != t) {
              if (this.If.has(t)) {
                this.sf(a, 4102);
                return;
              }
              k.push(t);
            }
          }
          if (
            null != this.Vj &&
            ((l = new F(e.o)), (l.a = e.a), (e = this.Vj(b, l)), 1 == e.nb)
          ) {
            this.sf(a, e.reason);
            return;
          }
          var h = new Va(a, this.Vf, this.In);
          f && (h.ak = 2500);
          h.oe = k;
          h.gd = b;
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
          if (null != d && (c.oe.push(d), this.If.has(d))) return;
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
        a.l(9);
        a.l(this.nf ? 1 : 0);
        this.X.send(a.Hd());
        this.dm = this.nf;
        haxball.room._onRoomRecaptchaModeChange(this.nf);
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
        window.clearTimeout(this.ke);
        this.ke = null;
        this.Ag = !1;
        window.clearInterval(this.ol);
        window.clearTimeout(this.Ul);
        a &&
          (this.Ul = window.setTimeout(function () {
            b.Ji();
          }, (this.Zq + Math.random() * this.$q) | 0));
      },
      zn: function (a) {
        for (var b = 0, c = a.oe; b < c.length; ) this.If.add(c[b++]);
        null != a.gd && this.th.add(a.gd);
        return { Rs: a.oe, Ps: a.gd };
      },
      Ud: function () {
        this.If.clear();
        this.th.clear();
      },
      f: Sa,
    };
    nc.b = !0;
    nc.gf = function (a) {
      a = a.split(" ");
      if ("typ" != a[6]) throw new q(null);
      return { Jr: a[7], Xo: a[4] };
    };
    Nb.b = !0;
    Nb.prototype = {
      Br: function () {
        return window.performance.now() - this.ym;
      },
      Rb: function (a, b) {
        if (this.wd) {
          var c = this.Vc[a];
          if ("open" == c.readyState) {
            var d = b.Kg();
            try {
              c.send(d);
            } catch (e) {
              window.console.log(e instanceof q ? e.Ta : e);
            }
          }
        }
      },
      ia: function () {
        window.clearTimeout(this.Am);
        this.wd &&
          ((this.wd = !1), this.Ra.close(), null != this.cf && this.cf());
      },
      f: Nb,
    };
    var pc = {
      b: !0,
      description: function (a) {
        switch (a) {
          case 4001:
            return "The room was closed.";
          case 4100:
            return "The room is full.";
          case 4101:
            return "Wrong password.";
          case 4102:
            return "You are banned from this room.";
          case 4103:
            return "Incompatible game version.";
          default:
            return "Connection closed (" + a + ")";
        }
      },
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
        throw new q(
          "Cannot decode UTF8 character at offset " +
            b +
            ": charCode (" +
            c +
            ") is invalid"
        );
      return { char: c, length: b - l };
    };
    F.prototype = {
      sb: function (a) {
        null == a && (a = this.o.byteLength - this.a);
        if (this.a + a > this.o.byteLength) throw new q("Read too much");
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
          throw new q(
            "Actual string length differs from the specified: " +
              (b - a) +
              " bytes"
          );
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
        throw new q(
          "Cannot encode UTF8 character: charCode (" + a + ") is negative"
        );
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
        throw new q(
          "Cannot encode UTF8 character: charCode (" +
            a +
            ") is too large (>= 0x80000000)"
        );
      return c - d;
    };
    w.En = function (a) {
      if (0 > a)
        throw new q(
          "Cannot calculate length of UTF8 character: charCode (" +
            a +
            ") is negative"
        );
      if (128 > a) return 1;
      if (2048 > a) return 2;
      if (65536 > a) return 3;
      if (2097152 > a) return 4;
      if (67108864 > a) return 5;
      if (-2147483648 > a) return 6;
      throw new q(
        "Cannot calculate length of UTF8 character: charCode (" +
          a +
          ") is too large (>= 0x80000000)"
      );
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
        if (1 > a) throw new q("Can't resize buffer to a capacity lower than 1");
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
    I.b = !0;
    I.yo = function () {
      try {
        return window.crypto.subtle
          .generateKey(I.qh, !0, ["sign", "verify"])
          .then(function (a) {
            var b = a.privateKey;
            return window.crypto.subtle.exportKey("jwk", b).then(function (a) {
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
        return Promise.reject("Invalid id format");
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
          g = f.ic(),
          k = f.ic(),
          l = f.sb();
        if (l.byteLength != b.byteLength) return Promise.reject(null);
        for (var c = 0, t = l.byteLength; c < t; ) {
          var h = c++;
          if (l[h] != b[h]) return Promise.reject(null);
        }
        return I.Wr(g, k)
          .then(function (a) {
            return window.crypto.subtle.verify(I.mm, a, e, d);
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
        return window.crypto.subtle.importKey(
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
        return window.crypto.subtle.importKey(
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
          return window.crypto.subtle.sign(I.mm, this.Al, f).then(function (a) {
            b.Mg(a);
            return b.Sb();
          });
        } catch (g) {
          return Promise.reject(g instanceof q ? g.Ta : g);
        }
      },
      f: I,
    };
    internalData.authObj = I;
    /*
    Ja.b = !0;
    Ja.gp = function () {
      if (null != Ja.li) return Ja.li;
      Ja.li = new Promise(function (a, b) {
        var c = window.grecaptcha;
        null != c
          ? a(c)
          : ((c = window.document.createElement("script")),
            (c.src =
              "https://www.google.com/recaptcha/api.js?onload=___recaptchaload&render=explicit"),
            window.document.head.appendChild(c),
            (window.___recaptchaload = function () {
              a(window.grecaptcha);
            }),
            (c.onerror = function () {
              b(null);
            }));
      });
      return Ja.li;
    };
    */
    Ba.b = !0;
    Ba.cg = function (a) {
      return a;
    };
    mc.b = !0;
    mc.ts = function () {
      /*
      var a = window;
      a.RTCPeerConnection =
        a.webkitRTCPeerConnection ||
        a.mozRTCPeerConnection ||
        a.RTCPeerConnection;
      a.RTCIceCandidate =
        a.webkitRTCIceCandidate || a.mozRTCIceCandidate || a.RTCIceCandidate;
      a.RTCSessionDescription =
        a.webkitRTCSessionDescription ||
        a.mozRTCSessionDescription ||
        a.RTCSessionDescription;
      */
      var b = new RTCPeerConnection({ iceServers: [] });
      //try {
      b.createAnswer()["catch"](function () {});
      /*
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
      */
    };
    /*
    Ca.b = !0;
    Ca.ar = function (a, b) {
      Ca.Xl(new Blob([a], { type: "octet/stream" }), b);
    };
    Ca.br = function (a, b) {
      Ca.Xl(new Blob([a], { type: "text/plain" }), b);
    };
    Ca.Xl = function (a, b) {
      var c = window.document.createElement("a");
      c.style.display = "display: none";
      window.document.body.appendChild(c);
      var d = URL.createObjectURL(a);
      c.href = d;
      c.download = b;
      c.click();
      URL.revokeObjectURL(d);
      c.remove();
    };
    Db.b = !0;
    Db.prototype = {
      set: function (a) {
        this.value != a &&
          ((this.value = a), (this.Ja.textContent = "" + this.value));
      },
      f: Db,
    };
    v.b = !0;
    v.Ea = function (a) {
      var b = new Map(),
        c = 0;
      for (a = a.querySelectorAll("[data-hook]"); c < a.length; ) {
        var d = a[c++];
        b.set(d.getAttribute("data-hook"), d);
      }
      return b;
    };
    v.Ga = function (a, b) {
      null == b && (b = "div");
      var c = window.document.createElement(b);
      c.innerHTML = a;
      return c.firstElementChild;
    };
    v.xe = function (a, b) {
      a.parentElement.replaceChild(b, a);
    };
    v.Cf = function (a) {
      for (var b = a.firstChild; null != b; )
        a.removeChild(b), (b = a.firstChild);
    };
    */
    zb.b = !0;
    zb.eh = function (a) {
      return new Promise(function (b, c) {
        a.onsuccess = function () {
          b(a.result);
        };
        a.onerror = c;
      });
    };
    lc.b = !0;
    lc.Dr = function (a, b) {
      return new Promise(function (c, d) {
        var e = window.setTimeout(function () {
          d("Timed out");
        }, b);
        a.then(
          function (a) {
            window.clearTimeout(e);
            c(a);
          },
          function (a) {
            window.clearTimeout(e);
            d(a);
          }
        );
      });
    };
    m.b = !0;
    m.Fa = function (a) {
      null == a.Aa && (a.Aa = !0);
      null == a.Ba && (a.Ba = !0);
      return a;
    };
    m.Ha = function (a) {
      a.on = m.yf;
      if (null == a.za) throw new q("Class doesn't have a config");
      a.prototype.zf = a.za;
      m.Qm.set(m.yf, a);
      m.yf++;
    };
    m.lj = function (a, b) {
      var c = (null == a ? null : r.Nm(a)).on;
      if (null == c) throw new q("Tried to pack unregistered action");
      b.l(c);
      a.ua(b);
    };
    m.fh = function (a) {
      var b = a.B(),
        b = Object.create(m.Qm.get(b).prototype);
      b.da = 0;
      b.mb = 0;
      b.va(a);
      return b;
    };
    m.prototype = {
      $m: function () {
        return !0;
      },
      apply: function () {
        throw new q("missing implementation");
      },
      va: function () {
        throw new q("missing implementation");
      },
      ua: function () {
        throw new q("missing implementation");
      },
      f: m,
    };
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
    yb.b = !0;
    yb.prototype = { f: yb };
    Ua.b = !0;
    Ua.ma = m;
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
      f: Ua,
    });
    cc.b = !0;
    cc.prototype = { f: cc };
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
          : (b = new bc());
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
    bc.b = !0;
    bc.prototype = { f: bc };
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
    Ta.b = !0;
    ya.b = !0;
    V.b = !0;
    V.ma = yb;
    V.prototype = C(yb.prototype, {
      ra: function () {
        throw new q("missing implementation");
      },
      Sf: function () {
        throw new q("missing implementation");
      },
      C: function () {
        throw new q("missing implementation");
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
          ? ((a.da = this.cc++), a.apply(this.T), null != this.fc && this.fc(a))
          : this.le.Rm(a);
      },
      wk: function (a, b) {
        if (0 >= a) return this.T;
        a > this.Ff && (a = this.Ff);
        ya.zc++;
        var c = this.T.sc(),
          d;
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
        haxball.room._onHandicapChange(a);
      },
      gm: function (a) {
        this.rd = this.Ac * a;
        haxball.room._onExtrapolationChange(a);
      },
      f: V,
    });
    var xb = (Ab["bas.marf.net.ConnFailReason"] = {
      Gf: !0,
      nh: ["Cancelled", "PeerFailed", "Rejected", "Other"],
      hh: { nb: 0, eb: "bas.marf.net.ConnFailReason", toString: ga },
      jh: { nb: 1, eb: "bas.marf.net.ConnFailReason", toString: ga },
      lh:
        ((X = function (a) {
          return {
            nb: 2,
            reason: a,
            eb: "bas.marf.net.ConnFailReason",
            toString: ga,
          };
        }),
        (X.Ae = ["reason"]),
        X),
      ih:
        ((X = function (a) {
          return {
            nb: 3,
            description: a,
            eb: "bas.marf.net.ConnFailReason",
            toString: ga,
          };
        }),
        (X.Ae = ["description"]),
        X),
    });
    xa.b = !0;
    xa.xh = function (a) {
      switch (a.nb) {
        case 0:
          return "Cancelled";
        case 1:
          return "Failed to connect to peer.";
        case 2:
          return pc.description(a.reason);
        case 3:
          return a.description;
      }
    };
    xa.ma = V;
    xa.prototype = C(V.prototype, {
      ia: function (a) {
        null != this.pc && ((this.pc.bd = null), this.pc.Gn(), (this.pc = null));
        window.clearTimeout(this.re);
        null != this.pa && ((this.pa.cf = null), this.pa.ia(), (this.pa = null));
        this.ek = null == a ? "Connection closed" : a;
        this.tf(4);
        haxball.emit("roomLeave", this.ek);
      },
      tf: function (a) {
        this.pd != a && ((this.pd = a), (haxball.emit("connectionStateChange", a)), null != this.Ad && this.Ad(a));
      },
      wd: function () {
        return 3 == this.pd;
      },
      C: function () {
        this.wd() && window.performance.now() - this.zm > this.nn && this.zi();
        this.Xc = window.performance.now() * this.Ac + this.Qi.$g(0.5) - this.Y;
        this.Oj();
      },
      Sf: function () {
        return this.wd()
          ? (0 > this.bc && (this.bc = 0),
            this.wk(
              window.performance.now() * this.Ac +
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
        //a.forEach((x, i)=>{a[i]=Math.floor(256*Math.random())}); // randomize conn ? unnecessary...
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
        window.clearTimeout(this.re);
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
        a = b ? "You were banned" : "You were kicked";
        "" != d && (a += " by " + d);
        "" != c && (a += " (" + c + ")");
        this.ia(a);
      },
      tq: function (a) {
        var b = a.u();
        a = a.u();
        var c = window.performance.now() - a;
        this.Qi.add(b - a * this.Ac);
        this.sg.add(c);
        for (var d = (b = 0), e = this.Di; d < e.length; ) {
          var f = e[d];
          ++d;
          if (f > a) break;
          //f < a ? y.i(this.dl, -1) : y.i(this.dl, c);
          ++b;
        }
        this.Di.splice(0, b);
      },
      zi: function () {
        var a = window.performance.now();
        this.zm = a;
        this.Di.push(a);
        var b = this.sg.$g(0.5) | 0,
          c = w.ha();
        haxball.room?.modifyClientPing && (b = haxball.room.modifyClientPing(b));
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
          var d = w.ha();
          d.l(1);
          haxball.room?.modifyFrameNo && (c = haxball.room.modifyFrameNo(c));
          d.tb(c);
          d.tb(b);
          m.lj(a, d);
          this.Rb(d);
          a.zf.Ba && ((a.ue = b), (a.P = this.uc), (a.mb = c), this.ug.Rm(a));
        }
      },
      f: xa,
    });
    Lb.b = !0;
    Lb.ma = V;
    Lb.prototype = C(V.prototype, {
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
        var e = this.Ie.get(a);
        if (null != e) {
          if (d) {
            var f = this.Ic.zn(e.pa);
            // console.log(f); // ban
            this.Kj.set(a, f);
          }
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
        this.Ic.Ud();
        this.Kj.clear();
        haxball.room._onBansClear();
      },
      Fi: function (a) {
        this.Ic.Fi(a);
      },
      Ei: function (a) {
        this.Ic.Ei(a);
      },
      ra: function (a) {
        a.P = 0;
        var b = this.Y + this.wi + this.bc;
        a.zf.Aa || (b = this.Y);
        a.mb = b;
        this.Cg(a);
        this.Ci();
        0 < this.ac.length && this.Eg(this.Zh(a), 1);
      },
      _mf_: function(a, b) { // private messaging.
        var c = this.Ie.get(b);
        if (null != c) {
          a.P = 0;
          var d = w.ha();
          d.l(6);
          m.lj(a, d);
          c.Rb(d, 0);
        }
      },
      C: function () {
        var a = (((window.performance.now() - this.Li) * this.Ac) | 0) - this.Y;
        0 < a && this.zj(a);
        7 <= this.Y - this.Kk && this.Ci();
        this.Y - this.Jk >= this.Mn && (this.Ci(), this.gr());
      },
      Sf: function () {
        0 > this.bc && (this.bc = 0);
        return this.wk(
          (window.performance.now() - this.Li) * this.Ac -
            this.Y +
            this.wi +
            this.bc +
            this.rd
        );
      },
      Oo: function (a, b) {
        if (!this.upc && this.ac.length >= this.fg) return gc.kh(4100);
        try {
          if (b.Ob() != this.Sr) throw new q(null);
        } catch (d) {
          return gc.kh(4103);
        }
        try {
          var c = b.zb();
          if (null != this.Ib && c != this.Ib) throw new q(null);
        } catch (d) {
          return gc.kh(4101);
        }
        return gc.hn;
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
            y.i(b.Ip, c.$);
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
          this.Kk = this.Y;
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
      hr: function (a) {
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
      gr: function () {
        this.Jk = this.Y;
        if (0 != this.ac.length) {
          var a = new Ua();
          a.mb = this.Y;
          a.da = this.cc++;
          a.P = 0;
          a.Rg = this.T.Ao();
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
              if (-1 != c.ac.indexOf(b)) {
                b.Ns = a;
                var d = c.up++;
                b.$ = d;
                c.Ie.set(d, b);
                vb.i(
                  c.Hp,
                  d,
                  new F(new DataView(e.buffer, e.byteOffset, e.byteLength), !1),
                  b.pa.gd,       // send conn (fallback should be b.pa.oe)
                  a              // send auth
                );
                b.yg = !0;
                c.hr(b);
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
        //window.console.log(b);
        this.Ie["delete"](a.$);
        D.remove(this.ac, a);
        a.yg && null != this.$k && this.$k(a.$);
        a.pa.ia();
      },
      sq: function (a, b) {
        var c = a.u();
        b.yb = haxball.room._modifyPlayerPing(b.$, a.Ab());
        var d = w.ha();
        d.l(4);
        d.s((window.performance.now() - this.Li) * this.Ac + this.wi);
        d.s(c);
        b.Rb(d, 2);
      },
      zq: function (a, b) {
        var c = a.hb(),
          d = a.hb(),
          e = m.fh(a),
          f = e.zf.oj;
        if (null != f) {
          var g = b.xj.get(f);
          null == g && ((g = new tb(f.$i, f.uj)), b.xj.set(f, g));
          if (!g.Cm()) throw new q(3);
        }
        e.P = b.$;
        if (!internalData.onOperationReceived(e))
  				return;
        f = this.Y;
        g = this.Y + 120;
        e.ue = d;
        e.mb = c < f ? f : c > g ? g : c;
        e.$m(this.T) && (this.Cg(e), this.Eg(this.Zh(e), 1));
      },
      f: Lb,
    });
    $b.b = !0;
    $b.prototype = {
      Rb: function (a, b) {
        null == b && (b = 0);
        this.pa.Rb(b, a);
      },
      f: $b,
    };
    Zb.b = !0;
    Kb.b = !0;
    Kb.prototype = { f: Kb };
    /*
    Jb.b = !0;
    Jb.ma = V;
    Jb.prototype = C(V.prototype, {
      Cq: function (a) {
        for (var b = a.Ob(), c = 0, d = 0; d < b; ) {
          ++d;
          var c = c + a.Ab(),
            e = a.B();
          this.Vk.push({ mj: c / this.mf, kind: e });
        }
      },
      Dl: function () {
        var a = this.Lc;
        0 < a.o.byteLength - a.a
          ? ((a = this.Lc.Ab()),
            (this.hg += a),
            (a = this.Lc.Ob()),
            (this.gg = m.fh(this.Lc)),
            (this.gg.P = a))
          : (this.gg = null);
      },
      Go: function () {
        return this.Y / this.mf;
      },
      ra: function () {},
      Sf: function () {
        this.C();
        ya.zc++;
        var a = this.T.sc();
        a.C(this.sk);
        return a;
      },
      C: function () {
        var a = window.performance.now(),
          b = a - this.Wh;
        this.Wh = a;
        0 < this.Fd
          ? ((this.Qb += 1e4),
            this.Qb > this.Fd && ((this.Qb = this.Fd), (this.Fd = -1)))
          : (this.Qb += b * this.pl);
        a = this.mf * this.mh;
        this.Qb > a && (this.Qb = a);
        b = this.Qb * this.Ac;
        a = b | 0;
        for (this.sk = b - a; this.Y < a; ) {
          for (; null != this.gg && this.hg == this.Y; )
            (b = this.gg),
              b.apply(this.T),
              null != this.fc && this.fc(b),
              this.Dl();
          this.Y++;
          this.T.C(1);
        }
      },
      er: function (a) {
        this.Fd = a;
        a < this.Qb && this.ui();
      },
      ui: function () {
        this.hg = 0;
        this.Qb = this.Y = this.Lc.a = 0;
        this.T.ja(this.Lc);
        this.Dl();
      },
      f: Jb,
    });
    */
    Ib.b = !0;
    Ib.prototype = {
      eval: function (a) {
        var b = this.Yb.length - 1;
        if (a <= this.Yb[0]) return this.Yb[1];
        if (a >= this.Yb[b]) return this.Yb[b - 2];
        for (var c = 0, b = (b / 5) | 0; ; ) {
          var d = (b + c) >>> 1;
          a > this.Yb[5 * d] ? (c = d + 1) : (b = d - 1);
          if (!(c <= b)) break;
        }
        c = 5 * b;
        b = this.Yb[c];
        a = (a - b) / (this.Yb[c + 5] - b);
        b = a * a;
        d = b * a;
        return (
          (2 * d - 3 * b + 1) * this.Yb[c + 1] +
          (d - 2 * b + a) * this.Yb[c + 2] +
          (-2 * d + 3 * b) * this.Yb[c + 3] +
          (d - b) * this.Yb[c + 4]
        );
      },
      f: Ib,
    };
    H.b = !0;
    H.prototype = { f: H };
    M.b = !0;
    M.Pl = function (a, b, c, d, e) {
      return new Promise(function (f, g) {
        var k = new XMLHttpRequest();
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
    A.b = !0;
    A.i = function (a) {
      null != a && a();
    };
    y.b = !0;
    y.i = function (a, b) {
      null != a && a(b);
    };
    ia.b = !0;
    ia.i = function (a, b, c) {
      null != a && a(b, c);
    };
    Cb.b = !0;
    Cb.i = function (a, b, c, d) {
      null != a && a(b, c, d);
    };
    vb.b = !0;
    vb.i = function (a, b, c, d, e) {
      null != a && a(b, c, d, e);
    };
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
        return 0 >= a ? 0 : this.Ve + a * this.Si - window.performance.now();
      },
      Zn: function (a, b) {
        var c = this.Cr(a);
        this.oc -= a;
        window.setTimeout(b, c | 0);
      },
      C: function () {
        var a = window.performance.now(),
          b = Math.floor((a - this.Ve) / this.Si);
        this.Ve += b * this.Si;
        this.oc += b;
        this.oc >= this.Nj && ((this.oc = this.Nj), (this.Ve = a));
      },
      f: tb,
    };
    /*
    Hb.b = !0;
    Hb.gf = function (a) {
      var b = new fc("([^&=]+)=?([^&]*)", "g");
      a = a.substring(1);
      for (var c = 0, d = new Map(); b.os(a, c); ) {
        var c = b.Wm(1),
          c = decodeURIComponent(c.split("+").join(" ")),
          e = b.Wm(2);
        d.set(c, decodeURIComponent(e.split("+").join(" ")));
        c = b.ps();
        c = c.mj + c.ms;
      }
      return d;
    };
    Hb.L = function () {
      return Hb.gf(window.location.search);
    };
    ub.b = !0;
    ub.cq = function (a) {
      if (3 > a.length) throw new q("Not enough arguments");
      if (7 < a.length) throw new q("Too many arguments");
      var b = new Pa(),
        c = new ka();
      b.Sg = c;
      switch (a[1]) {
        case "blue":
          c.fb = [p.xa.R];
          b.ea = p.xa;
          break;
        case "red":
          c.fb = [p.fa.R];
          b.ea = p.fa;
          break;
        default:
          throw new q('First argument must be either "red" or "blue"');
      }
      if ("clear" == a[2]) return b;
      c.hd = ((256 * K.parseInt(a[2])) / 360) | 0;
      c.ed = K.parseInt("0x" + a[3]);
      if (4 < a.length) {
        c.fb = [];
        for (var d = 4, e = a.length; d < e; )
          c.fb.push(K.parseInt("0x" + a[d++]));
      }
      return b;
    };
    */
    ub.__cq__ = function (team, clear, ...colors) {
      var b = new Pa(),
        c = new ka();
      b.Sg = c;
      switch (team) {
        case "blue":
          c.fb = [p.xa.R];
          b.ea = p.xa;
          break;
        case "red":
          c.fb = [p.fa.R];
          b.ea = p.fa;
          break;
        default:
          throw new q('First argument must be either "red" or "blue"');
      }
      if (clear) 
        return b;
      if (colors.length < 2)
        return b;
      c.hd = ((256 * K.parseInt(colors[0])) / 360) | 0;
      c.ed = K.parseInt("0x" + colors[1]);
      if (2 < colors.length) {
        c.fb = [];
        for (var d = 2, e = colors.length; d < e; )
          c.fb.push(K.parseInt("0x" + colors[d++]));
      }
      return b;
    };
    /*
    ub.prototype = {
      gf: function (a) {
        var b = this;
        if ("/" != a.charAt(0)) return !1;
        if (1 == a.length) return !0;
        a = J.Gs(D.substr(a, 1, null)).split(" ");
        var c = a[0];
        switch (c) {
          case "avatar":
            2 == a.length && (this.fm(a[1]), this.ba("Avatar set"));
            break;
          case "checksum":
            var d = this.ya.T.S;
            a = d.w;
            d.Pe()
              ? this.ba('Current stadium is original: "' + a + '"')
              : ((d = J.Vg(d.Sj(), 8)),
                this.ba('Stadium: "' + a + '" (checksum: ' + d + ")"));
            break;
          case "clear_avatar":
            this.fm(null);
            this.ba("Avatar cleared");
            break;
          case "clear_bans":
            null == this.Ud
              ? this.ba("Only the host can clear bans")
              : (this.Ud(), this.ba("All bans have been cleared"));
            break;
          case "clear_password":
            null == this.Fg
              ? this.ba("Only the host can change the password")
              : (this.Fg(null), this.ba("Password cleared"));
            break;
          case "colors":
            try {
              (d = ub.cq(a)), this.ya.ra(d), internalData.execOperationReceivedOnHost(d);
            } catch (g) {
              (a = g instanceof q ? g.Ta : g), "string" == typeof a && this.ba(a);
            }
            break;
          case "extrapolation":
            2 == a.length
              ? ((a = K.parseInt(a[1])),
                null != a // && -200 <= a && 200 >= a
                  ? (n.A.rd.Xa(a),
                    this.ya.gm(a),
                    this.ba("Extrapolation set to " + a + " msec"))
                  : this.ba(
                      "Extrapolation must be a value between -200 and 50 milliseconds"
                    ))
              : this.ba("Extrapolation requires a value in milliseconds.");
            break;
          case "handicap":
            2 == a.length
              ? ((a = K.parseInt(a[1])),
                null != a // && 0 <= a && 300 >= a
                  ? (this.ya.kr(a),
                    this.ba("Ping handicap set to " + a + " msec"))
                  : this.ba(
                      "Ping handicap must be a value between 0 and 300 milliseconds"
                    ))
              : this.ba("Ping handicap requires a value in milliseconds.");
            break;
          case "kick_ratelimit":
            if (4 > a.length)
              this.ba("Usage: /kick_ratelimit <min> <rate> <burst>");
            else {
              var d = K.parseInt(a[1]),
                e = K.parseInt(a[2]), msg;
              a = K.parseInt(a[3]);
              null == d || null == e || null == a
                ? this.ba("Invalid arguments")
                : (msg = ma.la(d, e, a), this.ya.ra(msg), internalData.execOperationReceivedOnHost(msg));
            }
            break;
          case "recaptcha":
            if (null == this.jm) this.ba("Only the host can set recaptcha mode");
            else
              try {
                if (2 == a.length) {
                  switch (a[1]) {
                    case "off":
                      e = !1;
                      break;
                    case "on":
                      e = !0;
                      break;
                    default:
                      throw new q(null);
                  }
                  this.jm(e);
                  this.ba("Room join Recaptcha " + (e ? "enabled" : "disabled"));
                } else throw new q(null);
              } catch (g) {
                this.ba("Usage: /recaptcha <on|off>");
              }
            break;
          case "set_password":
            2 == a.length &&
              (null == this.Fg
                ? this.ba("Only the host can change the password")
                : (this.Fg(a[1]), this.ba("Password set")));
            break;
          case "store":
            var f = this.ya.T.S;
            f.Pe()
              ? this.ba("Can't store default stadium.")
              : Z.Es()
                  .then(function () {
                    return Z.add(f);
                  })
                  .then(
                    function () {
                      b.ba("Stadium stored");
                    },
                    function () {
                      b.ba("Couldn't store stadium");
                    }
                  );
            break;
          default:
            this.ba('Unrecognized command: "' + c + '"');
        }
        return !0;
      },
      fm: function (a) {
        null != a && (a = U.Qc(a, 2));
        n.A.sh.Xa(a);
        var msg = ra.la(a);
        this.ya.ra(msg);
        internalData.execOperationReceivedOnHost(msg);
      },
      f: ub,
    };
    */
    internalData.teamColorsObj = ub;
    Ha.b = !0;
    ba.b = !0;
    /*
    ba.Yl = function (a) {
      var b = new Date();
      Ca.ar(
        a,
        "HBReplay-" +
          b.getFullYear() +
          "-" +
          J.Af("" + (b.getMonth() + 1)) +
          "-" +
          J.Af("" + b.getDate()) +
          "-" +
          J.Af("" + b.getHours()) +
          "h" +
          J.Af("" + b.getMinutes()) +
          "m.hbr2"
      );
    };
    */
    ba.Bq = function (a) {
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
        e == d
          ? 2 > f || (msg = S.la(b(), p.fa), a.ra(msg), internalData.execOperationReceivedOnHost(msg), msg = S.la(b(), p.xa), a.ra(msg), internalData.execOperationReceivedOnHost(msg))
          : ((d = e > d ? p.fa : p.xa), msg = S.la(b(), d), a.ra(msg), internalData.execOperationReceivedOnHost(msg)));
    };
    ba.prototype = {
      zr: function () {
        this.Ed = new ac(this.ya, 3);
      },
      /*
      vr: function (a) {
        var b = this;
        a = new gb(a);
        a.qb = function () {
          b.j.bb(null);
        };
        a.ei = function (a, d, e) {
          b.ya.ra(Y.la(a, d, e));
          b.j.bb(null);
        };
        this.j.bb(a.g);
      },
      */
      ia: function () {
        //window.document.removeEventListener("keydown", G(this, this.Bd));
        //window.document.removeEventListener("keyup", G(this, this.Cd));
        //window.onbeforeunload = null;
        window.cancelAnimationFrame(this.De);
        //this.ob.ia();
        //window.clearInterval(this.Gh);
        window.clearInterval(this.Qr);
        window.clearTimeout(this.Nf);
      },
      Wq: function (a) {
        for (var b = [], c = 0, d = this.ya.T.I; c < d.length; ) {
          var e = d[c];
          ++c;
          e.ea == a && b.push(S.la(e.V, p.Ia));
        }
        for (a = 0; a < b.length; ) {
          var msg = b[a++];
          this.ya.ra(msg);
          internalData.execOperationReceivedOnHost(msg);
        }
      },
      bf: function () {
        this.De = window.requestAnimationFrame(G(this, this.bf));
        this.ob.C();
        this.ya.C();
        this.Kc();
      },
      Kc: function () {
        var a = window.performance.now();
        (1 == n.A.Fh.L() && 28.333333333333336 > a - this.$c) ||
          ((this.$c = a),
          //this.sd++,
          //this.uf(),
          (a = this.ya.T.na(this.ya.uc)),
          null != a && (this.xi = a.cb),
          this.j.C(this.ya));
      },
      /*
      Gp: function (a) {
        var b = this;
        this.Of.gf(a) ||
          this.Jn.Zn(1, function () {
            var c = new Na();
            c.Tc = a;
            b.ya.ra(c);
          });
      },
      Fp: function (a) {
        var b = this;
        this.zh = a;
        null == this.Nf &&
          ((this.Nf = window.setTimeout(function () {
            b.Nf = null;
            b.bm(b.zh);
          }, 1e3)),
          this.bm(this.zh));
      },
      */
      bm: function (a) {
        var msg;
        a != this.Ik && (
          msg = na.la(a ? 0 : 1),
          this.ya.ra(msg), 
          (this.Ik = a),
          internalData.execOperationReceivedOnHost(msg)
        );
      },
      Bm: function () {
        if (null != this.ya.T.K) {
          var a = new Oa();
          a.Bf = 120 != this.ya.T.K.Oa;
          this.ya.ra(a);
          internalData.execOperationReceivedOnHost(a);
        }
      },
      /*
      Bd: function (a) {
        switch (a.keyCode) {
          case 9:
          case 13:
            this.j.Qa.gb.focus();
            a.preventDefault();
            break;
          case 27:
            if (this.j.Zo()) this.j.bb(null);
            else {
              var b = this.j;
              b.me(!b.Gd);
            }
            a.preventDefault();
            break;
          case 49:
            n.A.Tb.Xa(1);
            break;
          case 50:
            n.A.Tb.Xa(2);
            break;
          case 51:
            n.A.Tb.Xa(3);
            break;
          case 52:
            n.A.Tb.Xa(0);
            break;
          case 80:
            this.Bm();
            break;
          default:
            this.ob.Bd(a.code);
        }
      },
      uf: function () {
        var a = n.A.Tb.L(),
          b = this.j.Fb,
          c = b.Eb;
        c.zg = n.A.Sl.L();
        0 == a
          ? (b.Gg(!0), (c.kf = 1), (c.jf = 0), (c.xf = 0))
          : (b.Gg(!1),
            (c.xf = 35),
            -1 == a ? (c.jf = 450) : ((c.jf = 0), (c.kf = 1 + 0.25 * (a - 1))));
      },
      Cd: function (a) {
        this.ob.Cd(a.code);
      },
      */
      f: ba,
    };
    Gb.b = !0;
    Gb.prototype = {
      /*
      Ti: function (a) {
        var b = this.j.Qa.Bc,
          c = [],
          d = 0;
        for (a = a.I; d < a.length; ) {
          var e = a[d];
          ++d;
          c.push({ w: e.w, $: e.V });
        }
        b.Hj = c;
      },
      */
      ri: function (a) {
        function xx(){}
        /*
        function b(a) {
          return null == a ? "" : " by " + a.w;
        }
        */
        var c = this;
        //this.Ti(a);
        /*
        a.tl = function (b) {
          //c.j.Qa.Gb("" + b.w + " has joined");
          //n.Na.cd(n.Na.$o);
          //c.Ti(a);
        };
        */
        a.ul = function (d, e, f, g) {
          y.i(c.Op, d.V);
          null == e
            ? (xx()/*d = "" + d.w + " has left"*/)
            : (vb.i(c.Np, d.V, e, null != g ? g.w : null, f)/*,
              (d =
                "" +
                d.w +
                " was " +
                (f ? "banned" : "kicked") +
                b(g) +
                ("" != e ? " (" + e + ")" : ""))*/);
          //c.j.Qa.Gb(d);
          //n.Na.cd(n.Na.ep);
          //c.Ti(a);
        };
        /*
        a.rl = function (a, b) {
          var d = null != c.Rh && -1 != b.indexOf(c.Rh);
          c.j.Qa.ba("" + a.w + ": " + b, d ? "highlight" : null);
          n.A.om.L() && d ? n.Na.cd(n.Na.zk) : n.A.Hi.L() && n.Na.cd(n.Na.Rj);
        };
        a.Vl = function (a, b, f, g) {
          c.j.Qa.pp(a, b, f);
          if (n.A.Hi.L())
            switch (g) {
              case 1:
                n.Na.cd(n.Na.Rj);
                break;
              case 2:
                n.Na.cd(n.Na.zk);
            }
        };
        a.ji = function () {
          n.Na.cd(n.Na.bp);
        };
        a.Ni = function (a) {
          n.Na.cd(n.Na.Io);
          var b = c.j.Fb.Eb.td;
          b.Pa(a == p.fa ? b.Fq : b.Bn);
        };
        a.Oi = function (a) {
          var b = c.j.Fb.Eb.td;
          b.Pa(a == p.fa ? b.Gq : b.Cn);
          c.j.Qa.Gb("" + a.w + " team won the match");
        };
        a.ml = function (a, e, f) {
          e && !f && c.j.Qa.Gb("Game paused" + b(a));
        };
        a.Pi = function () {
          var a = c.j.Fb.Eb.td;
          a.Pa(a.Ar);
        };
        a.Ki = function (a) {
          c.j.me(!1);
          c.j.Fb.Eb.td.Nn();
          c.j.Qa.Gb("Game started" + b(a));
        };
        a.vf = function (a) {
          null != a && c.j.Qa.Gb("Game stopped" + b(a));
        };
        a.Ii = function (a, e) {
          if (!e.Pe()) {
            var d = J.Vg(e.Sj(), 8);
            c.j.Qa.Gb('Stadium "' + e.w + '" (' + d + ") loaded" + b(a));
          }
        };
        a.sl = function (a) {
          c.j.Qa.Gb(
            "" + a.w + " " + (a.Ld ? "has desynchronized" : "is back in sync")
          );
        };
        a.xl = function (d, e, f) {
          null != a.K && c.j.Qa.Gb("" + e.w + " was moved to " + f.w + b(d));
        };
        a.ii = function (a, e) {
          var d = e.w;
          c.j.Qa.Gb(
            (e.cb
              ? "" + d + " was given admin rights"
              : "" + d + "'s admin rights were taken away") + b(a)
          );
        };
        a.wl = function (a, b) {
          c.j.Fb.Eb.Po(a, b);
        };
        a.Hk = function (a, e, f, g) {
          c.j.Qa.Gb(
            "Kick Rate Limit set to (min: " +
              e +
              ", rate: " +
              f +
              ", burst: " +
              g +
              ")" +
              b(a)
          );
        };
        */
      },
      Lr: function (a) {
        //a.tl = null;
        a.ul = null;
        //a.rl = null;
        //a.Vl = null;
        //a.ji = null;
        //a.Ni = null;
        //a.Oi = null;
        //a.ml = null;
        //a.Pi = null;
        //a.Ki = null;
        //a.vf = null;
        //a.Ii = null;
        //a.sl = null;
        //a.xl = null;
        //a.ii = null;
        //a.wl = null;
        //a.Hk = null;
      },
      f: Gb,
    };
    Ra.b = !0;
    Ra.Fk = function (a) {
      switch (n.A.tg.L().L(a)) {
        case "Down":
          return 2;
        case "Kick":
          return 16;
        case "Left":
          return 4;
        case "Right":
          return 8;
        case "Up":
          return 1;
        default:
          return 0;
      }
    };
    Ra.prototype = {
      /*ia: function () {
        window.document.removeEventListener("focusout", G(this, this.al));
      },*/
      C: function () {
        var a = internalData.keyState;//this.$d
        if (null != this.ng && a != this.Yf) {
          this.Yf = a;
          var b = new Ga();
          b.input = a;
          this.ng(b);
        }
      },
      /*Bd: function (a) {
        this.$d |= Ra.Fk(a);
      },
      Cd: function (a) {
        this.$d &= ~Ra.Fk(a);
      },*/
      al: function () {
        if (null != this.ng && 0 != this.Yf) {
          this.Yf = this.$d = 0;
          var a = new Ga();
          a.input = 0;//internalData.keyState;
          this.ng(a);
        }
      },
      f: Ra,
    };
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
    T.Fo = function () {
      return M.tk(n.Ee + "api/geo").then(function (a) {
        return T.Rf(a);
      });
    };
    T.prototype = {
      se: function () {
        return JSON.stringify({ lat: this.Ec, lon: this.Gc, code: this.ub });
      },
      f: T,
    };
    Yb.b = !0;
    Yb.prototype = {
      Lh: function () {
        return null != this.Ne.L()
          ? this.Ne.L()
          : null != this.Me.L()
          ? this.Me.L()
          : new T();
      },
      f: Yb,
    };
    Xb.b = !0;
    Xb.Pm = function () {
      try {
        var a = window.localStorage;
        a.getItem("");
        if (0 == a.length) {
          var b = "_hx_" + Math.random();
          a.setItem(b, b);
          a.removeItem(b);
        }
        return a;
      } catch (c) {
        return null;
      }
    };
    wa.b = !0;
    wa.prototype = {
      L: function () {
        return this.Hm;
      },
      Xa: function (a) {
        this.Hm = a;
        if (null != this.Yh)
          try {
            var b = this.Ur(a);
            null == b ? this.Yh.removeItem(this.w) : this.Yh.setItem(this.w, b);
          } catch (c) {}
      },
      f: wa,
    };
    W.b = !0;
    W.Rf = function (a) {
      for (var b = new W(), c = ec.Mm(a), d = 0; d < c.length; ) {
        var e = c[d];
        ++d;
        b.Yc.set(e, a[e]);
      }
      return b;
    };
    W.Hh = function (a) {
      return W.Rf(JSON.parse(a));
    };
    W.$j = function () {
      var a = new W();
      a.Pa("ArrowUp", "Up");
      a.Pa("KeyW", "Up");
      a.Pa("ArrowDown", "Down");
      a.Pa("KeyS", "Down");
      a.Pa("ArrowLeft", "Left");
      a.Pa("KeyA", "Left");
      a.Pa("ArrowRight", "Right");
      a.Pa("KeyD", "Right");
      a.Pa("KeyX", "Kick");
      a.Pa("Space", "Kick");
      a.Pa("ControlLeft", "Kick");
      a.Pa("ControlRight", "Kick");
      a.Pa("ShiftLeft", "Kick");
      a.Pa("ShiftRight", "Kick");
      a.Pa("Numpad0", "Kick");
      return a;
    };
    W.prototype = {
      Pa: function (a, b) {
        this.Yc.set(a, b);
      },
      L: function (a) {
        return this.Yc.get(a);
      },
      Jq: function (a) {
        this.Yc["delete"](a);
      },
      Eo: function (a) {
        for (var b = [], c = this.Yc.keys(), d = c.next(); !d.done; ) {
          var e = d.value,
            d = c.next();
          this.Yc.get(e) == a && b.push(e);
        }
        return b;
      },
      se: function () {
        for (var a = {}, b = this.Yc.keys(), c = b.next(); !c.done; ) {
          var d = c.value,
            c = b.next();
          a[d] = this.Yc.get(d);
        }
        return JSON.stringify(a);
      },
      f: W,
    };
    n.b = !0;
    Wb.b = !0;
    Wb.prototype = { f: Wb };
    u.b = !0;
    u.qp = function () {
      mc.ts();
      Promise.all([x.fj(/*function () {
        u.jk(u.xq);
      }*/), u.hp()]).then(()=>{
        haxball.emit("ready");
      });
    };
    u.hp = function () {
      var a = n.A.Gj.L();
      if (null == a)
        return I.yo()
          .then(function (a) {
            u.Je = a;
            n.A.Gj.Xa(a.Ir());
          })
          ["catch"](function () {
            return {};
          });
      else
        return I.xo(a)
          .then(function (a) {
            return (u.Je = a);
          })
          ["catch"](function () {
            return {};
          });
    };
    u.Bo = function () {
      var a = Xb.Pm();
      return null != a ? null != a.getItem("crappy_router") : !1;
    };
    /*
    u.jk = function (a) {
      var b = new kb(n.A.fe.L());
      b.cl = function (b) {
        n.A.fe.Xa(b);
        //n.Na.Tl();
        a();
      };
      x.La(b.g);
      b.Cb.focus();
    };
    u.kk = function (a, b) {
      var c = new Q(a);
      c.Va = b;
      x.La(c.g);
      //const solver = new CaptchaSolver('browser');
      //const codes = solver.solve();
    };
    */
    u.no = function (a, b) {
      function c() {
        //haxball.emit("joinRoomFailed", "Recaptcha Failed");
        /*
        u.xb();
        var a = new Ka("Failed", null);
        a.Va = function () {
          u.xb();
        };
        x.La(a.g);
        */
      }
      function d(b) {
        b = b.sitekey;
        if (null == b) throw new q(null);
        throw new q("Recaptcha not implemented yet.");
        /*
        u.kk(b, function (b) {
          e(a, b);
        });
        */
      }
      //x.La(new P("Connecting", "Connecting...", []).g);
      var e;
      e = function (a, e) {
        M.zl(n.Ee + "api/client", "room=" + a + "&rcr=" + e, M.vj)
          .then(function (a) {
            switch (a.action) {
              case "connect":
                a = a.token;
                if (null == a) throw new q(null);
                b(a);
                break;
              case "recaptcha":
                d(a);
                break;
              default:
                throw new q(null);
            }
          })
          ["catch"](function () {
            c();
          });
      };
      e(a, "");
    };
    /*
    u.xq = function () {
      var a = Hb.L(),
        b = a.get("c"),
        c = a.get("p");
      a.get("v");
      null != b && (null != c ? u.Dh(b) : u.Pf(b)) : u.xb();
    };
    u.xb = function () {
      var a = new Aa(n.A.Lh());
      x.La(a.Ja);
      a.Ym = function (b) {
        if (9 != b.vd.Id) {
          var c;
          9 > b.vd.Id
            ? ((b = "Old version room"),
              (c =
                "The room is running an older version, an update must have happened recently."))
            : ((b = "New version"),
              (c =
                "The room is running a new version of haxball, refresh the site to update."));
          var d = new P(b, c, ["Ok"]);
          x.La(d.g);
          d.Va = function () {
            x.La(a.Ja);
            return (d.Va = null);
          };
        } else b.vd.Ib ? u.Dh(b.$) : u.Pf(b.$);
      };
      a.ws = function () {
        u.oo();
      };
      a.vs = function () {
        u.jk(u.xb);
      };
      a.ys = function () {
        u.mk();
      };
      a.xs = function (a) {
        u.po(a);
      };
    };
    u.mk = function () {
      var a = new aa(!0),
        b = window.document.createElement("div");
      b.className = "view-wrapper";
      b.appendChild(a.g);
      x.La(b);
      a.qb = function () {
        u.xb();
      };
      a.Ep = function () {
        var a = new mb(),
          b = window.document.createElement("div");
        b.className = "view-wrapper";
        b.appendChild(a.g);
        x.La(b);
        return (a.qb = function () {
          u.mk();
        });
      };
    };
    */
    u.$h = function (a, b) {
      return "" + window.location.origin + "/play?c=" + a + (b ? "&p=1" : "");
    };
    /*
    u.oo = function () {
      var a = n.A.fe.L(),
        b = new ib("" + a + "'s room");
      x.La(b.g);
      b.ci = function () {
        u.xb();
      };

      // try to insert this into ib's constructor so we will not need to open roomlist to reach this function from outside.
      b.Jp = function (b) {
        function c() {
          if (!b.Ks) {
            var a = new Fb();
            a.Id = 9;
            a.w = g.jc;
            a.I = g.I.length;
            a.Xe = l.fg + 1;
            a.ub = f.ub;
            a.Ib = null != l.Ib;
            a.Ec = f.Ec;
            a.Gc = f.Gc;
            var c = w.ha(16);
            a.ga(c);
            a = c.Kg();
            l.Fi(a);
          }
        }
        x.La(new P("Creating room", "Connecting...", []).g);
        var e = null,
          f = n.A.Lh(),
          g = new fa();
        g.jc = b.name;
        var k = new ea();
        k.w = a;
        k.cb = !0;
        k.Kd = f.ub;
        k.Xb = n.A.sh.L();
        g.I.push(k);
        var l = new Lb({
          iceServers: n.Vf,
          ij: n.Ee + "api/host",
          state: g,
          version: 9,
        });
        l.fg = b.qs - 1;
        l.Ib = b.password;
        c();
        var t = new ba(l),
          h = !1;
        l.ef = function (a, b) {
          u.kk(a, function (a) {
            b(a);
            x.La(t.j.g);
            return (h = !0);
          });
        };
        var m = window.setInterval(function () {
          var a = la.la(l);
          l.ra(a);
        }, 3e3);
        l.$k = function (a) {
          null != g.na(a) && ((a = Y.la(a, "Bad actor", !1)), l.ra(a));
        };
        l.Hp = function (a, b) {
          var d = b.ic();
          if (25 < d.length) throw new q("name too long");
          var e = b.ic();
          if (3 < e.length) throw new q("country too long");
          var f = b.zb();
          if (null != f && 2 < f.length) throw new q("avatar too long");
          d = oa.la(a, d, e, f);
          l.ra(d);
          c();
        };
        l.Ip = function (a) {
          null != g.na(a) && ((a = Y.la(a, null, !1)), l.ra(a));
        };
        l.kg = function (a) {
          e = a;
          t.Bg = u.$h(a, null != l.Ib);
          h || ((h = !0), x.La(t.j.g));
        };
        t.Ih.Np = function (a, b, c, d) {
          l.to(a, b, c, d);
        };
        t.Ih.Op = function () {
          c();
        };
        t.j.de = function () {
          l.ia();
          t.ia();
          u.xb();
          window.clearInterval(m);
          //haxball.emit("roomLeave");
        };
        t.Of.Fg = function (a) {
          l.Ib = a;
          c();
          null != e && (t.Bg = u.$h(e, null != l.Ib));
        };
        t.Of.jm = function (a) {
          l.Ei(a);
        };
        t.Of.Ud = G(l, l.Ud);
        internalData.isHost = true;
        internalData.roomObj = t;
        internalData.roomPhysicsObj = g;
        haxball.emit("createRoomSucceeded");
      };

      return b; // we have to return this. cannot create this object outside because Jp is not defined in this object's constructor.
    };
    u.Dh = function (a) {
      var b = new Za();
      x.La(b.g);
      b.Va = function (b) {
        null == b ? u.xb() : u.Pf(a, b);
      };
    };
    u.po = function (a) {
      try {
        var b = new Vb(new Jb(new Uint8Array(a), new fa(), 3));
        b.je.de = function () {
          b.ia();
          u.xb();
        };
        x.La(b.j.g);
      } catch (e) {
        var c = e instanceof q ? e.Ta : e;
        if (c instanceof Kb)
          (a = new P(
            "Incompatible replay version",
            "The replay file is of a different version",
            ["Open player", "Cancel"]
          )),
            x.La(a.g),
            (a.Va = function (a) {
              0 == a
                ? ((a = window.top.location),
                  window.top.open(
                    a.protocol +
                      "//" +
                      a.hostname +
                      (null != a.port ? ":" + a.port : "") +
                      "/replay?v=" +
                      c.Id,
                    "_self"
                  ))
                : u.xb();
            });
        else {
          var d = new P("Replay error", "Couldn't load the file.", ["Ok"]);
          x.La(d.g);
          d.Va = function () {
            d.Va = null;
            u.xb();
          };
        }
      }
    };
    */
    u.Pf = function (a, b, c) {
      try {
        var d = u.Bo(),
          e = new fa(),
          f = w.ha();
        f.mc(n.A.fe.L());
        f.mc(n.A.Lh().ub);
        f.Db(n.A.sh.L());
        var g = n.Vf,
          k = n.Vr,
          l = f.Kg(),
          t = new xa(a, {
            iceServers: g,
            ij: k,
            state: e,
            version: 9,
            Ms: l,
            password: b,
            cn: d,
            gn: c,
            ds: u.Je,
          })/*,
          h = new jb()*/;
        console.log("Connecting to master...");
        /*
        h.ba("Connecting to master...");
        h.vh.onclick = function () {
          t.Ad = null;
          t.df = null;
          t.ia();
          u.xb();
        };
        x.La(h.g);
        */
        var m = function (a, b) {
          haxball.emit("joinRoomFailed", a);
            /*
            u.xb();
            var c = new Ka(a, b);
            c.Va = function () {
              u.xb();
            };
            x.La(c.g);
            */
          },
          p = function () {
            /*
            var a = new P("Connection Failed", "", ["Ok"]);
            a.Vd.innerHTML =
              "<p>Failed to connect to room host.</p><p>If this problem persists please see the <a href='https://github.com/haxball/haxball-issues/wiki/Connection-Issues' target='_blank'>troubleshooting guide</a>.</p>";
            a.Va = function () {
              u.xb();
            };
            x.La(a.g);
            */
            haxball.emit("joinRoomFailed", "Failed to connect to room host. If this problem persists please see the troubleshooting guide: https://github.com/haxball/haxball-issues/wiki/Connection-Issues");
          },
          r = function () {
            var b = new ba(t);
            /*
            t.dl = function (a) {
              b.j.pe.qr(((10 * t.sg.$g(0.5)) | 0) / 10);
              b.j.pe.or(((10 * t.sg.max()) | 0) / 10);
              b.j.pe.nl.tn(a);
            };
            */
            b.Bg = u.$h(a, !1);
            //x.La(b.j.g);
            b.j.de = function () {
              t.Ad = null;
              t.ia();
              b.ia();
              //u.xb();
              //haxball.emit("roomLeave");
            };
            t.Ad = function () {
              t.Ad = null;
              b.ia();
              var a = null == b.Ed ? null : b.Ed.stop();
              m(t.ek, a);
            };
            internalData.isHost = false;
            internalData.roomObj = b;
            internalData.roomPhysicsObj = e;
            haxball.emit("joinRoomSucceeded");
          };
        t.df = function (c) {
          t.df = null;
          t.Ad = null;
          switch (c.nb) {
            case 1:
              p();
              break;
            case 2:
              switch (c.reason) {
                case 4004:
                  u.no(a, function (c) {
                    u.Pf(a, b, c);
                  });
                  break;
                case 4101:
                  /*null == b ? u.Dh(a) : */m(xa.xh(c), null);
                  break;
                default:
                  m(xa.xh(c), null);
              }
              break;
            default:
              m(xa.xh(c), null);
          }
        };
        t.Ad = function (a) {
          switch (a) {
            case 1:
              console.log("Connecting to peer...");
              //h.ba("Connecting to peer...");
              break;
            case 2:
              console.log("Awaiting state...");
              //h.ba("Awaiting state...");
              break;
            case 3:
              r();
          }
        };
        t.Sp = function () {
          console.log("Trying reverse connection...");
          //h.ba("Trying reverse connection...");
        };
      } catch (ic) {
        haxball.emit("joinRoomFailed", ic instanceof q ? ic.Ta : ic);
        /*
        window.console.log(ic instanceof q ? ic.Ta : ic),
          (c = new P("Unexpected Error", "", [])),
          (c.Vd.innerHTML =
            "An error ocurred while attempting to join the room.<br><br>This might be caused by a browser extension, try disabling all extensions and refreshing the site.<br><br>The error has been printed to the inspector console."),
          x.La(c.g);
        */
      }
    };
    x.b = !0;
    /*
    x.ks = function () {
      try {
        //return window.self != window.top;
        return true;
      } catch (a) {
        return !0;
      }
    };
    x.Wg = function (a) {
      return new Promise(function (b, c) {
        var d = window.document.createElement("img");
        d.onload = function () {
          URL.revokeObjectURL(d.src);
          d.onload = null;
          b(d);
        };
        d.onerror = function () {
          URL.revokeObjectURL(d.src);
          c(null);
        };
        //return (d.src = URL.createObjectURL(
          //new Blob([a], { type: "image/png" })
        //));
        return (d.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="); // transparent 1 pixel PNG
      });
    };
    */
    x.fj = function (a) {
      //x.ks() &&
      //x.es(function () {
      kc.fj();
      var b;
      null == n.A.Me.L()
        ? (b = T.Fo().then(
            function (a) {
              n.A.Me.Xa(a);
            },
            function () {
              return {};
            }
          ))
        : (b = Promise.resolve(null));
      return Promise.all([
        /*
        M.L(
          "https://www.haxball.com/PFj3geCw/__cache_static__/g/res.dat",
          "arraybuffer"
        )
          .then(function (a) {
            a = new JSZip(a);
            //console.log("asdas");
            //n.Na = new Ub(a);
            return Promise.all([
              //n.Na.ro,
              x
                .Wg(a.file("images/grass.png").asArrayBuffer())
                .then(function (a) {
                  return (n.Ko = a);
                }),
              x
                .Wg(a.file("images/concrete.png").asArrayBuffer())
                .then(function (a) {
                  return (n.Vn = a);
                }),
              x
                .Wg(a.file("images/concrete2.png").asArrayBuffer())
                .then(function (a) {
                  return (n.Tn = a);
                }),
              x
                .Wg(a.file("images/typing.png").asArrayBuffer())
                .then(function (a) {
                  return (n.Dm = a);
                }),
            ]);
          })
          .catch((error) => console.log(error)),
        */
        b,
      ])/*.then(function () {
        x.us(a);
      })*/;
      //});
    };
    /*
    x.es = function (a) {
      for (
        var b = "Modernizr",
          c = "canvas datachannel dataview es6collections peerconnection promises websockets".split(" "),
          d = [],
          e = 0;
        e < c.length;
  
      ) {
        var f = c[e];
        ++e;
        //b[f] || d.push(f);
      }
      0 != d.length
        ? ((window.document.body.innerHTML = ""),
          (x.Pg = window.document.createElement("div")),
          window.document.body.appendChild(x.Pg),
          (a = new Wa(d)),
          x.La(a.g))
        : a();
    };
    x.us = function (a) {
      window.document.body.innerHTML = "";
      x.Pg = window.document.createElement("div");
      window.document.body.appendChild(x.Pg);
      var b = null,
        b = function () {
          //n.Na.Tl();
          window.document.removeEventListener("click", b, !0);
        };
      window.document.addEventListener("click", b, !0);
      a();
    };
    x.La = function (a) {
      null != x.Vm && x.Vm.remove();
      null != a && (x.Pg.appendChild(a), (x.Vm = a));
    };
    Vb.b = !0;
    Vb.prototype = {
      ia: function () {
        window.document.removeEventListener("keydown", G(this, this.Bd));
        window.document.removeEventListener("keyup", G(this, this.Cd));
        window.onbeforeunload = null;
        //window.cancelAnimationFrame(this.De);
        //window.clearInterval(this.Gh);
      },
      bf: function () {
        this.De = window.requestAnimationFrame(G(this, this.bf));
        this.ya.C();
        this.Kc();
      },
      Kc: function () {
        this.je.C();
        var a = window.performance.now();
        (1 == n.A.Fh.L() && 28.333333333333336 > a - this.$c) ||
          ((this.$c = a),
          //this.sd++,
          this.uf(n.A.Tb.L()),
          0 < this.ya.Fd || this.j.C(this.ya));
      },
      Bd: function (a) {
        switch (a.keyCode) {
          case 27:
            var b = this.j;
            b.me(!b.Gd);
            a.preventDefault();
            break;
          case 49:
            n.A.Tb.Xa(1);
            break;
          case 50:
            n.A.Tb.Xa(2);
            break;
          case 51:
            n.A.Tb.Xa(3);
            break;
          case 52:
            n.A.Tb.Xa(0);
        }
      },
      uf: function (a) {
        var b = this.j.Fb;
        0 >= a
          ? (b.Gg(!0), (b.Eb.kf = 1), (b.Eb.xf = 0))
          : (b.Gg(!1), (b.Eb.xf = 35), (b.Eb.kf = 1 + 0.25 * (a - 1)));
      },
      Cd: function () {},
      f: Vb,
    };
    */
    Fb.b = !0;
    Fb.prototype = {
      Pj: function () {
        this.w = U.Qc(this.w, 40);
        this.ub = U.Qc(this.ub, 3);
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
        if (30 < this.I || 30 < this.Xe) throw new q(null);
        this.Pj();
      },
      f: Fb,
    };
    va.b = !0;
    va.parse = function (a) {
      a.B();
      for (var b = []; 0 != a.o.byteLength - a.a; ) {
        var c = a.ie(a.Ob()),
          d = a.Cl(a.Ob());
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
    };
    va.js = function (a, b, c, d) {
      return Math.acos(
        Math.sin(a) * Math.sin(c) + Math.cos(a) * Math.cos(c) * Math.cos(b - d)
      );
    };
    va.Hs = function (a, b) {
      for (var c = a.Ec, d = a.Gc, e = 0; e < b.length; ) {
        var f = b[e];
        ++e;
        var g = f.vd;
        f.Le =
          6378 *
          va.js(
            0.017453292519943295 * g.Ec,
            0.017453292519943295 * g.Gc,
            0.017453292519943295 * c,
            0.017453292519943295 * d
          );
        isFinite(f.Le) || (f.Le = 22e3);
      }
    };
    va.get = function () {
      return M.L(n.Ee + "api/list", "arraybuffer").then(function (a) {
        return va.parse(new F(new DataView(a), !1));
      });
    };
    /*
    Z.b = !0;
    Z["delete"] = function (a) {
      return null == window.indexedDB
        ? Promise.reject("IndexedDB not supported by browser.")
        : new Promise(function (b, c) {
            var d = window.indexedDB.open("stadiums", 1);
            d.onblocked = d.onerror = c;
            d.onupgradeneeded = function (a) {
              var b = d.result;
              b.onerror = c;
              1 > a.oldVersion &&
                (b.createObjectStore("files", { autoIncrement: !0 }),
                b.createObjectStore("meta", { keyPath: "id" }));
            };
            d.onsuccess = function () {
              var e = d.result;
              e.onerror = c;
              var f = e.transaction(["meta", "files"], "readwrite");
              f.onerror = f.onabort = function (a) {
                c(a);
                e.close();
              };
              f.oncomplete = function () {
                b(0);
                e.close();
              };
              f.objectStore("files")["delete"](a);
              f.objectStore("meta")["delete"](a);
            };
          });
    };
    Z.get = function (a) {
      return null == window.indexedDB
        ? Promise.reject("IndexedDB not supported by browser.")
        : new Promise(function (b, c) {
            var d = window.indexedDB.open("stadiums", 1);
            d.onblocked = d.onerror = c;
            d.onupgradeneeded = function (a) {
              var b = d.result;
              b.onerror = c;
              1 > a.oldVersion &&
                (b.createObjectStore("files", { autoIncrement: !0 }),
                b.createObjectStore("meta", { keyPath: "id" }));
            };
            d.onsuccess = function () {
              var e = d.result;
              e.onerror = c;
              var f = e.transaction(["files"]);
              f.onerror = f.onabort = function (a) {
                c(a);
                e.close();
              };
              f.oncomplete = function () {
                e.close();
              };
              zb.eh(f.objectStore("files").get(a)).then(function (a) {
                try {
                  var d = new h();
                  d.Lk(a);
                  b(d);
                } catch (l) {
                  c(l instanceof q ? l.Ta : l);
                }
              }, c);
            };
          });
    };
    Z.getAll = function () {
      return null == window.indexedDB
        ? Promise.reject("IndexedDB not supported by browser.")
        : new Promise(function (a, b) {
            var c = window.indexedDB.open("stadiums", 1);
            c.onblocked = c.onerror = b;
            c.onupgradeneeded = function (a) {
              var d = c.result;
              d.onerror = b;
              1 > a.oldVersion &&
                (d.createObjectStore("files", { autoIncrement: !0 }),
                d.createObjectStore("meta", { keyPath: "id" }));
            };
            c.onsuccess = function () {
              var d = c.result;
              d.onerror = b;
              var e = d.transaction(["meta"]);
              e.onerror = e.onabort = function (a) {
                b(a);
                d.close();
              };
              e.oncomplete = function () {
                d.close();
              };
              zb.eh(e.objectStore("meta").getAll()).then(a, b);
            };
          });
    };
    Z.Es = function () {
      var a = window.navigator.storage;
      if (null == a || null == a.persist) return Promise.resolve(!1);
      try {
        return a
          .persisted()
          .then(function (b) {
            return b ? !0 : a.persist();
          })
          ["catch"](function () {
            return !1;
          });
      } catch (b) {
        return Promise.resolve(!1);
      }
    };
    Z.add = function (a) {
      return null == window.indexedDB
        ? Promise.reject("IndexedDB not supported by browser.")
        : new Promise(function (b, c) {
            var d = window.indexedDB.open("stadiums", 1);
            d.onblocked = d.onerror = c;
            d.onupgradeneeded = function (a) {
              var b = d.result;
              b.onerror = c;
              1 > a.oldVersion &&
                (b.createObjectStore("files", { autoIncrement: !0 }),
                b.createObjectStore("meta", { keyPath: "id" }));
            };
            d.onsuccess = function () {
              var e = d.result;
              e.onerror = c;
              var f = e.transaction(["files", "meta"], "readwrite");
              f.onerror = f.onabort = function (a) {
                c(a);
                e.close();
              };
              f.oncomplete = function () {
                b(0);
                e.close();
              };
              try {
                zb.eh(f.objectStore("files").add(a.se()))
                  .then(function (b) {
                    b = { name: a.w, id: b };
                    return zb.eh(f.objectStore("meta").add(b));
                  })
                  ["catch"](c);
              } catch (g) {
                c(0);
              }
            };
          });
    };
    Ub.b = !0;
    Ub.prototype = {
      Tl: function () {
        this.c.resume();
      },
      cd: function (a) {
        var b = this.c.createBufferSource();
        b.buffer = a;
        b.connect(this.ag);
        b.start();
      },
      im: function (a) {
        this.ag.gain.value = a;
      },
      f: Ub,
    };
    */
    Tb.b = !0;
    Tb.prototype = {
      update: function () {
        var a = window.performance.now(),
          b = a - this.Um;
        this.Um = a;
        this.ve += (this.dh - this.ve) * this.Js;
        this.Ef -= b;
        0 >= this.Ef && (this.Ef = this.dh = 0);
        0 >= this.dh &&
          0.05 > this.ve &&
          (window.clearInterval(this.gh), (this.gh = null), (this.ve = 0));
        this.Tg.gain.value = n.A.nm.L() ? this.ve : 0;
      },
      qj: function (a) {
        var b = this;
        this.dh = a;
        this.Ef = 166.66666666666666;
        null == this.gh &&
          ((this.gh = window.setInterval(function () {
            b.update();
          }, 17)),
          (this.Um = window.performance.now()));
      },
      connect: function (a) {
        this.Tg.connect(a);
      },
      Ls: function (a) {
        var b = a.K;
        if (null != b)
          if (2 == b.Bb) 0 >= b.Oa && this.qj(1);
          else if (1 == b.Bb) {
            var c = b.ta.F[0],
              d = null,
              e = null,
              f = null,
              g = 0,
              k = null,
              l = null,
              t = null,
              h = 0,
              m = p.fa.Ch,
              n = 0;
            for (a = a.I; n < a.length; ) {
              var q = a[n];
              ++n;
              if (null != q.H) {
                var r = q.H.a,
                  v = c.a,
                  u = r.x - v.x,
                  r = r.y - v.y,
                  u = u * u + r * r;
                if (q.ea == p.fa) {
                  if (null == d || d.a.x * m < q.H.a.x * m) d = q.H;
                  if (null == e || e.a.x * m > q.H.a.x * m) e = q.H;
                  if (null == f || u < g) (f = q.H), (g = u);
                } else if (q.ea == p.xa) {
                  if (null == k || k.a.x * m < q.H.a.x * m) k = q.H;
                  if (null == l || l.a.x * m > q.H.a.x * m) l = q.H;
                  if (null == t || u < h) (t = q.H), (h = u);
                }
              }
            }
            null != l &&
              null != e &&
              0 >= b.Oa &&
              (f.a.x > l.a.x && c.a.x > l.a.x && 20 < c.a.x && this.qj(0.3),
              t.a.x < e.a.x && c.a.x < e.a.x && -20 > c.a.x && this.qj(0.3));
          }
      },
      f: Tb,
    };
    ua.b = !0;
    ua.prototype = {
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
    };
    O.b = !0;
    O.Rd = [Ta];
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
        this.ta.J = this.S.J;
        this.ta.qa = this.S.qa;
        this.ta.U = this.S.U;
        this.ta.pb = this.S.pb;
        a = 0;
        for (var b = this.S.F; a < b.length; ) this.ta.F.push(b[a++].rp());
        this.Gk();
      },
      Ck: function (a) {
        if (a.ea == p.Ia) a.H = null;
        else {
          a.ob = 0;
          var b = a.H;
          null == b && ((b = new ca()), (b.playerId = a.V), (a.H = b), this.ta.F.push(b)); // assign playerId to disc
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
      C: function (a) {
        if (0 < this.Oa) 120 > this.Oa && this.Oa--;
        else {
          haxball.room._onGameTick();
          //var b = this.Ma.Os;
          //null != b && b();
          for (var b = this.Ma.I, c = 0; c < b.length; ) {
            var d = b[c];
            ++c;
            if (null != d.H) {
              0 == (d.ob & 16) && (d.Wb = !1);
              var e = this.S.ge;
              0 < d.Sc && d.Sc--;
              d.yc < this.Ma.ce && d.yc++;
              if (d.Wb && 0 >= d.Sc && 0 <= d.yc) {
                for (var f = !1, g = 0, k = this.ta.F; g < k.length; ) {
                  var l = k[g];
                  ++g;
                  if (0 != (l.v & 64) && l != d.H) {
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
                  }
                }
                f &&
                  (null != this.Ma.ji && this.Ma.ji(d),
                  haxball.room._onPlayerBallKick(d?.V),
                  (d.Wb = !1),
                  (d.Sc = this.Ma.yd),
                  (d.yc -= this.Ma.Zc));
              }
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
          this.ta.C(a);
          if (0 == this.Bb) {
            for (a = 0; a < b.length; )
              (c = b[a]), ++a, null != c.H && (c.H.h = 39 | this.ae.cp);
            b = this.ta.F[0].D;
            0 < b.x * b.x + b.y * b.y && (this.Bb = 1);
          } else if (1 == this.Bb) {
            this.Hc += 0.016666666666666666;
            for (a = 0; a < b.length; )
              (d = b[a]), ++a, null != d.H && (d.H.h = 39);
            d = p.Ia;
            b = this.ta.F;
            for (
              a = 0;
              a < c &&
              ((d = a++), (d = this.S.Kn(b[O.dk[d]].a, O.Yk[d])), d == p.Ia);
  
            );
            d != p.Ia
              ? ((this.Bb = 2),
                (this.vc = 150),
                (this.ae = d),
                d == p.fa ? this.Kb++ : this.Pb++,
                /*null != this.Ma.Ni && (
                  this.Ma.Ni(d.pg), */
                  haxball.room._onTeamGoal(d?.pg?.$) // teamId
                /*
                )
                */
                ,
                null != this.Ma.Ol && this.Ma.Ol(d.$))
              : 0 < this.Da &&
                this.Hc >= 60 * this.Da &&
                this.Pb != this.Kb &&
                (/*null != this.Ma.Pi && this.Ma.Pi(), */this.um());
          } else if (2 == this.Bb)
            this.vc--,
              0 >= this.vc &&
                ((0 < this.ib && (this.Pb >= this.ib || this.Kb >= this.ib)) ||
                (0 < this.Da && this.Hc >= 60 * this.Da && this.Pb != this.Kb)
                  ? this.um()
                  : (this.Gk(), null != this.Ma.lq && this.Ma.lq()));
          else if (
            3 == this.Bb &&
            (this.vc--, 0 >= this.vc && ((b = this.Ma), null != b.K))
          ) {
            b.K = null;
            a = 0;
            for (c = b.I; a < c.length; )
              (d = c[a]), ++a, (d.H = null), (d.Jb = 0);
            //null != b.vf && b.vf(null);
            haxball.room._onGameStop(null);
          }
        }
      },
      um: function () {
        this.vc = 300;
        this.Bb = 3;
        /*null != this.Ma.Oi && (
          this.Ma.Oi(this.Pb > this.Kb ? p.fa : p.xa), */
          haxball.room._onGameEnd(this.Pb > this.Kb ? p.fa.$ : p.xa.$);// winningTeamId
        /*
        );
        */
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
        var a = ya.zc,
          b = this.gc;
        this.hc != a &&
          (null == b && (this.gc = b = new O()), (this.hc = a), O.qd(b, this));
        return b;
      },
      f: O,
    };
    sb.b = !0;
    sb.prototype = {
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
    Bb.b = !0;
    Bb.prototype = { f: Bb };
    h.b = !0;
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
      if (null != a.trait) {
        var c = b[r.G(a.trait, String)];
        if (null != c)
          for (var d = 0, e = ec.Mm(c); d < e.length; ) {
            var f = e[d];
            ++d;
            null == a[f] && (a[f] = c[f]);
          }
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
      a = r.G(a, Array);
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
      if ("string" == typeof a) return K.parseInt("0x" + K.ye(a));
      if (a instanceof Array && null == a.eb)
        return ((a[0] | 0) << 16) + ((a[1] | 0) << 8) + (a[2] | 0);
      throw new q("Bad color");
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
      b.a.x = r.G(a.x, z);
      b.a.y = r.G(a.y, z);
      var c = a.bCoef;
      null != c && (b.m = r.G(c, z));
      c = a.cMask;
      null != c && (b.h = h.Fc(c));
      a = a.cGroup;
      null != a && (b.v = h.Fc(a));
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
    h.mp = function (a, b) {
      var c = new E(),
        d = r.G(a.v1, Pb);
      c.W = b[r.G(a.v0, Pb)];
      c.ca = b[d];
      var d = a.bias,
        e = a.bCoef,
        f = a.curve,
        g = a.curveF,
        k = a.vis,
        l = a.cMask,
        t = a.cGroup,
        m = a.color;
      null != d && (c.Cc = r.G(d, z));
      null != e && (c.m = r.G(e, z));
      null != g ? (c.vb = r.G(g, z)) : null != f && c.Oc(r.G(f, z));
      null != k && (c.Za = r.G(k, oc));
      null != l && (c.h = h.Fc(l));
      null != t && (c.v = h.Fc(t));
      null != m && (c.R = h.$f(m));
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
        d = r.G(a.d0, Pb),
        e = r.G(a.d1, Pb),
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
        : k instanceof Array && null == k.eb
        ? ((c.Hb = r.G(k[0], z)), (c.ec = r.G(k[1], z)))
        : (c.ec = c.Hb = r.G(k, z));
      c.ne = null == g || "rigid" == g ? 1 / 0 : r.G(g, z);
      null != f && (c.R = h.$f(f));
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
        c = r.G(a.normal, Array),
        d = r.G(c[0], z),
        c = r.G(c[1], z),
        e = b.wa,
        f = Math.sqrt(d * d + c * c);
      e.x = d / f;
      e.y = c / f;
      b.Ua = r.G(a.dist, z);
      d = a.bCoef;
      c = a.cMask;
      a = a.cGroup;
      null != d && (b.m = r.G(d, z));
      null != c && (b.h = h.Fc(c));
      null != a && (b.v = h.Fc(a));
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
        c = r.G(a.p0, Array),
        d = r.G(a.p1, Array),
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
          throw new q("Bad team value");
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
      null != c && (b.m = r.G(c, z));
      null != d && (b.aa = r.G(d, z));
      null != e && (b.Ca = r.G(e, z));
      null != f && (b.Ce = r.G(f, z));
      null != g && (b.Te = r.G(g, z));
      null != k && (b.Ue = r.G(k, z));
      null != l && (b.Re = r.G(l, z));
      null != t &&
        ((c = b.oa), (d = r.G(t[1], z)), (c.x = r.G(t[0], z)), (c.y = d));
      null != m && (b.v = h.Fc(m));
      null != n && (b.Z = r.G(n, z));
      null != a && (b.Se = r.G(a, z));
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
      null != f && (b.Z = r.G(f, z));
      null != g && (b.m = r.G(g, z));
      null != k && (b.aa = r.G(k, z));
      null != l && (b.Ca = r.G(l, z));
      null != t && (b.R = h.$f(t));
      null != m && (b.h = h.Fc(m));
      null != n && (b.v = h.Fc(n));
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
        return null != a ? r.G(a, z) : c;
      },
      op: function (a, b, c) {
        a = a[b];
        return null != a ? r.G(a, oc) : c;
      },
      se: function () {
        return JSON.stringify(this.Hr());
      },
      Hr: function () {
        if (!this.Lf) throw new q(0);
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
          var b = r.G(a[0], z);
          a = r.G(a[1], z);
          return new H(b, a);
        }
        function c(a, b, c, d) {
          null == d && (d = !1);
          var f = e[b];
          if (!d || null != f)
            if (((d = r.G(f, Array)), null != d))
              for (f = 0; f < d.length; ) {
                var k = d[f];
                ++f;
                try {
                  h.wn(k, g), a.push(c(k));
                } catch (wc) {
                  throw new q(new Bb('Error in "' + b + '" index: ' + a.length));
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
        this.w = r.G(e.name, String);
        this.$b = r.G(e.width, z);
        this.qc = r.G(e.height, z);
        this.Ye = this.be(e, "maxViewWidth", 0) | 0;
        "player" == e.cameraFollow && (this.Ge = 1);
        this.kc = 200;
        a = e.spawnDistance;
        null != a && (this.kc = r.G(a, z));
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
        var g = e.traits;
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
          255 < this.F.length
        )
          throw new q("Error");
        this.he();
      },
      Sj: function () {
        var a = h.Fr;
        a.a = 0;
        this.ga(a);
        var b = new dc();
        b.Yr(a.Sb());
        b.hash = (b.hash += b.hash << 3) ^ (b.hash >>> 11);
        b.hash += b.hash << 15;
        return b.hash | 0;
      },
      Kn: function (a, b) {
        for (var c = 0, d = this.tc; c < d.length; ) {
          var e = d[c];
          ++c;
          var f = e.W,
            g = e.ca,
            k = b.x - a.x,
            l = b.y - a.y;
          0 < -(f.y - a.y) * k + (f.x - a.x) * l ==
          0 < -(g.y - a.y) * k + (g.x - a.x) * l
            ? (f = !1)
            : ((k = g.x - f.x),
              (g = g.y - f.y),
              (f =
                0 < -(a.y - f.y) * k + (a.x - f.x) * g ==
                0 < -(b.y - f.y) * k + (b.x - f.x) * g
                  ? !1
                  : !0));
          if (f) return e.qe;
        }
        return p.Ia;
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
      f: h,
    };
    internalData.mapObj = h;
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
        if (3 < b) throw new q("too many");
        this.fb = [];
        for (var c = 0; c < b; ) ++c, this.fb.push(a.M());
      },
      f: ka,
    };
    p.b = !0;
    p.prototype = { f: p };
    fa.b = !0;
    fa.Rd = [Ta, cc];
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
          /*this.K.Ma.Os = haxball.room?._onGameTick;*/
          //null != this.Ki && this.Ki(a);
        }
      },
      Mf: function (a, b, c) {
        if (b.ea != c) {
          b.ea = c;
          D.remove(this.I, b);
          this.I.push(b);
          if (null != this.K) {
            null != b.H && (D.remove(this.K.ta.F, b.H), (b.H = null));
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
          }
          //Cb.i(this.xl, a, b, c);
        }
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
        b && ((this.K = new O()), this.K.ja(a, this)/*, this.K.Ma.Os = haxball.room?._onGameTick*/);// gameTick event...

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
        y.i(this.ko, this.uk() != a);
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
        //vb.i(this.Hk, a, this.yd, this.Zc, d);
      },
      sc: function () {
        var a = ya.zc,
          b = this.gc;
        this.hc != a &&
          (null == b && (this.gc = b = new fa()), (this.hc = a), fa.qd(b, this));
        return b;
      },
      f: fa,
    };
    ea.b = !0;
    ea.Rd = [Ta];
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
        a.H.playerId = a.V;   // c = discId -> disc[discId].playerId = playerId
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
        var a = ya.zc,
          b = this.an;
        this.zc != a &&
          (null == b && (this.an = b = new ea()), (this.zc = a), ea.$r(b, this));
        return b;
      },
      f: ea,
    };
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
        null != b && this.Yg != b.Ld && ((b.Ld = this.Yg)/*, y.i(a.sl, b)*/, (
        haxball.room._onPlayerSyncChange(b?.V, this.Yg))); // id, sync
      },
      ua: function (a) {
        a.l(this.Yg ? 1 : 0);
      },
      va: function (a) {
        this.Yg = 0 != a.B();
      },
      f: ta,
    });
    rb.b = !0;
    rb.la = function (a, b, c, d) {
      var c = new rb();
      c.Tc = a;
      c.color = b;
      c.style = c;
      c.fn = d;
      return c;
    };
    rb.ma = m;
    rb.prototype = C(m.prototype, {
      apply: function (a) {
        0 == this.P && (/*vb.i(a.Vl, this.Tc, this.color, this.style, this.fn),*/
          haxball.room._onAnnouncement(this.Tc, this.color, this.style, this.fn) // msg, color, style, sound
        );
      },
      ua: function (a) {
        a.mc(U.Qc(this.Tc, 1e3));
        a.O(this.color);
        a.l(this.style);
        a.l(this.fn);
      },
      va: function (a) {
        this.Tc = a.ic();
        if (1e3 < this.Tc.length) throw new q("message too long");
        this.color = a.M();
        this.style = a.B();
        this.fn = a.B();
      },
      f: rb,
    });
    internalData.announcementObj = rb;
    Qa.b = !0;
    Qa.ma = m;
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
              ? 2 > c || (a.Mf(b, d[0], p.fa), a.Mf(b, d[1], p.xa), haxball.room._onAutoTeams2(d[0].V, p.fa.$, d[1].V, p.xa.$, this.P))
              : (t = f > e ? p.fa : p.xa, a.Mf(b, d[0], t), haxball.room._onAutoTeams1(d[0].V, t.$, this.P)));
        }
      },
      ua: function () {},
      va: function () {},
      f: Qa,
    });
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
              haxball.room._onScoreLimitChange(this.newValue, this.P);
              break;
            case 1:
              (b = this.newValue), (a.Da = 0 > b ? 0 : 99 < b ? 99 : b), haxball.room._onTimeLimitChange(this.newValue, this.P);
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
      f: da,
    });
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
            ((c.cb = this.Xg)/*, (null != a.ii && a.ii(b, c))*/, 
            haxball.room._onPlayerAdminChange(c?.V, c?.cb, b?.V)); // id, isAdmin, byId
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
      f: sa,
    });
    internalData.adminChangerObj = sa;
    ra.b = !0;
    ra.la = function (a) {
      var b = new ra();
      b.Zb = a;
      return b;
    };
    ra.ma = m;
    ra.prototype = C(m.prototype, {
      apply: function (a) {
        a = a.na(this.P);
        null != a && (a.Xb = this.Zb, haxball.room._onPlayerAvatarChange(this.P, this.Zb));
      },
      ua: function (a) {
        a.Db(this.Zb);
      },
      va: function (a) {
        this.Zb = a.zb();
        null != this.Zb && (this.Zb = U.Qc(this.Zb, 2));
      },
      f: ra,
    });
    internalData.avatarChangerObj = ra;
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
          (d = d || (b == c && !a.Pc && null == a.K)) && (a.Mf(c, b, this.jj),
          haxball.room._onPlayerTeamChange(this.Md, this.jj.$, this.P)); // id, teamId, byId
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
      f: S,
    });
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
          null == a.K && ((a.S = this.Pd), /*(null != a.Ii && a.Ii(b, this.Pd)), */
          haxball.room._onStadiumChange(this.Pd, b?.V)); // map, byId
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
      f: qa,
    });
    Pa.b = !0;
    Pa.ma = m;
    Pa.prototype = C(m.prototype, {
      apply: function (a) {
        a.Lb(this.P, 2) && this.ea != p.Ia && (a.kb[this.ea.$] = this.Sg);
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
      f: Pa,
    });
    pa.b = !0;
    pa.la = function (a) {
      var b = new pa();
      b.newValue = a;
      return b;
    };
    pa.ma = m;
    pa.prototype = C(m.prototype, {
      apply: function (a) {
        a.Lb(this.P, 2) && (a.Pc = this.newValue) && haxball.room._onTeamsLockChange(this.newValue, this.P);
      },
      ua: function (a) {
        a.l(this.newValue ? 1 : 0);
      },
      va: function (a) {
        this.newValue = 0 != a.B();
      },
      f: pa,
    });
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
      apply: function (a) {
        if (0 == this.P) {
          var b = new ea();
          b.V = this.V;
          b.w = this.name;
          b.Kd = this.cj;
          b.Xb = this.Xb;
          b.conn = this.conn;
          b.auth = this.auth; // store auth
          a.I.push(b);
          /*
          a = a.tl;
          null != a && a(b);
          */
          haxball.room._onPlayerJoin(this.V, this.name, this.cj, this.Xb, this.conn, this.auth); // id, name, flag, avatar, conn, auth
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
      f: oa,
    });
    qb.b = !0;
    qb.ma = m;
    qb.prototype = C(m.prototype, {
      apply: function (a) {
        a = a.na(this.ze);
        null != a && 0 == this.P && (a.Jd = this.Zb);
      },
      ua: function (a) {
        a.Db(this.Zb);
        a.O(this.ze);
      },
      va: function (a) {
        this.Zb = a.zb();
        this.ze = a.M();
        null != this.Zb && (this.Zb = U.Qc(this.Zb, 2));
      },
      f: qb,
    });
    Oa.b = !0;
    Oa.ma = m;
    Oa.prototype = C(m.prototype, {
      apply: function (a) {
        var b = a.K;
        if (null != b && a.Lb(this.P, 16)) {
          var c = a.na(this.P),
            d = 120 == b.Oa,
            e = 0 < b.Oa;
          this.Bf ? (b.Oa = 120) : 120 == b.Oa && (b.Oa = 119);
          //console.log(a); // FIX ME: a.hc!=-1 at latest call.
          d != this.Bf && (/*Cb.i(a.ml, c, this.Bf, e), */
          a.hc>0 && haxball.room._onGamePauseChange(this.Bf, c?.V)); // paused, byId
        }
      },
      ua: function (a) {
        a.l(this.Bf ? 1 : 0);
      },
      va: function (a) {
        this.Bf = 0 != a.B();
      },
      f: Oa,
    });
    Na.b = !0;
    Na.ma = m;
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
        null != b && (/*ia.i(a.rl, b, this.Tc), */
        haxball.room._onPlayerChat(this.P, this.Tc)); // id, message
      },
      ua: function (a) {
        a.mc(U.Qc(this.Tc, 140));
      },
      va: function (a) {
        this.Tc = a.ic();
        if (140 < this.Tc.length) throw new q("message too long");
      },
      f: Na,
    });
    internalData.chatObj = Na;
    Ga.b = !0;
    Ga.ma = m;
    Ga.prototype = C(m.prototype, {
      apply: function (a) {
        var b = a.na(this.P);
        if (null != b) {
          var c = this.input;
          0 == (b.ob & 16) && 0 != (c & 16) && (b.Wb = !0);
          b.ob = c;
          null != a.iq && a.iq(b);
          haxball.room._onPlayerInputChange(this.P, c);
        }
      },
      ua: function (a) {
        a.tb(this.input);
      },
      va: function (a) {
        this.input = a.hb();
      },
      f: Ga,
    });
    na.b = !0;
    na.la = function (a) {
      var b = new na();
      b.sj = a;
      return b;
    };
    na.ma = m;
    na.prototype = C(m.prototype, {
      apply: function (a) {
        var b = a.na(this.P);
        null != b && (/*ia.i(a.wl, b, this.sj), */
        haxball.room._onPlayerChatIndicatorChange(b?.V, !this.sj)); // id, value
      },
      ua: function (a) {
        a.l(this.sj);
      },
      va: function (a) {
        this.sj = a.B();
      },
      f: na,
    });
    internalData.chatIndicatorObj = na;
    kc.b = !0;
    kc.fj = function () {
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
    };
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
            vb.i(a.ul, b, this.fd, this.Qg, c);
            haxball.room._onPlayerLeave(b.V, this.fd, this.Qg, c?.V); // id, reason, isBanned, byId
          }
        }
      },
      ua: function (a) {
        null != this.fd && (this.fd = U.Qc(this.fd, 100));
        a.O(this.V);
        a.Db(this.fd);
        a.l(this.Qg ? 1 : 0);
      },
      va: function (a) {
        this.V = a.M();
        this.fd = a.zb();
        this.Qg = 0 != a.B();
        if (null != this.fd && 100 < this.fd.length)
          throw new q("string too long");
      },
      f: Y,
    });
    internalData.kickerObj = Y;
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
      f: pb,
    });
    ob.b = !0;
    ob._Kf_ = function(a, b, c) {
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
          var b = a.K;
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
              haxball.room._onSetDiscProperties(this.ze, this.Sm, this.Ka, this.Rc)); // id, type, data1, data2
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
      f: ob,
    });
    internalData.discPropertiesObj = ob;
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
        a.Lb(this.P, 2) && (a.mr(a.na(this.P), this.min, this.nj, this.aj), 
        haxball.room._onKickRateLimitChange(this.min, this.nj, this.aj, this.P)); // min, rate, burst, byId
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
      f: ma,
    });
    internalData.kickRateLimitObj = ob;
    Ma.b = !0;
    Ma.ma = m;
    Ma.prototype = C(m.prototype, {
      apply: function (a) {
        a.Lb(this.P, 32) && (a.yr(a.na(this.P), 0), 
        haxball.room._onGameStart(this.P)); // byId
      },
      ua: function () {},
      va: function () {},
      f: Ma,
    });
    La.b = !0;
    La.ma = m;
    La.prototype = C(m.prototype, {
      apply: function (a) {
        if (a.Lb(this.P, 32)) {
          var b = a.na(this.P);
          if (null != a.K) {
            a.K = null;
            for (var c = 0, d = a.I; c < d.length; ) {
              var e = d[c];
              ++c;
              e.H = null;
              e.Jb = 0;
            }
            internalData.roomObj?.ob.al();
            //null != a.vf && a.vf(b);
            haxball.room._onGameStop(b?.V);  //byId
          }
        }
      },
      ua: function () {},
      va: function () {},
      f: La,
    });
    la.b = !0;
    la.la = function (a) {
      for (var b = new la(), c = a.T.I, d = [], e = 0; e < c.length; ) {
        var f = a.Ie.get(c[e++].V);
        d.push(null == f ? (haxball?.room?.hostPing || 0) : f.yb);
      }
      b.we = d;
      return b;
    };
    la.ma = m;
    la.prototype = C(m.prototype, {
      apply: function (a) {
        if (0 == this.P) {
          a = a.I;
          for (var b = 0, c = a.length; b < c; ) {
            var d = b++;
            if (d >= this.we.length) break;
            a[d].yb = this.we[d];
          }
          haxball.room?._onPingData(this.we); // ping array
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
      f: la,
    });
    ca.b = !0;
    ca.Rd = [Ta];
    ca.qd = function (a, b) {
      a.Z = b.Z;
      a.m = b.m;
      a.aa = b.aa;
      a.Ca = b.Ca;
      a.R = b.R;
      a.Mj = b.Mj;
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
    ca.prototype = {
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
      Pn: function (a) {
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
            (haxball.room._onCollisionDiscVsDisc(this.v, this.playerId, oldA.v, oldA.playerId))); // discId1, discPlayerId1, discId2, discPlayerId2
        }
      },
      Qn: function (a, id1, id2) {
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
            (haxball.room._onCollisionDiscVsSegment(id1, this.playerId, id2-1)))); // discId, discPlayerId, segmentId
      },
      sc: function () {
        var a = ya.zc,
          b = this.gc;
        this.hc != a &&
          (null == b && (this.gc = b = new ca()), (this.hc = a), ca.qd(b, this));
        return b;
      },
      f: ca,
    };
    nb.b = !0;
    nb.Rd = [Ta];
    nb.prototype = {
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
      f: nb,
    };
    Fa.b = !0;
    Fa.Rd = [Ta];
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
    Fa.prototype = {
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
      C: function (a) {
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
            (f = this.F[d++]), 0 != (f.h & c.v) && 0 != (f.v & c.h) && c.Pn(f);
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
                    (haxball.room._onCollisionDiscVsPlane(id, c.playerId, d-1))); // discId, discPlayerId, planeId
                }
              }
            d = 0;
            for (e = this.U; d < e.length; )
              (f = e[d]), ++d, 0 != (f.h & c.v) && 0 != (f.v & c.h) && c.Qn(f, id, d); // id, d
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
      sc: function () {
        var a = ya.zc,
          b = this.gc;
        this.hc != a &&
          (null == b && (this.gc = b = new Fa()), (this.hc = a), Fa.qd(b, this));
        return b;
      },
      f: Fa,
    };
    L.b = !0;
    L.prototype = {
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
    };
    E.b = !0;
    E.prototype = {
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
      Oc: function (a) {
        a *= 0.017453292519943295;
        if (0 > a) {
          a = -a;
          var b = this.W;
          this.W = this.ca;
          this.ca = b;
          this.Cc = -this.Cc;
        }
        a > E.mn && a < E.ln && (this.vb = 1 / Math.tan(a / 2));
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
      f: E,
    };
    B.b = !0;
    B.prototype = {
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
    };
    /*
    N.b = !0;
    N.lc = function (a) {
      return (
        "rgba(" +
        [(a & 16711680) >>> 16, (a & 65280) >>> 8, a & 255].join() +
        ",255)"
      );
    };
    N.Gi = function (a, b) {
      a.imageSmoothingEnabled = b;
      a.mozImageSmoothingEnabled = b;
    };
    N.prototype = {
      Po: function (a, b) {
        var c = this.dd.get(a.V);
        if (null != c)
          switch (b) {
            case 0:
              c.Xf = !0;
              break;
            case 1:
              c.Xf = !1;
          }
      },
      Pr: function () {
        if (null != this.sa.parentElement) {
          var a = window.devicePixelRatio * this.zg,
            b = this.sa.getBoundingClientRect(),
            c = Math.round(b.width * a),
            a = Math.round(b.height * a);
          if (this.sa.width != c || this.sa.height != a)
            (this.sa.width = c), (this.sa.height = a);
        }
      },
      Kc: function (a, b) {
        var c = window.performance.now(),
          d = (c - this.$c) / 1e3;
        this.$c = c;
        this.Jg.clear();
        this.Pr();
        N.Gi(this.c, !0);
        this.c.resetTransform();
        if (null != a.K) {
          var c = a.K,
            e = c.ta,
            f = a.na(b),
            g = null != f ? f.H : null,
            k =
              0 != this.jf
                ? this.sa.height / this.jf
                : this.kf * window.devicePixelRatio * this.zg,
            h = this.xf * this.zg,
            m = c.S.Ye,
            n = this.sa.width / k;
          0 < m && n > m && ((n = m), (k = this.sa.width / m));
          m = (this.sa.height - h) / k;
          this.Mr(c, g, n, m, d);
          for (var p = 0, q = a.I; p < q.length; ) {
            var r = q[p];
            ++p;
            if (null != r.H) {
              var u = this.dd.get(r.V);
              null == u && ((u = new Ea()), this.dd.set(r.V, u));
              u.C(r, a);
              this.Jg.set(r.H, u);
            }
          }
          this.c.translate(this.sa.width / 2, (this.sa.height + h) / 2);
          this.c.scale(k, k);
          this.c.translate(-this.Ya.x, -this.Ya.y);
          this.c.lineWidth = 3;
          this.Sq(c.S);
          this.Rq(c.S);
          k = e.F;
          h = 0;
          for (p = e.pb; h < p.length; ) this.Mq(p[h++], k);
          this.Lq(a, n, m);
          this.Nq(a, f);
          null != g && this.Pq(g.a);
          this.c.lineWidth = 2;
          f = 0;
          for (g = a.I; f < g.length; )
            (n = g[f]), ++f, (m = n.H), null != m && this.Ll(m, this.dd.get(n.V));
          f = 0;
          for (e = e.F; f < e.length; )
            (g = e[f]), ++f, null == this.Jg.get(g) && this.Ll(g, null);
          this.c.lineWidth = 3;
          this.c.resetTransform();
          this.c.translate(this.sa.width / 2, this.sa.height / 2);
          this.Oq(c);
          0 >= c.Oa && (this.td.C(d), this.td.Kc(this.c)); // !!!!
          this.Jg.clear();
          this.Kq(a);
        }
      },
      Kq: function (a) {
        var b = new Set(),
          c = 0;
        for (a = a.I; c < a.length; ) b.add(a[c++].V);
        c = this.dd.keys();
        for (a = c.next(); !a.done; ) {
          var d = a.value;
          a = c.next();
          if (!b.has(d)) this.dd["delete"](d);
        }
      },
      Mr: function (a, b, c, d, e) {
        var f, g;
        if (null != b && 1 == a.S.Ge) (g = b.a), (f = g.x), (g = g.y);
        else if (((g = a.ta.F[0].a), (f = g.x), (g = g.y), null != b)) {
          var k = b.a;
          f = 0.5 * (f + k.x);
          g = 0.5 * (g + k.y);
          var h = 0.5 * c,
            m = 0.5 * d;
          b = k.x - h + 50;
          var n = k.y - m + 50,
            h = k.x + h - 50,
            k = k.y + m - 50;
          f = f > h ? h : f < b ? b : f;
          g = g > k ? k : g < n ? n : g;
        }
        n = 60 * e;
        1 < n && (n = 1);
        b = e = this.Ya;
        n *= 0.04;
        h = b.x;
        b = b.y;
        e.x = h + (f - h) * n;
        e.y = b + (g - b) * n;
        this.Xn(c, d, a.S);
      },
      Xn: function (a, b, c) {
        a > 2 * c.$b
          ? (this.Ya.x = 0)
          : this.Ya.x + 0.5 * a > c.$b
          ? (this.Ya.x = c.$b - 0.5 * a)
          : this.Ya.x - 0.5 * a < -c.$b && (this.Ya.x = -c.$b + 0.5 * a);
        b > 2 * c.qc
          ? (this.Ya.y = 0)
          : this.Ya.y + 0.5 * b > c.qc
          ? (this.Ya.y = c.qc - 0.5 * b)
          : this.Ya.y - 0.5 * b < -c.qc && (this.Ya.y = -c.qc + 0.5 * b);
      },
      Pq: function (a) {
        this.c.beginPath();
        this.c.strokeStyle = "white";
        this.c.globalAlpha = 0.3;
        this.c.arc(a.x, a.y, 25, 0, 2 * Math.PI, !1);
        this.c.stroke();
        this.c.globalAlpha = 1;
      },
      Oq: function (a) {
        var b = 0 < a.Oa;
        this.lr(b);
        b &&
          (120 != a.Oa &&
            ((a = (a.Oa / 120) * 200),
            (this.c.fillStyle = "white"),
            this.c.fillRect(0.5 * -a, 100, a, 20)),
          this.td.eq.Tq(this.c));
      },
      lr: function (a) {
        this.Dk != a &&
          ((this.sa.style.filter = a ? "grayscale(70%)" : ""), (this.Dk = a));
      },
      Wl: function (a, b, c, d, e, f) {
        d = b + d;
        e = c + e;
        a.beginPath();
        a.moveTo(d - f, c);
        a.arcTo(d, c, d, c + f, f);
        a.lineTo(d, e - f);
        a.arcTo(d, e, d - f, e, f);
        a.lineTo(b + f, e);
        a.arcTo(b, e, b, e - f, f);
        a.lineTo(b, c + f);
        a.arcTo(b, c, b + f, c, f);
        a.closePath();
      },
      Sq: function (a) {
        var b = this;
        N.Gi(this.c, !1);
        var c = a.Td,
          d = a.Sd;
        if (1 == a.ld)
          this.c.save(),
            this.c.resetTransform(),
            (this.c.fillStyle = N.lc(a.jd)),
            this.c.fillRect(0, 0, this.sa.width, this.sa.height),
            this.c.restore(),
            (this.c.strokeStyle = "#C7E6BD"),
            (this.c.fillStyle = this.Lo),
            this.Wl(this.c, -c, -d, 2 * c, 2 * d, a.Uc),
            this.c.save(),
            this.c.scale(2, 2),
            this.c.fill(),
            this.c.restore(),
            this.c.moveTo(0, -d),
            this.c.lineTo(0, d),
            this.c.stroke(),
            this.c.beginPath(),
            this.c.arc(0, 0, a.kd, 0, 2 * Math.PI),
            this.c.stroke();
        else if (2 == a.ld) {
          this.c.strokeStyle = "#E9CC6E";
          this.c.save();
          this.c.beginPath();
          this.c.rect(this.Ya.x - 1e4, this.Ya.y - 1e4, 2e4, 2e4);
          this.c.scale(2, 2);
          this.c.fillStyle = this.Un;
          this.c.fill();
          this.c.restore();
          this.c.save();
          this.Wl(this.c, -c, -d, 2 * c, 2 * d, a.Uc);
          this.c.scale(2, 2);
          this.c.fillStyle = this.Wn;
          this.c.fill();
          this.c.restore();
          this.c.stroke();
          this.c.beginPath();
          this.c.moveTo(0, -d);
          this.c.setLineDash([15, 15]);
          this.c.lineTo(0, d);
          this.c.stroke();
          this.c.setLineDash([]);
          var e = a.Fe,
            c = c - e;
          e < a.Uc && (c = 0);
          e = function (c, e, h) {
            b.c.beginPath();
            b.c.strokeStyle = c;
            b.c.arc(0, 0, a.kd, -1.5707963267948966, 1.5707963267948966, h);
            0 != e && (b.c.moveTo(e, -d), b.c.lineTo(e, d));
            b.c.stroke();
          };
          e("#85ACF3", c, !1);
          e("#E18977", -c, !0);
        } else
          this.c.save(),
            this.c.resetTransform(),
            (this.c.fillStyle = N.lc(a.jd)),
            this.c.fillRect(0, 0, this.sa.width, this.sa.height),
            this.c.restore();
        N.Gi(this.c, !0);
      },
      Nq: function (a, b) {
        for (var c = n.A.Ak.L(), d = 0, e = a.I; d < e.length; ) {
          var f = e[d];
          ++d;
          var g = f.H;
          if (null != g) {
            var g = g.a,
              h = this.dd.get(f.V);
            c && h.Xf && this.c.drawImage(n.Dm, g.x - 0.5 * n.Dm.width, g.y - 35);
            f != b && h.so(this.c, g.x, g.y + 50);
          }
        }
      },
      Ll: function (a, b) {
        this.c.beginPath();
        null == b
          ? ((this.c.fillStyle = N.lc(a.R)), (this.c.strokeStyle = "black"))
          : ((this.c.fillStyle = b.Ij), (this.c.strokeStyle = b.lo));
        this.c.beginPath();
        this.c.arc(a.a.x, a.a.y, a.Z, 0, 2 * Math.PI, !1);
        if (null != b) {
          this.c.save();
          var c = a.Z / 32;
          this.c.translate(a.a.x, a.a.y);
          this.c.scale(c, c);
          this.c.translate(-32, -32);
          this.c.fill();
          this.c.restore();
        } else -1 != (a.R | 0) && this.c.fill();
        this.c.stroke();
      },
      Rq: function (a) {
        if (null != a) {
          var b = 0;
          for (a = a.U; b < a.length; ) this.Qq(a[b++]);
        }
      },
      Mq: function (a, b) {
        if (!(0 > a.R)) {
          this.c.beginPath();
          this.c.strokeStyle = N.lc(a.R);
          var c = b[a.Yd],
            d = b[a.Zd];
          null != c &&
            null != d &&
            ((c = c.a),
            (d = d.a),
            this.c.moveTo(c.x, c.y),
            this.c.lineTo(d.x, d.y),
            this.c.stroke());
        }
      },
      Qq: function (a) {
        if (a.Za) {
          this.c.beginPath();
          this.c.strokeStyle = N.lc(a.R);
          var b = a.W.a,
            c = a.ca.a;
          if (0 != 0 * a.vb) this.c.moveTo(b.x, b.y), this.c.lineTo(c.x, c.y);
          else {
            a = a.Xd;
            var d = b.x - a.x,
              b = b.y - a.y;
            this.c.arc(
              a.x,
              a.y,
              Math.sqrt(d * d + b * b),
              Math.atan2(b, d),
              Math.atan2(c.y - a.y, c.x - a.x)
            );
          }
          this.c.stroke();
        }
      },
      Lq: function (a, b, c) {
        var d = a.K;
        if (null != d)
          for (
            d = d.ta.F[0], this.nk(d.a, d.R, b, c), d = 0, a = a.I;
            d < a.length;
  
          ) {
            var e = a[d];
            ++d;
            null != e.H && this.nk(e.H.a, e.ea.R, b, c);
          }
      },
      nk: function (a, b, c, d) {
        c = 0.5 * c - 25;
        d = 0.5 * d - 25;
        var e = this.Ya,
          f = a.x - e.x,
          e = a.y - e.y,
          g = -c,
          h = -d,
          l = this.Ya;
        c = l.x + (f > c ? c : f < g ? g : f);
        d = l.y + (e > d ? d : e < h ? h : e);
        f = a.x - c;
        a = a.y - d;
        900 < f * f + a * a &&
          ((this.c.fillStyle = "rgba(0,0,0,0.5)"),
          this.pk(c + 2, d + 2, Math.atan2(a, f)),
          (this.c.fillStyle = N.lc(b)),
          this.pk(c - 2, d - 2, Math.atan2(a, f)));
      },
      pk: function (a, b, c) {
        this.c.save();
        this.c.translate(a, b);
        this.c.rotate(c);
        this.c.beginPath();
        this.c.moveTo(15, 0);
        this.c.lineTo(0, 7);
        this.c.lineTo(0, -7);
        this.c.closePath();
        this.c.fill();
        this.c.restore();
      },
      Xq: function () {
        for (var a = this.dd.values(), b = a.next(); !b.done; ) {
          var c = b.value,
            b = a.next();
          c.Xf = !1;
        }
      },
      f: N,
    };
    R.b = !0;
    R.prototype = {
      zo: function () {
        return 2.31 + 0.1155 * (this.We.length - 1);
      },
      Kc: function (a, b) {
        var c = b / 2.31,
          d = 0;
        a.imageSmoothingEnabled = !0;
        for (var e = 0, f = this.We; e < f.length; ) {
          var g = f[e];
          ++e;
          var h = c - 0.05 * d,
            l = 180 * R.kn.eval(h) * (0 != (d & 1) ? -1 : 1);
          a.globalAlpha = R.jn.eval(h);
          a.drawImage(
            g,
            l - 0.5 * g.width,
            35 * -(this.We.length - 1) + 70 * d - 0.5 * g.height
          );
          a.globalAlpha = 1;
          ++d;
        }
        a.imageSmoothingEnabled = !1;
      },
      Tq: function (a) {
        var b = 0;
        a.imageSmoothingEnabled = !0;
        for (var c = 0, d = this.We; c < d.length; ) {
          var e = d[c];
          ++c;
          a.drawImage(
            e,
            0.5 * -e.width,
            35 * -(this.We.length - 1) + 70 * b - 0.5 * e.height
          );
          ++b;
        }
        a.imageSmoothingEnabled = !1;
      },
      lc: function (a) {
        return (
          "rgba(" +
          [(a & 16711680) >>> 16, (a & 65280) >>> 8, a & 255].join() +
          ",255)"
        );
      },
      sp: function (a, b) {
        var c = window.document.createElement("canvas"),
          d = c.getContext("2d", null);
        d.font = "900 70px Arial Black,Arial Bold,Gadget,sans-serif";
        c.width = Math.ceil(d.measureText(a).width) + 7;
        c.height = 90;
        d.font = "900 70px Arial Black,Arial Bold,Gadget,sans-serif";
        d.textAlign = "left";
        d.textBaseline = "middle";
        d.fillStyle = "black";
        d.fillText(a, 7, 52);
        d.fillStyle = this.lc(b);
        d.fillText(a, 0, 45);
        return c;
      },
      f: R,
    };
    Sb.b = !0;
    Sb.prototype = {
      Pa: function (a) {
        this.ab.push(a);
      },
      Nn: function () {
        this.ab = [];
        this.xc = 0;
      },
      C: function (a) {
        0 < this.ab.length &&
          ((this.xc += a),
          this.xc > this.ab[0].zo() && ((this.xc = 0), this.ab.shift()));
      },
      Kc: function (a) {
        0 < this.ab.length && this.ab[0].Kc(a, this.xc);
      },
      f: Sb,
    };
    Ea.b = !0;
    Ea.Ln = function (a, b) {
      if (a.hd != b.hd || a.ed != b.ed) return !1;
      var c = a.fb,
        d = b.fb;
      if (c.length != d.length) return !1;
      for (var e = 0, f = c.length; e < f; ) {
        var g = e++;
        if (c[g] != d[g]) return !1;
      }
      return !0;
    };
    Ea.ao = function (a, b) {
      a.hd = b.hd;
      a.ed = b.ed;
      a.fb = b.fb.slice(0);
    };
    Ea.prototype = {
      fo: function () {
        var a = window.document.createElement("canvas");
        a.width = 160;
        a.height = 34;
        this.vl = a.getContext("2d", null);
      },
      Or: function () {
        var a = this.vl;
        a.resetTransform();
        a.clearRect(0, 0, 160, 34);
        a.font = "26px sans-serif";
        a.fillStyle = "white";
        160 < a.measureText(this.w).width
          ? ((a.textAlign = "left"), a.translate(2, 29))
          : ((a.textAlign = "center"), a.translate(80, 29));
        a.fillText(this.w, 0, 0);
      },
      so: function (a, b, c) {
        a.drawImage(this.vl.canvas, 0, 0, 160, 34, b - 40, c - 34, 80, 17);
      },
      C: function (a, b) {
        if (null != a.H) {
          var c = n.A.xm.L() ? b.kb[a.ea.$] : a.ea.wm,
            d = null != a.Jd ? a.Jd : a.Xb,
            e = n.A.lm.L() && null != d;
          if (
            !Ea.Ln(this.kb, c) ||
            (!e && a.Jb != this.uh) ||
            (e && this.Jf != d)
          )
            Ea.ao(this.kb, c),
              e
                ? ((this.Jf = d), (this.uh = -1))
                : ((this.Jf = "" + a.Jb), (this.uh = a.Jb)),
              this.Hq(this.Jf);
        }
        this.lo =
          0 < b.K.Oa || !a.Wb
            ? "black"
            : a.Wb && 0 >= a.Sc && 0 <= a.yc
            ? "white"
            : "black";
        a.w != this.w && ((this.w = a.w), this.Or());
      },
      Hq: function (a) {
        var b = this.kb.fb;
        if (!(1 > b.length)) {
          this.rb.save();
          this.rb.translate(32, 32);
          this.rb.rotate((3.141592653589793 * this.kb.hd) / 128);
          for (var c = -32, d = 64 / b.length, e = 0; e < b.length; )
            (this.rb.fillStyle = N.lc(b[e++])),
              this.rb.fillRect(c, -32, d + 4, 64),
              (c += d);
          this.rb.restore();
          this.rb.fillStyle = N.lc(this.kb.ed);
          this.rb.textAlign = "center";
          this.rb.textBaseline = "alphabetic";
          this.rb.font = "900 34px 'Arial Black','Arial Bold',Gadget,sans-serif";
          this.rb.fillText(a, 32, 44);
          //this.Ij = this.rb.createPattern(this.rb.canvas, "no-repeat");
        }
      },
      f: Ea,
    };
    mb.b = !0;
    mb.prototype = {
      ki: function (a) {
        for (var b = this, c = 0, d = Ha.ab.length >> 2; c < d; ) {
          var e = c++,
            f = [e],
            g = Ha.ab[e << 2],
            e = Ha.ab[(e << 2) + 1].toLowerCase(),
            h = [window.document.createElement("div")];
          h[0].className = "elem";
          h[0].innerHTML = '<div class="flagico f-' + e + '"></div> ' + g;
          a.appendChild(h[0]);
          h[0].onclick = (function (a, c) {
            return function () {
              null != b.rf && b.rf.Ja.classList.remove("selected");
              b.wh.disabled = !1;
              b.rf = { Ja: a[0], index: c[0] };
              a[0].classList.add("selected");
            };
          })(h, f);
          h[0].ondblclick = (function (a) {
            return function () {
              b.Zl(a[0]);
            };
          })(f);
        }
      },
      Zl: function (a) {
        var b = new T();
        b.ub = Ha.ab[(a << 2) + 1].toLowerCase();
        b.Ec = Ha.ab[(a << 2) + 2];
        b.Gc = Ha.ab[(a << 2) + 3];
        n.A.Ne.Xa(b);
        A.i(this.qb);
      },
      f: mb,
    };
    Da.b = !0;
    Da.Yo = function (a) {
      return a.parentElement.querySelector(":hover") == a;
    };
    Da.prototype = {
      pp: function (a, b, c) {
        var d = window.document.createElement("p");
        d.className = "announcement";
        d.textContent = a;
        0 <= b && (d.style.color = N.lc(b));
        switch (c) {
          case 1:
          case 4:
            d.style.fontWeight = "bold";
            break;
          case 2:
          case 5:
            d.style.fontStyle = "italic";
        }
        switch (c) {
          case 3:
          case 4:
          case 5:
            d.style.fontSize = "12px";
        }
        this.Ok(d);
      },
      Ok: function (a) {
        var b = this.dc.clientHeight,
          b =
            this.dc.scrollTop + b - this.dc.scrollHeight >= 0.5 * -b ||
            !Da.Yo(this.dc);
        this.dc.appendChild(a);
        b && (this.dc.scrollTop = a.offsetTop);
        for (a = b ? 50 : 100; this.dc.childElementCount > a; )
          this.dc.firstElementChild.remove();
        //this.vg.update();
      },
      ba: function (a, b) {
        var c = window.document.createElement("p");
        null != b && (c.className = b);
        c.textContent = a;
        this.Ok(c);
      },
      Gb: function (a) {
        this.ba(a, "notice");
      },
      f: Da,
    };
    lb.b = !0;
    lb.vo = function (a) {
      return -1 != ".$^{[(|)*+?\\".indexOf(a) ? "\\" + a : a;
    };
    lb.prototype = {
      Qh: function () {
        this.Ui(null);
      },
      Hn: function (a, b) {
        var c = this.Iq.exec(D.substr(a, 0, b));
        if (null != c) {
          var d = c[0],
            e = new RegExp(
              D.substr(d, 1, null).split("").map(lb.vo).join(".*?"),
              "i"
            );
          this.Ek = "#" == d.charAt(0);
          this.si = c.index;
          this.Vq = d.length;
          this.Ml = a;
          for (
            var c = function (a) {
                a = e.exec(a.w);
                return null == a ? -1 : a.index + a[0].length;
              },
              d = [],
              f = 0,
              g = this.Hj;
            f < g.length;
  
          ) {
            var h = g[f];
            ++f;
            var l = c(h);
            0 <= l && d.push({ dn: l, item: h });
          }
          d.sort(function (a, b) {
            return a.dn - b.dn;
          });
          this.Ui(d);
        } else this.Ui(null);
      },
      lk: function (a) {
        a = this.Ek ? "#" + a.$ : "@" + J.replace(a.w, " ", "_");
        this.Rp(
          D.substr(this.Ml, 0, this.si) +
            a +
            " " +
            D.substr(this.Ml, this.si + this.Vq, null),
          this.si + a.length + 1
        );
      },
      Ui: function (a) {
        var b = this,
          c = null != a && 0 != a.length;
        this.Mb.hidden || v.Cf(this.Mb);
        this.Wc = null;
        this.Mb.hidden = !c;
        if (c) {
          for (var c = [], d = 0; d < a.length; ) {
            var e = a[d++],
              f = window.document.createElement("div"),
              e = [e.item],
              g = e[0].w;
            this.Ek && (g = "(" + e[0].$ + ") " + g);
            f.textContent = g;
            this.Mb.appendChild(f);
            f.onclick = (function (a) {
              return function () {
                b.lk(a[0]);
              };
            })(e);
            c.push({ item: e[0], Ja: f });
          }
          this.Wc = c;
          this.Wc[0].Ja.classList.toggle("selected", !0);
          this.wc = 0;
        }
      },
      Qj: function (a) {
        if (null != this.Wc) {
          var b = this.wc;
          this.wc += a;
          a = this.Wc.length - 1;
          0 > this.wc ? (this.wc = a) : this.wc > a && (this.wc = 0);
          a = this.Wc[this.wc];
          b != this.wc &&
            (a.Ja.classList.toggle("selected", !0),
            this.Wc[b].Ja.classList.toggle("selected", !1));
          a = a.Ja;
          b = a.offsetTop;
          a = b + a.offsetHeight;
          var c = this.Mb.scrollTop + this.Mb.clientHeight;
          b < this.Mb.scrollTop
            ? (this.Mb.scrollTop = b)
            : a > c && (this.Mb.scrollTop = a - this.Mb.clientHeight);
        }
      },
      qo: function () {
        null != this.Wc && (this.lk(this.Wc[this.wc].item), this.Qh());
      },
      f: lb,
    };
    kb.b = !0;
    kb.prototype = {
      Dc: function () {
        var a = this.Cb.value;
        return 25 >= a.length ? 0 < a.length : !1;
      },
      C: function () {
        this.af.disabled = !this.Dc();
      },
      f: kb,
    };
    jb.b = !0;
    jb.prototype = {
      ba: function (a) {
        //console.log(a);
        var b = window.document.createElement("p");
        b.textContent = a;
        this.dc.appendChild(b);
      },
      f: jb,
    };
    ib.b = !0;
    ib.prototype = {
      Fj: function (a) {
        this.Fm = a;
        this.Em.textContent = "Show in room list: " + (a ? "No" : "Yes");
      },
      Dc: function () {
        var a = this.$e.value;
        return 40 >= a.length ? 0 < a.length : !1;
      },
      C: function () {
        this.Wj.disabled = !this.Dc();
      },
      f: ib,
    };
    Ka.b = !0;
    Ka.prototype = { f: Ka };
    hb.b = !0;
    hb.prototype = {
      Gg: function (a) {
        this.g.classList.toggle("restricted", a);
      },
      C: function (a) {
        var b = a.K;
        null != b &&
          (//this.xc.tr(60 * a.Da),
          //this.xc.sr(b.Hc | 0),
          this.Kb.set(b.Kb),
          this.Pb.set(b.Pb),
          internalData.extrapolatedRoomPhysicsObj = a
          //,this.Eb.Kc(a, this.Nb)
          );
      },
      f: hb,
    };
    Rb.b = !0;
    Rb.prototype = {
      Wd: function (a, b) {
        var c = window.document.createElement("span");
        c.textContent = a;
        c.className = b;
        return c;
      },
      sr: function (a) {
        if (a != this.Ke) {
          var b = a % 60,
            c = (a / 60) | 0;
          this.cr.textContent = "" + (b % 10);
          this.dr.textContent = "" + (((b / 10) | 0) % 10);
          this.yp.textContent = "" + (c % 10);
          this.zp.textContent = "" + (((c / 10) | 0) % 10);
          this.Ke = a;
        }
        this.Jl();
        this.Kl();
      },
      tr: function (a) {
        this.Da = a;
        this.Jl();
        this.Kl();
      },
      Jl: function () {
        this.pr(0 != this.Da && this.Ke > this.Da);
      },
      Kl: function () {
        this.ur(this.Ke < this.Da && this.Ke > this.Da - 30);
      },
      pr: function (a) {
        a != this.hk &&
          ((this.bq.className = a ? "overtime on" : "overtime"), (this.hk = a));
      },
      ur: function (a) {
        a != this.ik &&
          ((this.g.className = a
            ? "game-timer-view time-warn"
            : "game-timer-view"),
          (this.ik = a));
      },
      f: Rb,
    };
    */
    ja.b = !0;
    ja.prototype = {
      C: function (a) {
        /*
        null == a.T.K && this.me(!0);
        A.i(this.yl);
        this.bi.disabled = null == a.T.K;
        this.Gd
          ? this.Wa.C(a.T, a.T.na(a.uc))
          : */((a = a.Sf()), (internalData.extrapolatedRoomPhysicsObj = a)/*, this.Fb.C(a), n.Na.Xj?.Ls(a)*/);
      },
      /*
      me: function (a) {
        this.Gd != a &&
          ((this.Gd = a)
            ? (this.Jh.appendChild(this.Wa.g), this.Fb.g.remove())
            : (this.Jh.appendChild(this.Fb.g), this.Wa.g.remove()));
      },
      Zo: function () {
        return null != ja.kq;
      },
      bb: function (a, b) {
        v.Cf(this.hf);
        ja.kq = a;
        null != a
          ? ((this.hf.style.display = "flex"),
            this.hf.appendChild(a),
            (this.yl = b))
          : ((this.hf.style.display = "none"), (this.yl = null));
      },
      */
      f: ja,
    };
    /*
    gb.b = !0;
    gb.prototype = {
      Aj: function (a) {
        this.Jj = a;
        this.An.textContent = a ? "Yes" : "No";
      },
      f: gb,
    };
    fb.b = !0;
    fb.prototype = { f: fb };
    eb.b = !0;
    eb.prototype = {
      Lg: function () {
        this.hi.disabled = null == this.jb;
        this.bk.disabled = null == this.jb || null == this.jb.Lm;
        this.rk.disabled = null == this.jb;
      },
      Sk: function (a, b, c) {
        var d = this,
          e = window.document.createElement("div");
        e.textContent = a;
        e.className = "elem";
        null != c && e.classList.add("custom");
        var f = { Ja: e, Pd: b, Lm: c };
        e.onclick = function () {
          null != d.jb && d.jb.Ja.classList.remove("selected");
          d.jb = f;
          e.classList.add("selected");
          d.Lg();
        };
        e.ondblclick = function () {
          d.jb = f;
          d.Lg();
          return d.hi.onclick();
        };
        return e;
      },
      ki: function (a) {
        for (var b = this, c = h.Kh(), d = 0; d < c.length; ) {
          var e = [c[d]];
          ++d;
          e = this.Sk(
            e[0].w,
            (function (a) {
              return function () {
                return Promise.resolve(a[0]);
              };
            })(e),
            null
          );
          a.appendChild(e);
        }
        Z.getAll().then(function (c) {
          for (var d = 0; d < c.length; ) {
            var e = c[d];
            ++d;
            var f = [e.id],
              e = b.Sk(
                e.name,
                (function (a) {
                  return function () {
                    return Z.get(a[0]);
                  };
                })(f),
                (function (a) {
                  return function () {
                    return Z["delete"](a[0]);
                  };
                })(f)
              );
            a.appendChild(e);
          }
          b.vg.update();
        });
      },
      f: eb,
    };
    Qb.b = !0;
    Qb.prototype = {
      tn: function (a) {
        0 > a
          ? ((a = 150), (this.c.fillStyle = "#c13535"))
          : (this.c.fillStyle = "green");
        var b = this.Vi,
          c = this.yk,
          d = this.Ah++;
        this.Ah >= b && (this.Ah = 0);
        this.fq[d] = a;
        this.c.clearRect(d, 0, 1, c);
        a = (a * c) / this.vp;
        this.c.fillRect(d, c - a, 1, a);
        this.Eh.clearRect(0, 0, b, c);
        this.Eh.drawImage(this.sa, b - d - 1, 0);
        this.Eh.drawImage(this.sa, -d - 1, 0);
      },
      f: Qb,
    };
    db.b = !0;
    db.prototype = {
      C: function (a, b) {
        var c = a.na(this.Nb);
        null == c
          ? A.i(this.qb)
          : (this.Nr(c),
            (this.Hf.disabled = !b || 0 == this.Nb),
            (this.Qe.disabled = !b || 0 == this.Nb));
      },
      Nr: function (a) {
        this.fe != a.w && this.Ej(a.w);
        this.ql != a.cb && this.Dj(a.cb);
      },
      Ej: function (a) {
        this.fe = a;
        this.Ze.textContent = a;
      },
      Dj: function (a) {
        this.ql = a;
        this.Hf.textContent = a ? "Remove Admin" : "Give Admin";
      },
      f: db,
    };
    cb.b = !0;
    cb.prototype = {
      C: function (a, b) {
        this.g.draggable = b;
        this.yb != a.yb &&
          ((this.yb = a.yb), (this.rg.textContent = "" + this.yb));
        this.un != a.cb && this.em(a.cb);
      },
      em: function (a) {
        this.un = a;
        this.g.className = "player-list-item" + (a ? " admin" : "");
      },
      f: cb,
    };
    za.b = !0;
    za.prototype = {
      C: function (a, b, c, d) {
        var e = this;
        this.Vh.disabled = b || c;
        this.vi.disabled = c;
        b = new Set();
        c = this.xd.keys();
        for (var f = c.next(); !f.done; ) {
          var g = f.value,
            f = c.next();
          b.add(g);
        }
        for (c = 0; c < a.length; )
          (f = a[c]),
            ++c,
            (g = this.xd.get(f.V)),
            null == g &&
              ((g = new cb(f)),
              //(g.ff = function (a) {
                //y.i(e.ff, a);
              //}),
              this.xd.set(f.V, g),
              this.ab.appendChild(g.g)),
            g.C(f, d),
            b["delete"](f.V);
        d = b.values();
        for (b = d.next(); !b.done; )
          (c = b.value),
            (b = d.next()),
            this.xd.get(c).g.remove(),
            this.xd["delete"](c);
        d = 0;
        for (b = a.length - 1; d < b; )
          (f = d++),
            (c = this.xd.get(a[f].V).g),
            (f = this.xd.get(a[f + 1].V).g),
            c.nextSibling != f && this.ab.insertBefore(c, f);
      },
      f: za,
    };
    Q.b = !0;
    Q.prototype = { f: Q };
    ha.b = !0;
    ha.Wk = function (a) {
      a = (a / 1e3) | 0;
      return ((a / 60) | 0) + ":" + J.Af(K.ye(a % 60));
    };
    ha.prototype = {
      C: function () {
        this.Er.textContent = ha.Wk(this.ti.Qb);
        this.Aq.style.width = 100 * this.ti.Go() + "%";
        !this.Wf || 0 < this.ti.Fd || ((this.Wf = !1), this.Up());
      },
      f: ha,
    };
    bb.b = !0;
    bb.prototype = {
      nr: function (a) {
        this.gk != a && ((this.gk = a), (this.Zf.value = a));
      },
      f: bb,
    };
    ab.b = !0;
    ab.prototype = { f: ab };
    Aa.b = !0;
    Aa.As = function (a) {
      return Promise.race([
        new Promise(function (a, c) {
          return window.setTimeout(function () {
            c(null);
          }, 5e3);
        }),
        a,
      ]);
    };
    Aa.prototype = {
      Om: function () {
        function a() {
          b.pj.disabled = !1;
          b.bn(c);
        }
        var b = this;
        this.en(null);
        this.pj.disabled = !0;
        v.Cf(this.gj);
        var c = [];
        this.dj = [];
        Aa.As(
          va.get().then(
            function (a) {
              return (c = a);
            },
            function () {
              return {};
            }
          )
        ).then(a, a);
      },
      bn: function (a) {
        var b = this;
        this.dj = a;
        va.Hs(this.gs, a);
        a.sort(function (a, b) {
          return a.Le - b.Le;
        });
        v.Cf(this.gj);
        for (
          var c = 0, d = 0, e = !this.fs.Ta, f = !this.zs.Ta, g = 0;
          g < a.length;
  
        ) {
          var h = [a[g]];
          ++g;
          var l = h[0].vd;
          if (!((e && l.I >= l.Xe) || (f && l.Ib))) {
            var m = [new ab(h[0])];
            m[0].Ja.ondblclick = (function (a) {
              return function () {
                y.i(b.Ym, a[0]);
              };
            })(h);
            m[0].Ja.onclick = (function (a) {
              return function () {
                b.en(a[0]);
              };
            })(m);
            this.gj.appendChild(m[0].Ja);
            c += l.I;
            ++d;
          }
        }
        this.cs.textContent = "" + c + " players in " + d + " rooms";
        //this.Bs.update();
      },
      en: function (a) {
        null != this.Od && this.Od.Ja.classList.remove("selected");
        this.Od = a;
        null != this.Od && this.Od.Ja.classList.add("selected");
        this.Tm.disabled = null == this.Od;
      },
      f: Aa,
    };
    $a.b = !0;
    $a.prototype = {
      Il: function () {
        var a = this;
        M.tk(n.Ee + "api/notice").then(function (b) {
          var c = b.content;
          null != c &&
            "" != c &&
            $a.On != c &&
            ((a.$n.innerHTML = c),
            (a.Xk.hidden = !1),
            (a.nd.onclick = function () {
              $a.On = c;
              return (a.Xk.hidden = !0);
            }));
        });
      },
      f: $a,
    };
    Za.b = !0;
    Za.prototype = {
      Dc: function () {
        var a = this.Cb.value;
        return 30 >= a.length ? 0 < a.length : !1;
      },
      C: function () {
        this.af.disabled = !this.Dc();
      },
      f: Za,
    };
    Ya.b = !0;
    Ya.prototype = {
      Th: function (a, b, c, d) {
        var e = this;
        v.xe(a, b.g);
        b.mg = function (a, b) {
          ia.i(e.mg, a, b);
        };
        b.ee = function (a) {
          y.i(e.ee, a);
        };
        b.Kp = function (a) {
          ia.i(e.mg, d, a);
        };
        b.ff = function (a) {
          y.i(e.ff, a);
        };
      },
      Tk: function (a) {
        for (var b = [], c = 0; c < a; ) {
          var d = c++;
          b.push(null == d ? "null" : "" + d);
        }
        return b;
      },
      Uk: function (a, b) {
        for (var c = 0; c < b.length; ) {
          var d = b[c++],
            e = window.document.createElement("option");
          e.textContent = d;
          a.appendChild(e);
        }
      },
      rr: function (a) {
        this.Fl.classList.toggle("active", a);
      },
      C: function (a, b) {
        this.Uq != a.jc && ((this.Uq = a.jc), (this.jc.textContent = a.jc));
        var c = null == b ? !1 : b.cb;
        this.fk != c &&
          ((this.g.className = "room-view" + (c ? " admin" : "")), (this.fk = c));
        var d = !c || null != a.K;
        this.wf.disabled = d;
        this.qf.disabled = d;
        this.sm.disabled = d;
        d = null != a.K;
        this.tm.hidden = d;
        this.vm.hidden = !d;
        this.gi.hidden = !d;
        this.wf.selectedIndex = a.Da;
        this.qf.selectedIndex = a.ib;
        this.rm.textContent = a.S.w;
        this.rm.classList.toggle("custom", !a.S.Pe());
        var e = a.Pc;
        this.Hl.C(
          a.I.filter(function (a) {
            return a.ea == p.fa;
          }),
          e,
          d,
          c
        );
        this.Lj.C(
          a.I.filter(function (a) {
            return a.ea == p.xa;
          }),
          e,
          d,
          c
        );
        this.qm.C(
          a.I.filter(function (a) {
            return a.ea == p.Ia;
          }),
          e,
          d,
          c
        );
        this.Rl.disabled = d;
        this.Xh != a.Pc && this.Bj(a.Pc);
        d && ((c = 120 == a.K.Oa), this.ll != c && this.Cj(c));
      },
      Bj: function (a) {
        this.Xh = a;
        this.Nk.innerHTML = this.Xh
          ? "<i class='icon-lock'></i>Unlock"
          : "<i class='icon-lock-open'></i>Lock";
      },
      Cj: function (a) {
        this.ll = a;
        this.gi.innerHTML =
          "<i class='icon-pause'></i>" + (this.ll ? "Resume (P)" : "Pause (P)");
      },
      f: Ya,
    };
    aa.b = !0;
    aa.prototype = { f: aa };
    P.b = !0;
    P.prototype = { f: P };
    Xa.b = !0;
    Xa.prototype = {
      qr: function (a) {
        this.rg.textContent = null == a ? "null" : "" + a;
      },
      or: function (a) {
        this.wp.textContent = "" + a;
      },
      hm: function (a) {
        this.wo.textContent = null == a ? "null" : "" + a;
      },
      f: Xa,
    };
    Wa.b = !0;
    Wa.prototype = { f: Wa };
    */
    q.b = !0;
    q.ma = Error;
    q.prototype = C(Error.prototype, { f: q });
    r.b = !0;
    r.Nm = function (a) {
      if (a instanceof Array && null == a.eb) return Array;
      var b = a.f;
      if (null != b) return b;
      a = r.wj(a);
      return null != a ? r.rn(a) : null;
    };
    r.Be = function (a, b) {
      if (null == a) return "null";
      if (5 <= b.length) return "<...>";
      var c = typeof a;
      "function" == c && (a.b || a.Gf) && (c = "object");
      switch (c) {
        case "function":
          return "<function>";
        case "object":
          if (a.eb) {
            var d = Ab[a.eb],
              c = d.nh[a.nb],
              e = d[c];
            if (e.Ae) {
              b += "\t";
              for (var c = c + "(", d = [], f = 0, e = e.Ae; f < e.length; ) {
                var g = e[f];
                ++f;
                d.push(r.Be(a[g], b));
              }
              return c + d.join(",") + ")";
            }
            return c;
          }
          if (a instanceof Array) {
            c = a.length;
            d = "[";
            b += "\t";
            for (f = 0; f < c; )
              (e = f++), (d += (0 < e ? "," : "") + r.Be(a[e], b));
            return d + "]";
          }
          try {
            d = a.toString;
          } catch (k) {
            return "???";
          }
          if (
            null != d &&
            d != Object.toString &&
            "function" == typeof d &&
            ((c = a.toString()), "[object Object]" != c)
          )
            return c;
          c = null;
          d = "{\n";
          b += "\t";
          f = null != a.hasOwnProperty;
          for (c in a)
            (f && !a.hasOwnProperty(c)) ||
              "prototype" == c ||
              "__class__" == c ||
              "__super__" == c ||
              "__interfaces__" == c ||
              "__properties__" == c ||
              (2 != d.length && (d += ", \n"),
              (d += b + c + " : " + r.Be(a[c], b)));
          b = b.substring(1);
          return d + ("\n" + b + "}");
        case "string":
          return a;
        default:
          return String(a);
      }
    };
    r.ph = function (a, b) {
      if (null == a) return !1;
      if (a == b) return !0;
      var c = a.Rd;
      if (null != c)
        for (var d = 0, e = c.length; d < e; ) {
          var f = c[d++];
          if (f == b || r.ph(f, b)) return !0;
        }
      return r.ph(a.ma, b);
    };
    r.pn = function (a, b) {
      if (null == b) return !1;
      switch (b) {
        case Array:
          return a instanceof Array ? null == a.eb : !1;
        case oc:
          return "boolean" == typeof a;
        case sc:
          return !0;
        case z:
          return "number" == typeof a;
        case Pb:
          return "number" == typeof a ? (a | 0) === a : !1;
        case String:
          return "string" == typeof a;
        default:
          if (null != a)
            if ("function" == typeof b) {
              if (a instanceof b || r.ph(r.Nm(a), b)) return !0;
            } else {
              if ("object" == typeof b && r.qn(b) && a instanceof b) return !0;
            }
          else return !1;
          return (b == tc && null != a.b) || (b == uc && null != a.Gf)
            ? !0
            : Ab[a.eb] == b;
      }
    };
    r.G = function (a, b) {
      if (r.pn(a, b)) return a;
      throw new q("Cannot cast " + K.ye(a) + " to " + K.ye(b));
    };
    r.wj = function (a) {
      a = r.sn.call(a).slice(8, -1);
      return "Object" == a || "Function" == a || "Math" == a || "JSON" == a
        ? null
        : a;
    };
    r.qn = function (a) {
      return null != r.wj(a);
    };
    r.rn = function (a) {
      return qc[a];
    };
    internalData.parserObj = r;
    hc.b = !0;
    hc.Is = function (a, b) {
      var c = new Uint8Array(this, a, null == b ? null : b - a),
        d = new Uint8Array(c.byteLength);
      d.set(c);
      return d.buffer;
    };
    var rc = 0;
    null == String.fromCodePoint &&
      (String.fromCodePoint = function (a) {
        return 65536 > a
          ? String.fromCharCode(a)
          : String.fromCharCode((a >> 10) + 55232) +
              String.fromCharCode((a & 1023) + 56320);
      });
    String.prototype.f = String;
    String.b = !0;
    Array.b = !0;
    Date.prototype.f = Date;
    Date.b = "Date";
    var Pb = {},
      sc = {},
      z = Number,
      oc = Boolean,
      tc = {},
      uc = {};
    p.Ia = new p(0, 16777215, 0, -1, "Spectators", "t-spec", 0, 0);
    p.fa = new p(1, 15035990, -1, 8, "Red", "t-red", 0, 2);
    p.xa = new p(2, 5671397, 1, 16, "Blue", "t-blue", 0, 4);
    p.Ia.pg = p.Ia;
    p.fa.pg = p.xa;
    p.xa.pg = p.fa;
    internalData.teams = {
      spec: p.Ia,
      red: p.fa,
      blue: p.xa
    };
    Object.defineProperty(q.prototype, "message", {
      get: function () {
        return String(this.Ta);
      },
    });
    null == ArrayBuffer.prototype.slice && (ArrayBuffer.prototype.slice = hc.Is);
    Va.Yn = { mandatory: { OfferToReceiveAudio: !1, OfferToReceiveVideo: !1 } };
    I.qh = { name: "ECDSA", namedCurve: "P-256" };
    I.mm = { name: "ECDSA", hash: { name: "SHA-256" } };
    Ba.Uo = ["click-rail", "drag-thumb", "wheel", "touch"];
    m.Qm = new Map();
    m.yf = 0;
    Ua.za = m.Fa({ Ba: !1, Aa: !1 });
    ya.zc = 0;
    Zb.Km = [
      { name: "ro", reliable: !0, kj: !0 },
      { name: "ru", reliable: !0, kj: !1 },
      { name: "uu", reliable: !1, kj: !1 },
    ];
    M.vj = "application/x-www-form-urlencoded";
    Ha.ab = [
      "Afghanistan","AF",33.3,65.1,"Albania","AL",41.1,20.1,"Algeria","DZ",28,1.6,"American Samoa","AS",-14.2,-170.1,"Andorra","AD",42.5,1.6,"Angola","AO",-11.2,17.8,"Anguilla","AI",18.2,-63,"Antigua and Barbuda","AG",17,-61.7,"Argentina","AR",-34.5,-58.4,"Armenia","AM",40,45,"Aruba","AW",12.5,-69.9,"Australia","AU",-25.2,133.7,"Austria","AT",47.5,14.5,"Azerbaijan","AZ",40.1,47.5,"Bahamas","BS",25,-77.3,"Bahrain","BH",25.9,50.6,"Bangladesh","BD",23.6,90.3,"Barbados","BB",13.1,-59.5,"Belarus","BY",53.7,27.9,"Belgium","BE",50.5,4.4,"Belize","BZ",17.1,-88.4,"Benin","BJ",9.3,2.3,"Bermuda","BM",32.3,-64.7,"Bhutan","BT",27.5,90.4,"Bolivia","BO",-16.2,-63.5,"Bosnia and Herzegovina","BA",43.9,17.6,"Botswana","BW",-22.3,24.6,"Bouvet Island","BV",-54.4,3.4,"Brazil","BR",-14.2,-51.9,"British Indian Ocean Territory","IO",-6.3,71.8,"British Virgin Islands","VG",18.4,-64.6,"Brunei","BN",4.5,114.7,"Bulgaria","BG",42.7,25.4,"Burkina Faso","BF",12.2,-1.5,"Burundi","BI",-3.3,29.9,"Cambodia","KH",12.5,104.9,"Cameroon","CM",7.3,12.3,"Canada","CA",56.1,-106.3,"Cape Verde","CV",16,-24,"Cayman Islands","KY",19.5,-80.5,"Central African Republic","CF",6.6,20.9,"Chad","TD",15.4,18.7,"Chile","CL",-35.6,-71.5,"China","CN",35.8,104.1,"Christmas Island","CX",-10.4,105.6,"Colombia","CO",4.5,-74.2,"Comoros","KM",-11.8,43.8,"Congo [DRC]","CD",-4,21.7,"Congo [Republic]","CG",-0.2,15.8,"Cook Islands","CK",-21.2,-159.7,"Costa Rica","CR",9.7,-83.7,"Croatia","HR",45.1,15.2,"Cuba","CU",21.5,-77.7,"Cyprus","CY",35.1,33.4,"Czech Republic","CZ",49.8,15.4,"Côte d'Ivoire","CI",7.5,-5.5,"Denmark","DK",56.2,9.5,
      "Djibouti","DJ",11.8,42.5,"Dominica","DM",15.4,-61.3,"Dominican Republic","DO",18.7,-70.1,"Ecuador","EC",-1.8,-78.1,"Egypt","EG",26.8,30.8,"El Salvador","SV",13.7,-88.8,"England","ENG",55.3,-3.4,"Equatorial Guinea","GQ",1.6,10.2,"Eritrea","ER",15.1,39.7,"Estonia","EE",58.5,25,"Ethiopia","ET",9.1,40.4,"Faroe Islands","FO",61.8,-6.9,"Fiji","FJ",-16.5,179.4,"Finland","FI",61.9,25.7,"France","FR",46.2,2.2,"French Guiana","GF",3.9,-53.1,"French Polynesia","PF",-17.6,-149.4,"Gabon","GA",-0.8,11.6,"Gambia","GM",13.4,-15.3,"Georgia","GE",42.3,43.3,"Germany","DE",51.1,10.4,"Ghana","GH",7.9,-1,"Gibraltar","GI",36.1,-5.3,"Greece","GR",39,21.8,"Greenland","GL",71.7,-42.6,"Grenada","GD",12.2,-61.6,"Guadeloupe","GP",16.9,-62,"Guam","GU",13.4,144.7,"Guatemala","GT",15.7,-90.2,"Guinea","GN",9.9,-9.6,"Guinea-Bissau","GW",11.8,-15.1,"Guyana","GY",4.8,-58.9,"Haiti","HT",18.9,-72.2,"Honduras","HN",15.1,-86.2,"Hong Kong","HK",22.3,114.1,"Hungary","HU",47.1,19.5,"Iceland","IS",64.9,-19,"India","IN",20.5,78.9,"Indonesia","ID",-0.7,113.9,"Iran","IR",32.4,53.6,"Iraq","IQ",33.2,43.6,"Ireland","IE",53.4,-8.2,"Israel","IL",31,34.8,"Italy","IT",41.8,12.5,"Jamaica","JM",18.1,-77.2,"Japan","JP",36.2,138.2,"Jordan","JO",30.5,36.2,"Kazakhstan","KZ",48,66.9,"Kenya","KE",0,37.9,"Kiribati","KI",-3.3,-168.7,"Kosovo","XK",42.6,20.9,"Kuwait","KW",29.3,47.4,"Kyrgyzstan","KG",41.2,74.7,"Laos","LA",19.8,102.4,"Latvia","LV",56.8,24.6,"Lebanon","LB",33.8,35.8,"Lesotho","LS",-29.6,28.2,"Liberia","LR",6.4,-9.4,"Libya","LY",26.3,17.2,"Liechtenstein","LI",47.1,9.5,"Lithuania","LT",55.1,23.8,
      "Luxembourg","LU",49.8,6.1,"Macau","MO",22.1,113.5,"Macedonia [FYROM]","MK",41.6,21.7,"Madagascar","MG",-18.7,46.8,"Malawi","MW",-13.2,34.3,"Malaysia","MY",4.2,101.9,"Maldives","MV",3.2,73.2,"Mali","ML",17.5,-3.9,"Malta","MT",35.9,14.3,"Marshall Islands","MH",7.1,171.1,"Martinique","MQ",14.6,-61,"Mauritania","MR",21,-10.9,"Mauritius","MU",-20.3,57.5,"Mayotte","YT",-12.8,45.1,"Mexico","MX",23.6,-102.5,"Micronesia","FM",7.4,150.5,"Moldova","MD",47.4,28.3,"Monaco","MC",43.7,7.4,"Mongolia","MN",46.8,103.8,"Montenegro","ME",42.7,19.3,"Montserrat","MS",16.7,-62.1,"Morocco","MA",31.7,-7,"Mozambique","MZ",-18.6,35.5,"Myanmar [Burma]","MM",21.9,95.9,"Namibia","NA",-22.9,18.4,"Nauru","NR",-0.5,166.9,"Nepal","NP",28.3,84.1,"Netherlands","NL",52.1,5.2,"Netherlands Antilles","AN",12.2,-69,"New Caledonia","NC",-20.9,165.6,"New Zealand","NZ",-40.9,174.8,"Nicaragua","NI",12.8,-85.2,"Niger","NE",17.6,8,"Nigeria","NG",9,8.6,"Niue","NU",-19,-169.8,"Norfolk Island","NF",-29,167.9,"North Korea","KP",40.3,127.5,"Northern Mariana Islands","MP",17.3,145.3,"Norway","NO",60.4,8.4,"Oman","OM",21.5,55.9,"Pakistan","PK",30.3,69.3,"Palau","PW",7.5,134.5,"Palestinian Territories","PS",31.9,35.2,"Panama","PA",8.5,-80.7,"Papua New Guinea","PG",-6.3,143.9,"Paraguay","PY",-23.4,-58.4,"Peru","PE",-9.1,-75,"Philippines","PH",12.8,121.7,"Pitcairn Islands","PN",-24.7,-127.4,"Poland","PL",51.9,19.1,"Portugal","PT",39.3,-8.2,"Puerto Rico","PR",18.2,-66.5,"Qatar","QA",25.3,51.1,"Romania","RO",45.9,24.9,"Russia","RU",61.5,105.3,"Rwanda","RW",-1.9,29.8,"Réunion","RE",-21.1,55.5,"Saint Helena","SH",-24.1,-10,
      "Saint Kitts","KN",17.3,-62.7,"Saint Lucia","LC",13.9,-60.9,"Saint Pierre","PM",46.9,-56.2,"Saint Vincent","VC",12.9,-61.2,"Samoa","WS",-13.7,-172.1,"San Marino","SM",43.9,12.4,"Saudi Arabia","SA",23.8,45,"Scotland","SCT",56.5,4.2,"Senegal","SN",14.4,-14.4,"Serbia","RS",44,21,"Seychelles","SC",-4.6,55.4,"Sierra Leone","SL",8.4,-11.7,"Singapore","SG",1.3,103.8,"Slovakia","SK",48.6,19.6,"Slovenia","SI",46.1,14.9,"Solomon Islands","SB",-9.6,160.1,"Somalia","SO",5.1,46.1,"South Africa","ZA",-30.5,22.9,"South Georgia","GS",-54.4,-36.5,"South Korea","KR",35.9,127.7,"Spain","ES",40.4,-3.7,"Sri Lanka","LK",7.8,80.7,"Sudan","SD",12.8,30.2,"Suriname","SR",3.9,-56,"Svalbard and Jan Mayen","SJ",77.5,23.6,"Swaziland","SZ",-26.5,31.4,"Sweden","SE",60.1,18.6,"Switzerland","CH",46.8,8.2,"Syria","SY",34.8,38.9,"São Tomé and Príncipe","ST",0.1,6.6,"Taiwan","TW",23.6,120.9,"Tajikistan","TJ",38.8,71.2,"Tanzania","TZ",-6.3,34.8,"Thailand","TH",15.8,100.9,"Timor-Leste","TL",-8.8,125.7,"Togo","TG",8.6,0.8,"Tokelau","TK",-8.9,-171.8,"Tonga","TO",-21.1,-175.1,"Trinidad and Tobago","TT",10.6,-61.2,"Tunisia","TN",33.8,9.5,"Turkey","TR",38.9,35.2,"Turkmenistan","TM",38.9,59.5,"Turks and Caicos Islands","TC",21.6,-71.7,"Tuvalu","TV",-7.1,177.6,"U.S. Minor Outlying Islands","UM",0,0,"U.S. Virgin Islands","VI",18.3,-64.8,"Uganda","UG",1.3,32.2,"Ukraine","UA",48.3,31.1,"United Arab Emirates","AE",23.4,53.8,"United Kingdom","GB",55.3,-3.4,"United States","US",37,-95.7,"Uruguay","UY",-32.5,-55.7,"Uzbekistan","UZ",41.3,64.5,"Vanuatu","VU",-15.3,166.9,"Vatican City","VA",41.9,12.4,
      "Venezuela","VE",6.4,-66.5,"Vietnam","VN",14,108.2,"Wales","WLS",55.3,-3.4,"Wallis and Futuna","WF",-13.7,-177.1,"Western Sahara","EH",24.2,-12.8,"Yemen","YE",15.5,48.5,"Zambia","ZM",-13.1,27.8,"Zimbabwe","ZW",-19,29.1
    ];
    n.Vr = "wss://p2p.haxball.com/";
    n.Ee = "https://www.haxball.com/rs/";
    n.Vf = [{ urls: "stun:stun.l.google.com:19302" }];
    n.A = new Yb();
    internalData.generalStorageObj = n.A;
    O.Yk = (function () {
      for (var a = [], b = 0; 256 > b; ) ++b, a.push(new H(0, 0));
      return a;
    })(this);
    O.dk = (function () {
      for (var a = [], b = 0; 256 > b; ) ++b, a.push(0);
      return a;
    })(this);
    h.Fr = w.ha(1024);
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
    E.mn = 0.17435839227423353;
    E.ln = 5.934119456780721;
    /*
    R.jn = new Ib([0, 0, 2, 1, 0, 0.35, 1, 0, 1, 0, 0.7, 1, 0, 0, 0, 1]);
    R.kn = new Ib([0, -1, 3, 0, 0, 0.35, 0, 0, 0, 0, 0.65, 0, 0, 1, 3, 1]);
    mb.N =
      "<div class='dialog change-location-view'><h1>Change Location</h1><div class='splitter'><div class='list' data-hook='list'></div><div class='buttons'><button data-hook='change'>Change</button><button data-hook='cancel'>Cancel</button></div></div></div>";
    Da.N =
      "<div class='chatbox-view'><div data-hook='log' class='log'><p>Controls:<br/>Move: WASD or Arrows<br/>Kick: X, Space, Ctrl, Shift, Numpad 0<br/>View: Numbers 1 to 4</p></div><div class='autocompletebox' data-hook='autocompletebox'></div><div class='input'><input data-hook='input' type='text' /><button data-hook='send'>Send</button></div></div>";
    kb.N =
      "<div class='choose-nickname-view'><div class='dialog'><h1>Choose nickname</h1><div class='label-input'><label>Nick:</label><input data-hook='input' type='text' /></div><button data-hook='ok'>Ok</button></div></div>";
    jb.N =
      "<div class='connecting-view'><div class='dialog'><h1>Connecting</h1><div class='connecting-view-log' data-hook='log'></div><button data-hook='cancel'>Cancel</button></div></div>";
    ib.N =
      "<div class='create-room-view'><div class='dialog'><h1>Create room</h1><div class='label-input'><label>Room name:</label><input data-hook='name' required /></div><div class='label-input'><label>Password:</label><input data-hook='pass' /></div><div class='label-input'><label>Max players:</label><select data-hook='max-pl'></select></div><button data-hook='unlisted'></button><div class='row'><button data-hook='cancel'>Cancel</button><button data-hook='create'>Create</button></div></div></div>";
    Ka.N =
      "<div class='disconnected-view'><div class='dialog basic-dialog'><h1>Disconnected</h1><p data-hook='reason'></p><div class='buttons'><button data-hook='ok'>Ok</button><button data-hook='replay'>Save replay</button></div></div></div>";
    hb.N =
      "<div class='game-state-view'><div class='bar-container'><div class='bar'><div class='scoreboard'><div class='teamicon red'></div><div class='score' data-hook='red-score'>0</div><div>-</div><div class='score' data-hook='blue-score'>0</div><div class='teamicon blue'></div></div><div data-hook='timer'></div></div></div></div></div>";//<div class='canvas' data-hook='canvas'></div></div>";
    ja.N =
      "<div class='game-view' tabindex='-1'><div class='top-section' data-hook='gameplay-section'></div><div class='bottom-section'><div data-hook='stats'></div><div data-hook='chatbox'></div><div class='buttons'><button data-hook='menu'><i class='icon-menu'></i>Menu<span class='tooltip'>Toggle room menu [Escape]</span></button><button data-hook='settings'><i class='icon-cog'></i>Settings</button></div></div><div data-hook='popups'></div></div>";
    gb.N =
      "<div class='dialog kick-player-view'><h1 data-hook='title'></h1><div class=label-input><label>Reason: </label><input type='text' data-hook='reason' /></div><button data-hook='ban-btn'><i class='icon-block'></i>Ban from rejoining: <span data-hook='ban-text'></span></button><div class=\"row\"><button data-hook='close'>Cancel</button><button data-hook='kick'>Kick</button></div></div>";
    fb.N =
      "<div class='dialog basic-dialog leave-room-view'><h1>Leave room?</h1><p>Are you sure you want to leave the room?</p><div class='buttons'><button data-hook='cancel'>Cancel</button><button data-hook='leave'><i class='icon-logout'></i>Leave</button></div></div>";
    eb.N =
      "<div class='dialog pick-stadium-view'><h1>Pick a stadium</h1><div class='splitter'><div class='list' data-hook='list'></div><div class='buttons'><button data-hook='pick'>Pick</button><button data-hook='delete'>Delete</button><div class='file-btn'><label for='stadfile'>Load</label><input id='stadfile' type='file' accept='.hbs' data-hook='file'/></div><button data-hook='export'>Export</button><div class='spacer'></div><button data-hook='cancel'>Cancel</button></div></div></div>";
    db.N =
      "<div class='dialog' style='min-width:200px'><h1 data-hook='name'></h1><button data-hook='admin'></button><button data-hook='kick'>Kick</button><button data-hook='close'>Close</button></div>";
    cb.N =
      "<div class='player-list-item'><div data-hook='flag' class='flagico'></div><div data-hook='name'></div><div data-hook='ping'></div></div>";
    za.N =
      "<div class='player-list-view'><div class='buttons'><button data-hook='join-btn'>Join</button><button data-hook='reset-btn' class='admin-only'></button></div><div class='list' data-hook='list'></div></div>";
    ha.N =
      "<div class='replay-controls-view'><button data-hook='reset'><i class='icon-to-start'></i></button><button data-hook='play'><i data-hook='playicon'></i></button><div data-hook='spd'>1x</div><button data-hook='spddn'>-</button><button data-hook='spdup'>+</button><div data-hook='time'>00:00</div><div class='timebar' data-hook='timebar'><div class='barbg'><div class='bar' data-hook='progbar'></div></div><div class='timetooltip' data-hook='timetooltip'></div></div><button data-hook='leave'>Leave</button></div>";
    bb.N =
      "<div class='dialog basic-dialog room-link-view'><h1>Room link</h1><p>Use this url to link others directly into this room.</p><input data-hook='link' readonly></input><div class='buttons'><button data-hook='close'>Close</button><button data-hook='copy'>Copy to clipboard</button></div></div>";
    ab.tj =
      "<tr><td><span data-hook='tag'></span><span data-hook='name'></span></td><td data-hook='players'></td><td data-hook='pass'></td><td><div data-hook='flag' class='flagico'></div><span data-hook='distance'></span></td></tr>";
    Aa.tj =
      "<div class='roomlist-view'><div class='notice' data-hook='notice' hidden><div data-hook='notice-contents'>Testing the notice.</div><div data-hook='notice-close'><i class='icon-cancel'></i></div></div><div class='dialog'><h1>Room list</h1><p>Tip: Join rooms near you to reduce lag.</p><div class='splitter'><div class='list'><table class='header'><colgroup><col><col><col><col></colgroup><thead><tr><td>Name</td><td>Players</td><td>Pass</td><td>Distance</td></tr></thead></table><div class='separator'></div><div class='content' data-hook='listscroll'><table><colgroup><col><col><col><col></colgroup><tbody data-hook='list'></tbody></table></div><div class='filters'><span class='bool' data-hook='fil-pass'>Show locked <i></i></span><span class='bool' data-hook='fil-full'>Show full <i></i></span></div></div><div class='buttons'><button data-hook='refresh'><i class='icon-cw'></i><div>Refresh</div></button><button data-hook='join'><i class='icon-login'></i><div>Join Room</div></button><button data-hook='create'><i class='icon-plus'></i><div>Create Room</div></button><div class='spacer'></div><div class='file-btn'><label for='replayfile'><i class='icon-play'></i><div>Replays</div></label><input id='replayfile' type='file' accept='.hbr2' data-hook='replayfile'/></div><button data-hook='settings'><i class='icon-cog'></i><div>Settings</div></button><button data-hook='changenick'><i class='icon-cw'></i><div>Change Nick</div></button></div></div><p data-hook='count'></p></div></div>";
    Za.N =
      "<div class='room-password-view'><div class='dialog'><h1>Password required</h1><div class='label-input'><label>Password:</label><input data-hook='input' /></div><div class='buttons'><button data-hook='cancel'>Cancel</button><button data-hook='ok'>Ok</button></div></div></div>";
    Ya.N =
      "<div class='room-view'><div class='container'><h1 data-hook='room-name'></h1><div class='header-btns'><button data-hook='rec-btn'><i class='icon-circle'></i>Rec</button><button data-hook='link-btn'><i class='icon-link'></i>Link</button><button data-hook='leave-btn'><i class='icon-logout'></i>Leave</button></div><div class='teams'><div class='tools admin-only'><button data-hook='auto-btn'>Auto</button><button data-hook='rand-btn'>Rand</button><button data-hook='lock-btn'>Lock</button><button data-hook='reset-all-btn'>Reset</button></div><div data-hook='red-list'></div><div data-hook='spec-list'></div><div data-hook='blue-list'></div><div class='spacer admin-only'></div></div><div class='settings'><div><label class='lbl'>Time limit</label><select data-hook='time-limit-sel'></select></div><div><label class='lbl'>Score limit</label><select data-hook='score-limit-sel'></select></div><div><label class='lbl'>Stadium</label><label class='val' data-hook='stadium-name'>testing the stadium name</label><button class='admin-only' data-hook='stadium-pick'>Pick</button></div></div><div class='controls admin-only'><button data-hook='start-btn'><i class='icon-play'></i>Start game</button><button data-hook='stop-btn'><i class='icon-stop'></i>Stop game</button><button data-hook='pause-btn'><i class='icon-pause'></i>Pause</button></div></div></div>";
    aa.N =
      "<div class='dialog settings-view'><h1>Settings</h1><button data-hook='close'>Close</button><div class='tabs'><button data-hook='soundbtn'>Sound</button><button data-hook='videobtn'>Video</button><button data-hook='inputbtn'>Input</button><button data-hook='miscbtn'>Misc</button></div><div data-hook='presskey' tabindex='-1'><div>Press a key</div></div><div class='tabcontents'><div class='section' data-hook='miscsec'><div class='loc' data-hook='loc'></div><div class='loc' data-hook='loc-ovr'></div><button data-hook='loc-ovr-btn'></button></div><div class='section' data-hook='soundsec'><div data-hook=\"tsound-main\">Sounds enabled</div><div data-hook=\"tsound-chat\">Chat sound enabled</div><div data-hook=\"tsound-highlight\">Nick highlight sound enabled</div><div data-hook=\"tsound-crowd\">Crowd sound enabled</div></div><div class='section' data-hook='inputsec'></div><div class='section' data-hook='videosec'><div>Viewport Mode:<select data-hook='viewmode'><option>Dynamic</option><option>Restricted 840x410</option><option>Full 1x Zoom</option><option>Full 1.25x Zoom</option><option>Full 1.5x Zoom</option><option>Full 1.75x Zoom</option><option>Full 2x Zoom</option><option>Full 2.25x Zoom</option><option>Full 2.5x Zoom</option></select></div><div>FPS Limit:<select data-hook='fps'><option>None (Recommended)</option><option>30</option></select></div><div>Resolution Scaling:<select data-hook='resscale'><option>100%</option><option>75%</option><option>50%</option><option>25%</option></select></div><div data-hook=\"tvideo-teamcol\">Custom team colors enabled</div><div data-hook=\"tvideo-showindicators\">Show chat indicators</div><div data-hook=\"tvideo-showavatars\">Show player avatars</div></div></div></div>";
    aa.$l = 0;
    P.N =
      "<div class='simple-dialog-view'><div class='dialog basic-dialog'><h1 data-hook='title'></h1><p data-hook='content'></p><div class='buttons' data-hook='buttons'></div></div></div>";
    Xa.N =
      "<div class='stats-view'><p>Ping: <span data-hook='ping'></span></p><p>Max Ping: <span data-hook='max-ping'></span></p><p>Fps: <span data-hook='fps'></span></p><div data-hook='graph'></div></div>";
    Wa.N =
      '<div class=\'unsupported-browser-view\'><div class=\'dialog\'><h1>Unsupported Browser</h1><p>Sorry! Your browser doesn\'t yet implement some features which are required for HaxBall to work.</p><p>The missing features are: <span data-hook=\'features\'></span></p><h2>Recommended browsers:</h2><div><a href="https://www.mozilla.org/firefox/new/"><img src="images/firefox-icon.png"/>Firefox</a></div><div><a href="https://www.google.com/chrome/"><img src="images/chrome-icon.png"/>Chrome</a></div><div><a href="http://www.opera.com/"><img src="images/opera-icon.png"/>Opera</a></div></div></div>';
    */
    r.sn = {}.toString;
    u.qp();
  })(window/*
    "undefined" != typeof window
      ? window
      : "undefined" != typeof global
      ? global
      : "undefined" != typeof self
      ? self
      : this
  */);
}

inherits(Haxball, EventEmitter);

Haxball.generateAuthKey = function(){
  try {
    return crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]).then(function (a) {
        var b = a.privateKey;
        return crypto.subtle.exportKey("jwk", b).then(function (a) {
          return "idkey." + a.x + "." + a.y + "." + a.d;
        });
      });
  } catch (a) {
    return Promise.reject(a);
  }
};

function Room(internalData, plugins){
  if (!internalData.isHost)
    this.sdp = internalData.roomObj.ya.pa.Ra.remoteDescription.sdp; // usage: require("sdp-transform").parse(sdp);

  this.isHost = internalData.isHost;
  this.currentPlayerId = internalData.roomObj.ya.uc;
  this.currentPlayer = internalData.roomObj.ya.T.I.filter((x)=>(x.V==this.currentPlayerId))[0];
  this.kickTimeout = 20;
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

  this.setPluginActive = function(name, active){
    /*
    var oIdx = that.plugins.findIndex((x)=>x.name==name);
    if (oIdx<0)
      return;
    var p = that.plugins[oIdx];
    */
    var p = that.plugins.filter((x)=>x.name==name)[0];
    if (!p)
      return;
    if (p.active && !active){
      var idx = that.activePlugins.findIndex((x)=>x.name==name);
      if (idx<0)
        return;
      that.activePlugins.splice(idx, 1);
    }
    else if (!p.active && active){
      var idx = that.activePlugins.findIndex((x)=>x.name==name);
      if (idx>=0)
        return;
      //that.activePlugins.splice(oIdx, 0, p); // might change the order of plugins, therefore we have to implement addInOrder.
      addInOrder(that.plugins, that.activePlugins, p); // insert plugin to its old index. 
    }
    p.active = active;
    p.onActiveChanged && p.onActiveChanged();
    that.onPluginActiveChange && that.onPluginActiveChange(p);
  };

  this._modifyPlayerData = function(playerId, name, flag, avatar, conn, auth){
    var a = [name, flag, avatar], customData;
    that.modifyPlayerDataBefore && ([a, customData] = that.modifyPlayerDataBefore(playerId, a[0], a[1], a[2], conn, auth));
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.modifyPlayerData && a && (a = p.modifyPlayerData(playerId, a[0], a[1], a[2], conn, auth, customData));
      });
      that.modifyPlayerDataAfter && a && (a = that.modifyPlayerDataAfter(playerId, a[0], a[1], a[2], conn, auth, customData));
    }
    return a;
  };

  this._modifyPlayerPing = function(playerId, ping){
    var customData;
    that.modifyPlayerPingBefore && ([ping, customData] = that.modifyPlayerPingBefore(playerId, ping));
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.modifyPlayerPing && (ping = p.modifyPlayerPing(playerId, ping, customData));
      });
      that.modifyPlayerPingAfter && (ping = that.modifyPlayerPingAfter(playerId, ping, customData));
    }
    return ping;
  };

  this.onBeforeOperationReceived = function(obj, msg){
    if (obj.type != OperationType.SendChat)
      return;
    var m = obj.getValue(msg, "text");
    if (m.startsWith("!")){  // custom chat logic for extra commands
      return {
        isCommand: true, 
        data: m.trimEnd().split(" ")
      };
    };
    return {
      isCommand: false
    };
  };

  this._onOperationReceived = function(obj, msg){
    var customData = that.onBeforeOperationReceived && that.onBeforeOperationReceived(obj, msg), b = (customData!==false);
    that.activePlugins.forEach((p)=>{
      if (b && p.onOperationReceived && !p.onOperationReceived(obj, msg, customData))
        b = false;
    });
    if (b && that.onAfterOperationReceived && !that.onAfterOperationReceived(obj, msg, customData))
      b = false;
    return b;
  };

  this._onRoomLink = function(link){
    var customData = that.onBeforeRoomLink && that.onBeforeRoomLink(link);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onRoomLink && p.onRoomLink(link, customData);
      });
      that.onAfterRoomLink && that.onAfterRoomLink(link, customData);
    }
  };

  this._onPlayerBallKick = function(playerId){
    var customData = that.onBeforePlayerBallKick && that.onBeforePlayerBallKick(playerId);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onPlayerBallKick && p.onPlayerBallKick(playerId, customData);
      });
      that.onAfterPlayerBallKick && that.onAfterPlayerBallKick(playerId, customData);
    }
  };

  this._onTeamGoal = function(teamId){
    var customData = that.onBeforeTeamGoal && that.onBeforeTeamGoal(teamId);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onTeamGoal && p.onTeamGoal(teamId, customData);
      });
      that.onAfterTeamGoal && that.onAfterTeamGoal(teamId, customData);
    }
  };

  this._onGameEnd = function(winningTeamId){
    var customData = that.onBeforeGameEnd && that.onBeforeGameEnd(winningTeamId);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onGameEnd && p.onGameEnd(winningTeamId, customData);
      });
      that.onAfterGameEnd && that.onAfterGameEnd(winningTeamId, customData);
    }
  };

  this._onGameTick = function(){
    var customData = that.onBeforeGameTick && that.onBeforeGameTick();
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onGameTick && p.onGameTick(customData);
      });
      that.onAfterGameTick && that.onAfterGameTick(customData);
    }
  };

  this._onPlayerSyncChange = function(playerId, value){
    var customData = that.onBeforePlayerSyncChange && that.onBeforePlayerSyncChange(playerId, value);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onPlayerSyncChange && p.onPlayerSyncChange(playerId, value, customData);
      });
      that.onAfterPlayerSyncChange && that.onAfterPlayerSyncChange(playerId, value, customData);
    }
  };

  this._onAnnouncement = function(msg, color, style, sound){
    var customData = that.onBeforeAnnouncement && that.onBeforeAnnouncement(msg, color, style, sound);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onAnnouncement && p.onAnnouncement(msg, color, style, sound, customData);
      });
      that.onAfterAnnouncement && that.onAfterAnnouncement(msg, color, style, sound, customData);
    }
  };

  this._onAutoTeams1 = function(playerId, teamId, byId){
    var customData = that.onBeforeAutoTeams1 && that.onBeforeAutoTeams1(playerId, teamId, byId);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onAutoTeams1 && p.onAutoTeams1(playerId, teamId, byId, customData);
      });
      that.onAfterAutoTeams1 && that.onAfterAutoTeams1(playerId, teamId, byId, customData);
    }
  };

  this._onAutoTeams2 = function(playerId1, teamId1, playerId2, teamId2, byId){
    var customData = that.onBeforeAutoTeams2 && that.onBeforeAutoTeams2(playerId1, teamId1, playerId2, teamId2, byId);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onAutoTeams2 && p.onAutoTeams2(playerId1, teamId1, playerId2, teamId2, byId, customData);
      });
      that.onAfterAutoTeams2 && that.onAfterAutoTeams2(playerId1, teamId1, playerId2, teamId2, byId, customData);
    }
  };

  this._onScoreLimitChange = function(value, byId){
    var customData = that.onBeforeScoreLimitChange && that.onBeforeScoreLimitChange(value, byId);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onScoreLimitChange && p.onScoreLimitChange(value, byId, customData);
      });
      that.onAfterScoreLimitChange && that.onAfterScoreLimitChange(value, byId, customData);
    }
  };

  this._onTimeLimitChange = function(value, byId){
    var customData = that.onBeforeTimeLimitChange && that.onBeforeTimeLimitChange(value, byId);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onTimeLimitChange && p.onTimeLimitChange(value, byId, customData);
      });
      that.onAfterTimeLimitChange && that.onAfterTimeLimitChange(value, byId, customData);
    }
  };

  this._onPlayerAdminChange = function(id, isAdmin, byId){
    var customData = that.onBeforePlayerAdminChange && that.onBeforePlayerAdminChange(id, isAdmin, byId);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onPlayerAdminChange && p.onPlayerAdminChange(id, isAdmin, byId, customData);
      });
      that.onAfterPlayerAdminChange && that.onAfterPlayerAdminChange(id, isAdmin, byId, customData);
    }
  };

  this._onPlayerAvatarChange = function(id, value){
    var customData = that.onBeforePlayerAvatarChange && that.onBeforePlayerAvatarChange(id, value);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onPlayerAvatarChange && p.onPlayerAvatarChange(id, value, customData);
      });
      that.onAfterPlayerAvatarChange && that.onAfterPlayerAvatarChange(id, value, customData);
    }
  };

  this._onPlayerTeamChange = function(id, teamId, byId){
    var customData = that.onBeforePlayerTeamChange && that.onBeforePlayerTeamChange(id, teamId, byId);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onPlayerTeamChange && p.onPlayerTeamChange(id, teamId, byId, customData);
      });
      that.onAfterPlayerTeamChange && that.onAfterPlayerTeamChange(id, teamId, byId, customData);
    }
  };

  this._onStadiumChange = function(stadium, byId){
    var customData = that.onBeforeStadiumChange && that.onBeforeStadiumChange(stadium, byId);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onStadiumChange && p.onStadiumChange(stadium, byId, customData);
      });
      that.onAfterStadiumChange && that.onAfterStadiumChange(stadium, byId, customData);
    }
  };

  this._onTeamsLockChange = function(value, byId){
    var customData = that.onBeforeTeamsLockChange && that.onBeforeTeamsLockChange(value, byId);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onTeamsLockChange && p.onTeamsLockChange(value, byId, customData);
      });
      that.onAfterTeamsLockChange && that.onAfterTeamsLockChange(value, byId, customData);
    }
  };

  this._onPlayerJoin = function(id, name, flag, avatar, conn, auth){
    var customData = that.onBeforePlayerJoin && that.onBeforePlayerJoin(id, name, flag, avatar, conn, auth);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onPlayerJoin && p.onPlayerJoin(id, name, flag, avatar, conn, auth, customData);
      });
      that.onAfterPlayerJoin && that.onAfterPlayerJoin(id, name, flag, avatar, conn, auth, customData);
    }
  };

  this._onGamePauseChange = function(isPaused, byId){
    var customData = that.onBeforeGamePauseChange && that.onBeforeGamePauseChange(isPaused, byId);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onGamePauseChange && p.onGamePauseChange(isPaused, byId, customData);
      });
      that.onAfterGamePauseChange && that.onAfterGamePauseChange(isPaused, byId, customData);
    }
  };

  this._onPlayerChat = function(id, message){
    var customData = that.onBeforePlayerChat && that.onBeforePlayerChat(id, message);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onPlayerChat && p.onPlayerChat(id, message, customData);
      });
      that.onAfterPlayerChat && that.onAfterPlayerChat(id, message, customData);
    }
  };

  this._onPlayerInputChange = function(id, value){
    var customData = that.onBeforePlayerInputChange && that.onBeforePlayerInputChange(id, value);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onPlayerInputChange && p.onPlayerInputChange(id, value, customData);
      });
      that.onAfterPlayerInputChange && that.onAfterPlayerInputChange(id, value, customData);
    }
  };

  this._onPlayerChatIndicatorChange = function(id, value){
    var customData = that.onBeforePlayerChatIndicatorChange && that.onBeforePlayerChatIndicatorChange(id, value);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onPlayerChatIndicatorChange && p.onPlayerChatIndicatorChange(id, value, customData);
      });
      that.onAfterPlayerChatIndicatorChange && that.onAfterPlayerChatIndicatorChange(id, value, customData);
    }
  };

  this._onPlayerLeave = function(id, reason, isBanned, byId){
    var customData = that.onBeforePlayerLeave && that.onBeforePlayerLeave(id, reason, isBanned, byId);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onPlayerLeave && p.onPlayerLeave(id, reason, isBanned, byId, customData);
      });
      that.onAfterPlayerLeave && that.onAfterPlayerLeave(id, reason, isBanned, byId, customData);
    }
  };

  this._onSetDiscProperties = function(id, type, data1, data2){
    var customData = that.onBeforeSetDiscProperties && that.onBeforeSetDiscProperties(id, type, data1, data2);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onSetDiscProperties && p.onSetDiscProperties(id, type, data1, data2, customData);
      });
      that.onAfterSetDiscProperties && that.onAfterSetDiscProperties(id, type, data1, data2, customData);
    }
  };

  this._onKickRateLimitChange = function(min, rate, burst, byId){
    var customData = that.onBeforeKickRateLimitChange && that.onBeforeKickRateLimitChange(min, rate, burst, byId);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onKickRateLimitChange && p.onKickRateLimitChange(min, rate, burst, byId, customData);
      });
      that.onAfterKickRateLimitChange && that.onAfterKickRateLimitChange(min, rate, burst, byId, customData);
    }
  };

  this._onGameStart = function(byId){
    var customData = that.onBeforeGameStart && that.onBeforeGameStart(byId);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onGameStart && p.onGameStart(byId, customData);
      });
      that.onAfterGameStart && that.onAfterGameStart(byId, customData);
    }
  };

  this._onGameStop = function(byId){
    var customData = that.onBeforeGameStop && that.onBeforeGameStop(byId);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onGameStop && p.onGameStop(byId, customData);
      });
      that.onAfterGameStop && that.onAfterGameStop(byId, customData);
    }
  };

  this._onPingData = function(array){
    var customData = that.onBeforePingData && that.onBeforePingData(array);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onPingData && p.onPingData(array, customData);
      });
      that.onAfterPingData && that.onAfterPingData(array, customData);
    }
  };

  this._onCollisionDiscVsDisc = function(discId1, discPlayerId1, discId2, discPlayerId2){
    var customData = that.onBeforeCollisionDiscVsDisc && that.onBeforeCollisionDiscVsDisc(discId1, discPlayerId1, discId2, discPlayerId2);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onCollisionDiscVsDisc && p.onCollisionDiscVsDisc(discId1, discPlayerId1, discId2, discPlayerId2, customData);
      });
      that.onAfterCollisionDiscVsDisc && that.onAfterCollisionDiscVsDisc(discId1, discPlayerId1, discId2, discPlayerId2, customData);
    }
  };

  this._onCollisionDiscVsSegment = function(discId, discPlayerId, segmentId){
    var customData = that.onBeforeCollisionDiscVsSegment && that.onBeforeCollisionDiscVsSegment(discId, discPlayerId, segmentId);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onCollisionDiscVsSegment && p.onCollisionDiscVsSegment(discId, discPlayerId, segmentId, customData);
      });
      that.onAfterCollisionDiscVsSegment && that.onAfterCollisionDiscVsSegment(discId, discPlayerId, segmentId, customData);
    }
  };

  this._onCollisionDiscVsPlane = function(discId, discPlayerId, planeId){
    var customData = that.onBeforeCollisionDiscVsPlane && that.onBeforeCollisionDiscVsPlane(discId, discPlayerId, planeId);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onCollisionDiscVsPlane && p.onCollisionDiscVsPlane(discId, discPlayerId, planeId, customData);
      });
      that.onAfterCollisionDiscVsPlane && that.onAfterCollisionDiscVsPlane(discId, discPlayerId, planeId, customData);
    }
  };

  this._onBansClear = function(){
    var customData = that.onBeforeBansClear && that.onBeforeBansClear();
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onBansClear && p.onBansClear(customData);
      });
      that.onAfterBansClear && that.onAfterBansClear(customData);
    }
  };

  this._onExtrapolationChange = function(value){
    var customData = that.onBeforeExtrapolationChange && that.onBeforeExtrapolationChange(value);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onExtrapolationChange && p.onExtrapolationChange(value, customData);
      });
      that.onAfterExtrapolationChange && that.onAfterExtrapolationChange(value, customData);
    }
  };

  this._onHandicapChange = function(value){
    var customData = that.onBeforeHandicapChange && that.onBeforeHandicapChange(value);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onHandicapChange && p.onHandicapChange(value, customData);
      });
      that.onAfterHandicapChange && that.onAfterHandicapChange(value, customData);
    }
  };

  this._onRoomRecaptchaModeChange = function(on){
    var customData = that.onBeforeRoomRecaptchaModeChange && that.onBeforeRoomRecaptchaModeChange(on);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onRoomRecaptchaModeChange && p.onRoomRecaptchaModeChange(on, customData);
      });
      that.onAfterRoomRecaptchaModeChange && that.onAfterRoomRecaptchaModeChange(on, customData);
    }
  };

  this._onRoomPropertiesChange = function(props){
    var customData = that.onBeforeRoomPropertiesChange && that.onBeforeRoomPropertiesChange(props);
    if (customData!==false){
      that.activePlugins.forEach((p)=>{
        p.onRoomPropertiesChange && p.onRoomPropertiesChange(props, customData);
      });
      that.onAfterRoomPropertiesChange && that.onAfterRoomPropertiesChange(props, customData);
    }
  };

  this.setProperties = function(properties) { // { name, password, geo: { lat, lon, flag }, playerCount, maxPlayerCount, fakePassword }
    if (!internalData.isHost)
      return;
    internalData.roomObj?.Of.__srp__(properties);
  };

  this.setRecaptcha = function(on) { // on: true | false
    internalData.roomObj?.ya.Ic.Ei(on);
  };

  this.setKickRateLimit = function(min, rate, burst) {
    var msg = internalData.kickRateLimitObj.la(min, rate, burst);
    internalData.roomObj?.ya.ra(msg);
    internalData.execOperationReceivedOnHost(msg);
  };
  
  this.setHandicap = function(handicap) {
    internalData.roomObj?.ya.kr(handicap);
  };

  this.setExtrapolation = function(extrapolation) {
    internalData.generalStorageObj.rd.Xa(extrapolation);
    internalData.roomObj?.ya.gm(extrapolation);
  };
  
  this.clearBans = function() {
    if (!internalData.isHost)
      return;
    internalData.roomObj?.ya.Ud();
  };

  this.setAvatar = function(avatar) {
    null != avatar && (avatar = U.Qc(avatar, 2));
    internalData.generalStorageObj.sh.Xa(avatar);
    var msg = internalData.avatarChangerObj.la(avatar);
    internalData.roomObj?.ya.ra(msg);
    internalData.execOperationReceivedOnHost(msg);
  };

  this.setChatIndicatorActive = function(active) {
    var msg = internalData.chatIndicatorObj.la(active ? 1 : 0);
    internalData.roomObj?.ya.ra(msg);
    internalData.execOperationReceivedOnHost(msg);
  };

  this.getCurrentMap = function() {
    return internalData.roomObj?.ya?.T?.S;
  };

  this.mapChecksum = function(map) { // returns null for original maps, checksum value for custom maps
    return map.Pe() ? null : J.Vg(map.Sj(), 8);
  };

  this.setTeamColors = function(team, clear, ...colors) { // team: "blue" | "red", clear: boolean, colors: minimum 2 parseable color parameters 
    var msg = internalData.teamColorsObj.__cq__(team, clear, ...colors);
    internalData.roomObj?.ya.ra(msg);
    internalData.execOperationReceivedOnHost(msg);
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
    var d = new internalData.chatObj();
    d.Tc = msg;
    null != targetId ? internalData.dummyPromise.then(function() {
      x._mf_(d, targetId);
    }) : x.ra(d);
    internalData.execOperationReceivedOnHost(d, targetId);
  };

  this.sendChat = function(msg, targetId){  // can only use targetId in host mode.
    if (internalData.isHost)
      sendIndividualChat(msg, targetId);
    else{
      var x = internalData.roomObj?.ya;
      if (!x)
        return;
      /*internalData.roomObj.Of.gf(msg) || (()=>{*/
      var c = new internalData.chatObj();
      c.Tc = msg;
      x.ra(c);
      internalData.execOperationReceivedOnHost(c);
      //})();
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
    var h = internalData.announcementObj?.la(msg, color, style, sound);
    null != targetId ? internalData.dummyPromise.then(function() {
      x._mf_(h, targetId);
    }) : x.ra(h);
    internalData.execOperationReceivedOnHost(h, targetId);
  };

  this.setDiscProperties = function(discId, properties) { // host-only function
    if (!internalData.isHost)
      return;
    var x = internalData.roomObj?.ya;
    if (!x)
      return;
    var msg = internalData.discPropertiesObj?._Kf_(discId, !1, properties);
    x.ra(msg);
    internalData.execOperationReceivedOnHost(msg);
  };

  this.setPlayerDiscProperties = function(playerId, properties) { // host-only function
    if (!internalData.isHost)
      return;
    var x = internalData.roomObj?.ya;
    if (!x)
      return;
    var msg = internalData.discPropertiesObj?._Kf_(playerId, !0, properties);
    x.ra(msg);
    internalData.execOperationReceivedOnHost(msg);
  };

  this.getKeyState = function(){
    return internalData.keyState;
    //return internalData.roomObj?.ob.$d;
  };

  this.setKeyState = function(state){
    if ((state&16) > 0 && (internalData.keyState&16) > 0 && !that.currentPlayer?.Wb){
      internalData.keyState = state&-17;
      setTimeout(()=>{
        internalData.keyState = state;
      }, that.kickTimeout);
    }
    else
      internalData.keyState = state;
  };

  this.startGame = function(){
    internalData.roomObj?.j?.Yp();
  };

  this.stopGame = function(){
    internalData.roomObj?.j?.Zp();
  };

  this.pauseGame = function(){
    internalData.roomObj?.j?.Mp();
  };

  this.autoTeams = function(){
    internalData.roomObj?.j?.Dp();
  };

  this.lockTeams = function(){
    internalData.roomObj?.j?.$p(!(internalData.roomPhysicsObj?.Pc));
  };

  this.isGamePaused = function(){
    return (120 == internalData.roomPhysicsObj?.K?.Oa);
  };

  this.resetTeams = function(){
    internalData.roomObj?.j?.ee(internalData.teams.blue);
    internalData.roomObj?.j?.ee(internalData.teams.red);
  };

  this.startRecording = function(){ // return true(success)/false(failure - already recording)
    return internalData.roomObj?.j?._Qp_(true);
  };

  this.stopRecording = function(){ // return Uint8Array(success)/null(failure - recording not started)
    return internalData.roomObj?.j?._Qp_(false);
  };

  this.randTeams = function(){
    internalData.roomObj?.j?.Pp();
  };

  this.setSync = function(value){ // host-only
    internalData.roomObj?.ya?.T.ko(value);
  }

  this.leave = function(){
    internalData.roomObj?.j?.de();
  };

  this.getDefaultStadium = function(index){
    return internalData.mapObj.wb[index];
  };

  this.parseStadium = function(textDataFromHbsFile, onError){
    try {
      var stadium = new internalData.mapObj();
      stadium.Lk(textDataFromHbsFile);
      return stadium;
    } catch (k) {
      b = k instanceof internalData.StadiumSyntaxError ? k.Ta : k,
      b instanceof SyntaxError ? onError("SyntaxError in line: " + internalData.parserObj.Be(b.lineNumber, "")) : 
      b instanceof internalData.StadiumCustomError ? onError(b.xp) : 
      onError("Error loading stadium file.")
    }
  };

  this.setCurrentStadium = function(stadium, onError){
    try {
      internalData.roomObj?.j?.og(stadium);
    } catch (k) {
      b = k instanceof internalData.StadiumSyntaxError ? k.Ta : k,
      b instanceof SyntaxError ? onError("SyntaxError in line: " + internalData.parserObj.Be(b.lineNumber, "")) : 
      b instanceof internalData.StadiumCustomError ? onError(b.xp) : 
      onError("Error loading stadium file.")
    }
  };

  this.setTimeLimit = function(value){
    internalData.roomObj?.j?.aq(value);
  };

  this.setScoreLimit = function(value){
    internalData.roomObj?.j?.Tp(value);
  };

  this.changeTeam = function(teamId){
    switch (teamId){
      case 0: { 
        internalData.roomObj?.j?.mg(internalData.roomObj.ya.uc, internalData.teams.spec);  // room.currentPlayerId = internalData.roomObj.ya.uc
        break; 
      }
      case 1: { 
        internalData.roomObj?.j?.mg(internalData.roomObj.ya.uc, internalData.teams.red);  // room.currentPlayerId = internalData.roomObj.ya.uc
        break; 
      }
      case 2: { 
        internalData.roomObj?.j?.mg(internalData.roomObj.ya.uc, internalData.teams.blue);  // room.currentPlayerId = internalData.roomObj.ya.uc
        break; 
      }
    }
  };

  this.resetTeam = function(teamId){
    switch (teamId){
      case 0: { 
        internalData.roomObj?.j?.ee(internalData.teams.spec); 
        break; 
      }
      case 1: { 
        internalData.roomObj?.j?.ee(internalData.teams.red); 
        break; 
      }
      case 2: { 
        internalData.roomObj?.j?.ee(internalData.teams.blue); 
        break; 
      }
    }
  };

  this.setPlayerTeam = function(playerId, teamId){
    switch (teamId){
      case 0: { 
        internalData.roomObj?.j?.mg(playerId, internalData.teams.spec);
        break; 
      }
      case 1: { 
        internalData.roomObj?.j?.mg(playerId, internalData.teams.red);
        break; 
      }
      case 2: { 
        internalData.roomObj?.j?.mg(playerId, internalData.teams.blue);
        break; 
      }
    }
  };

  this.setPlayerAdmin = function(playerId, isAdmin){
    var msg = internalData.adminChangerObj?.la(playerId, isAdmin);
    internalData.roomObj?.ya?.ra(msg);
    internalData.execOperationReceivedOnHost(msg);
  };

  this.kickPlayer = function(playerId, reason, isBanning){
    var msg = internalData.kickerObj?.la(playerId, reason, isBanning);
    internalData.roomObj?.ya?.ra(msg);
    internalData.execOperationReceivedOnHost(msg);
  };

  this.getPlayerOriginal = function(id){
    return internalData.roomObj?.ya?.T?.I?.filter((x)=>x.V==id)[0];
  };

  this.getPlayer = function(id){
    var x = internalData.roomObj?.ya?.T?.I?.filter((x)=>x.V==id)[0];
    if (!x)
      return null;
    return {
      id: x.V,
      nick: x.w,
      flag: x.Kd,
      avatar: x.Xb,
      ping: x.yb,
      input: x.ob,
      isAdmin: x.cb,
      isDesync: x.Ld,
      isKicking: x.Wb,
      teamId: x.ea.$
    };
  };

  this.getPlayersOriginal = function(){
    return internalData.roomObj?.ya?.T?.I;
  };

  this.getPlayers = function(){
    return internalData.roomObj?.ya?.T?.I?.map((x)=>{
      return {
        id: x.V,
        nick: x.w,
        flag: x.Kd,
        avatar: x.Xb,
        ping: x.yb,
        input: x.ob,
        isAdmin: x.cb,
        isDesync: x.Ld,
        isKicking: x.Wb,
        teamId: x.ea.$
      };
    });
  };

  this.getBallOriginal = function(extrapolated = true){
    var p = extrapolated ? internalData.extrapolatedRoomPhysicsObj?.K : internalData.roomPhysicsObj?.K;
    return p?.ta.F[0];
  };

  this.getBall = function(extrapolated = true){
    var p = extrapolated ? internalData.extrapolatedRoomPhysicsObj?.K : internalData.roomPhysicsObj?.K;
    return internalData.ObjectConverter.mo(p?.ta.F[0], {a:{},D:{},oa:{}});
  };

  this.getDiscsOriginal = function(extrapolated = true){
    var p = extrapolated ? internalData.extrapolatedRoomPhysicsObj?.K : internalData.roomPhysicsObj?.K;
    return p?.ta.F;
  };

  this.getDiscs = function(extrapolated = true){
    var p = extrapolated ? internalData.extrapolatedRoomPhysicsObj?.K : internalData.roomPhysicsObj?.K;
    return p?.ta.F.map((x)=>internalData.ObjectConverter.mo(x, {a:{},D:{},oa:{}}));
  };

  this.getDiscOriginal = function(discId, extrapolated = true){
    var p = extrapolated ? internalData.extrapolatedRoomPhysicsObj?.K : internalData.roomPhysicsObj?.K;
    return p?.ta.F[discId];
  };

  this.getDisc = function(discId, extrapolated = true){
    var p = extrapolated ? internalData.extrapolatedRoomPhysicsObj?.K : internalData.roomPhysicsObj?.K;
    return internalData.ObjectConverter.mo(p?.ta.F[discId], {a:{},D:{},oa:{}});
  };

  this.getPlayerDiscOriginal = function(playerId, extrapolated = true){
    var p = extrapolated ? internalData.extrapolatedRoomPhysicsObj?.K : internalData.roomPhysicsObj?.K;
    var a1 = p?.ta.F, a2 = internalData.roomObj?.ya?.T?.S.F;
    if (!a1 || !a2)
      return;
    for (var i=a2.length;i<a1.length;i++)
      if (a1[i].playerId==playerId)
        return a1[i];
  };

  this.getPlayerDisc = function(playerId, extrapolated = true){
    var p = extrapolated ? internalData.extrapolatedRoomPhysicsObj?.K : internalData.roomPhysicsObj?.K;
    var a1 = p?.ta.F, a2 = internalData.roomObj?.ya?.T?.S.F, i;
    if (!a1 || !a2)
      return;
    for (i=a2.length;i<a1.length;i++)
      if (a1[i].playerId==playerId)
        break;
    if (i>=a1.length)
      return;
    return internalData.ObjectConverter.mo(a1[i], {a:{},D:{},oa:{}});
  };

  this.getPlayerDiscOriginal_exp = function(playerId){
    return internalData.roomObj?.ya?.T?.I.filter((x)=>x.V==playerId)[0]?.H;
  };

  this.getPlayerDisc_exp = function(playerId){
    var v = internalData.roomObj?.ya?.T?.I.filter((x)=>x.V==playerId)[0]?.H;
    if (!v)
      return;
    return internalData.ObjectConverter.mo(v, {a:{},D:{},oa:{}});
  };

  this.getRoomDataOriginal = function(){
    var o = internalData.roomObj?.ya?.T; 
    if (!o)
      return {};
    return {
      o: o,
      p: internalData.roomPhysicsObj?.K,
      ep: internalData.extrapolatedRoomPhysicsObj?.K
    };
  };

  this.getRoomData = function(extrapolated = true){
    var o = internalData.roomObj?.ya?.T, ret = {}; 
    if (!o)
      return ret;
    var p = extrapolated ? internalData.extrapolatedRoomPhysicsObj?.K : internalData.roomPhysicsObj?.K;
    var gameData = {
      active: !!p
    };
    Object.assign(ret, {
      name: o.jc,
      link: internalData.roomObj.Bg,
      timeLimit: o.Da,
      scoreLimit: o.ib,
      game: gameData
    });
    if (!p)
      return ret;
    Object.assign(gameData, {
      redScore: p.Pb,
      blueScore: p.Kb,
      timeElapsed: p.Hc
    });
    var mapData = {
      name: o.S.w,
      width: o.S.$b,
      height: o.S.qc,
      maxViewWidth: o.S.Ye,
      cameraFollow: 1 == o.S.Ge ? "player" : "",
      spawnDistance: o.S.kc,
      kickOffReset: o.S.pf ? "full" : "partial",
      redSpawnPoints: o.S.Dd.map((a)=>([a.x, a.y])),
      blueSpawnPoints: o.S.md.map((a)=>([a.x, a.y])),
      bg: {
        type: 1 == o.S.ld ? "grass" : (2 == o.S.ld ? "hockey" : "none"),
        width: o.S.Td,
        height: o.S.Sd,
        kickOffRadius: o.S.kd,
        cornerRadius: o.S.Uc,
        color: o.S.jd,
        goalLine: o.S.Fe
      },
      playerPhysics: {
        bCoef: o.S.ge.m,
        invMass: o.S.ge.aa,
        damping: o.S.ge.Ca,
        acceleration: o.S.ge.Ce,
        kickingAcceleration: o.S.ge.Te,
        kickingDamping: o.S.ge.Ue,
        kickStrength: o.S.ge.Re,
        cGroup: o.S.ge.v,
        gravity: [o.S.ge.oa.x, o.S.ge.oa.y],
        radius: o.S.ge.Z,
        kickback: o.S.ge.Se
      },
      vertices: p.ta.J.map(internalData.ObjectConverter.Tr),
      segments: p.ta.U.map(internalData.ObjectConverter.fr),
      goals: o.S.tc.map(internalData.ObjectConverter.Jo),
      planes: p.ta.qa.map(internalData.ObjectConverter.gq),
      discs: p.ta.F.map((x)=>{return internalData.ObjectConverter.mo(x, {a:{},D:{},oa:{}});}),
      joints: p.ta.pb.map(internalData.ObjectConverter.ap),
    };
    Object.assign(ret, {
      map: mapData
    });
    return ret;
  };

  this.plugins.forEach((p)=>{
    p.initialize && p.initialize(that);
  });

  this.activePlugins.forEach((p)=>{
    p.onActiveChanged && p.onActiveChanged();
    that.onPluginActiveChange && that.onPluginActiveChange(p);
  });
}

function keyState(dirX, dirY, kick){ // dirX = oneof[-1:left, 0:still, 1:right], dirY = oneof[-1:up, 0:still, 1:down], kick = true/false
  return (kick?16:0) | (dirX>0?8:(dirX<0?4:0)) | (dirY>0?2:(dirY<0?1:0));
}

function Plugin(name, active=false){ // name is important, we activate/deactivate plugins by their names. if active=true, plugin is activated just after initialization.
  this.name = name;
  this.active = active;
}

module.exports = {
  OperationType,
  ConnectionState,
  keyState,
  Plugin,
  Haxball
};

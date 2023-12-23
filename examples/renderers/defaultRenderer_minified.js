module.exports = function(API, params){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Renderer.prototype);
  Renderer.call(this, { // Every renderer should have a unique name.
    name: "default.min",
    version: "1.04",
    author: "basro & abc",
    description: `This is the default renderer currently used in Haxball, with the exception that most if not all of the camera bugs have been fixed.`
  });

  // parameters are exported so that they can be edited outside this class.
  this.defineVariable({ // team_colors
    name: "showTeamColors",
    description: "Show team colors?", 
    type: VariableType.Boolean,
    value: true
  });

  this.defineVariable({ // show_avatars
    name: "showAvatars",
    description: "Show player avatars?", 
    type: VariableType.Boolean,
    value: true
  });

  this.defineVariable({ // view_mode
    name: "viewMode",
    description: "View Mode", 
    type: VariableType.Integer,
    value: 1,
    range: {
      min: -1,
      max: 4,
      step: 1
    }
  });

  this.defineVariable({ // resolution_scale
    name: "resolutionScale",
    description: "Resolution Scale", 
    type: VariableType.Number,
    value: 1,
    range: {
      min: 0,
      max: Infinity,
      step: 0.01
    }
  });

  this.defineVariable({ // show_indicators
    name: "showChatIndicators",
    description: "Show Chat Indicators?", 
    type: VariableType.Boolean,
    value: true
  });

  this.defineVariable({
    name: "transparentDiscBugFix",
    description: "Hide transparent discs?", 
    type: VariableType.Boolean,
    value: true
  });

  var thisRenderer = this, { H, ka, p } = Impl.Core;

  // start of basro's renderer logic

  function Ib(a) {
    this.Yb = a.slice();
  }
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
  function R(a, b) {
    for (var c = [], d = 0; d < a.length; ) c.push(this.sp(a[d++], b));
    this.We = c;
  }
  R.jn = new Ib([0, 0, 2, 1, 0, 0.35, 1, 0, 1, 0, 0.7, 1, 0, 0, 0, 1]);
  R.kn = new Ib([0, -1, 3, 0, 0, 0.35, 0, 0, 0, 0, 0.65, 0, 0, 1, 3, 1]);
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
      d.fillStyle = Utils.numberToColor(b);
      d.fillText(a, 0, 45);
      return c;
    },
    f: R,
  };
  
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
  
  function Ea(_N) {
    this._N = _N;
    this.Xf = !1;
    this.w = "";
    this.uh = 0;
    this.Jf = "";
    this.kb = new ka();
    var a = window.document.createElement("canvas");
    a.width = 64;
    a.height = 64;
    this.rb = a.getContext("2d", null);
    this.Ij = this.rb.createPattern(this.rb.canvas, "no-repeat");
    this.fo();
  }
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
        var c = thisRenderer.showTeamColors/*n_A.xm.L()*/ ? b.kb[a.ea.$] : a.ea.wm, // "team_colors"
          d = null != a.Jd ? a.Jd : a.Xb,
          e = thisRenderer.showAvatars/*n_A.lm.L()*/ && null != d; // "show_avatars"
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
          (this.rb.fillStyle = Utils.numberToColor(b[e++])),
            this.rb.fillRect(c, -32, d + 4, 64),
            (c += d);
        this.rb.restore();
        this.rb.fillStyle = Utils.numberToColor(this.kb.ed);
        this.rb.textAlign = "center";
        this.rb.textBaseline = "alphabetic";
        this.rb.font = "900 34px 'Arial Black','Arial Bold',Gadget,sans-serif";
        this.rb.fillText(a, 32, 44);
        this.Ij = this.rb.createPattern(this.rb.canvas, "no-repeat");
      }
    },
    f: Ea,
  };
  
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
    this.sa = params.canvas;//window.document.createElement("canvas");
    this.sa.mozOpaque = !0;
    this.sa.style.filter = "";
    this.c = this.sa.getContext("2d", { alpha: !1 });
    this.Lo = this.c.createPattern(/*n.Ko*/params.images?.grass, null);
    this.Wn = this.c.createPattern(/*n.Vn*/params.images?.concrete, null);
    this.Un = this.c.createPattern(/*n.Tn*/params.images?.concrete2, null);
  }
  N.b = !0;
  N.Gi = function (a, b) {
    a.imageSmoothingEnabled = b;
    a.mozImageSmoothingEnabled = b;
  };
  N.prototype = {
    uf: function () {
      var a = thisRenderer.viewMode/*n_A.Tb.L()*/, // "view_mode"
        c = this;
      c.zg = thisRenderer.resolutionScale/*n_A.Sl.L()*/; // "resolution_scale"
      0 == a
        ? (/*b.Gg(!0), */(c.kf = 1), (c.jf = 0), (c.xf = 0))
        : (/*b.Gg(!1), */
          (c.xf = 35),
          -1 == a ? (c.jf = 450) : ((c.jf = 0), (c.kf = 1 + 0.25 * (a - 1))));
    },
    Po: function (id, value) {
      var c = this.dd.get(id);
      if (null != c)
        c.Xf = value;
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
      this.spf = d;
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
            null == u && ((u = new Ea(this)), this.dd.set(r.V, u));
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
        0 >= c.Oa && (this.td.C(d), this.td.Kc(this.c));
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
    Xn: function (a, b, c) { // move camera origin (this.Ya)
      if (a > 2 * c.$b)
        this.Ya.x = 0;
      else if (this.Ya.x + 0.5 * a > c.$b)
        this.Ya.x = c.$b - 0.5 * a;
      else if (this.Ya.x - 0.5 * a < -c.$b)
        this.Ya.x = -c.$b + 0.5 * a;
      else if (isNaN(this.Ya.x) || !isFinite(this.Ya.x)) // fix all possible camera bugs
        this.Ya.x = 0;
      
      if (b > 2 * c.qc)
        this.Ya.y = 0;
      else if (this.Ya.y + 0.5 * b > c.qc)
        this.Ya.y = c.qc - 0.5 * b;
      else if (this.Ya.y - 0.5 * b < -c.qc)
        this.Ya.y = -c.qc + 0.5 * b;
      else if (isNaN(this.Ya.y) || !isFinite(this.Ya.y)) // fix all possible camera bugs
        this.Ya.y = 0;
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
        (this.c.fillStyle = Utils.numberToColor(a.jd)),
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
        (this.c.fillStyle = Utils.numberToColor(a.jd)),
        this.c.fillRect(0, 0, this.sa.width, this.sa.height),
        this.c.restore();
      N.Gi(this.c, !0);
    },
    Nq: function (a, b) {
      for (var c = thisRenderer.showChatIndicators/*n_A.Ak.L()*/, d = 0, e = a.I; d < e.length; ) { // "show_indicators"
        var f = e[d];
        ++d;
        var g = f.H;
        if (null != g) {
          var g = g.a,
            h = this.dd.get(f.V);
          c && h.Xf && params.images?.typing && this.c.drawImage(/*n.Dm*/params.images.typing, g.x - 0.5 * /*n.Dm*/params.images.typing.width, g.y - 35);
          f != b && h.so(this.c, g.x, g.y + 50);
        }
      }
    },
    Ll: function (a, b) {
      var t;
      this.c.beginPath();
      null == b
        ? ((t = (a.R | 0)==-1), ((thisRenderer.transparentDiscBugFix || !t) && (this.c.fillStyle = Utils.numberToColor(a.R))), (this.c.strokeStyle = "black"))
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
      } else (!thisRenderer.transparentDiscBugFix || !t) && this.c.fill();
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
        this.c.strokeStyle = Utils.numberToColor(a.R);
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
        this.c.strokeStyle = Utils.numberToColor(a.R);
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
        (this.c.fillStyle = Utils.numberToColor(b)),
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

  // end of basro's renderer logic

  this.Eb = null;
  
  var that = this;

  this.initialize = function(){
    that.Eb = new N();
    that.Eb.uf();
  };

  this.finalize = function(){
    that.Eb = null;
  };
  
  this.render = function(extrapolatedRoomState){ // render logic here. called inside requestAnimationFrame callback
    if (!params.paintGame || !extrapolatedRoomState.K)
      return;
    that.Eb.uf();
    that.Eb.Kc(extrapolatedRoomState, that.room.currentPlayerId);
    params.onRequestAnimationFrame && params.onRequestAnimationFrame(extrapolatedRoomState);
  };

  this.fps = function(){
    return 1/rendererObj.spf;
  };

  // you can keep track of changes using these callbacks, and apply them in your render logic:

  this.onPlayerChatIndicatorChange = function(id, value, customData){ // wl (a, b)
    that.Eb.Po(id, value);
  };

  this.onTeamGoal = function (teamId, customData) { // Ni (a)
    var b = that.Eb.td; // "Red Scores!", "Blue Scores!"
    b.Pa(teamId == p.fa.$ ? b.Fq : b.Bn);
  };

  this.onGameStart = function (byId, customData) { // Ki (a)
    that.Eb.td.Nn();
  };

  this.onGameEnd = function (winningTeamId, customData) { // Oi (a)
    var b = that.Eb.td; // "Red is Victorious!", "Blue is Victorious!"
    b.Pa(winningTeamId == p.fa.$ ? b.Gq : b.Cn);
  };

  this.onTimeIsUp = function(customData) { // Pi ()
    var a = that.Eb.td; // "Time is Up!"
    a.Pa(a.Ar);
  };

  this.onKeyDown = function(e){
    switch(e.keyCode){
      case 49:{
        thisRenderer.viewMode = 1;
        //n_A.setStorageValue("view_mode", 1);
        break;
      }
      case 50:{
        thisRenderer.viewMode = 2;
        //n_A.setStorageValue("view_mode", 2);
        break;
      }
      case 51:{
        thisRenderer.viewMode = 3;
        //n_A.setStorageValue("view_mode", 3);
        break;
      }
      case 52:{
        thisRenderer.viewMode = 0;
        //n_A.setStorageValue("view_mode", 0);
        break;
      }
    }
  }
};

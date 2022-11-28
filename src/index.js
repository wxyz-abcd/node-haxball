const { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } = require("@koush/wrtc");
const { Crypto } = require("@peculiar/webcrypto");
const { inherits } = require("util");
const { EventEmitter } = require("events");
const WebSocket = require("ws");
const XMLHttpRequest = require("xhr2");
const perfHooks = require("perf_hooks");
const JSON5 = require("json5");
const pako = require("pako");
const abcHaxballBotAPI = require("./api.js");

module.exports = abcHaxballBotAPI({
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  console,
  requestAnimationFrame: (callback) => setTimeout(callback, 16.666666666666667),
  cancelAnimationFrame: clearTimeout,
  RTCPeerConnection, 
  RTCIceCandidate, 
  RTCSessionDescription, 
  crypto: new Crypto(),
  inherits,
  EventEmitter,
  WebSocket,
  XMLHttpRequest,
  performance: perfHooks.performance,
  JSON5,
  pako
}, {
  WebSocketChangeOriginAllowed: true,
  WebSocketProxyUrl: null,
  HttpProxyUrl: null
});

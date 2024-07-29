const { WebSocketServer } = require("ws");
const { createServer } = require("http");
const server = createServer();
const wss = new WebSocketServer({server});
var hostWs = null, clients = new Map(), counter = -1;

wss.on("connection", (clientSocket) => {
  var a1 = new Uint8Array(3), a2 = new Uint8Array(3);
  var dv1 = new DataView(a1.buffer), dv2 = new DataView(a2.buffer);
  function sendClientCount(){
    var c = clients.size;
    dv1.setUint8(0, 0);
    dv1.setUint16(1, c);
    hostWs?.send(a1);
  }
  function requestInitialData(clientId){
    dv2.setUint8(0, 1);
    dv2.setUint16(1, clientId);
    hostWs?.send(a2);
  }
  function broadcast(data){
    var it = clients.values(), c = it.next();
    while (!c.done){
      c.value.send(data);
      c = it.next();
    }
  }
  counter++;
  if (counter>0){
    clients.set(counter, clientSocket);
    sendClientCount();
    requestInitialData(counter);
    clientSocket.on("close", () => {
      clients.delete(counter);
      sendClientCount();
    });
    return;
  }
  hostWs = clientSocket;
  hostWs.on("message", (data) => {
    if (data[0]==1){
      //clientSocket.send(data);
      var v = new DataView(data.buffer, data.byteOffset, data.byteLength).getUint16(1);
      var c = clients.get(v);
      if (!c)
        return;
      c.send(data);
      return;
    }
    broadcast(data);
  });
  hostWs.on("close", () => {
    hostWs = null;
    clients.clear();
  });
});
server.listen(1935);
function startStreaming(room){ // this is currently using the interval mode for streaming.
  var socket, int, s = room.startStreaming({/*onClientCount: (cc)=>{},*/ emitData: (data)=>{socket.send(data);}});
  if (!s)
    return;
  var socket = new WebSocket("ws://localhost:1935");
  socket.onopen = ()=>{
    int = setInterval(s.interval, 50);
    s.onSuccess();
  };
  function clear(){
    clearInterval(int);
    int = null;
    s = null;
    socket = null;
  }
  socket.onclose = clear;
  socket.onerror = clear;
  socket.onmessage = ({data})=>{ s.onDataReceived(data); };
}

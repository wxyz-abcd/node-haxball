module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Library.prototype);
  Library.call(this, "gui", { // "gui" is library's name. Every library should have a unique name.
    version: 0.1,
    author: "abc",
    description: `This is a library that contains functions to create custom graphical user interfaces. This library would not work in node.js.`
  });

  var thisLibrary = this;

  this.newWindowFromURL = function(url, width, height){
    var w = window.open(url,"_blank",`left=${screen.availLeft + (screen.availWidth - width) / 2},top=${screen.availTop + (screen.availHeight - height) / 2},width=${width},height=${height},resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes`);
    w.room = thisLibrary.room;
    return w;
  };

  this.newWindowFromContent = function(htmlHeadContent, htmlBodyContent, width, height){
    var w = window.open("about:blank","_blank",`left=${screen.availLeft + (screen.availWidth - width) / 2},top=${screen.availTop + (screen.availHeight - height) / 2},width=${width},height=${height},resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes`);
    w.room = thisLibrary.room;
    w.document.head.innerHTML = htmlHeadContent;
    w.document.body.innerHTML = htmlBodyContent;
    return w;
  };

  this.addScriptFromURLToWindow = function(win, url){
    var script = win.document.createElement("script");
    script.src = url;
    win.document.body.appendChild(script);
  };

  this.addScriptFromContentToWindow = function(win, jsContent){
    var script = win.document.createElement("script");
    script.type = "text/javascript";
    script.text = jsContent;
    win.document.body.appendChild(script);
  };

  this.downloadFile = function(fileName, contents){
    var c = window.document.createElement("a");
    window.document.body.appendChild(c);
    var d = URL.createObjectURL(new Blob([contents], { type: "octet/stream" }));
    c.href = d;
    c.download = fileName;
    c.click();
    URL.revokeObjectURL(d);
    c.remove();
  };
};

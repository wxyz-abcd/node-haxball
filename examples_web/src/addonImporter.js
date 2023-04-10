window.libraries = {};
window.plugins = {};
window.renderers = {};

var importPlugin = function(name, onReady){
  if (window.plugins[name]!=null){
    onReady();
    return;
  }
  window.module = {};
  var s = document.createElement("script");
  s.src = "./plugins/"+name+".js";
  document.body.appendChild(s);
  var int = setInterval(()=>{
    //console.log("next", name);
    if (window.module.exports==null)
      return;
    clearInterval(int);
    window.plugins[name] = window.module.exports;
    window.module = null;
    onReady();
  }, 1);
};

var importLibrary = function(name, onReady){
  if (window.libraries[name]!=null){
    onReady();
    return;
  }
  window.module = {};
  var s = document.createElement("script");
  s.src = "./libraries/"+name+".js";
  document.body.appendChild(s);
  var int = setInterval(()=>{
    //console.log("next", name);
    if (window.module.exports==null)
      return;
    clearInterval(int);
    window.libraries[name] = window.module.exports;
    window.module = null;
    onReady();
  }, 1);
};

var importRenderer = function(name, onReady){
  if (window.renderers[name]!=null){
    onReady();
    return;
  }
  window.module = {};
  var s = document.createElement("script");
  s.src = "./renderers/"+name+".js";
  document.body.appendChild(s);
  var int = setInterval(()=>{
    //console.log("next", name);
    if (window.module.exports==null)
      return;
    clearInterval(int);
    window.renderers[name] = window.module.exports;
    window.module = null;
    onReady();
  }, 1);
};

var importPlugins = function(names, onReady, n = 0){
  if (n>=names.length){
    onReady();
    return;
  }
  importPlugin(names[n], ()=>{
    importPlugins(names, onReady, n+1);
  });
};

var importLibraries = function(names, onReady, n = 0){
  if (n>=names.length){
    onReady();
    return;
  }
  importLibrary(names[n], ()=>{
    importLibraries(names, onReady, n+1);
  });
};

var importRenderers = function(names, onReady, n = 0){
  if (n>=names.length){
    onReady();
    return;
  }
  importRenderer(names[n], ()=>{
    importRenderers(names, onReady, n+1);
  });
};

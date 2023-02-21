function showContextMenu(ctxMenu, x, y, headerText, reverse){
  ctxMenu.style = "visibility:visible;left:"+x+"px;"+(reverse?"bottom":"top")+":"+(reverse?(window.innerHeight-y):y)+"px;";
  ctxMenu.onmouseleave = function(){
    ctxMenu.style = "visibility:hidden";
    ctxMenu.innerHTML = "";
  };
  ctxMenu.innerHTML = "";
  var e = document.createElement("h1");
  e.innerText = headerText;
  ctxMenu.appendChild(e);
  ctxMenu.appendChild(document.createElement("div"));
}

function addContextMenuItem(ctxMenu, text, enabled, onClick){
  var e = document.createElement("p");
  e.innerText = text;
  if (!enabled)
    e.classList.toggle("disabled");
  e.onclick = onClick;
  ctxMenu.children.item(1).appendChild(e);
}

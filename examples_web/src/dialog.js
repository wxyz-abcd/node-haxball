function makeDialog(title){
  var element = document.createElement("div");
  element.className = "dialog";
  var eTitleBar = document.createElement("div");
  eTitleBar.className = "dialogtitlebar";
  element.appendChild(eTitleBar);
  var eContents = document.createElement("div");
  eContents.className = "dialogcontents";
  element.appendChild(eContents);
  var eTitle = document.createElement("div");
  eTitle.className = "dialogtitle";
  eTitle.innerText = title;
  eTitleBar.appendChild(eTitle);
  var eClose = document.createElement("button");
  eClose.className = "button red";
  eClose.innerText = "X";
  eTitleBar.appendChild(eClose);
  var eTitleBar = element.children.item(0);
  var eTitle = eTitleBar.children.item(0);
  var eClose = eTitleBar.children.item(1);
  var eContents = element.children.item(1);
  var obj, dragCoords = null;
  var size = {
    x: 400,
    y: 300
  };
  var coords = {
    x: (window.innerWidth - size.x)/2,
    y: (window.innerHeight - size.y)/2
  };
  function adjustSize(newSize){
    if (!newSize)
      return;
    if (newSize.hasOwnProperty("minx"))
      element.style["min-width"] = size.x+"px";
    if (newSize.hasOwnProperty("miny"))
      element.style["min-height"] = size.y+"px";
    if (newSize.hasOwnProperty("x")){
      size.x = newSize.x;
      element.style["max-width"] = size.x+"px";
    }
    if (newSize.hasOwnProperty("y")){
      size.y = newSize.y;
      element.style["max-height"] = size.y+"px";
    }
  }
  eClose.onclick = ()=>{
    obj.setVisible(false);
    obj.onClose && obj.onClose();
  };
  element.onmousedown = (event)=>{
    dragCoords = {
      x: event.pageX, 
      y: event.pageY
    };
  };
  element.onmousemove = (event)=>{
    if (!dragCoords)
      return;
    coords.x += event.pageX - dragCoords.x;
    coords.y += event.pageY - dragCoords.y;
    element.style.left = coords.x;
    element.style.top = coords.y;
    dragCoords = {
      x: event.pageX, 
      y: event.pageY
    };
  };
  element.onmouseup = (event)=>{
    dragCoords = null;
  };
  element.onmouseleave = (event)=>{
    dragCoords = null;
  };
  obj = {
    element: element,
    setVisible: (visible, newSize)=>{
      element.style.visibility=visible?"visible":"hidden";
      if (visible){
        element.style.left = coords.x;
        element.style.top = coords.y;
      }
      adjustSize(newSize);
    },
    setTitle: (title)=>{
      eTitle.innerText = title;
    },
    getContentsElement: ()=>{
      return eContents;
    },
    isVisible: ()=>{
      return (element.style.visibility=="visible");
    }
  };
  return obj;
}

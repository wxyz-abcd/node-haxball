var makeFlagSelector = function(countries, flagSelector, onFlagSelect){
  Object.defineProperty(flagSelector, "value", {
    get: ()=>{
      return flagSelector.getAttribute("value")
    },
    set: (v)=>{
      flagSelector.setAttribute("value", v);
      flagSelectorPopup.style.visibility = "hidden";
      updateFlagSelectorContents();
    }
  });
  var flagSelectorPopup = document.createElement("div");
  flagSelectorPopup.className = "flagSelectorPopup";
  var options = countries.reduce((x, country)=>{
    x+=`<div class='elem'><div class='flagico f-`+country.abbr+`' data-id='`+country.abbr+`'></div> `+country.name+`</div>`;
    return x;
  }, "");
  flagSelectorPopup.innerHTML = options;
  for(var i=0;i<flagSelectorPopup.children.length;i++){
    var o = flagSelectorPopup.children[i];
    o.onclick = (e)=>{
      e.stopPropagation();
      flagSelector.value = e.currentTarget.children[0].getAttribute("data-id").toLowerCase();
      onFlagSelect && onFlagSelect();
    };
  }
  flagSelector.classList.add("flagSelector");
  var flagSelectorContents = document.createElement("div");
  flagSelectorContents.className = "flagSelectorContents";
  var updateFlagSelectorContents = function(){
    var flag = flagSelector.value;
    var country = countries.find(x=>x.abbr==flag);
    if (!country){
      flagSelectorContents.innerHTML = "<div class='elem'></div>";
      return;
    }
    flagSelectorContents.innerHTML = `<div class='elem'><div class='flagico f-`+country.abbr+`' data-id='`+country.abbr+`'></div> `+country.name+`</div>`;
    for(var i=0;i<flagSelectorPopup.children.length;i++){
      var o = flagSelectorPopup.children[i];
      var f = o.children[0].getAttribute("data-id")?.toLowerCase();
      if (f==flag)
        o.classList.add("selected");
      else
        o.classList.remove("selected");
    }
  }
  flagSelector.appendChild(flagSelectorContents);
  flagSelector.appendChild(flagSelectorPopup);
  flagSelector.onclick = function(){
    flagSelectorPopup.style.visibility = "visible";
  };
  updateFlagSelectorContents();
  flagSelector.setPopupVisibility = function(vis){
    flagSelectorPopup.style.visibility = vis ? "visible" : "hidden";
  };
}
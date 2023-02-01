function getQueriesAsJSON() {
  return window.location.search.substring(1).split("&").reduce((acc, part)=>{
    if (part.length==0)
      return acc;
    var pair = part.split('=');
    acc[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    return acc;
  }, {});
}

function JSONToQueryParams(json){
  return Object.keys(json).filter((x)=>(json[x]!=null && json[x]!="")).map((x)=>(encodeURI(x)+"="+encodeURI(json[x]))).join("&");
}

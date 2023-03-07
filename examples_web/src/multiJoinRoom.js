var r_id_elem = document.getElementById("r_id");
var p_flag_elem = document.getElementById("p_flag");

var q = getQueriesAsJSON();
if (q.id!=null)
  r_id_elem.value = q.id;

fetch("./countries.json").then((response)=>{
  return response.json();
}).then(countries => {
  makeFlagSelector(countries, p_flag_elem);
});

var i = 0;
document.getElementById("jr").onclick = function(){
  window.open("./headless_multi?"+JSONToQueryParams({
    "action": "join",
    "r_id": r_id_elem.value,
    "r_pass": document.getElementById("r_pass").value,
    "p_name": document.getElementById("p_name").value,
    "p_avatar": document.getElementById("p_avatar").value,
    "p_lat": document.getElementById("p_lat").value,
    "p_lon": document.getElementById("p_lon").value,
    "p_flag": p_flag_elem.value,
    "jc": document.getElementById("jc").value,
    "autoPlay": true
  }), "Custom Haxball Client"+(++i), "width=800,height=600");
}

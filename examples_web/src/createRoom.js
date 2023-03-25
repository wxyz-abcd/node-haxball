var r_flag_elem = document.getElementById("r_flag");
var p_flag_elem = document.getElementById("p_flag");

fetch("./countries.json").then((response)=>{
  return response.json();
}).then((countries)=>{
  makeFlagSelector(countries, r_flag_elem);
  makeFlagSelector(countries, p_flag_elem);
});

var i = 0;
document.getElementById("cr").onclick = function(){
  window.open((document.getElementById("notHeadless").checked ? "./game" : "./headless")+"?"+JSONToQueryParams({
    "action": "create",
    "r_name": document.getElementById("r_name").value,
    "r_pass": document.getElementById("r_pass").value,
    "r_mpc": document.getElementById("r_mpc").value,
    "r_sirl": document.getElementById("r_sirl").checked.toString(),
    "r_lat": document.getElementById("r_lat").value,
    "r_lon": document.getElementById("r_lon").value,
    "r_flag": r_flag_elem.value,
    "p_name": document.getElementById("p_name").value,
    "p_avatar": document.getElementById("p_avatar").value,
    "p_lat": document.getElementById("p_lat").value,
    "p_lon": document.getElementById("p_lon").value,
    "p_flag": p_flag_elem.value,
    "token": document.getElementById("token").value,
    "autoPlay": document.getElementById("autoPlay").checked.toString(),
    "aimbot": document.getElementById("aimbot").checked.toString()
  }), "Custom Haxball Client"+(++i), "width=800,height=600");
}

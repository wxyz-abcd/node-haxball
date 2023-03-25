function readCreateRoomParameters(q){
  var r_name = q["r_name"] || "";
  var r_pass = q["r_pass"];
  var r_mpc = q["r_mpc"];
  var r_sirl = q["r_sirl"] || "";
  var r_lat = q["r_lat"];
  var r_lon = q["r_lon"];
  var r_flag = q["r_flag"] || "";
  var p_name = q["p_name"] || "";
  var p_avatar = q["p_avatar"] || "";
  var p_lat = q["p_lat"];
  var p_lon = q["p_lon"];
  var p_flag = q["p_flag"] || "";
  var token = q["token"] || "";
  var autoPlay = q["autoPlay"] || "";
  var aimbot = q["aimbot"] || "";
  if (r_name.length>40)
    throw "Room name cannot be more than 40 characters long. This is basro's limit on his server side. Everything still works fine but your room does not show up in room list. (r_name)";
  if (r_pass=="")
    r_pass = null;
  r_mpc = parseInt(r_mpc);
  if (isNaN(r_mpc) || !isFinite(r_mpc) || r_mpc<0 || r_mpc>30)
    throw "Max player count must be an integer between 0 and 30 inclusive. (r_mpc)";
  r_lat = parseFloat(r_lat);
  if (isNaN(r_lat) || !isFinite(r_lat) || r_lat<-90 || r_lat>90)
    throw "Room's latitude must be a real number between -90 and 90 inclusive. (r_lat)";
  r_lon = parseFloat(r_lon);
  if (isNaN(r_lon) || !isFinite(r_lon) || r_lon<-180 || r_lon>180)
    throw "Room's longitude must be a real number between -180 and 180 inclusive. (r_lon)";
  r_flag = r_flag.toLowerCase();
  if (r_flag.length!=2 || /[-+\d(), ]+$/g.test(r_flag))
    throw "Room's flag must have 2 letters. (r_flag)";
  r_sirl = r_sirl.toLowerCase();
  if (r_sirl!="true" && r_sirl!="false")
    throw "Show In Room List must be either true or false. (r_sirl)";
  r_sirl = (r_sirl=="true");
  p_flag = p_flag.toLowerCase();
  if (p_flag.length!=2 || /[-+\d(), ]+$/g.test(p_flag))
    throw "Player's flag must have 2 letters. (p_flag)";
  p_lat = parseFloat(p_lat);
  if (isNaN(p_lat) || !isFinite(p_lat) || p_lat<-90 || p_lat>90)
    throw "Player's latitude must be a real number between -90 and 90 inclusive. (p_lat)";
  p_lon = parseFloat(p_lon);
  if (isNaN(p_lon) || !isFinite(p_lon) || p_lon<-180 || p_lon>180)
    throw "Player's longitude must be a real number between -180 and 180 inclusive. (p_lon)";
  autoPlay = autoPlay.toLowerCase();
  if (autoPlay!="true" && autoPlay!="false")
    throw "AutoPlay must be either true or false. (autoPlay)";
  autoPlay = (autoPlay=="true");
  aimbot = aimbot.toLowerCase();
  if (aimbot!="true" && aimbot!="false")
    throw "aimbot must be either true or false. (aimbot)";
  aimbot = (aimbot=="true");
  return {
    createRoom: true,
    r_name,
    r_pass,
    r_mpc,
    r_sirl,
    r_lat,
    r_lon,
    r_flag,
    p_name,
    p_avatar,
    p_lat,
    p_lon,
    p_flag,
    token,
    autoPlay,
    aimbot
  };
}

function readJoinRoomParameters(q){
  var r_id = q["r_id"] || "";
  var r_pass = q["r_pass"];
  var p_ak = q["p_ak"] || "";
  var p_name = q["p_name"] || "";
  var p_avatar = q["p_avatar"] || "";
  var p_lat = q["p_lat"];
  var p_lon = q["p_lon"];
  var p_flag = q["p_flag"] || "";
  var token = q["token"] || "";
  var autoPlay = q["autoPlay"] || "";
  var aimbot = q["aimbot"] || "";
  if (r_pass=="")
    r_pass = null;
  p_flag = p_flag.toLowerCase();
  if (p_flag.length!=2 || /[-+\d(), ]+$/g.test(p_flag))
    throw "Player's flag must have 2 letters. (p_flag)";
  p_lat = parseFloat(p_lat);
  if (isNaN(p_lat) || !isFinite(p_lat) || p_lat<-90 || p_lat>90)
    throw "Player's latitude must be a real number between -90 and 90 inclusive. (p_lat)";
  p_lon = parseFloat(p_lon);
  if (isNaN(p_lon) || !isFinite(p_lon) || p_lon<-180 || p_lon>180)
    throw "Player's longitude must be a real number between -180 and 180 inclusive. (p_lon)";
  autoPlay = autoPlay.toLowerCase();
  if (autoPlay!="true" && autoPlay!="false")
    throw "AutoPlay must be either true or false. (autoPlay)";
  autoPlay = (autoPlay=="true");
  aimbot = aimbot.toLowerCase();
  if (aimbot!="true" && aimbot!="false")
    throw "aimbot must be either true or false. (aimbot)";
  aimbot = (aimbot=="true");
  return {
    createRoom: false,
    r_id,
    r_pass,
    p_ak,
    p_name,
    p_avatar,
    p_lat,
    p_lon,
    p_flag,
    token,
    autoPlay,
    aimbot
  };
}

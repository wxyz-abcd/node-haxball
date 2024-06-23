module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "changeRoomProperties", true, {
    version: "0.3",
    author: "abc",
    description: `This plugin lets you change room settings while you are hosting the room.`,
    allowFlags: AllowFlags.CreateRoom
  });
  
  this.defineVariable({
    name: "roomName",
    description: "Desired name of the room. (will desync players)", 
    type: VariableType.String,
    value: "", 
    range: {
      min: 0,
      max: 30
    }
  });
  
  this.defineVariable({
    name: "roomPassword",
    description: "Desired password of the room.", 
    type: VariableType.String,
    value: "", 
    range: {
      min: 0,
      max: 30
    }
  });

  this.defineVariable({
    name: "roomLatitude",
    description: "Desired latitude of the room.", 
    type: VariableType.Number,
    value: 30, 
    range: {
      min: -90,
      max: 90,
      step: 0.00001
    }
  });

  this.defineVariable({
    name: "roomLongitude",
    description: "Desired longitude of the room.", 
    type: VariableType.Number,
    value: 30,
    range: {
      min: -90,
      max: 90,
      step: 0.00001
    }
  });

  this.defineVariable({
    name: "roomFlag",
    description: "Desired flag of the room.", 
    type: VariableType.String,
    value: "",
    range: {
      min: 1,
      max: 3
    }
  });

  this.defineVariable({
    name: "roomMaxPlayerCount",
    description: "Desired maximum player count of the room.", 
    type: VariableType.Integer,
    value: 30,
    range: {
      min: 0,
      max: 30,
      step: 1
    }
  });

  this.defineVariable({
    name: "unlimitedPlayerCount",
    description: "Whether to check the maximum player count.", 
    type: VariableType.Boolean,
    value: false
  });

  this.defineVariable({
    name: "fakePassword",
    description: "Show fake password value in the room list. (0: disable, 1: set to true, 2: set to false)", 
    type: VariableType.Integer,
    value: 0,
    range: {
      min: 0,
      max: 2,
      step: 1
    }
  });
  
  this.defineVariable({
    name: "showInRoomList",
    description: "Whether to show the room the room list.", 
    type: VariableType.Boolean,
    value: true
  });

  this.defineVariable({
    name: "apply",
    description: "Applies the current values of the variables to the room.", 
    type: VariableType.Void,
    value: applyValues
  });

  this.defineVariable({
    name: "randomizeCoords",
    description: "Randomizes the current lat, lon of the room.", 
    type: VariableType.Void,
    value: randomizeCoords
  });

  this.defineVariable({
    name: "randomizeFlag",
    description: "Randomizes the current flag of the room.", 
    type: VariableType.Void,
    value: randomizeFlag
  });

  this.defineVariable({
    name: "fixPlayerCount",
    description: "Whether to fix the number of players in the room.", 
    type: VariableType.Boolean,
    value: false
  });

  this.defineVariable({
    name: "playerCount",
    description: "Number of players currently in the room.", 
    type: VariableType.Integer,
    value: 1,
    range: {
      min: 0,
      max: 30,
      step: 1
    }
  });

  this.defineVariable({
    name: "token",
    description: "Desired token of the room.", 
    type: VariableType.String,
    value: "", 
    range: {
      min: 0,
      max: 40
    }
  });

  this.defineVariable({
    name: "setToken",
    description: "Sets the token of the room and effectively changes the room link. Use with caution.", 
    type: VariableType.Void,
    value: setToken
  });

  this.defineVariable({
    name: "recaptchaRequired",
    description: "Whether to require a recaptcha to enter the room.", 
    type: VariableType.Boolean,
    value: false
  });

  this.defineVariable({
    name: "setRecaptchaRequired",
    description: "Sets the requirement of a recaptcha to enter the room.", 
    type: VariableType.Void,
    value: setRecaptchaRequired
  });

  var that = this;

  this.initialize = function(){
    var { name, password, geo, maxPlayerCount, unlimitedPlayerCount, fakePassword, showInRoomList, token, requireRecaptcha } = that.room;
    that.roomName = name;
    that.roomPassword = password || "";
    that.roomLatitude = geo.lat;
    that.roomLongitude = geo.lon;
    that.roomFlag = geo.flag;
    that.roomMaxPlayerCount = maxPlayerCount;
    that.unlimitedPlayerCount = unlimitedPlayerCount;
    that.fakePassword = (fakePassword == null) ? 0 : (fakePassword ? 1 : 2);
    that.showInRoomList = showInRoomList;
    that.token = token;
    that.recaptchaRequired = requireRecaptcha;
  };
  
  function setToken(){
    that.room.token = that.token;
  }

  function setRecaptchaRequired(){
    that.room.requireRecaptcha = that.recaptchaRequired;
  }

  function applyValues(){
    that.room.setProperties({
      name: that.roomName,
      password: that.roomPassword.length==0 ? null : that.roomPassword,
      geo: {
        lat: that.roomLatitude,
        lon: that.roomLongitude,
        flag: that.roomFlag
      },
      maxPlayerCount: that.roomMaxPlayerCount,
      unlimitedPlayerCount: that.unlimitedPlayerCount,
      fakePassword: (that.fakePassword==0) ? null : (that.fakePassword==1),
      showInRoomList: that.showInRoomList
    });
  }
  
  function randomizeCoords(){
    that.room.setProperties({
      geo: {
        lat: 180*Math.random()-90,
        lon: 360*Math.random()-180
      }
    });
  }
  
  function randomizeFlag(){
    that.room.setProperties({
      geo: {
        flag: allCountries[Math.floor(Math.random()*allCountries.length)].abbr
      }
    });
  }
  
  function updatePlayerCount(){
    if (that.fixPlayerCount)
      return;
    that.playerCount = that.room.players.length;
  }
  
  function updateRoomPlayerCount(){
    var v = null;
    if (that.fixPlayerCount){
      v = parseInt(that.playerCount);
      if (isNaN(v) || v<0 || v>30)
        v = 0;
    }
    that.room.setProperties({
      playerCount: v
    });
  }
  
  this.onPlayerJoin = function(playerObj, customData){
    updatePlayerCount();
  };
  
  this.onPlayerLeave = function(playerObj, reason, isBanned, byId, customData){
    updatePlayerCount();
  };

  this.onVariableValueChange = function(addOnObj, variableName, oldValue, value){
    if (addOnObj!=that)
      return;
    if (variableName=="fixPlayerCount"){
      updateRoomPlayerCount();
      if (!value)
        updatePlayerCount();
    }
    else if (variableName=="playerCount")
      updateRoomPlayerCount();
  };

  const allCountries = [{
    "name": "Afghanistan",
    "abbr": "af",
    "lat": 33.3,
    "lon": 65.1
  },
  {
    "name": "Albania",
    "abbr": "al",
    "lat": 41.1,
    "lon": 20.1
  },
  {
    "name": "Algeria",
    "abbr": "dz",
    "lat": 28,
    "lon": 1.6
  },
  {
    "name": "American Samoa",
    "abbr": "as",
    "lat": -14.2,
    "lon": -170.1
  },
  {
    "name": "Andorra",
    "abbr": "ad",
    "lat": 42.5,
    "lon": 1.6
  },
  {
    "name": "Angola",
    "abbr": "ao",
    "lat": -11.2,
    "lon": 17.8
  },
  {
    "name": "Anguilla",
    "abbr": "ai",
    "lat": 18.2,
    "lon": -63
  },
  {
    "name": "Antigua and Barbuda",
    "abbr": "ag",
    "lat": 17,
    "lon": -61.7
  },
  {
    "name": "Argentina",
    "abbr": "ar",
    "lat": -34.5,
    "lon": -58.4
  },
  {
    "name": "Armenia",
    "abbr": "am",
    "lat": 40,
    "lon": 45
  },
  {
    "name": "Aruba",
    "abbr": "aw",
    "lat": 12.5,
    "lon": -69.9
  },
  {
    "name": "Australia",
    "abbr": "au",
    "lat": -25.2,
    "lon": 133.7
  },
  {
    "name": "Austria",
    "abbr": "at",
    "lat": 47.5,
    "lon": 14.5
  },
  {
    "name": "Azerbaijan",
    "abbr": "az",
    "lat": 40.1,
    "lon": 47.5
  },
  {
    "name": "Bahamas",
    "abbr": "bs",
    "lat": 25,
    "lon": -77.3
  },
  {
    "name": "Bahrain",
    "abbr": "bh",
    "lat": 25.9,
    "lon": 50.6
  },
  {
    "name": "Bangladesh",
    "abbr": "bd",
    "lat": 23.6,
    "lon": 90.3
  },
  {
    "name": "Barbados",
    "abbr": "bb",
    "lat": 13.1,
    "lon": -59.5
  },
  {
    "name": "Belarus",
    "abbr": "by",
    "lat": 53.7,
    "lon": 27.9
  },
  {
    "name": "Belgium",
    "abbr": "be",
    "lat": 50.5,
    "lon": 4.4
  },
  {
    "name": "Belize",
    "abbr": "bz",
    "lat": 17.1,
    "lon": -88.4
  },
  {
    "name": "Benin",
    "abbr": "bj",
    "lat": 9.3,
    "lon": 2.3
  },
  {
    "name": "Bermuda",
    "abbr": "bm",
    "lat": 32.3,
    "lon": -64.7
  },
  {
    "name": "Bhutan",
    "abbr": "bt",
    "lat": 27.5,
    "lon": 90.4
  },
  {
    "name": "Bolivia",
    "abbr": "bo",
    "lat": -16.2,
    "lon": -63.5
  },
  {
    "name": "Bosnia and Herzegovina",
    "abbr": "ba",
    "lat": 43.9,
    "lon": 17.6
  },
  {
    "name": "Botswana",
    "abbr": "bw",
    "lat": -22.3,
    "lon": 24.6
  },
  {
    "name": "Bouvet Island",
    "abbr": "bv",
    "lat": -54.4,
    "lon": 3.4
  },
  {
    "name": "Brazil",
    "abbr": "br",
    "lat": -14.2,
    "lon": -51.9
  },
  {
    "name": "British Indian Ocean Territory",
    "abbr": "io",
    "lat": -6.3,
    "lon": 71.8
  },
  {
    "name": "British Virgin Islands",
    "abbr": "vg",
    "lat": 18.4,
    "lon": -64.6
  },
  {
    "name": "Brunei",
    "abbr": "bn",
    "lat": 4.5,
    "lon": 114.7
  },
  {
    "name": "Bulgaria",
    "abbr": "bg",
    "lat": 42.7,
    "lon": 25.4
  },
  {
    "name": "Burkina Faso",
    "abbr": "bf",
    "lat": 12.2,
    "lon": -1.5
  },
  {
    "name": "Burundi",
    "abbr": "bi",
    "lat": -3.3,
    "lon": 29.9
  },
  {
    "name": "Cambodia",
    "abbr": "kh",
    "lat": 12.5,
    "lon": 104.9
  },
  {
    "name": "Cameroon",
    "abbr": "cm",
    "lat": 7.3,
    "lon": 12.3
  },
  {
    "name": "Canada",
    "abbr": "ca",
    "lat": 56.1,
    "lon": -106.3
  },
  {
    "name": "Cape Verde",
    "abbr": "cv",
    "lat": 16,
    "lon": -24
  },
  {
    "name": "Cayman Islands",
    "abbr": "ky",
    "lat": 19.5,
    "lon": -80.5
  },
  {
    "name": "Central African Republic",
    "abbr": "cf",
    "lat": 6.6,
    "lon": 20.9
  },
  {
    "name": "Chad",
    "abbr": "td",
    "lat": 15.4,
    "lon": 18.7
  },
  {
    "name": "Chile",
    "abbr": "cl",
    "lat": -35.6,
    "lon": -71.5
  },
  {
    "name": "China",
    "abbr": "cn",
    "lat": 35.8,
    "lon": 104.1
  },
  {
    "name": "Christmas Island",
    "abbr": "cx",
    "lat": -10.4,
    "lon": 105.6
  },
  {
    "name": "Colombia",
    "abbr": "co",
    "lat": 4.5,
    "lon": -74.2
  },
  {
    "name": "Comoros",
    "abbr": "km",
    "lat": -11.8,
    "lon": 43.8
  },
  {
    "name": "Congo [DRC]",
    "abbr": "cd",
    "lat": -4,
    "lon": 21.7
  },
  {
    "name": "Congo [Republic]",
    "abbr": "cg",
    "lat": -0.2,
    "lon": 15.8
  },
  {
    "name": "Cook Islands",
    "abbr": "ck",
    "lat": -21.2,
    "lon": -159.7
  },
  {
    "name": "Costa Rica",
    "abbr": "cr",
    "lat": 9.7,
    "lon": -83.7
  },
  {
    "name": "Croatia",
    "abbr": "hr",
    "lat": 45.1,
    "lon": 15.2
  },
  {
    "name": "Cuba",
    "abbr": "cu",
    "lat": 21.5,
    "lon": -77.7
  },
  {
    "name": "Cyprus",
    "abbr": "cy",
    "lat": 35.1,
    "lon": 33.4
  },
  {
    "name": "Czech Republic",
    "abbr": "cz",
    "lat": 49.8,
    "lon": 15.4
  },
  {
    "name": "Côte d'Ivoire",
    "abbr": "ci",
    "lat": 7.5,
    "lon": -5.5
  },
  {
    "name": "Denmark",
    "abbr": "dk",
    "lat": 56.2,
    "lon": 9.5
  },
  {
    "name": "Djibouti",
    "abbr": "dj",
    "lat": 11.8,
    "lon": 42.5
  },
  {
    "name": "Dominica",
    "abbr": "dm",
    "lat": 15.4,
    "lon": -61.3
  },
  {
    "name": "Dominican Republic",
    "abbr": "do",
    "lat": 18.7,
    "lon": -70.1
  },
  {
    "name": "Ecuador",
    "abbr": "ec",
    "lat": -1.8,
    "lon": -78.1
  },
  {
    "name": "Egypt",
    "abbr": "eg",
    "lat": 26.8,
    "lon": 30.8
  },
  {
    "name": "El Salvador",
    "abbr": "sv",
    "lat": 13.7,
    "lon": -88.8
  },
  {
    "name": "England",
    "abbr": "eng",
    "lat": 55.3,
    "lon": -3.4
  },
  {
    "name": "Equatorial Guinea",
    "abbr": "gq",
    "lat": 1.6,
    "lon": 10.2
  },
  {
    "name": "Eritrea",
    "abbr": "er",
    "lat": 15.1,
    "lon": 39.7
  },
  {
    "name": "Estonia",
    "abbr": "ee",
    "lat": 58.5,
    "lon": 25
  },
  {
    "name": "Ethiopia",
    "abbr": "et",
    "lat": 9.1,
    "lon": 40.4
  },
  {
    "name": "Faroe Islands",
    "abbr": "fo",
    "lat": 61.8,
    "lon": -6.9
  },
  {
    "name": "Fiji",
    "abbr": "fj",
    "lat": -16.5,
    "lon": 179.4
  },
  {
    "name": "Finland",
    "abbr": "fi",
    "lat": 61.9,
    "lon": 25.7
  },
  {
    "name": "France",
    "abbr": "fr",
    "lat": 46.2,
    "lon": 2.2
  },
  {
    "name": "French Guiana",
    "abbr": "gf",
    "lat": 3.9,
    "lon": -53.1
  },
  {
    "name": "French Polynesia",
    "abbr": "pf",
    "lat": -17.6,
    "lon": -149.4
  },
  {
    "name": "Gabon",
    "abbr": "ga",
    "lat": -0.8,
    "lon": 11.6
  },
  {
    "name": "Gambia",
    "abbr": "gm",
    "lat": 13.4,
    "lon": -15.3
  },
  {
    "name": "Georgia",
    "abbr": "ge",
    "lat": 42.3,
    "lon": 43.3
  },
  {
    "name": "Germany",
    "abbr": "de",
    "lat": 51.1,
    "lon": 10.4
  },
  {
    "name": "Ghana",
    "abbr": "gh",
    "lat": 7.9,
    "lon": -1
  },
  {
    "name": "Gibraltar",
    "abbr": "gi",
    "lat": 36.1,
    "lon": -5.3
  },
  {
    "name": "Greece",
    "abbr": "gr",
    "lat": 39,
    "lon": 21.8
  },
  {
    "name": "Greenland",
    "abbr": "gl",
    "lat": 71.7,
    "lon": -42.6
  },
  {
    "name": "Grenada",
    "abbr": "gd",
    "lat": 12.2,
    "lon": -61.6
  },
  {
    "name": "Guadeloupe",
    "abbr": "gp",
    "lat": 16.9,
    "lon": -62
  },
  {
    "name": "Guam",
    "abbr": "gu",
    "lat": 13.4,
    "lon": 144.7
  },
  {
    "name": "Guatemala",
    "abbr": "gt",
    "lat": 15.7,
    "lon": -90.2
  },
  {
    "name": "Guinea",
    "abbr": "gn",
    "lat": 9.9,
    "lon": -9.6
  },
  {
    "name": "Guinea-Bissau",
    "abbr": "gw",
    "lat": 11.8,
    "lon": -15.1
  },
  {
    "name": "Guyana",
    "abbr": "gy",
    "lat": 4.8,
    "lon": -58.9
  },
  {
    "name": "Haiti",
    "abbr": "ht",
    "lat": 18.9,
    "lon": -72.2
  },
  {
    "name": "Honduras",
    "abbr": "hn",
    "lat": 15.1,
    "lon": -86.2
  },
  {
    "name": "Hong Kong",
    "abbr": "hk",
    "lat": 22.3,
    "lon": 114.1
  },
  {
    "name": "Hungary",
    "abbr": "hu",
    "lat": 47.1,
    "lon": 19.5
  },
  {
    "name": "Iceland",
    "abbr": "is",
    "lat": 64.9,
    "lon": -19
  },
  {
    "name": "India",
    "abbr": "in",
    "lat": 20.5,
    "lon": 78.9
  },
  {
    "name": "Indonesia",
    "abbr": "id",
    "lat": -0.7,
    "lon": 113.9
  },
  {
    "name": "Iran",
    "abbr": "ir",
    "lat": 32.4,
    "lon": 53.6
  },
  {
    "name": "Iraq",
    "abbr": "iq",
    "lat": 33.2,
    "lon": 43.6
  },
  {
    "name": "Ireland",
    "abbr": "ie",
    "lat": 53.4,
    "lon": -8.2
  },
  {
    "name": "Israel",
    "abbr": "il",
    "lat": 31,
    "lon": 34.8
  },
  {
    "name": "Italy",
    "abbr": "it",
    "lat": 41.8,
    "lon": 12.5
  },
  {
    "name": "Jamaica",
    "abbr": "jm",
    "lat": 18.1,
    "lon": -77.2
  },
  {
    "name": "Japan",
    "abbr": "jp",
    "lat": 36.2,
    "lon": 138.2
  },
  {
    "name": "Jordan",
    "abbr": "jo",
    "lat": 30.5,
    "lon": 36.2
  },
  {
    "name": "Kazakhstan",
    "abbr": "kz",
    "lat": 48,
    "lon": 66.9
  },
  {
    "name": "Kenya",
    "abbr": "ke",
    "lat": 0,
    "lon": 37.9
  },
  {
    "name": "Kiribati",
    "abbr": "ki",
    "lat": -3.3,
    "lon": -168.7
  },
  {
    "name": "Kosovo",
    "abbr": "xk",
    "lat": 42.6,
    "lon": 20.9
  },
  {
    "name": "Kuwait",
    "abbr": "kw",
    "lat": 29.3,
    "lon": 47.4
  },
  {
    "name": "Kyrgyzstan",
    "abbr": "kg",
    "lat": 41.2,
    "lon": 74.7
  },
  {
    "name": "Laos",
    "abbr": "la",
    "lat": 19.8,
    "lon": 102.4
  },
  {
    "name": "Latvia",
    "abbr": "lv",
    "lat": 56.8,
    "lon": 24.6
  },
  {
    "name": "Lebanon",
    "abbr": "lb",
    "lat": 33.8,
    "lon": 35.8
  },
  {
    "name": "Lesotho",
    "abbr": "ls",
    "lat": -29.6,
    "lon": 28.2
  },
  {
    "name": "Liberia",
    "abbr": "lr",
    "lat": 6.4,
    "lon": -9.4
  },
  {
    "name": "Libya",
    "abbr": "ly",
    "lat": 26.3,
    "lon": 17.2
  },
  {
    "name": "Liechtenstein",
    "abbr": "li",
    "lat": 47.1,
    "lon": 9.5
  },
  {
    "name": "Lithuania",
    "abbr": "lt",
    "lat": 55.1,
    "lon": 23.8
  },
  {
    "name": "Luxembourg",
    "abbr": "lu",
    "lat": 49.8,
    "lon": 6.1
  },
  {
    "name": "Macau",
    "abbr": "mo",
    "lat": 22.1,
    "lon": 113.5
  },
  {
    "name": "Macedonia [FYROM]",
    "abbr": "mk",
    "lat": 41.6,
    "lon": 21.7
  },
  {
    "name": "Madagascar",
    "abbr": "mg",
    "lat": -18.7,
    "lon": 46.8
  },
  {
    "name": "Malawi",
    "abbr": "mw",
    "lat": -13.2,
    "lon": 34.3
  },
  {
    "name": "Malaysia",
    "abbr": "my",
    "lat": 4.2,
    "lon": 101.9
  },
  {
    "name": "Maldives",
    "abbr": "mv",
    "lat": 3.2,
    "lon": 73.2
  },
  {
    "name": "Mali",
    "abbr": "ml",
    "lat": 17.5,
    "lon": -3.9
  },
  {
    "name": "Malta",
    "abbr": "mt",
    "lat": 35.9,
    "lon": 14.3
  },
  {
    "name": "Marshall Islands",
    "abbr": "mh",
    "lat": 7.1,
    "lon": 171.1
  },
  {
    "name": "Martinique",
    "abbr": "mq",
    "lat": 14.6,
    "lon": -61
  },
  {
    "name": "Mauritania",
    "abbr": "mr",
    "lat": 21,
    "lon": -10.9
  },
  {
    "name": "Mauritius",
    "abbr": "mu",
    "lat": -20.3,
    "lon": 57.5
  },
  {
    "name": "Mayotte",
    "abbr": "yt",
    "lat": -12.8,
    "lon": 45.1
  },
  {
    "name": "Mexico",
    "abbr": "mx",
    "lat": 23.6,
    "lon": -102.5
  },
  {
    "name": "Micronesia",
    "abbr": "fm",
    "lat": 7.4,
    "lon": 150.5
  },
  {
    "name": "Moldova",
    "abbr": "md",
    "lat": 47.4,
    "lon": 28.3
  },
  {
    "name": "Monaco",
    "abbr": "mc",
    "lat": 43.7,
    "lon": 7.4
  },
  {
    "name": "Mongolia",
    "abbr": "mn",
    "lat": 46.8,
    "lon": 103.8
  },
  {
    "name": "Montenegro",
    "abbr": "me",
    "lat": 42.7,
    "lon": 19.3
  },
  {
    "name": "Montserrat",
    "abbr": "ms",
    "lat": 16.7,
    "lon": -62.1
  },
  {
    "name": "Morocco",
    "abbr": "ma",
    "lat": 31.7,
    "lon": -7
  },
  {
    "name": "Mozambique",
    "abbr": "mz",
    "lat": -18.6,
    "lon": 35.5
  },
  {
    "name": "Myanmar [Burma]",
    "abbr": "mm",
    "lat": 21.9,
    "lon": 95.9
  },
  {
    "name": "Namibia",
    "abbr": "na",
    "lat": -22.9,
    "lon": 18.4
  },
  {
    "name": "Nauru",
    "abbr": "nr",
    "lat": -0.5,
    "lon": 166.9
  },
  {
    "name": "Nepal",
    "abbr": "np",
    "lat": 28.3,
    "lon": 84.1
  },
  {
    "name": "Netherlands",
    "abbr": "nl",
    "lat": 52.1,
    "lon": 5.2
  },
  {
    "name": "Netherlands Antilles",
    "abbr": "an",
    "lat": 12.2,
    "lon": -69
  },
  {
    "name": "New Caledonia",
    "abbr": "nc",
    "lat": -20.9,
    "lon": 165.6
  },
  {
    "name": "New Zealand",
    "abbr": "nz",
    "lat": -40.9,
    "lon": 174.8
  },
  {
    "name": "Nicaragua",
    "abbr": "ni",
    "lat": 12.8,
    "lon": -85.2
  },
  {
    "name": "Niger",
    "abbr": "ne",
    "lat": 17.6,
    "lon": 8
  },
  {
    "name": "Nigeria",
    "abbr": "ng",
    "lat": 9,
    "lon": 8.6
  },
  {
    "name": "Niue",
    "abbr": "nu",
    "lat": -19,
    "lon": -169.8
  },
  {
    "name": "Norfolk Island",
    "abbr": "nf",
    "lat": -29,
    "lon": 167.9
  },
  {
    "name": "North Korea",
    "abbr": "kp",
    "lat": 40.3,
    "lon": 127.5
  },
  {
    "name": "Northern Mariana Islands",
    "abbr": "mp",
    "lat": 17.3,
    "lon": 145.3
  },
  {
    "name": "Norway",
    "abbr": "no",
    "lat": 60.4,
    "lon": 8.4
  },
  {
    "name": "Oman",
    "abbr": "om",
    "lat": 21.5,
    "lon": 55.9
  },
  {
    "name": "Pakistan",
    "abbr": "pk",
    "lat": 30.3,
    "lon": 69.3
  },
  {
    "name": "Palau",
    "abbr": "pw",
    "lat": 7.5,
    "lon": 134.5
  },
  {
    "name": "Palestinian Territories",
    "abbr": "ps",
    "lat": 31.9,
    "lon": 35.2
  },
  {
    "name": "Panama",
    "abbr": "pa",
    "lat": 8.5,
    "lon": -80.7
  },
  {
    "name": "Papua New Guinea",
    "abbr": "pg",
    "lat": -6.3,
    "lon": 143.9
  },
  {
    "name": "Paraguay",
    "abbr": "py",
    "lat": -23.4,
    "lon": -58.4
  },
  {
    "name": "Peru",
    "abbr": "pe",
    "lat": -9.1,
    "lon": -75
  },
  {
    "name": "Philippines",
    "abbr": "ph",
    "lat": 12.8,
    "lon": 121.7
  },
  {
    "name": "Pitcairn Islands",
    "abbr": "pn",
    "lat": -24.7,
    "lon": -127.4
  },
  {
    "name": "Poland",
    "abbr": "pl",
    "lat": 51.9,
    "lon": 19.1
  },
  {
    "name": "Portugal",
    "abbr": "pt",
    "lat": 39.3,
    "lon": -8.2
  },
  {
    "name": "Puerto Rico",
    "abbr": "pr",
    "lat": 18.2,
    "lon": -66.5
  },
  {
    "name": "Qatar",
    "abbr": "qa",
    "lat": 25.3,
    "lon": 51.1
  },
  {
    "name": "Romania",
    "abbr": "ro",
    "lat": 45.9,
    "lon": 24.9
  },
  {
    "name": "Russia",
    "abbr": "ru",
    "lat": 61.5,
    "lon": 105.3
  },
  {
    "name": "Rwanda",
    "abbr": "rw",
    "lat": -1.9,
    "lon": 29.8
  },
  {
    "name": "Réunion",
    "abbr": "re",
    "lat": -21.1,
    "lon": 55.5
  },
  {
    "name": "Saint Helena",
    "abbr": "sh",
    "lat": -24.1,
    "lon": -10
  },
  {
    "name": "Saint Kitts",
    "abbr": "kn",
    "lat": 17.3,
    "lon": -62.7
  },
  {
    "name": "Saint Lucia",
    "abbr": "lc",
    "lat": 13.9,
    "lon": -60.9
  },
  {
    "name": "Saint Pierre",
    "abbr": "pm",
    "lat": 46.9,
    "lon": -56.2
  },
  {
    "name": "Saint Vincent",
    "abbr": "vc",
    "lat": 12.9,
    "lon": -61.2
  },
  {
    "name": "Samoa",
    "abbr": "ws",
    "lat": -13.7,
    "lon": -172.1
  },
  {
    "name": "San Marino",
    "abbr": "sm",
    "lat": 43.9,
    "lon": 12.4
  },
  {
    "name": "Saudi Arabia",
    "abbr": "sa",
    "lat": 23.8,
    "lon": 45
  },
  {
    "name": "Scotland",
    "abbr": "sct",
    "lat": 56.5,
    "lon": 4.2
  },
  {
    "name": "Senegal",
    "abbr": "sn",
    "lat": 14.4,
    "lon": -14.4
  },
  {
    "name": "Serbia",
    "abbr": "rs",
    "lat": 44,
    "lon": 21
  },
  {
    "name": "Seychelles",
    "abbr": "sc",
    "lat": -4.6,
    "lon": 55.4
  },
  {
    "name": "Sierra Leone",
    "abbr": "sl",
    "lat": 8.4,
    "lon": -11.7
  },
  {
    "name": "Singapore",
    "abbr": "sg",
    "lat": 1.3,
    "lon": 103.8
  },
  {
    "name": "Slovakia",
    "abbr": "sk",
    "lat": 48.6,
    "lon": 19.6
  },
  {
    "name": "Slovenia",
    "abbr": "si",
    "lat": 46.1,
    "lon": 14.9
  },
  {
    "name": "Solomon Islands",
    "abbr": "sb",
    "lat": -9.6,
    "lon": 160.1
  },
  {
    "name": "Somalia",
    "abbr": "so",
    "lat": 5.1,
    "lon": 46.1
  },
  {
    "name": "South Africa",
    "abbr": "za",
    "lat": -30.5,
    "lon": 22.9
  },
  {
    "name": "South Georgia",
    "abbr": "gs",
    "lat": -54.4,
    "lon": -36.5
  },
  {
    "name": "South Korea",
    "abbr": "kr",
    "lat": 35.9,
    "lon": 127.7
  },
  {
    "name": "Spain",
    "abbr": "es",
    "lat": 40.4,
    "lon": -3.7
  },
  {
    "name": "Sri Lanka",
    "abbr": "lk",
    "lat": 7.8,
    "lon": 80.7
  },
  {
    "name": "Sudan",
    "abbr": "sd",
    "lat": 12.8,
    "lon": 30.2
  },
  {
    "name": "Suriname",
    "abbr": "sr",
    "lat": 3.9,
    "lon": -56
  },
  {
    "name": "Svalbard and Jan Mayen",
    "abbr": "sj",
    "lat": 77.5,
    "lon": 23.6
  },
  {
    "name": "Swaziland",
    "abbr": "sz",
    "lat": -26.5,
    "lon": 31.4
  },
  {
    "name": "Sweden",
    "abbr": "se",
    "lat": 60.1,
    "lon": 18.6
  },
  {
    "name": "Switzerland",
    "abbr": "ch",
    "lat": 46.8,
    "lon": 8.2
  },
  {
    "name": "Syria",
    "abbr": "sy",
    "lat": 34.8,
    "lon": 38.9
  },
  {
    "name": "São Tomé and Príncipe",
    "abbr": "st",
    "lat": 0.1,
    "lon": 6.6
  },
  {
    "name": "Taiwan",
    "abbr": "tw",
    "lat": 23.6,
    "lon": 120.9
  },
  {
    "name": "Tajikistan",
    "abbr": "tj",
    "lat": 38.8,
    "lon": 71.2
  },
  {
    "name": "Tanzania",
    "abbr": "tz",
    "lat": -6.3,
    "lon": 34.8
  },
  {
    "name": "Thailand",
    "abbr": "th",
    "lat": 15.8,
    "lon": 100.9
  },
  {
    "name": "Timor-Leste",
    "abbr": "tl",
    "lat": -8.8,
    "lon": 125.7
  },
  {
    "name": "Togo",
    "abbr": "tg",
    "lat": 8.6,
    "lon": 0.8
  },
  {
    "name": "Tokelau",
    "abbr": "tk",
    "lat": -8.9,
    "lon": -171.8
  },
  {
    "name": "Tonga",
    "abbr": "to",
    "lat": -21.1,
    "lon": -175.1
  },
  {
    "name": "Trinidad and Tobago",
    "abbr": "tt",
    "lat": 10.6,
    "lon": -61.2
  },
  {
    "name": "Tunisia",
    "abbr": "tn",
    "lat": 33.8,
    "lon": 9.5
  },
  {
    "name": "Turkey",
    "abbr": "tr",
    "lat": 41.018001556396484,
    "lon": 28.93000030517578
  },
  {
    "name": "Turkmenistan",
    "abbr": "tm",
    "lat": 38.9,
    "lon": 59.5
  },
  {
    "name": "Turks and Caicos Islands",
    "abbr": "tc",
    "lat": 21.6,
    "lon": -71.7
  },
  {
    "name": "Tuvalu",
    "abbr": "tv",
    "lat": -7.1,
    "lon": 177.6
  },
  {
    "name": "U.S. Minor Outlying Islands",
    "abbr": "um",
    "lat": 0,
    "lon": 0
  },
  {
    "name": "U.S. Virgin Islands",
    "abbr": "vi",
    "lat": 18.3,
    "lon": -64.8
  },
  {
    "name": "Uganda",
    "abbr": "ug",
    "lat": 1.3,
    "lon": 32.2
  },
  {
    "name": "Ukraine",
    "abbr": "ua",
    "lat": 48.3,
    "lon": 31.1
  },
  {
    "name": "United Arab Emirates",
    "abbr": "ae",
    "lat": 23.4,
    "lon": 53.8
  },
  {
    "name": "United Kingdom",
    "abbr": "gb",
    "lat": 55.3,
    "lon": -3.4
  },
  {
    "name": "United States",
    "abbr": "us",
    "lat": 37,
    "lon": -95.7
  },
  {
    "name": "Uruguay",
    "abbr": "uy",
    "lat": -32.5,
    "lon": -55.7
  },
  {
    "name": "Uzbekistan",
    "abbr": "uz",
    "lat": 41.3,
    "lon": 64.5
  },
  {
    "name": "Vanuatu",
    "abbr": "vu",
    "lat": -15.3,
    "lon": 166.9
  },
  {
    "name": "Vatican City",
    "abbr": "va",
    "lat": 41.9,
    "lon": 12.4
  },
  {
    "name": "Venezuela",
    "abbr": "ve",
    "lat": 6.4,
    "lon": -66.5
  },
  {
    "name": "Vietnam",
    "abbr": "vn",
    "lat": 14,
    "lon": 108.2
  },
  {
    "name": "Wales",
    "abbr": "wls",
    "lat": 55.3,
    "lon": -3.4
  },
  {
    "name": "Wallis and Futuna",
    "abbr": "wf",
    "lat": -13.7,
    "lon": -177.1
  },
  {
    "name": "Western Sahara",
    "abbr": "eh",
    "lat": 24.2,
    "lon": -12.8
  },
  {
    "name": "Yemen",
    "abbr": "ye",
    "lat": 15.5,
    "lon": 48.5
  },
  {
    "name": "Zambia",
    "abbr": "zm",
    "lat": -13.1,
    "lon": 27.8
  },
  {
    "name": "Zimbabwe",
    "abbr": "zw",
    "lat": -19,
    "lon": 29.1
  },
  {
    "name": "Unidentified Flying Country",
    "abbr": "xx1",
    "lat": -80,
    "lon": 80
  },
  {
    "name": "Flying Spaghetti Country",
    "abbr": "xx2",
    "lat": -81,
    "lon": 81
  }];
}
module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Library.prototype);
  Library.call(this, "permissions", { // "permissions" is library's name. Every library should have a unique name.
    version: 0.1,
    author: "abc",
    description: `This is a library to generalize and standardize user priveleges.`
  });

  this.defineVariable({
    name: "active",
    description: "Permissions are active?",
    type: VariableType.Boolean,
    value: true
  });

  this.defineVariable({
    name: "managePermissions",
    description: "Manage player permissions using a GUI",
    type: VariableType.Void,
    value: showGUI
  });

  var thisLibrary = this;
  
  this.allContexts = [];

  this.setPlayerPermission = function(playerId, permissionId, value){
    var arr = permissionId.split(":");
    if (arr.length!=2)
      return;
    var name = arr[0];
    var ctx = allContexts.find((x)=>x.id==name);
    if (!ctx)
      return;
    var id = parseInt(arr[1]);
    if (value){
      var p = ctx.playerPermissions[playerId];
      if (!p){
        p = ctx.playerPermissions[playerId] = new Permissions(ctx);
      }
      p.add(id);
    }
    else
      ctx.playerPermissions[playerId]?.remove(id);
  };

  function showGUI(){
    var {gui} = thisLibrary.room.librariesMap;
    if (!gui)
      return;
    var w = gui.newWindowFromContent(`
      <style>
        .button {
          display: flex;
          position: relative;
          padding: 5px 15px;
          border: 0;
          border-radius: 5px;
          color: white;
          background-color: #244967;
          font-family: 'Open Sans', sans-serif;
          font-weight: 700;
          font-size: 15px;
          line-height: 100%;
          white-space: nowrap;
          cursor: pointer;
        }
        .button:focus {
          outline: none;
        }
        .button:hover {
          background-color: #2f5e85;
        }
        .button:active {
          background-color: #193449;
        }
        .button[disabled] {
          background-color: #3e3e3e;
        }
        .button .tooltip {
          visibility: hidden;
          background-color: rgba(0,0,0,0.8);
          color: white;
          text-align: center;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 500;
          position: absolute;
          z-index: 1;
          bottom: 130%;
          right: 0%;
          opacity: 0;
          transition: opacity 0s;
        }
        .button:hover .tooltip {
          visibility: visible;
          opacity: 1;
          transition: opacity .5s;
          transition-delay: 1s;
        }
        .button.red {
          background-color: #c13535;
        }
        .button.red:hover {
          background-color: #cf5050;
        }
        .button.red:active {
          background-color: #a12c2c;
        }
        .button.green {
          background-color: #3a9933;
        }
        .button.green:hover {
          background-color: #46b83d;
        }
        .button.green:active {
          background-color: #2e7a29;
        }
        .styled-table {
          border-collapse: collapse;
          margin: 25px 0;
          font-size: 0.9em;
          font-family: sans-serif;
          min-width: 400px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
        }
        .styled-table thead tr {
          background-color: #009879;
          color: #ffffff;
          text-align: left;
        }
        .styled-table th, .styled-table td {
          padding: 12px 15px;
          text-align: center;
        }
        .styled-table tbody tr {
          border-bottom: 1px solid #dddddd;
        }
        .styled-table tbody tr:nth-of-type(even) {
          background-color: #f3f3f3;
        }
        .styled-table tbody tr:last-of-type {
          border-bottom: 2px solid #009879;
        }
        .styled-table tbody tr.active-row {
          font-weight: bold;
          color: #009879;
        }
        #tabs {
          display: flex;
          overflow-x: auto;
        }
        #tableContainer {
          display: flex;
          overflow-x: auto;
        }
      </style>
    `, `
      <div id="tabs">
      </div>
      <div id="tableContainer">
        <table id="table" class="styled-table">
          <thead></thead>
          <tbody></tbody>
        </table>
      </div>
    `, 1000, 500);
    w.allContexts = thisLibrary.allContexts;
    gui.addScriptFromContentToWindow(w, `
      var tabs = document.getElementById("tabs");
      var tableHead = document.getElementById("table").children[0];
      var tableBody = document.getElementById("table").children[1];
      var current = 0;
      function modifyPermission(event){
        var currentCtx = allContexts[current];
        var playerId = parseInt(event.target.attributes.pId.value);
        var idx = parseInt(event.target.attributes.idx.value);
        if (currentCtx.checkPlayerPermission(playerId, idx))
          currentCtx.removePlayerPermission(playerId, idx);
        else
          currentCtx.addPlayerPermission(playerId, idx);
      }
      window.update = function(){
        var currentCtx = allContexts[current];
        tabs.innerHTML = "";
        allContexts.forEach(({id, permissions}, idx)=>{
          var e = document.createElement("input");
          e.classList.add("button");
          e.type = "button";
          e.value = id;
          if (current==idx)
            e.classList.add("green");
          e.idx = idx;
          e.onclick = (event)=>{
            current = event.target.idx;
            window.update();
          };
          tabs.appendChild(e);
        });
        var html = "<th>Id</th><th>Name</th>";
        currentCtx.permissions.forEach(({name}, idx)=>{
          html+="<th>"+name+"("+idx+")</th>";
        });
        tableHead.innerHTML = html;
        html = "";
        room.players.forEach((p)=>{
          var rowHtml = "<tr><td>"+p.id+"</td><td>"+p.name+"</td>";
          currentCtx.permissions.forEach((tmp, idx)=>{
            rowHtml+="<td><input type='checkbox' pId="+p.id+" idx="+idx+" "+(currentCtx.checkPlayerPermission(p.id, idx)?" checked":"")+" onchange='modifyPermission(event)' /></td>";
          });
          rowHtml += "</tr>";
          html += rowHtml;
        });
        tableBody.innerHTML = html;
      }
      update();
    `);
  };

  function Permissions(context){
    this.nums = [];
    for (var i=0;i<=(context.permissions.length>>5);i++)
      this.nums.push(0);
    var thisPrm = this;
    this.add = function(id){
      var idx = (id>>5), flag = 1<<(id&31);
      if (thisPrm.nums[idx]==null)
        thisPrm.nums[idx] = flag;
      else
        thisPrm.nums[idx] |= flag;
    };
    this.remove = function(id){
      var idx = (id>>5), flag = 1<<(id&31);
      if (thisPrm.nums[idx]==null)
        return;
      thisPrm.nums[idx] &= (~flag);
    };
    this.check = function(id){
      var v = (thisPrm.nums[id>>5]&(1<<(id&31)))>0;
      return context.permissions[id].defaultValue ? !v : v;
    };
  }

  function PermissionContext(uniqueId){
    this.id = uniqueId;
    this.permissions = [];
    this.playerPermissions = {};
    var thisCtx = this;
    this.addPermission = function(name, defaultValue=false){ // use this inside initialize() of your RoomConfig/Plugin.
      thisCtx.permissions.push({name, defaultValue});
      return thisCtx.permissions.length-1;
    };
    this.clearPermissions = function(){ // use this inside finalize() of your RoomConfig/Plugin.
      thisCtx.permissions = [];
      thisCtx.playerPermissions = {};
    };
    this.addPlayerPermission = function(playerId, permissionId){ // use this to grant permission to a player.
      var p = thisCtx.playerPermissions[playerId];
      if (!p){
        p = thisCtx.playerPermissions[playerId] = new Permissions(thisCtx);
      }
      p.add(permissionId);
      var {storage} = thisLibrary.room.config;
      if (!storage){
        return;
      }
      var users = storage.get("users");
      if (!users)
        return;
      var permissions = storage.get("permissions");
      if (!permissions)
        permissions = [];
      var auth = thisLibrary.room.players.find((x)=>x.id==playerId)?.auth;
      if (!auth)
        return;
      var user = users.find((x)=>x.auth==auth);
      if (!user)
        return;
      var pid = thisCtx.id+":"+permissionId;
      var pIdx = permissions.findIndex((x)=>x==pid);
      if (pIdx==-1){
        pIdx = permissions.length;
        permissions.push(pid);
      }
      storage.set("permissions", permissions);
      if (user.permissions.findIndex((x)=>x==pIdx)>-1)
        return;
      user.permissions.push(pIdx);
      storage.set("users", users);
    };
    this.removePlayerPermission = function(playerId, permissionId){ // use this to ungrant permission to a player.
      thisCtx.playerPermissions[playerId]?.remove(permissionId);
      var {storage} = thisLibrary.room.config;
      if (!storage)
        return;
      var users = storage.get("users");
      if (!users)
        return;
      var permissions = storage.get("permissions");
      if (!permissions)
        return;
      var auth = thisLibrary.room.players.find((x)=>x.id==playerId)?.auth;
      if (!auth)
        return;
      var user = users.find((x)=>x.auth==auth);
      if (!user)
        return;
      var pid = thisCtx.id+":"+permissionId;
      var pIdx = permissions.findIndex((x)=>x==pid);
      if (pIdx==-1)
        return;
      var pIdx2 = user.permissions.indexOf(pIdx);
      if (pIdx2==-1)
        return;
      user.permissions.splice(pIdx2, 1);
      storage.set("users", users);
    };
    this.checkPlayerPermission = function(playerId, permissionId){ // use this to check permission of a player.
      if (!thisLibrary.active)
        return true;
      var p = thisCtx.playerPermissions[playerId];
      if (!p){
        p = thisCtx.playerPermissions[playerId] = new Permissions(thisCtx);
      }
      return p.check(permissionId);
    };
  }

  this.createContext = function(uniqueId){ // All permissions must be added once and never removed afterwards, because permissions ids must also be unique.
    var ctx = new PermissionContext(uniqueId);
    thisLibrary.allContexts.push(ctx);
    return ctx;
  };

  this.removeContext = function(ctx){ // All permissions must be added once and never removed afterwards, because permissions ids must also be unique.
    var idx = thisLibrary.allContexts.indexOf(ctx);
    if (idx>=0)
      thisLibrary.allContexts.splice(idx, 1);
  };

  var permissionCtx, permissionIds;
  this.initialize = function(){
    permissionCtx = thisLibrary.createContext("permissionsLib");
    permissionIds = {
      setPermission: permissionCtx.addPermission("setPermission"),
      permissions: permissionCtx.addPermission("permissions")
    };
    thisLibrary.room.librariesMap.commands?.add({
      name: "setPermission",
      parameters: [{
        name: "playerId",
        type: VariableType.Integer,
        range: {
          min: 0
        }
      }, {
        name: "permissionId",
        type: VariableType.String,
        range: {
          min: 3
        }
      }, {
        name: "value",
        type: VariableType.Boolean
      }],
      minParameterCount: 2,
      helpText: "Lets you change a player's permissions. Write !permissions to see all permission ids.",
      callback: ({playerId, permissionId, value}, byId) => {
        if (!thisLibrary.room.getPlayer(playerId))
          return;
        if (byId!=0 && !permissionCtx.checkPlayerPermission(byId, permissionIds.setPermission)){
          thisLibrary.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        var arr = permissionId.split(":");
        if (arr.length!=2){
          thisLibrary.room.librariesMap.commands?.announceError("Permission id must include exactly one ':' character. Write !permissions to see all permission ids.", byId);
          return;
        }
        var ctx = thisLibrary.allContexts.find((x)=>x.id==arr[0]);
        if (!ctx){
          thisLibrary.room.librariesMap.commands?.announceError("Permission context not found: "+arr[0]+". Write !permissions to see all permission ids.", byId);
          return;
        }
        var id = parseInt(arr[1]);
        if (value)
          ctx.addPlayerPermission(playerId, id);
        else
          ctx.removePlayerPermission(playerId, id);
      }
    });
    thisLibrary.room.librariesMap.commands?.add({
      name: "permissions",
      parameters: [],
      minParameterCount: 0,
      helpText: "Lists all permissions.",
      callback: (params, byId) => {
        if (byId!=0 && !permissionCtx.checkPlayerPermission(byId, permissionIds.permissions)){
          thisLibrary.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        thisLibrary.allContexts.forEach(({id, permissions})=>{
          permissions.forEach(({name}, idx)=>{
            thisLibrary.room.librariesMap.commands?.announceInfo(id + ":" + idx + " -> " + name, byId);
          });
        });
      }
    });
    if (thisLibrary.room.librariesMap.gui)
      thisLibrary.room.librariesMap.commands?.add({
        name: "permissionsGui",
        parameters: [],
        minParameterCount: 0,
        helpText: "Lists all permissions inside a GUI.",
        callback: (params, byId) => {
          if (byId!=0){
            thisLibrary.room.librariesMap.commands?.announcePermissionDenied(byId);
            return;
          }
          showGUI();
        }
      });
  };

  this.finalize = function(){
    thisLibrary.removeContext(permissionCtx);
    thisLibrary.room.librariesMap?.commands?.remove("setPermission");
    thisLibrary.room.librariesMap?.commands?.remove("permissions");
    thisLibrary.room.librariesMap?.commands?.remove("permissionsGui");
  };
};

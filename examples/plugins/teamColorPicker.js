module.exports = function(API){
  const { AllowFlags, Plugin, VariableType:{Integer,Color, Void,Team}} = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "teamColorPicker", true, { // "teamColorPicker" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "Kirby",
    description: `This is a color picker plugin to change teams' color by using a simple GUI. No one wants to struggle with /colors command, right?`,
    allowFlags: AllowFlags.CreateRoom|AllowFlags.JoinRoom // We allow this plugin to be activated on both CreateRoom and JoinRoom.
  });
  //#region Variables
  this.defineVariable({
      name: "currentTeam",
      description: "The team that colors will be changed", 
      type: Team,
      value:1
  })
  this.defineVariable({
      name: "colorCount",
      description: "The color count of chosen team. Minimum and default is 1.", 
      type: Integer,
      value:1,
      range: {
          max:3,
          min:1,
          step:1
      }
  })
  this.defineVariable({
      name: "textColor",
      description: "The text color of chosen team.", 
      type: Color,
      value: "#000000"
  });
  this.defineVariable({
      name: "color",
      description: "The first color of chosen team.", 
      type: Color,
      value: "#ff0000"
  });
  this.defineVariable({
      name: "color2",
      description: "The second color of chosen team.", 
      type: Color,
      value: "#00ff00"
  });
  this.defineVariable({
      name: "color3",
      description: "The third color of chosen team.", 
      type: Color,
      value: "#0000ff"
  });
  this.defineVariable({
      name: "colorAngle",
      description: "The color angle of chosen team.", 
      type: Integer,
      value:0,
      range:{
          min:0,
          max:360,
          step:1
      }
  });
  this.defineVariable({
      name:"colorSubmit",
      description:"",
      type:Void,
      value:() => {
          const colorArray = [this["textColor"], this["color"]];
          for(let i = 2; i <= this["colorCount"]; i++)
              colorArray.push(this["color"+i]);
          this.room.setTeamColors(this.currentTeam, this["colorAngle"], ...colorArray.map(c=>c.substring(1)));
      }
  })

  
  this.onPlayerChat = (id,msg) => {
      if(!this.room.players.find(p => p.id === id && p.isAdmin) && !this.room.isHost) return;
      const [cmd, ...args] = msg.split(/\s+/g); 
      switch(cmd)
      {
          case "!change": 
              const team = parseInt(args[0]);
              if(isNaN(team)||![1,2].includes(team)){
                this.room.sendChat("Team value is missing or invalid!\nUsage: !change [teamID<1,2>] [angle] [colors]")
                  break;
              }
              const angle = parseInt(args[1]);
              if(isNaN(angle)){
                this.room.sendChat("Angle value is missing!\nUsage: !change [teamID] [angle] [colors]")
                  break;
              }
              const colors = args.splice(2,args.length >= 4 ? 4 : args.length);
              if(colors.length < 2){
                  this.room.sendChat("Enter at least 2 colors.\nUsage: !change [teamID] [angle] [colors]")
                  break;
              }
              this.room.setTeamColors(Number(team),angle,...colors.map(c => parseInt(c,16)))
          default:
              break;
      }
  }
}
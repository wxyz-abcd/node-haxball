const API = (process.argv[2]=="debug") ? require("../src/index_debug")() : require("../src/index")();

require("./test.js")(API, process.argv[3], process.argv[4]==1, {
  log: (...a)=>{
    process.stderr.write(a.join(""));
  },
  colors: {
    yellow: "\x1b[33m",
    green: "\x1b[32m",
    red: "\x1b[31m", 
    magenta: "\x1b[35m",
    blue: "\x1b[34m"
  },
  exit: ()=>(process.exit(0))
});
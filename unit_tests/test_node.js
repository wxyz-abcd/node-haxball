require("./test.js")(require("../src/index.js")(), "thr1.AAAAAGakUXmNwAGgf5h2bg.8c1QWvFknV0", {
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
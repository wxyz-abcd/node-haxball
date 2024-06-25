require("./test.js")(require("../src/index.js")(), "thr1.AAAAAGZ6cgAuUt1RU6Tp4w.P5AhIaIk_HM", {
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
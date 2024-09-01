const abcHaxballAPI = require("./api.js");
const indexCommon = require("./indexCommon.js");

module.exports = function(window, config){
  return indexCommon(abcHaxballAPI, window, config);
}

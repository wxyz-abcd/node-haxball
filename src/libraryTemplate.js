module.exports = function(API){
  var { Library } = API;

  Object.setPrototypeOf(this, Library.prototype);
  Library.call(this, "template", { // "template" is library's name. Every library should have a unique name.
    version: 0.1,
    author: "abc",
    description: `This is a template library`
  });

  this.initialize = function(){};
  this.finalize = function(){};
};

var Promise = require('promise');

////
// CMDB (actions on repositories)
////

var FileAdapter = function(cmdb, rootDir) {
  this.cmdb = cmdb;
  this.rootDir = rootDir;
};

// Create a new cmdb-model repository
// FileAdapter.prototype.createRepository = function(name) {
//   return new Promise(function(resolve, reject) {
//     if (this.repositories[name]) {
//       reject('Cannot create repository, a repository with the name ' + name + ' already exists.');
//       return;
//     }

//     this.repositories[name] = new Repository(name);

//     resolve(this.repositories[name]);
//   }.bind(this));
// };

module.exports = {
  createAdapter: function(cmdb, rootDir) {
    return new Promise(function(resolve, reject) {
      var fa = new FileAdapter(cmdb, rootDir);
      resolve(fa);
    });
  }
};
var Promise = require('promise');
var chokidar = require('chokidar');

////
// CMDB (actions on repositories)
////

var FileAdapter = function(repo, rootDir, resolve, reject) {
  this.repo = repo;
  this.rootDir = rootDir;
  this.watcher = chokidar.watch(rootDir, {
    persistent: false
  });

  this.watcher
    .on('add', function(path) { return this.repo.createCI({id: path, properties: {type: 'file', path: path}}); }.bind(this))
    .on('addDir', function(path) { return this.repo.createCI({id: path, properties: {type: 'dir', path: path}}); }.bind(this))
    .on('change', function(path) { return this.repo.updateCI({id: path, properties: {path: path}}); }.bind(this))
    .on('unlink', function(path) { return this.repo.deleteCI(path); }.bind(this))
    .on('unlinkDir', function(path) { return this.repo.deleteCI(path); }.bind(this))
    .on('error', function(error) { console.log('Error happened', error); }.bind(this))
    .on('ready', function() { resolve(this); }.bind(this))
};

module.exports = {
  createAdapter: function(repo, rootDir) {
    return new Promise(function(resolve, reject) {
      var fa = new FileAdapter(repo, rootDir, resolve, reject);
    });
  }
};
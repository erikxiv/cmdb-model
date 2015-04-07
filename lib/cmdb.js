var rdfstore = require('rdfstore');
var Promise = require('promise');
var Repository = require('./repository');

////
// CMDB (actions on repositories)
////

var Cmdb = function() {
  this.repositories = {};
  this.store = rdfstore.create();
  this.store.rdf.setPrefix('cmdb', 'urn:cmdb:');
};

// Create a new cmdb-model repository
Cmdb.prototype.createRepository = function(name, options) {
  return new Promise(function(resolve, reject) {
    if (this.repositories[name])
      reject('Cannot create repository, a repository with the name ' + name + ' already exists.');
    else
      resolve();
  }.bind(this))
  .then(function() {
    this.repositories[name] = new Repository(this.store, name, options);
    // console.log('createRepository created ' + name + ' ' + this.repositories[name]);
    return this.repositories[name].initialize();
  }.bind(this), throwfn)
  .then(function() {
    // console.log('createRepository done ' + name + ' ' + this.repositories[name]);
    return this.repositories[name];
  }.bind(this), throwfn);
};

// Retrieve a cmdb-model repository
Cmdb.prototype.getRepository = function(name) {
  return this.repositories[name];
};

var throwfn = function(e) { console.log('throwfn: '+e); throw Error(e); }

// Delete an existing cmdb-model repository
Cmdb.prototype.deleteRepository = function(name) {
  //console.log('deleteRepository ' + name);
  return new Promise(function(resolve, reject) {
    if (! this.repositories[name])
      reject('Cannot delete repository, no repository with name ' + name + ' exists.');
    resolve();
  }.bind(this))
  .then(function() {
    return this.repositories[name].delete();
  }.bind(this), throwfn)
    // var ns = this.repositories[name].ns;
    
  .then(function() {
    //console.log('deleteRepository clearing store ' + name);
    return new Promise(function(resolve, reject) {
      this.store.clear(this.repositories[name].ns, function(status) {
        if (status) {
          delete this.repositories[name];
          resolve();
          // console.log('deleteRepository done ' + name);
          // console.log(Object.keys(this.repositories));
        }
        else
          throw Error(status);
      }.bind(this));
    }.bind(this));
  }.bind(this), throwfn);

};

// Delete all existing cmdb-model repositories
Cmdb.prototype.deleteAllRepositories = function() {
  // console.log('deleteAllRepositories ' + Object.keys(this.repositories).length);
  return Promise.all(Object.keys(this.repositories).map(function(repo) {
      // console.log('deleteAllRepositories ' + repo);
      return this.deleteRepository(repo);
  }.bind(this)))
  .then(function() {
    this.repositories = {};
    // console.log('deleteAllRepositories done ' + Object.keys(this.repositories).length);
  }.bind(this), throwfn);
};

// Search/list repositories
Cmdb.prototype.searchRepositories = function(options) {
  return Object.keys(this.repositories).map(function(name) { return this.repositories[name]; }.bind(this));
};

module.exports = new Cmdb();
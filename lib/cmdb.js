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
Cmdb.prototype.createRepository = function(name) {
  return new Promise(function(resolve, reject) {
    if (this.repositories[name]) {
      reject('Cannot create repository, a repository with the name ' + name + ' already exists.');
      return;
    }

    this.repositories[name] = new Repository(this.store, name);

    resolve(this.repositories[name]);
  }.bind(this));
};

// Retrieve a cmdb-model repository
Cmdb.prototype.getRepository = function(name) {
  return this.repositories[name];
};

// Delete an existing cmdb-model repository
Cmdb.prototype.deleteRepository = function(name) {
  return new Promise(function(resolve, reject) {
    if (! this.repositories[name]) {
      reject('Cannot delete repository, no repository with name ' + name + ' exists.');
      return;
    }

    delete this.repositories[name];

    resolve();
  }.bind(this));
};

// Delete all existing cmdb-model repositories
Cmdb.prototype.deleteAllRepositories = function() {
  return new Promise(function(resolve, reject) {
    this.repositories = {};

    resolve();
  }.bind(this));
};

// Search/list repositories
Cmdb.prototype.searchRepositories = function(options) {
  return Object.keys(this.repositories).map(function(name) { return this.repositories[name]; }.bind(this));
};

module.exports = new Cmdb();
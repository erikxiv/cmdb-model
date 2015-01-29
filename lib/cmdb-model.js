var rdfstore = require('rdfstore');
var Promise = require('promise');

////
// CMDB (actions on repositories)
////

var Cmdb = function() {
  this.repositories = {};
};

// Create a new cmdb-model repository
Cmdb.prototype.createRepository = function(name) {
  return new Promise(function(resolve, reject) {
    if (this.repositories[name]) {
      reject('Cannot create repository, a repository with the name ' + name + ' already exists.');
      return;
    }

    this.repositories[name] = new Repository(name);

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

////
// Repository (actions on configuration items)
////

var Repository = function(name) {
  this.name = name;
  this.cis = {};
};

// Create a new configuration item
Repository.prototype.createCI = function(ci, options) {
  return new Promise(function(resolve, reject) {
    if (!ci.id) {
      reject('Cannot create CI, no id was provided');
      return;
    }
    if (this.cis[ci.id]) {
      reject('Cannot create CI, a CI with id ' + ci.id + ' already exists.');
      return;
    }

    this.cis[ci.id] = ci;

    resolve(this.cis[ci.id]);
  }.bind(this));
};

// Retrieve a configuration item
Repository.prototype.getCI = function(id, options) {
  return this.cis[id];
};

// Update configuration item
Repository.prototype.updateCI = function(ci, options) {
  return new Promise(function(resolve, reject) {
    if (!ci.id) {
      reject('Cannot update CI, no id was provided');
      return;
    }
    if (! this.cis[ci.id]) {
      reject('Cannot update CI, no CI with id ' + ci.id + ' exists.');
      return;
    }

    var old = this.cis[ci.id];
    Object.keys(ci.properties).forEach(function(key) { old.properties[key] = ci.properties[key]; }.bind(this));

    resolve(this.cis[ci.id]);
  }.bind(this));
};

// Delete an existing CI
Repository.prototype.deleteCI = function(id) {
  return new Promise(function(resolve, reject) {
    if (! this.cis[id]) {
      reject('Cannot delete CI, no CI with id ' + id + ' exists.');
      return;
    }

    delete this.cis[id];

    resolve();
  }.bind(this));
};

// Search/list configuration items
Repository.prototype.searchCI = function(options) {
  return Object.keys(this.cis).map(function(id) { return this.cis[id]; }.bind(this));
};



module.exports = new Cmdb();
var rdfstore = require('rdfstore');
var Promise = require('promise');

var repositories = {};

module.exports = {
  ////
  // Repository
  ////

  // Create a new cmdb-model repository
  createRepository: function(name) {
    return new Promise(function(resolve, reject) {
      if (repositories[name]) {
        reject('Cannot create repository, a repository with the name ' + name + ' already exists.');
        return;
      }

      repositories[name] = { name: name };

      resolve(repositories[name]);
    });
  },

  // Retrieve a cmdb-model repository
  getRepository: function(name) {
    return repositories[name];
  },

  // Delete an existing cmdb-model repository
  deleteRepository: function(name) {
    return new Promise(function(resolve, reject) {
      if (! repositories[name]) {
        reject('Cannot delete repository, no repository with name ' + name + ' exists.');
        return;
      }

      delete repositories[name];

      resolve();
    });
  },

  // Delete all existing cmdb-model repositories
  deleteAllRepositories: function() {
    return new Promise(function(resolve, reject) {
      repositories = {};

      resolve();
    });
  },

  // Search/list repositories
  searchRepositories: function(options) {
    return Object.keys(repositories).map(function(name) { return repositories[name]; });
  },

  ////
  // Configuration Item
  ////

  // retrieves all configuration items in a repo
  createCI: function(repo) {
    return [];
  },

};
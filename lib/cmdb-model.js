var rdfstore = require('rdfstore');
var Promise = require('promise');

var repositories = {};

module.exports = {
  // retrieves all configuration items in a repo
  getConfigurationItems: function(repo) {
    return [];
  },

  // retrieves a single ci by id
  getConfigurationItem: function(repo, id) {
    return null;
  },

  // retrieves a single ci by id
  sourceChanged: function(repo, updates) {
    return new Promise(function(resolve, reject) {
      reject('Not implemented yet');
    });
  },

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
  }
};
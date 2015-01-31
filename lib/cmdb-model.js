var rdfstore = require('rdfstore');
var Promise = require('promise');

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

////
// Repository (actions on configuration items)
////

var Repository = function(store, name) {
  this.store = store;
  this.name = name;
  this.cis = {};
  this.changes = {};
  this.revision = 1;
  this.prefix = name+':';
  this.ns = 'urn:'+this.prefix;
  this.store.rdf.setPrefix(name, this.ns);
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

    // Store new CI
    createCI(this, ci)
    .then(function(ci) {
      // console.log('.createCI - before createChange');
      // Create change
      return createChange(this, {
        updates: [
          {
            id: ci.id,
            operation: 'create',
            before: {},
            after: ci
          }
        ]      
      });
    }.bind(this))
    .then(function(change) {
      // console.log('.createCI - ok createChange');
      resolve(this.cis[ci.id]);
    }.bind(this), function(err) {
      // console.log('.createCI - err createChange');
      reject(Error(err));
    });
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

    // Store new CI
    var oldcopy = copyCI(this.cis[ci.id]);
    updateCI(this, ci)
    .then(function(ci) {
      // Create change
      return createChange(this, {
        updates: [
          {
            id: ci.id,
            operation: 'update',
            before: oldcopy,
            after: ci
          }
        ]      
      });
    }.bind(this))
    .then(function(change) {
      resolve(change[0].after);
    }, function(err) {
      reject(Error(err));
    });
  }.bind(this));
};

// Delete an existing CI
Repository.prototype.deleteCI = function(id) {
  return new Promise(function(resolve, reject) {
    if (! this.cis[id]) {
      reject('Cannot delete CI, no CI with id ' + id + ' exists.');
      return;
    }

    var oldcopy = copyCI(this.cis[id]);
    deleteCI(this, id)
    .then(function() {
      // Create change
      return createChange(this, {
        updates: [
          {
            id: id,
            operation: 'delete',
            before: oldcopy,
            after: {}
          }
        ]      
      });
    }.bind(this))
    .then(function(change) {
      resolve();
    }, function(err) {
      reject(Error(err));
    });
  }.bind(this));
};

// Search/list configuration items
Repository.prototype.searchCI = function(options) {
  return Object.keys(this.cis).map(function(id) { return this.cis[id]; }.bind(this));
};

////
// Repository (Changes)
////

// Create a new change
Repository.prototype.createChange = function(change, options) {
  return new Promise(function(resolve, reject) {
    createChange(this, change)
    .then(function(change) {
      change.updates.forEach(function(update) {
        update.after = update.after || {};
        update.before = update.before || {};
        update.after.id = update.before.id = update.id;
        if (update.operation === 'create')
          createCI(this, update.after);
        else if (update.operation === 'update')
          updateCI(this, update.after);
        else if (update.operation === 'delete')
          deleteCI(this, update.id);
      }.bind(this));
    }.bind(this))
    .then(function(change) {
      resolve();
    }, function(err) {
      reject(Error(err));
    });
  }.bind(this));
};

// Search/list changes
Repository.prototype.searchChanges = function(options) {
  return Object.keys(this.changes).map(function(id) { return this.changes[id]; }.bind(this));
};

// Search/list changes
Repository.prototype.resolved = function(prefixed) {
  return this.store.rdf.createNamedNode(this.store.rdf.resolve(prefixed));
};

//////
//// Internal functions
//////
function resolved(repo, prefixed) {
  return repo.store.rdf.createNamedNode(repo.store.rdf.resolve(prefixed));
}

function rdfCI(repo, ci) {
  var rdf = repo.store.rdf;
  var graph = rdf.createGraph();
  var revision = ci.revision ? ci.revision : 1;
  graph.add(rdf.createTriple(repo.resolved(repo.prefix+ci.id), repo.resolved('rdf:type'), repo.resolved('cmdb:ci')));
  graph.add(rdf.createTriple(repo.resolved(repo.prefix+ci.id), repo.resolved('cmdb:id'), rdf.createLiteral(ci.id)));
  graph.add(rdf.createTriple(repo.resolved(repo.prefix+ci.id), repo.resolved('cmdb:revision'), rdf.createLiteral(revision)));
  Object.keys(ci.properties).forEach(function (key) {
    var p = rdf.createBlankNode();
    graph.add(rdf.createTriple(repo.resolved(repo.prefix+ci.id), repo.resolved('cmdb:property'), p));
    graph.add(rdf.createTriple(p, repo.resolved('cmdb:key'), rdf.createLiteral(key)));
    graph.add(rdf.createTriple(p, repo.resolved('cmdb:value'), rdf.createLiteral(ci.properties[key])));
  });
  // state.store.insert(graph, function() {});
  console.log(graph.toNT());
}

function copyCI(ci) {
  return ci;
}

function createCI(repo, ci) {
  // console.log(repo);
  // console.log('- createCI');
  return new Promise(function(resolve, reject) {
    rdfCI(repo, ci);
    repo.cis[ci.id] = ci;
    // console.log('x createCI');
    resolve(ci);
  });
}

function updateCI(repo, ci) {
  return new Promise(function(resolve, reject) {
    var old = repo.cis[ci.id];
    Object.keys(ci.properties).forEach(function(key) { old.properties[key] = ci.properties[key]; });

    resolve(old);
  });
}

function deleteCI(repo, id) {
  return new Promise(function(resolve, reject) {
    delete repo.cis[id];
    resolve();
  });
}

function createChange(repo, change) {
  // console.log('- createChange');
  return new Promise(function(resolve, reject) {
    repo.revision = repo.revision + 1;
    var rev = repo.revision;
    change.revision = rev;
    // console.log(rev);
    repo.changes[rev] = change;
    // console.log('x createChange');
    resolve(change);
  });
}

module.exports = new Cmdb();
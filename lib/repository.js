var Promise = require('promise');

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

Repository.prototype.resolve = function(prefixed) {
  if (typeof prefixed === 'string') {
    if (prefixed.indexOf(':') < 0)
      prefixed = this.name + ':' + prefixed;
    return this.store.rdf.resolve(prefixed);
  }
  return prefixed;
};

Repository.prototype.resolved = function(prefixed) {
  if (typeof prefixed === 'string') {
    if (prefixed.indexOf(':') < 0)
      prefixed = this.name + ':' + prefixed;
    return this.store.rdf.createNamedNode(this.store.rdf.resolve(prefixed));
  }
  return prefixed;
};

Repository.prototype.triple = function(s, p, o) {
  return this.store.rdf.createTriple(this.resolved(s), this.resolved(p), this.resolved(o));
};

Repository.prototype.literal = function(s) {
  return this.store.rdf.createLiteral(s);
};

//////
//// Internal functions
//////
function resolved(repo, prefixed) {
  return repo.store.rdf.createNamedNode(repo.store.rdf.resolve(prefixed));
}

function rdfCI(repo, ci) {
  var graph = repo.store.rdf.createGraph();
  var revision = ci.revision ? ci.revision : 1;
  graph.add(repo.triple(ci.id, 'rdf:type', 'cmdb:ci'));
  graph.add(repo.triple(ci.id, 'cmdb:id', repo.literal(ci.id)));
  graph.add(repo.triple(ci.id, 'cmdb:revision', repo.literal(revision)));
  Object.keys(ci.properties).forEach(function (key) {
    graph.add(repo.triple(ci.id, key, repo.literal(ci.properties[key])));
  });
  // state.store.insert(graph, function() {});
  return graph;
}

function copyCI(ci) {
  return ci;
}

function createCI(repo, ci) {
  // console.log(repo);
  // console.log('- createCI');
  return new Promise(function(resolve, reject) {
    repo.cis[ci.id] = ci;
    // console.log('x createCI');
    repo.store.insert(rdfCI(repo, ci), repo.ns, function(success) {
      resolve(ci);
    });
  });
}

function updateCI(repo, ci) {
  return new Promise(function(resolve, reject) {
    var old = repo.cis[ci.id];
    var gnew = repo.store.rdf.createGraph();
    var gold = repo.store.rdf.createGraph();
    Object.keys(ci.properties).forEach(function(key) {
      gold.add(repo.triple(ci.id, key, repo.literal(old.properties[key])));
      gnew.add(repo.triple(ci.id, key, repo.literal(ci.properties[key])));
      old.properties[key] = ci.properties[key];
    });
    repo.store.delete(gold, repo.ns, function(success) {
      repo.store.insert(gnew, repo.ns, function() {
        resolve(old);
      });
    });
  });
}

function deleteCI(repo, id) {
  return new Promise(function(resolve, reject) {
    delete repo.cis[id];
    repo.store.node(repo.resolve(id), repo.ns, function(success, g) {
      repo.store.delete(g, repo.ns, function(success) {
        resolve();
      })
    });
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

module.exports = Repository;
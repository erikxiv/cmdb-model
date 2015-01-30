var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var should = chai.Should();
chai.use(chaiAsPromised);

var cmdb = require('../lib/cmdb-model');

describe('cmdb-model', function() {
  ////
  // Repository
  ////
  describe('repository', function() {
    beforeEach(function() {
      cmdb.createRepository('test');
    });
    afterEach(function() {
      cmdb.deleteAllRepositories();
    });

    describe('.createRepository', function() {
      it('should create a repository', function() {
        cmdb.createRepository('test2').should.be.fulfilled;
        cmdb.getRepository('test2').should.be.ok;
      });
    });

    describe('.getRepository', function() {
      it('should retrieve a repository', function() {
        cmdb.getRepository('test').should.be.ok;
      });
    });

    describe('.deleteRepository', function() {
      it('should delete a repository', function() {
        cmdb.deleteRepository('test').should.be.fulfilled;
        should.not.exist(cmdb.getRepository('test'));
      });
    });

    describe('.deleteAllRepositories', function() {
      it('should delete all repositories', function() {
        cmdb.deleteAllRepositories().should.be.fulfilled;
        should.not.exist(cmdb.getRepository('test'));
        cmdb.searchRepositories().should.have.length(0);
      });
    });

    describe('.searchRepositories', function() {
      it('should list all repositories', function() {
        cmdb.searchRepositories().should.have.length(1);
      });
    });
  });

  ////
  // Configuration Item
  ////
  describe('configuration item', function() {
    var repo = null;

    beforeEach(function(done) {
      cmdb.createRepository('test').then(function(r) {
        repo = r;
        return repo.createCI({ id: '1', properties: {key1: 'value1', key2: 'value2'}});
      })
      .then(function(ci) {
        return repo.createCI({ id: '2', properties: {key1: 'value1', key2: 'valueB'}});
      })
      .then(function(ci) {
        done();
      });
    });
    afterEach(function() {
      cmdb.deleteAllRepositories();
    });

    describe('.createCI', function() {
      it('should create a CI', function() {
        repo.createCI({ id: '3', properties: {key1: 'value1', key2: 'valueQ'}}).should.be.fulfilled;
        repo.getCI('3').properties.key2.should.equal('valueQ');
      });
    });

    describe('.getCI', function() {
      it('should retrieve a CI', function() {
        repo.getCI('1').properties.key2.should.equal('value2');
      });
    });

    describe('.updateCI', function() {
      it('should update a CI', function() {
        repo.updateCI({ id: '1', properties: {key2: 'other' }}).should.be.fulfilled;
        repo.getCI('1').properties.key2.should.equal('other');
        repo.getCI('1').properties.key1.should.equal('value1');
      });
    });

    describe('.deleteCI', function() {
      it('should delete a CI', function() {
        repo.deleteCI('1').should.be.fulfilled;
        should.not.exist(repo.getCI('1'));
      });
    });

    describe('.searchCI', function() {
      it('should list all CIs', function() {
        repo.searchCI().should.have.length(2);
      });
    });
  });

  ////
  // Change
  ////
  describe('change', function() {
    var repo = null;

    beforeEach(function(done) {
      cmdb.createRepository('test').then(function(r) {
        repo = r;
        repo.createCI({ id: '1', properties: {key1: 'value1', key2: 'value2'}});
        repo.createCI({ id: '2', properties: {key1: 'value1', key2: 'valueB'}});
        done();
      });
    });
    afterEach(function() {
      cmdb.deleteAllRepositories();
    });

    describe('.createChange', function() {
      it('should create a change', function(done) {
        repo.createChange({updates:[{id:'1',operation:'update',after:{properties:{key2:'other'}}}]})
        .then(function(change) {
          repo.searchChanges().should.have.length(3);
          repo.getCI('1').properties.key2.should.equal('other');
          repo.getCI('1').properties.key1.should.equal('value1');
          done();
        }, function(err) {
          done(Error(err));
        });
      });
    });

    describe('.searchChanges', function() {
      it('should list all changes', function() {
        repo.searchChanges().should.have.length(2);
      });
    });
  });

});
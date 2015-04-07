var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var should = chai.Should();
chai.use(chaiAsPromised);

var cmdb = require('../lib/cmdb');

describe('cmdb-model', function() {
  ////
  // Repository
  ////
  describe('repository', function() {
    beforeEach(function(done) {
      // console.log('beforeEach');
      cmdb.createRepository('test').then(function() {
        // console.log('beforeEach done');
        done();
      });
    });
    afterEach(function(done) {
      // console.log('afterEach');
      cmdb.deleteAllRepositories().then(function() {
        // console.log('afterEach done');        
        done();
      });
    });

    describe('.createRepository', function() {
      it('should create a repository', function(done) {
        cmdb.createRepository('test2')
        .then(function() {
          cmdb.getRepository('test2').should.be.ok;
          done();
        })
      });
    });

    describe('.getRepository', function() {
      it('should retrieve a repository', function() {
        cmdb.getRepository('test').should.be.ok;
      });
    });

    describe('.deleteRepository', function() {
      it('should delete a repository', function(done) {
        cmdb.deleteRepository('test').then(function() {
          should.not.exist(cmdb.getRepository('test'));
          done();
        });
      });
    });

    describe('.deleteAllRepositories', function() {
      it('should delete all repositories', function(done) {
        cmdb.deleteAllRepositories()
        .then(function() {
          should.not.exist(cmdb.getRepository('test'));
          cmdb.searchRepositories().should.have.length(0);
          done();
        });
      });
    });

    describe('.searchRepositories', function() {
      it('should list all repositories', function() {
        cmdb.searchRepositories().should.have.length(1);
      });
    });
  });

  var throwfn = function(err) { console.log('threw ' + err); throw Error(err); }

  ////
  // Configuration Item
  ////
  describe('configuration item', function() {
    var repo = null;

    beforeEach(function(done) {
      // console.log('ci beforeEach');
      cmdb.createRepository('test').then(function(r) {
        repo = r;
        return repo.createCI({ id: '1', properties: {key1: 'value1', key2: 'value2'}});
      }, throwfn)
      .then(function(ci) {
        return repo.createCI({ id: '2', properties: {key1: 'value1', key2: 'valueB'}});
      }, throwfn)
      .then(function(ci) {
        // console.log('ci beforeEach done');
        done();
      }, throwfn);
    });
    afterEach(function(done) {
      // console.log('ci afterEach');
      cmdb.deleteAllRepositories()
      .then(function() {
        // console.log('ci afterEach done');
        done();
      });
    });

    describe('.createCI', function() {
      it('should create a CI', function(done) {
        repo.createCI({ id: '3', properties: {key1: 'value1', key2: 'valueQ'}})
        .then(function() {
          repo.getCI('3').properties.key2.should.equal('valueQ');
          done();
        })
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
      // console.log('change beforeEach');
      cmdb.createRepository('test').then(function(r) {
        repo = r;
        return repo.createCI({ id: '1', properties: {key1: 'value1', key2: 'value2'}});
      }, throwfn)
      .then(function(ci) {
        return repo.createCI({ id: '2', properties: {key1: 'value1', key2: 'valueB'}});
      }, throwfn)
      .then(function(ci) {
        // console.log('change beforeEach done');
        done();
      }, throwfn);
    });
    afterEach(function(done) {
      // console.log('change afterEach');
      cmdb.deleteAllRepositories()
      .then(function() {
        // console.log('change afterEach done');
        done();
      }, done);
    });

    describe('.createChange', function() {
      it('should create a change', function(done) {
        repo.createChange({updates:[{id:'1',operation:'update',after:{properties:{key2:'other'}}}]})
        .then(function(change) {
          repo.searchChanges().should.have.length(3);
          repo.getCI('1').properties.key2.should.equal('other');
          repo.getCI('1').properties.key1.should.equal('value1');
          done();
        }, done);
      });
    });

    describe('.searchChanges', function() {
      it('should list all changes', function() {
        repo.searchChanges().should.have.length(2);
      });
    });
  });

});
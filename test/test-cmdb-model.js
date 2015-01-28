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
        done();
      });
    });
    afterEach(function() {
      cmdb.deleteAllRepositories();
    });

    describe('.createCI', function() {
      it.only('should create a CI', function() {
        repo.createCI({ id: '1', key1: 'value1', key2: 'value2'});
        repo.createCI({ id: '2', key1: 'value1', key2: 'valueB'});
        repo.createCI({ id: '3', key1: 'value1', key2: 'valueQ'}).should.be.fulfilled;
        repo.getCI('3').key2.should.equal('valueQ');
      });
    });

    describe('.getCI', function() {
      it('should retrieve a CI', function() {
        repo.createCI({ id: '1', key1: 'value1', key2: 'value2'});
        repo.createCI({ id: '2', key1: 'value1', key2: 'valueB'});
        repo.getCI('1').key2.should.equal('value2');
      });
    });

    describe('.updateCI', function() {
      it('should update a CI', function() {
        repo.createCI({ id: '1', key1: 'value1', key2: 'value2'});
        repo.createCI({ id: '2', key1: 'value1', key2: 'valueB'});
        repo.updateCI({ id: '1', key2: 'other' }).should.be.fulfilled;
        repo.getCI('1').key2.should.equal('other');
        repo.getCI('1').key1.should.equal('value1');
      });
    });

    describe('.deleteCI', function() {
      it('should delete a CI', function() {
        repo.createCI({ id: '1', key1: 'value1', key2: 'value2'});
        repo.createCI({ id: '2', key1: 'value1', key2: 'valueB'});
        repo.deleteCI('1').should.be.fulfilled;
        should.not.be.ok(repo.getCI('1'));
      });
    });

    describe('.searchCI', function() {
      it('should list all CIs', function() {
        repo.createCI({ id: '1', key1: 'value1', key2: 'value2'});
        repo.createCI({ id: '2', key1: 'value1', key2: 'valueB'});
        repo.searchCI().should.have.length(2);
      });
    });
  });

  // describe('.sourceChanged', function() {
  //   it('should be possible to add a ci', function(done) {
  //     cmdb.sourceChanged('test', {
  //       updates: [
  //         {
  //           id: 'newMachine',
  //           updateType: 'added',
  //           before: {},
  //           after: {
  //             id: 'newMachine',
  //             type: 'machine',
  //             properties: {
  //               ip: '1.2.3.4'
  //             },
  //             relationships: {
  //             }
  //           }
  //         }
  //       ]
  //     }).then(function(result) {
  //       cmdb.getConfigurationItem('test', 'newMachine').should.have.deep.property('properties.ip', '1.2.3.4');
  //       done();
  //     }, function(error) {
  //       done(Error(error));
  //     });
  //   });
  // });
});
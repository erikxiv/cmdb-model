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
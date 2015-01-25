var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.Should();
chai.use(chaiAsPromised);

var cmdb = require('../lib/cmdb-model');

describe('cmdb-model', function() {
  before(function() {
    // console.log("before");
  });
  beforeEach(function() {
    // console.log("beforeEach");
    cmdb.createRepository('test');
  });
  afterEach(function() {
    // console.log("afterEach");
    cmdb.deleteAllRepositories();
  });
  after(function() {
    // console.log("after");
  });

  describe('.createRepository', function() {
    it('should create a repository', function() {
      cmdb.createRepository('test2').should.be.fulfilled;
      cmdb.getConfigurationItems('test2').should.have.length(0);
    });
  });

  describe('.deleteRepository', function() {
    it('should delete a repository', function() {
      cmdb.deleteRepository('test').should.be.fulfilled;
    });
  });

  describe('.sourceChanged', function() {
    it('should be possible to add a ci', function(done) {
      cmdb.sourceChanged('test', {
        updates: [
          {
            id: 'newMachine',
            updateType: 'added',
            before: {},
            after: {
              id: 'newMachine',
              type: 'machine',
              properties: {
                ip: '1.2.3.4'
              },
              relationships: {
              }
            }
          }
        ]
      }).then(function(result) {
        cmdb.getConfigurationItem('test', 'newMachine').should.have.deep.property('properties.ip', '1.2.3.4');
        done();
      }, function(error) {
        done(Error(error));
      });
    });
  });
});
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var should = chai.Should();
chai.use(chaiAsPromised);
var tmp = require('tmp');

var cmdb = require('../lib/cmdb-model');
var fa = require('../lib/file-adapter');

describe('file-adapter', function() {
  ////
  // Test
  ////
  describe('test framework', function() {
    describe('tmp', function(done) {
      it.skip('should do some tests', function() {
        tmp.file(function(err, path) {
          console.log(path);
        });
        tmp.dir(function(err, path) {
          console.log(path);
          tmp.file({dir: path}, function(err, path) {
            console.log(path);
          });
        });
      });
    });
  });

  ////
  // Adapter
  ////
  describe('adapter', function() {
    var rootDir = '/tmp';

    beforeEach(function(done) {
      cmdb.createRepository('test')
      .then(function() {
        tmp.dir(function(err, path) {
          if (err)
            done(Error(err));
          rootDir = path;
          done();
        })
      });
    });

    afterEach(function(done) {
      cmdb.deleteAllRepositories()
      .then(function() {
        done();
      });
    });

    describe('.createAdapter', function() {
      it('should create a file adapter', function() {
        fa.createAdapter(cmdb, rootDir).should.be.fulfilled;
      });
    });
  });

});
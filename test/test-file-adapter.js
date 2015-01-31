var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var should = chai.Should();
chai.use(chaiAsPromised);
var rewire = require("rewire");

var cmdb = require('../lib/cmdb-model');
var fa = rewire('../lib/file-adapter');

var chokidarMock = {
  wadd: null,
  waddDir: null,
  wchange: null,
  wunlink: null,
  wunlinkDir: null,
  werror: null,
  wready: null,
  add: function(path) { return wadd(path); },
  addDir: function(path) { return waddDir(path); },
  change: function(path) { return wchange(path); },
  unlink: function(path) { return wunlink(path); },
  unlinkDir: function(path) { return wunlinkDir(path); },
  error: function(path) { return werror(path); },
  ready: function(path) { return wready(path); },

  watch: function(dir, options) {
    return {
      on: function(action, fn) {
        if (action==='add') {wadd=fn;return this;}
        if (action==='addDir') {waddDir=fn;return this;}
        if (action==='change') {wchange=fn;return this;}
        if (action==='unlink') {wunlink=fn;return this;}
        if (action==='unlinkDir') {wunlinkDir=fn;return this;}
        if (action==='error') {werror=fn;return this;}
        if (action==='ready') {wready=fn;wready('/tmp/');return this;}
      }
    };
  }
};
fa.__set__('chokidar', chokidarMock);

describe('file-adapter', function() {
  ////
  // Adapter
  ////
  describe('adapter', function() {
    var rootDir = '/tmp/';
    var test = null;

    beforeEach(function(done) {
      cmdb.createRepository('test')
      .then(function(t) {
        test = t;
        done();
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
        fa.createAdapter(test, rootDir).should.be.fulfilled;
      });
    });

    describe('detecting file changes', function() {
      beforeEach(function(done) {
        fa.createAdapter(test, rootDir).then(function() {
          done();
        });
      });

      it('should detect addition of file', function(done) {
        chokidarMock.add('asdf').then(function() {
          try {
            test.searchCI().should.have.length(1);
            done();
          }
          catch (err) {
            done(Error(err));
          }
        }, function(err) {
          done(Error(err));
        });
      });

      it('should detect addition of directory', function(done) {
        chokidarMock.addDir('asdf').then(function() {
          try {
            test.searchCI().should.have.length(1);
            done();
          }
          catch (err) {
            done(Error(err));
          }
        }, function(err) {
          done(Error(err));
        });
      });

      it('should detect deletion of file', function(done) {
        chokidarMock.add('asdf').then(function() {
          return chokidarMock.unlink('asdf');
        })
        .then(function() {
          try {
            test.searchCI().should.have.length(0);
            done();
          }
          catch (err) {
            done(Error(err));
          }
        }, function(err) {
          done(Error(err));
        });
      });

      it('should detect deletion of directory', function(done) {
        chokidarMock.addDir('asdf').then(function() {
          return chokidarMock.unlinkDir('asdf');
        })        
        .then(function() {
          try {
            test.searchCI().should.have.length(0);
            done();
          }
          catch (err) {
            done(Error(err));
          }
        }, function(err) {
          done(Error(err));
        });
      });
    });
  });

});
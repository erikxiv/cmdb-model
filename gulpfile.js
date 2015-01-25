// npm install gulp gulp-mocha

var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('default', ['test'], function() {
});

gulp.task('test', function() {
  return gulp.src(['test/test-*.js'], { read: false })
    .pipe(mocha({
      reporter: 'spec',
      globals: {
        should: require('should')
      }
    }));
});

gulp.task('dummy', function() {
  console.log("Hello World");
});
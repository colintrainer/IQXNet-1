var gulp   = require('gulp')
var stylus = require('gulp-stylus')

gulp.task('css', function () {
  return gulp.src('stylus/**/*.styl')
    .pipe(stylus())
    .pipe(gulp.dest('assets'))
})

gulp.task('watch:css', ['css'], function () {
  gulp.watch('stylus/**/*.styl', ['css'])
})

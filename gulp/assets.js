var gulp   = require('gulp')
var unzip = require('gulp-unzip')

gulp.task('assets', function () {
  return gulp.src("assets.zip")
    .pipe(unzip())
    .pipe(gulp.dest('assets'))
})

gulp.task('watch:assets', ['assets'], function () {
  gulp.watch('assets.zip', ['assets'])
})

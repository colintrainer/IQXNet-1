var gulp   = require('gulp')
var jade = require('gulp-jade')

gulp.task('jade', function () {
  return gulp.src('jade/**/*.jade')
    .pipe(jade({pretty:true, doctype:'HTML'}))
    .pipe(gulp.dest('views'))
})

gulp.task('watch:jade', ['jade'], function () {
  gulp.watch('jade/**/*.jade', ['jade'])
})

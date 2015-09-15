var gulp   = require('gulp')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var ngAnnotate = require('gulp-ng-annotate')
var sourcemaps = require('gulp-sourcemaps')

gulp.task('js', function () {    // module.js is specified as the first source so that the app module is inserted into the destination before everything else
  return gulp.src(['cliControllers/module.js', 'cliControllers/**/*.js'])   
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dump'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('assets'))
})

gulp.task('watch:js', ['js'], function () {
  gulp.watch('cliControllers/**/*.js', ['js'])
})

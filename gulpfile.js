var gulp = require('gulp')
var fs   = require('fs')
fs.readdirSync(__dirname + '/gulp').forEach(function (task) {
  require('./gulp/' + task)
})

gulp.task('build', ['js', 'css', 'jade', 'assets'])
gulp.task('watch', ['watch:js', 'watch:css', 'watch:jade', 'watch:assets'])
gulp.task('dev', ['watch', 'dev:server'])

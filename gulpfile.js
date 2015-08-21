'use strict'

var gulp = require('gulp')
  , gzip = require('gulp-gzip')
  , hbs = require('gulp-compile-handlebars')
  , rename = require('gulp-rename')
  , tar = require('gulp-tar')

var browserSync = require('browser-sync').create()
  , clean = require('del')
  , metadata = require('./package')
  , path = require('path')
  , runSequence = require('run-sequence')

var dist = path.join(__dirname, 'dist')
  , libs = path.join(__dirname, 'node_modules')
  , src = path.join(__dirname, 'src')

var packageName = metadata.name + '-' + metadata.version

gulp.task('default', ['hbs', 'css', 'js', 'assets'])

gulp.task('hbs', function () {
  var options = { ignorePartials: true
                , batch: [src]
                }

  return gulp.src(path.join(src, 'index.hbs'))
    .pipe(hbs({}, options))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(dist))
    .pipe(browserSync.stream())
})

gulp.task('js', function () {
  // TODO: Process your javascript libs here.
})

gulp.task('css', function () {
  return gulp.src(path.join(src, 'css', '*.css'))
    .pipe(gulp.dest(path.join(dist, 'css')))
})

gulp.task('assets', function () {
  // TODO: Process your assets here.
})

gulp.task('serve', ['default'], function () {
  browserSync.init({
    server: {
      baseDir: dist
    }
  })

  gulp.watch(path.join(src, '*.hbs'), ['hbs'])
  gulp.watch(path.join(src, 'css', '*.css'), ['css'])
  gulp.watch(path.join(src, 'js', '*.js'), ['js'])
})

gulp.task('package', function (cb) {
  runSequence('clean', 'default', function () {
    gulp.src(path.join(dist, '**/*.*'))
      .pipe(tar(packageName + '.tar'))
      .pipe(gzip())
      .pipe(gulp.dest('.'))
    cb()
  })
})

gulp.task('clean', function (cb) {
  clean([dist, packageName + '.tar.gz'], cb)
})


'use strict'

var gulp = require('gulp')
  , concat = require('gulp-concat')
  , gzip = require('gulp-gzip')
  , hbs = require('gulp-compile-handlebars')
  , pages = require('gulp-gh-pages')
  , rename = require('gulp-rename')
  , tar = require('gulp-tar')

var browserSync = require('browser-sync').create()
  , clean = require('del')
  , fs = require('fs')
  , metadata = require('./package')
  , path = require('path')
  , runSequence = require('run-sequence')

var dist = path.join(__dirname, 'dist')
  , libs = path.join(__dirname, 'node_modules')
  , src = './src'

var packageName = metadata.name + '-' + metadata.version

gulp.task('default', ['hbs', 'css', 'js', 'assets'])

gulp.task('hbs', function () {
  var copyright = function (year) { return year + '-' + new Date().getFullYear() }
  var options = { ignorePartials: true
                , batch: [src]
                , helpers: { copyright: copyright }
                }

  var pages = ['index']

  return pages.forEach(function (page) {
    var context = JSON.parse(fs.readFileSync(path.join('src/context', page + '.json'))) || {en: {}, es: {}}

    return gulp.src(path.join(src, page + '.hbs'))
      .pipe(hbs(context.en, options))
      .pipe(rename({basename: page, extname: '.html'}))
      .pipe(gulp.dest(dist))
      .pipe(browserSync.stream())
  })
})

gulp.task('js', function () {
  // TODO: Process your javascript libs here.
})

gulp.task('css', function () {
  var css = [ 'theme.css'
            , 'layout10.css'
            , 'color_1.css'
            , 'custom.css'
            ].map(function (css) { return path.join(src, 'css', css) })

  return gulp.src(css)
    .pipe(concat('app.css'))
    .pipe(gulp.dest(path.join(dist, 'css')))
    .pipe(browserSync.stream())
})

gulp.task('assets', function () {
  gulp.src(path.join(src, 'img', '*.*'))
    .pipe(gulp.dest(path.join(dist, 'img')))
    .pipe(browserSync.stream())
})

gulp.task('deploy', function () {
  return gulp.src(path.join(dist, '**/*'))
    .pipe(pages())
})

gulp.task('serve', ['default'], function () {
  browserSync.init({
    server: {
      baseDir: dist
    }
  })

  gulp.watch(path.join(src, '**/*.hbs'), ['hbs'])
  gulp.watch(path.join(src, 'context/*.json'), ['hbs'])
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


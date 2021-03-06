'use strict'

var gulp = require('gulp')
  , concat = require('gulp-concat')
  , file = require('gulp-file')
  , gzip = require('gulp-gzip')
  , hbs = require('gulp-compile-handlebars')
  , pages = require('gulp-gh-pages')
  , rename = require('gulp-rename')
  , tar = require('gulp-tar')

var browserSync = require('browser-sync').create()
  , clean = require('del')
  , extend = require('lodash.assign')
  , fs = require('fs')
  , merge = require('merge-stream')
  , metadata = require('./package')
  , path = require('path')
  , runSequence = require('run-sequence')

var dist = path.join(__dirname, 'dist')
  , libs = path.join(__dirname, 'node_modules')
  , src = './src'

var packageName = metadata.name + '-' + metadata.version
  , websiteName = 'cjbtaxandbookkeeping.com'

gulp.task('default', ['hbs', 'css', 'js', 'assets'])

gulp.task('hbs', function () {
  var copyright = function (year) { return year + '-' + new Date().getFullYear() }
  var options = { ignorePartials: true
                , batch: [src]
                , helpers: { copyright: copyright }
                }

  var pages = ['index', 'about', 'services', 'resources', 'contact']
    , pageStream = merge()

  pages.map(function (page) {
    var context = JSON.parse(fs.readFileSync(path.join(src, 'context', page + '.json'), 'utf8'))
    var navContext = JSON.parse(fs.readFileSync(path.join(src, 'context/nav.json'), 'utf8'))
    var esContext = extend({page: page + '.html', baseAssets: '../'}, context.es, navContext.es, context.common)
    var enContext = extend({page: page + '.html'}, context.en, navContext.en, context.common)

    var enStream = gulp.src(path.join(src, page + '.hbs'))
      .pipe(hbs(enContext, options))
      .pipe(rename({basename: page, extname: '.html'}))
      .pipe(gulp.dest(dist))
      .pipe(browserSync.stream())

    var esStream = gulp.src(path.join(src, page + '.hbs'))
      .pipe(hbs(esContext, options))
      .pipe(rename({basename: page, extname: '.html'}))
      .pipe(gulp.dest(path.join(dist, 'es')))
      .pipe(browserSync.stream())

    return merge(enStream, esStream)
  }).forEach(function(page) { pageStream.add(page) })

  return pageStream
})

gulp.task('js', function () {
  return gulp.src(path.join(src, 'js/**/*.js'))
    .pipe(gulp.dest(path.join(dist, 'js')))
    .pipe(browserSync.stream())
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
  return gulp.src([path.join(dist, '**/*'), 'sitemap.txt'])
    .pipe(file('CNAME', websiteName))
    .pipe(pages())
})

gulp.task('serve', ['default'], function () {
  browserSync.init({
    server: {
      baseDir: dist
    },
    snippetOptions: { rule: { match: /<link[^>]*>/i } }
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


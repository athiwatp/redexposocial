'use strict'

let gulp = require('gulp'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    nodemon = require('gulp-nodemon'),
    sourcemaps = require('gulp-sourcemaps'),
    htmlmin = require('gulp-htmlmin'),
    webpack = require('webpack-stream'),
    concat = require('gulp-concat')

gulp.task('sass', function() {
  return gulp.src('src/css/:*+/*.scss')
  //TODO: remove source maps on distribution
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(cleanCSS({compatibility: 'ie8'}))
  .pipe(concat('master.css'))
  .pipe(rename({suffix: '.min'}))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./public/css'))
})

gulp.task('watch', function() {
  gulp.watch('./src/css/:*+/*.scss', ['sass'])
  gulp.watch('./src/views/:*+/*.html', ['htmlminify'])
  gulp.watch(['./src/js/:*+/*.js','./src/js/**/*.vue'], ['webpack'])
})

gulp.task('htmlminify', function() {
  return gulp.src('src/views/:*+/*.html')
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(gulp.dest('public/views'))
})

//Bundle creation, minification and rename
gulp.task('webpack', function(){
  return gulp.src(['./src/js/auth.js','./src/js/app.js']) //Strange workaround
  .pipe(
    webpack(require(__dirname + '/webpack.config.js'))
    // .on('error', (err) => {
    //   if (err) console.log('--- Webpack error ---\n', err)
    // })
  )
  .pipe(rename('bundle.js'))
  .pipe(gulp.dest('public/js'))
})

gulp.task('start', function () {
  nodemon({
    script: 'server.js',
    ext: 'js',
    env: { 'NODE_ENV': 'development' }
  })
})

gulp.task('build', ['sass','htmlminify','webpack'])
gulp.task('test', ['sass','htmlminify','webpack','watch','start'])

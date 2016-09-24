let gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    nodemon = require('gulp-nodemon'),
    sourcemaps = require('gulp-sourcemaps'),
    htmlmin = require('gulp-htmlmin'),
    minify = require('gulp-minify'),
    concat = require('gulp-concat');

gulp.task('sass', function() {
  return gulp.src('src/css/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(concat('master.css'))
    .pipe(rename({
            suffix: '.min'
        }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./public/css'));
});

gulp.task('watch', function() {
    gulp.watch('./src/css/**/*.scss', ['sass'])
    gulp.watch(['./src/views/**/*.html'], ['htmlminify'])
    gulp.watch('./src/js/**/*.js',['minify'])
});

gulp.task('htmlminify', function() {
  return gulp.src(['./src/views/*/*.html','./src/views/*.html'])
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./public/views'))
});

gulp.task('minify', function() {
  return gulp.src('./src/js/*.js')
    .pipe(minify({
          ext:{
              min:'.js'
          },
      }))
    .pipe(rename({
            suffix: '.min'
        }))
    .pipe(gulp.dest('./public/js'))
})

gulp.task('start', function () {
  nodemon({
    script: 'server.js',
    ext: 'js',
    env: { 'NODE_ENV': 'development' }
  })
});

gulp.task('default', ['sass','htmlminify','minify','watch','start']);

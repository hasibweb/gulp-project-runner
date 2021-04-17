const gulp = require('gulp'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cleanCSS = require('gulp-clean-css'),
  sourcemaps = require('gulp-sourcemaps'),
  concat = require('gulp-concat'),
  imagemin = require('gulp-imagemin'),
  changed = require('gulp-changed'),
  uglify = require('gulp-uglify'),
  lineec = require('gulp-line-ending-corrector'),
  htmlmin = require('gulp-htmlmin'),
  babel = require('gulp-babel'),
  del = require('del'),
  browserSync = require('browser-sync').create();

/**
 *           Development
 * Write All Development Functions Below
 */

// Clean src/css on restart
function devCleanCss() {
  return del('./src/css/**', { force: true });
}

// CSS on dev
function devCSS() {
  return gulp
    .src('./src/scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(sourcemaps.write())
    .pipe(lineec())
    .pipe(gulp.dest('./src/css'))
    .pipe(browserSync.stream());
}

/**
 *           Production
 * Write All Production Functions Below
 */

/**
 * Delete dist folder before rebuild
 */
function cleanDist() {
  return del('dist/**', { force: true });
}

// copy and minify Html... on build
function buildHTML() {
  return gulp
    .src('./src/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist'));
}

// Css autoprefix, minify... on Build
function buildCSS() {
  return gulp
    .src('./src/scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(sourcemaps.write('./'))
    .pipe(lineec())
    .pipe(gulp.dest('./dist/css'));
}

// Js babel, minify... on build
function buildJS() {
  return gulp
    .src('./src/js/*.js')
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(lineec())
    .pipe(gulp.dest('dist/js'));
}

// Minify Images on build
function buildIMG() {
  return gulp
    .src('./src/img/**')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(gulp.dest('dist/img'));
}

// Watcher for development
function watch() {
  browserSync.init({
    server: './src',
    port: '3000',
    open: false,
    ui: false,
  });

  const watchfor = ['./src/*.html', './src/js/**', './src/img/**'];

  gulp.watch(watchfor).on('change', browserSync.reload);
  gulp.watch('./src/scss/**', devCSS);
}

// This will run on develop command
function develop() {
  return gulp.series(devCleanCss, devCSS, watch);
}

// this will run on build command
function build() {
  return gulp.series(
    cleanDist,
    gulp.parallel(buildHTML, buildCSS, buildJS, buildIMG)
  );
}

/**
 * Task Commands
 */
exports.develop = develop();
exports.build = build();

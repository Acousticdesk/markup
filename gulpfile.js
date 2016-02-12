'use strict';

var gulp = require('gulp'),
watch = require('gulp-watch'),
changed = require('gulp-changed'),
plumber = require('gulp-plumber'),
prefixer = require('gulp-autoprefixer'),
uglify = require('gulp-uglify'),
jade = require('gulp-jade'),
symlink = require('gulp-symlink'),
sass = require('gulp-sass'),
sourcemaps = require('gulp-sourcemaps'),
rigger = require('gulp-rigger'),
cssmin = require('gulp-minify-css'),
imagemin = require('gulp-imagemin'),
del = require('del'),
cache = require('gulp-cache'),
// notify = require('gulp-notify'),
browserSync = require("browser-sync"),
reload = browserSync.reload;

var path = {
  build: {
    html: 'build/',
    js: 'build/js/',
    css: 'build/css/',
    img: 'build/img/',
    pic: 'build/pic/',
    fonts: 'build/fonts/',
    vendor: 'build/vendor/',
    vendor_symlink: 'src/vendor'
  },
  src: {
    html: 'src/html/*.html',
    js: 'src/js/application.js',
    styles: 'src/sass/main.scss',
    img: 'src/img/**/*',
    pic: 'src/pic/**/*',
    fonts: 'src/fonts/**/*',
    vendor: 'bower_components/**/*',
    vendor_symlink: 'bower_components'
  },
  watch: {
    html: 'src/html/**/*',
    js: 'src/js/**/*.js',
    styles: 'src/sass/**/*',
    img: 'src/img/**/*',
    pic: 'src/pic/**/*',
    fonts: 'src/fonts/**/*',
    vendor: 'bower_components/**/*',
    vendor_symlink: 'bower_components'
  },
  clean: 'build/*'
};

var config = {
  server: {
    baseDir: "build"
  },
  open: false,
  tunnel: false,
  host: "markup",
  port: 9000,
  logPrefix: "markup"
};

gulp.task('server', function () {
  browserSync(config);
});

gulp.task('clean', function (cb) {
  del(path.clean);
});

gulp.task('symlink', function (cb) {
  gulp.src(path.src.vendor_symlink)
    .pipe(symlink(path.build.vendor_symlink, {force: true}));
});

gulp.task('build:vendor', function() {
  gulp.src(path.src.vendor)
    .pipe(changed(path.build.vendor, {hasChanged: changed.compareSha1Digest}))
  .pipe(gulp.dest(path.build.vendor));
});

gulp.task('build:html', function () {
  /*gulp.src(path.src.html)
    .pipe(plumber())
    .pipe(rigger())
  .pipe(gulp.dest(path.build.html))
  .pipe(reload({stream: true}));*/

  // Compiling temnplates with Jade
  gulp.src(path.src.html)
    .pipe(plumber())
    .pipe(jade())
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({stream: true}));
});

gulp.task('build:js', function () {
  gulp.src(path.src.js)
    .pipe(plumber())
    .pipe(rigger())
    .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(changed(path.build.js, {hasChanged: changed.compareSha1Digest}))
    .pipe(sourcemaps.write())
  .pipe(gulp.dest(path.build.js))
  .pipe(reload({stream: true}));
});

gulp.task('build:styles', function () {
  gulp.src(path.src.styles)
    .pipe(plumber())
    .pipe(sourcemaps.init())
      .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
      .pipe(prefixer({ browsers: ['last 2 versions', 'ie >= 9', 'Android >= 30'] }))
      .pipe(changed(path.build.css, {hasChanged: changed.compareSha1Digest}))
      .pipe(cssmin())
    .pipe(sourcemaps.write())
  .pipe(gulp.dest(path.build.css))
  .pipe(reload({stream: true}));
});

gulp.task('build:images', function () {
  gulp.src(path.src.img)
    .pipe(changed(path.build.img, {hasChanged: changed.compareSha1Digest}))
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
  .pipe(gulp.dest(path.build.img));
  // .pipe(notify({ message: 'build:images completed' }));
});

gulp.task('build:pictures', function () {
  gulp.src(path.src.pic)
    .pipe(changed(path.build.pic, {hasChanged: changed.compareSha1Digest}))
  .pipe(gulp.dest(path.build.pic));
});

gulp.task('build:fonts', function() {
  gulp.src(path.src.fonts)
    .pipe(changed(path.build.fonts, {hasChanged: changed.compareSha1Digest}))
  .pipe(gulp.dest(path.build.fonts));
});

gulp.task('build:prepare', ['symlink', 'build:vendor']);

gulp.task('build', [
  // 'symlink',
  // 'build:vendor',
  // 'build:prepare',
  'build:html',
  'build:js',
  'build:styles',
  'build:fonts',
  'build:images',
  'build:pictures'
]);

gulp.task('watch', function(){
  gulp.watch(path.watch.html, ['build:html']);
  gulp.watch(path.watch.styles, ['build:styles']);
  gulp.watch(path.watch.js, ['build:js']);
  gulp.watch(path.watch.img, ['build:image']);
  gulp.watch(path.watch.pic, ['build:pic']);
  gulp.watch(path.watch.fonts, ['build:fonts']);
});

gulp.task('default', ['build', 'server', 'watch']);

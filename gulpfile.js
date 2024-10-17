import { del } from 'del';
import { babel } from 'gulp-babel';
import { less } from 'gulp-less';
import { postcss } from 'gulp-postcss';
import sourcemaps from 'gulp-sourcemaps';
import rename from 'gulp-rename';
import insert from 'gulp-insert';
import gulp from 'gulp';
import babelrc from './babel.config.js';
import browserSync from 'browser-sync';

const LESS_SOURCE_DIR = './src/less';
const STYLE_DIST_DIR = './dist/css';
const TS_SOURCE_DIR = ['./src/**/*.tsx', './src/**/*.ts', '!./src/**/*.d.ts'];
const ESM_DIR = './es';
const CJS_DIR = './lib';
const DIST_DIR = './dist';

const paths = {
  LESS_SOURCE_DIR: './src/less',
  STYLE_DIST_DIR: './dist/css',
  DIST_DIR: './dist',
  TS_SOURCE_DIR: ['./src/**/*.tsx', './src/**/*.ts', '!./src/**/*.d.ts'],
  DOCS_DIR: './docs'
};

function reload() {
  browserSync.reload();
  done();
}

function server() {
  browserSync.init({
    proxy: 'localhost:3000',
    server: {
      baseDir: paths.DOCS_DIR
    },
    open: false,
    notify: true
  });

  done();
}

function buildLess() {
  return gulp
    .src(`${LESS_SOURCE_DIR}/index.less`)
    .pipe(sourcemaps.init())
    .pipe(less({ javascriptEnabled: true }))
    .pipe(postcss([require('autoprefixer')]))
    .pipe(sourcemaps.write('./'))
    .pipe(rename('bright-table.css'))
    .pipe(gulp.dest(`${STYLE_DIST_DIR}`));
}

function minifyCSS() {
  return gulp
    .src(`${STYLE_DIST_DIR}/bright-table.css`)
    .pipe(sourcemaps.init())
    .pipe(postcss())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(`${STYLE_DIST_DIR}`));
}

function buildEsm() {
  return gulp
    .src(TS_SOURCE_DIR)
    .pipe(
      babel(
        babelrc(null, {
          NODE_ENV: 'esm'
        })
      )
    ) // adds the 'use-client' directive to /es exported from bright-talbe
    .pipe(insert.prepend(`'use client';\n`))
    .pipe(gulp.dest(ESM_DIR));
}

function copyTypescriptDeclarationFiles() {
  return gulp.src('./src/**/*.d.ts').pipe(gulp.dest(CJS_DIR)).pipe(gulp.dest(ESM_DIR));
}

function copyLessFiles() {
  return gulp
    .src(['./src/**/*.less', './src/**/fonts/**/*'])
    .pipe(gulp.dest(CJS_DIR))
    .pipe(gulp.dest(ESM_DIR));
}

function clean(done) {
  del.sync([CJS_DIR, ESM_DIR, DIST_DIR], { force: true });
  done();
}

// creates a development build and watch for change.
function watchFiles() {
  gulp.watch(
    'src/**/*',
    gulp.series(
      clean,
      gulp.parallel(buildLib, buildEsm, gulp.series(buildLess, minifyCSS)),
      gulp.parallel(copyTypescriptDeclarationFiles, copyLessFiles, copyFontFiles)
    )
  );
}

// creates a production build ready to publish.
const build = gulp.series(
  clean,
  gulp.parallel(buildLib, buildEsm, gulp.series(buildLess, minifyCSS)),
  gulp.parallel(copyTypescriptDeclarationFiles, copyLessFiles, copyFontFiles)
);

// cleanup
process.on('exit', stopDevServer);
process.on('SIGINT', process.exit);

exports.build = build;

// watching for file changes
exports.default = watchFiles;

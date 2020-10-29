const { src, dest, parallel, watch } = require('gulp');
const { resolve, join } = require('path');

const sourcemaps = require('gulp-sourcemaps');

// JS
const { rollup, watch: rollupWatch } = require('rollup');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const { terser } = require('rollup-plugin-terser');

// CSS
const sass = require('gulp-sass');
const sassPackageImporter = require('node-sass-package-importer');
const postCSS = require('gulp-postcss');
const autoprefix = require('autoprefixer');
const cssNano = require('cssnano');

sass.compiler = require('node-sass');

const r = (...path) => resolve(__dirname, ...path);

const JS_CONFIG = {
  AsahidakeMap: {
    input: r('./js/asahidakemap.js'),
    output: r('./public/assets/asahidakemap.js'),
  },
  UrlHistory: {
    input: r('./js/urlhistory.js'),
    output: r('./public/assets/urlhistory.js'),
  },
};

async function buildJS() {
  const buildTasks = [];

  for (let moduleName in JS_CONFIG) {
    const task = rollup({
      input: JS_CONFIG[moduleName].input,
      plugins: [nodeResolve(), commonjs(), terser()],
      context: 'this',
    }).then((bundle) => {
      return bundle.write({
        file: JS_CONFIG[moduleName].output,
        format: 'iife',
        name: moduleName,
        sourcemap: true,
      });
    });

    buildTasks.push(task);
  }

  return await Promise.all(buildTasks);
}

function watchJS() {
  for (let moduleName in JS_CONFIG) {
    rollupWatch({
      input: JS_CONFIG[moduleName].input,
      external: ['jquery'],
      plugins: [nodeResolve(), commonjs(), terser()],
      context: 'this',
      output: [
        {
          file: JS_CONFIG[moduleName].output,
          format: 'iife',
          name: moduleName,
          sourcemap: true,
          globals: {
            jquery: '$',
          },
        },
      ],
    });
  }
}

function buildCSS() {
  const plugins = [autoprefix(), cssNano()];

  return src('CSS/index.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ importer: sassPackageImporter() }).on('error', sass.logError))
    .pipe(postCSS(plugins))
    .pipe(sourcemaps.write('./'))
    .pipe(dest('public/assets/'));
}

function watchCSS() {
  watch(['CSS/**/*.css', 'CSS/**/*.scss', 'CSS/**/*.sass'], buildCSS);
}

// RSS (for testing only)
function runRSSPlugin() {
  const plugin = require('./plugins/rss/index.js');
  const inputs = {
    filename: join(__dirname, "./public/CMS/KanshiinBlog.json"),
    feedUrl: "https://blog.goo.ne.jp/2291yamaiku/rss2.xml",
    retries: 0
  };

  const utils = {
    cache: {
      has: () => Promise.resolve(false),
      save: () => Promise.resolve(true),
    },
  };

  return plugin.onPreBuild({ inputs, utils });
}

exports.buildCSS = buildCSS;
exports.build = parallel(buildJS, buildCSS);
exports.watch = parallel(watchJS, watchCSS, runRSSPlugin);
exports.runRSS = runRSSPlugin;

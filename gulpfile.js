const { resolve } = require('path');
const { rollup, watch } = require('rollup');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const { terser } = require('rollup-plugin-terser');

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

function watchJS(cb) {
  for (let moduleName in JS_CONFIG) {
    watch({
      input: JS_CONFIG[moduleName].input,
      plugins: [nodeResolve(), commonjs(), terser()],
      context: 'this',
      output: [
        {
          file: JS_CONFIG[moduleName].output,
          format: 'iife',
          name: moduleName,
          sourcemap: true,
        },
      ],
    });
  }
}

exports.build = buildJS;
exports.watch = watchJS;

import path from 'path'
import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'
import pkg from './package.json'

const external = [
  'fs',
  'path',
  'crypto',
  'stream',
  'lodash/get',
  'lodash/set',
  'lodash/sortBy',
  'openpgp/dist/openpgp.min.js',
  'babel-runtime/regenerator',
  'babel-runtime/helpers/asyncToGenerator',
  'babel-runtime/helpers/classCallCheck',
  'babel-runtime/helpers/createClass',
  'babel-runtime/core-js/promise',
  'babel-runtime/core-js/get-iterator',
  'babel-runtime/helpers/extends',
  'babel-runtime/helpers/typeof',
  'babel-runtime/helpers/slicedToArray',
  'babel-runtime/core-js/math/sign',
  'babel-runtime/core-js/symbol/iterator',
  'babel-runtime/core-js/map',
  'babel-runtime/core-js/object/keys',
  'babel-runtime/helpers/toConsumableArray',
  'babel-runtime/core-js/set',
  ...Object.keys(pkg.dependencies)
]

// Bleeding edge
const moduleConfig = input => ({
  input: `src/${input}`,
  external: [...external, ...codeSplitting(input)],
  output: [{ format: 'es', name: 'git', file: `dist/for-future/${input}` }],
  plugins: [
    json(),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      plugins: ['transform-object-rest-spread']
    })
  ]
})

// Node.js
const nodeConfig = input => ({
  input: `src/${input}`,
  external: [...external, ...codeSplitting(input)],
  output: [{ format: 'cjs', name: 'git', file: `dist/for-node/${input}` }],
  plugins: [
    json(),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [
        [
          'env',
          {
            modules: false,
            targets: {
              node: 'current'
            }
          }
        ]
      ],
      plugins: ['external-helpers', 'transform-object-rest-spread']
    })
  ]
})

// Browserify
const browserifyConfig = input => ({
  input: `src/${input}`,
  external: [...external, ...codeSplitting(input)],
  output: [
    { format: 'cjs', name: 'git', file: `dist/for-browserify/${input}` }
  ],
  plugins: [
    json(),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [
        [
          'env',
          {
            modules: false,
            targets: {
              browsers: 'last 1 version'
            }
          }
        ]
      ],
      runtimeHelpers: true,
      plugins: ['transform-runtime', 'transform-object-rest-spread']
    })
  ]
})

const inputs = [
  'index.js',
  'commands.js',
  'managers.js',
  'models.js',
  'utils.js'
]

const codeSplitting = input =>
  inputs
    .map(x => path.resolve(`src/${x}`))
    .filter(x => x !== path.resolve(`src/${input}`))

export default [
  ...inputs.map(moduleConfig),
  ...inputs.map(nodeConfig),
  ...inputs.map(browserifyConfig)
]
const rollup = require('rollup')
const buble = require('rollup-plugin-buble')
const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')
const { uglify } = require('rollup-plugin-uglify')
const replace = require('rollup-plugin-replace')
const isProd = process.env.NODE_ENV === 'production'
const version = process.env.VERSION || require('../package.json').version

/**
 * @param {{
 *   input: string,
 *   output?: string,
 *   globalName?: string,
 *   plugins?: Array<import('rollup').Plugin>
 * }} opts
 */
async function build(opts) {
  await rollup
    .rollup({
      input: opts.input,
      plugins: (opts.plugins || []).concat([
        buble(),
        commonjs(),
        nodeResolve(),
        replace({
          __VERSION__: version
        })
      ]),
      onwarn: function (message) {
        if (message.code === 'UNRESOLVED_IMPORT') {
          throw new Error(
            `Could not resolve module ` +
            message.source +
            `. Try running 'npm install' or using rollup's 'external' option if this is an external dependency. ` +
            `Module ${message.source} is imported in ${message.importer}`
          )
        }
      }
    })
    .then(function (bundle) {
      var dest = 'lib/' + (opts.output || opts.input)

      console.log(dest)
      return bundle.write({
        format: 'iife',
        output: opts.globalName ? {name: opts.globalName} : {},
        file: dest,
        strict: false
      })
    })
}

async function buildPlugin() {
  var plugins = [
    {name: 'pangu', input: 'index.js'},
  ]

  const promises = plugins.map(item => {
    return build({
      input: 'src/' + item.input,
      output: item.name + '.js'
    })
  })

  if (isProd) {
    plugins.forEach(item => {
      promises.push(build({
        input: 'src/' + item.input,
        output: item.name + '.min.js',
        plugins: [uglify()]
      }))
    })
  }

  await Promise.all(promises)
}

async function main() {
  await Promise.all([
    buildPlugin()
  ])
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

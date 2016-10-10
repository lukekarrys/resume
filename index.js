const fs = require('fs')

const themePath = 'node_modules/jsonresume-theme-stackoverflow'
const theme = fs.readFileSync(`${themePath}/index.js`, 'utf-8')
const minify = process.env.NODE_ENV === 'production' ? '--clean-css' : ''
const compileCss = `require('sync-exec')('./node_modules/.bin/lessc ${minify} style.less').stdout`

// The theme will be run in the context of project directory, which requires
// the template path to point back to the installed theme module and the patched
// theme to be compiled manually
const patchedTheme = theme
  .replace(/(resume\.hbs)/, `${themePath}/$1`)
  .replace(/(var css = ).*/, `$1${compileCss}`)

// eslint-disable-next-line no-eval
eval(patchedTheme)

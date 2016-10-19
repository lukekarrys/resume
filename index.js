const fs = require('fs')

const themePath = 'node_modules/jsonresume-theme-stackoverflow'
const theme = fs.readFileSync(`${themePath}/index.js`, 'utf-8')
const minify = process.env.NODE_ENV === 'production'
const compileCss = `require('sync-exec')('./node_modules/.bin/lessc style.less').stdout`

// The theme will be run in the context of project directory, which requires
// the template path to point back to the installed theme module and the patched
// theme to be compiled manually
const patchedTheme = theme
  .replace(/(resume\.hbs)/, `${themePath}/$1`)
  .replace(/(var )(css)( = ).*/, `
    $1$2$3${compileCss}
    let skip = null
    $2 = $2.split('\\n').reduce((memo, line, lines) => {
      if (line.indexOf('@media print') === 0 && skip === null) skip = true
      if (line.indexOf('}') === 0 && skip === true) skip = false, line = ''
      if (!skip) memo.push(line)
      return memo
    }, []).join('\\n')
    $2 = ${minify ? 'require("cssmin")($2)' : '$2'}
  `)

// eslint-disable-next-line no-eval
eval(patchedTheme)

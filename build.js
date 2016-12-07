const fs = require('fs')
const path = require('path')
const minify = require('html-minifier').minify

const overwrite = (p, transform) => fs.writeFileSync(p, transform(fs.readFileSync(p, 'utf-8')))

overwrite(path.resolve(__dirname, 'build', 'index.html'), (html) => minify(html, {
  collapseWhitespace: true,
  conservativeCollapse: true,
  collapseBooleanAttributes: true,
  collapseInlineTagWhitespace: true,
  removeAttributeQuotes: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  quoteCharacter: "'",
  minifyCSS: true,
  minifyJS: true
}))

const fs = require('fs')

const themePath = 'node_modules/jsonresume-theme-stackoverflow'
const theme = fs.readFileSync(`${themePath}/index.js`, 'utf-8')
const compileCss = `require('sync-exec')('./node_modules/.bin/lessc style.less').stdout`

const analytics = "<script>(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');ga('create', 'UA-8402584-23', 'auto');ga('send', 'pageview');</script>"

// The theme will be run in the context of project directory, which requires
// the template path to point back to the installed theme module and the patched
// theme to be compiled manually
const patchedTheme = theme
  .replace(/(resume\.hbs)/, `${themePath}/$1`)
  .replace(/(var tpl = )(.*?)(;)/, `
    $1$2
      .replace(/opacity:[10]/g, '')
      .replace(/<script>[\\s\\S]*<\\/script>/g, "${analytics}")
      .replace(/item display none/g, 'item display')
      .replace(/fa-caret-down/g, 'fa-caret-right')
  `)
  .replace(/(var )(css)( = ).*/, `
    $1$2$3${compileCss}
    var skip = null
    $2 = $2.split('\\n').reduce((memo, line, lines) => {
      if (line.indexOf('@media print') === 0 && skip === null) skip = true
      if (line.indexOf('}') === 0 && skip === true) skip = false, line = ''
      if (!skip) memo.push(line)
      return memo
    }, []).join('\\n')
    $2 = $2.replace(/.*opacity:.*/g, '')
  `)

// eslint-disable-next-line no-eval
eval(patchedTheme)

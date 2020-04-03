const fs = require("fs").promises
const path = require("path")
const marked = require("marked")
const mkdirp = require("mkdirp")
const { minify } = require("html-minifier")

marked.setOptions({
  renderer: new marked.Renderer(),
  pedantic: false,
  gfm: true,
  breaks: false,
  smartLists: true,
  smartypants: true,
  headerIds: false,
  xhtml: false,
})

const PROD = process.env.NODE_ENV === "production"
const BUILD = path.join(__dirname, "build")
const SRC = path.join(__dirname, "src")

const main = async () => {
  await mkdirp(BUILD)
  const index = await fs.readFile(path.join(SRC, "index.html"), "utf8")
  const markdown = marked(
    await fs.readFile(path.join(SRC, "resume.md"), "utf8")
  )
  let output = index.replace("<!--RESUME-->", markdown)
  output = output.replace(/\s([\w\.]+)(<\/li>)/g, "&nbsp;$1$2")
  if (!PROD) {
    output = output.replace(
      /(styles\.css)/,
      `$1?v=${Math.random().toString().slice(2)}`
    )
  }
  output = minify(output, { collapseWhitespace: true })
  await fs.writeFile(path.join(BUILD, "index.html"), output)
}

main()

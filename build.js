const fs = require("fs").promises
const path = require("path")
const marked = require("marked")
const mkdirp = require("mkdirp")
const del = require("delete").promise
const { minify: htmlMinify } = require("html-minifier")

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

const mdToHtml = async (name) => {
  const template = await fs.readFile(path.join(SRC, "template.html"), "utf8")
  const markdown = marked(await fs.readFile(path.join(SRC, name), "utf8"))
  return template.replace("<!--MARKDOWN-->", markdown)
}

const devCacheBust = (value) =>
  PROD
    ? value.replace(
        /(styles\.css)/,
        `$1?v=${Math.random().toString().slice(2)}`
      )
    : value

const orphans = (value) => value.replace(/\s([\w\.]+)(<\/li>)/g, "&nbsp;$1$2")

const minify = (value) => htmlMinify(value, { collapseWhitespace: true })

const writeFile = (name, value) => fs.writeFile(path.join(BUILD, name), value)

const main = async () => {
  await mkdirp(BUILD)
  await del(path.join(BUILD, "*.html"))
  const markdownFiles = (await fs.readdir(SRC)).filter(
    (p) => path.extname(p) === ".md"
  )
  await Promise.all(
    markdownFiles.map((name) =>
      mdToHtml(name)
        .then(devCacheBust)
        .then(minify)
        .then(orphans)
        .then((value) => writeFile(name.replace(/\.md$/, ".html"), value))
    )
  )
}

main()

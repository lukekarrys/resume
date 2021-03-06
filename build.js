const fs = require("fs").promises
const path = require("path")
const marked = require("marked")
const mkdirp = require("mkdirp")
const _ = require("lodash")
const matter = require("gray-matter")
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

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g

const PROD = process.env.NODE_ENV === "production"
const BUILD = path.join(__dirname, "build")
const SRC = path.join(__dirname, "src")

const ifCond = (cond, ...fns) => (value) =>
  cond ? fns.reduce((acc, fn) => fn(acc), value) : value

const readSrcFile = (f) => fs.readFile(path.join(SRC, f), "utf8")

const mdToHtml = async (name) => {
  const template = await readSrcFile("template.html")
  const header = matter(await readSrcFile("_header.md"))
  const body = matter(await readSrcFile(name))
  const isCover = name.startsWith("cover_")

  const headerContent = header.content.trim() + (isCover ? "\n\n<hr>\n\n" : "")
  const bodyContent = body.content.split("<!-- more -->")[0].trim()
  const footerContent = isCover ? "\n\n– Luke Karrys" : ""
  const content = [headerContent, bodyContent, footerContent].join("\n")

  return _.template(template)({
    title: isCover ? "Cover Letter" : "Resume",
    ...header.data,
    ...body.data,
    content: marked(content),
  })
}

const cacheBust = (value) =>
  value.replace(/(styles\.css)/, `$1?v=${Math.random().toString().slice(2)}`)

const orphans = (value) => value.replace(/\s([\w\.]+)(<\/li>)/g, "&nbsp;$1$2")

const minify = (value) => htmlMinify(value, { collapseWhitespace: true })

const liveReload = (value) =>
  value.replace(
    "</body>",
    `<script>document.write('<script src="http://'+(location.host||"localhost").split(":")[0]+':35729/livereload.js?snipver=1"></'+"script>")</script></body>`
  )

const writeFile = (name, value) => fs.writeFile(path.join(BUILD, name), value)

const main = async () => {
  await mkdirp(BUILD)
  const markdownFiles = (await fs.readdir(SRC)).filter(
    (p) => path.extname(p) === ".md" && !path.basename(p).startsWith("_")
  )
  await Promise.all(
    markdownFiles.map((name) =>
      mdToHtml(name)
        .then(ifCond(!PROD, cacheBust, liveReload))
        .then(ifCond(PROD, minify))
        .then(orphans)
        .then((value) => writeFile(name.replace(/\.md$/, ".html"), value))
    )
  )
}

main()

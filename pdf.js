const http = require("http")
const micro = require("micro")
const path = require("path")
const fs = require("fs").promises
const handler = require("serve-handler")
const playwright = require("playwright")
const del = require("delete")

const BUILD = path.join(__dirname, "build")
const PORT = 3000

const createServer = () => {
  const server = micro((...args) => handler(...args, { public: BUILD }))
  server.listen(PORT)
  return () => server.close()
}

const savePdf = async (page, name) => {
  await page.goto(`http://localhost:${PORT}/${name}`)
  await page.pdf({
    path: path.join(BUILD, `${path.basename(name, ".html")}.pdf`),
    printBackground: true,
    format: "Letter",
    margin: {
      top: "1cm",
      bottom: "1cm",
      left: "1cm",
      right: "1cm",
    },
  })
}

const main = async () => {
  await del(path.join(BUILD, "*.pdf"))
  const files = (await fs.readdir(BUILD)).filter(
    (p) => path.extname(p) === ".html"
  )
  const stopServer = createServer()
  const browser = await playwright.chromium.launch()

  const cleanup = async () => {
    stopServer()
    await browser.close()
  }

  try {
    const context = await browser.newContext()
    const page = await context.newPage()
    for (const file of files) {
      await savePdf(page, file)
    }
    cleanup()
  } catch (e) {
    cleanup()
    throw e
  }
}

main()

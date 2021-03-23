const path = require("path")
const { promises: fs, existsSync } = require("fs")
const playwright = require("playwright")
const detect = require("detect-port-alt")
const { createServer, PORT } = require("./server")

const BUILD = path.join(__dirname, "build")

const savePdf = async ({ port, page, name }) => {
  await page.goto(`http://localhost:${port}/${name}`)
  let title = (await page.title()).replace(" | Luke Karrys", "")
  const pdfPath = path.join(BUILD, `${title} – Luke Karrys.pdf`)

  if (existsSync(pdfPath)) {
    title += ` ${path.basename(name, ".html").replace("cover_", "")}`
  }

  await page.pdf({
    path: path.join(BUILD, `${title} – Luke Karrys.pdf`),
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
  const files = (await fs.readdir(BUILD)).filter(
    (p) => path.extname(p) === ".html"
  )
  const port = await detect(PORT)
  const unoccupiedPort = port === PORT
  const stopServer = unoccupiedPort && createServer(PORT, BUILD)
  const browser = await playwright.chromium.launch()

  const cleanup = async () => {
    stopServer && stopServer()
    await browser.close()
  }

  try {
    const context = await browser.newContext()
    const page = await context.newPage()

    for (const file of files) {
      await savePdf({
        port: PORT,
        page,
        name: file,
      })
    }
    cleanup()
  } catch (e) {
    cleanup()
    throw e
  }
}

main()

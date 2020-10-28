const path = require("path")
const fs = require("fs").promises
const playwright = require("playwright")
const detect = require("detect-port-alt")
const matter = require("gray-matter")
const { createServer, PORT } = require("./server")

const BUILD = path.join(__dirname, "build")

const savePdf = async ({ port, page, name, title }) => {
  await page.goto(`http://localhost:${port}/${name}`)
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
      const { data } = matter(
        await fs.readFile(
          path.join("./src", `${path.basename(file, ".html")}.md`)
        )
      )
      await savePdf({
        port: PORT,
        page,
        name: file,
        title: data.title,
      })
    }
    cleanup()
  } catch (e) {
    cleanup()
    throw e
  }
}

main()

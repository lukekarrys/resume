const micro = require("micro")
const handler = require("serve-handler")

const PORT = 3000

const createServer = (port, public) => {
  const server = micro((...args) =>
    handler(...args, {
      public,
      directoryListing: false,
      cleanUrls: true,
      trailingSlash: false,
    })
  )
  server.listen(port)
  return () => server.close()
}

if (require.main === module) {
  createServer(PORT, ...process.argv.slice(2))
} else {
  module.exports.createServer = createServer
  module.exports.PORT = PORT
}

// Dependencies
const http = require('http')

// The server should respond to all requests with a string
const server = http.createServer((req, res) => {
    res.end("Hello World\n")
})

// Start the server and have it to listen on PORT 3000
server.listen(3000, () => console.log(`Listening on PORT: ${3000}`))
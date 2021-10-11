// Dependencies
const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;

// The server should respond to all requests with a string
const server = http.createServer((req, res) => {
  // Get the url and parse it
  const parsedUrl = url.parse(req.url, true);
  // Get path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  const method = req.method.toLowerCase();

  // Get the query string as an object
  const queryStringObject = parsedUrl.query;

  // Get the headers
  const headers = req.headers;

  // Get the payload if any
  const decoder = new StringDecoder("utf-8");
  let buffer = "";
  req.on("data", (data) => {
    console.log("DATA: ", data);
    buffer += decoder.write(data);
  });

  req.on("end", () => {
    buffer += decoder.end();

    // Send the response
    res.end("Hello World!\n");
    console.log("REQUEST RECEIVED WITH PAYLOAD: ", buffer);
  });

  // Log the request/response
  console.log(
    "Request received on path: " +
      trimmedPath +
      " with method: " +
      method +
      " and with these query string parameters " +
      JSON.stringify(queryStringObject)
  );
  console.log("Request received with these headers:\n", headers);
});

// Start the server and have it to listen on PORT 3000
server.listen(3000, () => console.log(`Listening on PORT 3000`));

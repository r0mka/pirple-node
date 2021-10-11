// Dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const fs = require("fs");
const config = require("./config");

// Instantiating HTTP server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

// Start HTTP server
httpServer.listen(config.httpPort, () =>
  console.log(`Listening on PORT ${config.httpPort}`)
);

// Instantiating HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem"),
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});

// Start HTTPS server
httpsServer.listen(config.httpsPort, () =>
  console.log(`Listening on PORT ${config.httpsPort}`)
);

// All the server logic for both http and htttps
const unifiedServer = (req, res) => {
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
    console.log("STREAM DATA: ", data);
    buffer += decoder.write(data);
  });

  req.on("end", () => {
    buffer += decoder.end();

    // Choose the handler this request should go to. If one is not found, use
    // use the notFound handler
    const chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;

    // Construct the data object to send to the handler
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: buffer,
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      // Use the status code called back by the handler or default to 200
      statusCode = typeof statusCode == "number" ? statusCode : 200;
      // Use payload defined by the handler or use empty object
      payload = typeof payload === "object" ? payload : {};

      // Convert the payload to a string
      const payloadString = JSON.stringify(payload);
      // Return the response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);

      // Log the request
      console.log("Returning this response: ", statusCode, payloadString);
    });
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
};

// Define handlers
const handlers = {};

// Sample handler
handlers.sample = (data, callback) => {
  // Callback a http status code, and a payload object
  callback(406, { name: "sample handler" });
};

// Not found handler
handlers.notFound = (data, callback) => {
  console.log("NOT FOUND");
  callback(404);
};

const router = {
  sample: handlers.sample,
};

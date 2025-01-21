/*
 * Title: Uptime Monitoring Application
 * Decription: A RESTFul API to monitor up or down time of user defined links
 * Author: Akm Tasdikul Islam
 * Date: 21/01/2025
 *
 */

// Dependencies
const http = require("http");
const url = require("url");
const { StringDecoder } = require("string_decoder");

// App object - module scaffolding
const app = {};

// Configuration
app.config = {
  port: 3000,
};

// Create server
app.createServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(app.config.port, () => {
    console.log(`The server is listening on port ${app.config.port}`);
  });
};

// Handle Request Response

app.handleReqRes = (req, res) => {
  // Request Handle

  //   Get the url and parse it
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, ""); // Remove the forward slashes from the beginning and end of the path
  const method = req.method.toLowerCase();
  const queryStringObject = parsedUrl.query;
  const headersObject = req.headers;

  const decoder = new StringDecoder("utf-8");
  let realData = "";

  req.on("data", (buffer) => {
    realData += decoder.write(buffer);
  });

  req.on("end", () => {
    realData += decoder.end();
    console.log(realData);
  });

  //   Response Handle
  res.end("Hello World");
};

// Start the server
app.createServer();

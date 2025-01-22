/*
 * Title: Request Response Handler
 * Decription: Handle Request Response
 * Author: Akm Tasdikul Islam
 * Date: 22/01/2025
 *
 */

// Dependencies
const url = require("url");
const { StringDecoder } = require("string_decoder");
const routes = require("./routes");
const {
  notFoundHandler,
} = require("../handlers/routeHandlers/notFoundHandler");

// Module scaffolding
const handler = {};

handler.handleReqRes = (req, res) => {
  // Request Handle

  //   Get the url and parse it
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, ""); // Remove the forward slashes from the beginning and end of the path
  const method = req.method.toLowerCase();
  const queryStringObject = parsedUrl.query;
  const headersObject = req.headers;

  const requestProperties = {
    parsedUrl,
    path,
    trimmedPath,
    method,
    queryStringObject,
    headersObject,
  };

  const decoder = new StringDecoder("utf-8");
  let realData = "";

  const chosenHandler = routes[trimmedPath]
    ? routes[trimmedPath]
    : notFoundHandler;
  chosenHandler(requestProperties, (statusCode, payload) => {
    statusCode = typeof statusCode === "number" ? statusCode : 500;
    payload = typeof payload === "object" ? payload : {};
    const payloadString = JSON.stringify(payload);

    //   Return the final response
    res.writeHead(statusCode);
    res.end(payloadString);
  });

  req.on("data", (buffer) => {
    realData += decoder.write(buffer);
  });

  req.on("end", () => {
    realData += decoder.end();
    console.log(realData);
  });
};

module.exports = handler;

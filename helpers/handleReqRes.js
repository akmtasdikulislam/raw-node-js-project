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

module.exports = handler;

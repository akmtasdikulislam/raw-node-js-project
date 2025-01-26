/*
 * Title: Server Library
 * Decription: Library for handling server related things
 * Author: Akm Tasdikul Islam
 * Date: 21/01/2025 (Modified: 26/01/2025)
 *
 */

// Dependencies
const http = require("http");
const { handleReqRes } = require("../helpers/handleReqRes");
const environment = require("../helpers/environments");

// Server object - module scaffolding
const server = {};

// Configuration
server.config = {};

// Create server
server.createServer = () => {
  const createServerVaiable = http.createServer(server.handleReqRes);
  createServerVaiable.listen(environment.port, () => {
    console.log(`The server is listening on port ${environment.port}`);
  });
};

// Handle Request Response
server.handleReqRes = handleReqRes;

// Start the server
server.init = () => {
  server.createServer();
};

// Export the module
module.exports = server;

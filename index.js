/*
 * Title: Uptime Monitoring Application
 * Decription: A RESTFul API to monitor up or down time of user defined links
 * Author: Akm Tasdikul Islam
 * Date: 21/01/2025
 *
 */

// Dependencies
const http = require("http");
const { handleReqRes } = require("./helpers/handleReqRes");

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
app.handleReqRes = handleReqRes;

// Start the server
app.createServer();

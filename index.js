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
const environment = require("./helpers/environments");

// App object - module scaffolding
const app = {};

// Configuration
app.config = {};

// Create server
app.createServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(environment.port, () => {
    console.log(`environment variable is ${process.env.NODE_ENV}`);
    console.log(`The server is listening on port ${environment.port}`);
  });
};

// Handle Request Response
app.handleReqRes = handleReqRes;

// Start the server
app.createServer();

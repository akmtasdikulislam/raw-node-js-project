/*
 * Title: Project Initial file
 * Decription: Initial file to start the node server and workers
 * Author: Akm Tasdikul Islam
 * Date: 26/01/2025
 *
 */

// Dependencies
const server = require("./lib/server");
const workers = require("./lib/workers");

// App object - module scaffolding
const app = {};

app.init = () => {
  // Start the server
  server.init();
  // Start the workers
  workers.init();
};

app.init();

// Export the app
module.exports = app;

/*
 * Title: Routes
 * Decription: Application Routes
 * Author: Akm Tasdikul Islam
 * Date: 22/01/2025
 *
 */

// Dependencies
const { sampleHandler } = require("./handlers/routeHandlers/sampleHandlers");
const { userHandler } = require("./handlers/routeHandlers/userHandler");
// Routes - Module scaffolding
const routes = {
  sample: sampleHandler,
  user: userHandler,
};

module.exports = routes;

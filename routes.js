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
const { tokenHandler } = require("./handlers/routeHandlers/tokenHandler");

// Routes - Module scaffolding
const routes = {
  sample: sampleHandler,
  user: userHandler,
  token: tokenHandler,
};

module.exports = routes;

/*
 * Title: Routes
 * Decription: Application Routes
 * Author: Akm Tasdikul Islam
 * Date: 22/01/2025
 *
 */

// Dependencies
const { sampleHandler } = require("../handlers/routeHandlers/sampleHandlers");

// Routes - Module scaffolding
const routes = {
  sample: sampleHandler,
};

module.exports = routes;

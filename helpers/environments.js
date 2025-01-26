/*
 * Title: Environment Variables
 * Description: Handle all environment variables
 * Author: Akm Tasdikul Islam
 * Date: 25/01/2025
 *
 */
// Dependencies

// Module scaffolding
const environments = {};

environments.staging = {
  port: 3000,
  envName: "staging",
  secretKey: "asdfghjkl",
  maxChecks: 5
};
environments.production = {
  port: 5000,
  envName: "production",
  secretKey: "asdfghjkl",
  maxChecks: 5
};

// Determine which environment was passed
const currentEnvironment =
  typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "staging";

// Export corresponding environment object
const environmentToExport =
  typeof environments[currentEnvironment] === "object"
    ? environments[currentEnvironment]
    : environments.staging;

module.exports = environmentToExport;

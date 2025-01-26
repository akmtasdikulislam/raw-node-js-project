/*
 * Title: Utilities
 * Description: Important utility functions
 * Author: Akm Tasdikul Islam
 * Date: 25/01/2025
 *
 */

// Dependencies
const crypto = require("crypto");
const environments = require("./environments");

// Module scaffolding

const utilities = {};

// Parse JSON string to Object
utilities.parseJSON = (jsonString) => {
  let output = {};

  try {
    output = JSON.parse(jsonString);
  } catch {
    output = {};
  }
  return output;
};

// Hash string
utilities.hash = (str) => {
  if (typeof str === "string" && str.length > 0) {
    let hash = crypto
      .createHmac("sha256", environments.secretKey)
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

// Export the module
module.exports = utilities;

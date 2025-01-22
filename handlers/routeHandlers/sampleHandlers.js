/*
 * Title: Sample Handler
 * Decription: Sample Handler
 * Author: Akm Tasdikul Islam
 * Date: 22/01/2025
 *
 */

// Module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
  console.log(requestProperties);
  callback(200, {
    message: "This is a sample url",
  });
};

module.exports = handler;
